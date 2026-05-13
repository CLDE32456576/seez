# SEEZ — Technical Architecture
**Version:** 1.0  
**Author:** Diego Torrey  
**Status:** Active

---

## 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        SEEZ PLATFORM                            │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Frontend │    │ Backend  │    │  Voice   │    │   AI     │  │
│  │  React   │◄──►│ FastAPI  │◄──►│  Retell  │◄──►│  Claude  │  │
│  │ Vercel   │    │  DO      │    │   API    │    │   API    │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │               │                                          │
│       │          ┌────┴─────┐    ┌──────────┐    ┌──────────┐  │
│       │          │ Supabase │    │ Pinecone │    │  Stripe  │  │
│       │          │  (DB +   │    │   (KB +  │    │(Payments)│  │
│       └──────────│   Auth)  │    │  Memory) │    │          │  │
│                  └──────────┘    └──────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. TECH STACK

### Frontend
| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | React 18 + Vite | Fast, component-based, you know it |
| Styling | Tailwind CSS | Utility-first, no design system overhead |
| UI Components | shadcn/ui | Clean, accessible, customizable |
| State Management | Zustand | Simpler than Redux, perfect for this scope |
| Routing | React Router v6 | Standard |
| Real-time | Supabase Realtime | Live score updates, call state sync |
| Charts/Stats | Recharts | FIFA card stat visualization |
| Auth | Supabase Auth | Google + email login |
| Hosting | Vercel | Free tier, instant deploy, perfect for React |

### Backend
| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | FastAPI (Python) | You know Python, async support, fast |
| Runtime | Python 3.11+ | Consistent with your existing stack |
| API Style | REST (JSON) | Simple, well-documented, easy to test |
| Hosting | DigitalOcean Droplet | You already have one ($5-10/mo) |
| Process Manager | PM2 or systemd | Keep FastAPI alive 24/7 |
| Reverse Proxy | Nginx | Route traffic, handle SSL |
| SSL | Certbot (Let's Encrypt) | Free SSL |

### Voice Layer
| Component | Technology | Why |
|-----------|-----------|-----|
| Voice Platform | Retell AI | You know it, best pricing, great docs |
| Phone Numbers | Twilio (via Retell) | Integrated through Retell |
| STT | Retell (built-in) | Included in Retell pricing |
| TTS | Retell (built-in) | 11Labs voices included |
| Voice Language | Retell multi-language | EN + ES built-in |

### AI Layer
| Component | Technology | Why |
|-----------|-----------|-----|
| Prospect LLM | Claude Sonnet 4 | Best roleplay quality, realistic personality |
| Eval LLM | Claude Opus 4 | Deeper reasoning for nuanced eval scoring |
| KB Retrieval | Claude + Pinecone | Semantic search over sales knowledge |
| Embedding | OpenAI text-embedding-3-small | Fast, cheap, accurate enough |

### Database
| Component | Technology | Why |
|-----------|-----------|-----|
| Primary DB | Supabase (PostgreSQL) | Auth + DB + Realtime in one |
| File Storage | Supabase Storage | User-uploaded product docs |
| Vector DB | Pinecone | KB storage + semantic search |
| Caching | Redis (future) | Skip for v1 |

### Payments
| Component | Technology | Why |
|-----------|-----------|-----|
| Payments | Stripe | Industry standard, easy integration |
| Subscriptions | Stripe Billing | Handle Pro/Teams tiers |
| Webhooks | FastAPI webhook endpoint | Handle subscription events |

---

## 3. DATABASE SCHEMA (Supabase / PostgreSQL)

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  language TEXT DEFAULT 'english', -- 'english', 'spanish'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'teams'
  subscription_status TEXT DEFAULT 'active'
);
```

### seez_cards (FIFA card stats)
```sql
CREATE TABLE seez_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  -- Six core stats (1-100 each)
  opening_stat INTEGER DEFAULT 50,
  rapport_stat INTEGER DEFAULT 50,
  discovery_stat INTEGER DEFAULT 50,
  objection_stat INTEGER DEFAULT 50,
  closing_stat INTEGER DEFAULT 50,
  adaptability_stat INTEGER DEFAULT 50,
  -- Derived
  overall_rating INTEGER GENERATED ALWAYS AS (
    (opening_stat * 15 + rapport_stat * 15 + discovery_stat * 20 +
     objection_stat * 20 + closing_stat * 20 + adaptability_stat * 10) / 100
  ) STORED,
  -- Ranking
  elo INTEGER DEFAULT 0,
  rank_tier TEXT DEFAULT 'Bronze',
  rank_title TEXT DEFAULT 'Cold Caller',
  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_call_date DATE,
  -- Totals
  total_calls INTEGER DEFAULT 0,
  calls_graded_b_or_above INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### scenarios
