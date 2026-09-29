import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const n = await prisma.pendonor.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }
  // sama dengan seed.sql versi Python
  await prisma.pendonor.createMany({
    data: [
      { nama: "Hendra Wijaya", golongan: "O", rhesus: "+", telepon: "081111111111", donor_terakhir: "2026-05-01" },
      { nama: "Maria Ulfa", golongan: "A", rhesus: "+", telepon: "082222222222", donor_terakhir: "2026-08-15" },
      { nama: "Rudi Hartono", golongan: "B", rhesus: "-", telepon: "083333333333", donor_terakhir: null },
      { nama: "Sinta Dewi", golongan: "AB", rhesus: "+", telepon: "084444444444", donor_terakhir: "2026-01-10" },
    ],
  });
  // stok awal: sebagian kedaluwarsa dekat, satu sudah lewat
  await prisma.stok.createMany({
    data: [
      { golongan: "O", rhesus: "+", komponen: "WB", jumlah: 10, tgl_masuk: "2026-09-01", tgl_kedaluwarsa: "2026-10-06" },
      { golongan: "O", rhesus: "+", komponen: "WB", jumlah: 8, tgl_masuk: "2026-09-20", tgl_kedaluwarsa: "2026-10-25" },
      { golongan: "A", rhesus: "+", komponen: "PRC", jumlah: 12, tgl_masuk: "2026-09-10", tgl_kedaluwarsa: "2026-10-22" },
      { golongan: "B", rhesus: "-", komponen: "WB", jumlah: 5, tgl_masuk: "2026-08-01", tgl_kedaluwarsa: "2026-09-05" },
      { golongan: "AB", rhesus: "+", komponen: "FFP", jumlah: 6, tgl_masuk: "2026-06-01", tgl_kedaluwarsa: "2027-06-01" },
    ],
  });
  await prisma.kegiatan.createMany({
    data: [
      { nama: "Donor Darah Massal Balai Desa", tanggal: "2026-10-05", lokasi: "Balai Desa Sukamaju", target_peserta: 100 },
      { nama: "Donor Darah Kampus UNJ", tanggal: "2026-10-12", lokasi: "Aula Kampus UNJ", target_peserta: 75 },
    ],
  });
  console.log("seed selesai");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
