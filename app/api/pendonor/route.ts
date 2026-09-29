import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GOLONGAN, ApiError, apiError } from "@/lib/darah";

export async function GET() {
  try {
    const rows = await prisma.pendonor.findMany({ orderBy: { nama: "asc" } });
    return NextResponse.json(rows);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    if (!data || !data.nama || !GOLONGAN.includes(data.golongan)) {
      throw new ApiError(400, "nama dan golongan (A/B/AB/O) wajib");
    }
    const created = await prisma.pendonor.create({
      data: {
        nama: data.nama,
        golongan: data.golongan,
        rhesus: data.rhesus ?? "+",
        telepon: data.telepon ?? null,
        donor_terakhir: data.donor_terakhir ?? null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