```sql
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "María — The Skeptic Dentist"
  industry TEXT NOT NULL,
  personality_type TEXT NOT NULL,
  call_stage TEXT NOT NULL,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  prospect_name TEXT,
  prospect_role TEXT,
  prospect_company TEXT,
  prospect_backstory TEXT,
  prospect_system_prompt TEXT, -- The actual Retell system prompt for this prospect
  default_product TEXT, -- What they're being asked to sell in this scenario
  is_random_eligible BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'both', -- 'english', 'spanish', 'both'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### calls
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  scenario_id UUID REFERENCES scenarios(id),
  mode TEXT NOT NULL, -- 'easy', 'medium', 'hard'
  language TEXT NOT NULL,
  product_sold TEXT, -- What was being sold
  retell_call_id TEXT, -- Retell's call ID for fetching transcript
  -- Call metadata
  duration_seconds INTEGER,
  ended_by TEXT, -- 'user', 'prospect', 'timeout'
  -- Scores (1-100 each)
  score_opening INTEGER,
  score_rapport INTEGER,
  score_discovery INTEGER,
  score_objection INTEGER,
  score_closing INTEGER,
  score_adaptability INTEGER,
  score_overall INTEGER,
  grade TEXT, -- 'A+', 'A', 'B', 'C', 'D', 'F'
  -- Qualitative eval
  strengths JSONB, -- Array of 3 specific strengths
  improvements JSONB, -- Array of 3 specific improvements
  kb_tips_surfaced JSONB, -- Which KB tips were shown
  psychological_insights JSONB, -- Confidence, reciprocity, etc.
  -- Transcript
  transcript TEXT,
  -- Gamification
  elo_change INTEGER, -- +35, -20, etc.
  hints_used INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### kb_entries (Knowledge Base)
```sql
CREATE TABLE kb_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL, -- 2 sentence summary
  full_content TEXT NOT NULL,
  example_script TEXT,
  source TEXT, -- Book/author name (no specific attribution required)
  topic TEXT, -- 'opening', 'rapport', 'discovery', 'objection', 'closing', 'negotiation', 'psychology'
  skill_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  call_stages TEXT[], -- Array of relevant call stages
  industries TEXT[], -- Array of relevant industries
  embedding VECTOR(1536), -- OpenAI embedding for semantic search
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_products (User uploaded products)
```sql
CREATE TABLE user_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  key_value_props TEXT[],
  target_industries TEXT[],
  price_range TEXT,
  raw_file_url TEXT, -- Supabase storage URL
  processed_content TEXT, -- Extracted text from uploaded doc
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### bookmarked_kb (User bookmarks in Learn section)
```sql
CREATE TABLE bookmarked_kb (
  user_id UUID REFERENCES users(id),
  kb_entry_id UUID REFERENCES kb_entries(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, kb_entry_id)
);
```

---

## 4. API ARCHITECTURE (FastAPI)

### Auth
```
POST   /auth/login        → Supabase OAuth redirect
POST   /auth/logout       → Clear session
GET    /auth/me           → Get current user
```

### Scenarios
```
GET    /scenarios         → List all scenarios (filtered by industry/personality/stage)
GET    /scenarios/random  → Get a random scenario (mode-appropriate)
GET    /scenarios/{id}    → Get specific scenario details
POST   /scenarios/custom  → Generate scenario from user's uploaded product
```

### Calls
```
POST   /calls/start       → Initialize call, create Retell call, return call URL
POST   /calls/{id}/end    → End call, trigger eval
GET    /calls/{id}        → Get call details + eval
GET    /calls/history     → Get user's call history (paginated)
POST   /calls/{id}/hints  → Get a hint for current call state
```

### Eval
```
POST   /eval/score        → Run eval on completed call transcript (internal)
GET    /eval/{call_id}    → Get full eval for a call
```

### SEEZ Card
```
GET    /card/{user_id}    → Get user's SEEZ card stats
GET    /card/leaderboard  → Top 100 by ELO (future)
```

### Knowledge Base
```
GET    /kb                → List KB entries (filtered, paginated)
GET    /kb/{id}           → Get specific KB entry
GET    /kb/search         → Semantic search over KB
GET    /kb/recommended    → Get recommended tips based on user's weak stats
POST   /kb/bookmark/{id}  → Bookmark a KB entry
GET    /kb/bookmarked     → Get user's bookmarked tips
```

### Products (User uploads)
```
POST   /products          → Upload a product (multipart form)
GET    /products          → List user's products
DELETE /products/{id}     → Remove a product
```

### Payments (Stripe)
```
POST   /payments/checkout → Create Stripe checkout session
POST   /payments/webhook  → Handle Stripe webhook events
GET    /payments/portal   → Create billing portal session
```

---

## 5. VOICE ARCHITECTURE (Retell)

### How A Call Works

```
1. User clicks "Start Call" in frontend
   ↓
