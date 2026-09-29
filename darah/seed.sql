INSERT INTO pendonor (nama, golongan, rhesus, telepon, donor_terakhir) VALUES
  ('Hendra Wijaya', 'O', '+', '081111111111', '2026-05-01'),
  ('Maria Ulfa', 'A', '+', '082222222222', '2026-08-15'),
  ('Rudi Hartono', 'B', '-', '083333333333', NULL),
  ('Sinta Dewi', 'AB', '+', '084444444444', '2026-01-10');

-- stok awal: sebagian kedaluwarsa dekat, satu sudah lewat
INSERT INTO stok (golongan, rhesus, komponen, jumlah, tgl_masuk, tgl_kedaluwarsa) VALUES
  ('O', '+', 'WB', 10, '2026-09-01', '2026-10-06'),
  ('O', '+', 'WB', 8, '2026-09-20', '2026-10-25'),
  ('A', '+', 'PRC', 12, '2026-09-10', '2026-10-22'),
  ('B', '-', 'WB', 5, '2026-08-01', '2026-09-05'),
  ('AB', '+', 'FFP', 6, '2026-06-01', '2027-06-01');

INSERT INTO kegiatan (nama, tanggal, lokasi, target_peserta) VALUES
  ('Donor Darah Massal Balai Desa', '2026-10-05', 'Balai Desa Sukamaju', 100),
  ('Donor Darah Kampus UNJ', '2026-10-12', 'Aula Kampus UNJ', 75);
