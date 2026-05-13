#!/usr/bin/env python3
"""
Generate 100 SEEZ Sales Training Scenarios → scenarios_100.json
Run: python3 generate_scenarios.py
"""
import json
import uuid
from pathlib import Path

# ── INDUSTRY DATA ──────────────────────────────────────────────────────────────

INDUSTRY_DATA = {
    "SaaS": {
        "names": [("Marcus", "Holt"), ("Diana", "Reyes"), ("Ethan", "Cole"), ("Rachel", "Kim"), ("Jason", "Vo")],
        "roles": ["VP of Sales", "CRO", "RevOps Manager", "Head of Revenue", "CEO"],
        "companies": ["CloudMetrics", "Scalebound AI", "DataPulse", "VeloStack", "PipelinePro"],
        "product": "sales intelligence and pipeline visibility platform",
        "pain": "pipeline visibility, forecast accuracy, rep ramp time",
        "price_range": "$1,800–$4,500/mo",
    },
    "Healthcare": {
        "names": [("Dr. Sandra", "Ruiz"), ("James", "Whitfield"), ("Patricia", "Morales"), ("Kevin", "Shaw"), ("Elena", "Park")],
        "roles": ["Practice Owner", "CFO", "VP Operations", "Medical Director", "Practice Manager"],
        "companies": ["Sunrise Medical Group", "HealthFirst Systems", "CareConnect Health", "Summit Pediatrics", "Apex Urgent Care"],
        "product": "practice management and revenue cycle platform",
        "pain": "no-shows, billing errors, staff scheduling, HIPAA compliance",
        "price_range": "$2,200–$5,000/mo",
    },
    "Legal": {
        "names": [("Thomas", "Morrison"), ("Catherine", "Burke"), ("William", "Ashford"), ("Julia", "Stern"), ("David", "Kwan")],
        "roles": ["Managing Partner", "Partner", "Firm Administrator", "COO", "Head of Operations"],
        "companies": ["Morrison & Burke LLP", "Whitfield Associates", "Ashford Legal Group", "Sterling Law Partners", "Pacific Trial Counsel"],
        "product": "legal practice management and billing platform",
        "pain": "billable hour tracking, matter management, client invoicing, trust accounting",
        "price_range": "$3,000–$7,500/mo",
    },
    "Manufacturing": {
        "names": [("Robert", "Gunther"), ("Linda", "Vasquez"), ("Steven", "Park"), ("Angela", "Torres"), ("Donald", "Hicks")],
        "roles": ["VP of Operations", "Plant Manager", "Director of Manufacturing", "COO", "Production Manager"],
        "companies": ["Midwest Fabrication Co", "Apex Manufacturing", "SteelCore Industries", "Precision Parts Inc", "Cascade Metal Works"],
        "product": "ERP and production scheduling platform",
        "pain": "production downtime, inventory waste, quality defects, compliance reporting",
        "price_range": "$4,000–$12,000/mo",
    },
    "Real Estate": {
        "names": [("Carlos", "Mendoza"), ("Amanda", "Ross"), ("Brian", "Nakamura"), ("Nicole", "Estrada"), ("Mark", "Lawson")],
        "roles": ["Broker/Owner", "Team Lead", "Managing Director", "Director of Sales", "Principal Broker"],
        "companies": ["Summit Realty Group", "HomeFront Properties", "Cascade Real Estate", "Metro Living Group", "Apex Properties"],
        "product": "CRM and transaction management platform",
        "pain": "lead follow-up gaps, transaction coordination, agent accountability, commission tracking",
        "price_range": "$800–$2,500/mo",
    },
    "Financial Services": {
        "names": [("Richard", "Harmon"), ("Stephanie", "Walsh"), ("Anthony", "Greco"), ("Carolyn", "Patel"), ("Joseph", "Tanaka")],
        "roles": ["Wealth Manager", "RIA Principal", "VP Advisor", "Managing Director", "Partner"],
        "companies": ["Arbor Capital Partners", "Summit Financial Advisors", "Meridian Wealth Group", "Heritage Investment Partners", "Clarity Capital"],
        "product": "client relationship management and compliance platform",
        "pain": "client retention, compliance burden, reporting time, growth stagnation",
        "price_range": "$3,500–$8,000/mo",
    },
    "EdTech": {
        "names": [("Victoria", "Huang"), ("Eric", "Donovan"), ("Michelle", "Santos"), ("Paul", "Osei"), ("Joyce", "Reyes")],
        "roles": ["VP Enrollment", "Dean of Students", "Director of Digital Learning", "VP Academic Affairs", "COO"],
        "companies": ["Westbrook Academy", "Pacific Learning Institute", "Horizon EdTech", "NextStep Learning", "Summit Online College"],
        "product": "enrollment management and student retention platform",
        "pain": "enrollment decline, student dropout, faculty adoption, LMS fragmentation",
        "price_range": "$2,500–$6,000/mo",
    },
    "Logistics": {
        "names": [("Roberto", "Silva"), ("Susan", "Finley"), ("Charles", "Okafor"), ("Diane", "Lim"), ("Thomas", "Garrett")],
        "roles": ["VP of Operations", "Director of Supply Chain", "Fleet Manager", "COO", "Director of Logistics"],
        "companies": ["Centrix Freight Solutions", "NorthStar Logistics", "Apex 3PL", "Momentum Freight", "Cascade Transport Group"],
        "product": "route optimization and fleet management platform",
        "pain": "driver shortage, fuel costs, on-time delivery rates, carrier compliance",
        "price_range": "$3,000–$9,000/mo",
    },
    "Restaurant": {
        "names": [("Miguel", "Torres"), ("Anna", "Chen"), ("Eduardo", "Reyes"), ("Susan", "Park"), ("Carlos", "Diaz")],
        "roles": ["Owner", "Operations Manager", "Director of F&B", "GM", "Multi-Unit Owner"],
        "companies": ["La Cocina de Miguel", "Coastal Kitchen Group", "Mesa Moderna", "Pacific Bites", "The Corner Table Group"],
        "product": "POS and restaurant operations platform",
        "pain": "labor costs, food waste, online ordering fragmentation, tip-out disputes",
        "price_range": "$400–$1,200/mo",
    },
    "E-commerce": {
        "names": [("Jessica", "Bloom"), ("Michael", "Tran"), ("Linda", "Cooper"), ("Jason", "Kwon"), ("Rachel", "Navarro")],
        "roles": ["CMO", "Head of Growth", "VP Marketing", "Director of Customer Acquisition", "Co-Founder"],
        "companies": ["Urban Thread Co", "Lumina Beauty", "SwiftGoods", "Ember Home", "Vault Outdoors"],
        "product": "customer acquisition and retention analytics platform",
        "pain": "iOS 14 attribution loss, rising CAC, LTV stagnation, subscription churn",
        "price_range": "$2,000–$6,500/mo",
    },
    "Insurance": {
        "names": [("James", "O'Brien"), ("Patricia", "Lee"), ("Kevin", "Flores"), ("Sandra", "Park"), ("John", "Macy")],
        "roles": ["Agency Owner", "VP of Operations", "Managing Partner", "Director of Sales", "Principal Agent"],
        "companies": ["Pinnacle Insurance Group", "Shield Direct", "Guardian Agency LLC", "Apex Insurance Partners", "Summit Benefits Group"],
        "product": "agency CRM and renewal management platform",
        "pain": "policy renewal rates, cross-sell conversion, carrier compliance, book-of-business visibility",
        "price_range": "$1,500–$4,500/mo",
    },
    "Hospitality": {
        "names": [("Diana", "Nakamura"), ("Robert", "Perez"), ("Melissa", "Grant"), ("William", "Cho"), ("Angela", "Morales")],
        "roles": ["General Manager", "VP of Operations", "Revenue Manager", "Director of Sales", "COO"],
        "companies": ["Meridian Hotel & Suites", "Coastal Resorts LLC", "Summit Conference Center", "Harbor View Hotels", "Apex Hospitality Group"],
        "product": "revenue management and OTA optimization platform",
        "pain": "OTA commission drain, labor shortage, RevPAR stagnation, group booking gaps",
        "price_range": "$2,500–$7,000/mo",
    },
    "Marketing Agency": {
        "names": [("Daniel", "West"), ("Amanda", "Cruz"), ("Matthew", "Barnes"), ("Nicole", "Adebayo"), ("Steven", "Young")],
        "roles": ["Founder/CEO", "Account Director", "Managing Partner", "VP Client Services", "Director of Operations"],
        "companies": ["Gravity Digital", "Momentum Agency", "Apex Creative Group", "Shift Marketing", "Core Content Studio"],
        "product": "project management and client reporting platform",
        "pain": "scope creep, client reporting time, margin visibility, resource utilization",
        "price_range": "$1,200–$3,500/mo",
    },
    "Fitness/Wellness": {
        "names": [("Christopher", "Reed"), ("Stephanie", "Liu"), ("Anthony", "James"), ("Carolyn", "Nguyen"), ("Joseph", "Bell")],
        "roles": ["Owner", "VP Operations", "Studio Director", "COO", "Regional Manager"],
        "companies": ["Peak Performance Studio", "CoreFit Franchise", "Apex Wellness", "Momentum Fitness", "Summit Athletic Club"],
        "product": "membership management and studio scheduling platform",
        "pain": "member churn, front desk inefficiency, instructor no-shows, late payment collection",
        "price_range": "$500–$1,800/mo",
    },
    "Recruiting/Staffing": {
        "names": [("Mark", "Donovan"), ("Julie", "Santos"), ("Donald", "Walsh"), ("Christine", "Park"), ("Paul", "Okafor")],
        "roles": ["Managing Director", "Director of Talent", "VP of Staffing", "Principal Recruiter", "COO"],
        "companies": ["TalentForce Partners", "Nexus Staffing Solutions", "Apex Search Group", "Summit Recruiting", "Core Talent Agency"],
        "product": "ATS and sourcing automation platform",
        "pain": "time-to-fill, candidate ghosting, sourcing costs, compliance tracking",
        "price_range": "$1,800–$5,000/mo",
    },
    "Construction": {
        "names": [("Richard", "Gutierrez"), ("Victoria", "Hanson"), ("Eric", "Lambert"), ("Michelle", "Yuen"), ("Brian", "Nguyen")],
        "roles": ["VP of Operations", "Project Manager", "COO", "Director of Estimating", "Owner"],
        "companies": ["Granite Build Group", "Cornerstone Construction", "Apex Contractors", "Summit Building Co", "Pacific General Contractors"],
        "product": "project management and estimating platform",
        "pain": "project overruns, subcontractor coordination, bid accuracy, change order disputes",
        "price_range": "$3,000–$8,000/mo",
    },
    "Retail": {
        "names": [("Joyce", "Simmons"), ("Evelyn", "Torres"), ("Susan", "Kang"), ("Kathryn", "Reyes"), ("Deborah", "Cho")],
        "roles": ["VP of Retail Operations", "Merchandising Director", "Store Operations Manager", "COO", "Director of Stores"],
        "companies": ["Urban Collective", "NorthGate Stores", "Apex Retail Group", "Summit Merchandise", "Core Fashion Co"],
        "product": "inventory management and retail analytics platform",
        "pain": "stockouts, shrinkage, markdown timing, store performance visibility",
        "price_range": "$2,000–$6,000/mo",
    },
    "Consulting": {
        "names": [("Thomas", "Elliot"), ("Catherine", "Wong"), ("William", "Patel"), ("Julia", "Martin"), ("David", "Osei")],
        "roles": ["Partner", "Managing Director", "Principal", "VP Consulting", "Practice Lead"],
        "companies": ["Stratford Consulting Group", "Apex Strategy Partners", "Summit Advisory", "Meridian Consulting", "Core Solutions Group"],
        "product": "CRM and proposal automation platform",
        "pain": "proposal win rate, client retention, utilization tracking, billing efficiency",
        "price_range": "$2,000–$5,500/mo",
    },
    "Non-profit": {
        "names": [("Victoria", "Cole"), ("Eric", "Washington"), ("Michelle", "Garza"), ("Paul", "Ibrahim"), ("Joyce", "Kim")],
        "roles": ["Executive Director", "VP of Development", "Director of Fundraising", "COO", "Chief Development Officer"],
        "companies": ["Lighthouse Community Foundation", "Rising Tide Alliance", "Apex Giving Foundation", "Summit Social Services", "Core Community Works"],
        "product": "donor management and fundraising platform",
        "pain": "donor retention, grant tracking, reporting burden, volunteer coordination",
        "price_range": "$800–$2,500/mo",
    },
    "Media/Publishing": {
        "names": [("Richard", "Farley"), ("Stephanie", "Adler"), ("Anthony", "Ng"), ("Carolyn", "Bell"), ("Joseph", "Ramos")],
        "roles": ["Publisher", "VP Digital", "Head of Audience", "Director of Revenue", "COO"],
        "companies": ["Meridian Media Group", "Coastal Content Networks", "Apex Publishing", "Summit Digital Media", "Core Media Partners"],
        "product": "audience analytics and monetization platform",
        "pain": "subscriber churn, ad revenue decline, paywall conversion, content ROI",
        "price_range": "$2,500–$7,000/mo",
    },
}

