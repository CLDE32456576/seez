import json
import anthropic
from config import ANTHROPIC_API_KEY
from models.schemas import EvalResult

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# Call stage → relevant KB topics (primary, secondary)
STAGE_TOPIC_MAP = {
    'Cold Call':          ['opening', 'rapport'],
    'Discovery Call':     ['discovery', 'rapport'],
    'Demo / Pitch':       ['closing', 'discovery'],
    'Objection Handling': ['objection', 'closing'],
    'Closing Call':       ['closing', 'objection'],
    'Negotiation':        ['negotiation', 'closing'],
    'Follow-up':          ['rapport', 'closing'],
}


def fetch_kb_concepts_for_eval(call_stage: str) -> str:
    """Fetch relevant KB concepts for a call stage. Returns a formatted list."""
    try:
        from services.supabase_client import get_supabase
        db = get_supabase()

        topics = STAGE_TOPIC_MAP.get(call_stage, ['opening', 'rapport'])
        seen = set()
        concepts = []

        for topic in topics:
            result = db.table('kb_entries').select(
                'title,summary,topic'
            ).eq('topic', topic).limit(4).execute()
            for entry in (result.data or []):
                if entry['title'] not in seen:
                    seen.add(entry['title'])
                    concepts.append(entry)

        # Always include 2 psychology concepts
        psych = db.table('kb_entries').select(
            'title,summary,topic'
        ).eq('topic', 'psychology').limit(2).execute()
        for entry in (psych.data or []):
            if entry['title'] not in seen:
                seen.add(entry['title'])
                concepts.append(entry)

        if not concepts:
            return ""

        lines = []
        for c in concepts[:10]:
            summary = (c.get('summary') or '')[:120]
            lines.append(f"- [{c['topic'].upper()}] {c['title']}: {summary}")
        return "\n".join(lines)
    except Exception:
        return ""


EVAL_PROMPT = """You are an elite sales coach evaluating a practice call transcript.

SCENARIO: {scenario_description}
PRODUCT BEING SOLD: {product}
CALL STAGE: {call_stage}
DIFFICULTY MODE: {mode}

TRANSCRIPT:
{transcript}

KNOWLEDGE BASE — SALES TECHNIQUES RELEVANT TO THIS CALL STAGE:
{kb_concepts}

Score the sales rep on these 6 dimensions (1-100 each):

1. OPENING (OPN) - First 30 seconds. Did they hook the prospect? Clear intro?
2. RAPPORT (RAP) - Did they build genuine connection? Find common ground?
3. DISCOVERY (DIS) - Did they ask questions? Listen? Find the pain?
4. OBJECTION HANDLING (OBJ) - How did they handle pushback? Did they crumble?
5. CLOSING (CLO) - Did they ask for the next step or close? Did they earn the right to?
6. ADAPTABILITY (ADP) - Did they adjust when the prospect changed direction?

Also evaluate these psychological factors (qualitative, not scored):
- Confidence level (based on filler words, hesitation)
- Reciprocity usage
- Social proof deployment
- Loss aversion framing
- Empathy calibration
- Authority signals

When writing strengths and improvements, reference specific technique names from the knowledge base above where applicable.
Example strength: "Used 'Pattern Interrupt' effectively — opened with a question rather than a pitch."
Example improvement: "Missed 'Pain Amplification' — after the prospect mentioned budget cuts, should have asked follow-up questions to deepen the pain before presenting value."

Respond ONLY with this JSON structure:
{{
  "scores": {{
    "opening": <1-100>,
    "rapport": <1-100>,
    "discovery": <1-100>,
    "objection": <1-100>,
    "closing": <1-100>,
    "adaptability": <1-100>
  }},
  "strengths": [
    "<Specific moment from transcript — what they did well and why, citing KB technique if applicable>",
    "<Second strength>",
    "<Third strength>"
  ],
  "improvements": [
    "<Specific moment from transcript — what failed, the KB technique they should have applied, and the exact alternative approach>",
    "<Second improvement>",
    "<Third improvement>"
  ],
  "recommended_kb": [
    "<Exact KB technique name from the list above that this rep should study>",
    "<Second recommendation>"
  ],
  "psychological_insights": {{
    "confidence_level": "<low|medium|high> — brief explanation",
    "reciprocity_usage": "<brief observation>",
    "social_proof_deployment": "<brief observation>",
    "loss_aversion_framing": "<brief observation>",
    "empathy_calibration": "<brief observation>",
    "authority_signals": "<brief observation>"
  }},
  "coach_note": "<One paragraph. Direct, honest, actionable. Written like a coach who respects the rep enough to be brutally honest. Reference at least one specific KB technique they should drill.>"
}}"""

WEIGHTS = {
    "opening": 0.15,
    "rapport": 0.15,
    "discovery": 0.20,
    "objection": 0.20,
    "closing": 0.20,
    "adaptability": 0.10,
}

ELO_BASE = {"A+": 45, "A": 35, "B": 20, "C": 0, "D": -10, "F": -20}
ELO_MULTIPLIER = {"easy": 1.0, "medium": 1.25, "hard": 1.5}


def calculate_grade(score: int) -> str:
    if score >= 90:
        return "A+"
    elif score >= 80:
        return "A"
    elif score >= 70:
        return "B"
    elif score >= 60:
        return "C"
    elif score >= 50:
        return "D"
    return "F"


def calculate_elo_change(grade: str, mode: str) -> int:
    base = ELO_BASE.get(grade, 0)
    multiplier = ELO_MULTIPLIER.get(mode, 1.0)
    return round(base * multiplier)


async def evaluate_call(
    transcript: str,
    scenario: dict,
    product: str,
    mode: str,
) -> dict:
    if not client:
        raise RuntimeError("Anthropic client not configured")

    call_stage = scenario.get("call_stage", "Cold Call")
    kb_concepts = fetch_kb_concepts_for_eval(call_stage)

    scenario_desc = f"{scenario.get('prospect_name')} ({scenario.get('personality_type')}) at {scenario.get('prospect_company')}"

    prompt = EVAL_PROMPT.format(
        scenario_description=scenario_desc,
        product=product,
        call_stage=call_stage,
        mode=mode,
        transcript=transcript,
        kb_concepts=kb_concepts or "No specific techniques loaded.",
    )

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    data = json.loads(raw)

    scores = data["scores"]
    overall = round(
        sum(scores[k] * WEIGHTS[k] for k in WEIGHTS)
    )
    grade = calculate_grade(overall)
    elo_change = calculate_elo_change(grade, mode)

    return {
        "scores": scores,
        "grade": grade,
        "overall": overall,
        "strengths": data.get("strengths", []),
        "improvements": data.get("improvements", []),
        "recommended_kb": data.get("recommended_kb", []),
        "psychological_insights": data.get("psychological_insights", {}),
        "coach_note": data.get("coach_note", ""),
        "elo_change": elo_change,
    }
