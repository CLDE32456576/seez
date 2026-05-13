import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useCallStore } from '../stores/callStore'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'

function Section({ title, icon, children }) {
  return (
    <div className="border border-[#444748]/30 bg-[#1e2020]">
      <div className="flex items-center gap-3 px-8 py-6 border-b border-[#444748]/20">
        <span className="material-symbols-outlined text-[#8e9192]">{icon}</span>
        <h2 className="font-header text-sm font-medium text-[#c8c6c5]">{title}</h2>
      </div>
      <div className="px-8 py-8">{children}</div>
    </div>
  )
}

function SettingRow({ label, sublabel, children }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-[#444748]/15 last:border-0">
      <div>
        <p className="font-header text-sm font-medium text-[#c8c6c5]">{label}</p>
        {sublabel && <p className="font-mono-data text-[11px] text-[#8e9192] mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex-shrink-0 ml-8">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 transition-colors duration-200"
      style={{ background: value ? '#dcc662' : 'rgba(68,71,72,0.4)' }}
    >
      <div
        className="absolute top-1 w-4 h-4 bg-[#121414] transition-all duration-200"
        style={{ left: value ? '28px' : '4px' }}
      />
    </button>
  )
}

export default function Settings() {
  const { user, signOut } = useAuthStore()
  const { selectedLanguage, setLanguage } = useCallStore()
  const navigate = useNavigate()

  const [defaultMode, setDefaultMode] = useState('medium')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [streakReminders, setStreakReminders] = useState(true)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [deleteMsg, setDeleteMsg] = useState(null)

  const handleUpgrade = async () => {
    setUpgradeLoading(true)
    try {
      const { url } = await api.createCheckout('pro')
      window.location.href = url
    } catch {
      alert('Billing not configured yet.')
    } finally {
      setUpgradeLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user?.email) return
    setPasswordLoading(true)
    setPasswordMsg(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/settings`,
      })
      if (error) throw error
      setPasswordMsg({ type: 'ok', text: 'Password reset email sent. Check your inbox.' })
    } catch (err) {
      setPasswordMsg({ type: 'err', text: err.message || 'Could not send reset email.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteHistory = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleteLoading(true)
    setDeleteMsg(null)
    try {
      await api.deleteHistory()
      setConfirmDelete(false)
      setDeleteMsg({ type: 'ok', text: 'Call history deleted.' })
    } catch (err) {
      setDeleteMsg({ type: 'err', text: 'Could not delete history. Try again.' })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-[820px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[#c8c6c5]">Settings</h1>
        <p className="font-mono-data text-xs text-[#8e9192] mt-1">Manage your account, preferences, and data.</p>
      </div>

      <div className="flex flex-col gap-4">

        {/* Account */}
        <Section title="Account" icon="manage_accounts">
          <SettingRow label="Email address" sublabel="Used to sign in and receive updates.">
            <div className="border border-[#444748]/30 bg-[#1a1c1c] px-4 py-2">
              <p className="font-mono-data text-sm text-[#8e9192]">{user?.email || '—'}</p>
            </div>
          </SettingRow>
          <SettingRow label="Password" sublabel="Send a password reset link to your email.">
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="label-caps text-[#dcc662] border border-[#dcc662]/30 px-4 py-2 hover:bg-[#dcc662]/5 transition-colors disabled:opacity-50"
              >
                {passwordLoading ? 'Sending...' : 'Change Password'}
              </button>
              {passwordMsg && (
                <p className="font-mono-data text-[10px]" style={{ color: passwordMsg.type === 'ok' ? '#dcc662' : '#8B2222' }}>
                  {passwordMsg.text}
                </p>
              )}
            </div>
          </SettingRow>
          <SettingRow label="Sign out everywhere" sublabel="Revokes all active sessions.">
            <button
              onClick={async () => { await signOut(); navigate('/') }}
              className="label-caps text-[#8e9192] border border-[#444748]/30 px-4 py-2 hover:text-[#c8c6c5] hover:border-[#c8c6c5]/20 transition-colors"
            >
              Sign Out
            </button>
          </SettingRow>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon="tune">
          <SettingRow label="Default language" sublabel="Used when starting a new simulation. Persisted across sessions.">
            <div className="flex gap-2">
              {[{ id: 'english', label: 'English' }, { id: 'spanish', label: 'Español' }].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className="label-caps px-4 py-2 border transition-colors"
                  style={selectedLanguage === l.id
                    ? { borderColor: 'rgba(220,198,98,0.4)', background: 'rgba(220,198,98,0.08)', color: '#dcc662' }
                    : { borderColor: 'rgba(68,71,72,0.3)', color: '#8e9192' }
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Default difficulty" sublabel="Pre-selected mode when picking a scenario.">
            <div className="flex gap-2">
              {[
                { id: 'easy',   label: 'Easy',   color: '#8e9192' },
                { id: 'medium', label: 'Medium', color: '#dcc662' },
                { id: 'hard',   label: 'Hard',   color: '#8B2222' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDefaultMode(m.id)}
                  className="label-caps px-4 py-2 border transition-colors capitalize"
                  style={defaultMode === m.id
                    ? { borderColor: `${m.color}40`, background: `${m.color}08`, color: m.color }
                    : { borderColor: 'rgba(68,71,72,0.3)', color: '#8e9192' }
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon="notifications">
          <SettingRow label="Email summaries" sublabel="Weekly breakdown of your performance metrics.">
            <Toggle value={emailNotifs} onChange={setEmailNotifs} />
          </SettingRow>
          <SettingRow label="Streak reminders" sublabel="Get reminded before your streak expires.">
            <Toggle value={streakReminders} onChange={setStreakReminders} />
          </SettingRow>
        </Section>

        {/* Subscription */}
        <Section title="Subscription" icon="credit_card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-header text-sm font-medium text-[#c8c6c5]">Free Plan</p>
              <p className="font-mono-data text-[11px] text-[#8e9192] mt-0.5">3 calls/day · Easy + Medium only</p>
            </div>
            <span className="label-caps border border-[#444748]/30 px-2 py-1 text-[#8e9192]" style={{ fontSize: '9px' }}>FREE</span>
          </div>
          <div className="border border-[#dcc662]/20 p-5 mb-4" style={{ background: 'rgba(220,198,98,0.02)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="label-caps text-[#dcc662]" style={{ fontSize: '10px' }}>SEEZ PRO</p>
              <p className="font-display text-2xl font-semibold text-[#c8c6c5]">$29<span className="font-mono-data text-sm text-[#8e9192]">/mo</span></p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
              {['Unlimited calls', 'Hard mode', 'Full ELO system', 'Psych insights', 'All 100+ scenarios', 'Practice own product'].map((f) => (
                <p key={f} className="font-mono-data text-xs text-[#8e9192] flex items-center gap-2">
                  <span className="text-[#dcc662]">—</span>{f}
                </p>
              ))}
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={handleUpgrade} loading={upgradeLoading}>
              Upgrade to Pro
            </Button>
          </div>
        </Section>

        {/* Privacy & Data */}
        <Section title="Privacy & Data" icon="shield">
          <SettingRow label="Export call history" sublabel="Download a JSON file of all your sessions and scores.">
            <button className="label-caps text-[#8e9192] border border-[#444748]/30 px-4 py-2 hover:text-[#c8c6c5] hover:border-[#c8c6c5]/20 transition-colors">
              Export Data
            </button>
          </SettingRow>
          <SettingRow
            label="Delete call history"
            sublabel="Permanently removes all sessions and transcripts. Cannot be undone."
          >
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="label-caps text-[#8e9192] px-3 py-2 border border-[#444748]/30 hover:text-[#c8c6c5] transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleDeleteHistory}
                  disabled={deleteLoading}
                  className="label-caps px-4 py-2 border transition-colors disabled:opacity-50"
                  style={confirmDelete
                    ? { borderColor: 'rgba(139,34,34,0.5)', background: 'rgba(139,34,34,0.1)', color: '#8B2222' }
                    : { borderColor: 'rgba(68,71,72,0.3)', color: '#8e9192' }
                  }
                >
                  {deleteLoading ? 'Deleting...' : confirmDelete ? 'Confirm Delete' : 'Delete History'}
                </button>
              </div>
              {deleteMsg && (
                <p className="font-mono-data text-[10px]" style={{ color: deleteMsg.type === 'ok' ? '#dcc662' : '#8B2222' }}>
                  {deleteMsg.text}
                </p>
              )}
            </div>
          </SettingRow>
          <SettingRow
            label="Delete account"
            sublabel="Permanently deletes your account and all associated data."
          >
            <button className="label-caps text-[#8B2222]/50 border border-[#8B2222]/10 px-4 py-2 hover:text-[#8B2222] hover:border-[#8B2222]/30 transition-colors">
              Delete Account
            </button>
          </SettingRow>
        </Section>

      </div>
      <div className="h-10" />
    </div>
  )
}
