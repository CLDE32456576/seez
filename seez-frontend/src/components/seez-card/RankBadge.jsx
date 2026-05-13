import { getRankColor, getRankEmoji } from '../../lib/utils'

export function RankBadge({ tier, title, compact = false }) {
  const color = getRankColor(tier)
  const emoji = getRankEmoji(tier)

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
      >
        {emoji} {tier}
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      >
        {emoji}
      </div>
      <div className="text-center">
        <p className="text-xs font-bold" style={{ color }}>{tier}</p>
        <p className="text-xs text-[#5a6a8a]">{title}</p>
      </div>
    </div>
  )
}
