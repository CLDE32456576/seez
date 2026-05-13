import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from services.auth import verify_jwt
from services.supabase_client import get_supabase
from models.schemas import CheckoutRequest
from config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

router = APIRouter(prefix="/payments", tags=["payments"])

PRICES = {
    "pro": "price_pro_monthly",    # Replace with real Stripe price ID
    "teams": "price_teams_monthly",
}

SUCCESS_URL = "https://seez.ai/dashboard?upgrade=success"
CANCEL_URL = "https://seez.ai/settings"


@router.post("/checkout")
async def create_checkout(body: CheckoutRequest, user: dict = Depends(verify_jwt)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    stripe.api_key = STRIPE_SECRET_KEY
    price_id = PRICES.get(body.tier)
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid tier")

    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=SUCCESS_URL,
        cancel_url=CANCEL_URL,
        metadata={"user_id": user["user_id"], "tier": body.tier},
    )
    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")

    stripe.api_key = STRIPE_SECRET_KEY
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] in ("customer.subscription.created", "customer.subscription.updated"):
        sub = event["data"]["object"]
        user_id = sub.get("metadata", {}).get("user_id")
        if user_id:
            tier = "pro" if "pro" in str(sub.get("items", {})) else "teams"
            try:
                db = get_supabase()
                db.table("users").update({
                    "subscription_tier": tier,
                    "subscription_status": sub["status"],
                }).eq("id", user_id).execute()
            except Exception:
                pass

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        user_id = sub.get("metadata", {}).get("user_id")
        if user_id:
            try:
                db = get_supabase()
                db.table("users").update({
                    "subscription_tier": "free",
                    "subscription_status": "cancelled",
                }).eq("id", user_id).execute()
            except Exception:
                pass

    return {"received": True}


@router.get("/portal")
async def billing_portal(user: dict = Depends(verify_jwt)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    stripe.api_key = STRIPE_SECRET_KEY
    try:
        db = get_supabase()
        result = db.table("users").select("stripe_customer_id").eq("id", user["user_id"]).single().execute()
        customer_id = result.data.get("stripe_customer_id") if result.data else None
    except Exception:
        customer_id = None

    if not customer_id:
        raise HTTPException(status_code=404, detail="No billing account found")

    portal = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url="https://seez.ai/settings",
    )
    return {"url": portal.url}
