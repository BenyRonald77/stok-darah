CREATE TABLE IF NOT EXISTS pendonor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  golongan TEXT NOT NULL CHECK (golongan IN ('A','B','AB','O')),
  rhesus TEXT NOT NULL DEFAULT '+' CHECK (rhesus IN ('+','-')),
  telepon TEXT,
  donor_terakhir TEXT
);

CREATE TABLE IF NOT EXISTS stok (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  golongan TEXT NOT NULL,
  rhesus TEXT NOT NULL,
  komponen TEXT NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah >= 0),
  tgl_masuk TEXT NOT NULL,
  tgl_kedaluwarsa TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donasi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pendonor_id INTEGER NOT NULL REFERENCES pendonor(id),
  tanggal TEXT NOT NULL,
  golongan TEXT NOT NULL,
  rhesus TEXT NOT NULL,
  komponen TEXT NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0)
);

CREATE TABLE IF NOT EXISTS permintaan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rumah_sakit TEXT NOT NULL,
  golongan TEXT NOT NULL,
  rhesus TEXT NOT NULL,
  komponen TEXT NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  tanggal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu'
    CHECK (status IN ('menunggu','dipenuhi','ditolak')),
  catatan TEXT
);

CREATE TABLE IF NOT EXISTS kegiatan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  target_peserta INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stok_gol ON stok(golongan, rhesus, komponen, tgl_kedaluwarsa);
CREATE INDEX IF NOT EXISTS idx_donasi_pendonor ON donasi(pendonor_id);
