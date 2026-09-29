"use client";
import { useEffect, useState } from "react";

const GOL = ["A", "B", "AB", "O"];
const KOMP = ["WB", "PRC", "FFP", "Trombosit"];

export default function Permintaan() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [f, setF] = useState({ rumah_sakit: "", golongan: "O", rhesus: "+", komponen: "WB", jumlah: "1" });

  const muat = async () => {
    const q = filter ? `?status=${filter}` : "";
    const r = await fetch(`/api/permintaan${q}`);
    setRows(await r.json());
  };
  useEffect(() => { muat(); }, [filter]);

  const buat = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/permintaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, jumlah: Number(f.jumlah) }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    setF({ rumah_sakit: "", golongan: "O", rhesus: "+", komponen: "WB", jumlah: "1" });
    muat();
  };

  const aksi = async (id: number, op: "penuhi" | "tolak") => {
    let body: any = {};
    if (op === "tolak") {
      const catatan = prompt("Alasan penolakan:");
      if (!catatan) return;
      body = { catatan };
    }
    const r = await fetch(`/api/permintaan/${id}/${op}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    muat();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Permintaan Rumah Sakit</h2>
      <form onSubmit={buat} className="card grid grid-cols-2 md:grid-cols-3 gap-3">
        <input className="input" placeholder="Rumah sakit" value={f.rumah_sakit}
          onChange={(e) => setF({ ...f, rumah_sakit: e.target.value })} required />
        <select className="input" value={f.golongan} onChange={(e) => setF({ ...f, golongan: e.target.value })}>
          {GOL.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="input" value={f.rhesus} onChange={(e) => setF({ ...f, rhesus: e.target.value })}>
          <option value="+">+</option><option value="-">-</option>
        </select>
        <select className="input" value={f.komponen} onChange={(e) => setF({ ...f, komponen: e.target.value })}>
          {KOMP.map((k) => <option key={k}>{k}</option>)}
        </select>
        <input className="input" type="number" min={1} placeholder="Jumlah" value={f.jumlah}
          onChange={(e) => setF({ ...f, jumlah: e.target.value })} required />
        <button className="btn btn-red">Buat Permintaan</button>
      </form>
      <div className="flex gap-2 items-center">
        <span className="text-sm">Filter:</span>
        {["", "menunggu", "dipenuhi", "ditolak"].map((s) => (
          <button key={s} className={`btn ${filter === s ? "btn-red" : "btn-gray"}`}
            onClick={() => setFilter(s)}>{s || "semua"}</button>
        ))}
      </div>
      <table className="tbl">
        <thead>
          <tr><th>RS</th><th>Darah</th><th>Jumlah</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.rumah_sakit}</td>
              <td>{r.golongan}{r.rhesus} {r.komponen}</td>
              <td>{r.jumlah}</td>
              <td>{r.tanggal}</td>
              <td>
                <span className={r.status === "menunggu" ? "font-semibold text-yellow-700" : r.status === "dipenuhi" ? "text-green-700" : "text-red-600"}>
                  {r.status}
                </span>
                {r.status === "ditolak" && r.catatan && <div className="text-xs text-slate-500">{r.catatan}</div>}
              </td>
              <td className="flex gap-2">
                {r.status === "menunggu" && (
                  <>
                    <button className="btn btn-green" onClick={() => aksi(r.id, "penuhi")}>Penuhi</button>
                    <button className="btn btn-gray" onClick={() => aksi(r.id, "tolak")}>Tolak</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
