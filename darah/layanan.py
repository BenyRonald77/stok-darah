"""Permintaan RS (pemenuhan FIFO) + pengingat pendonor + dashboard."""
from datetime import date, timedelta

from flask import Blueprint, jsonify, request

from darah.api import JEDA_DONOR, _dicts, hari_ini, stok_tersedia
from darah.db import get_conn

lay_bp = Blueprint("layanan", __name__, url_prefix="/api")


# ---------- permintaan ----------

@lay_bp.get("/permintaan")
def list_permintaan():
    conn = get_conn()
    try:
        status = request.args.get("status")
        q = "SELECT * FROM permintaan"
        vals = []
        if status:
            q += " WHERE status = ?"
            vals.append(status)
        return jsonify(_dicts(conn.execute(q + " ORDER BY tanggal DESC, id DESC", vals)))
    finally:
        conn.close()


@lay_bp.post("/permintaan")
def create_permintaan():
    data = request.get_json(force=True)
    for f in ("rumah_sakit", "golongan", "rhesus", "komponen", "jumlah"):
        if not data.get(f):
            return jsonify({"error": f"field wajib: {f}"}), 400
    conn = get_conn()
    try:
        cur = conn.execute(
            """INSERT INTO permintaan (rumah_sakit, golongan, rhesus, komponen,
                                       jumlah, tanggal, catatan)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data["rumah_sakit"], data["golongan"], data["rhesus"],
             data["komponen"], int(data["jumlah"]),
             data.get("tanggal") or hari_ini(), data.get("catatan", "")))
        conn.commit()
        return jsonify(dict(conn.execute(
            "SELECT * FROM permintaan WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
    finally:
        conn.close()


@lay_bp.post("/permintaan/<int:m_id>/penuhi")
def penuhi(m_id: int):
    """Penuhi permintaan: kurangi stok FIFO (kedaluwarsa terdekat dulu)."""
    conn = get_conn()
    try:
        m = conn.execute("SELECT * FROM permintaan WHERE id = ?",
                         (m_id,)).fetchone()
        if m is None:
            return jsonify({"error": "permintaan tidak ditemukan"}), 404
        if m["status"] != "menunggu":
            return jsonify({"error": f"sudah berstatus {m['status']}"}), 409
        tersedia = stok_tersedia(conn, m["golongan"], m["rhesus"], m["komponen"])
        if tersedia < m["jumlah"]:
            return jsonify({"error": f"stok tidak cukup (tersedia {tersedia}, "
                            f"diminta {m['jumlah']})"}), 409
        sisa = m["jumlah"]
        baris = conn.execute(
            """SELECT id, jumlah FROM stok
               WHERE golongan = ? AND rhesus = ? AND komponen = ?
               AND tgl_kedaluwarsa >= ? AND jumlah > 0
               ORDER BY tgl_kedaluwarsa""",
            (m["golongan"], m["rhesus"], m["komponen"], hari_ini())).fetchall()
        for b in baris:
            if sisa <= 0:
                break
            ambil = min(b["jumlah"], sisa)
            conn.execute("UPDATE stok SET jumlah = jumlah - ? WHERE id = ?",
                         (ambil, b["id"]))
            sisa -= ambil
        conn.execute("UPDATE permintaan SET status = 'dipenuhi' WHERE id = ?",
                     (m_id,))
        conn.commit()
        return jsonify({"ok": True, "dipenuhi": m["jumlah"]})
    finally:
        conn.close()


@lay_bp.post("/permintaan/<int:m_id>/tolak")
def tolak(m_id: int):
    data = request.get_json(force=True) or {}
    if not data.get("catatan"):
        return jsonify({"error": "alasan penolakan wajib diisi"}), 400
    conn = get_conn()
    try:
        m = conn.execute("SELECT * FROM permintaan WHERE id = ?",
                         (m_id,)).fetchone()
        if m is None:
            return jsonify({"error": "permintaan tidak ditemukan"}), 404
        if m["status"] != "menunggu":
            return jsonify({"error": f"sudah berstatus {m['status']}"}), 409
        conn.execute("UPDATE permintaan SET status = 'ditolak', catatan = ?"
                     " WHERE id = ?", (data["catatan"], m_id))
        conn.commit()
        return jsonify({"ok": True})
    finally:
        conn.close()


# ---------- pengingat ----------

@lay_bp.get("/pengingat")
def pengingat():
    """Pendonor yang sudah boleh donor lagi (>= 90 hari / belum pernah)."""
    batas = (date.today() - timedelta(days=JEDA_DONOR)).isoformat()
    conn = get_conn()
    try:
        rows = _dicts(conn.execute(
            """SELECT *, CASE WHEN donor_terakhir IS NULL THEN 1 ELSE 0 END AS belum_pernah
               FROM pendonor
               WHERE donor_terakhir IS NULL OR donor_terakhir <= ?
               ORDER BY belum_pernah DESC, donor_terakhir""", (batas,)))
        for r in rows:
            if r["donor_terakhir"]:
                r["boleh_sejak"] = (date.fromisoformat(r["donor_terakhir"])
                                    + timedelta(days=JEDA_DONOR)).isoformat()
            else:
                r["boleh_sejak"] = "kapan saja"
        return jsonify(rows)
    finally:
        conn.close()


# ---------- dashboard ----------

@lay_bp.get("/dashboard")
def dashboard():
    conn = get_conn()
    try:
        per = _dicts(conn.execute(
            """SELECT golongan, rhesus, komponen,
                      SUM(CASE WHEN tgl_kedaluwarsa >= ? THEN jumlah ELSE 0 END) AS tersedia,
                      SUM(CASE WHEN tgl_kedaluwarsa < ? THEN jumlah ELSE 0 END) AS kedaluwarsa
               FROM stok GROUP BY golongan, rhesus, komponen
               ORDER BY golongan, komponen""", (hari_ini(), hari_ini())))
        hampir = _dicts(conn.execute(
            """SELECT * FROM stok WHERE jumlah > 0
               AND tgl_kedaluwarsa BETWEEN ? AND ?""",
            (hari_ini(), (date.today() + timedelta(days=7)).isoformat())))
        menunggu = conn.execute(
            "SELECT COUNT(*) FROM permintaan WHERE status = 'menunggu'").fetchone()[0]
        boleh = conn.execute(
            """SELECT COUNT(*) FROM pendonor
               WHERE donor_terakhir IS NULL
               OR donor_terakhir <= ?""",
            ((date.today() - timedelta(days=JEDA_DONOR)).isoformat(),)).fetchone()[0]
        return jsonify({"stok_per_jenis": per,
                        "hampir_kedaluwarsa": hampir,
                        "permintaan_menunggu": menunggu,
                        "pendonor_boleh_donor": boleh})
    finally:
        conn.close()
