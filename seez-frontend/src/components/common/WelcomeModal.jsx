import { useNavigate } from 'react-router-dom'

const STATS = [
  { abbr: 'OPN', name: 'Opening', desc: 'Hook them in the first 30 seconds or lose them.' },
  { abbr: 'RAP', name: 'Rapport', desc: 'Build real connection — not just small talk.' },
  { abbr: 'DIS', name: 'Discovery', desc: 'Ask the right questions. Find the actual pain.' },
  { abbr: 'OBJ', name: 'Objection', desc: 'Handle pushback without crumbling.' },
  { abbr: 'CLO', name: 'Closing', desc: 'Ask for the yes. Every call needs a next step.' },
  { abbr: 'ADP', name: 'Adaptability', desc: 'Adjust when they change direction on you.' },
]

export function WelcomeModal({ userId, onClose }) {
  const navigate = useNavigate()

  const dismiss = () => {
    if (userId) localStorage.setItem(`seez_onboarded_${userId}`, '1')
    onClose()
  }

  const handleStart = () => {
    dismiss()
    navigate('/practice')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8,11,18,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-lg border border-[#444748]/30 bg-[#121414] relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Gold top bar */}
        <div className="h-[3px] bg-gradient-to-r from-[#dcc662] to-[#c9b452]" />

        <div className="p-10">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-6 right-6 text-[#8e9192] hover:text-[#c8c6c5] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <p className="label-caps text-[#dcc662] mb-3" style={{ fontSize: '9px' }}>WELCOME TO SEEZ</p>
            <h2 className="font-display text-3xl font-semibold text-[#c8c6c5] mb-4">
              The gym for your<br />sales muscle.
            </h2>
            <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed">
              You practice live voice calls against a brutally realistic AI prospect. It pushes back, interrupts, goes cold, and hangs up if you're bad. After every call, you get scored across 6 dimensions and your stat card updates — just like FIFA, but for your sales career.
            </p>
          </div>

          {/* Stats grid */}
          <div className="mb-8">
            <p className="label-caps text-[#8e9192] mb-4" style={{ fontSize: '9px' }}>YOUR 6 STATS — WHAT THEY MEASURE</p>
            <div className="grid grid-cols-2 gap-2">
              {STATS.map((s) => (
                <div key={s.abbr} className="border border-[#444748]/30 bg-[#1e2020] p-3 flex items-start gap-3">
                  <span className="font-mono-data text-xs font-bold text-[#dcc662] flex-shrink-0 mt-0.5 w-8">{s.abbr}</span>
                  <div>
                    <p className="label-caps text-[#c8c6c5] mb-0.5" style={{ fontSize: '9px' }}>{s.name}</p>
                    <p className="font-mono-data text-[10px] text-[#8e9192] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="border-l-2 border-[#dcc662]/40 pl-4 mb-8">
            <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed">
              Pick a scenario → choose Easy, Medium, or Hard mode → start the call. After every call your stats update, your ELO moves, and your card evolves. Climb from Grinder to The Don.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
            className="w-full bg-[#dcc662] text-[#393000] label-caps py-4 flex items-center justify-center gap-2 hover:bg-[#c9b452] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mic</span>
            Start Your First Call →
          </button>
        </div>
      </div>
    </div>
  )
}
