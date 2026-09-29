"use client";
import { useEffect, useState } from "react";

export default function Stok() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/stok").then((r) => r.json()).then(setRows);
  }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Stok Kantong Darah</h2>
      <table className="tbl">
        <thead>
          <tr>
            <th>Golongan</th><th>Komponen</th><th>Jumlah</th>
            <th>Masuk</th><th>Kedaluwarsa</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.kedaluwarsa ? "bg-red-50" : r.hampir ? "bg-yellow-50" : ""}>
              <td>{r.golongan}{r.rhesus}</td>
              <td>{r.komponen}</td>
              <td><b>{r.jumlah}</b></td>
              <td>{r.tgl_masuk}</td>
              <td>{r.tgl_kedaluwarsa}</td>
              <td>
                {r.kedaluwarsa ? (
                  <span className="warn">Kedaluwarsa</span>
                ) : r.hampir ? (
                  <span className="text-yellow-700 font-semibold">≤ 7 hari ({r.sisa_hari} hari)</span>
                ) : (
                  <span className="text-green-700">OK ({r.sisa_hari} hari)</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
