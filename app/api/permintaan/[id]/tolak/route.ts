import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/darah";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = (await req.json().catch(() => null)) || {};
    if (!data.catatan) throw new ApiError(400, "alasan penolakan wajib diisi");
    const id = Number(params.id);
    const m = await prisma.permintaan.findUnique({ where: { id } });
    if (!m) throw new ApiError(404, "permintaan tidak ditemukan");
    if (m.status !== "menunggu") throw new ApiError(409, `sudah berstatus ${m.status}`);
    await prisma.permintaan.update({
      where: { id },
      data: { status: "ditolak", catatan: data.catatan },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
