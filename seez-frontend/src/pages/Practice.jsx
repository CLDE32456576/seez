import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScenarioPicker } from '../components/scenarios/ScenarioPicker'
import { Button } from '../components/common/Button'
import { useCallStore } from '../stores/callStore'
import { api } from '../lib/api'

const MODES = [
  { id: 'easy',   label: 'Easy',   desc: 'Warm prospect. Full pitch. Unlimited hints.', color: '#8e9192', multiplier: '1x' },
  { id: 'medium', label: 'Medium', desc: 'Realistic objections. 3 hints max.',          color: '#dcc662', multiplier: '1.25x' },
  { id: 'hard',   label: 'Hard',   desc: 'Hostile. No hints. Prospect can hang up.',    color: '#8B2222', multiplier: '1.5x' },
]

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'spanish', label: 'Español' },
]

export default function Practice() {
  const navigate = useNavigate()
  const { setScenario, setMode, setLanguage, startCall, selectedMode, selectedLanguage } = useCallStore()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleScenarioSelect = (scenario) => {
    setSelected(scenario)
    setScenario(scenario)
  }

  const handleStartCall = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.startCall({ scenario_id: selected.id, mode: selectedMode, language: selectedLanguage })
      startCall(result.call_id, result.retell_call_id, result.access_token)
      navigate('/call/active')
    } catch (err) {
      setError(err.message || 'Could not connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-[1060px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#c8c6c5]">Simulations</h1>
        <p className="font-mono-data text-xs text-[#8e9192] mt-1">Pick a scenario, choose your mode, start the call.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="flex flex-col gap-6">

          {/* Mode */}
          <div className="border border-[#444748]/30 bg-[#1e2020] p-5">
            <p className="label-caps text-[#8e9192] mb-4">Difficulty Mode</p>
            <div className="flex flex-col gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="w-full text-left border p-4 transition-all"
                  style={
                    selectedMode === m.id
                      ? { borderColor: `${m.color}40`, background: `${m.color}08` }
                      : { borderColor: 'rgba(68,71,72,0.3)', background: 'transparent' }
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-header text-sm font-medium" style={{ color: selectedMode === m.id ? m.color : '#c8c6c5' }}>
                      {m.label}
                    </span>
                    <span className="label-caps" style={{ color: selectedMode === m.id ? m.color : '#8e9192', fontSize: '9px' }}>
                      {m.multiplier} ELO
                    </span>
                  </div>
                  <p className="font-mono-data text-[11px] text-[#8e9192]">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="border border-[#444748]/30 bg-[#1e2020] p-5">
            <p className="label-caps text-[#8e9192] mb-4">Language</p>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className="flex-1 label-caps py-3 border transition-all"
                  style={
                    selectedLanguage === l.id
                      ? { borderColor: 'rgba(220,198,98,0.4)', background: 'rgba(220,198,98,0.08)', color: '#dcc662' }
                      : { borderColor: 'rgba(68,71,72,0.3)', color: '#8e9192' }
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected scenario info */}
          {selected && (
            <div className="border border-[#dcc662]/20 bg-[#dcc662]/5 p-4">
              <p className="label-caps text-[#dcc662] mb-1">Selected</p>
              <p className="font-header text-sm font-medium text-[#c8c6c5]">{selected.prospect_name}</p>
              <p className="font-mono-data text-[11px] text-[#8e9192] mt-0.5">{selected.personality_type} · {selected.call_stage}</p>
            </div>
          )}

          {/* Start */}
          {error && (
            <div className="border border-[#8B2222]/30 bg-[#8B2222]/5 p-3">
              <p className="font-mono-data text-[11px] text-[#8B2222]">{error}</p>
            </div>
          )}

          <Button
            variant="primary"
            size="xl"
            className="w-full"
            disabled={!selected}
            loading={loading}
            onClick={handleStartCall}
          >
            <span className="material-symbols-outlined text-sm">mic</span>
            {selected ? `Call ${selected.prospect_name}` : 'Select a scenario'}
          </Button>
        </div>

        {/* Right: Scenario picker */}
        <div className="lg:col-span-2">
          <ScenarioPicker onSelect={handleScenarioSelect} selectedMode={selectedMode} />
        </div>
      </div>
    </div>
  )
}
