import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

const C = { style: { maxWidth: 1100, margin: '0 auto', padding: '0 48px' } }

const PERSONALITIES = [
  {
    name: 'The Skeptic',
    line: '"Prove it."',
    preview: 'You\'ve been burned before. Every vendor says the same thing. You ask hard questions, demand data, and hang up on hype. You only warm up when someone gives you a real case study from a company you recognize.',
  },
  {
    name: 'The Ghost',
    line: '"Mm-hmm... sorry, what?"',
    preview: 'You\'re technically on the call but mentally somewhere else. You seem interested and then vanish. You only move when there\'s a hard deadline or someone else is about to take your deal.',
  },
  {
    name: 'The Price Objector',
    line: '"That\'s way more than I expected."',
    preview: 'Price is always your first and last objection, whether or not it\'s the real one. You need ROI math, payment flexibility, and a cost-of-inaction argument before this conversation goes anywhere.',
  },
  {
    name: 'The Alpha',
    line: '"I\'ve already looked at your competitors."',
    preview: 'You\'re decisive, confident, and impossible to push. You want to feel like YOU made the call — not like you were sold to. Competitive benchmarks and peer comparisons are the only things that move you.',
  },
  {
    name: 'The Urgency Seeker',
    line: '"We need this by next Friday. Can you do that?"',
    preview: 'You have a real problem right now. You\'re making a fast decision — but that means you might not have full budget approval or stakeholder alignment. Speed and confidence close this deal.',
  },
  {
    name: 'The Burned Buyer',
    line: '"We tried something like this 18 months ago."',
    preview: 'Your last implementation was a disaster. You\'re overly cautious now. You need extreme specificity, named references from similar companies, and something that sounds nothing like what failed.',
  },
]

const FEATURES = [
  {
    icon: 'mic',
    title: 'Adversarial by design',
    desc: 'AI prospects that interrupt, object, go cold, and push back. Built to expose every gap before a real call does.',
  },
  {
    icon: 'psychology',
    title: 'Precision diagnosis',
    desc: 'Every session scored to the second. What broke, when it broke, and the exact language to fix it next time.',
  },
  {
    icon: 'query_stats',
    title: 'Performance ranking',
    desc: 'Seven mastery tiers. A dynamic rating that moves with every session. Your standing reflects exactly where you are.',
  },
  {
    icon: 'translate',
    title: 'English + Spanish, native',
    desc: 'Every scenario available in both languages. Switch mid-session. Built for bilingual reps and LatAm founders from day one.',
  },
]