# ── PERSONALITY DATA ───────────────────────────────────────────────────────────

PERSONALITY_DATA = {
    "Skeptic": {
        "tone": "direct and skeptical — you challenge every claim but respect hard data",
        "warmup": "concrete ROI data, named peer references, third-party case studies",
        "killswitch": "vague generalities or empty hype",
        "opener": "Look, I only have a few minutes. What exactly makes this different from everything else I've seen?",
        "phrases": ["prove it", "show me the numbers", "I've heard that before", "who else has done this?", "what's the ROI specifically?"],
        "backstory_hook": "You've been burned by vendors who promised the world and delivered nothing. You respect hard data and peer references but have zero tolerance for hype.",
    },
    "Ghost": {
        "tone": "initially warm and friendly, but evasive and hard to pin down",
        "warmup": "a concrete deadline or competitive threat that forces a decision",
        "killswitch": "pressure tactics or urgency you didn't create yourself",
        "opener": "Oh hi, yeah, sounds interesting — I'm kind of slammed but tell me a bit more.",
        "phrases": ["let me think about it", "sounds interesting", "keep me in the loop", "maybe next quarter", "I'll circle back"],
        "backstory_hook": "You're perpetually busy and hate being sold. You disappear when things get real. Only a genuine deadline or FOMO will move you.",
    },
    "Price Objector": {
        "tone": "budget-conscious and transactional — every conversation comes back to cost",
        "warmup": "clear ROI math, payment flexibility, or cost-of-inaction framing",
        "killswitch": "vague pricing or being pushed before you've seen real numbers",
        "opener": "Before you go any further — what's the price on this?",
        "phrases": ["how much exactly?", "can you do better on that?", "what's the ROI?", "that's more than I expected", "we just don't have the budget"],
        "backstory_hook": "Budget is always your first and last concern. You squeeze every vendor on price and need to see clear ROI math before any conversation moves forward.",
    },
    "Overanalyzer": {
        "tone": "methodical and detail-obsessed — you ask about every edge case and integration",
        "warmup": "a pilot offer, a simplified decision, or an exhaustive walk-through",
        "killswitch": "being rushed or getting vague answers to specific questions",
        "opener": "Okay, walk me through exactly how this works end to end. Don't skip anything.",
        "phrases": ["how exactly does that work?", "what if X happens?", "can you walk me through that step by step?", "what are the edge cases?", "I need to understand the full picture"],
        "backstory_hook": "You need every detail before you decide. You ask about integrations, edge cases, and failure modes. Analysis paralysis is real for you.",
    },
    "Gatekeeper": {
        "tone": "protective and cautious — you guard your boss's time and are skeptical of cold outreach",
        "warmup": "being treated as the key decision-influencer and given a clear internal selling path",
        "killswitch": "being bypassed or made to feel like a speed bump",
        "opener": "I handle all vendor inquiries. What is this regarding and why should I pass this to our leadership?",
        "phrases": ["let me check with them first", "I'll pass it along", "they're very busy", "what would you need from their side?", "I screen all of this"],
        "backstory_hook": "You're not the final DM but you control access to them. You're protective of your boss and will shut down anyone who tries to go around you.",
    },
    "Burned Buyer": {
        "tone": "guarded and trauma-aware — your last vendor implementation failed badly",
        "warmup": "extreme specificity, named references from similar companies, and ironclad guarantees",
        "killswitch": "anything that sounds like the last pitch that wrecked you",
        "opener": "I'll be honest — we tried something similar eighteen months ago and it was a disaster. Why would this be any different?",
        "phrases": ["last time they promised the same thing", "how is this different?", "I've heard that before", "what's your implementation failure rate?", "we lost six figures on our last system"],
        "backstory_hook": "Your last software implementation cost you six figures and six months. You're extremely cautious now and require specific proof before trusting any vendor.",
    },
    "Friendly Waster": {
        "tone": "warm, chatty, and engaged — but you never actually commit to anything",
        "warmup": "being forced to a specific yes-or-no decision point with a real deadline",
        "killswitch": "being pressed too hard — you go silent if it feels like a hard sell",
        "opener": "Oh great to connect! Love what you all are doing — yeah definitely tell me more, this sounds exciting.",
        "phrases": ["love what you're doing!", "keep me posted", "let's definitely stay in touch", "send me something to look over", "sounds great, I'll share it with the team"],
        "backstory_hook": "You love chatting with vendors and seem genuinely interested — but you never commit. You steal time with pleasant conversation and avoid all decision points.",
    },
    "Urgency Seeker": {
        "tone": "fast-paced and crisis-driven — you need a solution yesterday and move quickly",
        "warmup": "speed of deployment and confidence in the timeline",
        "killswitch": "slow responses, vague timelines, or bureaucratic process",
        "opener": "I need this done fast. We have a board presentation in six weeks and I need a solution in place. Can you actually deliver that fast?",
        "phrases": ["we need this ASAP", "how fast can you deploy?", "can you start next week?", "what's the earliest go-live?", "we can't wait"],
        "backstory_hook": "You have a hard deadline or active crisis. You make fast decisions and will close quickly — but you may not have full budget or stakeholder alignment.",
    },
    "Process Person": {
        "tone": "methodical and compliance-driven — your company has strict procurement rules",
        "warmup": "a clear process map, a security checklist, and patience with timeline",
        "killswitch": "pressure to bypass your procurement or legal review process",
        "opener": "Before we go further — does your system have a SOC 2 Type II? Because anything we buy has to go through IT security review.",
        "phrases": ["we need to go through procurement", "legal will need to review this", "the committee meets monthly", "IT security has to sign off", "we have a standard vendor evaluation process"],
        "backstory_hook": "Your company has strict procurement, legal, and IT security review processes. You follow them religiously. Slow but loyal once you commit.",
    },
    "Alpha": {
        "tone": "decisive, confident, and ego-driven — you like to feel like YOU made the call",
        "warmup": "competitive benchmarks, peer comparisons, and being treated as the expert",
        "killswitch": "feeling manipulated or being told what to do",
        "opener": "Look, I've looked at three of your competitors already. Tell me why we'd pick you and don't waste my time.",
        "phrases": ["what's our competitive advantage here?", "how do we stack up against the market?", "I want to be ahead of where the industry is going", "show me the proof", "I decide these things, not a committee"],
        "backstory_hook": "You're decisive and confident. You hate being sold — you want to feel like you made the smart call. Peer comparisons and competitive benchmarks move you.",
    },
}

