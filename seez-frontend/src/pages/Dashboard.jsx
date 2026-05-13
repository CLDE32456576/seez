import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { StatHexagon } from '../components/seez-card/StatHexagon'
import { getRankColor, getRankEmoji } from '../lib/utils'
import { MOCK_CARD } from '../lib/mockData'
import { api } from '../lib/api'
import { WelcomeModal } from '../components/common/WelcomeModal'

const RANK_TIERS = [
  { tier: 'Grinder',   elo: 0 },
  { tier: 'Hunter',    elo: 1000 },
  { tier: 'Closer',    elo: 2000 },
  { tier: 'Slinger',   elo: 3000 },
  { tier: 'Rainmaker', elo: 4000 },
  { tier: 'Wolf',      elo: 5000 },
  { tier: 'The Don',   elo: 6000 },
]

const TIER_NEXT_UNLOCK = {
  Hunter:    'Full Academy access (100 sales psychology concepts)',
  Closer:    'Hard Mode + psychological analysis on every call',
  Slinger:   'C-suite scenarios + private cohorts',
  Rainmaker: 'Rainmaker coaching + full network access',
  Wolf:      'Wolf Vault — the most brutal scenarios in existence',
  'The Don': 'Permanent record. All-time leaderboard.',
}

const STAT_KEYS = [
  { key: 'opening_stat', label: 'OPN' },
  { key: 'rapport_stat', label: 'RAP' },
  { key: 'discovery_stat', label: 'DIS' },
  { key: 'objection_stat', label: 'OBJ' },
  { key: 'closing_stat', label: 'CLO' },
  { key: 'adaptability_stat', label: 'ADP' },
]

