import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GOLONGAN = ["A", "B", "AB", "O"];
export const KOMPONEN = ["WB", "PRC", "FFP", "Trombosit"];
// masa simpan (hari) per komponen
export const MASA_SIMPAN: Record<string, number> = {
  WB: 35,
  PRC: 42,
  FFP: 365,
  Trombosit: 5,
};
export const JEDA_DONOR = 90; // hari

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function apiError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ error: "kesalahan server" }, { status: 500 });
}

const pad = (n: number) => String(n).padStart(2, "0");

export function hariIni(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function tambahHari(iso: string, hari: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + hari);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** selisih hari a - b (a, b format YYYY-MM-DD) */
export function selisihHari(a: string, b: string): number {
  const pa = a.split("-").map(Number);
  const pb = b.split("-").map(Number);
  const da = new Date(pa[0], pa[1] - 1, pa[2]);
  const db = new Date(pb[0], pb[1] - 1, pb[2]);
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

export async function stokTersedia(
  golongan: string,
  rhesus: string,
  komponen: string
): Promise<number> {
  const t = hariIni();
  const r = await prisma.stok.aggregate({
    _sum: { jumlah: true },
    where: {
      golongan,
      rhesus,
      komponen,
      tgl_kedaluwarsa: { gte: t },
      jumlah: { gt: 0 },
    },
  });
  return r._sum.jumlah ?? 0;
}
