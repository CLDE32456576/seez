import { useState } from 'react'
import { X } from 'lucide-react'
import { useCallStore } from '../../stores/callStore'
import { api } from '../../lib/api'

export function HintButton({ callId }) {
  const { selectedMode, hintsUsed, hintsLimit, useHint, liveTranscript } = useCallStore()
  const [hints, setHints] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const isHard = selectedMode === 'hard'
  const isExhausted = selectedMode === 'medium' && hintsUsed >= hintsLimit

  const buildContext = () => {
    if (!liveTranscript?.length) return ''
    return liveTranscript
      .slice(-8)
      .map((t) => `${t.role === 'agent' ? 'Prospect' : 'Rep'}: ${t.content}`)
      .join('\n')
  }

  const handleHint = async () => {
    if (loading) return
    setLoading(true)
    setOpen(true)
    try {
      const result = await api.getHint(callId, buildContext())
      setHints((prev) => [result, ...prev])
      useHint()
    } catch {
      setHints((prev) => [{
        title: 'Acknowledge first',
        content: "Label what you sense before responding: \"It sounds like you've been down this road before...\" Then pause.",
      }, ...prev])
      useHint()
    } finally {
      setLoading(false)
    }
  }

  if (isHard) {
    return (
      <div className="flex items-center gap-2 border border-[#444748]/20 px-4 py-2 opacity-30 cursor-not-allowed">
        <span className="material-symbols-outlined text-sm text-[#8e9192]">lock</span>
        <span className="label-caps text-[#8e9192]" style={{ fontSize: '10px' }}>No hints on Hard</span>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-xs">
      {/* Hint panel */}
      {open && hints.length > 0 && (
        <div className="absolute bottom-full mb-3 left-0 right-0 border border-[#dcc662]/20 bg-[#1a1c1c] shadow-2xl max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#444748]/20">
            <span className="label-caps text-[#dcc662]" style={{ fontSize: '9px' }}>
              COACHING HINTS {selectedMode === 'easy' ? '— UNLIMITED' : `— ${Math.max(0, hintsLimit - hintsUsed)} LEFT`}
            </span>
            <button onClick={() => setOpen(false)}>
              <X size={12} className="text-[#8e9192] hover:text-[#c8c6c5]" />
            </button>
          </div>
          <div className="flex flex-col divide-y divide-[#444748]/10">
            {hints.map((h, i) => (
              <div key={i} className="px-4 py-3">
                <p className="label-caps text-[#dcc662] mb-1" style={{ fontSize: '9px' }}>{h.title}</p>
                <p className="font-mono-data text-[11px] text-[#c8c6c5] leading-relaxed">{h.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={isExhausted ? () => setOpen((o) => !o) : handleHint}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border py-2.5 transition-all disabled:opacity-50"
        style={isExhausted
          ? { borderColor: 'rgba(68,71,72,0.3)', color: '#8e9192' }
          : { borderColor: 'rgba(220,198,98,0.3)', background: 'rgba(220,198,98,0.05)', color: '#dcc662' }
        }
      >
        <span className="material-symbols-outlined text-sm">
          {loading ? 'hourglass_empty' : 'psychology'}
        </span>
        <span className="label-caps" style={{ fontSize: '10px' }}>
          {loading
            ? 'THINKING...'
            : isExhausted
            ? `HINTS USED (${hintsUsed})`
            : selectedMode === 'easy'
            ? hints.length === 0 ? 'GET COACHING HINT' : 'GET ANOTHER HINT'
            : `GET HINT (${Math.max(0, hintsLimit - hintsUsed)} LEFT)`
          }
        </span>
      </button>
    </div>
  )
}
