'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface ResultData {
  totalVoters: number
  totalVotes: number
  golput: number
  participationRate: number
  candidates: {
    id: string
    candidateNumber: number
    chairmanName: string
    votes: number
    percentage: number
  }[]
}

const COLORS = ['#C0392B', '#F39C12', '#3498DB', '#2ECC71', '#9B59B6']

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {icon} {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 900,
          color: accent || 'var(--color-text-primary)',
          lineHeight: 1,
          marginBottom: sub ? 4 : 0,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sub}</div>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#C0392B', fontWeight: 600 }}>{payload[0].value} suara</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [resetting, setResetting] = useState(false)
  const [isLocal, setIsLocal] = useState(false)

  // Change password state
  const [showPwModal, setShowPwModal] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Deteksi local mode
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    setIsLocal(!url || url.includes('your-project'))
  }, [])

  const handleReset = async () => {
    if (!confirm('Reset semua suara? Ini akan menghapus semua data voting secara permanen.')) return
    setResetting(true)
    try {
      await fetch('/api/admin/reset', { method: 'POST' })
      await fetchData()
    } finally {
      setResetting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)

    if (newPw !== confirmPw) {
      setPwError('Password baru dan konfirmasi tidak cocok')
      return
    }
    if (newPw.length < 6) {
      setPwError('Password baru minimal 6 karakter')
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal mengubah password')
      setPwSuccess(true)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err: any) {
      setPwError(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/results')
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to fetch results:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Polling setiap 5 detik (bekerja di local mode maupun Supabase)
    const interval = setInterval(() => {
      fetchData()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [fetchData])

  const barData =
    data?.candidates.map((c) => ({
      name: `Paslon ${c.candidateNumber}`,
      suara: c.votes,
      detail: c.chairmanName,
    })) || []

  const pieData = data
    ? [
        { name: 'Sudah Memilih', value: data.totalVotes },
        { name: 'Belum Memilih', value: data.golput },
      ]
    : []

  const PIE_COLORS = ['#D4A017', '#E2E8F0']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <span className="spinner" style={{ width: 48, height: 48 }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Memuat dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-padding" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header-flex mb-8 animate-fade-in-up">
        <div>
          <h1 className="heading-md" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>
            📊 Dashboard{' '}
            <span className="text-gradient-red">Real-time</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
            Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLocal && (
            <div
              style={{
                padding: '4px 10px',
                background: '#FEF9C3',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 600,
                color: '#92400E',
              }}
            >
              🗂️ Mode Lokal
            </div>
          )}
          <button
            id="reset-votes-btn"
            onClick={handleReset}
            disabled={resetting}
            className="btn btn-ghost btn-sm"
            style={{ color: '#E74C3C', borderColor: 'rgba(231,76,60,0.3)', fontSize: 12 }}
          >
            {resetting ? '...' : '🔄 Reset Suara'}
          </button>
          <button
            onClick={() => setShowPwModal(true)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12 }}
          >
            🔑 Ubah Password
          </button>
          <div className="badge badge-success" style={{ fontSize: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803D', display: 'inline-block' }} />
            Live
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-flex mb-8 animate-fade-in-up delay-100">
        <StatCard
          icon="👥"
          label="Total DPT"
          value={data?.totalVoters || 0}
          sub="Pemilih terdaftar"
          accent="#3498DB"
        />
        <StatCard
          icon="🗳️"
          label="Suara Masuk"
          value={data?.totalVotes || 0}
          sub="Suara valid"
          accent="#E5B20D"
        />
        <StatCard
          icon="😶"
          label="Golput"
          value={data?.golput || 0}
          sub="Belum memilih"
          accent="#B8860B"
        />
        <StatCard
          icon="📈"
          label="Partisipasi"
          value={`${data?.participationRate || 0}%`}
          sub="Tingkat kehadiran"
          accent="#2ED573"
        />
      </div>

      {/* Charts */}
      <div className="charts-flex mb-8 animate-fade-in-up delay-200">
        {/* Bar Chart */}
        <div
          className="glass-card chart-main"
          style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 20 }}>
            Perolehan Suara per Paslon
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,35,65,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="suara" radius={[6, 6, 0, 0]}>
                {barData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div
          className="glass-card chart-side"
          style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}
        >
          <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 20 }}>
            Partisipasi Pemilih
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{value}</span>
                )}
              />
              <Tooltip
                formatter={(value: any) => [`${value} orang`, '']}
                contentStyle={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 8,
                  color: 'var(--color-text-primary)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking Table */}
      <div
        className="glass-card animate-fade-in-up delay-300"
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>
            🏆 Ranking Kandidat
          </h2>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Paslon</th>
                <th>Ketua</th>
                <th>Suara</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {data?.candidates
                .slice()
                .sort((a, b) => b.votes - a.votes)
                .map((c, idx) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: 18, color: idx === 0 ? '#E5B20D' : 'var(--color-text-muted)' }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          background: `linear-gradient(135deg, ${COLORS[c.candidateNumber - 1] || COLORS[0]}, ${COLORS[(c.candidateNumber) % COLORS.length]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 14,
                          color: 'white',
                        }}
                      >
                        {c.candidateNumber}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.chairmanName}</td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-accent)' }}>
                        {c.votes}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110 }}>
                        <div className="progress-bar" style={{ flex: 1, minWidth: 60 }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {c.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Change Password Modal */}
    {showPwModal && (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div className="glass-card animate-fade-in-up" style={{
          width: '100%', maxWidth: 440,
          padding: 28,
          borderRadius: 16,
          background: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>🔑 Ubah Password Admin</h2>
            <button
              onClick={() => { setShowPwModal(false); setPwError(''); setPwSuccess(false) }}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}
            >×</button>
          </div>

          {pwSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 700, color: '#047857', fontSize: 15 }}>Password berhasil diubah!</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 }}>Gunakan password baru saat login berikutnya.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 20, width: '100%' }}
                onClick={() => { setShowPwModal(false); setPwSuccess(false) }}
              >Tutup</button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: 'Password Lama', value: currentPw, onChange: setCurrentPw },
                { label: 'Password Baru (min. 6 karakter)', value: newPw, onChange: setNewPw },
                { label: 'Konfirmasi Password Baru', value: confirmPw, onChange: setConfirmPw }]
                .map(({ label, value, onChange }) => (
                <div key={label}>
                  <label style={{
                    display: 'block', fontSize: 12, fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8,
                  }}>{label}</label>
                  <input
                    type="password"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 8, fontSize: 15,
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-surface)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              {pwError && (
                <div style={{
                  padding: '10px 14px', background: '#FEF2F2',
                  border: '1px solid #FECACA', borderRadius: 8,
                  color: '#DC2626', fontSize: 13, textAlign: 'center',
                }}>⚠️ {pwError}</div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ flex: 1 }}>
                  {pwLoading ? (
                    <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Menyimpan...</>
                  ) : 'Simpan Password'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => { setShowPwModal(false); setPwError(''); setCurrentPw(''); setNewPw(''); setConfirmPw('') }}
                >Batal</button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
  </>
  )
}