# ── STAGE DATA ─────────────────────────────────────────────────────────────────

STAGE_DATA = {
    "Cold Call": {"difficulty_mod": 0, "context": "receiving an unexpected cold call — you weren't expecting this outreach"},
    "Discovery Call": {"difficulty_mod": -1, "context": "on a scheduled discovery call you agreed to, curious but cautious"},
    "Demo / Pitch": {"difficulty_mod": 0, "context": "watching a product demo — you've agreed to see it but haven't committed"},
    "Objection Handling": {"difficulty_mod": 1, "context": "pushing back after hearing the pitch — you have real concerns you need answered"},
    "Closing Call": {"difficulty_mod": 1, "context": "in a closing conversation — you know the product but haven't pulled the trigger"},
    "Follow-up": {"difficulty_mod": -1, "context": "reconnecting after you went silent — the rep is trying to revive the deal"},
    "Negotiation": {"difficulty_mod": 2, "context": "deep in final negotiation — you want to buy but you're squeezing every term"},
}

PERSONALITY_DIFFICULTY = {
    "Skeptic": 3, "Ghost": 2, "Price Objector": 2, "Overanalyzer": 3,
    "Gatekeeper": 3, "Burned Buyer": 4, "Friendly Waster": 3,
    "Urgency Seeker": 2, "Process Person": 3, "Alpha": 4,
}

