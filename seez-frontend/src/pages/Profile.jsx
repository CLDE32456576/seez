import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { Button } from '../components/common/Button'
import { api } from '../lib/api'
import { getRankColor } from '../lib/utils'

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

const HONORS = [
  { key: 'first_call',   icon: 'mic',                   title: 'First Session',       desc: 'Completed your first simulation.',             req: (c) => c.total_calls >= 1 },
  { key: 'ten_calls',    icon: 'phone_in_talk',          title: 'Field Operative',     desc: '10 simulations completed.',                   req: (c) => c.total_calls >= 10 },
  { key: 'fifty_calls',  icon: 'military_tech',          title: 'Veteran Closer',      desc: '50 simulations completed.',                   req: (c) => c.total_calls >= 50 },
  { key: 'streak_7',     icon: 'local_fire_department',  title: 'Iron Discipline',     desc: '7-day training streak.',                      req: (c) => c.longest_streak >= 7 },
  { key: 'streak_30',    icon: 'emoji_events',           title: 'Relentless',          desc: '30-day training streak.',                     req: (c) => c.longest_streak >= 30 },
  { key: 'hunter_tier',  icon: 'gps_fixed',              title: 'Hunter',              desc: 'Reached Hunter tier (1,000 ELO).',            req: (c) => c.elo >= 1000 },
  { key: 'closer_tier',  icon: 'handshake',              title: 'Closer',              desc: 'Reached Closer tier (2,000 ELO).',            req: (c) => c.elo >= 2000 },
  { key: 'slinger_tier', icon: 'bolt',                   title: 'Slinger',             desc: 'Reached Slinger tier (3,000 ELO).',           req: (c) => c.elo >= 3000 },
  { key: 'high_overall', icon: 'star',                   title: 'Precision Instrument',desc: 'Overall rating above 75.',                    req: (c) => c.overall_rating >= 75 },
  { key: 'b_above_50',   icon: 'trending_up',            title: 'Consistent Performer',desc: '50%+ calls graded B or above.',               req: (c) => c.total_calls > 0 && (c.calls_graded_b_or_above / c.total_calls) >= 0.5 },
]

