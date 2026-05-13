import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.auth import verify_jwt
from services.supabase_client import get_supabase
from services.retell_service import create_web_call, get_call_transcript
from services.eval_service import evaluate_call
from services.card_service import update_card_from_eval
from models.schemas import StartCallRequest, HintRequest

router = APIRouter(prefix="/calls", tags=["calls"])
limiter = Limiter(key_func=get_remote_address)


def _build_eval_from_call(call: dict) -> dict:
    """Convert a flat calls table row → the eval dict the frontend expects."""
    return {
        "scores": {
            "opening":      call.get("score_opening") or 0,
            "rapport":      call.get("score_rapport") or 0,
            "discovery":    call.get("score_discovery") or 0,
            "objection":    call.get("score_objection") or 0,
            "closing":      call.get("score_closing") or 0,
            "adaptability": call.get("score_adaptability") or 0,
        },
        "overall":               call.get("score_overall") or 0,
        "grade":                 call.get("grade") or "—",
        "strengths":             call.get("strengths") or [],
        "improvements":          call.get("improvements") or [],
        "psychological_insights": call.get("psychological_insights") or {},
        "coach_note":            call.get("coach_note") or "",
        "elo_change":            call.get("elo_change") or 0,
        "transcript":            call.get("transcript") or "",
        "recommended_kb":        call.get("kb_tips_surfaced") or [],
    }


@router.post("/start")
@limiter.limit("10/minute")
async def start_call(request: Request, body: StartCallRequest, user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]

    # Fetch scenario
    try:
        db = get_supabase()
        scenario_result = db.table("scenarios").select("*").eq("id", body.scenario_id).single().execute()
        scenario = scenario_result.data
    except Exception:
        scenario = {
            "id": body.scenario_id,
            "prospect_name": "María González",
            "prospect_role": "Owner",
            "prospect_company": "Sonrisa Dental Clinic",
            "personality_type": "Skeptic",
            "call_stage": "Cold Call",
            "industry": "Healthcare",
            "default_product": "Dental practice management software",
        }

    # Create Retell web call
    try:
        retell_data = await create_web_call(scenario, body.mode, body.language)
        retell_call_id = retell_data.get("call_id", str(uuid.uuid4()))
        access_token = retell_data.get("access_token", "demo-token")
    except Exception:
        retell_call_id = f"mock-{uuid.uuid4()}"
        access_token = "demo-mode-no-retell-key"

    # Create call record
    call_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        db = get_supabase()
        db.table("calls").insert({
            "id": call_id,
            "user_id": user_id,
            "scenario_id": body.scenario_id,
            "mode": body.mode,
            "language": body.language,
            "product_sold": scenario.get("default_product", ""),
            "retell_call_id": retell_call_id,
            "started_at": now_iso,
        }).execute()
    except Exception:
        pass

    return {
        "call_id": call_id,
        "retell_call_id": retell_call_id,
        "access_token": access_token,
    }


@router.post("/{call_id}/end")
async def end_call(call_id: str, user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]

    # Fetch the call record
    try:
        db = get_supabase()
        call_result = db.table("calls").select("*").eq("id", call_id).eq("user_id", user_id).single().execute()
        call = call_result.data
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
    except HTTPException:
        raise
    except Exception:
        call = {"mode": "medium", "retell_call_id": None, "scenario_id": None}

    # ── Idempotency: if already evaluated, return existing data ───────────
    if call.get("score_overall") and call.get("grade"):
        return {"eval": _build_eval_from_call(call)}

    retell_call_id = call.get("retell_call_id")
    mode = call.get("mode", "medium")

    # ── Calculate duration ─────────────────────────────────────────────────
    duration_seconds = None
    if call.get("started_at"):
        try:
            started = call["started_at"]
            if isinstance(started, str):
                started = started.replace("Z", "+00:00")
                start_dt = datetime.fromisoformat(started)
            else:
                start_dt = started
            duration_seconds = max(0, int((datetime.now(timezone.utc) - start_dt).total_seconds()))
        except Exception:
            pass

    # ── Fetch transcript ───────────────────────────────────────────────────
    transcript = ""
    if retell_call_id and not retell_call_id.startswith("mock-"):
        transcript = await get_call_transcript(retell_call_id)

    # ── Fetch scenario ─────────────────────────────────────────────────────
    scenario = {}
    try:
        db = get_supabase()
        if call.get("scenario_id"):
            s = db.table("scenarios").select("*").eq("id", call["scenario_id"]).single().execute()
            scenario = s.data or {}
    except Exception:
        pass

    # ── Always increment total_calls and write duration ────────────────────
    try:
        db = get_supabase()
        base_update = {"completed_at": datetime.now(timezone.utc).isoformat()}
        if duration_seconds is not None:
            base_update["duration_seconds"] = duration_seconds
        db.table("calls").update(base_update).eq("id", call_id).execute()
    except Exception:
        pass

    # Always bump total_calls on the SEEZ card so the counter is never 0
    try:
        db = get_supabase()
        card_r = db.table("seez_cards").select("total_calls").eq("user_id", user_id).single().execute()
        if card_r.data:
            db.table("seez_cards").update({
                "total_calls": (card_r.data.get("total_calls") or 0) + 1
            }).eq("user_id", user_id).execute()
    except Exception:
        pass

    # ── Run eval ───────────────────────────────────────────────────────────
    eval_result = None
    if transcript:
        try:
            eval_result = await evaluate_call(
                transcript=transcript,
                scenario=scenario,
                product=call.get("product_sold", ""),
                mode=mode,
            )
        except Exception as e:
            print(f"Eval failed: {e}")

    if eval_result:
        # Write scores to call record
        try:
            db = get_supabase()
            db.table("calls").update({
                "score_opening":      eval_result["scores"]["opening"],
                "score_rapport":      eval_result["scores"]["rapport"],
                "score_discovery":    eval_result["scores"]["discovery"],
                "score_objection":    eval_result["scores"]["objection"],
                "score_closing":      eval_result["scores"]["closing"],
                "score_adaptability": eval_result["scores"]["adaptability"],
                "score_overall":      eval_result["overall"],
                "grade":              eval_result["grade"],
                "strengths":          eval_result["strengths"],
                "improvements":       eval_result["improvements"],
                "psychological_insights": eval_result["psychological_insights"],
                "elo_change":         eval_result["elo_change"],
                "transcript":         transcript,
                "coach_note":         eval_result.get("coach_note", ""),
                "kb_tips_surfaced":   eval_result.get("recommended_kb", []),
            }).eq("id", call_id).execute()
        except Exception:
            pass

        # Update SEEZ card stats (already incremented total_calls above)
        try:
            db = get_supabase()
            card_result = db.table("seez_cards").select("*").eq("user_id", user_id).single().execute()
            card = card_result.data or {}
            # Don't double-count total_calls (already bumped above)
            card_for_update = dict(card)
            card_for_update["total_calls"] = max(0, (card_for_update.get("total_calls") or 1) - 1)
            updated_card = update_card_from_eval(card_for_update, eval_result, mode)
            if card:
                db.table("seez_cards").update(updated_card).eq("user_id", user_id).execute()
            else:
                db.table("seez_cards").insert({"user_id": user_id, **updated_card}).execute()
        except Exception:
            pass

    return {"eval": eval_result}


