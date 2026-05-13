import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { api } from '../lib/api'
import { getRankColor, formatDuration } from '../lib/utils'
const EMPTY_CARD = {
  opening_stat: 50, rapport_stat: 50, discovery_stat: 50,
  objection_stat: 50, closing_stat: 50, adaptability_stat: 50,
  overall_rating: 0, elo: 0, rank_tier: 'Grinder', rank_title: 'Just Getting Started',
  current_streak: 0, longest_streak: 0, total_calls: 0, calls_graded_b_or_above: 0,
}

const RANK_TIERS = [
  { tier: 'Grinder',   elo: 0 },
  { tier: 'Hunter',    elo: 1000 },
  { tier: 'Closer',    elo: 2000 },
  { tier: 'Slinger',   elo: 3000 },
  { tier: 'Rainmaker', elo: 4000 },
  { tier: 'Wolf',      elo: 5000 },
  { tier: 'The Don',   elo: 6000 },
]

const TIER_STANDING = {
  Grinder:   "You're putting in the reps. The grind is how it starts.",
  Hunter:    "Solid foundation. You're finding your prey.",
  Closer:    "You're outperforming 70% of reps. Slinger is within reach.",
  Slinger:   "Top 15% of closers. You're a deal machine.",
  Rainmaker: "Elite tier. You make it rain consistently.",
  Wolf:      "Sell me this pen. You are the Wolf of the floor.",
  'The Don': "Maximum mastery. Untouchable. You are the standard.",
}

const TIER_UNLOCKS = {
  Hunter: [
    { icon: 'school', title: 'FULL ACADEMY ACCESS', desc: 'All 100 sales psychology concepts unlocked.' },
    { icon: 'query_stats', title: 'PERFORMANCE ANALYTICS', desc: 'Detailed call metrics and improvement trends.' },
    { icon: 'psychology', title: 'OBJECTION SCENARIOS', desc: 'Standard objection-heavy scenarios with realistic pushback.' },
  ],
  Closer: [
    { icon: 'mic', title: 'HARD MODE', desc: 'Hostile prospects. No hints. Hang-up risk active.' },
    { icon: 'analytics', title: 'PSYCHOLOGICAL INSIGHTS', desc: 'Full psychological analysis using influence frameworks.' },
    { icon: 'hub', title: 'COHORT PREVIEW', desc: 'Early access to performance benchmarking against peers.' },
  ],
  Slinger: [
    { icon: 'workspace_premium', title: 'C-SUITE SCENARIOS', desc: 'High-stakes enterprise closing with aggressive AI personas.' },
    { icon: 'group', title: 'PRIVATE COHORTS', desc: 'Full access to tier-based competitive groups.' },
    { icon: 'bolt', title: 'SLINGER TERMINAL', desc: 'Advanced dark-mode UI variant with biometric overlays.' },
  ],
  Rainmaker: [
    { icon: 'military_tech', title: 'RAINMAKER COACHING', desc: 'AI strategy sessions based on top-performer transcripts.' },
    { icon: 'hub', title: 'FULL NETWORK ACCESS', desc: 'Private cohorts, exclusive leaderboards, roundtables.' },
    { icon: 'emoji_events', title: 'LEGEND STATUS', desc: 'Public profile and invitation to Wolf-level events.' },
  ],
  Wolf: [
    { icon: 'whatshot', title: 'WOLF VAULT', desc: 'The most challenging enterprise scenarios in existence.' },
    { icon: 'star', title: 'PERMANENT RECORD', desc: 'Immortalized on the all-time leaderboard.' },
  ],
  'The Don': [],
}

const STAT_LABELS = {
  opening_stat: 'OPENING IMPACT',
  rapport_stat: 'RAPPORT DEPTH',
  discovery_stat: 'DISCOVERY QUALITY',
  objection_stat: 'OBJECTION HANDLING',
  closing_stat: 'CLOSING CONFIDENCE',
  adaptability_stat: 'ADAPTABILITY',
}

const MODE_COLORS = { easy: '#8e9192', medium: '#dcc662', hard: '#8B2222' }

function gradeColor(grade) {
  if (!grade) return '#8e9192'
  const g = grade.toUpperCase()
  if (g.startsWith('A')) return '#dcc662'
  if (g.startsWith('B')) return '#c8c6c5'
  return '#8e9192'
}

