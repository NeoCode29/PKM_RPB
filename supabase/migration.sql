-- ============================================
-- PKM Reviewer - Database Migration
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Tabel Users (profil pengguna)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'reviewer' CHECK (role IN ('admin', 'reviewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Bidang PKM
CREATE TABLE IF NOT EXISTS bidang_pkm (
  id_bidang_pkm SERIAL PRIMARY KEY,
  nama TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
  id_mahasiswa SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  nim TEXT NOT NULL,
  program_studi TEXT NOT NULL,
  jurusan TEXT NOT NULL,
  nomer_hp TEXT NOT NULL,
  email TEXT NOT NULL
);

-- 4. Tabel Dosen
CREATE TABLE IF NOT EXISTS dosen (
  id_dosen SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  nidn TEXT NOT NULL,
  email TEXT NOT NULL,
  nomer_hp TEXT NOT NULL
);

-- 5. Tabel Proposal
CREATE TABLE IF NOT EXISTS proposal (
  id_proposal SERIAL PRIMARY KEY,
  judul TEXT NOT NULL,
  id_mahasiswa INT NOT NULL REFERENCES mahasiswa(id_mahasiswa) ON DELETE CASCADE,
  id_dosen INT NOT NULL REFERENCES dosen(id_dosen) ON DELETE CASCADE,
  id_bidang_pkm INT NOT NULL REFERENCES bidang_pkm(id_bidang_pkm) ON DELETE CASCADE,
  url_file TEXT,
  status_penilaian TEXT DEFAULT 'Belum Dinilai',
  jumlah_anggota INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabel Detail Pendanaan
CREATE TABLE IF NOT EXISTS detail_pendanaan (
  id SERIAL PRIMARY KEY,
  id_proposal INT NOT NULL REFERENCES proposal(id_proposal) ON DELETE CASCADE,
  dana_simbelmawa NUMERIC NOT NULL DEFAULT 0,
  dana_perguruan_tinggi NUMERIC NOT NULL DEFAULT 0,
  dana_pihak_lain NUMERIC NOT NULL DEFAULT 0
);

-- 7. Tabel Reviewer (assignment reviewer ke proposal)
CREATE TABLE IF NOT EXISTS reviewer (
  id_reviewer SERIAL PRIMARY KEY,
  id_proposal INT NOT NULL REFERENCES proposal(id_proposal) ON DELETE CASCADE,
  id_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  no INT NOT NULL CHECK (no IN (1, 2))
);

-- 8. Tabel Kriteria Administrasi
CREATE TABLE IF NOT EXISTS kriteria_administrasi (
  id_kriteria SERIAL PRIMARY KEY,
  deskripsi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Tabel Kriteria Substansi
CREATE TABLE IF NOT EXISTS kriteria_substansi (
  id_kriteria SERIAL PRIMARY KEY,
  id_bidang_pkm INT REFERENCES bidang_pkm(id_bidang_pkm) ON DELETE SET NULL,
  deskripsi TEXT,
  bobot NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Tabel Penilaian Administrasi
CREATE TABLE IF NOT EXISTS penilaian_administrasi (
  id_penilaian_administrasi SERIAL PRIMARY KEY,
  id_reviewer INT NOT NULL REFERENCES reviewer(id_reviewer) ON DELETE CASCADE,
  total_kesalahan INT DEFAULT 0,
  status BOOLEAN DEFAULT FALSE,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 11. Tabel Detail Penilaian Administrasi
CREATE TABLE IF NOT EXISTS detail_penilaian_administrasi (
  id_detail_penilaian SERIAL PRIMARY KEY,
  id_penilaian INT REFERENCES penilaian_administrasi(id_penilaian_administrasi) ON DELETE CASCADE,
  id_kriteria INT REFERENCES kriteria_administrasi(id_kriteria) ON DELETE CASCADE,
  kesalahan BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Tabel Penilaian Substansi
CREATE TABLE IF NOT EXISTS penilaian_substansi (
  id SERIAL PRIMARY KEY,
  id_reviewer INT NOT NULL REFERENCES reviewer(id_reviewer) ON DELETE CASCADE,
  total_nilai NUMERIC DEFAULT 0,
  status BOOLEAN DEFAULT FALSE,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 13. Tabel Detail Penilaian Substansi
CREATE TABLE IF NOT EXISTS detail_penilaian_substansi (
  id SERIAL PRIMARY KEY,
  id_penilaian INT NOT NULL REFERENCES penilaian_substansi(id) ON DELETE CASCADE,
  id_kriteria INT NOT NULL REFERENCES kriteria_substansi(id_kriteria) ON DELETE CASCADE,
  skor INT,
  nilai NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES untuk performa query
-- ============================================

CREATE INDEX IF NOT EXISTS idx_proposal_bidang ON proposal(id_bidang_pkm);
CREATE INDEX IF NOT EXISTS idx_proposal_mahasiswa ON proposal(id_mahasiswa);
CREATE INDEX IF NOT EXISTS idx_proposal_dosen ON proposal(id_dosen);
CREATE INDEX IF NOT EXISTS idx_reviewer_proposal ON reviewer(id_proposal);
CREATE INDEX IF NOT EXISTS idx_reviewer_user ON reviewer(id_user);
CREATE INDEX IF NOT EXISTS idx_penilaian_adm_reviewer ON penilaian_administrasi(id_reviewer);
CREATE INDEX IF NOT EXISTS idx_penilaian_sub_reviewer ON penilaian_substansi(id_reviewer);
CREATE INDEX IF NOT EXISTS idx_detail_penilaian_adm ON detail_penilaian_administrasi(id_penilaian);
CREATE INDEX IF NOT EXISTS idx_detail_penilaian_sub ON detail_penilaian_substansi(id_penilaian);
CREATE INDEX IF NOT EXISTS idx_kriteria_sub_bidang ON kriteria_substansi(id_bidang_pkm);
CREATE INDEX IF NOT EXISTS idx_detail_pendanaan_proposal ON detail_pendanaan(id_proposal);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidang_pkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE mahasiswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosen ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_pendanaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer ENABLE ROW LEVEL SECURITY;
ALTER TABLE kriteria_administrasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kriteria_substansi ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian_administrasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_penilaian_administrasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian_substansi ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_penilaian_substansi ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper: cek apakah user adalah admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- === USERS ===
-- User bisa lihat profil sendiri
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admin bisa lihat semua users
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (is_admin());

-- Admin bisa update semua users
CREATE POLICY "Admin can update all users" ON users
  FOR UPDATE USING (is_admin());

-- User baru bisa insert profil sendiri saat registrasi
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- === BIDANG PKM ===
-- Semua authenticated user bisa lihat
CREATE POLICY "Authenticated users can view bidang_pkm" ON bidang_pkm
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin bisa CRUD
CREATE POLICY "Admin full access bidang_pkm" ON bidang_pkm
  FOR ALL USING (is_admin());

-- === MAHASISWA ===
CREATE POLICY "Authenticated users can view mahasiswa" ON mahasiswa
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access mahasiswa" ON mahasiswa
  FOR ALL USING (is_admin());

-- === DOSEN ===
CREATE POLICY "Authenticated users can view dosen" ON dosen
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access dosen" ON dosen
  FOR ALL USING (is_admin());

-- === PROPOSAL ===
CREATE POLICY "Authenticated users can view proposal" ON proposal
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access proposal" ON proposal
  FOR ALL USING (is_admin());

-- === DETAIL PENDANAAN ===
CREATE POLICY "Authenticated users can view detail_pendanaan" ON detail_pendanaan
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access detail_pendanaan" ON detail_pendanaan
  FOR ALL USING (is_admin());

-- === REVIEWER ===
CREATE POLICY "Authenticated users can view reviewer" ON reviewer
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access reviewer" ON reviewer
  FOR ALL USING (is_admin());

-- === KRITERIA ADMINISTRASI ===
CREATE POLICY "Authenticated users can view kriteria_administrasi" ON kriteria_administrasi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access kriteria_administrasi" ON kriteria_administrasi
  FOR ALL USING (is_admin());

-- === KRITERIA SUBSTANSI ===
CREATE POLICY "Authenticated users can view kriteria_substansi" ON kriteria_substansi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access kriteria_substansi" ON kriteria_substansi
  FOR ALL USING (is_admin());

-- === PENILAIAN ADMINISTRASI ===
CREATE POLICY "Authenticated users can view penilaian_administrasi" ON penilaian_administrasi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access penilaian_administrasi" ON penilaian_administrasi
  FOR ALL USING (is_admin());

-- Reviewer bisa insert/update penilaian mereka sendiri
CREATE POLICY "Reviewer can manage own penilaian_administrasi" ON penilaian_administrasi
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM reviewer r
      WHERE r.id_reviewer = penilaian_administrasi.id_reviewer
      AND r.id_user = auth.uid()
    )
  );

-- === DETAIL PENILAIAN ADMINISTRASI ===
CREATE POLICY "Authenticated users can view detail_penilaian_administrasi" ON detail_penilaian_administrasi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access detail_penilaian_administrasi" ON detail_penilaian_administrasi
  FOR ALL USING (is_admin());

CREATE POLICY "Reviewer can manage own detail_penilaian_administrasi" ON detail_penilaian_administrasi
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM penilaian_administrasi pa
      JOIN reviewer r ON r.id_reviewer = pa.id_reviewer
      WHERE pa.id_penilaian_administrasi = detail_penilaian_administrasi.id_penilaian
      AND r.id_user = auth.uid()
    )
  );

-- === PENILAIAN SUBSTANSI ===
CREATE POLICY "Authenticated users can view penilaian_substansi" ON penilaian_substansi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access penilaian_substansi" ON penilaian_substansi
  FOR ALL USING (is_admin());

CREATE POLICY "Reviewer can manage own penilaian_substansi" ON penilaian_substansi
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM reviewer r
      WHERE r.id_reviewer = penilaian_substansi.id_reviewer
      AND r.id_user = auth.uid()
    )
  );

-- === DETAIL PENILAIAN SUBSTANSI ===
CREATE POLICY "Authenticated users can view detail_penilaian_substansi" ON detail_penilaian_substansi
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access detail_penilaian_substansi" ON detail_penilaian_substansi
  FOR ALL USING (is_admin());

CREATE POLICY "Reviewer can manage own detail_penilaian_substansi" ON detail_penilaian_substansi
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM penilaian_substansi ps
      JOIN reviewer r ON r.id_reviewer = ps.id_reviewer
      WHERE ps.id = detail_penilaian_substansi.id_penilaian
      AND r.id_user = auth.uid()
    )
  );
