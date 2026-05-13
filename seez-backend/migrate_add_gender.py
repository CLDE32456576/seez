"""Add gender column to scenarios and update all records."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from services.supabase_client import get_supabase

GENDER_MAP = {
    "María González":      "female",
    "Carlos Mendoza":      "male",
    "Jessica Park":        "female",
    "Roberto Silva":       "male",
    "Anna Chen":           "female",
    "Miguel Ángel Torres": "male",
    "Diana Reyes":         "female",
    "Patricia Morales":    "female",
    "James Whitfield":     "male",
    "Elena Ramos":         "female",
}

db = get_supabase()
scenarios = db.table("scenarios").select("id,prospect_name").execute().data or []

for s in scenarios:
    gender = GENDER_MAP.get(s["prospect_name"], "male")
    try:
        db.table("scenarios").update({"gender": gender}).eq("id", s["id"]).execute()
        print(f"✓ {s['prospect_name']} → {gender}")
    except Exception as e:
        print(f"✗ {s['prospect_name']}: {e}")

print("Done.")
