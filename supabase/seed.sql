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
  ('Kesalahan Ketidaksesuaian Isi Proposal Dengan Bidang Yang Diusulkan (Salah Bidang PKM)'),
  ('Kesalahan Judul (Akronim, Singkatan Tidak Baku atau Lebih Dari 20 Kata pada proposal)'),
  ('Kesalahan Sampul (Terdapat Halaman Sampul/Cover)'),
  ('Kesalahan Pengesahan (Terdapat Halaman Pengesahan)'),
  ('Kesalahan Ukuran Kertas (Bukan A4)'),
  ('Kesalahan Format Paragraf (Tidak Satu Kolom)'),
  ('Kesalahan Font (Tidak Times New Roman, Ukuran 12)'),
  ('Kesalahan Margin (Kiri Tidak 4cm, Atas, Kanan, Bawah Tidak 3cm)'),
  ('Kesalahan Perataan Teks (Teks Paragraf Tidak Rata Kanan-Kiri)'),
  ('Kesalahan Spasi (Teks Paragraf Tidak 1,15)'),
  ('Kesalahan Abstrak'),
  ('Terdapat Ringkasan'),
  ('Kesalahan Sistematika Penulisan PKM'),
  ('Kesalahan Nomor Halaman'),
  ('Kesalahan Letak Nomor Halaman'),
  ('Kesalahan Ketidaksesuaian Luaran Wajib (tidak harus urut) di Profil atau di proposal'),
  ('Kesalahan Format Rekapitulasi Rencana Anggaran Biaya'),
  ('Kesalahan Nominal Pengajuan Anggaran ke Dit. APTV/Belmawa (wajib min 5 jt dan maks 8 jt)'),
  ('Kesalahan Nominal Dana Pendamping Perguruan Tinggi (Wajib Maks 2.000.000 (baik tunai/barang))'),
  ('Kesalahan Format Jadwal Kegiatan (tidak Sesuai Lampiran 1 Buku Panduan)'),
  ('Kesalahan Waktu Pelaksanaan (Tidak 3-4 Bulan)'),
  ('Kesalahan Jumlah Halaman'),
  ('Kesalahan Daftar Pustaka (Tidak Harvard Style, Urut Abjad, dan Menguraikan Nama Penulis)'),
  ('Kesalahan Ketidaksesuaian Kelengkapan Dokumen dan Lampiran'),
  ('Kesalahan Ketidaksesuaian Kriteria Keilmuan Bidang PKM atau Jumlah Anggota tidak Sesuai'),
  ('Kesalahan Tanggal / Bulan / Tahun (Tidak antara 2 Mei - 2 Juni 2025)'),
  ('Kesalahan Tanda Tangan (Pengusul / Pendamping / Mitra)'),
  ('Kesalahan Surat Pernyataan Ketua Tim Pengusul')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. KRITERIA SUBSTANSI (per Bidang PKM)
-- ============================================

-- PKM-RE (id_bidang_pkm = 1)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (1, 'Kreativitas: Gagasan (orisinalitas, unik dan bermanfaat)', 15),
  (1, 'Kreativitas: Penyajian rumusan masalah (data lengkap, fokus dan atraktif)', 15),
  (1, 'Kreativitas: Perbandingan dengan riset terdahulu (kebaruan)', 10),
  (1, 'Kesesuaian dan Kemutakhiran Metode Riset', 15),
  (1, 'Potensi Program: Kontribusi Perkembangan Ilmu dan Teknologi', 10),
  (1, 'Potensi Program: Sintesis Telaah Literatur, Potensi dan Prediksi Hasil Riset', 15),
  (1, 'Potensi Program: Kemanfaatan', 10),
  (1, 'Penjadwalan Kegiatan dan Personalia: (lengkap, jelas, waktu, dan personalianya sesuai)', 5),
  (1, 'Penyusunan Anggaran Biaya: (lengkap, rinci, wajar dan jelas peruntukannya)', 5);

-- PKM-RSH (id_bidang_pkm = 2)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (2, 'Kreativitas: Gagasan (orisinalitas, unik dan bermanfaat)', 15),
  (2, 'Kreativitas: Penyajian rumusan masalah (data lengkap, fokus dan atraktif)', 15),
  (2, 'Kreativitas: Perbandingan dengan riset terdahulu (state of the art)', 10),
  (2, 'Kesesuaian dan Kemutakhiran Metode Riset', 15),
  (2, 'Potensi Program: Kontribusi Perkembangan Ilmu dan Teknologi', 10),
  (2, 'Potensi Program: Sintesis Telaah Literatur, Potensi dan Prediksi Hasil Riset', 15),
  (2, 'Potensi Program: Kemanfaatan', 10),
  (2, 'Penjadwalan Kegiatan dan Personalia: (lengkap, jelas, waktu, dan personalianya sesuai)', 5),
  (2, 'Penyusunan Anggaran Biaya: (lengkap, rinci, wajar dan jelas peruntukannya)', 5);

-- PKM-PM (id_bidang_pkm = 3)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (3, 'Kreativitas: Perumusan Masalah', 15),
  (3, 'Kreativitas: Ketepatan Solusi (fokus dan atraktif)', 15),
  (3, 'Ketepatan Masyarakat Mitra dan Kondisi Eksisting Mitra', 15),
  (3, 'Potensi Program: Potensi Nilai Tambah untuk Mitra Program', 20),
  (3, 'Potensi Program: Potensi Keberlanjutan Program', 20),
  (3, 'Potensi Program: Kemanfaatan', 5),
  (3, 'Penjadwalan Kegiatan dan Personalia (lengkap, jelas, waktu, dan personalianya sesuai)', 5),
  (3, 'Penyusunan Anggaran Biaya (lengkap, rinci, wajar dan jelas peruntukannya)', 5);

