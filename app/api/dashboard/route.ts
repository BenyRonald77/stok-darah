import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JEDA_DONOR, apiError, hariIni, tambahHari } from "@/lib/darah";

export async function GET() {
  try {
    const t = hariIni();
    const t7 = tambahHari(t, 7);
    const semua = await prisma.stok.findMany();
    // rekap per golongan/rhesus/komponen
    const agg = new Map<string, { golongan: string; rhesus: string; komponen: string; tersedia: number; kedaluwarsa: number }>();
    for (const s of semua) {
      const k = `${s.golongan}|${s.rhesus}|${s.komponen}`;
      let e = agg.get(k);
      if (!e) {
        e = { golongan: s.golongan, rhesus: s.rhesus, komponen: s.komponen, tersedia: 0, kedaluwarsa: 0 };
        agg.set(k, e);
      }
      if (s.tgl_kedaluwarsa >= t) e.tersedia += s.jumlah;
      else e.kedaluwarsa += s.jumlah;
    }
    const stok_per_jenis = Array.from(agg.values()).sort(
      (a, b) => a.golongan.localeCompare(b.golongan) || a.komponen.localeCompare(b.komponen)
    );
    const hampir_kedaluwarsa = await prisma.stok.findMany({
      where: {
        jumlah: { gt: 0 },
        tgl_kedaluwarsa: { gte: t, lte: t7 },
      },
      orderBy: { tgl_kedaluwarsa: "asc" },
    });
    const menunggu = await prisma.permintaan.count({ where: { status: "menunggu" } });
    const batas = tambahHari(t, -JEDA_DONOR);
    const boleh = await prisma.pendonor.count({
      where: { OR: [{ donor_terakhir: null }, { donor_terakhir: { lte: batas } }] },
    });
    return NextResponse.json({
      stok_per_jenis,
      hampir_kedaluwarsa,
      permintaan_menunggu: menunggu,
      pendonor_boleh_donor: boleh,
    });
  } catch (e) {
    return apiError(e);
  }
}
