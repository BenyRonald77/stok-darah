import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/darah";

export async function GET() {
  try {
    const rows = await prisma.kegiatan.findMany({ orderBy: { tanggal: "asc" } });
    return NextResponse.json(rows);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    for (const f of ["nama", "tanggal", "lokasi"]) {
      if (!data || !data[f]) throw new ApiError(400, `field wajib: ${f}`);
    }
    const created = await prisma.kegiatan.create({
      data: {
        nama: data.nama,
        tanggal: data.tanggal,
        lokasi: data.lokasi,
        target_peserta: parseInt(data.target_peserta ?? 0, 10) || 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
