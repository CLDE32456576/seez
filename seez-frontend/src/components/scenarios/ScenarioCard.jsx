const DEEP_RED = '#8B2222'

const PERSONALITY_COLORS = {
  Skeptic: DEEP_RED,
  Ghost: '#8e9192',
  'Price Objector': '#dcc662',
  Overanalyzer: '#c8c6c5',
  Gatekeeper: DEEP_RED,
  'Burned Buyer': DEEP_RED,
  'Friendly Waster': '#c8c6c5',
  'Urgency Seeker': '#dcc662',
  'Process Person': '#c8c6c5',
  Alpha: '#dcc662',
}

const STAGE_COLORS = {
  'Cold Call': DEEP_RED,
  'Discovery Call': '#c8c6c5',
  'Demo / Pitch': '#dcc662',
  'Objection Handling': DEEP_RED,
  'Closing Call': '#dcc662',
  'Follow-up': '#8e9192',
  'Negotiation': '#c8c6c5',
}

export function ScenarioCard({ scenario, selected, onClick }) {
  const pColor = PERSONALITY_COLORS[scenario.personality_type] || '#8e9192'
  const sColor = STAGE_COLORS[scenario.call_stage] || '#8e9192'

  return (
    <button
      onClick={() => onClick?.(scenario)}
      className="w-full text-left border p-5 transition-all"
      style={
        selected
          ? { borderColor: 'rgba(220,198,98,0.4)', background: 'rgba(220,198,98,0.05)' }
          : { borderColor: 'var(--border-lo)', background: 'var(--bg-card)' }
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-header text-sm font-medium" style={{ color: 'var(--text-hi)' }}>
            {scenario.prospect_name || scenario.name}
          </p>
          <p className="font-mono-data text-[11px] mt-0.5" style={{ color: 'var(--text-mid)' }}>
            {scenario.prospect_role}
          </p>
        </div>
        {/* Difficulty dots */}
        <div className="flex gap-1 mt-0.5">
          {[1, 2, 3, 4, 5].map((d) => (
            <div
              key={d}
              className="h-1.5 w-1.5"
              style={{ background: d <= (scenario.difficulty_rating || 3) ? '#dcc662' : 'var(--border-lo)' }}
            />
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span
          className="label-caps px-2 py-0.5 border"
          style={{ color: pColor, borderColor: `${pColor}25`, background: `${pColor}08`, fontSize: '9px' }}
        >
          {scenario.personality_type}
        </span>
        <span
          className="label-caps px-2 py-0.5 border"
          style={{ color: sColor, borderColor: `${sColor}25`, background: `${sColor}08`, fontSize: '9px' }}
        >
          {scenario.call_stage}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 font-mono-data text-[10px]" style={{ color: 'var(--text-mid)' }}>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>business</span>
          {scenario.industry}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>translate</span>
          {scenario.language === 'both' ? 'EN / ES' : scenario.language}
        </span>
      </div>

      {scenario.default_product && (
        <p className="mt-2 font-mono-data text-[10px] truncate" style={{ color: 'var(--text-mid)', opacity: 0.6 }}>
          Selling: {scenario.default_product}
        </p>
      )}
    </button>
  )
}
