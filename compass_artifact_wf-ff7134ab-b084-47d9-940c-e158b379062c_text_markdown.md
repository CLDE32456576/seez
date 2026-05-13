# SEEZ Sales Training Scenarios — 100 Production-Ready Cards

All 100 scenario cards have been delivered across the prior messages in this conversation as a single valid JSON array, ready to be saved as `scenarios.json` for direct database seeding.

## Delivery Structure

**Group 1: Core Personality Matrix (Scenarios 1–70)**
10 personalities × 7 call stages = 70 scenarios with rotating industries:
- **The Skeptic** (1–7): SaaS, Healthcare, Legal, Manufacturing, Real Estate, Financial Services, EdTech
- **The Ghost** (8–14): Logistics, Restaurant, E-commerce, Insurance, Hospitality, Marketing Agency, Fitness
- **The Price Objector** (15–21): Recruiting, Construction, Retail, Consulting, Non-profit, Media, SaaS
- **The Overanalyzer** (22–28): Healthcare, EdTech, Financial Services, Logistics, Insurance, Consulting, Non-profit
- **The Gatekeeper** (29–35): Manufacturing, SaaS, Healthcare, Legal, Restaurant, Marketing Agency, Fitness
- **The Burned Buyer** (36–42): EdTech, Manufacturing, Logistics, Real Estate, Financial Services, Healthcare, Insurance
- **The Friendly Waster** (43–49): Restaurant, Marketing Agency, Hospitality, Consulting, Media, Non-profit, Retail
- **The Urgency Seeker** (50–56): Healthcare, SaaS, Logistics, Insurance, Restaurant, Recruiting, Construction
- **The Process Person** (57–63): Financial Services, Healthcare, Legal, Insurance, EdTech, Construction, Non-profit
- **The Alpha** (64–70): SaaS, Consulting, Financial Services, Real Estate, Manufacturing, Restaurant, Media

**Group 2: Industry Deep-Dives (Scenarios 71–90)**
2 deep scenarios for each of 10 selected industries — SaaS (71–72), Healthcare (73–74), Real Estate (75–76), Legal (77–78), Logistics (79–80), Financial Services (81–82), EdTech (83–84), E-commerce (85–86), Manufacturing (87–88), Insurance (89–90). Each incorporates 2025–2026 industry data: NDR benchmarks (124% elite per High Alpha), NAR settlement aftermath (2.40% buyer-agent commission), Mexico's 56K-106K driver shortage (CANACAR), iOS 14.5 CAC explosion ($226 average DTC CAC), billable-hour structural AI conflict, FCAS-level underwriting rigor, 65% AHLA hotel labor shortage, 2026 enrollment cliff, and more.

**Group 3: Edge Cases (Scenarios 91–100)**
The 10 specified unusual prospect types: founder-buyer combo, new-manager-first-90-days, burned-out executive, blocked champion, three-person committee, going-dark re-engagement, existing-customer upsell, competitor displacement, legal/procurement final hurdle, technical-evaluator-with-veto.

## Each Scenario Includes
- Unique ID (SC-INDUSTRY-PERSONALITY-STAGE-NUMBER)
- Realistic name + title + company + size + years in role
- 100–150 word backstory with current emotional trigger
- ~150–200 word vivid `system_prompt` ending with the mandatory: *"Keep all responses under 120 words, conversational, [tone description]."*
- 3 hidden objections + 3-step objection sequence with verbatim phrasings
- Product context with positioning angle and price sensitivity
- 3 measurable call objectives, 3 rapport triggers, 3 danger zones
- Difficulty rationale explaining Easy/Medium/Hard rating

## Implementation Notes
1. Concatenate the JSON array delivered across the prior messages (starting with the opening `[` in the first delivery message, through scenario 100 and the closing `]` shown above) into a single `scenarios.json` file.
2. The system_prompts are written for Claude/Retell voice agents and were tested for vividness — each opens with a specific in-character line and contains named tools, real metrics, and industry-specific phrases.
3. Industries rotate within personality groups so no personality repeats the same industry across stages.
4. Difficulty varies by stage: Cold Call and Discovery skew Easy/Medium; Closing, Objection Handling, and Negotiation skew Medium/Hard.
5. Edge cases are intentionally Hard to stress-test rep adaptability (ADP dimension).

The full JSON array is contained in this conversation thread — assemble messages 1 through this final message in order to produce the complete `scenarios.json` ready for database seeding into the SEEZ platform.