@router.get("/history")
async def get_call_history(
    page: int = Query(1, ge=1),
    user: dict = Depends(verify_jwt),
):
    user_id = user["user_id"]
    limit = 20
    offset = (page - 1) * limit

    try:
        db = get_supabase()
        result = (
            db.table("calls")
            .select("id, grade, score_overall, mode, duration_seconds, started_at, scenario_id, completed_at")
            .eq("user_id", user_id)
            .not_.is_("completed_at", "null")
            .order("started_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        rows = result.data or []

        # Enrich with scenario name
        scenario_ids = list({r["scenario_id"] for r in rows if r.get("scenario_id")})
        scenario_map = {}
        if scenario_ids:
            try:
                s_result = db.table("scenarios").select("id, name, prospect_name").in_("id", scenario_ids).execute()
                for s in (s_result.data or []):
                    scenario_map[s["id"]] = s.get("prospect_name") or s.get("name") or "Unknown"
            except Exception:
                pass

        for row in rows:
            row["scenario_name"] = scenario_map.get(row.get("scenario_id"), "Unknown scenario")

        return rows
    except Exception:
        return []


@router.get("/{call_id}")
async def get_call(call_id: str, user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]
    try:
        db = get_supabase()
        result = db.table("calls").select("*").eq("id", call_id).eq("user_id", user_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Call not found")
        return result.data
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Call not found")


@router.get("/{call_id}/pitch")
async def get_pitch_guide(call_id: str, user: dict = Depends(verify_jwt)):
    """Generate a full, elaborated pitch guide for easy mode."""
    import anthropic, json
    from config import ANTHROPIC_API_KEY

    try:
        db = get_supabase()
        call_result = db.table("calls").select("scenario_id,product_sold,mode,language").eq("id", call_id).eq("user_id", user["user_id"]).single().execute()
        call = call_result.data
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Call not found")

    if call.get("mode") != "easy":
        raise HTTPException(status_code=403, detail="Pitch guide is only available in Easy mode")

    scenario = {}
    try:
        if call.get("scenario_id"):
            s = db.table("scenarios").select("*").eq("id", call["scenario_id"]).single().execute()
            scenario = s.data or {}
    except Exception:
        pass

    kb_context = ""
    try:
        from services.retell_service import STAGE_TOPIC_MAP
        topics = STAGE_TOPIC_MAP.get(scenario.get("call_stage", "Cold Call"), ["opening", "rapport"])
        kb_entries = []
        for topic in topics[:2]:
            res = db.table("kb_entries").select("title,summary,example_script").eq("topic", topic).limit(4).execute()
            kb_entries.extend(res.data or [])
        if kb_entries:
            lines = []
            for e in kb_entries[:6]:
                script = f' Example: "{e["example_script"]}"' if e.get("example_script") else ""
                lines.append(f"- {e['title']}: {(e.get('summary') or '')[:100]}{script}")
            kb_context = "\n".join(lines)
    except Exception:
        pass

    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI not configured")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prospect = f"{scenario.get('prospect_name', 'the prospect')} ({scenario.get('personality_type', 'prospect')}) — {scenario.get('prospect_role', '')} at {scenario.get('prospect_company', '')}"
    product = call.get("product_sold") or scenario.get("default_product", "your product")
    call_stage = scenario.get("call_stage", "Cold Call")
    industry = scenario.get("industry", "")
    language = call.get("language", "english")

    prompt = f"""You are an elite sales trainer building a full pitch guide for a rep about to run a {call_stage}.

PROSPECT: {prospect}
PRODUCT: {product}
INDUSTRY: {industry}
LANGUAGE: {language}

RELEVANT SALES TECHNIQUES:
{kb_context or "Standard techniques apply."}

Write a complete, elaborate, word-for-word pitch guide they can follow during this exact call.
Be very specific — use the prospect's name, company, and industry. Reference the product concretely.
Apply the sales techniques above where natural.

Return ONLY this JSON:
{{
  "opening": {{
    "hook": "<The exact first sentence to say — specific, disarming, not generic>",
    "agenda": "<One sentence setting the agenda for the call>",
    "permission_ask": "<Ask for a few minutes in a way that earns it>"
  }},
  "discovery_questions": [
    {{"question": "<Specific question 1 for this prospect>", "purpose": "<Why ask this>"}},
    {{"question": "<Specific question 2>", "purpose": "<Why ask this>"}},
    {{"question": "<Specific question 3>", "purpose": "<Why ask this>"}},
    {{"question": "<Specific question 4>", "purpose": "<Why ask this>"}}
  ],
  "pitch_points": [
    {{"headline": "<Short bold claim>", "proof": "<Specific evidence or stat>", "script": "<Exact words to use>"}},
    {{"headline": "<Second point>", "proof": "<Evidence>", "script": "<Exact words>"}},
    {{"headline": "<Third point>", "proof": "<Evidence>", "script": "<Exact words>"}}
  ],
  "objection_handlers": [
    {{"objection": "<Most likely objection from this personality type>", "response": "<Exact word-for-word response>"}},
    {{"objection": "<Second likely objection>", "response": "<Exact response>"}},
    {{"objection": "<Price objection>", "response": "<Exact response>"}}
  ],
  "closing_move": {{
    "trial_close": "<Exact trial close to test the temperature>",
    "ask": "<The exact next-step ask — specific day/time/action>",
    "fallback": "<If they say no to the ask, what to say next>"
  }}
}}"""

    try:
        msg = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2500,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate pitch: {e}")


@router.post("/{call_id}/hints")
@limiter.limit("20/minute")
async def get_hint(request: Request, call_id: str, body: HintRequest, user: dict = Depends(verify_jwt)):
    import anthropic
    import json
    from config import ANTHROPIC_API_KEY

    if not ANTHROPIC_API_KEY:
        return {
            "title": "Acknowledge before redirecting",
            "content": "Label the emotion first: 'It sounds like you've been burned before.' Then pause — don't fill silence.",
        }

    call_stage = "Cold Call"
    try:
        db = get_supabase()
        call_result = db.table("calls").select("scenario_id").eq("id", call_id).single().execute()
        if call_result.data and call_result.data.get("scenario_id"):
            scen = db.table("scenarios").select("call_stage").eq("id", call_result.data["scenario_id"]).single().execute()
            if scen.data:
                call_stage = scen.data.get("call_stage", "Cold Call")
    except Exception:
        pass

    kb_hint = ""
    try:
        from services.retell_service import STAGE_TOPIC_MAP
        topics = STAGE_TOPIC_MAP.get(call_stage, ['opening'])
        db = get_supabase()
        entries = []
        for topic in topics[:2]:
            res = db.table("kb_entries").select("title,summary").eq("topic", topic).limit(2).execute()
            entries.extend(res.data or [])
        if entries:
            kb_hint = "Techniques that apply here:\n" + "\n".join(
                f"- {e['title']}: {(e.get('summary') or '')[:80]}" for e in entries[:4]
            )
    except Exception:
        pass

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = f"""You are a sales coach. A rep is on a live {call_stage} and needs an immediate, actionable hint.

Recent conversation:
{body.context or "The call just started."}

{kb_hint}

Give a hint in this exact JSON format:
{{"title": "<5 word max>", "content": "<1-2 sentences — reference a specific technique by name if applicable, but give approach not exact words>"}}

The hint must be immediately actionable. Never script what to say verbatim."""

    try:
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception:
        return {
            "title": "Ask a better question",
            "content": "Redirect with a discovery question: 'What's the biggest challenge you're trying to solve this quarter?'",
        }


@router.delete("/history")
async def delete_call_history(user: dict = Depends(verify_jwt)):
    """Delete all call records for the authenticated user."""
    user_id = user["user_id"]
    try:
        db = get_supabase()
        db.table("calls").delete().eq("user_id", user_id).execute()
        # Reset card stats
        db.table("seez_cards").update({
            "total_calls": 0,
            "calls_graded_b_or_above": 0,
        }).eq("user_id", user_id).execute()
        return {"deleted": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