-- PKM-PI (id_bidang_pkm = 4)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (4, 'Kreativitas: Identifikasi Permasalahan atau Kebutuhan Mitra', 10),
  (4, 'Kreativitas: Ketepatan Solusi yang Ditawarkan', 20),
  (4, 'Ketepatan Mitra Program', 15),
  (4, 'Potensi Program: Potensi Nilai Tambah untuk Mitra Program', 25),
  (4, 'Potensi Program: Potensi Keberlanjutan Program', 20),
  (4, 'Penjadwalan Kegiatan dan Personalia: (lengkap, jelas, waktu, dan personalianya sesuai)', 5),
  (4, 'Penyusunan Anggaran Biaya: (lengkap, rinci, wajar dan jelas peruntukannya)', 5);

-- PKM-KC (id_bidang_pkm = 5)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (5, 'Kreativitas: Gagasan (orisinalitas, unik dan manfaat masa depan)', 20),
  (5, 'Kreativitas: Kemutakhiran ipteks yang diadopsi', 20),
  (5, 'Kesesuaian Tahap Pelaksanaan', 15),
  (5, 'Potensi Program: Kontribusi produk luaran terhadap solusi permasalahan dan perkembangan IPTEKS', 25),
  (5, 'Potensi Program: Potensi Publikasi Artikel Ilmiah/Kekayaan Intelektual', 10),
  (5, 'Penjadwalan Kegiatan dan Personalia: (Lengkap, Jelas, Waktu, dan Personalianya Sesuai)', 5),
  (5, 'Penyusunan Anggaran Biaya: (Lengkap, Rinci, Wajar dan Jelas Peruntukannya)', 5);

-- PKM-KI (id_bidang_pkm = 6)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (6, 'Kreativitas: Identifikasi Permasalahan atau Kebutuhan Pelanggan/Mitra', 15),
  (6, 'Kreativitas: Ketepatan Solusi (fokus dan atraktif)', 15),
  (6, 'Kesesuaian Target Pengguna/Konsumen', 15),
  (6, 'Potensi Program: Nilai Tambah bagi Target Pengguna', 25),
  (6, 'Potensi Program: Potensi Komersialisasi/Kemanfaatan', 20),
  (6, 'Penjadwalan Kegiatan dan Personalia (lengkap, jelas, waktu, dan personalianya sesuai)', 5),
  (6, 'Penyusunan Anggaran Biaya (lengkap, rinci, wajar dan jelas peruntukannya)', 5);

-- PKM-K (id_bidang_pkm = 7)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (7, 'Kreativitas: Gagasan Usaha (analisis peluang pasar, dukungan sumber daya)', 15),
  (7, 'Kreativitas: Keunggulan Produk/Jasa', 15),
  (7, 'Kreativitas: Potensi Pasar/Peluang Pasar', 15),
  (7, 'Potensi Program: Potensi Perolehan Profit/Keuntungan', 25),
  (7, 'Potensi Program: Potensi Keberlanjutan Usaha', 20),
  (7, 'Penjadwalan Kegiatan dan Personalia (lengkap, jelas, waktu, dan personalianya sesuai)', 5),
  (7, 'Penyusunan Anggaran Biaya (lengkap, rinci, wajar dan jelas peruntukannya)', 5);

-- PKM-VGK (id_bidang_pkm = 8)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (8, 'Kreativitas: Gagasan (orisinalitas, unik, dan bermanfaat)', 20),
  (8, 'Kreativitas: Kesesuaian tema dan kejelasan ide', 20),
  (8, 'Konstruksi Gagasan: Logika penyelesaian masalah dan visibilitas penerapan', 20),
  (8, 'Potensi Program: Kemanfaatan dan Dampak Gagasan', 30),
  (8, 'Penjadwalan Kegiatan dan Personalia (lengkap, jelas, waktu, dan personalianya sesuai)', 5),
  (8, 'Penyusunan Anggaran Biaya (lengkap, rinci, wajar dan jelas peruntukannya)', 5);

-- PKM-AI (id_bidang_pkm = 9)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (9, 'Kreativitas dan Orisinalitas Artikel', 20),
  (9, 'Pendahuluan (kemutakhiran dan urgensi)', 15),
  (9, 'Metode/Cara Pelaksanaan', 15),
  (9, 'Hasil dan Pembahasan (Analisis dan sintesis)', 30),
  (9, 'Kesimpulan dan Daftar Pustaka', 10),
  (9, 'Sistematika Penulisan', 10);

-- PKM-GFT (id_bidang_pkm = 10)
INSERT INTO kriteria_substansi (id_bidang_pkm, deskripsi, bobot) VALUES
  (10, 'Kreativitas: Gagasan (orisinalitas, unik, dan visioner)', 25),
  (10, 'Konstruksi Gagasan: Logika dan Prediksi Dampak', 25),
  (10, 'Kelayakan Implementasi Gagasan', 20),
  (10, 'Kemanfaatan Gagasan', 20),
  (10, 'Sistematika Penulisan dan Penggunaan Bahasa', 10);

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
