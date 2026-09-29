import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, hariIni, selisihHari } from "@/lib/darah";

export async function GET() {
  try {
    const t = hariIni();
    const rows = await prisma.stok.findMany({ orderBy: { tgl_kedaluwarsa: "asc" } });
    return NextResponse.json(
      rows.map((r) => {
        const sisa = selisihHari(r.tgl_kedaluwarsa, t);
        return {
          ...r,
          kedaluwarsa: r.tgl_kedaluwarsa < t,
          sisa_hari: sisa,
          hampir: sisa >= 0 && sisa <= 7,
        };
      })
    );
  } catch (e) {
    return apiError(e);
  }
}
