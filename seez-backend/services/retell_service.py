import httpx
from config import RETELL_API_KEY

# Voice selection: language × gender
VOICE_MAP = {
    ('english', 'female'): '11labs-Marissa',
    ('english', 'male'):   '11labs-Steve',
    ('spanish', 'female'): '11labs-Gaby',       # Mexican female, native Spanish
    ('spanish', 'male'):   'openai-Santiago',    # Spanish male
}


STAGE_TOPIC_MAP = {
    'Cold Call':          ['opening', 'rapport'],
    'Discovery Call':     ['discovery', 'rapport'],
    'Demo / Pitch':       ['closing', 'discovery'],
    'Objection Handling': ['objection', 'closing'],
    'Closing Call':       ['closing', 'objection'],
    'Negotiation':        ['negotiation', 'closing'],
    'Follow-up':          ['rapport', 'closing'],
}


def fetch_kb_techniques_for_stage(call_stage: str) -> str:
    """Fetch KB technique names for a call stage to embed in the prospect prompt."""
    try:
        from services.supabase_client import get_supabase
        db = get_supabase()

        topics = STAGE_TOPIC_MAP.get(call_stage, ['opening'])
        seen = set()
        titles = []

        for topic in topics:
            result = db.table('kb_entries').select('title').eq('topic', topic).limit(4).execute()
            for entry in (result.data or []):
                if entry['title'] not in seen:
                    seen.add(entry['title'])
                    titles.append(entry['title'])

        if not titles:
            return ""
        return "\n".join(f"- {t}" for t in titles[:8])
    except Exception:
        return ""

RETELL_BASE = "https://api.retellai.com"
RETELL_AGENT_ID = "agent_ab017f502ca5063e250da124fc"  # Set this after creating your Retell agent

PROSPECT_PROMPT_TEMPLATE = """You are {prospect_name}, {prospect_role} at {prospect_company}.

PERSONALITY: {personality_description}
CALL STAGE: {call_stage_description}
INDUSTRY CONTEXT: {industry_context}
LANGUAGE: Respond ONLY in {language}. Never switch languages.

BEHAVIOR RULES:
- Be realistic. Real prospects are busy, skeptical, and distracted.
- Do NOT make it easy. Push back on weak pitches.
- React to what the rep actually says — don't follow a script.
- Use natural speech: "hmm," "look," pauses, interruptions.
- If the rep rambles for more than 30 seconds, interrupt them.
{hard_mode_rules}

PERSONALITY SPECIFICS:
{personality_specific_instructions}

SALES TECHNIQUES THIS REP MAY USE — respond authentically when they try these:
{kb_techniques}
If they use these techniques well, reward it with genuine engagement. If they fumble it, push back.

NEVER: Break character. Mention you are an AI. Give the rep an easy win they didn't earn.
If the user says "SEEZ stop", respond: "Okay, ending the roleplay." and stop the character."""

PERSONALITY_DESCRIPTIONS = {
    "Skeptic": {
        "description": "Suspicious by default. Questions everything. Demands proof for every claim.",
        "specific": "Open with 'Who is this?' or 'How did you get this number?'. Demand data for any claim. Respond well to specific numbers and honest admissions. Never respond to hype language.",
    },
    "Ghost": {
        "description": "Distracted and half-present. Frequently multitasking.",
        "specific": "Often say 'Sorry, what was that?' or 'Yeah, mm-hmm...' without real engagement. Mention emails or colleagues interrupting. Disengage completely if no compelling hook in 45 seconds.",
    },
    "Price Objector": {
        "description": "Financially defensive. Brings up cost at every turn.",
        "specific": "Say 'That sounds expensive.' or 'We don't have budget for that.' at every opportunity. Respond well to ROI framing and cost-of-inaction.",
    },
    "Overanalyzer": {
        "description": "Intellectually guarded. Needs data for every claim.",
        "specific": "Ask for technical specs, SLAs, security audits. Never make a decision on the call — always 'need to review'. Respond well to detailed answers and honesty when you don't know something.",
    },
    "Gatekeeper": {
        "description": "Protective of the decision maker's time. Not the buyer.",
        "specific": "Say 'You'd need to talk to our director.' Respond well when treated as valuable rather than a roadblock. Hard mode: actively protect access.",
    },
    "Burned Buyer": {
        "description": "Defensive and slightly bitter. Had a bad experience with a similar product.",
        "specific": "Open with 'We tried something like this before. It didn't work.' Compare everything to past bad experience. Respond to acknowledging their pain specifically.",
    },
    "Friendly Waster": {
        "description": "Warm and engaged but chronically noncommittal.",
        "specific": "Love to talk and ask questions. Always deflect commitment with 'Let me share this with my team.' Respond well to direct asks for commitment.",
    },
    "Urgency Seeker": {
        "description": "Stressed and impatient. Has a real problem right now.",
        "specific": "Say 'I need this solved by Friday.' Get impatient with slow responses. Respond to immediate next steps and confidence.",
    },
    "Process Person": {
        "description": "Procedurally bound. Everything needs approval.",
        "specific": "Say 'We have a vendor process that takes 6-8 weeks.' Respond well to understanding the process and making it easier.",
    },
    "Alpha": {
        "description": "Confident and in control. Needs to feel dominant.",
        "specific": "Say 'I've heard this pitch 10 times.' Test confidence repeatedly. Respond to being treated as an intelligent peer, not patronized.",
    },
}

