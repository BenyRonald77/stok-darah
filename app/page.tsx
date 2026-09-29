"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setD);
  }, []);
  if (!d) return <p>Memuat...</p>;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <h4 className="text-sm text-slate-500">Permintaan menunggu</h4>
          <p className="text-2xl font-bold">{d.permintaan_menunggu}</p>
        </div>
        <div className="card">
          <h4 className="text-sm text-slate-500">Pendonor boleh donor</h4>
          <p className="text-2xl font-bold">{d.pendonor_boleh_donor}</p>
        </div>
        <div className="card">
          <h4 className="text-sm text-slate-500">Jenis stok</h4>
          <p className="text-2xl font-bold">{d.stok_per_jenis.length}</p>
        </div>
        <div className="card">
          <h4 className="text-sm text-slate-500">Hampir kedaluwarsa</h4>
          <p className="text-2xl font-bold">{d.hampir_kedaluwarsa.length}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Stok per Golongan &amp; Komponen</h3>
        <table className="tbl">
          <thead>
            <tr><th>Golongan</th><th>Komponen</th><th>Tersedia</th><th>Kedaluwarsa</th></tr>
          </thead>
          <tbody>
            {d.stok_per_jenis.map((x: any, i: number) => (
              <tr key={i}>
                <td>{x.golongan}{x.rhesus}</td>
                <td>{x.komponen}</td>
                <td><b>{x.tersedia}</b></td>
                <td className={x.kedaluwarsa ? "warn" : ""}>{x.kedaluwarsa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Hampir Kedaluwarsa (≤ 7 hari)</h3>
        <table className="tbl">
          <thead>
            <tr><th>Golongan</th><th>Komponen</th><th>Jumlah</th><th>Kedaluwarsa</th></tr>
          </thead>
          <tbody>
            {d.hampir_kedaluwarsa.length === 0 && (
              <tr><td colSpan={4}>Tidak ada.</td></tr>
            )}
            {d.hampir_kedaluwarsa.map((x: any) => (
              <tr key={x.id}>
                <td>{x.golongan}{x.rhesus}</td>
                <td>{x.komponen}</td>
                <td>{x.jumlah}</td>
                <td className="warn">{x.tgl_kedaluwarsa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
