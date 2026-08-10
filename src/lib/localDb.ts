/**
 * LOCAL DATABASE untuk testing tanpa Supabase
 * Data disimpan di file: local-db.json (di root project)
 * Otomatis aktif jika NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi
 */

import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'local-db.json')

export interface LocalVoter {
  nisn: string
  name: string
  class: string
  has_voted: boolean
  created_at: string
}

export interface LocalCandidate {
  id: string
  candidate_number: number
  chairman_name: string
  photo_url: string | null
  vision_mission: string | null
  created_at: string
}

export interface LocalVote {
  id: string
  candidate_id: string
  created_at: string
}

export interface LocalDB {
  voters: LocalVoter[]
  candidates: LocalCandidate[]
  votes: LocalVote[]
}

// Data testing default — NIS 4 digit
const DEFAULT_DB: LocalDB = {
  voters: [
    { nisn: '1111', name: 'Ahmad Rizky Pratama',  class: 'X-IPA-1',  has_voted: false, created_at: new Date().toISOString() },
    { nisn: '1112', name: 'Siti Nurhaliza',        class: 'X-IPS-2',  has_voted: false, created_at: new Date().toISOString() },
    { nisn: '1113', name: 'Budi Santoso',          class: 'XI-IPA-3', has_voted: false, created_at: new Date().toISOString() },
    { nisn: '1114', name: 'Dewi Rahmawati',        class: 'XI-IPS-1', has_voted: false, created_at: new Date().toISOString() },
  ],
  candidates: [
    {
      id: 'cand-001',
      candidate_number: 1,
      chairman_name: 'Rizky Aditya',
      photo_url: null,
      vision_mission: 'Mewujudkan OSIS yang aktif, inovatif, dan berprestasi untuk kemajuan sekolah bersama.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cand-002',
      candidate_number: 2,
      chairman_name: 'Fajar Nugraha',
      photo_url: null,
      vision_mission: 'Membangun kebersamaan, kreativitas, dan semangat juang demi sekolah yang lebih baik.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cand-003',
      candidate_number: 3,
      chairman_name: 'Muhammad Ihsan',
      photo_url: null,
      vision_mission: 'Bersatu padu menjadikan sekolah sebagai rumah yang nyaman dan penuh inspirasi.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cand-004',
      candidate_number: 4,
      chairman_name: 'Devano Ramadhan',
      photo_url: null,
      vision_mission: 'Meningkatkan mutu kegiatan ekstrakurikuler dan menciptakan lingkungan sekolah yang inklusif.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'cand-005',
      candidate_number: 5,
      chairman_name: 'Arief Wicaksono',
      photo_url: null,
      vision_mission: 'Menghadirkan program unggulan berbasis digital untuk memperkuat identitas dan kebanggaan sekolah.',
      created_at: new Date().toISOString(),
    },
  ],
  votes: [],
}

// Baca DB dari file (atau buat baru jika belum ada)
export function readDB(): LocalDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8')
      return JSON.parse(raw) as LocalDB
    }
  } catch {
    // jika file rusak, buat ulang
  }
  writeDB(DEFAULT_DB)
  return DEFAULT_DB
}

// Tulis DB ke file
export function writeDB(db: LocalDB): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

// =============================================
// HELPER FUNCTIONS - Mirip Supabase API
// =============================================

/** Cek apakah running dalam mode lokal (Supabase belum dikonfigurasi) */
export function isLocalMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return (
    !url ||
    url === 'https://your-project.supabase.co' ||
    url.includes('your-project')
  )
}

/** Cari voter berdasarkan NIS */
export function localFindVoter(nis: string): LocalVoter | null {
  const db = readDB()
  return db.voters.find((v) => v.nisn === nis.trim()) || null
}

