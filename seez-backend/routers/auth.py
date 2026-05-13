import jwt as pyjwt
from fastapi import APIRouter, Depends, Request
from services.auth import verify_jwt

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def get_me(user: dict = Depends(verify_jwt)):
    return {"user_id": user["user_id"], "email": user["email"]}


@router.post("/debug-token")
async def debug_token(request: Request):
    """Temp debug: decode token without verification to see its structure."""
    body = await request.json()
    token = body.get("token", "")
    try:
        decoded = pyjwt.decode(token, options={"verify_signature": False}, algorithms=["HS256"])
        return {"header": pyjwt.get_unverified_header(token), "payload_keys": list(decoded.keys()), "iss": decoded.get("iss"), "role": decoded.get("role"), "sub_present": bool(decoded.get("sub"))}
    except Exception as e:
        return {"error": str(e)}