2. Frontend → POST /calls/start → Backend
   ↓
3. Backend creates call record in Supabase
4. Backend fetches scenario system prompt from DB
5. Backend calls Retell API: create_web_call(agent_id, metadata)
   ↓
6. Retell returns: {call_id, access_token}
   ↓
7. Backend returns call credentials to frontend
   ↓
8. Frontend initializes Retell Web SDK with access_token
9. Frontend connects to Retell → call starts immediately
   ↓
10. User speaks → Retell STT → Claude AI Agent (prospect) → Retell TTS → User hears
    ↑___________________________________________________|
    (Real-time bidirectional voice loop)
    ↓
11. User ends call (or prospect ends it in Hard mode)
    ↓
12. Frontend → POST /calls/{id}/end → Backend
    ↓
13. Backend fetches transcript from Retell API
14. Backend sends transcript → Claude Opus (eval) → scores
15. Backend updates: call record, SEEZ card stats, ELO, streak
    ↓
16. Frontend receives eval → renders scorecard
```

### Retell Agent Configuration

**One base agent + scenario injection:**
- SEEZ creates ONE Retell agent
- Before each call, the prospect system prompt is injected dynamically via Retell's `dynamic_variables` feature
- This means no need to create 100 Retell agents — just one agent with variable persona injection

**Prospect System Prompt Template:**
```
You are {{prospect_name}}, {{prospect_role}} at {{prospect_company}}.

PERSONALITY: {{personality_description}}
CALL STAGE: {{call_stage_description}}
INDUSTRY CONTEXT: {{industry_context}}
LANGUAGE: Respond ONLY in {{language}}. Never switch languages.

BEHAVIOR RULES:
- Be realistic. Real prospects are busy, skeptical, and distracted.
- Do NOT make it easy. Push back on weak pitches.
- React to what the rep actually says — don't follow a script.
- Use natural speech: "hmm," "look," pauses, interruptions.
- If the rep rambles for more than 30 seconds, interrupt them.
- HARD MODE ONLY: If the rep fails to engage you within 2 minutes, say "Look, I have to go. Send me an email." and end the call.

PERSONALITY SPECIFICS:
{{personality_specific_instructions}}

NEVER: Break character. Mention you are an AI. Give the rep an easy win they didn't earn.
```

---

## 6. EVAL ARCHITECTURE (Claude as Judge)

### Eval Pipeline
```
Call ends
   ↓
Fetch transcript from Retell API
   ↓
Send to Claude Opus (Eval LLM):
  - Full transcript
  - Scenario context (what they were selling, to who, what stage)
  - Mode (easy/medium/hard)
  - Scoring rubric (6 dimensions)
  ↓
