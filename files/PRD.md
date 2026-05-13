# SEEZ — Product Requirements Document
**Version:** 1.0  
**Author:** Diego Torrey  
**Status:** Active  
**Last Updated:** May 2026

---

## 1. OVERVIEW

### What Is SEEZ?
SEEZ is an AI-powered bilingual sales training platform where users practice live voice sales calls against realistic AI prospects, receive deep post-call evaluations, and track their progression through a gamified ranking system.

### The One-Line Pitch
> "The gym for your sales muscle. Practice real calls. Get destroyed. Get better."

### The Problem
Every founder, SDR, and sales rep knows they need reps. But:
- Real prospects are precious (you can't burn them on practice)
- Human roleplay partners are lazy, too nice, or unavailable
- Existing tools are English-only, enterprise-priced, and boring
- Nobody built this for LatAm founders and bilingual reps

### The Solution
SEEZ gives you an infinitely available, brutally realistic AI prospect that pushes back, interrupts, goes cold, objects hard, and ends the call if you're bad — then tells you exactly why, in language a 19-year-old understands, not a McKinsey consultant.

---

## 2. TARGET USERS

### Primary ICP (Who SEEZ is built for)
- **Solo founders** who need to sell but are scared to
- **SDRs and AEs** at early-stage startups
- **LatAm sales reps** selling to US clients (bilingual need)
- **Anyone learning sales from scratch** (students, career switchers)

### Secondary ICP (Future)
- Sales teams (5-20 reps) wanting scalable practice
- Sales bootcamps and training programs
- B-school and university programs (Tec de Monterrey)

### Who SEEZ is NOT for
- Enterprise (1000+ seat) companies → Hyperbound owns that
- Non-sales professionals → wrong product
- People who just want to watch sales videos → Coursera exists

---

## 3. CORE PRODUCT PHILOSOPHY

1. **Reps > Theory.** Every feature should create more calls, not fewer.
2. **Addictive > Comprehensive.** Better to do 3 calls/day consistently than 1 exhaustive session/week.
3. **Brutal > Friendly.** The AI prospect should never be too nice. Real prospects aren't.
4. **Progression must feel real.** Stats move. Rank changes. Cards update. Every call matters.
5. **Bilingual is the moat.** English and Spanish must be first-class citizens, not afterthoughts.

---

## 4. MODES

Three difficulty modes that govern the entire experience:

### 🟢 EASY MODE
- **Pre-call:** Full prospect card + complete pitch given to user + 90 second prep timer
- **During call:** Unlimited hint button (hints drawn from KB)
- **Prospect behavior:** Warm, answers questions, gives you chances to recover
- **Post-call eval:** Full breakdown + step-by-step coaching
- **ELO impact:** Standard

### 🟡 MEDIUM MODE
- **Pre-call:** Prospect card + 3 suggested talking points + 60 second prep timer
- **During call:** Max 3 hint button uses per call
- **Prospect behavior:** Neutral, realistic objections, occasionally impatient
- **Post-call eval:** Full breakdown + coaching
- **ELO impact:** 1.25x multiplier

### 🔴 HARD MODE
- **Pre-call:** Prospect card only + 45 second prep timer. No pitch given. Figure it out.
- **During call:** Zero hints. You're on your own.
- **Prospect behavior:** Hostile by default, interrupts, challenges your credibility, can end call early
- **Post-call eval:** Full breakdown (no hand-holding in tone)
- **ELO impact:** 1.5x multiplier

---

## 5. SCENARIO SYSTEM

### Three Dimensions (Infinite Combinations)

**Dimension 1: Industry (20 categories)**
- Healthcare (dental, med spa, clinics)
- Real Estate (residential, commercial, border)
- SaaS / Tech
- Restaurants & F&B
- Legal / Law Firms
- Logistics / Supply Chain
- Financial Services
- Education / EdTech
- E-commerce
- Manufacturing
- Marketing Agencies
- Recruiting / HR
- Construction
- Insurance
- Hospitality
- Fitness / Wellness
- Retail
- Consulting
- Media / Content
- Non-profit

**Dimension 2: Prospect Personality (10 archetypes)**
- 🔴 **The Skeptic** — Doesn't believe you. Questions everything. "Prove it."
- 💤 **The Ghost** — Distracted, half-listening, wants to hang up.
- 💰 **The Price Objector** — "Too expensive." Everything circles back to cost.
- 🧠 **The Overanalyzer** — Needs data for every claim. "Can you send me a report?"
- 😤 **The Gatekeeper** — Isn't the decision maker, won't connect you to them.
- 😤 **The Burned Buyer** — Bad experience with a competitor. Defensive from the start.
- 🤝 **The Friendly Waster** — Nice, asks questions, never buys. Classic time sink.
- ⚡ **The Urgency Seeker** — Has a real problem RIGHT NOW. High intent but high pressure.
- 📋 **The Process Person** — Everything needs to go through "the process." Slow.
- 🏆 **The Alpha** — Needs to feel like they're winning. Ego is part of the deal.

**Dimension 3: Call Stage / Type (7 stages)**
- **Cold Call** — First contact. You have 30 seconds before they hang up.
- **Discovery Call** — They agreed to talk. Find the pain. Qualify.
- **Demo / Pitch** — Present your solution. Make it land.
- **Objection Handling** — They've heard the pitch. Now they're pushing back.
- **Closing Call** — They're interested. Get the yes. Negotiate if needed.
- **Follow-up** — They went cold. Reignite the conversation.
- **Negotiation** — Price, terms, contract. Don't leave money on the table.

### Scenario Generation
- **Random mode:** SEEZ picks Industry + Personality + Call Stage randomly
- **Curated mode:** User picks any combination of the 3 dimensions
- **Scenario cards:** 100 pre-built named scenarios (e.g., "María — The Skeptic Dentist on a Cold Call")
- Each scenario card includes: prospect name, photo (AI generated), industry, personality type, call stage, difficulty rating

### The Product Being Sold
- **Random (default):** SEEZ assigns a contextually appropriate product to sell (dental clinic → cleaning service upgrade; real estate firm → CRM software)
- **User upload:** User uploads their own product one-pager / pitch deck / description → SEEZ generates matching scenarios against relevant prospect types
- Products are always contextually logical. A SaaS product is never randomly sold to a construction worker with no tech context.

---

## 6. THE CALL EXPERIENCE

### Pre-Call Screen
- Prospect card (name, photo, role, company, personality badge, call stage badge)
- Mode indicator (Easy/Medium/Hard)
- Product being sold (description + 1 key value prop)
- Prep timer countdown (90s/60s/45s depending on mode)
- Easy: Full pitch suggestion shown below card
- Medium: 3 talking point bullets shown
- Hard: Nothing. Just the card. Good luck.

### During Call
- Full-screen clean interface (minimal distraction)
- Live call waveform (visual feedback you're connected)
- Call timer
- Hint button (Easy: unlimited | Medium: max 3, counter visible | Hard: hidden/locked)
- Hints surface as floating cards: pulled from the KB, contextually relevant to what was just said
- End call button (you can choose to end, or prospect may end it on Hard mode)

### AI Prospect Behavior
- Speaks first (answers the call like a real person)
- Reacts realistically to what you say (not scripted responses)
- Interrupts when you ramble for more than 30 seconds
- Uses realistic speech patterns (pauses, "hmm," "look," "I don't know," "send me an email")
- Hard mode: can say "I have to go" and end the call if you fail to engage within 2 minutes
- Never breaks character unless user says "SEEZ stop" (escape command)
- Bilingual: responds in the language the user selected pre-call

---

## 7. POST-CALL EVALUATION

### The Scorecard

**6 Core Dimensions (mapped to SEEZ card stats):**

| Stat | Full Name | Weight | What It Measures |
|------|-----------|--------|-----------------|
| **OPN** | Opening | 15% | Did you hook them in the first 30 seconds? |
| **RAP** | Rapport | 15% | Did you build genuine connection? |
| **DIS** | Discovery | 20% | Did you ask the right questions and listen? |
| **OBJ** | Objection Handling | 20% | How well did you handle pushback? |
| **CLO** | Closing | 20% | Did you ask for the next step or the close? |
| **ADP** | Adaptability | 10% | Did you adjust when they changed direction? |

**Scoring:**
- Each dimension: 1–100
- Weighted average = Final Score (1–100)
- Letter grade:
  - 90–100 → A+
  - 80–89 → A
  - 70–79 → B
  - 60–69 → C
  - 50–59 → D
  - Below 50 → F

**Psychological Dimensions (qualitative, not scored — surfaced as insights):**
- Confidence level (based on filler words, hesitation patterns, certainty of language)
- Reciprocity usage (did you give before asking?)
- Social proof deployment (did you use it naturally or force it?)
- Loss aversion framing (did you frame around what they'd lose by not acting?)
- Authority signals (did you establish credibility or beg for attention?)
- Empathy calibration (did you acknowledge their situation before pitching?)

**Post-Call Output:**
1. Overall score (numerical + letter)
2. Six stat bars (visual)
3. "What you did well" (3 specific moments with timestamps)
4. "What to fix" (3 specific behaviors with concrete alternatives)
5. KB insights (2-3 relevant tips from the Learn section, surfaced based on your weakest dimension)
6. Transcript (full call transcript with annotations)
7. "Call Again" or "Try Harder Scenario" CTA

---

## 8. GAMIFICATION SYSTEM

### SEEZ Card (FIFA-Style)
Every user has a SEEZ Card — a dynamic stat card that updates after every call.

**Card displays:**
- Username / Avatar
- Current rank badge
- Overall rating (e.g., 73 OVR)
- Six stat hexagon (OPN / RAP / DIS / OBJ / CLO / ADP)
- Total calls completed
- Win rate (% of calls graded B or above)
- Current streak

**Stat evolution:**
- Each call updates the rolling average for each dimension
- Stats only improve through consistent performance (one great call doesn't spike you — 10 great calls do)
- Stats can go down if performance drops

### Ranking System (Clash Royale Style)

| Tier | ELO Range | Title | Badge Color |
|------|-----------|-------|-------------|
| Bronze | 0–999 | Cold Caller | 🥉 Brown |
| Silver | 1000–1999 | Closer in Training | 🥈 Silver |
| Gold | 2000–2999 | Pipeline Builder | 🥇 Gold |
| Platinum | 3000–3999 | Deal Hunter | 💎 Light Blue |
| Diamond | 4000–4999 | Revenue Driver | 💠 Blue |
| Master | 5000–5999 | Top Performer | 🏆 Purple |
| Grandmaster | 6000+ | The Closer | 👑 Red/Black |

**ELO Changes per call:**
| Grade | Easy | Medium | Hard |
|-------|------|--------|------|
| A+ | +45 | +56 | +68 |
| A | +35 | +44 | +53 |
| B | +20 | +25 | +30 |
| C | 0 | 0 | 0 |
| D | -10 | -13 | -15 |
| F | -20 | -25 | -30 |

**Streak system:**
- 3-day streak: 🔥 Small fire badge
- 7-day streak: 🔥🔥 Double fire badge + +10% ELO bonus that week
- 30-day streak: Special card border unlocked
- Break a streak: No penalty, just resets to 0

**Leaderboard (future v2):**
- Global top 100
- Weekly top performers
- Friends leaderboard (invite system)

---

## 9. KNOWLEDGE BASE (THE LEARN SECTION)

### Source Material
Curated from 50+ books, frameworks, and video series:
- Never Split the Difference (Voss)
- The Mom Test (Fitzpatrick)
- Spin Selling (Rackham)
- The Challenger Sale (Dixon & Adamson)
- Gap Selling (Keenan)
- To Sell Is Human (Pink)
- Influence (Cialdini)
- Pre-Suasion (Cialdini)
- The Psychology of Selling (Tracy)
- Fanatical Prospecting (Blount)
- Chris Orlob content (pclub.io)
- Nick Cegelski (30 Minutes to President's Club)
- Alex Hormozi (sales frameworks only, not named)
- Chris Voss masterclass content
- Grant Cardone techniques
- SPIN Selling methodology
- Challenger methodology
- MEDDIC qualification
- Human behavioral psychology (Kahneman, Ariely)

### KB Structure
Organized by:
- **Topic** (Opening / Rapport / Discovery / Objection Handling / Closing / Negotiation / Psychology)
- **Skill level** (Beginner / Intermediate / Advanced)
- **Call stage** (Cold Call / Discovery / Demo / Objection / Close)
- **Industry relevance** (Healthcare / SaaS / Real Estate / etc.)

### KB Surfaces In:
1. **During call (Easy mode):** Hint button pulls contextually relevant KB card
2. **During call (Medium mode):** Hint button (3 uses) pulls relevant KB card
3. **Post-call eval:** 2-3 KB cards surface based on weakest dimensions
4. **Learn Section:** Fully browsable, searchable, filterable KB

### Learn Section UX
- Browse by category
- Search by topic
- "Recommended for you" (based on your weakest stats)
- Each tip: Title + 2-sentence summary + full explanation + example script
- Bookmark tips you want to revisit
- "Practice this tip" → launches a scenario specifically designed to practice that concept

---

## 10. MONETIZATION

### Pricing Tiers (v1 Launch)

**Free Tier:**
- 3 calls/day
- Easy and Medium modes only
- Access to 10 base scenarios
- Basic post-call eval (no psychological insights)
- SEEZ Card (limited stats)
- No KB access (only post-call tip preview)

**SEEZ Pro ($29/month):**
- Unlimited calls
- All 3 modes (including Hard)
- All 100+ scenarios
- Full post-call eval (including psychological insights)
- Full KB access + Learn Section
- SEEZ Card (all 6 stats)
- Full ranking system + ELO
- Streak tracking
- Call history + transcripts
- Product upload (practice selling your own product)
- Bilingual mode (EN/ES/Spanglish)

**SEEZ Teams ($99/month, 5 seats):**
- Everything in Pro
- Team leaderboard
- Manager dashboard (track team call performance)
- Custom scenarios (upload your own prospect types)
- Team SEEZ Cards (compare stats across team)

### Go-To-Market (Content-Led)
- Post on LinkedIn + X: "I got destroyed by an AI prospect. Here's what I learned."
- Demo videos: real calls, real feedback, real improvement
- Build in public (every week, post a clip of a new feature)
- Target: LatAm founder communities, SDR communities, sales Twitter
- NO paid acquisition until 1,000 MAU

---

## 11. SUCCESS METRICS

### Week 4 (MVP Launch)
- ✅ 1 working bilingual call (EN or ES) end-to-end
- ✅ Post-call eval generates accurate scores
- ✅ 5 friends/testers complete a call and give feedback
- ✅ GitHub repo public with documentation

### Month 2 (Product-Market Signal)
- 100 registered users
- 30% DAU/MAU ratio (sticky)
- Average 3+ calls per user per week
- NPS > 40

### Month 3 (Monetization)
- 50 paying Pro users ($1,450/mo MRR)
- 1 Teams customer ($99/mo)
- Total MRR: ~$1,550

### Month 6 (Scale Signal)
- 500 paying Pro users ($14,500/mo MRR)
- Waitlist for Teams plan
- Featured in at least 2 sales communities organically

---

## 12. OUT OF SCOPE (v1)

These are explicitly NOT being built in v1:
- ❌ Mobile app (web-first, mobile browser works)
- ❌ Video/avatar (voice only)
- ❌ Real-time AI coaching during call (only hints in Easy/Medium)
- ❌ CRM integrations
- ❌ API for third-party developers
- ❌ Custom LLM fine-tuning
- ❌ Group/multiplayer calls
- ❌ Certifications/badges (beyond ranking)
