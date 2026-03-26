-- ============================================
-- PKM Reviewer - Seeder Data
-- Jalankan SQL ini di Supabase SQL Editor
-- SETELAH migration.sql berhasil dijalankan
-- ============================================

-- ============================================
-- 1. BIDANG PKM (Kategori PKM)
-- ============================================
INSERT INTO bidang_pkm (id_bidang_pkm, nama, created_at) VALUES
  (1,  'PKM-RE',  NOW()),
  (2,  'PKM-RSH', NOW()),
  (3,  'PKM-PM',  NOW()),
  (4,  'PKM-PI',  NOW()),
  (5,  'PKM-KC',  NOW()),
  (6,  'PKM-KI',  NOW()),
  (7,  'PKM-K',   NOW()),
  (8,  'PKM-VGK', NOW()),
  (9,  'PKM-AI',  NOW()),
  (10, 'PKM-GFT', NOW())
ON CONFLICT (id_bidang_pkm) DO NOTHING;

-- Reset sequence agar id selanjutnya mulai dari 11
SELECT setval('bidang_pkm_id_bidang_pkm_seq', 10);

-- ============================================
-- 2. KRITERIA ADMINISTRASI
-- ============================================
INSERT INTO kriteria_administrasi (deskripsi) VALUES
  ('Kelengkapan identitas pengusul (nama, NIM, program studi, perguruan tinggi)'),
  ('Kesesuaian bidang PKM yang dipilih'),
  ('Kelengkapan dokumen proposal (halaman judul, daftar isi, ringkasan, pendahuluan, tinjauan pustaka, metode, biaya, daftar pustaka, lampiran)'),
  ('Format penulisan sesuai panduan (font, spasi, margin, jumlah halaman)'),
  ('Kelengkapan dan keabsahan tanda tangan (ketua, anggota, dosen pembimbing, pimpinan PT)'),
  ('Kesesuaian anggaran biaya dengan ketentuan (total dana, rincian penggunaan)'),
  ('Kelengkapan biodata pengusul dan dosen pembimbing'),
  ('Jadwal kegiatan yang jelas dan realistis'),
  ('Surat pernyataan ketua pelaksana'),
  ('Kelengkapan lampiran pendukung (surat keterangan, foto, dokumen lainnya)')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. KRITERIA SUBSTANSI (per Bidang PKM)
-- ============================================

