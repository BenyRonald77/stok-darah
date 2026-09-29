import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, hariIni } from "@/lib/darah";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const rows = await prisma.permintaan.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
    });
    return NextResponse.json(rows);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    for (const f of ["rumah_sakit", "golongan", "rhesus", "komponen", "jumlah"]) {
      if (!data || !data[f]) throw new ApiError(400, `field wajib: ${f}`);
    }
    const jumlah = parseInt(data.jumlah, 10);
    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      throw new ApiError(400, "jumlah harus lebih dari 0");
    }
    const created = await prisma.permintaan.create({
      data: {
        rumah_sakit: data.rumah_sakit,
        golongan: data.golongan,
        rhesus: data.rhesus,
        komponen: data.komponen,
        jumlah,
        tanggal: data.tanggal || hariIni(),
        catatan: data.catatan ?? "",
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
