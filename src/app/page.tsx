'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [nis, setNis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nis.trim()) {
      setError('Masukkan NIS Anda')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nisn: nis.trim() }),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/vote')
      } else {
        setError(data.error || 'Terjadi kesalahan')
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
      {/* Decorative background blobs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
        style={{ zIndex: 0 }}
      >
        <div style={{
          position: 'absolute', top: -120, left: -120,
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(11,35,65,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,160,23,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
      </div>

      {/* Card */}
      <div
        className="relative animate-fade-in-up"
        style={{
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '40px 36px 36px',
          border: '1px solid #DDE3EE',
          boxShadow: '0 4px 24px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.05)',
        }}
      >
        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%',
          height: 3,
          background: 'linear-gradient(90deg, transparent, #D4A017, transparent)',
          borderRadius: '0 0 2px 2px',
        }} />

        {/* Header */}
        <div className="flex flex-col items-center" style={{ marginBottom: 32 }}>
          {/* Logo circle */}
          <div
            className="animate-float"
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#ffffff',
              border: '3px solid #EEF2F9',
              boxShadow: '0 8px 24px rgba(11,35,65,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
              overflow: 'hidden',
            }}
          >
            <img src="/icon.png" alt="Logo SMACTION" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <span
            className="badge badge-navy animate-slide-down delay-100"
            style={{ marginBottom: 10 }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#D4A017', display: 'inline-block',
            }} />
            Pemilihan Ketua OSIS
          </span>

          <h1
            className="heading-lg text-center animate-fade-in delay-200"
            style={{ color: 'var(--color-primary)', marginBottom: 6 }}
          >
            E-Voting{' '}
            <span className="text-gradient-gold">OSIS</span>
          </h1>
          <p
            className="text-center animate-fade-in delay-300"
            style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.5 }}
          >
            Masukkan NIS Anda untuk mulai memilih
          </p>
        </div>

        {/* Divider */}
        <div className="divider" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: 20 }}>
          <div className="animate-fade-in-up delay-300">
            <label
              htmlFor="nis-input"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: 8,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Nomor Induk Siswa (NIS)
            </label>
            <input
              id="nis-input"
              type="text"
              value={nis}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                setNis(val)
                if (error) setError('')
              }}
              placeholder="Contoh: 1234"
              className={`input-field ${error ? 'error' : ''}`}
              inputMode="numeric"
              maxLength={4}
              autoFocus
              autoComplete="off"
              style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.3em', textAlign: 'center' }}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
              NIS terdiri dari 4 digit angka
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="animate-slide-down flex items-center gap-2"
              style={{
                padding: '10px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                color: '#DC2626',
                fontSize: 13,
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading || !nis.trim() || nis.length < 4}
            className="btn btn-primary btn-lg btn-full animate-fade-in-up delay-400"
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#0B2341' }} />
                Memverifikasi...
              </>
            ) : (
              <>
                <span>🗳️</span>
                Masuk ke Bilik Suara
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center animate-fade-in delay-400" style={{
          color: 'var(--color-text-muted)', fontSize: 12, marginTop: 20,
        }}>
          🔒 Data Anda dilindungi — satu NIS hanya bisa memilih satu kali.
        </p>
      </div>

      {/* Admin link */}
      <div className="animate-fade-in delay-400" style={{ marginTop: 20, position: 'relative', zIndex: 1 }}>
        <a
          href="/admin"
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 13,
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--color-primary)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--color-text-muted)')}
        >
          Panel Admin →
        </a>
      </div>
    </main>
  )
}
