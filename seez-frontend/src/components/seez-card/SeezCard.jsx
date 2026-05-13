import { StatHexagon } from './StatHexagon'
import { getRankColor, getRankEmoji } from '../../lib/utils'
import { Phone, TrendingUp, Flame } from 'lucide-react'

const STAT_KEYS = [
  { key: 'opening_stat', label: 'OPN' },
  { key: 'rapport_stat', label: 'RAP' },
  { key: 'discovery_stat', label: 'DIS' },
  { key: 'objection_stat', label: 'OBJ' },
  { key: 'closing_stat', label: 'CLO' },
  { key: 'adaptability_stat', label: 'ADP' },
]

function StatPill({ label, value }) {
  const color = value >= 80 ? '#dcc662' : value >= 65 ? '#c8c6c5' : value >= 50 ? '#8e9192' : '#8e9192'
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono-data text-[9px] font-semibold text-[#8e9192] tracking-widest">{label}</span>
      <span className="font-mono-data text-sm font-semibold" style={{ color }}>{value}</span>
    </div>
  )
}

export function SeezCard({ card, username, compact = false }) {
  if (!card) return null
  const rankColor = getRankColor(card.rank_tier)
  const rankEmoji = getRankEmoji(card.rank_tier)
  const winRate = card.total_calls > 0
    ? Math.round((card.calls_graded_b_or_above / card.total_calls) * 100)
    : 0

  if (compact) {
    return (
      <div className="border border-[#444748]/30 bg-[#1e2020] p-4 flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center text-2xl font-black flex-shrink-0 border"
          style={{ background: `${rankColor}15`, borderColor: `${rankColor}30` }}
        >
          {rankEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-header font-medium text-[#c8c6c5] truncate">{username}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="label-caps" style={{ color: rankColor }}>{card.rank_tier}</span>
            <span className="text-[#8e9192]">·</span>
            <span className="font-mono-data text-xs text-[#8e9192]">{card.elo} ELO</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono-data text-2xl font-semibold text-[#c8c6c5]">{card.overall_rating}</p>
          <p className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>OVR</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden border p-6 bg-[#1a1c1c]" style={{ borderColor: `${rankColor}30` }}>
      {/* Subtle corner gradient */}
      <div
        className="absolute top-0 right-0 h-24 w-24 opacity-5 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${rankColor}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="label-caps text-[#8e9192]">SEEZ CARD</p>
          <h3 className="font-header text-xl font-medium text-[#c8c6c5] mt-1">{username}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="label-caps" style={{ color: rankColor }}>
              {rankEmoji} {card.rank_title}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono-data text-4xl font-semibold text-[#c8c6c5] leading-none">{card.overall_rating}</p>
          <p className="label-caps text-[#8e9192] mt-1" style={{ fontSize: '9px' }}>OVR</p>
        </div>
      </div>

      {/* Hexagon + Stats */}
      <div className="flex items-center gap-4 mb-5">
        <StatHexagon stats={card} size={140} />
        <div className="grid grid-cols-3 gap-3 flex-1">
          {STAT_KEYS.map(({ key, label }) => (
            <StatPill key={key} label={label} value={card[key] ?? 50} />
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#444748]/30">
        {[
          { icon: Phone, value: card.total_calls, label: 'Calls' },
          { icon: TrendingUp, value: `${winRate}%`, label: 'Win Rate' },
          { icon: Flame, value: card.current_streak, label: 'Streak' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={13} className="text-[#8e9192]" />
            <div>
              <p className="font-mono-data text-sm font-semibold text-[#c8c6c5]">{value}</p>
              <p className="font-mono-data text-[10px] text-[#8e9192]">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
