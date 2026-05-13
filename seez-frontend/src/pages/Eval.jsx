import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCallStore } from '../stores/callStore'
import { api } from '../lib/api'
import { calculateEloChange } from '../lib/utils'

const SCORE_LABELS = {
  opening: 'OPENING IMPACT',
  rapport: 'RAPPORT DEPTH',
  discovery: 'DISCOVERY QUALITY',
  objection: 'OBJECTION HANDLING',
  closing: 'CLOSING CONFIDENCE',
  adaptability: 'ADAPTABILITY',
}

const GRADE_DESCRIPTOR = {
  'A+': 'Elite',
  A:   'Strong',
  B:   'Solid',
  C:   'Developing',
  D:   'Keep Grinding',
  F:   'Keep Grinding',
}

const EVAL_TIMEOUT_MS = 45_000
const FETCH_TIMEOUT_MS = 10_000
const DEEP_RED = '#8B2222'

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(Object.assign(new Error('TIMEOUT'), { isTimeout: true })), ms)
    ),
  ])

function scoreColor(v) {
  if (v >= 80) return '#dcc662'
  if (v >= 60) return '#c8c6c5'
  return DEEP_RED
}

/** Convert a flat calls table row to the nested eval shape the scorecard expects. */
function normalizeCallRecord(call) {
  return {
    scores: {
      opening:      call.score_opening      ?? 0,
      rapport:      call.score_rapport      ?? 0,
      discovery:    call.score_discovery    ?? 0,
      objection:    call.score_objection    ?? 0,
      closing:      call.score_closing      ?? 0,
      adaptability: call.score_adaptability ?? 0,
    },
    overall:               call.score_overall       ?? 0,
    grade:                 call.grade               ?? '—',
    strengths:             call.strengths           ?? [],
    improvements:          call.improvements        ?? [],
    psychological_insights: call.psychological_insights ?? {},
    coach_note:            call.coach_note          ?? '',
    elo_change:            call.elo_change          ?? 0,
    transcript:            call.transcript          ?? '',
    recommended_kb:        call.kb_tips_surfaced    ?? [],
  }
}

