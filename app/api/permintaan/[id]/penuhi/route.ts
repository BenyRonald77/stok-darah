import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, hariIni, stokTersedia } from "@/lib/darah";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const m = await prisma.permintaan.findUnique({ where: { id } });
    if (!m) throw new ApiError(404, "permintaan tidak ditemukan");
    if (m.status !== "menunggu") throw new ApiError(409, `sudah berstatus ${m.status}`);
    const tersedia = await stokTersedia(m.golongan, m.rhesus, m.komponen);
    if (tersedia < m.jumlah) {
      throw new ApiError(
        409,
        `stok tidak cukup (tersedia ${tersedia}, diminta ${m.jumlah})`
      );
    }
    // FIFO: kurangi dari baris kedaluwarsa terdekat dulu
    let sisa = m.jumlah;
    const baris = await prisma.stok.findMany({
      where: {
        golongan: m.golongan,
        rhesus: m.rhesus,
        komponen: m.komponen,
        tgl_kedaluwarsa: { gte: hariIni() },
        jumlah: { gt: 0 },
      },
      orderBy: { tgl_kedaluwarsa: "asc" },
    });
    for (const b of baris) {
      if (sisa <= 0) break;
      const ambil = Math.min(b.jumlah, sisa);
      await prisma.stok.update({
        where: { id: b.id },
        data: { jumlah: b.jumlah - ambil },
      });
      sisa -= ambil;
    }
    await prisma.permintaan.update({
      where: { id },
      data: { status: "dipenuhi" },
    });
    return NextResponse.json({ ok: true, dipenuhi: m.jumlah });
  } catch (e) {
    return apiError(e);
  }
}
