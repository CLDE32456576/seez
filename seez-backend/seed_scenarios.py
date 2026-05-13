"""
Seed 100 scenarios into Supabase from scenarios_100.json.
Run: python3 seed_scenarios.py
Generates fresh JSON if not present: python3 generate_scenarios.py && python3 seed_scenarios.py
"""
import json
from pathlib import Path
from services.supabase_client import get_supabase

SCENARIOS_FILE = Path(__file__).parent / "scenarios_100.json"


def seed():
    if not SCENARIOS_FILE.exists():
        print(f"ERROR: {SCENARIOS_FILE} not found. Run: python3 generate_scenarios.py first.")
        return

    with open(SCENARIOS_FILE) as f:
        scenarios = json.load(f)

    db = get_supabase()
    ok = err = 0
    for s in scenarios:
        try:
            db.table("scenarios").upsert(s).execute()
            print(f"  ✓ {s['name']}")
            ok += 1
        except Exception as e:
            print(f"  ✗ {s['name']}: {e}")
            err += 1

    print(f"\nSeeded {ok} scenarios. Errors: {err}.")


if __name__ == "__main__":
    seed()