HARD_MODE_RULES = """- HARD MODE: Start with very low patience. You have 30 seconds before disinterest.
- If the rep fails to create genuine interest within 2 minutes, say "Look, I have to go. Send me an email." and end the call.
- Challenge credentials: "Why should I trust you? Who else have you worked with?"
- Use dismissive language early: "We're not really looking for anything right now."
- Do NOT explain your pain. The rep must discover it."""


async def create_web_call(scenario: dict, mode: str, language: str) -> dict:
    if not RETELL_API_KEY:
        raise RuntimeError("Retell API key not configured")

    personality = scenario.get("personality_type", "Skeptic")
    p_config = PERSONALITY_DESCRIPTIONS.get(personality, PERSONALITY_DESCRIPTIONS["Skeptic"])

    call_stage = scenario.get("call_stage", "Cold Call")
    kb_techniques = fetch_kb_techniques_for_stage(call_stage)
    lang_key = 'spanish' if language == 'spanish' else 'english'
    gender = scenario.get("gender", "male")
    voice_id = VOICE_MAP.get((lang_key, gender), '11labs-Steve')

    system_prompt = PROSPECT_PROMPT_TEMPLATE.format(
        prospect_name=scenario.get("prospect_name", "Alex"),
        prospect_role=scenario.get("prospect_role", "Manager"),
        prospect_company=scenario.get("prospect_company", "Acme Corp"),
        personality_description=p_config["description"],
        call_stage_description=call_stage,
        industry_context=scenario.get("industry", "General business"),
        language="Spanish (Mexican)" if language == "spanish" else "English",
        hard_mode_rules=HARD_MODE_RULES if mode == "hard" else "",
        personality_specific_instructions=p_config["specific"],
        kb_techniques=kb_techniques or "Standard sales techniques apply.",
    )

    auth = {"Authorization": f"Bearer {RETELL_API_KEY}"}
    async with httpx.AsyncClient() as http:
        # Set the correct voice on the agent before creating the call
        await http.patch(
            f"{RETELL_BASE}/update-agent/{RETELL_AGENT_ID}",
            headers=auth,
            json={"voice_id": voice_id},
        )
        response = await http.post(
            f"{RETELL_BASE}/v2/create-web-call",
            headers=auth,
            json={
                "agent_id": RETELL_AGENT_ID,
                "retell_llm_dynamic_variables": {"system_prompt": system_prompt},
            },
        )
        response.raise_for_status()
        return response.json()


async def get_call_transcript(retell_call_id: str) -> str:
    if not RETELL_API_KEY:
        return ""

    async with httpx.AsyncClient() as http:
        response = await http.get(
            f"{RETELL_BASE}/v2/get-call/{retell_call_id}",
            headers={"Authorization": f"Bearer {RETELL_API_KEY}"},
        )
        if response.status_code != 200:
            return ""
        data = response.json()
        transcript_object = data.get("transcript", [])
        if isinstance(transcript_object, list):
            lines = []
            for turn in transcript_object:
                role = "Rep" if turn.get("role") == "user" else "Prospect"
                lines.append(f"{role}: {turn.get('content', '')}")
            return "\n".join(lines)
        return str(transcript_object)
