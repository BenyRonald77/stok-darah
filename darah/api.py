"""CRUD pendonor/kegiatan + donasi (tambah stok) + stok."""
from datetime import date, timedelta

from flask import Blueprint, jsonify, request

from darah.db import get_conn

api_bp = Blueprint("api", __name__, url_prefix="/api")

GOLONGAN = ["A", "B", "AB", "O"]
KOMPONEN = ["WB", "PRC", "FFP", "Trombosit"]
# masa simpan (hari) per komponen
MASA_SIMPAN = {"WB": 35, "PRC": 42, "FFP": 365, "Trombosit": 5}
JEDA_DONOR = 90  # hari


def _dicts(cur):
    return [dict(r) for r in cur.fetchall()]


def hari_ini() -> str:
    return date.today().isoformat()


def stok_tersedia(conn, golongan: str, rhesus: str, komponen: str) -> int:
    return conn.execute(
        """SELECT COALESCE(SUM(jumlah),0) FROM stok
           WHERE golongan = ? AND rhesus = ? AND komponen = ?
           AND tgl_kedaluwarsa >= ? AND jumlah > 0""",
        (golongan, rhesus, komponen, hari_ini())).fetchone()[0]


# ---------- pendonor ----------

@api_bp.get("/pendonor")
def list_pendonor():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute("SELECT * FROM pendonor ORDER BY nama")))
    finally:
        conn.close()


@api_bp.post("/pendonor")
def create_pendonor():
    data = request.get_json(force=True)
    if not data.get("nama") or data.get("golongan") not in GOLONGAN:
        return jsonify({"error": "nama dan golongan (A/B/AB/O) wajib"}), 400
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO pendonor (nama, golongan, rhesus, telepon, donor_terakhir)"
            " VALUES (?, ?, ?, ?, ?)",
            (data["nama"], data["golongan"], data.get("rhesus", "+"),
             data.get("telepon"), data.get("donor_terakhir")))
        conn.commit()
        return jsonify(dict(conn.execute(
            "SELECT * FROM pendonor WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
    finally:
        conn.close()


# ---------- kegiatan ----------

@api_bp.get("/kegiatan")
def list_kegiatan():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            "SELECT * FROM kegiatan ORDER BY tanggal")))
    finally:
        conn.close()


@api_bp.post("/kegiatan")
def create_kegiatan():
    data = request.get_json(force=True)
    for f in ("nama", "tanggal", "lokasi"):
        if not data.get(f):
            return jsonify({"error": f"field wajib: {f}"}), 400
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO kegiatan (nama, tanggal, lokasi, target_peserta)"
            " VALUES (?, ?, ?, ?)",
            (data["nama"], data["tanggal"], data["lokasi"],
             int(data.get("target_peserta", 0))))
        conn.commit()
        return jsonify(dict(conn.execute(
            "SELECT * FROM kegiatan WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
    finally:
        conn.close()


@api_bp.delete("/kegiatan/<int:k_id>")
def delete_kegiatan(k_id: int):
    conn = get_conn()
    try:
        cur = conn.execute("DELETE FROM kegiatan WHERE id = ?", (k_id,))
        conn.commit()
        return jsonify({"ok": True}) if cur.rowcount else (
            jsonify({"error": "tidak ditemukan"}), 404)
    finally:
        conn.close()


# ---------- donasi ----------

@api_bp.get("/donasi")
def list_donasi():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT d.*, p.nama AS nama_pendonor FROM donasi d
               JOIN pendonor p ON p.id = d.pendonor_id
               ORDER BY d.tanggal DESC, d.id DESC LIMIT 100""")))
    finally:
        conn.close()


@api_bp.post("/donasi")
def create_donasi():
    """Catat donasi: tambah baris stok (kedaluwarsa per komponen)
    + update donor_terakhir pendonor."""
    data = request.get_json(force=True)
    for f in ("pendonor_id", "komponen", "jumlah"):
        if not data.get(f):
            return jsonify({"error": f"field wajib: {f}"}), 400
    if data["komponen"] not in KOMPONEN:
        return jsonify({"error": f"komponen harus: {', '.join(KOMPONEN)}"}), 400
    conn = get_conn()
    try:
        p = conn.execute("SELECT * FROM pendonor WHERE id = ?",
                         (data["pendonor_id"],)).fetchone()
        if p is None:
            return jsonify({"error": "pendonor tidak ditemukan"}), 404
        tgl = data.get("tanggal") or hari_ini()
        # cek jeda donor
        if p["donor_terakhir"]:
            jeda = (date.fromisoformat(tgl)
                    - date.fromisoformat(p["donor_terakhir"])).days
            if jeda < JEDA_DONOR:
                return jsonify({"error": f"belum boleh donor lagi "
                                f"(terakhir {p['donor_terakhir']}, jeda {JEDA_DONOR} hari)"}), 409
        jumlah = int(data["jumlah"])
        kedaluwarsa = (date.fromisoformat(tgl)
                       + timedelta(days=MASA_SIMPAN[data["komponen"]])).isoformat()
        gol, rh = data.get("golongan") or p["golongan"], data.get("rhesus") or p["rhesus"]
        conn.execute(
            "INSERT INTO donasi (pendonor_id, tanggal, golongan, rhesus, komponen, jumlah)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (p["id"], tgl, gol, rh, data["komponen"], jumlah))
        conn.execute(
            "INSERT INTO stok (golongan, rhesus, komponen, jumlah, tgl_masuk, tgl_kedaluwarsa)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (gol, rh, data["komponen"], jumlah, tgl, kedaluwarsa))
        conn.execute("UPDATE pendonor SET donor_terakhir = ? WHERE id = ?",
                     (tgl, p["id"]))
        conn.commit()
        return jsonify({"tgl_kedaluwarsa": kedaluwarsa,
                        "stok_tersedia": stok_tersedia(conn, gol, rh, data["komponen"])}), 201
    finally:
        conn.close()


# ---------- stok ----------

@api_bp.get("/stok")
def list_stok():
    conn = get_conn()
    try:
        rows = _dicts(conn.execute(
            "SELECT * FROM stok ORDER BY tgl_kedaluwarsa"))
        for r in rows:
            r["kedaluwarsa"] = r["tgl_kedaluwarsa"] < hari_ini()
            sisa = (date.fromisoformat(r["tgl_kedaluwarsa"]) - date.today()).days
            r["sisa_hari"] = sisa
            r["hampir"] = 0 <= sisa <= 7
        return jsonify(rows)
    finally:
        conn.close()