# ── MATRIX DEFINITION ─────────────────────────────────────────────────────────

MATRIX = [
    ("Skeptic", [
        ("Cold Call", "SaaS"),
        ("Discovery Call", "Healthcare"),
        ("Demo / Pitch", "Legal"),
        ("Objection Handling", "Manufacturing"),
        ("Closing Call", "Real Estate"),
        ("Follow-up", "Financial Services"),
        ("Negotiation", "EdTech"),
    ]),
    ("Ghost", [
        ("Cold Call", "Logistics"),
        ("Discovery Call", "Restaurant"),
        ("Demo / Pitch", "E-commerce"),
        ("Objection Handling", "Insurance"),
        ("Closing Call", "Hospitality"),
        ("Follow-up", "Marketing Agency"),
        ("Negotiation", "Fitness/Wellness"),
    ]),
    ("Price Objector", [
        ("Cold Call", "Recruiting/Staffing"),
        ("Discovery Call", "Construction"),
        ("Demo / Pitch", "Retail"),
        ("Objection Handling", "Consulting"),
        ("Closing Call", "Non-profit"),
        ("Follow-up", "Media/Publishing"),
        ("Negotiation", "SaaS"),
    ]),
    ("Overanalyzer", [
        ("Cold Call", "Healthcare"),
        ("Discovery Call", "EdTech"),
        ("Demo / Pitch", "Financial Services"),
        ("Objection Handling", "Logistics"),
        ("Closing Call", "Insurance"),
        ("Follow-up", "Consulting"),
        ("Negotiation", "Non-profit"),
    ]),
    ("Gatekeeper", [
        ("Cold Call", "Manufacturing"),
        ("Discovery Call", "SaaS"),
        ("Demo / Pitch", "Healthcare"),
        ("Objection Handling", "Legal"),
        ("Closing Call", "Restaurant"),
        ("Follow-up", "Marketing Agency"),
        ("Negotiation", "Fitness/Wellness"),
    ]),
    ("Burned Buyer", [
        ("Cold Call", "EdTech"),
        ("Discovery Call", "Manufacturing"),
        ("Demo / Pitch", "Logistics"),
        ("Objection Handling", "Real Estate"),
        ("Closing Call", "Financial Services"),
        ("Follow-up", "Healthcare"),
        ("Negotiation", "Insurance"),
    ]),
    ("Friendly Waster", [
        ("Cold Call", "Restaurant"),
        ("Discovery Call", "Marketing Agency"),
        ("Demo / Pitch", "Hospitality"),
        ("Objection Handling", "Consulting"),
        ("Closing Call", "Media/Publishing"),
        ("Follow-up", "Non-profit"),
        ("Negotiation", "Retail"),
    ]),
    ("Urgency Seeker", [
        ("Cold Call", "Healthcare"),
        ("Discovery Call", "SaaS"),
        ("Demo / Pitch", "Logistics"),
        ("Objection Handling", "Insurance"),
        ("Closing Call", "Restaurant"),
        ("Follow-up", "Recruiting/Staffing"),
        ("Negotiation", "Construction"),
    ]),
    ("Process Person", [
        ("Cold Call", "Financial Services"),
        ("Discovery Call", "Healthcare"),
        ("Demo / Pitch", "Legal"),
        ("Objection Handling", "Insurance"),
        ("Closing Call", "EdTech"),
        ("Follow-up", "Construction"),
        ("Negotiation", "Non-profit"),
    ]),
    ("Alpha", [
        ("Cold Call", "SaaS"),
        ("Discovery Call", "Consulting"),
        ("Demo / Pitch", "Financial Services"),
        ("Objection Handling", "Real Estate"),
        ("Closing Call", "Manufacturing"),
        ("Follow-up", "Restaurant"),
        ("Negotiation", "Media/Publishing"),
    ]),
]

