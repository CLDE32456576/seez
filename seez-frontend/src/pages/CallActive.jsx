import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCallStore } from '../stores/callStore'
import { ActiveCall } from '../components/call/ActiveCall'

export default function CallActive() {
  const navigate = useNavigate()
  const { isCallActive, selectedScenario } = useCallStore()

  // Only guard on initial mount — don't navigate away reactively while ending
  useEffect(() => {
    if (!isCallActive) navigate('/practice')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#080b12]">
      <ActiveCall scenario={selectedScenario} />
    </div>
  )
}
