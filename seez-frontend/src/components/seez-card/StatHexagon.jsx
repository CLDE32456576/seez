import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const STAT_LABELS = {
  opening_stat: 'OPN',
  rapport_stat: 'RAP',
  discovery_stat: 'DIS',
  objection_stat: 'OBJ',
  closing_stat: 'CLO',
  adaptability_stat: 'ADP',
}

const STAT_FULL_NAMES = {
  OPN: 'Opening Impact',
  RAP: 'Rapport Depth',
  DIS: 'Discovery Quality',
  OBJ: 'Objection Handling',
  CLO: 'Closing Confidence',
  ADP: 'Adaptability',
}

function CustomTick({ x, y, payload }) {
  const fullName = STAT_FULL_NAMES[payload.value] || payload.value
  return (
    <g>
      <title>{fullName}</title>
      <text
        x={x}
        y={y}
        fill="#8e9192"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ cursor: 'default' }}
      >
        <title>{fullName}</title>
        {payload.value}
      </text>
    </g>
  )
}

export function StatHexagon({ stats, size = 200 }) {
  const data = Object.entries(STAT_LABELS).map(([key, label]) => ({
    subject: label,
    value: stats?.[key] ?? 50,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width={size} height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <PolarGrid stroke="#444748" strokeOpacity={0.3} />
        <PolarAngleAxis dataKey="subject" tick={<CustomTick />} />
        <Radar
          name="Stats"
          dataKey="value"
          stroke="#dcc662"
          fill="#dcc662"
          fillOpacity={0.12}
          strokeWidth={1.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
