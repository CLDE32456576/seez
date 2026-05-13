import { useState, useEffect } from 'react'
import { Search, Shuffle } from 'lucide-react'
import { ScenarioCard } from './ScenarioCard'
import { Button } from '../common/Button'
import { api } from '../../lib/api'
import { MOCK_SCENARIOS } from '../../lib/mockData'

const STAGES = ['All', 'Cold Call', 'Discovery Call', 'Demo / Pitch', 'Objection Handling', 'Closing Call', 'Follow-up', 'Negotiation']

const PERSONALITIES = [
  'All', 'Skeptic', 'Ghost', 'Price Objector', 'Overanalyzer',
  'Gatekeeper', 'Burned Buyer', 'Friendly Waster', 'Urgency Seeker',
  'Process Person', 'Alpha',
]

// Inactive pill style — uses CSS variables so it works in both light + dark mode
const PILL_OFF = {
  borderColor: 'var(--border-lo)',
  background: 'var(--bg-input)',
  color: 'var(--text-mid)',
}
const PILL_ON = {
  borderColor: 'rgba(220,198,98,0.4)',
  background: 'rgba(220,198,98,0.08)',
  color: '#dcc662',
}

export function ScenarioPicker({ onSelect, selectedMode }) {
  const [scenarios, setScenarios] = useState(MOCK_SCENARIOS)
  const [selected, setSelected] = useState(null)
  const [stage, setStage] = useState('All')
  const [personality, setPersonality] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPersonalityFilter, setShowPersonalityFilter] = useState(false)

  useEffect(() => { loadScenarios() }, [stage, personality])

  const loadScenarios = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (stage !== 'All') filters.call_stage = stage
      if (personality !== 'All') filters.personality_type = personality
      const data = await api.getScenarios(filters)
      setScenarios(data)
    } catch {
      setScenarios(MOCK_SCENARIOS)
    } finally {
      setLoading(false)
    }
  }

  const handleRandom = async () => {
    setLoading(true)
    try {
      const scenario = await api.getRandomScenario(selectedMode)
      setSelected(scenario)
      onSelect?.(scenario)
    } catch {
      const random = MOCK_SCENARIOS[Math.floor(Math.random() * MOCK_SCENARIOS.length)]
      setSelected(random)
      onSelect?.(random)
    } finally {
      setLoading(false)
    }
  }

  const filtered = scenarios.filter((s) => {
    if (search === '') return true
    const q = search.toLowerCase()
    return (
      s.name?.toLowerCase().includes(q) ||
      s.prospect_name?.toLowerCase().includes(q) ||
      s.industry?.toLowerCase().includes(q) ||
      s.personality_type?.toLowerCase().includes(q) ||
      s.prospect_company?.toLowerCase().includes(q)
    )
  })

  const activeFilters = (stage !== 'All' ? 1 : 0) + (personality !== 'All' ? 1 : 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Random */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          {/* Icon — pointer-events-none so it never blocks clicks */}
          <Search
            size={14}
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: 12, color: 'var(--text-mid)' }}
          />
          <input
            type="text"
            placeholder="Search by name, company, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border focus:outline-none transition-colors font-mono-data text-sm"
            style={{
              paddingLeft: '2.25rem',   /* 36px — clears the 14px icon at left:12px */
              paddingRight: '1rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              background: 'var(--bg-card)',
              borderColor: 'var(--border-lo)',
              color: 'var(--text-hi)',
            }}
          />
        </div>
        <Button variant="secondary" size="md" onClick={handleRandom} loading={loading}>
          <Shuffle size={14} />
          Random
        </Button>
      </div>

      {/* Stage filters */}
      <div className="flex gap-1.5 flex-wrap">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className="label-caps px-3 py-1.5 border transition-colors"
            style={stage === s ? PILL_ON : PILL_OFF}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Personality filter toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPersonalityFilter(!showPersonalityFilter)}
          className="label-caps px-3 py-1.5 border transition-colors flex items-center gap-1.5"
          style={personality !== 'All' ? PILL_ON : PILL_OFF}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>psychology</span>
          {personality !== 'All' ? personality : 'Personality'}
          {personality !== 'All' && (
            <span
              onClick={(e) => { e.stopPropagation(); setPersonality('All') }}
              className="ml-1 opacity-60 hover:opacity-100"
            >×</span>
          )}
        </button>

        {activeFilters > 0 && (
          <button
            onClick={() => { setStage('All'); setPersonality('All') }}
            className="label-caps px-2 py-1.5 transition-colors"
            style={{ fontSize: '9px', color: 'var(--text-mid)' }}
          >
            Clear filters ({activeFilters})
          </button>
        )}

        <span className="label-caps ml-auto" style={{ fontSize: '9px', color: 'var(--text-mid)' }}>
          {filtered.length} scenarios
        </span>
      </div>

      {/* Personality chips dropdown */}
      {showPersonalityFilter && (
        <div className="flex gap-1.5 flex-wrap border p-3" style={{ borderColor: 'var(--border-lo)', background: 'var(--bg-input)' }}>
          {PERSONALITIES.map((p) => (
            <button
              key={p}
              onClick={() => { setPersonality(p); setShowPersonalityFilter(false) }}
              className="label-caps px-3 py-1.5 border transition-colors"
              style={personality === p ? PILL_ON : { ...PILL_OFF, background: 'transparent' }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
        {filtered.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            selected={selected?.id === scenario.id}
            onClick={(s) => { setSelected(s); onSelect?.(s) }}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center border" style={{ borderColor: 'var(--border-lo)', background: 'var(--bg-card)' }}>
            <span className="material-symbols-outlined text-4xl block mb-2" style={{ color: 'var(--text-lo)' }}>search_off</span>
            <p className="font-mono-data text-xs" style={{ color: 'var(--text-mid)' }}>No scenarios found</p>
          </div>
        )}
      </div>
    </div>
  )
}
