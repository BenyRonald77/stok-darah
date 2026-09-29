"use client";
import { useEffect, useState } from "react";

const GOL = ["A", "B", "AB", "O"];
const KOMP = ["WB", "PRC", "FFP", "Trombosit"];

export default function Donor() {
  const [pendonor, setPendor] = useState<any[]>([]);
  const [donasi, setDonasi] = useState<any[]>([]);
  const [ingat, setIngat] = useState<any[]>([]);
  const [p, setP] = useState({ nama: "", golongan: "O", rhesus: "+", telepon: "" });
  const [d, setD] = useState({ pendonor_id: "", komponen: "WB", jumlah: "1", tanggal: "" });

  const muat = async () => {
    setPendor(await (await fetch("/api/pendonor")).json());
    setDonasi(await (await fetch("/api/donasi")).json());
    setIngat(await (await fetch("/api/pengingat")).json());
  };
  useEffect(() => { muat(); }, []);

  const tambahPendonor = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/pendonor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    setP({ nama: "", golongan: "O", rhesus: "+", telepon: "" });
    muat();
  };

  const catatDonasi = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/donasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pendonor_id: Number(d.pendonor_id),
        komponen: d.komponen,
        jumlah: Number(d.jumlah),
        tanggal: d.tanggal || undefined,
      }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    alert(`Donasi tercatat. Kedaluwarsa: ${j.tgl_kedaluwarsa}`);
    setD({ pendonor_id: "", komponen: "WB", jumlah: "1", tanggal: "" });
    muat();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Donor &amp; Pendonor</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Tambah Pendonor</h3>
          <form onSubmit={tambahPendonor} className="card space-y-2">
            <input className="input" placeholder="Nama" value={p.nama}
              onChange={(e) => setP({ ...p, nama: e.target.value })} required />
            <div className="grid grid-cols-2 gap-2">
              <select className="input" value={p.golongan} onChange={(e) => setP({ ...p, golongan: e.target.value })}>
                {GOL.map((g) => <option key={g}>{g}</option>)}
              </select>
              <select className="input" value={p.rhesus} onChange={(e) => setP({ ...p, rhesus: e.target.value })}>
                <option value="+">+</option><option value="-">-</option>
              </select>
            </div>
            <input className="input" placeholder="Telepon" value={p.telepon}
              onChange={(e) => setP({ ...p, telepon: e.target.value })} />
            <button className="btn btn-red">Simpan</button>
          </form>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Catat Donasi</h3>
          <form onSubmit={catatDonasi} className="card space-y-2">
            <select className="input" value={d.pendonor_id}
              onChange={(e) => setD({ ...d, pendonor_id: e.target.value })} required>
              <option value="">-- pilih pendonor --</option>
              {pendonor.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nama} ({x.golongan}{x.rhesus})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <select className="input" value={d.komponen} onChange={(e) => setD({ ...d, komponen: e.target.value })}>
                {KOMP.map((k) => <option key={k}>{k}</option>)}
              </select>
              <input className="input" type="number" min={1} value={d.jumlah}
                onChange={(e) => setD({ ...d, jumlah: e.target.value })} required />
              <input className="input" type="date" value={d.tanggal}
                onChange={(e) => setD({ ...d, tanggal: e.target.value })} />
            </div>
            <button className="btn btn-red">Catat</button>
          </form>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">🔔 Pengingat — Sudah Boleh Donor Lagi</h3>
        <table className="tbl">
          <thead><tr><th>Nama</th><th>Golongan</th><th>Telepon</th><th>Terakhir Donor</th><th>Boleh Sejak</th></tr></thead>
          <tbody>
            {ingat.length === 0 && <tr><td colSpan={5}>Tidak ada.</td></tr>}
            {ingat.map((x) => (
              <tr key={x.id}>
                <td>{x.nama}</td>
                <td>{x.golongan}{x.rhesus}</td>
                <td>{x.telepon || "-"}</td>
                <td>{x.donor_terakhir || <i>belum pernah</i>}</td>
                <td className="text-green-700 font-semibold">{x.boleh_sejak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Pendonor Terdaftar</h3>
        <table className="tbl">
          <thead><tr><th>Nama</th><th>Golongan</th><th>Telepon</th><th>Donor Terakhir</th></tr></thead>
          <tbody>
            {pendonor.map((x) => (
              <tr key={x.id}>
                <td>{x.nama}</td><td>{x.golongan}{x.rhesus}</td>
                <td>{x.telepon || "-"}</td><td>{x.donor_terakhir || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Riwayat Donasi</h3>
        <table className="tbl">
          <thead><tr><th>Tanggal</th><th>Pendonor</th><th>Darah</th><th>Jumlah</th></tr></thead>
          <tbody>
            {donasi.map((x) => (
              <tr key={x.id}>
                <td>{x.tanggal}</td><td>{x.nama_pendonor}</td>
                <td>{x.golongan}{x.rhesus} {x.komponen}</td><td>{x.jumlah}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
