'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Candidate {
  id: string
  candidateNumber: number
  chairmanName: string
  photoUrl: string | null
  visionMission: string | null
}

/* ── Accent colours per nomor urut ─────────────────────── */
const CARD_COLORS = [
  { bg: '#EEF2FF', border: '#C7D2FE', accent: '#4F46E5', light: '#E0E7FF' }, // indigo
  { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', light: '#FFEDD5' }, // orange
  { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', light: '#DCFCE7' }, // green
  { bg: '#FFF1F2', border: '#FECDD3', accent: '#E11D48', light: '#FFE4E6' }, // rose
  { bg: '#F5F3FF', border: '#DDD6FE', accent: '#7C3AED', light: '#EDE9FE' }, // violet
]

/* ── Confirm Modal ──────────────────────────────────────── */
function ConfirmModal({
  candidate,
  onConfirm,
  onCancel,
  loading,
}: {
  candidate: Candidate
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const c = CARD_COLORS[(candidate.candidateNumber - 1) % CARD_COLORS.length]

  return (
    <div className="modal-overlay animate-fade-in" onClick={onCancel}>
      <div
        className="modal-content animate-scale-in"
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '32px 28px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-5">
          {/* Ballot icon */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: c.light,
              border: `2px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
            }}
          >
            🗳️
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 6 }}>
              Konfirmasi Pilihan
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
              Anda akan memilih pasangan calon berikut:
            </p>
          </div>

          {/* Candidate highlight */}
          <div
            style={{
              width: '100%',
              padding: '16px 20px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderLeft: `4px solid ${c.accent}`,
              borderRadius: 12,
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: c.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Paslon Nomor {candidate.candidateNumber}
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 2 }}>
              {candidate.chairmanName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: 12, lineHeight: 1.5 }}>
            ⚠️ Pilihan ini bersifat <strong>final</strong> dan tidak dapat diubah setelah dikonfirmasi.
          </p>

          <div className="flex gap-3 w-full">
            <button
              id="confirm-cancel-btn"
              onClick={onCancel}
              disabled={loading}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              Batal
            </button>
            <button
              id="confirm-vote-btn"
              onClick={onConfirm}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2, background: `linear-gradient(135deg, ${c.accent}, ${c.accent}dd)` }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 15, height: 15, borderTopColor: 'white' }} />
                  Memproses...
                </>
              ) : (
                <>✅ Ya, Pilih Ini</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Candidate Card (vertical / portrait) ───────────────── */
function CandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: Candidate
  selected: boolean
  onSelect: () => void
}) {
  const c = CARD_COLORS[(candidate.candidateNumber - 1) % CARD_COLORS.length]

  return (
    <div
      id={`candidate-card-${candidate.candidateNumber}`}
      onClick={onSelect}
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: selected ? `2px solid ${c.accent}` : '1.5px solid var(--color-border)',
        boxShadow: selected
          ? `0 0 0 4px ${c.accent}20, var(--shadow-md)`
          : 'var(--shadow-sm)',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: selected ? 'translateY(-3px) scale(1.01)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'var(--shadow-md)'
          el.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          const el = e.currentTarget as HTMLDivElement
          el.style.boxShadow = 'var(--shadow-sm)'
          el.style.transform = 'none'
        }
      }}
    >
      {/* ── Photo area (3:4 aspect ratio) ── */}
      <div
        style={{
          position: 'relative',
          paddingBottom: '130%', /* tall portrait */
          background: candidate.photoUrl ? undefined : c.light,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt={`Foto paslon ${candidate.candidateNumber}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
        ) : (
          /* Placeholder — gradient + icon */
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(160deg, ${c.light} 0%, ${c.bg} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontSize: '3.5rem', opacity: 0.5 }}>👤</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.accent, opacity: 0.7 }}>
              Foto Belum Tersedia
            </div>
          </div>
        )}

        {/* Number badge overlaid on photo */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            background: c.accent,
            borderRadius: 999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Paslon
          </span>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>
            {candidate.candidateNumber}
          </span>
        </div>

        {/* Radio button overlaid top-right */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: selected ? `2px solid ${c.accent}` : '2px solid rgba(255,255,255,0.7)',
            background: selected ? c.accent : 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
        </div>

        {/* Gradient scrim at bottom of photo */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: 'linear-gradient(to top, rgba(0,0,0,0.18), transparent)',
          }}
        />
      </div>

      {/* ── Info area below photo ── */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          borderTop: `3px solid ${selected ? c.accent : c.border}`,
          background: selected ? c.bg : '#FFFFFF',
          transition: 'background 0.2s ease',
        }}
      >
        <div style={{
          fontSize: 11, fontWeight: 700, color: c.accent,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Calon Ketua OSIS
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
          {candidate.chairmanName}
        </div>
      </div>

      {/* ── Selected footer ── */}
      {selected && (
        <div
          style={{
            padding: '7px 16px',
            background: c.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>
            ✓ DIPILIH
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Main Vote Page ─────────────────────────────────────── */
export default function VotePage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('/api/results')
        const data = await res.json()
        setCandidates(data.candidates || [])
      } catch {
        setError('Gagal memuat data kandidat')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchCandidates()
  }, [])

  const handleConfirm = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: selected.id }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/success')
      } else {
        setError(data.error || 'Terjadi kesalahan')
        setShowModal(false)
      }
    } catch {
      setError('Tidak dapat terhubung ke server')
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: '#F4F6FA', zoom: 1.25 }}
    >
      {/* ── Sticky Header ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 16px',
          boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Left: Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🗳️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-primary)', lineHeight: 1.1 }}>
                E-Voting OSIS
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1 }}>
                Bilik Suara Digital
              </div>
            </div>
          </div>

          {/* Right: Selected indicator + Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selected && (
              <div style={{
                fontSize: 12, fontWeight: 600,
                color: 'var(--color-text-secondary)',
                background: 'var(--color-surface-3)',
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid var(--color-border)',
              }}>
                Paslon {selected.candidateNumber} dipilih
              </div>
            )}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              background: '#DCFCE7',
              border: '1px solid #BBF7D0',
              borderRadius: 999,
              fontSize: 11, fontWeight: 700, color: '#15803D',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              Sesi Aktif
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div
        style={{
          flex: 1,
          maxWidth: 1100,
          margin: '0 auto',
          width: '100%',
          padding: '28px 16px 48px',
        }}
      >
        {/* Page title */}
        <div className="animate-fade-in-up" style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Pilih <span className="text-gradient-gold">Pasangan Calon</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
            Pilih satu pasangan calon yang Anda percaya. Klik kartu untuk memilih.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="animate-slide-down"
            style={{
              maxWidth: 560, margin: '0 auto 24px',
              padding: '10px 16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              color: '#DC2626',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {fetchLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 16 }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Memuat data kandidat...</span>
          </div>
        ) : (
          <>
            {/* ── Candidate Grid ── */}
            {/*
              Layout:
                ≥1000px → 5 kolom (semua paslon 1 baris)
                700-999px → 3 kolom
                480-699px → 2 kolom
                ≤479px  → 1 kolom
            */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 32,
                alignItems: 'start',
              }}
            >
              {candidates.map((c, i) => (
                <div
                  key={c.id}
                  className={`animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <CandidateCard
                    candidate={c}
                    selected={selected?.id === c.id}
                    onSelect={() => setSelected(c)}
                  />
                </div>
              ))}
            </div>

            {/* ── Submit Panel ── */}
            <div
              className="animate-fade-in-up"
              style={{
                maxWidth: 560,
                margin: '0 auto',
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              {/* Selection summary */}
              <div style={{ flex: 1, minWidth: 160 }}>
                {selected ? (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                      Pilihan Anda
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text-primary)' }}>
                      Paslon {selected.candidateNumber} — {selected.chairmanName}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Belum ada pilihan. Klik kartu kandidat di atas.
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                id="vote-submit-btn"
                disabled={!selected}
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
                style={{
                  minWidth: 180,
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: selected ? 'var(--shadow-glow-accent)' : 'none',
                }}
              >
                {selected ? `✅ Konfirmasi Pilihan` : 'Pilih kandidat dulu'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {showModal && selected && (
        <ConfirmModal
          candidate={selected}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </main>
  )
}
