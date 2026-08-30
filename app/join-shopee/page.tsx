import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { JoinForm } from "../join/join-form";

export const metadata = {
  title: "Join Agency Shopee | Picnic Club",
  description:
    "Daftar jadi creator agency Shopee Picnic Club. Isi formulir pendaftaran, lalu konfirmasi ke admin lewat WhatsApp.",
  alternates: { canonical: "/join-shopee" },
};

const FORM_SRC =
  "https://docs.google.com/forms/d/e/1FAIpQLSff-E4zOONwC5OUtJmIV9sj0QQASOlgi0UmSNFt5FJVC8NRBA/viewform";

export default function JoinShopeePage() {
  return (
    <main className="legal-page">
      <SiteNav />
      <article className="legal">
        <div className="eyebrow">Picnic Club</div>
        <h1>Join Agency Shopee</h1>
        <p className="hero-copy">
          Isi formulir di bawah untuk gabung agency Shopee Picnic Club. Setelah selesai, kamu akan
          diminta konfirmasi ke admin lewat WhatsApp supaya pendaftaran cepat diproses.
        </p>

        <JoinForm
          formSrc={FORM_SRC}
          adminWa="6289606687080"
          formTitle="Formulir Join Agency Shopee"
          waMessage={
            "Halo admin Picnic Club, saya baru saja mengisi formulir Join Agency Shopee.\nMohon dikonfirmasi ya. Terima kasih."
          }
        />

        <hr />
        <p className="legal-contact">
          Ada pertanyaan sebelum mendaftar? Hubungi{" "}
          <a href="mailto:picnicclubcircle@gmail.com">picnicclubcircle@gmail.com</a> atau lihat{" "}
          <Link href="/members">daftar creator</Link>.
        </p>
        <Link href="/" className="panel-back">← Kembali ke beranda</Link>
      </article>
    </main>
  );
}
