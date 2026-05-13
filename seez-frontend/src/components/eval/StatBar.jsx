import { useEffect, useState } from 'react'
import { getStatColor } from '../../lib/utils'

const STAT_FULL_NAMES = {
  opening: 'Opening',
  rapport: 'Rapport',
  discovery: 'Discovery',
  objection: 'Objection Handling',
  closing: 'Closing',
  adaptability: 'Adaptability',
}

const STAT_WEIGHTS = {
  opening: '15%',
  rapport: '15%',
  discovery: '20%',
  objection: '20%',
  closing: '20%',
  adaptability: '10%',
}

export function StatBar({ statKey, value, animate = true }) {
  const [width, setWidth] = useState(0)
  const color = getStatColor(value)

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setWidth(value), 100)
      return () => clearTimeout(t)
    } else {
      setWidth(value)
    }
  }, [value, animate])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{STAT_FULL_NAMES[statKey]}</span>
          <span className="text-xs text-[#5a6a8a]">{STAT_WEIGHTS[statKey]}</span>
        </div>
        <span className="text-sm font-black" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#1e2a40] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
