'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/voters',   icon: '👥', label: 'DPT' },
  { href: '/admin/candidates', icon: '👔', label: 'Manajemen Paslon' },
  { href: '/admin/report',   icon: '📄', label: 'Laporan' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div
          className="sidebar-logo"
          style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--color-border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36, height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}
            >
              🗳️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-primary)' }}>
                E-Voting
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex flex-col gap-1"
          style={{ flex: 1, padding: '12px 10px' }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0B2341' : 'var(--color-text-secondary)',
                  background: isActive
                    ? 'linear-gradient(135deg, #FEF9C3 0%, #FEF3C7 100%)'
                    : 'transparent',
                  border: isActive ? '1px solid #FDE68A' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-3)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
                  }
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--color-border)' }}>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-ghost sidebar-logout"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              gap: 10,
              padding: '9px 12px',
              fontSize: 14,
              whiteSpace: 'nowrap',
            }}
          >
            <span>{loggingOut ? '⏳' : '🚪'}</span>
            {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">{children}</main>
    </div>
  )
}
