'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Simple confetti particle
function ConfettiPiece({ index }: { index: number }) {
  const colors = ['#C0392B', '#E74C3C', '#F39C12', '#F5B942', '#FFFFFF', '#FFD700']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 3
  const duration = 3 + Math.random() * 3
  const size = 6 + Math.random() * 6

  return (
    <div
      style={{
        position: 'fixed',
        top: '-20px',
        left: `${left}%`,
        width: size,
        height: size,
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animation: `confettiFall ${duration}s linear ${delay}s both`,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
}

export default function SuccessPage() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [confetti] = useState(() => Array.from({ length: 60 }, (_, i) => i))

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F4F6FA 0%, #EEF2FA 100%)' }}
    >
      {/* Confetti */}
      {show && confetti.map((i) => <ConfettiPiece key={i} index={i} />)}

      {/* Card */}
      <div
        className={`relative w-full max-w-md ${show ? 'animate-scale-in' : 'opacity-0'}`}
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '40px 36px',
          textAlign: 'center',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Success icon */}
        <div
          className="flex items-center justify-center mx-auto mb-6"
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(46, 213, 115, 0.2) 0%, rgba(46, 213, 115, 0.05) 100%)',
            border: '2px solid rgba(46, 213, 115, 0.4)',
            fontSize: '3rem',
            animation: show ? 'float 3s ease-in-out infinite' : 'none',
          }}
        >
          ✅
        </div>

        <h1
          className="heading-lg mb-3 animate-fade-in-up delay-200"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Suara Anda{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #2ED573 0%, #17A64A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Berhasil
          </span>{' '}
          Tercatat!
        </h1>

        <p
          className="animate-fade-in delay-300"
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          Terima kasih telah berpartisipasi dalam Pemilihan Ketua OSIS.
          Pilihan Anda telah kami catat secara aman dan anonim.
        </p>

        {/* Info box */}
        <div
          className="animate-fade-in delay-300"
          style={{
            padding: '16px',
            background: '#DCFCE7',
            border: '1px solid #BBF7D0',
            borderRadius: 'var(--radius-md)',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
            <span>🔒</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#15803D' }}>Suara Terlindungi</span>
          </div>
          <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
            Identitas Anda tidak terhubung dengan pilihan Anda. Privasi terjamin sepenuhnya.
          </p>
        </div>

        {/* Back button */}
        <Link
          href="/"
          id="back-to-home-btn"
          className="btn btn-primary btn-full btn-lg animate-fade-in-up delay-400"
          style={{ display: 'flex' }}
        >
          <span>🏠</span>
          Kembali ke Halaman Utama
        </Link>

        <p
          className="mt-4 animate-fade-in delay-400"
          style={{ color: 'var(--color-text-muted)', fontSize: 12 }}
        >
          Silakan persilakan pemilih berikutnya
        </p>
      </div>
    </main>
  )
}
