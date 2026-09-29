"use client";
import { useEffect, useState } from "react";

export default function Kegiatan() {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ nama: "", tanggal: "", lokasi: "", target_peserta: "0" });

  const muat = async () => setRows(await (await fetch("/api/kegiatan")).json());
  useEffect(() => { muat(); }, []);

  const buat = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/kegiatan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, target_peserta: Number(f.target_peserta) }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    setF({ nama: "", tanggal: "", lokasi: "", target_peserta: "0" });
    muat();
  };

  const hapus = async (id: number) => {
    if (!confirm("Hapus kegiatan ini?")) return;
    const r = await fetch(`/api/kegiatan/${id}`, { method: "DELETE" });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    muat();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Kegiatan Donor</h2>
      <form onSubmit={buat} className="card grid grid-cols-2 md:grid-cols-4 gap-3">
        <input className="input" placeholder="Nama kegiatan" value={f.nama}
          onChange={(e) => setF({ ...f, nama: e.target.value })} required />
        <input className="input" type="date" value={f.tanggal}
          onChange={(e) => setF({ ...f, tanggal: e.target.value })} required />
        <input className="input" placeholder="Lokasi" value={f.lokasi}
          onChange={(e) => setF({ ...f, lokasi: e.target.value })} required />
        <input className="input" type="number" min={0} placeholder="Target peserta" value={f.target_peserta}
          onChange={(e) => setF({ ...f, target_peserta: e.target.value })} />
        <button className="btn btn-red col-span-2 md:col-span-4">Tambah Kegiatan</button>
      </form>
      <table className="tbl">
        <thead><tr><th>Nama</th><th>Tanggal</th><th>Lokasi</th><th>Target</th><th>Aksi</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.nama}</td><td>{r.tanggal}</td><td>{r.lokasi}</td>
              <td>{r.target_peserta}</td>
              <td><button className="btn btn-gray" onClick={() => hapus(r.id)}>Hapus</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
