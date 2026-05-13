from fastapi import APIRouter, Depends, HTTPException
from services.auth import verify_jwt
from services.supabase_client import get_supabase

router = APIRouter(prefix="/card", tags=["card"])

DEFAULT_CARD = {
    "opening_stat": 50,
    "rapport_stat": 50,
    "discovery_stat": 50,
    "objection_stat": 50,
    "closing_stat": 50,
    "adaptability_stat": 50,
    "overall_rating": 50,
    "elo": 0,
    "rank_tier": "Grinder",
    "rank_title": "Just Getting Started",
    "current_streak": 0,
    "longest_streak": 0,
    "total_calls": 0,
    "calls_graded_b_or_above": 0,
}


@router.get("/{user_id}")
async def get_card(user_id: str, user: dict = Depends(verify_jwt)):
    try:
        db = get_supabase()
        result = db.table("seez_cards").select("*").eq("user_id", user_id).single().execute()
        card = result.data
        if not card:
            new_card = {"user_id": user_id, **DEFAULT_CARD}
            db.table("seez_cards").insert(new_card).execute()
            card = new_card

        # ── Compute live stats from calls table (single source of truth) ──
        try:
            calls_result = (
                db.table("calls")
                .select("id, grade, completed_at")
                .eq("user_id", user_id)
                .not_.is_("completed_at", "null")
                .execute()
            )
            calls = calls_result.data or []
            total = len(calls)
            b_or_above = sum(1 for c in calls if c.get("grade") in ("A+", "A", "B"))
            card["total_calls"] = total
            card["calls_graded_b_or_above"] = b_or_above
        except Exception:
            pass

        return card
    except Exception:
        return {**DEFAULT_CARD, "user_id": user_id}


@router.get("/leaderboard")
async def get_leaderboard(user: dict = Depends(verify_jwt)):
    try:
        db = get_supabase()
        result = (
            db.table("seez_cards")
            .select("user_id, elo, rank_tier, rank_title, overall_rating, total_calls")
            .order("elo", desc=True)
            .limit(100)
            .execute()
        )
        return result.data or []
    except Exception:
        return []
