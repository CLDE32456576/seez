import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../../lib/api'

function Section({ label, children }) {
  return (
    <div className="border-b border-[#444748]/20 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <p className="label-caps text-[#dcc662] mb-3" style={{ fontSize: '9px' }}>{label}</p>
      {children}
    </div>
  )
}

function Script({ text }) {
  return (
    <div className="border-l-2 border-[#dcc662]/30 pl-3 mt-2">
      <p className="font-mono-data text-[11px] text-[#c8c6c5] italic leading-relaxed">"{text}"</p>
    </div>
  )
}

export function PitchGuide({ callId }) {
  const [open, setOpen] = useState(false)
  const [pitch, setPitch] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleOpen = async () => {
    setOpen(true)
    if (pitch) return
    setLoading(true)
    try {
      const result = await api.getPitch(callId)
      setPitch(result)
    } catch {
      setPitch(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 border py-2.5 transition-all"
        style={{ borderColor: 'rgba(220,198,98,0.4)', background: 'rgba(220,198,98,0.06)', color: '#dcc662' }}
      >
        <span className="material-symbols-outlined text-sm">menu_book</span>
        <span className="label-caps" style={{ fontSize: '10px' }}>SHOW PITCH GUIDE</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[85vh] bg-[#141616] border border-[#dcc662]/20 flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#444748]/20 shrink-0">
              <div>
                <p className="font-header text-sm font-medium text-[#c8c6c5]">Full Pitch Guide</p>
                <p className="font-mono-data text-[10px] text-[#8e9192] mt-0.5">Easy mode — word-for-word playbook</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#8e9192] hover:text-[#c8c6c5] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <svg className="animate-spin h-6 w-6 text-[#dcc662]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="font-mono-data text-xs text-[#8e9192]">Building your pitch guide...</p>
                </div>
              )}

              {!loading && !pitch && (
                <p className="font-mono-data text-xs text-[#8e9192] text-center py-12">Failed to load pitch guide.</p>
              )}

              {!loading && pitch && (
                <>
                  {/* Opening */}
                  <Section label="OPENING">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="font-mono-data text-[10px] text-[#8e9192] mb-1">HOOK</p>
                        <Script text={pitch.opening.hook} />
                      </div>
                      <div>
                        <p className="font-mono-data text-[10px] text-[#8e9192] mb-1">SET THE AGENDA</p>
                        <Script text={pitch.opening.agenda} />
                      </div>
                      <div>
                        <p className="font-mono-data text-[10px] text-[#8e9192] mb-1">ASK FOR TIME</p>
                        <Script text={pitch.opening.permission_ask} />
                      </div>
                    </div>
                  </Section>

                  {/* Discovery */}
                  <Section label="DISCOVERY QUESTIONS">
                    <div className="flex flex-col gap-4">
                      {pitch.discovery_questions?.map((q, i) => (
                        <div key={i}>
                          <Script text={q.question} />
                          <p className="font-mono-data text-[10px] text-[#8e9192] mt-1.5 ml-3">
                            <span className="text-[#444748]">WHY: </span>{q.purpose}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Pitch Points */}
                  <Section label="YOUR PITCH">
                    <div className="flex flex-col gap-5">
                      {pitch.pitch_points?.map((p, i) => (
                        <div key={i} className="border border-[#444748]/20 bg-[#1e2020] p-4">
                          <p className="label-caps text-[#c8c6c5] mb-1" style={{ fontSize: '10px' }}>{p.headline}</p>
                          <p className="font-mono-data text-[10px] text-[#8e9192] mb-2">{p.proof}</p>
                          <Script text={p.script} />
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Objection Handlers */}
                  <Section label="OBJECTION HANDLERS">
                    <div className="flex flex-col gap-4">
                      {pitch.objection_handlers?.map((o, i) => (
                        <div key={i}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className="label-caps text-[#8e9192] shrink-0 mt-0.5" style={{ fontSize: '9px' }}>THEY SAY</span>
                            <p className="font-mono-data text-[11px] text-[#8e9192]">"{o.objection}"</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="label-caps text-[#dcc662] shrink-0 mt-0.5" style={{ fontSize: '9px' }}>YOU SAY</span>
                            <Script text={o.response} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Closing */}
                  <Section label="CLOSING MOVE">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="font-mono-data text-[10px] text-[#8e9192] mb-1">TEST THE TEMPERATURE</p>
                        <Script text={pitch.closing_move.trial_close} />
                      </div>
                      <div>
                        <p className="font-mono-data text-[10px] text-[#8e9192] mb-1">THE ASK</p>
                        <Script text={pitch.closing_move.ask} />
                      </div>
                      <div>
                        <p className="font-mono-data text-[10px] text-[#8e9192] mb-1">IF THEY PUSH BACK</p>
                        <Script text={pitch.closing_move.fallback} />
                      </div>
                    </div>
                  </Section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