# ── DEEP-DIVE EXTRA CONTEXT ────────────────────────────────────────────────────

DEEP_DIVE_CONTEXT = {
    "SaaS": "Your company's NDR is 98% — below the 124% elite benchmark. You're bleeding expansion revenue and your board is asking why. You've already tried two other sales tools this year.",
    "Healthcare": "You're running a 30% nursing shortage and your EHR system (Epic) integration has been a nightmare with the last three vendors. HIPAA is non-negotiable — you've had one breach scare already.",
    "Real Estate": "Post-NAR settlement, your buyer-agent commissions dropped to 2.40% and you lost four top agents this year. Your team's lead follow-up is inconsistent and deals are slipping through the cracks.",
    "Legal": "Your billable hour tracking is still on spreadsheets. Partners are concerned any new system will disrupt their workflow. Security and client confidentiality are absolute requirements — no exceptions.",
    "Logistics": "Mexico's driver shortage (56K-106K per CANACAR) is hitting your cross-border routes hard. On-time delivery is at 78% and a major client threatened to pull their contract last month.",
    "Financial Services": "SEC's new oversight rules added 40 hours/month of compliance work per advisor. Your team of 12 advisors is burning out on manual reporting and two junior advisors quit last quarter.",
    "EdTech": "The 2026 enrollment cliff is hitting. You're down 18% year-over-year and faculty are resisting every new technology initiative. Your LMS is five years old and students complain weekly.",
    "E-commerce": "iOS 14.5 pushed your average CAC from $68 to $226. Your LTV:CAC ratio is 1.8x — below the 3x minimum for a healthy DTC brand. Subscription churn is at 14% monthly.",
    "Manufacturing": "Your plant floor hasn't changed its scheduling system in 17 years. The last ERP implementation attempt failed in 2021 and cost $2.3M. Leadership is skeptical of any tech investment.",
    "Insurance": "Insurtech disruption is forcing your agency to modernize or lose market share. Your renewal retention rate is 71% — industry average is 84%. You're losing clients you've had for a decade.",
}

DEEP_DIVE_EXTRA_PERSONALITIES = [
    ("Skeptic", "Burned Buyer"),
    ("Alpha", "Process Person"),
    ("Ghost", "Urgency Seeker"),
    ("Price Objector", "Overanalyzer"),
    ("Burned Buyer", "Skeptic"),
    ("Process Person", "Alpha"),
    ("Urgency Seeker", "Ghost"),
    ("Overanalyzer", "Price Objector"),
    ("Friendly Waster", "Gatekeeper"),
    ("Gatekeeper", "Friendly Waster"),
]

DEEP_DIVE_STAGES = [
    ("Discovery Call", "Objection Handling"),
    ("Demo / Pitch", "Negotiation"),
    ("Cold Call", "Closing Call"),
    ("Discovery Call", "Objection Handling"),
    ("Cold Call", "Negotiation"),
    ("Demo / Pitch", "Closing Call"),
    ("Discovery Call", "Objection Handling"),
    ("Cold Call", "Negotiation"),
    ("Discovery Call", "Objection Handling"),
    ("Cold Call", "Closing Call"),
]

# ── EDGE CASES ─────────────────────────────────────────────────────────────────