export default function History() {
  const { user } = useAuthStore()
  const { card, fetchCard } = useUserStore()
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [cardLoading, setCardLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchCard(user.id).finally(() => setCardLoading(false))
    } else {
      setCardLoading(false)
    }
    api.getCallHistory()
      .then((data) => setCalls(Array.isArray(data) ? data : []))
      .catch(() => setCalls([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  // Don't render tier with placeholder data — wait for real card
  const displayCard = card || EMPTY_CARD
  const rankColor = cardLoading ? '#444748' : getRankColor(displayCard.rank_tier)

  const currentIdx = Math.max(0, RANK_TIERS.findIndex((r) => r.tier === displayCard.rank_tier))
  const current = RANK_TIERS[currentIdx]
  const next = RANK_TIERS[currentIdx + 1]
  const progress = next ? Math.min(100, ((displayCard.elo - current.elo) / (next.elo - current.elo)) * 100) : 100

  const unlocks = TIER_UNLOCKS[next?.tier] || []
  const standing = TIER_STANDING[displayCard.rank_tier] || ''

  // Path to mastery: 3 weakest stats
  const statEntries = Object.entries(STAT_LABELS).map(([key, label]) => ({
    key, label, value: displayCard[key] ?? 50,
  })).sort((a, b) => a.value - b.value)
  const weakAreas = statEntries.slice(0, 3)
  const strongAreas = statEntries.slice(-1)

  const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <div className="p-8 md:p-12 max-w-[1060px] mx-auto">
      {/* Tier hero — don't render until card loaded to prevent flash */}
      <div className="text-center mb-12">
        {cardLoading ? (
          <div className="animate-pulse">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#1e2020] border border-[#444748]/30" />
            <div className="h-10 bg-[#1e2020] rounded w-48 mx-auto mb-3" />
            <div className="h-3 bg-[#1e2020] rounded w-64 mx-auto" />
          </div>
        ) : (<>
        <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center border-2 relative" style={{ borderColor: `${rankColor}40`, background: `${rankColor}08` }}>
          <span className="material-symbols-outlined text-5xl" style={{ color: rankColor }}>
            {currentIdx >= 3 ? 'diamond' : currentIdx >= 2 ? 'workspace_premium' : 'military_tech'}
          </span>
          <div className="absolute inset-[4px] border" style={{ borderColor: `${rankColor}20` }} />
        </div>
        <h1 className="font-display text-5xl font-semibold mb-3" style={{ color: rankColor }}>
          {displayCard.rank_tier} Tier
        </h1>
        {next && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="font-mono-data text-sm text-[#c8c6c5]">{displayCard.elo.toLocaleString()} ELO</span>
            <span className="material-symbols-outlined text-sm text-[#444748]">arrow_forward</span>
            <span className="font-mono-data text-sm text-[#dcc662]">{next.elo.toLocaleString()} ELO</span>
          </div>
        )}
        <p className="font-mono-data text-xs text-[#8e9192] max-w-sm mx-auto">{standing}</p>

        {/* Progress bar */}
        {next && (
          <div className="max-w-xs mx-auto mt-6">
            <div className="w-full h-[2px] bg-[#333535]">
              <div className="h-full bg-gradient-to-r from-[#c8c6c5] to-[#dcc662] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>{displayCard.rank_tier}</span>
              <span className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>{Math.round(progress)}%</span>
              <span className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>{next.tier}</span>
            </div>
          </div>
        )}
        </>)}
      </div>

      {/* Two-panel row */}
      {next && unlocks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* What next tier unlocks */}
          <div className="border border-[#444748]/30 bg-[#1e2020] p-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#dcc662]">lock_open</span>
              <h2 className="font-header text-base font-medium text-[#c8c6c5]">What {next.tier} Unlocks</h2>
            </div>
            <div className="flex flex-col gap-5">
              {unlocks.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-[#444748]/30 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm text-[#dcc662]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="label-caps text-[#c8c6c5] mb-1">{item.title}</p>
                    <p className="font-mono-data text-[11px] text-[#8e9192] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Path to mastery */}
          <div className="border border-[#444748]/30 bg-[#1e2020] p-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#dcc662]">target</span>
              <h2 className="font-header text-base font-medium text-[#c8c6c5]">Path to Mastery</h2>
            </div>
            <p className="font-mono-data text-[11px] text-[#8e9192] mb-5">Suggested focus areas based on your simulation vectors.</p>
            <div className="flex flex-col gap-3 mb-6">
              {weakAreas.map(({ key, label, value }) => {
                const gap = 85 - value
                const isNeg = gap > 0
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="label-caps text-[#c8c6c5]" style={{ fontSize: '10px' }}>{label}</span>
                      <span className="font-mono-data text-xs" style={{ color: isNeg ? '#8B2222' : '#dcc662' }}>
                        {isNeg ? `-${gap}` : `+${Math.abs(gap)}`}
                      </span>
                    </div>
                    <div className="w-full h-[2px] bg-[#333535]">
                      <div className="h-full transition-all" style={{ width: `${value}%`, background: isNeg ? '#8B2222' : '#dcc662' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <Link to="/practice" className="label-caps text-[#dcc662] hover:text-[#c9b452] transition-colors">
              GENERATE CUSTOM DRILL →
            </Link>
          </div>
        </div>
      )}

      {/* Tier history timeline */}
      <div className="border border-[#444748]/30 bg-[#1e2020] p-7 mb-6">
        <p className="label-caps text-[#8e9192] mb-6">TIER HISTORY</p>
        <div className="flex items-center gap-0">
          {RANK_TIERS.map((t, i) => {
            const passed = displayCard.elo >= t.elo
            const isCurrent = displayCard.rank_tier === t.tier
            const color = passed ? getRankColor(t.tier) : '#333535'
            return (
              <div key={t.tier} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border-2 transition-all"
                    style={{
                      borderColor: color,
                      background: isCurrent ? color : passed ? `${color}40` : '#1a1c1c',
                      boxShadow: isCurrent ? `0 0 8px ${color}60` : 'none',
                    }}
                  />
                  <div className="text-center">
                    <p className="font-mono-data" style={{ fontSize: '9px', color: passed ? color : '#333535' }}>{t.tier.toUpperCase()}</p>
                    {isCurrent && <p className="label-caps text-[#8e9192]" style={{ fontSize: '8px' }}>CURRENT</p>}
                  </div>
                </div>
                {i < RANK_TIERS.length - 1 && (
                  <div className="flex-1 h-px mx-1" style={{ background: displayCard.elo > t.elo ? color : '#333535', opacity: 0.4 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent calls */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-header text-base font-medium text-[#c8c6c5]">Recent Sessions</h2>
          {calls.length > 0 && <span className="font-mono-data text-xs text-[#8e9192]">{calls.length} logged</span>}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-[#1e2020] border border-[#444748]/30 animate-pulse" />)}
          </div>
        ) : calls.length === 0 ? (
          <div className="border border-[#444748]/30 bg-[#1e2020] p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-[#444748] block mb-3">phone_missed</span>
            <p className="font-header text-sm font-medium text-[#c8c6c5] mb-1">No sessions yet</p>
            <p className="font-mono-data text-xs text-[#8e9192] mb-5">Complete a simulation to see your history here.</p>
            <Link to="/practice" className="label-caps text-[#dcc662] hover:text-[#c9b452] transition-colors">Start your first call →</Link>
          </div>
        ) : (
          <div className="border border-[#444748]/30 flex flex-col gap-0">
            {calls.map((call) => {
              const gc = gradeColor(call.grade)
              const mc = MODE_COLORS[call.mode] || '#8e9192'
              return (
                <Link
                  key={call.id}
                  to={`/eval/${call.id}`}
                  className="flex items-center gap-5 bg-[#1e2020] p-5 hover:bg-[#282a2b] transition-colors border-b border-[#444748]/20 last:border-0 group"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border font-header text-sm font-medium" style={{ borderColor: `${gc}30`, color: gc, background: `${gc}08` }}>
                    {call.grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-header text-sm font-medium text-[#c8c6c5] truncate">{call.scenario_name}</p>
                    <div className="flex items-center gap-4 mt-0.5">
                      <span className="label-caps" style={{ color: mc, fontSize: '9px' }}>{call.mode}</span>
                      <span className="font-mono-data text-[10px] text-[#8e9192]">{formatDuration(call.duration_seconds || 0)}</span>
                      <span className="font-mono-data text-[10px] text-[#8e9192]">{formatDate(call.started_at)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono-data text-xl font-semibold text-[#c8c6c5]">{call.score_overall}</p>
                    <p className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>SCORE</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-[#444748] group-hover:text-[#8e9192] transition-colors">chevron_right</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <div className="h-10" />
    </div>
  )
}
