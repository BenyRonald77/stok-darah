# PRD — Manajemen Stok Darah

Stok kantong darah per golongan dan komponen dengan tanggal kedaluwarsa,
permintaan darah dari rumah sakit, jadwal kegiatan donor, dan pengingat
pendonor saat sudah boleh donor lagi.

## Tujuan

Unit donor darah (PMI/RS) mencatat stok kantong per golongan (A/B/AB/O)
dan komponen (WB/PRC/FFP/Trombosit) beserta tanggal kedaluwarsanya,
melayani permintaan dari rumah sakit dengan pengurangan stok FIFO
(kedaluwarsa terdekat dipakai dulu), menjadwalkan kegiatan donor, dan
mengingatkan pendonor yang sudah boleh donor lagi.

## Stack

- Backend: Python + Flask, SQLite (stdlib `sqlite3`)
- Frontend: HTML + vanilla JS + CSS murni

## Model Data

- `pendonor`: id, nama, golongan, rhesus (+/-), telepon, donor_terakhir
- `stok`: id, golongan, rhesus, komponen, jumlah, tgl_masuk, tgl_kedaluwarsa
- `donasi`: id, pendonor_id, tanggal, golongan, rhesus, komponen, jumlah
  (menambah baris stok)
- `permintaan`: id, rumah_sakit, golongan, rhesus, komponen, jumlah,
  tanggal, status (`menunggu`/`dipenuhi`/`ditolak`), catatan
- `kegiatan`: id, nama, tanggal, lokasi, target_peserta

## Aturan Bisnis

1. Stok tersedia = jumlah pada baris stok yang belum kedaluwarsa
   (tgl_kedaluwarsa >= hari ini).
2. Pemenuhan permintaan memakai FIFO: kurangi dari baris dengan
   tgl_kedaluwarsa terdekat dulu. Ditolak (`409`) bila stok tersedia kurang.
3. Donasi menambah stok dengan masa simpan per komponen:
   WB 35 hari, PRC 42 hari, FFP 365 hari (beku), Trombosit 5 hari.
4. Pendonor boleh donor lagi setelah 90 hari dari donor_terakhir
   (atau bila belum pernah donor). Endpoint pengingat menampilkan yang
   sudah eligible.
5. Permintaan yang `menunggu` bisa `dipenuhi` (kurangi stok) atau `ditolak`
   dengan catatan.

## Tahap Pengerjaan

- **F0 — Fondasi**: PRD, README, struktur, requirements, .gitignore.
- **F1 — Database + API inti**: schema, seed, CRUD pendonor & kegiatan,
  donasi (tambah stok + update donor_terakhir).
- **F2 — Permintaan & pengingat**: permintaan RS, pemenuhan FIFO dengan
  validasi stok, penolakan, pengingat pendonor eligible.
- **F3 — UI**: Dashboard (stok + hampir kedaluwarsa), Stok, Permintaan,
  Donor & Pengingat, Kegiatan.

## Kriteria Selesai

- [ ] Donasi menambah stok dengan kedaluwarsa sesuai komponen
- [ ] Pemenuhan memakai stok kedaluwarsa terdekat; stok kurang ditolak
- [ ] Stok kedaluwarsa tidak dihitung sebagai tersedia
- [ ] Pengingat menampilkan pendonor yang sudah boleh donor lagi
- [ ] `pip install -r requirements.txt && python app.py` langsung jalan

## Non-tujuan

- Uji lab/serologi, integrasi SIMRS, SMS gateway sungguhan.
