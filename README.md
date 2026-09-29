# Manajemen Stok Darah

Stok kantong darah per golongan dan komponen dengan tanggal kedaluwarsa,
permintaan darah dari rumah sakit (pemenuhan FIFO), jadwal kegiatan donor,
dan pengingat pendonor yang sudah boleh donor lagi.

## Cara Menjalankan

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Buka http://localhost:3000.

## Halaman

- `/` — Dashboard: ringkasan stok per golongan & komponen, stok hampir kedaluwarsa (≤ 7 hari), permintaan menunggu, pendonor boleh donor.
- `/stok` — Daftar baris stok dengan status kedaluwarsa / hampir / OK.
- `/permintaan` — Buat permintaan RS, filter status, penuhi (FIFO) atau tolak dengan catatan.
- `/donor` — Kelola pendonor, catat donasi (menambah stok + update donor terakhir), pengingat donor eligible, riwayat donasi.
- `/kegiatan` — Kelola jadwal kegiatan donor.

## API

- `GET/POST /api/pendonor`
- `GET/POST /api/kegiatan`, `DELETE /api/kegiatan/[id]`
- `GET/POST /api/donasi` — donasi menambah stok dengan kedaluwarsa per komponen (WB 35 / PRC 42 / FFP 365 / Trombosit 5 hari); jeda donor 90 hari ditegakkan (409).
- `GET /api/stok` — tiap baris diberi flag `kedaluwarsa`, `sisa_hari`, `hampir`.
- `GET/POST /api/permintaan`, `POST /api/permintaan/[id]/penuhi` (FIFO, 409 bila stok kurang), `POST /api/permintaan/[id]/tolak` (wajib catatan).
- `GET /api/pengingat` — pendonor yang sudah boleh donor lagi (≥ 90 hari / belum pernah).
- `GET /api/dashboard` — rekap stok, hampir kedaluwarsa, permintaan menunggu, jumlah donor eligible.

## Aturan Bisnis

1. Stok tersedia = jumlah pada baris stok yang belum kedaluwarsa (tgl_kedaluwarsa ≥ hari ini).
2. Pemenuhan permintaan memakai FIFO: baris dengan kedaluwarsa terdekat dikurangi dulu; stok kurang → `409`.
3. Donasi menambah stok dengan masa simpan per komponen; donor ulang ditolak (`409`) bila < 90 hari dari donor terakhir.
4. Stok kedaluwarsa tidak dihitung sebagai tersedia.
