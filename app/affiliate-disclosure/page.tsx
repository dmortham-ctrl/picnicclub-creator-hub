import { LegalPage } from "../components/legal-layout";

export const metadata = {
  title: "Disclosure Afiliasi | Picnic Club",
  description: "Kebijakan pengungkapan tautan afiliasi dan berbayar di Picnic Club.",
  alternates: { canonical: "/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage title="Disclosure Afiliasi" updated="Agustus 2026">
      <p>
        Picnic Club adalah komunitas creator commerce. Sebagian tautan di halaman minisite creator
        adalah <strong>tautan afiliasi</strong>: bila Anda membuka tautan lalu melakukan pembelian,
        creator dan/atau Picnic Club dapat memperoleh komisi <strong>tanpa biaya tambahan</strong>{" "}
        untuk Anda.
      </p>

      <h2>Bagaimana kami menandainya</h2>
      <ul>
        <li>
          Tautan afiliasi atau berbayar diberi label <em>affiliate</em> pada halaman minisite.
        </li>
        <li>
          Bila sebuah minisite memuat setidaknya satu tautan afiliasi, catatan pengungkapan singkat
          ditampilkan di halaman tersebut.
        </li>
      </ul>

      <h2>Independensi rekomendasi</h2>
      <p>
        Komisi tidak mengubah harga yang Anda bayar. Creator diharapkan hanya merekomendasikan
        produk yang mereka yakini, namun keputusan pembelian sepenuhnya ada pada Anda.
      </p>

      <h2>Pertanyaan</h2>
      <p>
        Hubungi <a href="mailto:hello@picnicclub.id">hello@picnicclub.id</a> untuk pertanyaan
        mengenai kebijakan ini.
      </p>
    </LegalPage>
  );
}
