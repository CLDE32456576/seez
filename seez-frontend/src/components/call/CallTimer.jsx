import { useEffect, useState } from 'react'
import { formatDuration } from '../../lib/utils'

export function CallTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <span className="font-mono text-lg font-bold text-white tabular-nums">
      {formatDuration(elapsed)}
    </span>
  )
}