-- PKM-RE (id_bidang_pkm = 1)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (1, 'Perumusan masalah (kejelasan, relevansi, dan urgensi masalah penelitian)', 15),
  (1, 'Tinjauan pustaka dan landasan teori (kesesuaian, kedalaman, kemutakhiran referensi)', 15),
  (1, 'Metode penelitian (ketepatan, kesesuaian dengan masalah, dan langkah-langkah pelaksanaan)', 25),
  (1, 'Potensi hasil dan luaran (kontribusi ilmiah, kebaruan, dan dampak)', 25),
  (1, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (1, 'Kualitas penulisan dan sistematika proposal', 10);

-- PKM-RSH (id_bidang_pkm = 2)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (2, 'Perumusan masalah sosial humaniora (kejelasan dan relevansi)', 15),
  (2, 'Tinjauan pustaka dan kerangka pemikiran', 15),
  (2, 'Metode penelitian sosial humaniora (pendekatan, teknik pengumpulan data)', 25),
  (2, 'Potensi hasil dan luaran penelitian', 25),
  (2, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (2, 'Kualitas penulisan dan sistematika proposal', 10);

-- PKM-PM (id_bidang_pkm = 3)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (3, 'Analisis situasi dan permasalahan mitra (kejelasan dan urgensi)', 20),
  (3, 'Solusi yang ditawarkan (kesesuaian, kreativitas, dan keberlanjutan)', 25),
  (3, 'Metode pelaksanaan pengabdian (langkah-langkah, partisipasi masyarakat)', 20),
  (3, 'Target luaran dan dampak bagi masyarakat', 20),
  (3, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (3, 'Kualitas penulisan dan sistematika proposal', 5);

-- PKM-PI (id_bidang_pkm = 4)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (4, 'Kreativitas dan inovasi ide (kebaruan, originalitas)', 25),
  (4, 'Analisis peluang pasar dan studi kelayakan', 20),
  (4, 'Metode pelaksanaan dan rencana produksi', 20),
  (4, 'Strategi pemasaran dan analisis keuangan', 20),
  (4, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (4, 'Kualitas penulisan dan sistematika proposal', 5);

-- PKM-KC (id_bidang_pkm = 5)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (5, 'Kreativitas dan inovasi karya cipta (kebaruan dan originalitas)', 30),
  (5, 'Dasar teori dan konsep yang digunakan', 15),
  (5, 'Metode perancangan dan pembuatan karya', 20),
  (5, 'Potensi manfaat dan implementasi karya', 20),
  (5, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (5, 'Kualitas penulisan dan sistematika proposal', 5);

-- PKM-KI (id_bidang_pkm = 6)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (6, 'Perumusan masalah dan gagasan konstruktif', 20),
  (6, 'Kedalaman kajian teoritik dan tinjauan pustaka', 20),
  (6, 'Metodologi dan analisis gagasan', 25),
  (6, 'Kesimpulan dan rekomendasi (kontribusi pemikiran)', 20),
  (6, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (6, 'Kualitas penulisan dan sistematika proposal', 5);

-- PKM-K (id_bidang_pkm = 7)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (7, 'Perumusan masalah dan latar belakang kewirausahaan', 15),
  (7, 'Analisis peluang usaha dan studi kelayakan', 20),
  (7, 'Rencana bisnis dan strategi pemasaran', 25),
  (7, 'Analisis keuangan dan proyeksi keuntungan', 20),
  (7, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (7, 'Kualitas penulisan dan sistematika proposal', 10);

-- PKM-VGK (id_bidang_pkm = 8)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (8, 'Kreativitas dan keaslian konten video/gagasan', 30),
  (8, 'Pesan dan narasi yang disampaikan (kejelasan, relevansi)', 25),
  (8, 'Teknis pembuatan (kualitas visual, audio, editing)', 20),
  (8, 'Potensi dampak dan manfaat bagi masyarakat', 15),
  (8, 'Kualitas penulisan naskah dan deskripsi', 10);

-- PKM-AI (id_bidang_pkm = 9)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (9, 'Kreativitas dan inovasi penerapan AI/teknologi', 30),
  (9, 'Perumusan masalah dan relevansi solusi AI', 20),
  (9, 'Metode pengembangan dan implementasi', 20),
  (9, 'Potensi hasil, dampak, dan keberlanjutan', 15),
  (9, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (9, 'Kualitas penulisan dan sistematika proposal', 5);

-- PKM-GFT (id_bidang_pkm = 10)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (10, 'Kreativitas dan inovasi gagasan futuristik', 30),
  (10, 'Kelayakan ilmiah dan dasar teori', 20),
  (10, 'Metode dan pendekatan yang diusulkan', 20),
  (10, 'Potensi dampak jangka panjang bagi masa depan', 15),
  (10, 'Penjadwalan kegiatan dan kewajaran anggaran', 10),
  (10, 'Kualitas penulisan dan sistematika proposal', 5);

-- ============================================
-- 4. DATA CONTOH: DOSEN PEMBIMBING
-- ============================================
INSERT INTO dosen (nama, nidn, email, nomer_hp) VALUES
  ('Dr. Budi Santoso, M.Kom.',    '0001018501', 'budi.santoso@university.ac.id',    '081234567001'),
  ('Dr. Siti Rahayu, M.Si.',      '0002028502', 'siti.rahayu@university.ac.id',     '081234567002'),
  ('Prof. Ahmad Wijaya, Ph.D.',   '0003038503', 'ahmad.wijaya@university.ac.id',    '081234567003'),
  ('Dr. Dewi Lestari, M.T.',      '0004048504', 'dewi.lestari@university.ac.id',    '081234567004'),
  ('Dr. Eko Prasetyo, M.Eng.',    '0005058505', 'eko.prasetyo@university.ac.id',    '081234567005');

-- ============================================
-- 5. DATA CONTOH: MAHASISWA
-- ============================================
INSERT INTO mahasiswa (nama, nim, program_studi, jurusan, nomer_hp, email) VALUES
  ('Andi Pratama',    '2021001001', 'Teknik Informatika',   'Teknik Elektro',       '082100100101', 'andi.pratama@student.ac.id'),
  ('Bella Safitri',   '2021001002', 'Sistem Informasi',     'Teknik Elektro',       '082100100102', 'bella.safitri@student.ac.id'),
  ('Cahyo Nugroho',   '2021002001', 'Teknik Mesin',         'Teknik Mesin',         '082100200101', 'cahyo.nugroho@student.ac.id'),
  ('Dina Maharani',   '2021003001', 'Manajemen',            'Ekonomi dan Bisnis',   '082100300101', 'dina.maharani@student.ac.id'),
  ('Eko Saputra',     '2021004001', 'Teknik Kimia',         'Teknik Kimia',         '082100400101', 'eko.saputra@student.ac.id'),
  ('Fitri Handayani', '2021001003', 'Teknik Informatika',   'Teknik Elektro',       '082100100103', 'fitri.handayani@student.ac.id'),
  ('Galih Ramadhan',  '2021002002', 'Teknik Industri',      'Teknik Mesin',         '082100200102', 'galih.ramadhan@student.ac.id'),
  ('Hana Permata',    '2021003002', 'Akuntansi',            'Ekonomi dan Bisnis',   '082100300102', 'hana.permata@student.ac.id');

-- ============================================
-- 6. DATA CONTOH: PROPOSAL
-- ============================================
INSERT INTO proposal (judul, id_mahasiswa, id_dosen, id_bidang_pkm, status_penilaian, jumlah_anggota) VALUES
  ('Pengembangan Sistem Deteksi Dini Banjir Berbasis IoT dan Machine Learning',
    1, 1, 1, 'Belum Dinilai', 3),
  ('Studi Dampak Media Sosial terhadap Kesehatan Mental Mahasiswa di Era Digital',
    2, 2, 2, 'Belum Dinilai', 4),
  ('Pemberdayaan UMKM Desa melalui Pelatihan Digital Marketing dan E-Commerce',
    3, 3, 3, 'Belum Dinilai', 5),
  ('Inovasi Produk Pangan Fungsional dari Limbah Kulit Pisang untuk Kesehatan Pencernaan',
    4, 4, 4, 'Belum Dinilai', 3),
  ('Rancang Bangun Robot Penyortir Sampah Otomatis Berbasis Computer Vision',
    5, 5, 5, 'Belum Dinilai', 4),
  ('Analisis Kebijakan Pengelolaan Sumber Daya Air Berkelanjutan di Wilayah Perkotaan',
    6, 1, 6, 'Belum Dinilai', 3),
  ('Startup Aplikasi Marketplace Jasa Freelance untuk Mahasiswa',
    7, 2, 7, 'Belum Dinilai', 5),
  ('Video Edukasi Interaktif Pelestarian Budaya Lokal melalui Teknologi AR',
    8, 3, 8, 'Belum Dinilai', 4);

-- ============================================
-- 7. DATA CONTOH: DETAIL PENDANAAN
-- ============================================
INSERT INTO detail_pendanaan (id_proposal, dana_simbelmawa, dana_perguruan_tinggi, dana_pihak_lain) VALUES
  (1, 8000000,  2000000, 0),
  (2, 7500000,  1500000, 500000),
  (3, 10000000, 2500000, 1000000),
  (4, 9000000,  2000000, 500000),
  (5, 12000000, 3000000, 0),
  (6, 6000000,  1500000, 0),
  (7, 11000000, 2000000, 2000000),
  (8, 8500000,  2500000, 1000000);

-- ============================================
-- CATATAN PENTING
-- ============================================
--
-- User Admin: Harus dibuat melalui registrasi di aplikasi,
-- kemudian ubah role-nya menjadi 'admin' dengan menjalankan:
--
--   UPDATE users SET role = 'admin' WHERE email = 'email_admin@example.com';
--
-- Setelah itu, admin bisa assign reviewer ke proposal
-- melalui dashboard admin.
-- ============================================
