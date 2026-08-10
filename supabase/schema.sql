-- ============================================
-- E-Voting OSIS - Database Schema
-- Menggunakan NIS (4 digit) sebagai identifikasi siswa
-- Run this in Supabase SQL Editor
-- ============================================

-- Tabel 1: voters (DPT - Daftar Pemilih Tetap)
-- Catatan: kolom tetap bernama 'nisn' di DB untuk kompatibilitas,
--          tapi kita isi dengan NIS 4 digit
CREATE TABLE IF NOT EXISTS voters (
  nisn      VARCHAR(10) PRIMARY KEY,  -- berisi NIS 4 digit
  name      VARCHAR(100) NOT NULL,
  class     VARCHAR(20) NOT NULL,
  has_voted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voters_nisn ON voters(nisn);

-- Tabel 2: candidates (Paslon)
CREATE TABLE IF NOT EXISTS candidates (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_number   INT NOT NULL UNIQUE,
  chairman_name      VARCHAR(100) NOT NULL,
  vice_chairman_name VARCHAR(100) NOT NULL,
  photo_url          TEXT,
  vision_mission     TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel 3: votes (Kotak Suara - ANONIM, tidak ada FK ke voters)
CREATE TABLE IF NOT EXISTS votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);
