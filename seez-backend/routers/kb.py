from fastapi import APIRouter, Depends, Query
from services.auth import verify_jwt
from services.supabase_client import get_supabase

router = APIRouter(prefix="/kb", tags=["knowledge-base"])


@router.get("")
async def list_kb(
    topic: str = Query(None),
    skill_level: str = Query(None),
    page: int = Query(1, ge=1),
    user: dict = Depends(verify_jwt),
):
    limit = 20
    offset = (page - 1) * limit
    try:
        db = get_supabase()
        query = db.table("kb_entries").select("id, title, summary, topic, skill_level, call_stages, source")
        if topic:
            query = query.eq("topic", topic)
        if skill_level:
            query = query.eq("skill_level", skill_level)
        result = query.range(offset, offset + limit - 1).execute()
        return result.data or []
    except Exception:
        return []


@router.get("/search")
async def search_kb(q: str = Query(...), user: dict = Depends(verify_jwt)):
    try:
        db = get_supabase()
        result = (
            db.table("kb_entries")
            .select("id, title, summary, topic, skill_level")
            .ilike("title", f"%{q}%")
            .limit(10)
            .execute()
        )
        return result.data or []
    except Exception:
        return []


@router.get("/recommended")
async def get_recommended(user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]
    try:
        db = get_supabase()
        card_result = db.table("seez_cards").select("*").eq("user_id", user_id).single().execute()
        card = card_result.data or {}

        stat_map = {
            "opening": card.get("opening_stat", 50),
            "rapport": card.get("rapport_stat", 50),
            "discovery": card.get("discovery_stat", 50),
            "objection": card.get("objection_stat", 50),
            "closing": card.get("closing_stat", 50),
        }
        weakest = min(stat_map, key=stat_map.get)

        result = (
            db.table("kb_entries")
            .select("id, title, summary, topic, skill_level")
            .eq("topic", weakest)
            .limit(5)
            .execute()
        )
        return result.data or []
    except Exception:
        return []


@router.get("/bookmarked")
async def get_bookmarked(user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]
    try:
        db = get_supabase()
        result = (
            db.table("bookmarked_kb")
            .select("kb_entries(id, title, summary, topic, skill_level)")
            .eq("user_id", user_id)
            .execute()
        )
        return [r["kb_entries"] for r in (result.data or [])]
    except Exception:
        return []


@router.post("/bookmark/{kb_id}")
async def bookmark_kb(kb_id: str, user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]
    try:
        db = get_supabase()
        db.table("bookmarked_kb").upsert({"user_id": user_id, "kb_entry_id": kb_id}).execute()
        return {"ok": True}
    except Exception:
        return {"ok": False}


@router.get("/{kb_id}")
async def get_kb_entry(kb_id: str, user: dict = Depends(verify_jwt)):
    try:
        db = get_supabase()
        result = db.table("kb_entries").select("*").eq("id", kb_id).single().execute()
        return result.data
    except Exception:
        return None