Claude returns structured JSON scores
   ↓
Calculate weighted average → overall score → letter grade
   ↓
Pinecone query: "What KB tips are most relevant to this user's weakest dimensions?"
   ↓
Return: scores + grade + strengths + improvements + KB tips + psychological insights
```

### Eval Prompt (Claude Opus)
```python
EVAL_PROMPT = """
You are an elite sales coach evaluating a practice call transcript.

SCENARIO: {scenario_description}
PRODUCT BEING SOLD: {product}
CALL STAGE: {call_stage}
DIFFICULTY MODE: {mode}

TRANSCRIPT:
{transcript}

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

Respond ONLY with this JSON structure:
{
  "scores": {
    "opening": <1-100>,
    "rapport": <1-100>,
    "discovery": <1-100>,
    "objection": <1-100>,
    "closing": <1-100>,
    "adaptability": <1-100>
  },
  "strengths": [
    "<Specific moment from transcript with timestamp — what they did well and why>",
    "<Second strength>",
    "<Third strength>"
  ],
  "improvements": [
    "<Specific moment from transcript — what failed and the exact alternative they should have said>",
    "<Second improvement>",
    "<Third improvement>"
  ],
  "psychological_insights": {
    "confidence_level": "<low|medium|high> — brief explanation",
    "reciprocity_usage": "<brief observation>",
    "social_proof_deployment": "<brief observation>",
    "loss_aversion_framing": "<brief observation>",
    "empathy_calibration": "<brief observation>",
    "authority_signals": "<brief observation>"
  },
  "coach_note": "<One paragraph. Direct, honest, actionable. Written like a coach who respects the rep enough to be brutally honest.>"
}
"""
```

---

## 7. KNOWLEDGE BASE ARCHITECTURE (Pinecone)

### KB Vector Store
- Index: `seez-kb`
- Dimensions: 1536 (OpenAI text-embedding-3-small)
- Metric: cosine similarity
- Namespaces: `tips`, `scripts`, `frameworks`

### KB Entry Structure (stored in Pinecone metadata)
```json
{
  "id": "kb_001",
  "title": "The Power of the Pause",
  "topic": "discovery",
  "skill_level": "intermediate",
  "call_stages": ["discovery", "objection"],
  "summary": "Silence is a tool. Prospects fill silence with information.",
  "full_content": "...",
  "example_script": "Rep: 'What's the biggest challenge you're facing right now?' [pause — say nothing for 5 seconds]. Most reps rush to fill silence. Don't. The prospect will tell you everything.",
  "source_category": "negotiation_psychology"
}
```

### KB Retrieval During Call (Hint Button)
```python
def get_contextual_hint(recent_conversation: str, scenario: dict) -> dict:
    # Embed the last 3 exchanges of conversation
    embedding = embed(recent_conversation)
    
    # Query Pinecone for most relevant tip
    results = pinecone_index.query(
        vector=embedding,
        top_k=3,
        filter={
            "call_stages": {"$in": [scenario["call_stage"]]},
        }
    )
    
    # Return the most relevant KB entry
    return results[0]
```

---

## 8. SEEZ CARD STAT CALCULATION

Stats are rolling weighted averages, not instant snapshots:

```python
def update_stat(current_stat: int, new_score: int, total_calls: int) -> int:
    """
    Weighted average: recent calls weighted more heavily.
    This means one bad call doesn't tank you, but patterns show.
    """
    weight_recent = 0.3  # New call weighted at 30%
    weight_history = 0.7  # History weighted at 70%
    
    new_stat = (current_stat * weight_history) + (new_score * weight_recent)
    return round(new_stat)
```

Overall Rating (OVR) Calculation:
```python
def calculate_ovr(stats: dict) -> int:
    return round(
        stats['opening'] * 0.15 +
        stats['rapport'] * 0.15 +
        stats['discovery'] * 0.20 +
        stats['objection'] * 0.20 +
        stats['closing'] * 0.20 +
        stats['adaptability'] * 0.10
    )