export default function Home() {
  const [hoveredPersonality, setHoveredPersonality] = useState(null)
  const active = hoveredPersonality !== null ? PERSONALITIES[hoveredPersonality] : null

  return (
    <div className="bg-[#121414] min-h-screen" style={{ color: '#e2e2e2' }}>

      {/* Nav */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, borderBottom: '1px solid rgba(68,71,72,0.3)',
        backgroundColor: 'var(--bg-nav)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: '#c8c6c5' }}>SEEZ</div>
            <div className="label-caps" style={{ fontSize: 9, color: 'rgba(142,145,146,0.6)', marginTop: 1 }}>ELITE TERMINAL</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to="/login" className="label-caps" style={{ color: '#8e9192', textDecoration: 'none' }}>Log in</Link>
            <Link to="/signup"><Button variant="primary" size="sm">Start free</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 96 }}>
        <div {...C} style={{ ...C.style, textAlign: 'center' }}>

          {/* Bilingual badge — #1 differentiator, moved to hero */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 40 }}>
            <div className="label-caps" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(220,198,98,0.25)', background: 'rgba(220,198,98,0.05)',
              padding: '8px 16px', color: '#dcc662',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>translate</span>
              English + Español — native bilingual
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display" style={{ fontSize: 'clamp(52px, 7vw, 88px)', fontWeight: 600, lineHeight: 1.08, color: '#c8c6c5', marginBottom: 24 }}>
            The AI that hangs up on you.
          </h1>

          {/* Subheadline */}
          <p className="font-display" style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 400, lineHeight: 1.3, color: '#8e9192', maxWidth: 640, margin: '0 auto 16px' }}>
            So real clients don't have to.
          </p>

          <p className="font-mono-data" style={{ fontSize: 13, color: '#dcc662', marginBottom: 24 }}>
            The only sales trainer that drills you in English and Spanish.
          </p>

          <p className="font-mono-data" style={{ fontSize: 13, color: '#8e9192', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.8 }}>
            Practice live voice calls against brutally realistic AI prospects.
            Get destroyed. Get scored. Get better. Track your rank.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Link to="/signup">
              <Button variant="primary" size="xl" style={{ paddingLeft: 48, paddingRight: 48 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mic</span>
                Start practicing free
              </Button>
            </Link>
            <p className="font-mono-data" style={{ fontSize: 10, color: 'rgba(142,145,146,0.6)' }}>3 calls/day free · No credit card needed</p>
          </div>
        </div>
      </section>

      {/* Personalities — clickable with preview */}
      <section style={{ paddingBottom: 96 }}>
        <div {...C}>
          <p className="label-caps" style={{ textAlign: 'center', color: '#8e9192', marginBottom: 32 }}>10 prospect personalities. Hover to see how they think.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {PERSONALITIES.map((p, i) => (
              <div
                key={p.name}
                onMouseEnter={() => setHoveredPersonality(i)}
                onMouseLeave={() => setHoveredPersonality(null)}
                style={{
                  border: `1px solid ${hoveredPersonality === i ? 'rgba(220,198,98,0.35)' : 'rgba(68,71,72,0.3)'}`,
                  background: hoveredPersonality === i ? 'rgba(220,198,98,0.04)' : '#1e2020',
                  padding: '20px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <p className="font-header" style={{ fontSize: 14, fontWeight: 500, color: hoveredPersonality === i ? '#c8c6c5' : '#c8c6c5', marginBottom: 6 }}>{p.name}</p>
                <p className="font-mono-data" style={{ fontSize: 11, color: '#8e9192', fontStyle: 'italic' }}>{p.line}</p>
              </div>
            ))}
          </div>
          {/* Preview panel */}
          <div style={{
            border: '1px solid rgba(68,71,72,0.3)',
            background: '#1e2020',
            padding: '20px 28px',
            minHeight: 64,
            transition: 'all 0.15s ease',
          }}>
            {active ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 4, height: 4, background: '#dcc662', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <p className="label-caps" style={{ color: '#dcc662', fontSize: 9, marginBottom: 8 }}>{active.name.toUpperCase()}</p>
                  <p className="font-mono-data" style={{ fontSize: 12, color: '#8e9192', lineHeight: 1.7 }}>{active.preview}</p>
                </div>
              </div>
            ) : (
              <p className="font-mono-data" style={{ fontSize: 11, color: 'rgba(142,145,146,0.35)', textAlign: 'center', paddingTop: 8 }}>
                Hover a personality to see how they think
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ paddingBottom: 96 }}>
        <div {...C}>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 600, color: '#c8c6c5', textAlign: 'center', marginBottom: 56 }}>Built different.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{ border: '1px solid rgba(68,71,72,0.3)', background: '#1e2020', padding: '36px 32px' }}>
                <div style={{ width: 40, height: 40, border: '1px solid rgba(220,198,98,0.2)', background: 'rgba(220,198,98,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <span className="material-symbols-outlined" style={{ color: '#dcc662' }}>{icon}</span>
                </div>
                <p className="font-header" style={{ fontSize: 15, fontWeight: 500, color: '#c8c6c5', marginBottom: 10 }}>{title}</p>
                <p className="font-mono-data" style={{ fontSize: 12, color: '#8e9192', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section style={{ paddingBottom: 96 }}>
        <div {...C}>
          <div style={{
            border: '1px solid rgba(220,198,98,0.2)',
            background: 'rgba(220,198,98,0.02)',
            padding: '64px 48px',
            textAlign: 'center',
          }}>
            <p className="label-caps" style={{ color: '#dcc662', marginBottom: 16 }}>START TODAY</p>
            <h2 className="font-display" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, color: '#c8c6c5', marginBottom: 16 }}>
              Every rep you skip<br />is a deal you lose.
            </h2>
            <p className="font-mono-data" style={{ fontSize: 12, color: '#8e9192', marginBottom: 36 }}>
              3 free calls per day. No credit card. Start getting reps in right now.
            </p>
            <Link to="/signup">
              <Button variant="primary" size="xl" style={{ paddingLeft: 48, paddingRight: 48 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mic</span>
                Practice your first call free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ paddingBottom: 96 }}>
        <div {...C}>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 600, color: '#c8c6c5', textAlign: 'center', marginBottom: 56 }}>Simple pricing.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 780, margin: '0 auto' }}>
            {/* Free */}
            <div style={{ border: '1px solid rgba(68,71,72,0.3)', background: '#1e2020', padding: '40px 36px' }}>
              <p className="label-caps" style={{ color: '#8e9192', marginBottom: 8 }}>Free</p>
              <p className="font-display" style={{ fontSize: 52, fontWeight: 600, color: '#c8c6c5', lineHeight: 1 }}>$0</p>
              <p className="font-mono-data" style={{ fontSize: 10, color: '#8e9192', marginBottom: 28, marginTop: 6 }}>Forever</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {['3 calls/day', 'Easy + Medium modes', '10 base scenarios', 'Basic scorecard'].map((f) => (
                  <p key={f} className="font-mono-data" style={{ fontSize: 12, color: '#c8c6c5', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#dcc662' }}>—</span>{f}
                  </p>
                ))}
              </div>
              <Link to="/signup"><Button variant="secondary" size="lg" className="w-full">Get started</Button></Link>
            </div>

            {/* Pro */}
            <div style={{ border: '1px solid rgba(220,198,98,0.3)', background: 'rgba(220,198,98,0.02)', padding: '40px 36px', position: 'relative' }}>
              <div className="label-caps" style={{ position: 'absolute', top: 16, right: 16, background: '#dcc662', color: '#393000', padding: '2px 8px', fontSize: 9 }}>PRO</div>
              <p className="label-caps" style={{ color: '#dcc662', marginBottom: 8 }}>SEEZ Pro</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <p className="font-display" style={{ fontSize: 52, fontWeight: 600, color: '#c8c6c5', lineHeight: 1 }}>$29</p>
                <p className="font-mono-data" style={{ fontSize: 13, color: '#8e9192' }}>/mo</p>
              </div>
              <p className="font-mono-data" style={{ fontSize: 10, color: '#8e9192', marginBottom: 28, marginTop: 6 }}>Cancel anytime</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {['Unlimited calls', 'All 3 modes incl. Hard', '100+ scenarios', 'Full psychological analysis', 'ELO ranking system', 'Bilingual EN + ES'].map((f) => (
                  <p key={f} className="font-mono-data" style={{ fontSize: 12, color: '#c8c6c5', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#dcc662' }}>—</span>{f}
                  </p>
                ))}
              </div>
              <Link to="/signup"><Button variant="primary" size="lg" className="w-full">Start free trial</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ paddingBottom: 120 }}>
        <div {...C} style={{ ...C.style, textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 600, color: '#c8c6c5', marginBottom: 16 }}>
            Stop losing deals you should win.
          </h2>
          <p className="font-mono-data" style={{ fontSize: 12, color: '#8e9192', marginBottom: 40 }}>Get reps in. Get better. Start today.</p>
          <Link to="/signup">
            <Button variant="primary" size="xl" style={{ paddingLeft: 48, paddingRight: 48 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mic</span>
              Start your first call
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(68,71,72,0.3)', padding: '32px 0' }}>
        <div {...C} style={{ ...C.style, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 600, color: 'rgba(200,198,197,0.3)' }}>SEEZ</span>
          <p className="font-mono-data" style={{ fontSize: 10, color: 'rgba(142,145,146,0.4)' }}>© 2026 SEEZ</p>
        </div>
      </footer>
    </div>
  )
}
