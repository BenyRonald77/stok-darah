import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JEDA_DONOR, apiError, hariIni, tambahHari } from "@/lib/darah";

export async function GET() {
  try {
    const batas = tambahHari(hariIni(), -JEDA_DONOR);
    const rows = await prisma.pendonor.findMany({
      where: { OR: [{ donor_terakhir: null }, { donor_terakhir: { lte: batas } }] },
      orderBy: [{ donor_terakhir: "asc" }],
    });
    // urut: belum pernah dulu, lalu donor_terakhir paling lama
    rows.sort((a, b) => {
      const an = a.donor_terakhir === null ? 0 : 1;
      const bn = b.donor_terakhir === null ? 0 : 1;
      if (an !== bn) return an - bn;
      return (a.donor_terakhir ?? "").localeCompare(b.donor_terakhir ?? "");
    });
    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        belum_pernah: r.donor_terakhir === null ? 1 : 0,
        boleh_sejak: r.donor_terakhir
          ? tambahHari(r.donor_terakhir, JEDA_DONOR)
          : "kapan saja",
      }))
    );
  } catch (e) {
    return apiError(e);
  }
}
