import { useEffect, useRef, useState } from 'react'
import { PhoneOff, Mic, MicOff, AlertCircle } from 'lucide-react'
import { CallTimer } from './CallTimer'
import { HintButton } from './HintButton'
import { PitchGuide } from './PitchGuide'
import { useCallStore } from '../../stores/callStore'
import { api } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const DEEP_RED = '#8B2222'

const PERSONALITY_ICONS = {
  Skeptic: 'psychology', Ghost: 'cloud', 'Price Objector': 'payments',
  Overanalyzer: 'analytics', Gatekeeper: 'lock', 'Burned Buyer': 'warning',
  'Friendly Waster': 'handshake', 'Urgency Seeker': 'bolt',
  'Process Person': 'checklist', Alpha: 'military_tech',
}

export function ActiveCall({ scenario }) {
  const navigate = useNavigate()
  const { callId, callStartTime, retellAccessToken, endCall, setLiveTranscript, selectedMode } = useCallStore()
  const [ending, setEnding] = useState(false)
  const [muted, setMuted] = useState(false)
  const [waveValues, setWaveValues] = useState(Array(12).fill(4))
  const [callStatus, setCallStatus] = useState('connecting')
  const [callError, setCallError] = useState(null)
  const [agentTalking, setAgentTalking] = useState(false)
  const retellRef = useRef(null)
  const waveInterval = useRef(null)

  useEffect(() => {
    if (callStatus !== 'active') return
    waveInterval.current = setInterval(() => {
      setWaveValues(Array(12).fill(0).map(() =>
        agentTalking ? Math.random() * 32 + 8 : Math.random() * 14 + 4
      ))
    }, 120)
    return () => clearInterval(waveInterval.current)
  }, [callStatus, agentTalking])

  useEffect(() => {
    if (!retellAccessToken) {
      setCallStatus('error')
      setCallError('No access token — backend may be offline or CORS is blocking.')
      return
    }

    let isMounted = true

    const initRetell = async () => {
      try {
        const { RetellWebClient } = await import('retell-client-js-sdk')
        if (!isMounted) return

        const client = new RetellWebClient()
        retellRef.current = client

        client.on('call_started', () => { if (isMounted) setCallStatus('active') })
        client.on('call_ended', () => { if (isMounted && !ending) handleEndCall() })
        client.on('agent_start_talking', () => { if (isMounted) setAgentTalking(true) })
        client.on('agent_stop_talking', () => { if (isMounted) setAgentTalking(false) })
        client.on('update', (update) => {
          if (isMounted && update?.transcript) setLiveTranscript(update.transcript)
        })
        client.on('error', (err) => {
          if (isMounted) {
            setCallStatus('error')
            setCallError(String(err?.message || err || 'Audio connection failed'))
          }
        })

        await client.startCall({ accessToken: retellAccessToken })
      } catch (err) {
        if (isMounted) {
          setCallStatus('error')
          setCallError(err?.message || 'Failed to start audio. Check microphone permissions.')
        }
      }
    }

    initRetell()

    return () => {
      isMounted = false
      if (retellRef.current) {
        retellRef.current.stopCall?.()
        retellRef.current = null
      }
    }
  }, [retellAccessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMute = () => {
    const next = !muted
    setMuted(next)
    if (retellRef.current) {
      try {
        retellRef.current.mute?.(next)
        if (next) retellRef.current.muteAudio?.()
        else retellRef.current.unmuteAudio?.()
      } catch (e) { /* ignore */ }
    }
  }

  const handleEndCall = () => {
    if (ending) return
    setEnding(true)
    clearInterval(waveInterval.current)
    retellRef.current?.stopCall?.()
    retellRef.current = null
    endCall(null)
    navigate(`/eval/${callId}`)
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen py-12 px-4">
      {/* Prospect info */}
      <div className="text-center space-y-3">
        <div className="flex h-20 w-20 mx-auto items-center justify-center border border-[#444748]/30 bg-[#1e2020]">
          <span className="material-symbols-outlined text-3xl text-[#8e9192]">
            {PERSONALITY_ICONS[scenario?.personality_type] || 'person'}
          </span>
        </div>
        <div>
          <h2 className="font-display text-2xl text-[#c8c6c5]">{scenario?.prospect_name}</h2>
          <p className="font-mono-data text-xs text-[#8e9192] mt-1">
            {scenario?.prospect_role} · {scenario?.prospect_company}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2">
          {callStatus === 'connecting' && (
            <>
              <div className="h-2 w-2 rounded-full bg-[#dcc662] animate-pulse" />
              <span className="font-mono-data text-xs text-[#dcc662]">CONNECTING</span>
            </>
          )}
          {callStatus === 'active' && (
            <>
              <div className="h-2 w-2 rounded-full bg-[#4caf8a] animate-pulse" />
              <span className="font-mono-data text-xs text-[#4caf8a]">LIVE</span>
            </>
          )}
          {callStatus === 'error' && (
            <div
              className="flex items-center gap-2 border px-3 py-2 max-w-xs"
              style={{ borderColor: `${DEEP_RED}30`, background: `${DEEP_RED}08` }}
            >
              <AlertCircle size={14} style={{ color: DEEP_RED }} className="shrink-0" />
              <p className="font-mono-data text-[11px]" style={{ color: DEEP_RED }}>{callError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-end gap-1 h-16">
          {waveValues.map((h, i) => (
            <div
              key={i}
              className="w-1.5 transition-all duration-100"
              style={{
                height: `${h}px`,
                background: callStatus === 'active' ? '#dcc662' : '#444748',
                opacity: muted ? 0.3 : callStatus === 'connecting' ? 0.4 : 1,
              }}
            />
          ))}
        </div>
        {callStatus === 'active' && <CallTimer startTime={callStartTime || Date.now()} />}
        {callStatus === 'connecting' && (
          <p className="font-mono-data text-xs text-[#8e9192] animate-pulse">Establishing connection...</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {callStatus === 'active' && (
          <div className="w-full flex flex-col gap-2">
            {selectedMode === 'easy' && <PitchGuide callId={callId} />}
            <HintButton callId={callId} />
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Mute — uses gold accent when muted, neutral otherwise */}
          <button
            onClick={handleMute}
            disabled={callStatus !== 'active'}
            className="flex h-12 w-12 items-center justify-center border transition-all disabled:opacity-30"
            style={muted
              ? { borderColor: 'rgba(220,198,98,0.4)', background: 'rgba(220,198,98,0.1)', color: '#dcc662' }
              : { borderColor: 'rgba(68,71,72,0.3)', background: '#1e2020', color: '#8e9192' }
            }
          >
            {muted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Hang up — deep red, not pink */}
          <button
            onClick={handleEndCall}
            disabled={ending}
            className="flex h-16 w-16 items-center justify-center text-[#e2e2e2] transition-all disabled:opacity-50 hover:opacity-90 active:scale-95"
            style={{ background: DEEP_RED }}
          >
            {ending ? (
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <PhoneOff size={22} />
            )}
          </button>

          <div className="h-12 w-12" />
        </div>

        <p className="font-mono-data text-[10px] text-[#444748]">Say "SEEZ stop" to exit roleplay</p>
      </div>
    </div>
  )
}
