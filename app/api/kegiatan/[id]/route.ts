import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/darah";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const n = await prisma.kegiatan.deleteMany({ where: { id } });
    if (n.count === 0) throw new ApiError(404, "tidak ditemukan");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
