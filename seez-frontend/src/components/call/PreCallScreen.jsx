import { useState, useEffect } from 'react'
import { Button } from '../common/Button'
import { Phone, Clock, Building2, Lightbulb } from 'lucide-react'

const PREP_TIMES = { easy: 90, medium: 60, hard: 45 }

const PERSONALITY_CONFIG = {
  Skeptic: { emoji: '🔴', color: '#ff4757', tagline: 'Questions everything. Demands proof.' },
  Ghost: { emoji: '💤', color: '#5a6a8a', tagline: 'Distracted. Keep it short.' },
  'Price Objector': { emoji: '💰', color: '#f5c518', tagline: 'Everything comes back to cost.' },
  Overanalyzer: { emoji: '🧠', color: '#3b82f6', tagline: 'Needs data for every claim.' },
  Gatekeeper: { emoji: '😤', color: '#f97316', tagline: 'Protects the decision maker.' },
  'Burned Buyer': { emoji: '🔥', color: '#ff6b35', tagline: 'Bad experience. On guard.' },
  'Friendly Waster': { emoji: '🤝', color: '#00e5a0', tagline: 'Nice. Never commits.' },
  'Urgency Seeker': { emoji: '⚡', color: '#f5c518', tagline: 'Problem right now. Move fast.' },
  'Process Person': { emoji: '📋', color: '#a855f7', tagline: 'Everything needs approval.' },
  Alpha: { emoji: '🏆', color: '#f5c518', tagline: 'Needs to feel in control.' },
}

export function PreCallScreen({ scenario, mode, language, onStart, loading }) {
  const [timeLeft, setTimeLeft] = useState(PREP_TIMES[mode] || 60)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [started, timeLeft])

  useEffect(() => {
    setStarted(true)
  }, [])

  const personality = PERSONALITY_CONFIG[scenario?.personality_type] || { emoji: '👤', color: '#5a6a8a', tagline: '' }
  const progress = (timeLeft / PREP_TIMES[mode]) * 100

  const MODE_CONFIG = {
    easy: {
      label: 'Easy',
      color: '#00e5a0',
      badge: '🟢',
      hint: 'Warm prospect. Hints available. Full pitch provided below.',
    },
    medium: {
      label: 'Medium',
      color: '#f5c518',
      badge: '🟡',
      hint: 'Realistic objections. 3 hints available.',
    },
    hard: {
      label: 'Hard',
      color: '#ff4757',
      badge: '🔴',
      hint: 'Hostile. No hints. Figure it out.',
    },
  }

  const modeConf = MODE_CONFIG[mode] || MODE_CONFIG.medium

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Mode badge */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
          style={{ color: modeConf.color, borderColor: `${modeConf.color}40`, backgroundColor: `${modeConf.color}10` }}
        >
          {modeConf.badge} {modeConf.label.toUpperCase()} MODE
        </span>
        <span className="text-xs text-[#5a6a8a] flex items-center gap-1">
          {language === 'spanish' ? '🇲🇽 Español' : '🇺🇸 English'}
        </span>
      </div>

      {/* Prospect card */}
      <div
        className="rounded-2xl border p-5 relative overflow-hidden"
        style={{ borderColor: `${personality.color}30`, backgroundColor: '#0f1420' }}
      >
        <div
          className="absolute top-0 right-0 h-32 w-32 opacity-5"
          style={{ background: `radial-gradient(circle at top right, ${personality.color}, transparent)` }}
        />
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
            style={{ backgroundColor: `${personality.color}15`, border: `1px solid ${personality.color}30` }}
          >
            {personality.emoji}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-white text-lg">{scenario?.prospect_name}</h2>
            <p className="text-sm text-[#5a6a8a]">{scenario?.prospect_role}</p>
            <p className="text-xs text-[#5a6a8a]">{scenario?.prospect_company}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: `${personality.color}15`, color: personality.color }}
              >
                {scenario?.personality_type}
              </span>
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-[#1e2a40] text-[#5a6a8a]">
                {scenario?.call_stage}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#5a6a8a] italic">"{personality.tagline}"</p>
      </div>

      {/* What you're selling */}
      <div className="rounded-xl border border-[#1e2a40] bg-[#0f1420] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={14} className="text-[#00e5a0]" />
          <span className="text-xs font-semibold text-[#00e5a0] uppercase tracking-wider">Your Pitch</span>
        </div>
        <p className="text-sm text-white font-medium">{scenario?.default_product}</p>
        {scenario?.industry && (
          <p className="text-xs text-[#5a6a8a] mt-1">Industry: {scenario.industry}</p>
        )}
      </div>

      {/* Mode tip */}
      <div className="rounded-xl bg-[#1e2a40]/50 px-4 py-3 flex items-start gap-2">
        <Lightbulb size={14} className="text-[#5a6a8a] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#5a6a8a]">{modeConf.hint}</p>
      </div>

      {/* Prep timer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#5a6a8a] flex items-center gap-1">
            <Clock size={12} />
            Prep time
          </span>
          <span className="text-sm font-bold text-white">{timeLeft}s</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#1e2a40] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              backgroundColor: progress > 33 ? modeConf.color : '#ff4757',
            }}
          />
        </div>
      </div>

      {/* Start button */}
      <Button
        variant="primary"
        size="xl"
        className="w-full"
        onClick={onStart}
        loading={loading}
      >
        <Phone size={20} />
        Start Call
      </Button>
    </div>
  )
}