export default function Eval() {
  const { callId } = useParams()
  const navigate = useNavigate()
  const { evalResult, selectedMode, selectedScenario, reset } = useCallStore()
  const [eval_, setEval] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noTranscript, setNoTranscript] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)

  useEffect(() => {
    // Hot session: eval already computed in memory
    if (evalResult && !retryKey) {
      setEval(evalResult)
      setLoading(false)
      return
    }

    if (!callId) { setLoading(false); return }

    setLoading(true)
    setTimedOut(false)
    setNoTranscript(false)

    const run = async () => {
      // Step 1: Always fetch the call record from DB first
      let callRecord = null
      try {
        callRecord = await withTimeout(api.getCall(callId), FETCH_TIMEOUT_MS)
      } catch (err) {
        if (err.isTimeout) { setTimedOut(true); setLoading(false); return }
        // 404 or other error — call doesn't exist or not accessible
        setNoTranscript(true)
        setLoading(false)
        return
      }

      // Step 2: If already scored → normalize and render immediately
      if (callRecord?.score_overall && callRecord?.grade) {
        setEval(normalizeCallRecord(callRecord))
        setLoading(false)
        return
      }

      // Step 3: Not yet scored → trigger evaluation
      try {
        const result = await withTimeout(api.endCall(callId), EVAL_TIMEOUT_MS)
        if (result?.eval) {
          setEval(result.eval)
        } else {
          setNoTranscript(true)
        }
      } catch (err) {
        if (err.isTimeout) setTimedOut(true)
        else setNoTranscript(true)
      }
      setLoading(false)
    }

    run()
  }, [callId, retryKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setTimedOut(false)
    setNoTranscript(false)
    setLoading(true)
    setRetryKey((k) => k + 1)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 mx-auto border border-[#dcc662]/20 bg-[#1e2020] flex items-center justify-center mb-8">
            <svg className="animate-spin h-7 w-7 text-[#dcc662]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-[#c8c6c5] mb-3">Evaluating Performance</h2>
          <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed">
            AI coach is reviewing your transcript, scoring each dimension, and identifying key moments.
          </p>
          <p className="font-mono-data text-[10px] text-[#444748] mt-3">Takes 15–30 seconds</p>
        </div>
      </div>
    )
  }

  // ── Timeout ───────────────────────────────────────────────────────────────
  if (timedOut) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 mx-auto border flex items-center justify-center mb-8"
            style={{ borderColor: `${DEEP_RED}40`, background: `${DEEP_RED}08` }}
          >
            <span className="material-symbols-outlined text-3xl" style={{ color: DEEP_RED }}>timer_off</span>
          </div>
          <h2 className="font-display text-3xl text-[#c8c6c5] mb-3">Evaluation Timed Out</h2>
          <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed mb-8">
            The AI coach took longer than expected. The call was recorded — try again or return to dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={handleRetry} className="label-caps text-[#393000] bg-[#dcc662] px-6 py-3 hover:bg-[#c9b452] transition-colors">
              Try Again
            </button>
            <button onClick={() => { reset(); navigate('/dashboard') }} className="label-caps text-[#8e9192] border border-[#444748]/30 px-6 py-3 hover:text-[#c8c6c5] transition-colors">
              Skip to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── No transcript ─────────────────────────────────────────────────────────
  if (noTranscript) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-sm">
          <div className="border px-4 py-3 mb-8 flex items-center gap-3" style={{ borderColor: `${DEEP_RED}30`, background: `${DEEP_RED}08` }}>
            <span className="material-symbols-outlined text-sm flex-shrink-0" style={{ color: DEEP_RED }}>warning</span>
            <p className="font-mono-data text-[11px] text-[#c8c6c5] text-left">No conversation was captured to evaluate.</p>
          </div>
          <div className="w-20 h-20 mx-auto border border-[#444748]/30 bg-[#1e2020] flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-3xl text-[#8e9192]">mic_off</span>
          </div>
          <h2 className="font-display text-3xl text-[#c8c6c5] mb-3">No Transcript Recorded</h2>
          <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed mb-6">
            The call was too short or silent. Make sure your microphone is working and the call runs for at least 30 seconds.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { reset(); navigate('/practice') }} className="label-caps text-[#393000] bg-[#dcc662] px-6 py-3 hover:bg-[#c9b452] transition-colors">
              Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="label-caps text-[#8e9192] border border-[#444748]/30 px-6 py-3 hover:text-[#c8c6c5] transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!eval_) return null

  const { scores, grade, overall, strengths, improvements, psychological_insights, coach_note, elo_change, transcript } = eval_
  const eloChange = elo_change ?? calculateEloChange(grade, selectedMode)
  const scoreEntries = scores ? Object.entries(scores) : []
  const overallInt = overall || 0
  const overallTen = (overallInt / 10).toFixed(1)
  const gradeDesc = GRADE_DESCRIPTOR[grade] || 'Keep Grinding'
  const scenario = selectedScenario

  // Filter out N/A padding entries
  const validStrengths = strengths?.filter(
    (s) => s && !s.toLowerCase().startsWith('n/a') && s.trim().length > 15
  ) ?? []
  const validImprovements = improvements?.filter(
    (s) => s && !s.toLowerCase().startsWith('n/a') && s.trim().length > 15
  ) ?? []

  return (
    <div className="p-8 md:p-12 max-w-[1060px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 label-caps text-[#8e9192] hover:text-[#c8c6c5] transition-colors mb-3"
            style={{ fontSize: '10px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>
            Back
          </button>
          <h1 className="font-display text-5xl text-[#c8c6c5] mb-2">Simulation Analysis</h1>
          <p className="font-mono-data text-xs text-[#8e9192]">
            {scenario ? `SCENARIO: ${scenario.name?.toUpperCase()} · ` : ''}
            GRADE: {grade}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Link to="/history" className="flex items-center gap-2 label-caps text-[#8e9192] border border-[#444748]/30 px-4 py-2.5 hover:border-[#c8c6c5]/20 hover:text-[#c8c6c5] transition-colors">
            <span className="material-symbols-outlined text-sm">history</span>
            History
          </Link>
          <button
            onClick={() => { reset(); navigate('/practice') }}
            className="flex items-center gap-2 label-caps text-[#393000] bg-[#dcc662] px-4 py-2.5 hover:bg-[#c9b452] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">mic</span>
            Another Call
          </button>
        </div>
      </div>

      {/* Top row: Score + Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overall score */}
        <div className="border border-[#444748]/30 bg-[#1e2020] p-8">
          <p className="label-caps text-[#8e9192] mb-6">OVERALL MASTERY SCORE</p>
          <div className="mb-6">
            {/* Score with denominator */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display leading-none" style={{ fontSize: 80, color: scoreColor(overallInt) }}>
                {overallTen}
              </span>
              <span className="font-mono-data text-2xl text-[#444748] mb-2">/ 10</span>
            </div>
            {/* Grade descriptor */}
            <p className="font-mono-data text-sm mb-3" style={{ color: scoreColor(overallInt) }}>
              {grade} — {gradeDesc}
            </p>
            {/* ELO change */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: eloChange >= 0 ? '#dcc662' : DEEP_RED }}>
                {eloChange >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span className="font-mono-data text-sm font-semibold" style={{ color: eloChange >= 0 ? '#dcc662' : DEEP_RED }}>
                {eloChange >= 0 ? '+' : ''}{eloChange} ELO
              </span>
            </div>
          </div>
          {coach_note && (
            <blockquote className="border-l-2 border-[#dcc662]/40 pl-4 mb-6">
              <p className="font-mono-data text-xs text-[#8e9192] italic leading-relaxed">"{coach_note.slice(0, 200)}{coach_note.length > 200 ? '...' : ''}"</p>
            </blockquote>
          )}
          <div className="pt-4 border-t border-[#444748]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="label-caps text-[#8e9192]" style={{ fontSize: '9px' }}>TIER IMPACT</span>
              <span className="label-caps text-[#dcc662]" style={{ fontSize: '9px' }}>{Math.min(100, Math.abs(eloChange) * 2)}%</span>
            </div>
            <div className="w-full h-[2px] bg-[#333535]">
              <div className="h-full bg-gradient-to-r from-[#c8c6c5] to-[#dcc662]" style={{ width: `${Math.min(100, Math.abs(eloChange) * 2)}%` }} />
            </div>
          </div>
        </div>

        {/* All 6 dimension scores */}
        <div className="border border-[#444748]/30 bg-[#1e2020] p-8">
          <p className="label-caps text-[#8e9192] mb-6">DIMENSION SCORES</p>
          <div className="flex flex-col gap-4">
            {scoreEntries.map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="label-caps text-[#c8c6c5]" style={{ fontSize: '10px' }}>{SCORE_LABELS[key] || key.toUpperCase()}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-[2px] bg-[#333535]">
                    <div className="h-full transition-all" style={{ width: `${val}%`, background: scoreColor(val) }} />
                  </div>
                  <span className="font-mono-data text-sm font-semibold w-8 text-right" style={{ color: scoreColor(val) }}>
                    {(val / 10).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {psychological_insights && Object.keys(psychological_insights).length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#444748]/20">
              <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>PSYCHOLOGICAL ANALYSIS</p>
              <div className="flex flex-col gap-2">
                {Object.entries(psychological_insights).slice(0, 3).map(([key, val]) => (
                  <div key={key}>
                    <span className="font-mono-data text-[10px] text-[#8e9192] capitalize">{key.replace(/_/g, ' ')}: </span>
                    <span className="font-mono-data text-[10px] text-[#c8c6c5]">{String(val).slice(0, 80)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strengths + Next Moves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border border-[#444748]/30 bg-[#1e2020] p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#dcc662]">bolt</span>
            <h2 className="font-header text-base font-medium text-[#c8c6c5]">Strengths</h2>
          </div>
          {validStrengths.length > 0 ? (
            <div className="flex flex-col gap-5">
              {validStrengths.map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="border border-[#dcc662]/20 px-2 py-1 flex-shrink-0" style={{ background: 'rgba(220,198,98,0.05)' }}>
                    <span className="font-mono-data text-[10px] text-[#dcc662]">{i + 1}</span>
                  </div>
                  <p className="font-mono-data text-[11px] text-[#8e9192] leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono-data text-xs text-[#8e9192]">Call was too short to identify specific strengths.</p>
          )}
        </div>

        <div className="border border-[#444748]/30 bg-[#1e2020] p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#c8c6c5]">target</span>
            <h2 className="font-header text-base font-medium text-[#c8c6c5]">Next Moves</h2>
          </div>
          {validImprovements.length > 0 ? (
            <div className="flex flex-col gap-5">
              {validImprovements.map((s, i) => {
                const sentences = s.split('. ')
                const hasTry = sentences.findIndex((x) => x.toLowerCase().includes('try:'))
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="border px-2 py-1 flex-shrink-0" style={{ borderColor: `${DEEP_RED}25`, background: `${DEEP_RED}06` }}>
                      <span className="font-mono-data text-[10px]" style={{ color: DEEP_RED }}>FIX {i + 1}</span>
                    </div>
                    <div>
                      <p className="font-mono-data text-[11px] text-[#8e9192] leading-relaxed mb-2">{s}</p>
                      {hasTry >= 0 && (
                        <div className="border border-[#dcc662]/20 px-3 py-2" style={{ background: 'rgba(220,198,98,0.03)' }}>
                          <p className="font-mono-data text-[11px] text-[#dcc662] italic">"{sentences[hasTry].replace(/try:/i, '').trim()}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="font-mono-data text-xs text-[#8e9192]">Complete a longer call to get specific improvement feedback.</p>
          )}
          <div className="mt-6 pt-5 border-t border-[#444748]/20">
            <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>RECOMMENDED KNOWLEDGE BASE</p>
            <div className="flex flex-col gap-2">
              <Link to="/learn" className="flex items-center justify-between py-2 border-b border-[#444748]/10 hover:opacity-70 transition-opacity">
                <span className="font-mono-data text-xs text-[#c8c6c5]">Tactical Empathy</span>
                <span className="material-symbols-outlined text-sm text-[#444748]">arrow_forward</span>
              </Link>
              <Link to="/learn" className="flex items-center justify-between py-2 hover:opacity-70 transition-opacity">
                <span className="font-mono-data text-xs text-[#c8c6c5]">The Conditional Close</span>
                <span className="material-symbols-outlined text-sm text-[#444748]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible transcript */}
      {transcript && (
        <div className="border border-[#444748]/30 bg-[#1e2020] mb-6">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-6 hover:bg-[#282a2b] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-[#8e9192]">receipt_long</span>
              <span className="label-caps text-[#8e9192]">Full Transcript</span>
            </div>
            <span className="material-symbols-outlined text-sm text-[#8e9192]">
              {showTranscript ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showTranscript && (
            <div className="px-6 pb-6 border-t border-[#444748]/20">
              <div className="mt-4 font-mono-data text-xs text-[#8e9192] leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {transcript}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