/** Tandai voter sebagai sudah memilih + simpan vote */
export function localSubmitVote(nis: string, candidateId: string): { error?: string } {
  const db = readDB()
  const voterIdx = db.voters.findIndex((v) => v.nisn === nis.trim())

  if (voterIdx === -1) return { error: 'VOTER_NOT_FOUND' }
  if (db.voters[voterIdx].has_voted) return { error: 'ALREADY_VOTED' }

  // Cek kandidat valid
  const candidate = db.candidates.find((c) => c.id === candidateId)
  if (!candidate) return { error: 'CANDIDATE_NOT_FOUND' }

  // Atomic update
  db.voters[voterIdx].has_voted = true
  db.votes.push({
    id: `vote-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    candidate_id: candidateId,
    created_at: new Date().toISOString(),
  })

  writeDB(db)
  return {}
}

/** Ambil semua kandidat dengan jumlah suara */
export function localGetResults() {
  const db = readDB()
  const totalVoters = db.voters.length
  const totalVotes = db.votes.length

  const candidates = db.candidates
    .sort((a, b) => a.candidate_number - b.candidate_number)
    .map((c) => {
      const votes = db.votes.filter((v) => v.candidate_id === c.id).length
      const percentage =
        totalVotes > 0 ? Math.round((votes / totalVotes) * 1000) / 10 : 0
      return {
        id: c.id,
        candidateNumber: c.candidate_number,
        chairmanName: c.chairman_name,
        photoUrl: c.photo_url,
        visionMission: c.vision_mission,
        votes,
        percentage,
      }
    })

  const golput = totalVoters - totalVotes

  return {
    totalVoters,
    totalVotes,
    golput: golput > 0 ? golput : 0,
    participationRate: totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 1000) / 10 : 0,
    candidates,
  }
}

/** Ambil semua voter */
export function localGetVoters(): LocalVoter[] {
  return readDB().voters
}

/** Import/upsert voters */
export function localUpsertVoters(voters: { nisn: string; name: string; class: string }[]): number {
  const db = readDB()
  let count = 0
  for (const v of voters) {
    if (!v.nisn || !v.name || !v.class) continue
    const idx = db.voters.findIndex((w) => w.nisn === v.nisn.trim())
    if (idx >= 0) {
      db.voters[idx] = { ...db.voters[idx], name: v.name.trim(), class: v.class.trim() }
    } else {
      db.voters.push({
        nisn: v.nisn.trim(),
        name: v.name.trim(),
        class: v.class.trim(),
        has_voted: false,
        created_at: new Date().toISOString(),
      })
    }
    count++
  }
  writeDB(db)
  return count
}

/** Reset semua suara (untuk testing ulang) */
export function localResetVotes(): void {
  const db = readDB()
  db.votes = []
  db.voters = db.voters.map((v) => ({ ...v, has_voted: false }))
  writeDB(db)
}

/** Reset data DPT (hapus semua pemilih dan suaranya) */
export function localResetVoters(): void {
  const db = readDB()
  db.voters = []
  db.votes = []
  writeDB(db)
}

/** Ambil semua paslon */
export function localGetCandidates(): LocalCandidate[] {
  return readDB().candidates.sort((a, b) => a.candidate_number - b.candidate_number)
}

/** Buat paslon baru */
export function localCreateCandidate(candidate: Omit<LocalCandidate, 'id' | 'created_at'>): LocalCandidate {
  const db = readDB()
  const newCandidate: LocalCandidate = {
    ...candidate,
    id: `cand-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    created_at: new Date().toISOString(),
  }
  db.candidates.push(newCandidate)
  writeDB(db)
  return newCandidate
}

/** Update paslon */
export function localUpdateCandidate(id: string, updates: Partial<Omit<LocalCandidate, 'id' | 'created_at'>>): LocalCandidate | null {
  const db = readDB()
  const idx = db.candidates.findIndex(c => c.id === id)
  if (idx === -1) return null
  
  db.candidates[idx] = { ...db.candidates[idx], ...updates }
  writeDB(db)
  return db.candidates[idx]
}

/** Hapus paslon */
export function localDeleteCandidate(id: string): boolean {
  const db = readDB()
  const idx = db.candidates.findIndex(c => c.id === id)
  if (idx === -1) return false
  
  // Hapus paslon
  db.candidates.splice(idx, 1)
  
  // Hapus semua suara yang masuk ke paslon tersebut (CASCADE delete)
  db.votes = db.votes.filter(v => v.candidate_id !== id)
  
  writeDB(db)
  return true
}
