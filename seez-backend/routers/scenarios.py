import random
from fastapi import APIRouter, Depends, Query
from services.auth import verify_jwt
from services.supabase_client import get_supabase

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

MOCK_SCENARIOS = [
    {
        "id": "1",
        "name": "María — The Skeptic Dentist",
        "prospect_name": "María González",
        "prospect_role": "Owner & Chief Dentist",
        "prospect_company": "Sonrisa Dental Clinic",
        "industry": "Healthcare",
        "personality_type": "Skeptic",
        "call_stage": "Cold Call",
        "difficulty_rating": 3,
        "default_product": "Dental practice management software",
        "language": "both",
    },
    {
        "id": "2",
        "name": "Carlos — The Alpha Real Estate Dev",
        "prospect_name": "Carlos Mendoza",
        "prospect_role": "Managing Director",
        "prospect_company": "Mendoza Properties",
        "industry": "Real Estate",
        "personality_type": "Alpha",
        "call_stage": "Discovery Call",
        "difficulty_rating": 4,
        "default_product": "CRM for real estate teams",
        "language": "english",
    },
    {
        "id": "3",
        "name": "Jessica — The Ghost CFO",
        "prospect_name": "Jessica Park",
        "prospect_role": "CFO",
        "prospect_company": "NovaTech Solutions",
        "industry": "SaaS / Tech",
        "personality_type": "Ghost",
        "call_stage": "Discovery Call",
        "difficulty_rating": 2,
        "default_product": "Financial forecasting platform",
        "language": "english",
    },
    {
        "id": "4",
        "name": "Roberto — The Burned Buyer",
        "prospect_name": "Roberto Silva",
        "prospect_role": "VP of Operations",
        "prospect_company": "LatiLogistics SA",
        "industry": "Logistics / Supply Chain",
        "personality_type": "Burned Buyer",
        "call_stage": "Objection Handling",
        "difficulty_rating": 4,
        "default_product": "Route optimization software",
        "language": "both",
    },
    {
        "id": "5",
        "name": "Anna — The Friendly Waster",
        "prospect_name": "Anna Chen",
        "prospect_role": "Marketing Director",
        "prospect_company": "Bloom Beauty Co",
        "industry": "Retail",
        "personality_type": "Friendly Waster",
        "call_stage": "Closing Call",
        "difficulty_rating": 3,
        "default_product": "Email marketing automation",
        "language": "english",
    },
    {
        "id": "6",
        "name": "Miguel — The Price Objector",
        "prospect_name": "Miguel Ángel Torres",
        "prospect_role": "Owner",
        "prospect_company": "La Cocina de Miguel",
        "industry": "Restaurants & F&B",
        "personality_type": "Price Objector",
        "call_stage": "Demo / Pitch",
        "difficulty_rating": 2,
        "default_product": "Restaurant POS and inventory system",
        "language": "both",
    },
]


@router.get("")
async def list_scenarios(
    industry: str = Query(None),
    call_stage: str = Query(None),
    personality_type: str = Query(None),
    user: dict = Depends(verify_jwt),
):
    try:
        db = get_supabase()
        query = db.table("scenarios").select("*")
        if industry:
            query = query.eq("industry", industry)
        if call_stage:
            query = query.eq("call_stage", call_stage)
        if personality_type:
            query = query.eq("personality_type", personality_type)
        result = query.execute()
        return result.data or MOCK_SCENARIOS
    except Exception:
        return MOCK_SCENARIOS


@router.get("/random")
async def get_random_scenario(
    mode: str = Query("medium"),
    user: dict = Depends(verify_jwt),
):
    try:
        db = get_supabase()
        result = db.table("scenarios").select("*").eq("is_random_eligible", True).execute()
        scenarios = result.data or MOCK_SCENARIOS
    except Exception:
        scenarios = MOCK_SCENARIOS

    if not scenarios:
        return MOCK_SCENARIOS[0]
    return random.choice(scenarios)


@router.get("/{scenario_id}")
async def get_scenario(scenario_id: str, user: dict = Depends(verify_jwt)):
    try:
        db = get_supabase()
        result = db.table("scenarios").select("*").eq("id", scenario_id).single().execute()
        return result.data
    except Exception:
        match = next((s for s in MOCK_SCENARIOS if s["id"] == scenario_id), None)
        return match or MOCK_SCENARIOS[0]
