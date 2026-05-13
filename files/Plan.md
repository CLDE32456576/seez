# SEEZ — Build Plan
**Version:** 1.0  
**Total Duration:** 10 Weeks  
**Methodology:** Ship something real every week. No week ends without a deployed change.

---

## PHASES OVERVIEW

| Phase | Weeks | Focus | Deliverable |
|-------|-------|-------|-------------|
| 0 | Pre-Week 1 | Setup & scaffolding | Repos, accounts, env vars |
| 1 | Week 1-2 | Foundation | Auth + basic call loop working |
| 2 | Week 3-4 | Core Product | Full call → eval → SEEZ card |
| 3 | Week 5-6 | Gamification | Rankings, streaks, FIFA card |
| 4 | Week 7-8 | Knowledge Base | Learn section, hints, KB |
| 5 | Week 9-10 | Polish & Launch | Product upload, billing, public launch |

---

## PHASE 0: SETUP (2-3 days before Week 1)

**Goal:** Everything configured so Day 1 Week 1 is pure coding.

### Accounts to create:
- [ ] Supabase project → get URL + anon key
- [ ] Pinecone account → create `seez-kb` index (1536 dimensions, cosine)
- [ ] Retell account → create one base agent
- [ ] Stripe account (test mode for now)
- [ ] Vercel account → connect to GitHub
- [ ] seez.ai domain (or seez.co) → point to Vercel

### Repos to create:
- [ ] `seez-frontend` (React + Vite)
- [ ] `seez-backend` (FastAPI)
- [ ] `seez-kb-builder` (scripts to populate KB)