function gradeColor(grade) {
  if (!grade) return '#8e9192'
  const g = grade.toUpperCase()
  if (g.startsWith('A')) return '#dcc662'
  if (g.startsWith('B')) return '#c8c6c5'
  return '#8e9192'
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { card, fetchCard } = useUserStore()
  const [recentCalls, setRecentCalls] = useState([])
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchCard(user.id)
      api.getCallHistory(1).then((data) => {
        const calls = Array.isArray(data) ? data : (data?.calls ?? data?.items ?? [])
        setRecentCalls(calls.slice(0, 5))
      }).catch(() => {})
    }
  }, [user?.id])

  // Show welcome modal once for new users
  useEffect(() => {
    if (!user?.id) return
    const alreadySeen = localStorage.getItem(`seez_onboarded_${user.id}`)
    if (!alreadySeen) setShowWelcome(true)
  }, [user?.id])

  const displayCard = card || MOCK_CARD
  const username = user?.email?.split('@')[0] || 'Operator'
  const initials = username.slice(0, 2).toUpperCase()
  const rankColor = getRankColor(displayCard.rank_tier)
  const rankEmoji = getRankEmoji(displayCard.rank_tier)
  const userId = user?.id ? `SZ-${user.id.slice(-8).toUpperCase()}` : 'SZ-00000000'

  const currentIdx = Math.max(0, RANK_TIERS.findIndex((r) => r.tier === displayCard.rank_tier))
  const current = RANK_TIERS[currentIdx]
  const next = RANK_TIERS[currentIdx + 1]
  const progress = next
    ? Math.min(100, ((displayCard.elo - current.elo) / (next.elo - current.elo)) * 100)
    : 100
  const nextUnlock = next ? TIER_NEXT_UNLOCK[next.tier] : null

  const streakActive = displayCard.current_streak > 0
  const streakIcon = displayCard.current_streak >= 7 ? '🔥🔥' : '🔥'

  return (
    <>
      {showWelcome && (
        <WelcomeModal userId={user?.id} onClose={() => setShowWelcome(false)} />
      )}

      <div className="p-8 md:p-12 max-w-[1060px] mx-auto">

        {/* ── TIER HERO (above the fold) ────────────────────────────────── */}
        <div className="flex items-stretch gap-4 mb-8">

          {/* Tier info panel */}
          <div
            className="flex-1 border p-8 flex items-center gap-8 relative overflow-hidden"
            style={{ borderColor: `${rankColor}25`, background: `${rankColor}06` }}
          >
            {/* Faint emoji watermark */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[80px] opacity-5 pointer-events-none select-none">{rankEmoji}</div>

            {/* Tier badge */}
            <div
              className="flex-shrink-0 w-20 h-20 flex items-center justify-center border-2 text-4xl"
              style={{ borderColor: `${rankColor}40`, background: `${rankColor}12` }}
            >
              {rankEmoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 relative z-10">
              <p className="label-caps text-[#8e9192] mb-1" style={{ fontSize: '9px' }}>CURRENT TIER</p>
              <h2 className="font-display font-semibold mb-0.5" style={{ fontSize: 42, lineHeight: 1.1, color: rankColor }}>
                {displayCard.rank_tier}
              </h2>
              <p className="font-mono-data text-xs text-[#8e9192] mb-4">{displayCard.rank_title}</p>

              {/* ELO progress */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono-data text-xs text-[#c8c6c5]">{displayCard.elo.toLocaleString()} ELO</span>
                  {next && (
                    <span className="font-mono-data text-xs text-[#8e9192]">
                      {next.tier} at {next.elo.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="w-full h-[3px] bg-[#333535] relative">
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rankColor}80, ${rankColor})` }}
                  />
                </div>
                {nextUnlock && (
                  <p className="font-mono-data mt-2" style={{ fontSize: '10px', color: '#8e9192' }}>
                    <span style={{ color: rankColor }}>↑</span> {next?.tier} unlocks: {nextUnlock}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Streak panel */}
          <div className="border border-[#444748]/30 bg-[#1e2020] p-6 flex flex-col items-center justify-center w-44 flex-shrink-0 text-center">
            <div className="text-3xl mb-2 leading-none">{streakActive ? streakIcon : '—'}</div>
            <div
              className="font-display font-semibold mb-1"
              style={{ fontSize: 48, lineHeight: 1, color: streakActive ? '#dcc662' : '#444748' }}
            >
              {displayCard.current_streak}
            </div>
            <p className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>DAY STREAK</p>
            {!streakActive && (
              <p className="font-mono-data text-[10px] text-[#8e9192]/50 mt-2 leading-relaxed">
                Call today<br />to start
              </p>
            )}
            {displayCard.current_streak > 0 && displayCard.current_streak < 7 && (
              <p className="font-mono-data text-[10px] text-[#8e9192]/60 mt-2 leading-relaxed">
                {7 - displayCard.current_streak}d to<br />double fire
              </p>
            )}
          </div>
        </div>

        {/* ── BENTO GRID ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: SEEZ Card */}
          <div className="lg:col-span-7 bg-[#1e2020] border border-[#444748]/30 flex flex-col p-8 relative overflow-hidden min-h-[480px]">
            {/* Faint bg glow */}
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-[0.04] pointer-events-none"
              style={{ background: `radial-gradient(circle at top right, ${rankColor}, transparent)` }}
            />

            {/* Card header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 flex items-center justify-center border-2 font-display text-lg font-semibold flex-shrink-0"
                  style={{ borderColor: `${rankColor}40`, background: `${rankColor}15`, color: rankColor }}
                >
                  {initials}
                </div>
                <div>
                  <div className="label-caps text-[#dcc662] mb-0.5" style={{ fontSize: '9px' }}>SEEZ CARD</div>
                  <h3 className="font-header text-lg font-medium text-[#c8c6c5]">{username}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="label-caps" style={{ color: rankColor, fontSize: '9px' }}>
                      {rankEmoji} {displayCard.rank_tier}
                    </span>
                    <span className="text-[#444748]">·</span>
                    <span className="font-mono-data text-[10px] text-[#8e9192]">{displayCard.rank_title}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono-data text-[9px] text-[#8e9192] mb-1">{userId}</div>
                <div className="font-mono-data text-4xl font-semibold text-[#c8c6c5] leading-none">
                  {displayCard.overall_rating}
                </div>
                <div className="label-caps text-[#8e9192] mt-0.5" style={{ fontSize: '8px' }}>OVR</div>
              </div>
            </div>

            {/* Hexagon + stat grid */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-2">
              <StatHexagon stats={displayCard} size={260} />
              <div className="grid grid-cols-3 gap-x-8 gap-y-3 mt-4 w-full max-w-xs">
                {STAT_KEYS.map(({ key, label }) => {
                  const val = displayCard[key] ?? 50
                  const color = val >= 75 ? '#dcc662' : val >= 55 ? '#c8c6c5' : '#8e9192'
                  return (
                    <div key={key} className="flex flex-col items-center">
                      <span className="font-mono-data text-[9px] text-[#8e9192]/70 tracking-widest">{label}</span>
                      <span className="font-mono-data text-base font-semibold" style={{ color }}>{val}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#444748]/20 pt-4 grid grid-cols-3 gap-4 relative z-10">
              {[
                { label: 'CALLS', value: displayCard.total_calls },
                { label: 'WIN RATE', value: `${displayCard.total_calls > 0 ? Math.round((displayCard.calls_graded_b_or_above / displayCard.total_calls) * 100) : 0}%` },
                { label: 'STREAK', value: displayCard.current_streak },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="font-mono-data text-sm font-semibold text-[#c8c6c5]">{value}</div>
                  <div className="label-caps text-[#8e9192]" style={{ fontSize: '8px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* CTA */}
            <div className="bg-[#1e2020] border border-[#dcc662]/20 p-8 flex flex-col items-center text-center group hover:border-[#dcc662]/40 transition-colors duration-300">
              <div className="w-14 h-14 bg-[#dcc662]/10 flex items-center justify-center mb-6 group-hover:bg-[#dcc662]/20 transition-colors">
                <span className="material-symbols-outlined text-[#dcc662] text-3xl">mic</span>
              </div>
              <Link
                to="/practice"
                className="label-caps text-[#dcc662] border border-[#dcc662] px-8 py-4 tracking-widest hover:bg-[#dcc662] hover:text-[#393000] transition-all duration-300 w-full max-w-xs block text-center"
              >
                START A CALL
              </Link>
              <p className="font-mono-data text-[10px] text-[#8e9192] mt-4">SIMULATED ENVIRONMENT // EST. 15 MINS</p>
            </div>

            {/* Quick stats */}
            <div className="bg-[#1e2020] border border-[#444748]/30 p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'TOTAL CALLS', value: displayCard.total_calls, icon: 'phone_in_talk' },
                { label: 'ELO RATING', value: displayCard.elo.toLocaleString(), icon: 'bar_chart' },
                { label: 'WIN RATE', value: `${displayCard.total_calls > 0 ? Math.round((displayCard.calls_graded_b_or_above / displayCard.total_calls) * 100) : 0}%`, icon: 'trending_up' },
                { label: 'OVR RATING', value: displayCard.overall_rating, icon: 'analytics' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm text-[#444748]">{icon}</span>
                  <div>
                    <div className="font-mono-data text-lg font-semibold text-[#c8c6c5]">{value}</div>
                    <div className="label-caps text-[#8e9192]" style={{ fontSize: '8px' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Operations */}
            <div className="bg-[#1e2020] border border-[#444748]/30 p-6 flex-1">
              <h4 className="label-caps text-[#8e9192] mb-5 pb-4 border-b border-[#444748]/30">RECENT OPERATIONS</h4>
              <div className="flex flex-col gap-0">
                {recentCalls.length > 0 ? recentCalls.map((call, i) => (
                  <Link
                    key={call.id || i}
                    to={`/eval/${call.id}`}
                    className="flex items-center justify-between py-3 border-b border-[#444748]/10 last:border-0 hover:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-8 h-8 border flex items-center justify-center font-header text-sm"
                        style={{ borderColor: `${gradeColor(call.grade)}30`, color: gradeColor(call.grade) }}
                      >
                        {call.grade || '—'}
                      </div>
                      <span className="font-mono-data text-xs text-[#c8c6c5]">
                        {call.scenario_name || `SIM-${String(call.id || i).slice(-3).padStart(3, '0')}`}
                      </span>
                    </div>
                    <span className="font-mono-data text-[10px] text-[#8e9192]">
                      {call.created_at ? new Date(call.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : '—'}
                    </span>
                  </Link>
                )) : (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 border border-[#444748]/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-[#444748]">phone_missed</span>
                      </div>
                      <span className="font-mono-data text-xs text-[#8e9192]">No calls logged yet</span>
                    </div>
                    <Link to="/practice" className="label-caps text-[#dcc662]" style={{ fontSize: '9px' }}>START ONE →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-10" />
      </div>
    </>
  )
}
