import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  KOMPONEN,
  MASA_SIMPAN,
  JEDA_DONOR,
  ApiError,
  apiError,
  hariIni,
  tambahHari,
  selisihHari,
  stokTersedia,
} from "@/lib/darah";

export async function GET() {
  try {
    const rows = await prisma.donasi.findMany({
      include: { pendonor: { select: { nama: true } } },
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      take: 100,
    });
    return NextResponse.json(
      rows.map((d) => {
        const { pendonor, ...rest } = d;
        return { ...rest, nama_pendonor: pendonor.nama };
      })
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    for (const f of ["pendonor_id", "komponen", "jumlah"]) {
      if (!data || !data[f]) throw new ApiError(400, `field wajib: ${f}`);
    }
    if (!KOMPONEN.includes(data.komponen)) {
      throw new ApiError(400, `komponen harus: ${KOMPONEN.join(", ")}`);
    }
    const p = await prisma.pendonor.findUnique({
      where: { id: Number(data.pendonor_id) },
    });
    if (!p) throw new ApiError(404, "pendonor tidak ditemukan");
    const tgl = data.tanggal || hariIni();
    // cek jeda donor
    if (p.donor_terakhir) {
      const jeda = selisihHari(tgl, p.donor_terakhir);
      if (jeda < JEDA_DONOR) {
        throw new ApiError(
          409,
          `belum boleh donor lagi (terakhir ${p.donor_terakhir}, jeda ${JEDA_DONOR} hari)`
        );
      }
    }
    const jumlah = parseInt(data.jumlah, 10);
    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      throw new ApiError(400, "jumlah harus lebih dari 0");
    }
    const kedaluwarsa = tambahHari(tgl, MASA_SIMPAN[data.komponen]);
    const gol = data.golongan || p.golongan;
    const rh = data.rhesus || p.rhesus;
    await prisma.donasi.create({
      data: {
        pendonor_id: p.id,
        tanggal: tgl,
        golongan: gol,
        rhesus: rh,
        komponen: data.komponen,
        jumlah,
      },
    });
    await prisma.stok.create({
      data: {
        golongan: gol,
        rhesus: rh,
        komponen: data.komponen,
        jumlah,
        tgl_masuk: tgl,
        tgl_kedaluwarsa: kedaluwarsa,
      },
    });
    await prisma.pendonor.update({
      where: { id: p.id },
      data: { donor_terakhir: tgl },
    });
    return NextResponse.json(
      { tgl_kedaluwarsa: kedaluwarsa, stok_tersedia: await stokTersedia(gol, rh, data.komponen) },
      { status: 201 }
    );
  } catch (e) {
    return apiError(e);
  }
}
