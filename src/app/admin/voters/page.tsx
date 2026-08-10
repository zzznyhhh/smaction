'use client'

import { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'

interface Voter {
  nisn: string
  name: string
  class: string
  has_voted: boolean
  created_at: string
}

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'voted' | 'not_voted'>('all')
  const [importing, setImporting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchVoters = async () => {
    try {
      const res = await fetch('/api/admin/voters')
      const data = await res.json()
      setVoters(data.voters || [])
    } catch {
      setError('Gagal memuat data DPT')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVoters()
  }, [])

  const classes = Array.from(new Set(voters.map((v) => v.class))).sort()

  const filtered = voters.filter((v) => {
    const matchSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.nisn.includes(search)
    const matchClass = !filterClass || v.class === filterClass
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'voted' && v.has_voted) ||
      (filterStatus === 'not_voted' && !v.has_voted)
    return matchSearch && matchClass && matchStatus
  })

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Normalize column names (case-insensitive)
          const rows = results.data.map((row: any) => ({
            nisn: row.nis || row.NIS || row.nisn || row.NISN || row['Nis'] || '',
            name: row.name || row.Name || row['Nama'] || row['nama'] || '',
            class:
              row.class ||
              row.Class ||
              row['Kelas'] ||
              row['kelas'] ||
              row['CLASS'] ||
              '',
          }))

          const res = await fetch('/api/admin/voters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voters: rows }),
          })
          const data = await res.json()

          if (data.success) {
            setImportResult({ imported: data.imported, total: data.total })
            fetchVoters()
          } else {
            setError(data.error || 'Gagal mengimport data')
          }
        } catch {
          setError('Gagal memproses file')
        } finally {
          setImporting(false)
          if (fileRef.current) fileRef.current.value = ''
        }
      },
      error: () => {
        setError('File tidak dapat dibaca')
        setImporting(false)
      },
    })
  }

  const handleResetDPT = async () => {
    if (!window.confirm('Yakin ingin mereset/menghapus SEMUA data DPT dan suara? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    setResetting(true)
    setError('')
    setImportResult(null)

    try {
      const res = await fetch('/api/admin/voters', {
        method: 'DELETE',
      })
      const data = await res.json()

      if (res.ok && data.success) {
        fetchVoters()
        alert('Data DPT berhasil direset.')
      } else {
        setError(data.error || 'Gagal mereset data DPT')
      }
    } catch {
      setError('Terjadi kesalahan server saat mereset data.')
    } finally {
      setResetting(false)
    }
  }

  const votedCount = voters.filter((v) => v.has_voted).length
  const notVotedCount = voters.length - votedCount

  return (
    <div className="page-padding" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header-flex mb-6 animate-fade-in-up">
        <div>
          <h1 className="heading-md" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>
            👥 DPT{' '}
            <span className="text-gradient-red">Manager</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
            Daftar Pemilih Tetap — {voters.length} siswa terdaftar
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleResetDPT}
            disabled={resetting || importing || voters.length === 0}
            className="btn btn-ghost"
            style={{ color: '#E74C3C', borderColor: 'rgba(231,76,60,0.3)', fontSize: 13 }}
          >
            {resetting ? '⏳ Resetting...' : '⚠️ Reset Data DPT'}
          </button>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              style={{ display: 'none' }}
              id="csv-file-input"
            />
            <button
              id="import-csv-btn"
              onClick={() => fileRef.current?.click()}
              disabled={importing || resetting}
              className="btn btn-accent"
            >
              {importing ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#1a0a00' }} />
                  Mengimport...
                </>
              ) : (
                <>📂 Import CSV</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSV format hint */}
      <div
        className="animate-slide-down mb-4"
        style={{
          padding: '10px 14px',
          background: 'rgba(229, 178, 13, 0.06)',
          border: '1px solid rgba(229, 178, 13, 0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
          color: 'var(--color-text-muted)',
        }}
      >
        💡 Format CSV: kolom <code style={{ color: '#E5B20D' }}>nis</code>,{' '}
        <code style={{ color: '#E5B20D' }}>name</code>,{' '}
        <code style={{ color: '#E5B20D' }}>class</code> (header row diperlukan). Contoh: <code style={{ color: '#E5B20D' }}>1234,Budi Santoso,X-A</code>
      </div>

      {/* Import result */}
      {importResult && (
        <div
          className="animate-slide-down flex items-center gap-2 mb-4"
          style={{
            padding: '12px 16px',
            background: 'rgba(46, 213, 115, 0.1)',
            border: '1px solid rgba(46, 213, 115, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#2ED573',
            fontSize: 14,
          }}
        >
          ✅ Berhasil mengimport {importResult.imported} dari {importResult.total} data
        </div>
      )}

      {error && (
        <div
          className="animate-slide-down flex items-center gap-2 mb-4"
          style={{
            padding: '12px 16px',
            background: 'rgba(192, 57, 43, 0.12)',
            border: '1px solid rgba(192, 57, 43, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#E74C3C',
            fontSize: 14,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Stats row */}
      <div className="stats-flex mb-6 animate-fade-in-up delay-100">
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', borderLeft: '3px solid #3498DB' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total DPT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#3498DB' }}>{voters.length}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', borderLeft: '3px solid #2ED573' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Sudah Memilih</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#2ED573' }}>{votedCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', borderLeft: '3px solid #F39C12' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Belum Memilih</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#F39C12' }}>{notVotedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="glass-card filter-flex mb-4 animate-fade-in-up delay-200"
        style={{ padding: '14px 16px', borderRadius: 'var(--radius-lg)' }}
      >
          <input
          type="text"
          placeholder="🔍 Cari nama atau NIS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ padding: '10px 14px', fontSize: 14, maxWidth: 260 }}
        />
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="input-field"
          style={{ padding: '10px 14px', fontSize: 14, maxWidth: 140, minWidth: 110 }}
        >
          <option value="">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {(['all', 'voted', 'not_voted'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
            >
              {s === 'all' ? 'Semua' : s === 'voted' ? '✅ Sudah' : '⏳ Belum'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="glass-card animate-fade-in-up delay-300"
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Menampilkan {filtered.length} dari {voters.length} siswa
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>NIS</th>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((voter, idx) => (
                  <tr key={voter.nisn}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{idx + 1}</td>
                    <td>
                      <code style={{ fontSize: 13, color: 'var(--color-text-secondary)', background: 'var(--color-border)', padding: '2px 6px', borderRadius: 4 }}>
                        {voter.nisn}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{voter.name}</td>
                    <td>
                      <span className="badge badge-neutral">{voter.class}</span>
                    </td>
                    <td>
                      <span className={`badge ${voter.has_voted ? 'badge-success' : 'badge-warning'}`}>
                        {voter.has_voted ? '✅ Sudah Memilih' : '⏳ Belum Memilih'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
                      Tidak ada data yang cocok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