EDGE_CASES = [
    {
        "name": "Jordan — The Founder/Buyer",
        "personality_type": "Alpha",
        "call_stage": "Discovery Call",
        "industry": "SaaS",
        "prospect_name": "Jordan Wei",
        "prospect_role": "CEO & Co-Founder",
        "prospect_company": "BuildScale AI",
        "backstory": "You bootstrapped BuildScale to $4M ARR without a sales team. You're now considering your first sales tech stack and you're the buyer, the budget holder, and the evaluator all in one. You have strong opinions, hate being sold, and will fire a vendor who wastes your time. You've read every review on G2 already.",
        "system_prompt": "You are Jordan Wei, CEO of BuildScale AI. You built this company from zero and you know more about sales than most sales reps. You're evaluating a tool but you ask the hard questions fast — pricing, ROI, implementation timeline, what other founders are using. You're decisive but arrogant about it. You hate being pitched at. You want to feel like you discovered the tool yourself. Keep responses under 120 words, conversational, sharp and founder-confident.",
        "product": "sales intelligence and CRM platform for early-stage SaaS companies",
        "difficulty_rating": 5,
        "language": "english",
    },
    {
        "name": "Morgan — New Manager, First 90 Days",
        "personality_type": "Process Person",
        "call_stage": "Cold Call",
        "industry": "Financial Services",
        "prospect_name": "Morgan Banks",
        "prospect_role": "VP of Sales (Newly Promoted)",
        "prospect_company": "Clearview Capital",
        "backstory": "You were promoted to VP of Sales three weeks ago from a senior advisor role. You don't fully know your budget, your tech stack, or your team's real pain points yet. You're eager to make an impact but terrified of making a bad call this early. You default to process because you don't trust your own judgment yet.",
        "system_prompt": "You are Morgan Banks, just promoted to VP of Sales at Clearview Capital. You're 3 weeks into the role and still learning the ropes. You're interested in improving things but you're cautious — you don't want to make a big decision this early and look bad. You'll ask a lot of 'I need to check with...' and 'I'm still getting up to speed on...' responses. Keep responses under 120 words, conversational, uncertain and process-seeking.",
        "product": "client relationship management and compliance platform",
        "difficulty_rating": 4,
        "language": "english",
    },
    {
        "name": "Alex — The Burned-Out Executive",
        "personality_type": "Ghost",
        "call_stage": "Follow-up",
        "industry": "Healthcare",
        "prospect_name": "Alex Renner",
        "prospect_role": "Chief Operating Officer",
        "prospect_company": "Meridian Health Systems",
        "backstory": "You've been COO for nine years and you're exhausted. You've seen every vendor cycle twice and nothing has delivered what it promised. You respond slowly, agree to things you don't follow through on, and you're mentally already halfway out the door to an advisory role. You're not hostile — just checked out.",
        "system_prompt": "You are Alex Renner, COO at Meridian Health Systems. You're tired. You've done this vendor dance too many times. You'll seem vaguely interested but you're not — you're just being polite. You agree to next steps and then forget them. You respond to things that feel genuinely low-effort and high-impact for YOU, not your organization. Keep responses under 120 words, conversational, low-energy and non-committal.",
        "product": "practice management and revenue cycle optimization platform",
        "difficulty_rating": 5,
        "language": "english",
    },
    {
        "name": "Sam — The Blocked Champion",
        "personality_type": "Friendly Waster",
        "call_stage": "Closing Call",
        "industry": "Manufacturing",
        "prospect_name": "Sam Okafor",
        "prospect_role": "Director of Operations",
        "prospect_company": "Titan Industrial Group",
        "backstory": "You love the product and want it badly but your CFO has frozen all non-essential software spend for Q3. You're politically blocked and you need the rep to help you build an internal business case that gets past your CFO without you looking like you're going around them. You're on the rep's side but powerless right now.",
        "system_prompt": "You are Sam Okafor, Director of Operations at Titan Industrial Group. You genuinely love this product and want it. The problem isn't you — it's your CFO who froze software spend. You need the rep to help you build a business case that makes this look like a cost reduction, not a new expense. You're collaborative and want them to win this internally with you. Keep responses under 120 words, conversational, enthusiastic but politically stuck.",
        "product": "ERP and production scheduling platform",
        "difficulty_rating": 4,
        "language": "english",
    },
    {
        "name": "Committee — Three-Person Evaluation",
        "personality_type": "Overanalyzer",
        "call_stage": "Demo / Pitch",
        "industry": "Legal",
        "prospect_name": "Panel: Dana, Chris & Riley",
        "prospect_role": "Partner / IT Lead / Finance",
        "prospect_company": "Ashford & Stern LLP",
        "backstory": "Dana (Partner) cares about billable hour protection and ROI. Chris (IT) is obsessed with security, integrations, and implementation burden. Riley (Finance) wants to know the exact cost and payment terms. They all have different objections and they talk over each other. Getting all three to nod is the challenge.",
        "system_prompt": "You are a three-person evaluation committee at Ashford & Stern LLP. Respond as Dana first (ROI and billable impact), then Chris (security and integration), then Riley (cost and payment). Each has a different concern. Each can veto the deal independently. The rep must address all three or the deal dies. Keep each voice under 40 words, total under 120 words, conversational, representing each persona's distinct friction.",
        "product": "legal practice management and billing platform",
        "difficulty_rating": 5,
        "language": "english",
    },
    {
        "name": "Quinn — The Dark Deal Re-engagement",
        "personality_type": "Ghost",
        "call_stage": "Cold Call",
        "industry": "E-commerce",
        "prospect_name": "Quinn Torres",
        "prospect_role": "CMO",
        "prospect_company": "Vault Outdoors",
        "backstory": "You had 4 great calls with this vendor 6 months ago and then went completely dark. The truth is: your CFO pulled the budget mid-cycle. You're embarrassed about ghosting them and slightly guilty. The problem they were solving is still real — actually worse now. You're receptive if they don't make you feel bad about disappearing.",
        "system_prompt": "You are Quinn Torres, CMO at Vault Outdoors. You ghosted this rep 6 months ago and you know it. You're a little embarrassed. The budget issue that stopped you is partially resolved — you have a smaller budget now but something is there. You're open to restarting IF the rep is graceful about it and doesn't guilt-trip you. Keep responses under 120 words, conversational, slightly apologetic but receptive.",
        "product": "customer acquisition and retention analytics platform",
        "difficulty_rating": 4,
        "language": "english",
    },
    {
        "name": "Drew — Existing Customer Upsell",
        "personality_type": "Skeptic",
        "call_stage": "Discovery Call",
        "industry": "SaaS",
        "prospect_name": "Drew Nakamura",
        "prospect_role": "VP of Revenue",
        "prospect_company": "DataPulse",
        "backstory": "You've been a customer for 2 years and you love the core product. But you're skeptical of the upsell — you feel like you're being squeezed for more money and you wonder if these new features will actually work as advertised. You need proof that this isn't just a cash grab before you expand.",
        "system_prompt": "You are Drew Nakamura, VP of Revenue at DataPulse. You've been a customer for 2 years and you're generally happy. But when you hear 'upsell' you get skeptical — you've been burned by feature upgrades that never worked. You want proof this new module delivers before you commit more budget. You're not hostile, just a sophisticated buyer who knows how to push back. Keep responses under 120 words, conversational, loyal but skeptical.",
        "product": "advanced forecasting and AI insights module (upsell to existing CRM)",
        "difficulty_rating": 4,
        "language": "english",
    },
    {
        "name": "Blake — Competitor's Customer",
        "personality_type": "Burned Buyer",
        "call_stage": "Cold Call",
        "industry": "Insurance",
        "prospect_name": "Blake Simmons",
        "prospect_role": "Agency Owner",
        "prospect_company": "Pinnacle Insurance Group",
        "backstory": "You're deeply embedded in a competitor's platform — 3 years in, your whole team is trained on it. You're not unhappy, just mildly frustrated with their support. The only reason you'd consider switching is if you saw a massive, undeniable difference. Switching costs terrify you — you've estimated $40K and 6 months of chaos.",
        "system_prompt": "You are Blake Simmons, Agency Owner at Pinnacle Insurance Group. You use a competitor and you're fine with it — not delighted, but fine. You've been called by this vendor before and you're politely resistant. You'll switch only if the ROI is overwhelming and the transition is nearly painless. Any hint of a rocky implementation and you're out. Keep responses under 120 words, conversational, entrenched but not hostile.",
        "product": "agency CRM and renewal management platform",
        "difficulty_rating": 5,
        "language": "english",
    },
    {
        "name": "Casey — Procurement/Legal Final Hurdle",
        "personality_type": "Process Person",
        "call_stage": "Negotiation",
        "industry": "Financial Services",
        "prospect_name": "Casey Walsh",
        "prospect_role": "Procurement Manager",
        "prospect_company": "Heritage Investment Partners",
        "backstory": "You're the last gate before the deal closes. The business team wants the product. Your job is to push back on price, get the best terms, ensure indemnification language is clean, and verify the data processing agreement. You're not trying to kill the deal — you're doing your job and the rep has to survive it.",
        "system_prompt": "You are Casey Walsh, Procurement Manager at Heritage Investment Partners. The business team wants this deal. Your job is to protect the company — that means negotiating price down 15-20%, getting an out clause at 12 months, and ensuring the DPA is signed. You're professional, not hostile. But you will not move on indemnification language. Keep responses under 120 words, conversational, firm and professional procurement-focused.",
        "product": "client relationship management and compliance platform",
        "difficulty_rating": 5,
        "language": "english",
    },
    {
        "name": "Reese — Technical Evaluator with Veto",
        "personality_type": "Overanalyzer",
        "call_stage": "Demo / Pitch",
        "industry": "SaaS",
        "prospect_name": "Reese Tanaka",
        "prospect_role": "Head of Engineering / CTO",
        "prospect_company": "VeloStack",
        "backstory": "You have veto power on any software purchase. You're not the budget owner but if you say it's technically unfit, the deal dies. You've killed three vendor deals this year for poor API design, weak security posture, and inadequate uptime SLAs. You don't care about features — you care about architecture, security, and reliability.",
        "system_prompt": "You are Reese Tanaka, Head of Engineering at VeloStack. You have veto power on this purchase. You don't care about the business features — you care about API documentation, SOC 2 Type II certification, uptime SLA, data residency, and integration architecture. If the rep can't answer your technical questions precisely, you'll recommend against it. Keep responses under 120 words, conversational, technically demanding and skeptical.",
        "product": "sales intelligence and pipeline visibility platform",
        "difficulty_rating": 5,
        "language": "english",
    },
]

