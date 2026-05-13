import { StatBar } from './StatBar'
import { getGradeColor, calculateEloChange } from '../../lib/utils'
import { CheckCircle, AlertTriangle, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '../common/Button'
import { useNavigate } from 'react-router-dom'

export function Scorecard({ evalData, mode, onPlayAgain }) {
  const navigate = useNavigate()
  if (!evalData) return null

  const { scores, grade, overall, strengths, improvements, psychological_insights, coach_note, elo_change } = evalData
  const gradeColor = getGradeColor(grade)
  const eloChange = elo_change ?? calculateEloChange(grade, mode)

  const statEntries = scores ? Object.entries(scores) : []

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Hero Score */}
      <div className="rounded-2xl border border-[#1e2a40] bg-[#0f1420] p-6 text-center">
        <p className="text-xs font-bold text-[#5a6a8a] uppercase tracking-wider mb-3">Call Score</p>
        <div className="flex items-center justify-center gap-6">
          <div>
            <div
              className="text-7xl font-black leading-none"
              style={{ color: gradeColor, textShadow: `0 0 40px ${gradeColor}40` }}
            >
              {grade}
            </div>
            <p className="text-sm text-[#5a6a8a] mt-1">{overall} / 100</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`flex items-center gap-1 text-lg font-black ${eloChange > 0 ? 'text-[#00e5a0]' : eloChange < 0 ? 'text-[#ff4757]' : 'text-[#5a6a8a]'}`}>
              {eloChange > 0 ? <TrendingUp size={20} /> : eloChange < 0 ? <TrendingDown size={20} /> : <Minus size={20} />}
              {eloChange > 0 ? '+' : ''}{eloChange}
            </div>
            <p className="text-xs text-[#5a6a8a]">ELO</p>
          </div>
        </div>
      </div>

      {/* Stat bars */}
      <div className="rounded-2xl border border-[#1e2a40] bg-[#0f1420] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Performance Breakdown</h3>
        {statEntries.map(([key, value]) => (
          <StatBar key={key} statKey={key} value={value} />
        ))}
      </div>

      {/* Strengths */}
      <div className="rounded-2xl border border-[#00e5a0]/20 bg-[#00e5a0]/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-[#00e5a0]" />
          <h3 className="text-sm font-bold text-white">What you did well</h3>
        </div>
        <div className="space-y-2.5">
          {strengths?.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-[#00e5a0]/20 text-[#00e5a0] text-xs font-bold">{i + 1}</span>
              <p className="text-sm text-[#e8eaf0]">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div className="rounded-2xl border border-[#ff4757]/20 bg-[#ff4757]/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#ff4757]" />
          <h3 className="text-sm font-bold text-white">What to fix</h3>
        </div>
        <div className="space-y-2.5">
          {improvements?.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-[#ff4757]/20 text-[#ff4757] text-xs font-bold">{i + 1}</span>
              <p className="text-sm text-[#e8eaf0]">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coach note */}
      {coach_note && (
        <div className="rounded-2xl border border-[#1e2a40] bg-[#0f1420] p-5">
          <p className="text-xs font-bold text-[#5a6a8a] uppercase tracking-wider mb-2">Coach's Take</p>
          <p className="text-sm text-[#e8eaf0] leading-relaxed">{coach_note}</p>
        </div>
      )}

      {/* Psychological insights */}
      {psychological_insights && (
        <div className="rounded-2xl border border-[#1e2a40] bg-[#0f1420] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-[#a855f7]" />
            <h3 className="text-sm font-bold text-white">Psychological Insights</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(psychological_insights).map(([key, val]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-xs font-semibold text-[#5a6a8a] capitalize min-w-[100px]">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-[#e8eaf0]">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="primary" size="lg" className="flex-1" onClick={onPlayAgain}>
          Call Again
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate('/practice')}>
          New Scenario
        </Button>
      </div>
    </div>
  )
}