### Environment variables:
```bash
# Frontend (.env)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://api.seez.ai
VITE_RETELL_API_KEY=

# Backend (.env)
ANTHROPIC_API_KEY=
RETELL_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=seez-kb
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Database setup:
- [ ] Run all CREATE TABLE statements from Architecture.md
- [ ] Enable Row Level Security on all tables
- [ ] Seed 5 test scenarios manually

---

## PHASE 1: FOUNDATION (Weeks 1-2)

### Week 1: Auth + Basic Call Loop
**Goal by Friday:** A logged-in user can start a call and hear a voice respond.

**Monday:**
- Set up React + Vite project structure (from Architecture.md)
- Install dependencies: Tailwind, shadcn/ui, Zustand, React Router, Supabase client
- Build Supabase auth (Google login + email)
- Basic navbar + routing (Home, Dashboard, Practice pages — all mostly empty)

**Tuesday:**
- Set up FastAPI backend on DigitalOcean droplet
- Nginx config + SSL cert (api.seez.ai)
- `/auth/me` endpoint + Supabase JWT verification
- `/scenarios` endpoint (read from DB, return list)

**Wednesday:**
- Build PreCallScreen component (prospect card layout, hard-coded data for now)
- Integrate Retell Web SDK into React
- Build `/calls/start` endpoint (creates Retell web call, returns access token)
- Wire up: button click → hit backend → get Retell token → init Retell SDK → call starts

**Thursday:**
- First real test: click button, call starts, hear Retell speak
- Build basic ActiveCall page (call timer, end button, waveform visual)
- Build `/calls/{id}/end` endpoint (marks call as ended, no eval yet)
- Make sure call ends cleanly

**Friday:**
- Clean up UI (it will be rough, just make it functional)
- Write a hard-coded prospect system prompt for ONE scenario (dental office skeptic)
- Test the full loop: login → see scenario → click start → talk for 60 seconds → end
- Deploy frontend to Vercel
- Write README with current status
- **Ship it publicly, even if it's ugly**

---

### Week 2: Scenario System + Dynamic Prospects
**Goal by Friday:** Scenarios loaded from DB, prospect personality injected dynamically into Retell.

**Monday:**
- Seed 10 real scenarios into Supabase (use the 3-dimension system)
- Build ScenarioPicker component (grid of scenario cards)
- Connect `/scenarios` endpoint to frontend
- Build `scenarios/random` endpoint with filters

**Tuesday:**
- Implement dynamic variable injection into Retell agent (prospect system prompt)
- Test: different scenarios → different AI personalities answering the call
- Verify: The Skeptic feels different from The Urgency Seeker

**Wednesday:**
- Build mode system (Easy/Medium/Hard selector)
- Wire mode to: prep time shown, pitch shown/hidden, hint button visibility
- Prep timer countdown component (90s/60s/45s)

**Thursday:**
- Product system: hard-code 3 contextually matched products per scenario for now
- Wire product display to PreCallScreen (show what's being sold)
- Test end-to-end: random scenario → random product → call starts with right persona

**Friday:**
- Polish scenario cards (prospect photo placeholder, badge system)
- Test with 5 people (Tec friends): have them try 3 different scenarios
- Collect feedback on prospect realism
- Adjust system prompts based on feedback
- Deploy

---

## PHASE 2: CORE PRODUCT (Weeks 3-4)

### Week 3: Eval System
**Goal by Friday:** After every call, a real scorecard appears with scores + feedback.

**Monday:**
- Set up Retell transcript webhook (Retell sends transcript when call ends)
- Build transcript parser (extract clean text from Retell's format)
- Build `/eval/score` endpoint

**Tuesday:**
- Write the eval prompt (from Architecture.md)
- Test eval prompt with Claude Opus on 3 sample transcripts
- Iterate until scores feel accurate (test with known good/bad calls)
- Parse Claude's JSON response

**Wednesday:**
- Build Scorecard component (post-call UI)
  - Overall score + letter grade (big, prominent)
  - Six stat bars with labels
  - Strengths section (3 items)
  - Improvements section (3 items)
  - Coach note

**Thursday:**
- Build psychological insights section in Scorecard
- Wire eval to call flow (call ends → eval runs → scorecard appears)
- Build History page (list of past calls with scores)
- Build individual call detail view

**Friday:**
- Test: complete call → eval → scorecard
- Quality check: do the scores make sense?
- Do the improvements actually help?
- Get feedback from 3 people
- Deploy

---

### Week 4: SEEZ Card + Initial Stats
**Goal by Friday:** SEEZ card exists, updates after every call, shows real stats.

**Monday:**
- Build SEEZ Card component (FIFA card visual)
- Stat hexagon/radar chart using Recharts
- Build SeezCard database logic (create on first call, update after each call)
- Implement rolling weighted average stat calculation

**Tuesday:**
- Wire eval scores → stat updates → card re-renders
- Build the OVR (overall rating) calculation
- Display card on Dashboard page
- Test: complete call → stat changes → card updates

**Wednesday:**
- Build ELO system
- ELO calculation per grade per difficulty mode
- ELO stored in seez_cards table
- Rank tier calculation (Bronze/Silver/Gold etc.)
- Display rank badge on card and dashboard

**Thursday:**
- Build streak system (calls per day tracking, streak counter)
- Streak display on Dashboard
- Handle streak break (no call today → streak resets tomorrow)
- Build call counter + win rate calculation

**Friday:**
- Full loop test: 10 calls across different scenarios
- Does the card feel like it's progressing realistically?
- Does ELO go up when you do well and down when you don't?
- Polish card visual (this is the most shareable UI element — make it beautiful)
- Deploy

---

## PHASE 3: GAMIFICATION (Weeks 5-6)

### Week 5: Full Ranking System
**Goal by Friday:** Rankings feel like a real game progression system.

**Monday:**
- Build rank progression UI (visual tier display with progress bar to next tier)
- Build ELO history chart (Recharts line chart — your ELO over time)
- Build `GET /rank/leaderboard` endpoint (even if only showing self for now)
- Rank badge design for all 7 tiers

**Tuesday:**
- Implement streak bonuses (+10% ELO for 7-day streak week)
- Build streak visual (fire emoji counter, streak calendar)
- Build "New Rank!" celebration modal (triggered when you cross a tier threshold)
- Animations: stat bars fill up, grade appears with animation, ELO counter ticks up

**Wednesday:**
- Build difficulty multiplier logic (1.25x Medium, 1.5x Hard)
- Visual: show expected ELO gain before call starts (based on difficulty)
- Build "Best call ever" detection (personal records)
- Toast notifications for achievements (streak milestone, new rank, personal best)

**Thursday:**
- Build share functionality: "Share my SEEZ card" (generates image/screenshot)
- This is your viral loop. Make it beautiful.
- Card image should show: OVR, rank, top 3 stats, username, SEEZ branding

**Friday:**
- End-to-end gamification test
- Does it feel addictive? Would you want to do one more call?
- Get 5 people to play for 30 minutes and measure: how many calls did they do?
- Deploy

---

### Week 6: Hint System + Mode Polish
**Goal by Friday:** Modes feel genuinely different. Hint button adds real value on Easy.

**Monday:**
- Build Hint button component (floating card over call UI)
- Build `/calls/{id}/hints` endpoint
- Stub KB data (10 hardcoded tips for now — real KB comes in Phase 4)
- Wire: hint button click → hit backend → get relevant tip → display as floating card

**Tuesday:**
- Implement hint limits per mode (unlimited/3/0)
- Hint counter display for Medium mode
- Hard mode: hint button hidden (or locked with lock icon + "Not available on Hard")
- Track hints_used in call record

**Wednesday:**
- Build Hard mode prospect behavior enhancements
  - Interrupt detection (if user rambles > 30 seconds, prospect interrupts)
  - Early hang-up logic (prospect ends call after 2 minutes of weak engagement)
  - Test: intentionally be bad on Hard → verify prospect hangs up

**Thursday:**
- Polish Easy mode: ensure pitch displayed is genuinely helpful
- Polish Medium mode: 3 talking points should be distinct and useful
- Test all 3 modes back-to-back with the same scenario — they should feel completely different

**Friday:**
- Mode comparison test with 5 testers
- Collect: "Which mode was most realistic?" "Which felt most useful?"
- Deploy

---

## PHASE 4: KNOWLEDGE BASE (Weeks 7-8)

### Week 7: KB Build + Learn Section
**Goal by Friday:** Learn section is live with 50+ real tips. Post-call surfaces relevant ones.

**Monday:**
- Build KB content (seez-kb-builder repo)
  - Write/curate 50+ KB entries from sales books and frameworks
  - Structure each: title, summary (2 sentences), full content, example script, metadata
  - Embed using OpenAI text-embedding-3-small
  - Upsert to Pinecone
  - This is your most time-intensive day — expect 6-8 hours

**Tuesday:**
- Build Learn section UI (KbBrowser component)
  - Category filter (opening, rapport, discovery, objection, closing, psychology)
  - Skill level filter
  - Search bar (semantic search via Pinecone)
  - Grid of KB cards

**Wednesday:**
- Build individual KB entry page (full article view)
  - Title, summary, full content, example script
  - "Practice this tip" button → launches scenario specifically designed for this concept
  - Bookmark button → saves to bookmarked_kb

**Thursday:**
- Wire post-call eval to KB (after eval scores computed, query Pinecone for most relevant tips based on weak dimensions)
- Surface 2-3 KB tips at bottom of Scorecard
- Make "Recommended for you" section on Learn page (based on user's weakest stat)

**Friday:**
- Build hint button to use Pinecone instead of hardcoded tips
- Wire: hint button → send last 3 conversation exchanges → Pinecone query → return most relevant tip
- Test: hint tips should feel contextually relevant to what was just said on the call
- Deploy

---

### Week 8: User Product Upload
**Goal by Friday:** User can upload their own product and practice selling it.

**Monday:**
- Build product upload UI (Settings > My Products)
- Build `/products` endpoint (multipart form upload)
- File processing: PDF → extract text via pdfplumber
- Store processed text in Supabase

**Tuesday:**
- Build scenario generation for user products
  - User selects their product + scenario dimensions
  - Backend: take product description → Claude generates custom prospect briefing
  - Generate 5 unique scenarios from one product upload

**Wednesday:**
- Wire product scenarios into the full call flow
- Test: upload a one-pager → see generated scenarios → start call → practice pitching your actual product
- Quality check: does the AI prospect know enough about the domain to be realistic?

**Thursday:**
- Build product management UI (list, activate/deactivate, delete)
- Handle edge cases (bad PDFs, too-large files, unsupported formats)
- Add product info to PreCallScreen (show what you're selling, who you're selling to)

**Friday:**
- Full product upload test: use Sofia's actual pitch materials
- Verify: prospect responds appropriately to Sofia's specific value props
- Polish UX for the upload flow
- Deploy

---

## PHASE 5: POLISH & LAUNCH (Weeks 9-10)

### Week 9: Billing + Pre-Launch
**Goal by Friday:** Stripe integrated, free vs pro gates enforced, waitlist/signup live.

**Monday:**
- Set up Stripe products (Free, Pro $29/mo, Teams $99/mo)
- Build `/payments/checkout` endpoint
- Build upgrade modal (triggered when free user hits limit)
- Implement free tier gates: 3 calls/day, no Hard mode, no KB

**Tuesday:**
- Set up Stripe webhook (handle subscription created/cancelled/failed)
- Update user tier in Supabase on webhook events
- Test: subscribe → verify pro features unlock → cancel → verify gates re-appear

**Wednesday:**
- Build landing page (Home.jsx)
  - Hero: "The gym for your sales muscle"
  - Demo video / GIF of a real call + eval
  - Feature bullets
  - Pricing table
  - CTA: "Start free — 3 calls/day"
- This is your acquisition engine. Make it simple and punchy.

**Thursday:**
- Full product QA pass
  - Test every flow: signup → first call → eval → rank update → hint button → Learn section → upgrade → product upload
  - Fix all broken things
  - Mobile browser test (should be usable if not perfect)

**Friday:**
- Final deploy
- Soft launch to inner circle: 20 people (Tec friends, founders you know)
- Collect: NPS, which feature they used most, what broke
- Post on LinkedIn: "Built an AI sales trainer. Took me 10 weeks. Here's what I learned."

---

### Week 10: Public Launch + Iteration
**Goal by Friday:** 100 signups. First paying user.

**Monday:**
- Process feedback from soft launch
- Fix the top 5 most common issues
- Record demo video: you practicing a brutal cold call → getting destroyed → improving

**Tuesday:**
- LinkedIn post: demo video + behind the scenes build story
- Post on X: same content adapted for X format
- Submit to: Product Hunt (schedule), Hacker News Show HN, LatAm founder communities

**Wednesday:**
- Monitor signups + usage
- Fix anything breaking under real user load
- Respond to every comment and DM personally

**Thursday:**
- Add 20 more KB entries based on what users are asking for
- Add 10 more scenarios based on which industries people are picking most

**Friday:**
- Week 10 review:
  - Total signups
  - DAU
  - Calls completed
  - First paying user?
  - Top requested feature
- Plan Phase 6 based on real user data

---

## DAILY SCHEDULE DURING BUILD

| Time | Block | Activity |
|------|-------|---------|
| 6:00–7:30am | Deep build (1.5hrs) | Hardest problem of the day — before brain gets tired |
| 8:30–2pm | University | |
| 2:30–5:30pm | Deep build (3hrs) | Core coding block |
| 6:00–7:00pm | Cold calls | (Your commitment — 1hr on weekday call windows) |
| 9:00–10:00pm | Light build | Review code, plan tomorrow, fix small bugs |

**Weekends:** 8hr build day Saturday, half day rest Sunday.

---

## DECISION TRIGGERS

| Situation | Action |
|-----------|--------|
| Prospects don't feel realistic | Spend 1 day rewriting system prompts. Test with 10 calls. |
| Eval scores feel random | Add 5 more eval test cases. Tune the prompt. Not the model. |
| Nobody uses Learn section | Integrate hints more prominently into call flow. Move KB into main nav. |
| Free tier → Pro conversion < 5% | Move 1 feature from free to paid, or improve value of pro features. |
| Soft launch NPS < 30 | Delay public launch. Fix the top 3 complaints first. |
| First 100 users, 0 paying | Your free tier is too generous OR your Pro value isn't clear. Audit both. |

---

## WEEK-BY-WEEK SHIP CHECKLIST

Every Friday before you stop coding:
- [ ] What did you ship this week? (1 sentence)
- [ ] Is it deployed? (Must be YES)
- [ ] Did you test it with at least 1 real person? (Must be YES)
- [ ] What's the one thing you'll fix first next week?
- [ ] Cold calls this week: how many? (Non-negotiable)

If the answer to "Is it deployed?" is NO — you don't sleep until it is.