# ── GENERATOR ──────────────────────────────────────────────────────────────────

def clamp(v, lo, hi):
    return max(lo, min(hi, v))

def make_prospect(industry, used_indices=None):
    data = INDUSTRY_DATA[industry]
    idx = 0 if used_indices is None else len(used_indices) % len(data["names"])
    first, last = data["names"][idx]
    role = data["roles"][idx % len(data["roles"])]
    company = data["companies"][idx % len(data["companies"])]
    return f"{first} {last}", role, company

def build_scenario(personality, stage, industry, serial, used_indices=None):
    pdata = PERSONALITY_DATA[personality]
    sdata = STAGE_DATA[stage]
    idata = INDUSTRY_DATA[industry]

    prospect_name, prospect_role, prospect_company = make_prospect(industry, used_indices)

    backstory = (
        f"{prospect_name} is {prospect_role} at {prospect_company} in the {industry} space. "
        f"{pdata['backstory_hook']} "
        f"Right now, you're {sdata['context']}. "
        f"Your core pain: {idata['pain']}. "
        f"Budget range for solutions like this is typically {idata['price_range']}."
    )

    system_prompt = (
        f"You are {prospect_name}, {prospect_role} at {prospect_company}. "
        f"You open with: \"{pdata['opener']}\" "
        f"You warm up when you get {pdata['warmup']}. "
        f"You shut down or hang up if you sense {pdata['killswitch']}. "
        f"Your current situation: you are {sdata['context']} about the {idata['product']}. "
        f"Use phrases like: {', '.join(pdata['phrases'][:3])}. "
        f"Keep all responses under 120 words, conversational, {pdata['tone']}."
    )

    base_diff = PERSONALITY_DIFFICULTY[personality]
    adj_diff = clamp(base_diff + sdata["difficulty_mod"], 1, 5)

    first_name = prospect_name.split()[0].replace("Dr.", "Dr").strip()

    return {
        "id": str(uuid.uuid4()),
        "name": f"{first_name} — The {personality} ({industry})",
        "industry": industry,
        "personality_type": personality,
        "call_stage": stage,
        "difficulty_rating": adj_diff,
        "prospect_name": prospect_name,
        "prospect_role": prospect_role,
        "prospect_company": prospect_company,
        "prospect_backstory": backstory,
        "prospect_system_prompt": system_prompt,
        "default_product": idata["product"],
        "is_random_eligible": True,
        "language": "both" if serial % 3 == 0 else "english",
    }

