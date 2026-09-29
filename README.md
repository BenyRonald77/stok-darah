# Manajemen Stok Darah

Stok kantong per golongan & komponen + kedaluwarsa, permintaan RS,
jadwal donor, pengingat pendonor.

## Cara Menjalankan

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Buka http://localhost:5007. Database dibuat otomatis dan di-seed saat
pertama dijalankan.

## Struktur

```
├── PRD.md
├── requirements.txt
├── app.py
├── darah/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── seed.sql
│   ├── api.py       # pendonor, stok, donasi, kegiatan
│   └── layanan.py   # permintaan (FIFO), pengingat, dashboard
├── static/
└── templates/
```
