'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Candidate {
  id: string
  candidate_number: number
  chairman_name: string
  vision_mission: string | null
  photo_url: string | null
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [candidateNumber, setCandidateNumber] = useState('')
  const [chairmanName, setChairmanName] = useState('')
  const [photoBase64, setPhotoBase64] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/candidates')
      if (!res.ok) throw new Error('Gagal memuat data paslon')
      const data = await res.json()
      setCandidates(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const resetForm = () => {
    setCandidateNumber('')
    setChairmanName('')
    setPhotoBase64('')
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openAddModal = () => {
    resetForm()
    setCandidateNumber(String(candidates.length + 1))
    setShowModal(true)
  }

  const openEditModal = (c: Candidate) => {
    resetForm()
    setEditingId(c.id)
    setCandidateNumber(String(c.candidate_number))
    setChairmanName(c.chairman_name)
    setPhotoBase64(c.photo_url || '')
    setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoBase64(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const payload = {
        candidate_number: Number(candidateNumber),
        chairman_name: chairmanName,
        vision_mission: '',
        photo_url: photoBase64
      }

      const url = editingId ? `/api/admin/candidates?id=${editingId}` : '/api/admin/candidates'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Terjadi kesalahan')
      }

      setSuccess(`Paslon berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}!`)
      setShowModal(false)
      fetchCandidates()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus paslon ${name}? Semua suara yang masuk ke paslon ini juga akan terhapus!`)) return
    
    try {
      const res = await fetch(`/api/admin/candidates?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Gagal menghapus paslon')
      }
      setSuccess('Paslon berhasil dihapus')
      fetchCandidates()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <span className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    )
  }

  return (
    <div className="page-padding">
      <div className="page-header-flex mb-6">
        <div>
          <h1 className="heading-md" style={{ color: 'var(--color-text-primary)' }}>
            Manajemen <span className="text-gradient-primary">Paslon</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Kelola data, nama, dan foto Pasangan Calon Ketua & Wakil Ketua OSIS.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Tambah Paslon
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: '#FEE2E2', color: '#B91C1C', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: 12, background: '#D1FAE5', color: '#047857', borderRadius: 8, marginBottom: 16 }}>
          {success}
        </div>
      )}

      <div className="grid-cards">
        {candidates.map((c) => (
          <div key={c.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                background: 'var(--gradient-primary)', 
                color: '#fff', 
                fontWeight: 'bold', 
                width: 36, 
                height: 36, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '50%' 
              }}>
                {c.candidate_number}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => openEditModal(c)} 
                  style={{ background: '#f3f4f6', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(c.id, c.chairman_name)} 
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Hapus
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {c.photo_url ? (
                  <Image src={c.photo_url} alt="Foto Paslon" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 24 }}>
                    👤
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>{c.chairman_name}</h3>
              </div>
            </div>
          </div>
        ))}
        {candidates.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            Belum ada data paslon.
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 500, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              {editingId ? 'Edit Paslon' : 'Tambah Paslon Baru'}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Nomor Urut */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 8,
                }}>
                  Nomor Urut
                </label>
                <input
                  type="number"
                  value={candidateNumber}
                  onChange={e => setCandidateNumber(e.target.value)}
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-surface)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>

              {/* Nama Calon Ketua */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 8,
                }}>
                  Nama Calon Ketua
                </label>
                <input
                  type="text"
                  value={chairmanName}
                  onChange={e => setChairmanName(e.target.value)}
                  required
                  placeholder="Masukkan nama calon ketua..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-surface)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>

              {/* Foto Paslon */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 8,
                }}>
                  Foto Paslon <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(opsional, maks. 2MB)</span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  border: '1.5px dashed var(--color-border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: 'var(--color-surface-2)',
                  transition: 'border-color 0.2s',
                }}>
                  <span style={{ fontSize: 20 }}>🖼️</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {photoBase64 ? 'Klik untuk ganti foto' : 'Klik untuk pilih foto (JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </label>

                {photoBase64 && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--color-border)', flexShrink: 0 }}>
                      <Image src={photoBase64} alt="Preview" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setPhotoBase64(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Hapus Foto
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