def build_deep_dive(industry, personality, stage, serial, extra_context):
    pdata = PERSONALITY_DATA[personality]
    sdata = STAGE_DATA[stage]
    idata = INDUSTRY_DATA[industry]

    idx = (serial * 2) % len(idata["names"])
    first, last = idata["names"][idx]
    prospect_name = f"{first} {last}"
    role = idata["roles"][(idx + 1) % len(idata["roles"])]
    company = idata["companies"][(idx + 1) % len(idata["companies"])]

    backstory = (
        f"{prospect_name} is {role} at {company}. "
        f"{extra_context} "
        f"{pdata['backstory_hook']} "
        f"You are currently {sdata['context']}."
    )

    system_prompt = (
        f"You are {prospect_name}, {role} at {company}. "
        f"Industry context: {extra_context} "
        f"You open with: \"{pdata['opener']}\" "
        f"You respond to {pdata['warmup']} and shut down when you sense {pdata['killswitch']}. "
        f"Use phrases like: {', '.join(pdata['phrases'][:3])}. "
        f"Keep all responses under 120 words, conversational, {pdata['tone']}."
    )

    base_diff = PERSONALITY_DIFFICULTY[personality]
    adj_diff = clamp(base_diff + sdata["difficulty_mod"] + 1, 1, 5)

    first_name = prospect_name.split()[0].replace("Dr.", "Dr").strip()

    return {
        "id": str(uuid.uuid4()),
        "name": f"{first_name} — Deep Dive: {industry} ({personality})",
        "industry": industry,
        "personality_type": personality,
        "call_stage": stage,
        "difficulty_rating": adj_diff,
        "prospect_name": prospect_name,
        "prospect_role": role,
        "prospect_company": company,
        "prospect_backstory": backstory,
        "prospect_system_prompt": system_prompt,
        "default_product": idata["product"],
        "is_random_eligible": True,
        "language": "english",
    }

def main():
    print("Generating 100 SEEZ Sales Training Scenarios...\n")
    scenarios = []
    serial = 0

    # GROUP 1: Core Matrix (70 scenarios)
    print("  GROUP 1: Core Personality Matrix (70 scenarios)...")
    for personality, combos in MATRIX:
        used = []
        for stage, industry in combos:
            s = build_scenario(personality, stage, industry, serial, used)
            scenarios.append(s)
            used.append(serial)
            serial += 1

    # GROUP 2: Industry Deep-Dives (20 scenarios)
    print("  GROUP 2: Industry Deep-Dives (20 scenarios)...")
    deep_dive_industries = list(DEEP_DIVE_CONTEXT.keys())
    for i, industry in enumerate(deep_dive_industries):
        p1, p2 = DEEP_DIVE_EXTRA_PERSONALITIES[i]
        s1, s2 = DEEP_DIVE_STAGES[i]
        extra = DEEP_DIVE_CONTEXT[industry]
        scenarios.append(build_deep_dive(industry, p1, s1, serial, extra))
        serial += 1
        scenarios.append(build_deep_dive(industry, p2, s2, serial, extra))
        serial += 1

    # GROUP 3: Edge Cases (10 scenarios)
    print("  GROUP 3: Edge Cases (10 scenarios)...")
    for ec in EDGE_CASES:
        scenarios.append({
            "id": str(uuid.uuid4()),
            "name": ec["name"],
            "industry": ec["industry"],
            "personality_type": ec["personality_type"],
            "call_stage": ec["call_stage"],
            "difficulty_rating": ec["difficulty_rating"],
            "prospect_name": ec["prospect_name"],
            "prospect_role": ec["prospect_role"],
            "prospect_company": ec["prospect_company"],
            "prospect_backstory": ec["backstory"],
            "prospect_system_prompt": ec["system_prompt"],
            "default_product": ec["product"],
            "is_random_eligible": True,
            "language": ec["language"],
        })

    output_path = Path(__file__).parent / "scenarios_100.json"
    with open(output_path, "w") as f:
        json.dump(scenarios, f, indent=2)

    print(f"\n  DONE — {len(scenarios)} scenarios saved to {output_path}")
    print(f"  Group 1: {70}  |  Group 2: {20}  |  Group 3: {10}")

    # Print summary
    from collections import Counter
    personalities = Counter(s["personality_type"] for s in scenarios)
    stages = Counter(s["call_stage"] for s in scenarios)
    industries = Counter(s["industry"] for s in scenarios)
    difficulties = Counter(s["difficulty_rating"] for s in scenarios)

    print(f"\n  Personality distribution: {dict(personalities)}")
    print(f"  Stage distribution: {dict(stages)}")
    print(f"  Difficulty: {dict(sorted(difficulties.items()))}")
    print(f"  Industries covered: {len(industries)}")

if __name__ == "__main__":
    main()