export default function Profile() {
  const { user } = useAuthStore()
  const { card, fetchCard } = useUserStore()

  useEffect(() => {
    if (user?.id) fetchCard(user.id)
  }, [user?.id])

  const displayCard = card || EMPTY_CARD
  const rankColor = getRankColor(displayCard.rank_tier)
  const currentIdx = Math.max(0, RANK_TIERS.findIndex((r) => r.tier === displayCard.rank_tier))
  const next = RANK_TIERS[currentIdx + 1]
  const winRate = displayCard.total_calls > 0
    ? Math.round((displayCard.calls_graded_b_or_above / displayCard.total_calls) * 100)
    : 0

  const unlockedHonors = HONORS.filter((h) => h.req(displayCard))
  const lockedHonors   = HONORS.filter((h) => !h.req(displayCard)).slice(0, 4)
  const username = user?.email?.split('@')[0] || 'Operator'
  const userId   = user?.id ? `SZ-${user.id.slice(-8).toUpperCase()}` : 'SZ-00000000'

  return (
    <div className="p-8 md:p-12 max-w-[1060px] mx-auto">

      {/* Header — smaller text so the ID doesn't overlap */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="label-caps text-[#8e9192] mb-2" style={{ fontSize: '9px' }}>OPERATIVE DOSSIER</p>
          <h1 className="font-display text-4xl text-[#c8c6c5]">{username}</h1>
          <p className="font-mono-data text-xs text-[#8e9192] mt-1.5">{userId} // STATUS: ACTIVE</p>
        </div>
        <Link
          to="/settings"
          className="label-caps text-[#8e9192] border border-[#444748]/30 px-4 py-2 hover:text-[#c8c6c5] hover:border-[#c8c6c5]/20 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          Settings
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Rank card */}
        <div className="border p-7 flex flex-col justify-between" style={{ borderColor: `${rankColor}30`, background: `${rankColor}06` }}>
          <div>
            <span className="material-symbols-outlined text-4xl mb-4 block" style={{ color: rankColor }}>
              {currentIdx >= 3 ? 'diamond' : currentIdx >= 2 ? 'workspace_premium' : 'military_tech'}
            </span>
            <p className="label-caps" style={{ color: rankColor }}>{displayCard.rank_tier.toUpperCase()} TIER</p>
            <p className="font-header text-sm font-medium text-[#8e9192] mt-1">{displayCard.rank_title}</p>
          </div>
          <div>
            <div className="flex justify-between items-end mt-6 mb-1.5">
              <span className="font-mono-data text-sm text-[#c8c6c5]">{displayCard.elo} ELO</span>
              {next && <span className="font-mono-data text-xs text-[#8e9192]">NEXT: {next.elo}</span>}
            </div>
            {next && (
              <div className="w-full h-[2px] bg-[#333535]">
                <div className="h-full bg-gradient-to-r from-[#c8c6c5] to-[#dcc662]"
                  style={{ width: `${Math.min(100, ((displayCard.elo - (RANK_TIERS[currentIdx]?.elo || 0)) / (next.elo - (RANK_TIERS[currentIdx]?.elo || 0))) * 100)}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Stats 2×2 */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'TOTAL CALLS',   value: displayCard.total_calls,   icon: 'phone_in_talk' },
            { label: 'AVERAGE SCORE', value: displayCard.overall_rating ? `${displayCard.overall_rating}` : '—', sub: '/ 100', icon: 'analytics' },
            { label: 'WIN RATE',      value: `${winRate}%`,              icon: 'trending_up' },
            { label: 'CURRENT STREAK',value: displayCard.current_streak, sub: 'DAYS', icon: 'local_fire_department' },
          ].map(({ label, value, sub, icon }) => (
            <div key={label} className="border border-[#444748]/30 bg-[#1e2020] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>{label}</span>
                <span className="material-symbols-outlined text-sm text-[#444748]">{icon}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="font-display text-4xl font-semibold text-[#c8c6c5]">{value}</span>
                {sub && <span className="font-mono-data text-xs text-[#8e9192]">{sub}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progression timeline */}
      <div className="border border-[#444748]/30 bg-[#1e2020] p-7 mb-6">
        <p className="label-caps text-[#8e9192] mb-6">PROGRESSION TIMELINE</p>
        <div className="flex items-center">
          {RANK_TIERS.map((t, i) => {
            const passed   = displayCard.elo >= t.elo
            const isCurrent = displayCard.rank_tier === t.tier
            const color    = passed ? getRankColor(t.tier) : '#333535'
            return (
              <div key={t.tier} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, background: isCurrent ? color : passed ? `${color}40` : '#1a1c1c', boxShadow: isCurrent ? `0 0 8px ${color}60` : 'none' }} />
                  <div className="text-center">
                    <p className="font-mono-data truncate" style={{ fontSize: '9px', color: passed ? color : '#333535' }}>{t.tier.toUpperCase()}</p>
                    {isCurrent && <p className="label-caps text-[#dcc662]" style={{ fontSize: '8px' }}>CURRENT</p>}
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

      {/* Honors */}
      <div className="border border-[#444748]/30 bg-[#1e2020] p-7">
        <div className="flex items-center justify-between mb-6">
          <p className="label-caps text-[#8e9192]">ACQUIRED HONORS</p>
          <span className="label-caps text-[#dcc662]" style={{ fontSize: '9px' }}>{unlockedHonors.length} UNLOCKED</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {unlockedHonors.map((h) => (
            <div key={h.key} className="flex items-center gap-4 p-3 border border-[#dcc662]/15" style={{ background: 'rgba(220,198,98,0.03)' }}>
              <div className="w-8 h-8 flex items-center justify-center border border-[#dcc662]/20 flex-shrink-0">
                <span className="material-symbols-outlined text-sm text-[#dcc662]">{h.icon}</span>
              </div>
              <div>
                <p className="label-caps text-[#c8c6c5]" style={{ fontSize: '10px' }}>{h.title}</p>
                <p className="font-mono-data text-[10px] text-[#8e9192] mt-0.5">{h.desc}</p>
              </div>
            </div>
          ))}
          {unlockedHonors.length === 0 && (
            <p className="font-mono-data text-xs text-[#8e9192] col-span-2 text-center py-4">Complete simulations to earn honors.</p>
          )}
          {lockedHonors.slice(0, 4).map((h) => (
            <div key={h.key} className="flex items-center gap-4 p-3 border border-[#444748]/20 opacity-30">
              <div className="w-8 h-8 flex items-center justify-center border border-[#444748]/30 flex-shrink-0">
                <span className="material-symbols-outlined text-sm text-[#444748]">lock</span>
              </div>
              <div>
                <p className="label-caps text-[#8e9192]" style={{ fontSize: '10px' }}>{h.title}</p>
                <p className="font-mono-data text-[10px] text-[#8e9192] mt-0.5">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
