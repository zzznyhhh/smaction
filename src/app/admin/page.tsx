'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Password salah')
      }
    } catch {
      setError('Tidak dapat terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #F4F6FA 0%, #EEF2FA 100%)' }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md animate-fade-in-up"
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '40px 36px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: 'var(--gradient-accent)',
              boxShadow: 'var(--shadow-glow-accent)',
              fontSize: '1.8rem',
            }}
          >
            🛡️
          </div>
          <h1
            className="heading-md text-center mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Panel{' '}
            <span
              style={{
                background: 'var(--gradient-accent)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Admin
            </span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center' }}>
            Masukkan password untuk mengakses dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              htmlFor="admin-password-input"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: 8,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              Password Admin
            </label>
            <input
              id="admin-password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="••••••••"
              className={`input-field ${error ? 'error' : ''}`}
              style={{ textAlign: 'center', letterSpacing: '0.15em', fontSize: 18 }}
              autoFocus
            />
          </div>

          {error && (
            <div
              className="animate-slide-down"
              style={{
                padding: '10px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                color: '#DC2626',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading || !password}
            className="btn btn-accent btn-lg btn-full"
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#1a0a00' }} />
                Memverifikasi...
              </>
            ) : (
              <>🛡️ Masuk Panel Admin</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            style={{ color: 'var(--color-text-muted)', fontSize: 13, textDecoration: 'none' }}
          >
            ← Kembali ke Halaman Pemilih
          </a>
        </div>
      </div>
    </main>
  )
}
