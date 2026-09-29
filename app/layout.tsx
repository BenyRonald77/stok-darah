import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Manajemen Stok Darah",
  description: "Stok kantong darah, permintaan RS, donor, dan kegiatan donor",
};
const links = [
  { href: "/", label: "Dashboard" },
  { href: "/stok", label: "Stok" },
  { href: "/permintaan", label: "Permintaan" },
  { href: "/donor", label: "Donor" },
  { href: "/kegiatan", label: "Kegiatan" },
];
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">
        <header className="bg-red-700 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="font-bold text-lg">🩸 Stok Darah</h1>
            <nav className="flex gap-4 text-sm">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="hover:underline">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
