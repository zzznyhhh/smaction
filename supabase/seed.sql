-- ============================================
-- E-Voting OSIS - Data Testing / Seed
-- NIS 4 digit untuk testing lokal
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Insert data testing voters (NIS 4 digit)
INSERT INTO voters (nisn, name, class, has_voted) VALUES
  ('1111', 'Ahmad Rizky Pratama',   'X-IPA-1', FALSE),
  ('1112', 'Siti Nurhaliza',        'X-IPS-2', FALSE),
  ('1113', 'Budi Santoso',          'XI-IPA-3', FALSE),
  ('1114', 'Dewi Rahmawati',        'XI-IPS-1', FALSE)
ON CONFLICT (nisn) DO NOTHING;

-- ============================================
-- (Opsional) Contoh kandidat untuk testing
-- ============================================
INSERT INTO candidates (candidate_number, chairman_name, vice_chairman_name, vision_mission) VALUES
  (1, 'Rizky Aditya', 'Salsabila Putri',
   'Mewujudkan OSIS yang aktif, inovatif, dan berprestasi untuk kemajuan sekolah bersama.'),
  (2, 'Fajar Nugraha', 'Anisa Rahayu',
   'Membangun kebersamaan, kreativitas, dan semangat juang demi sekolah yang lebih baik.')
ON CONFLICT (candidate_number) DO NOTHING;
