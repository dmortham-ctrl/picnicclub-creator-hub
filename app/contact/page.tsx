import { LegalPage } from "../components/legal-layout";

export const metadata = {
  title: "Kontak | Picnic Club",
  description: "Badan hukum dan kontak resmi Picnic Club.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalPage title="Kontak" updated="September 2026">
      <p>
        Picnic Club dioperasikan oleh badan hukum berikut. Untuk pertanyaan bisnis, kerja sama
        brand, atau korespondensi resmi, silakan hubungi kami lewat kanal di bawah.
      </p>

      <h2>Badan hukum</h2>
      <address className="legal-address">
        <strong>PT Trijata Kini Nusantara</strong>
        <span>Jl. Casablanca Raya Kavling 88, Office 88 Lt. 9 Unit A</span>
        <span>Gedung 88 Kota Kasablanka, Kel. Menteng Dalam, Kec. Tebet</span>
        <span>Kota Jakarta Selatan, 12870, Indonesia</span>
      </address>

      <h2>Hubungi kami</h2>
      <ul>
        <li>
          Email: <a href="mailto:picnicclubcircle@gmail.com">picnicclubcircle@gmail.com</a>
        </li>
        <li>
          WhatsApp (kerja sama brand): <a href="https://wa.me/62895364547187">wa.me/62895364547187</a>
        </li>
        <li>
          TikTok:{" "}
          <a href="https://www.tiktok.com/@picnicclub.id" target="_blank" rel="noreferrer">
            @picnicclub.id
          </a>
        </li>
        <li>
          Instagram:{" "}
          <a href="https://www.instagram.com/picnicclub.id/" target="_blank" rel="noreferrer">
            @picnicclub.id
          </a>
        </li>
      </ul>
    </LegalPage>
  );
}
