import Link from "next/link";
import { LegalPage } from "../components/legal-layout";

export const metadata = {
  title: "Syarat Penggunaan | Picnic Club",
  description: "Syarat penggunaan situs dan minisite creator Picnic Club.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Syarat Penggunaan" updated="Agustus 2026">
      <p>
        Dengan mengakses <strong>picnicclub.id</strong> dan layanan terkait, Anda menyetujui syarat
        berikut.
      </p>

      <h2>Tentang layanan</h2>
      <p>
        Picnic Club menyediakan halaman profil publik (minisite link-in-bio) dan direktori untuk
        anggota komunitas yang telah disetujui. Pendaftaran anggota melalui proses verifikasi di luar
        aplikasi.
      </p>

      <h2>Konten creator</h2>
      <ul>
        <li>Creator bertanggung jawab atas akurasi profil, tautan, dan klaim yang ditampilkan.</li>
        <li>
          Dilarang memuat konten yang melanggar hukum, menyesatkan, melanggar hak kekayaan
          intelektual, atau melanggar kebijakan platform pihak ketiga.
        </li>
        <li>
          Tautan afiliasi atau berbayar wajib ditandai sesuai{" "}
          <Link href="/affiliate-disclosure">kebijakan disclosure</Link> kami.
        </li>
        <li>
          Picnic Club dapat menyembunyikan, menangguhkan, atau menghapus profil yang melanggar
          syarat ini, dengan atau tanpa pemberitahuan.
        </li>
      </ul>

      <h2>Akun</h2>
      <p>
        Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda dan seluruh aktivitas di
        bawahnya.
      </p>

      <h2>Tautan pihak ketiga</h2>
      <p>
        Situs ini memuat tautan ke layanan pihak ketiga yang tidak kami kendalikan. Kami tidak
        bertanggung jawab atas konten atau kebijakan layanan tersebut.
      </p>

      <h2>Tanpa jaminan</h2>
      <p>
        Layanan disediakan &ldquo;sebagaimana adanya&rdquo;. Sejauh diizinkan hukum, Picnic Club
        tidak memberikan jaminan tersurat maupun tersirat atas ketersediaan atau kesesuaian layanan
        untuk tujuan tertentu.
      </p>

      <h2>Perubahan</h2>
      <p>Syarat ini dapat diperbarui sewaktu-waktu. Versi terbaru berlaku sejak dipublikasikan.</p>
    </LegalPage>
  );
}
