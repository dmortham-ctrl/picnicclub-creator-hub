import { LegalPage } from "../components/legal-layout";

export const metadata = {
  title: "Kebijakan Privasi | Picnic Club",
  description: "Bagaimana Picnic Club mengumpulkan dan menggunakan data di picnicclub.id.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="Agustus 2026">
      <p>
        Kebijakan ini menjelaskan data yang kami kumpulkan saat Anda mengunjungi{" "}
        <strong>picnicclub.id</strong> dan halaman minisite creator kami, serta bagaimana data itu
        digunakan.
      </p>

      <h2>Data yang kami kumpulkan</h2>
      <ul>
        <li>
          <strong>Data akun creator.</strong> Saat creator membuat akun, kami menyimpan email,
          nama tampilan, username, bio, kategori, foto profil, dan tautan yang dimasukkan sendiri
          oleh creator.
        </li>
        <li>
          <strong>Data penggunaan agregat.</strong> Kami mencatat peristiwa seperti kunjungan
          halaman, kunjungan profil, klik tautan, dan klik tombol ajakan (CTA). Peristiwa ini tidak
          menyimpan nama, alamat IP, cookie pelacak lintas situs, atau query string tautan affiliate
          mentah.
        </li>
        <li>
          <strong>Data teknis dasar.</strong> Penyedia hosting kami dapat mencatat log permintaan
          standar (waktu, jenis permintaan, kode status) untuk keamanan dan keandalan.
        </li>
      </ul>

      <h2>Penggunaan data</h2>
      <ul>
        <li>Menampilkan dan mengoperasikan minisite creator serta direktori anggota.</li>
        <li>Memahami performa halaman secara agregat (jumlah kunjungan, klik, CTR).</li>
        <li>Menjaga keamanan layanan dan mencegah penyalahgunaan.</li>
      </ul>
      <p>Kami tidak menjual data pribadi Anda.</p>

      <h2>Penyimpanan &amp; pihak ketiga</h2>
      <p>
        Data disimpan pada penyedia infrastruktur kami (basis data dan penyimpanan berbasis cloud).
        Tautan keluar menuju layanan pihak ketiga (TikTok, Instagram, Shopee, WhatsApp, Google
        Forms, dan lainnya) tunduk pada kebijakan privasi masing-masing.
      </p>

      <h2>Hak Anda</h2>
      <p>
        Creator dapat meminta koreksi atau penghapusan profil dan datanya dengan menghubungi{" "}
        <a href="mailto:picnicclubcircle@gmail.com">picnicclubcircle@gmail.com</a>. Kebijakan retensi dan
        penghapusan detail akan ditetapkan sebelum peluncuran resmi.
      </p>

      <h2>Perubahan</h2>
      <p>
        Kebijakan ini dapat diperbarui. Perubahan penting akan ditandai dengan tanggal
        &ldquo;terakhir diperbarui&rdquo; di atas.
      </p>
    </LegalPage>
  );
}