```

---

## 9. FRONTEND COMPONENT ARCHITECTURE

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   ├── seez-card/
│   │   ├── SeezCard.jsx          # The FIFA card component
│   │   ├── StatHexagon.jsx       # Radar/hexagon chart
│   │   └── RankBadge.jsx         # Rank tier badge
│   ├── call/
│   │   ├── PreCallScreen.jsx     # Prospect card + prep timer
│   │   ├── ActiveCall.jsx        # Live call UI
│   │   ├── HintButton.jsx        # Hint overlay
│   │   └── CallTimer.jsx
│   ├── eval/
│   │   ├── Scorecard.jsx         # Full post-call eval
│   │   ├── StatBar.jsx           # Individual stat visualization
│   │   └── KbTip.jsx             # KB tip card in eval
│   ├── scenarios/
│   │   ├── ScenarioCard.jsx      # Individual scenario card
│   │   ├── ScenarioPicker.jsx    # Browse/random mode
│   │   └── ProspectCard.jsx      # Full prospect info card
│   └── learn/
│       ├── KbBrowser.jsx         # Browse knowledge base
│       ├── KbEntry.jsx           # Individual KB article
│       └── KbSearch.jsx
├── pages/
│   ├── Home.jsx                  # Landing page
│   ├── Dashboard.jsx             # User home (card + stats + streak)
│   ├── Practice.jsx              # Scenario selection → call flow
│   ├── CallActive.jsx            # Full-screen call page
│   ├── Eval.jsx                  # Post-call scorecard page
│   ├── History.jsx               # Call history
│   ├── Learn.jsx                 # KB browser
│   ├── Leaderboard.jsx           # Rankings (future)
│   └── Settings.jsx              # Profile, language, subscription
├── hooks/
│   ├── useRetell.js              # Retell SDK integration
│   ├── useCall.js                # Call state management
│   └── useSeezCard.js            # Card stat updates
├── stores/
│   ├── authStore.js              # Zustand auth state
│   ├── callStore.js              # Active call state
│   └── userStore.js              # User data + card
└── lib/
    ├── supabase.js               # Supabase client
    ├── retell.js                 # Retell client
    └── api.js                    # API request helpers
```

---

## 10. HOSTING & INFRASTRUCTURE

```
Domain: seez.ai (or seez.co)
   ↓
Frontend: Vercel (free tier)
  - seez.ai → Vercel
  - Auto-deploy from GitHub main branch
  - Environment variables in Vercel dashboard
   ↓
Backend: DigitalOcean Droplet ($6/mo)
  - api.seez.ai → Nginx → FastAPI (port 8000)
  - SSL via Certbot
  - PM2 for process management
  - Same droplet as your existing Sofia deployment (split by port)
   ↓
Database: Supabase (free tier → $25/mo when needed)
  - PostgreSQL
  - Row Level Security (RLS) for user data isolation
   ↓
Vector DB: Pinecone (free tier → $70/mo Starter when needed)
  - seez-kb index
   ↓
Voice: Retell AI (pay per minute)
  - ~$0.07-0.15/min depending on voice model
   ↓
AI: Anthropic API (pay per token)
  - Claude Sonnet 4 for prospects (~$0.003/call)
  - Claude Opus 4 for eval (~$0.01/call)
  - Total AI cost: ~$0.02-0.05 per complete call
   ↓
Payments: Stripe
  - Webhook endpoint on DigitalOcean backend
```

### Cost Per User Per Month (Estimate)
- Free user (3 calls/day × 30 days = 90 calls): ~$4.50 in infra costs
- Pro user (unlimited, avg 5 calls/day × 30 = 150 calls): ~$7.50 in infra costs
- At $29/mo Pro: 74% gross margin per Pro user

---

## 11. SECURITY

- All API endpoints require JWT (Supabase auth token)
- Row Level Security on all Supabase tables (users only see their own data)
- API keys stored in environment variables (never in code)
- Retell call recordings: automatically deleted after eval processing
- Transcripts stored in Supabase (user can delete)
- Stripe webhooks verified with webhook signature
- Rate limiting on /calls/start endpoint (prevent abuse)
