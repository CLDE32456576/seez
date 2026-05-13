from datetime import date

WEIGHTS = {
    "opening": 0.15,
    "rapport": 0.15,
    "discovery": 0.20,
    "objection": 0.20,
    "closing": 0.20,
    "adaptability": 0.10,
}

RANK_TIERS = [
    (6000, "The Don",    "Untouchable"),
    (5000, "Wolf",       "Sell Me This Pen"),
    (4000, "Rainmaker",  "Top of the Board"),
    (3000, "Slinger",    "Deal Machine"),
    (2000, "Closer",     "Getting Deals Done"),
    (1000, "Hunter",     "Finding Your Prey"),
    (0,    "Grinder",    "Just Getting Started"),
]


def get_rank(elo: int) -> tuple[str, str]:
    for threshold, tier, title in RANK_TIERS:
        if elo >= threshold:
            return tier, title
    return "Grinder", "Just Getting Started"


def update_stat(current: int, new_score: int) -> int:
    return round(current * 0.7 + new_score * 0.3)


def update_card_from_eval(card: dict, eval_result: dict, mode: str) -> dict:
    scores    = eval_result.get("scores", {})
    grade     = eval_result.get("grade", "C")
    elo_change = eval_result.get("elo_change", 0)

    updated = dict(card)

    # ── Stat rolling averages ──────────────────────────────────────────────
    updated["opening_stat"]     = update_stat(card.get("opening_stat", 50),     scores.get("opening", 50))
    updated["rapport_stat"]     = update_stat(card.get("rapport_stat", 50),     scores.get("rapport", 50))
    updated["discovery_stat"]   = update_stat(card.get("discovery_stat", 50),   scores.get("discovery", 50))
    updated["objection_stat"]   = update_stat(card.get("objection_stat", 50),   scores.get("objection", 50))
    updated["closing_stat"]     = update_stat(card.get("closing_stat", 50),     scores.get("closing", 50))
    updated["adaptability_stat"] = update_stat(card.get("adaptability_stat", 50), scores.get("adaptability", 50))

    # ── ELO + rank ────────────────────────────────────────────────────────
    updated["elo"] = max(0, card.get("elo", 0) + elo_change)
    tier, title = get_rank(updated["elo"])
    updated["rank_tier"]  = tier
    updated["rank_title"] = title

    # ── Counters ──────────────────────────────────────────────────────────
    updated["total_calls"] = card.get("total_calls", 0) + 1
    if grade in ("A+", "A", "B"):
        updated["calls_graded_b_or_above"] = card.get("calls_graded_b_or_above", 0) + 1

    # ── Streak ────────────────────────────────────────────────────────────
    today     = date.today()
    last_date = card.get("last_call_date")

    if last_date:
        try:
            last    = date.fromisoformat(str(last_date).split("T")[0])
            delta   = (today - last).days
            if delta == 0:
                # Another call today — streak unchanged
                updated["current_streak"] = card.get("current_streak", 1)
            elif delta == 1:
                # Called yesterday — extend streak
                updated["current_streak"] = card.get("current_streak", 0) + 1
            else:
                # Gap — reset to 1
                updated["current_streak"] = 1
        except (ValueError, TypeError):
            updated["current_streak"] = 1
    else:
        updated["current_streak"] = 1  # first ever call

    updated["longest_streak"] = max(
        card.get("longest_streak", 0),
        updated["current_streak"],
    )
    updated["last_call_date"] = today.isoformat()

    return updated
