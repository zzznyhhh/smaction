'use client'

import { useEffect, useState } from 'react'

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  return (
    <button
      id="fullscreen-toggle-btn"
      onClick={toggle}
      title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
      aria-label={isFullscreen ? 'Keluar Fullscreen' : 'Masuk Fullscreen'}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        width: 32,
        height: 32,
        borderRadius: 8,
        border: '1px solid var(--color-border, #EDD5CC)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 2px 8px rgba(42,22,23,0.12)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'all 0.2s ease',
        color: 'var(--color-text-secondary, #7A4B47)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--color-surface-3, #FDEEE8)'
        el.style.borderColor = 'var(--color-border-strong, #C8917F)'
        el.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.85)'
        el.style.borderColor = 'var(--color-border, #EDD5CC)'
        el.style.transform = 'scale(1)'
      }}
    >
      {isFullscreen ? (
        /* compress icon */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="10" y1="14" x2="3" y2="21" />
          <line x1="21" y1="3" x2="14" y2="10" />
        </svg>
      ) : (
        /* expand icon */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      )}
    </button>
  )
}
