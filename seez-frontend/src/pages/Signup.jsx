import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useAuthStore } from '../stores/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(email, password)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-[#121414]" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 440, border: '1px solid rgba(68,71,72,0.3)', background: '#1e2020', padding: '56px 48px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#dcc662', display: 'block', marginBottom: 20 }}>mark_email_read</span>
          <h2 className="font-header" style={{ fontSize: 24, fontWeight: 500, color: '#c8c6c5', marginBottom: 12 }}>Check your email</h2>
          <p className="font-mono-data" style={{ fontSize: 12, color: '#8e9192', lineHeight: 1.8 }}>
            We sent a confirmation link to <span style={{ color: '#c8c6c5' }}>{email}</span>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="label-caps" style={{ display: 'inline-block', marginTop: 32, color: '#dcc662', textDecoration: 'none' }}>
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#121414]" style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Left — brand panel */}
      <div className="bg-[#0c0f0f]" style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '56px 64px', borderRight: '1px solid var(--border-lo)',
      }}>
        <div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: '#c8c6c5' }}>SEEZ</div>
          <div className="label-caps" style={{ fontSize: 9, color: 'rgba(142,145,146,0.6)', marginTop: 2 }}>ELITE TERMINAL</div>
        </div>

        <div>
          <h2 className="font-display" style={{ fontSize: 48, fontWeight: 600, color: '#c8c6c5', lineHeight: 1.1, marginBottom: 20 }}>
            Every rep counts.<br />
            <span className="gradient-text">Make them harder.</span>
          </h2>
          <p className="font-mono-data" style={{ fontSize: 12, color: '#8e9192', lineHeight: 1.8, maxWidth: 360 }}>
            The training system built for professionals who refuse to lose deals they should win.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Adversarial AI prospects', 'Precision call scoring', 'Seven mastery tiers'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 4, height: 4, background: '#dcc662', borderRadius: '50%', flexShrink: 0 }} />
              <span className="font-mono-data" style={{ fontSize: 11, color: '#8e9192' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '56px 64px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <h1 className="font-header" style={{ fontSize: 28, fontWeight: 500, color: '#c8c6c5', marginBottom: 6 }}>Create your account</h1>
          <p className="font-mono-data" style={{ fontSize: 12, color: '#8e9192', marginBottom: 36 }}>3 calls/day free. No credit card needed.</p>

          {/* Google */}
          <button
            onClick={signInWithGoogle}
            className="label-caps"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              border: '1px solid rgba(68,71,72,0.3)', background: '#1a1c1c',
              padding: '14px 20px', color: '#c8c6c5', cursor: 'pointer', marginBottom: 24,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(68,71,72,0.3)' }} />
            <span className="font-mono-data" style={{ fontSize: 10, color: '#8e9192' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(68,71,72,0.3)' }} />
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div className="font-mono-data" style={{ border: '1px solid rgba(139,34,34,0.3)', background: 'rgba(139,34,34,0.05)', padding: '10px 14px', fontSize: 12, color: '#8B2222' }}>
                {error}
              </div>
            )}
            <div>
              <label className="label-caps" style={{ display: 'block', color: '#8e9192', marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', border: '1px solid rgba(68,71,72,0.3)', background: '#1a1c1c',
                  padding: '12px 16px', color: '#e2e2e2', fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label className="label-caps" style={{ display: 'block', color: '#8e9192', marginBottom: 8 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                minLength={8}
                required
                style={{
                  width: '100%', border: '1px solid rgba(68,71,72,0.3)', background: '#1a1c1c',
                  padding: '12px 16px', color: '#e2e2e2', fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                Create account
              </Button>
            </div>
          </form>

          <p className="font-mono-data" style={{ textAlign: 'center', fontSize: 12, color: '#8e9192', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#dcc662', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
