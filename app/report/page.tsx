import { LegalPage } from "../components/legal-layout";

export const metadata = {
  title: "Laporkan Masalah | Picnic Club",
  description: "Cara melaporkan konten, tautan, atau profil yang bermasalah di Picnic Club.",
  alternates: { canonical: "/report" },
};

export default function ReportPage() {
  return (
    <LegalPage title="Laporkan Masalah" updated="Agustus 2026">
      <p>
        Menemukan profil, tautan, atau konten yang melanggar, menyesatkan, atau berbahaya di Picnic
        Club? Beri tahu kami.
      </p>

      <h2>Yang bisa dilaporkan</h2>
      <ul>
        <li>Tautan berbahaya, penipuan, atau mengarah ke malware.</li>
        <li>Konten yang melanggar hukum atau hak kekayaan intelektual.</li>
        <li>Profil yang menyamar sebagai orang atau merek lain.</li>
        <li>Klaim yang menyesatkan atau tautan afiliasi yang tidak diungkapkan.</li>
      </ul>

      <h2>Cara melapor</h2>
      <p>
        Kirim email ke <a href="mailto:hello@picnicclub.id">hello@picnicclub.id</a> dengan subjek
        &ldquo;Laporan&rdquo;, sertakan:
      </p>
      <ul>
        <li>URL profil atau tautan yang dimaksud (mis. <code>picnicclub.id/@username</code>).</li>
        <li>Penjelasan singkat masalahnya.</li>
        <li>Tangkapan layar bila ada.</li>
      </ul>
      <p>
        Kami meninjau laporan sesegera mungkin dan dapat menyembunyikan atau menangguhkan konten
        selama peninjauan.
      </p>

      <h2>Mendesak</h2>
      <p>
        Untuk hal yang membahayakan keselamatan, hubungi juga admin Picnic Club melalui{" "}
        <a href="https://wa.me/62895364547187">WhatsApp</a>.
      </p>
    </LegalPage>
  );
}
