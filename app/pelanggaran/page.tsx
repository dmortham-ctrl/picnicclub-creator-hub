import Link from "next/link";
import { LegalPage } from "../components/legal-layout";
import { PelanggaranGuide } from "../components/pelanggaran-guide";

export const metadata = {
  title: "Kena Pelanggaran TikTok? | Picnic Club",
  description:
    "Panduan langkah demi langkah menghadapi pelanggaran akun TikTok dan mengajukan banding lewat Picnic Club.",
  alternates: { canonical: "/pelanggaran" },
};

export default function PelanggaranPage() {
  return (
    <LegalPage title="Kena Pelanggaran? Gak Usah Panik" updated="Agustus 2026">
      <p>Ikuti langkah di bawah ini.</p>

      <PelanggaranGuide />

      <p>
        Butuh bantuan lain? Lihat <Link href="/report">halaman pelaporan</Link> atau hubungi admin
        via <a href="https://wa.me/62895364547187">WhatsApp</a>.
      </p>
    </LegalPage>
  );
}
