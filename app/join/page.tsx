import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { JoinForm } from "./join-form";

export const metadata = {
  title: "Join Agency TikTok | Picnic Club",
  description:
    "Daftar jadi creator agency TikTok Picnic Club. Isi formulir pendaftaran, lalu konfirmasi ke admin lewat WhatsApp.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <main className="legal-page">
      <SiteNav />
      <article className="legal">
        <div className="eyebrow">Picnic Club</div>
        <h1>Join Agency TikTok</h1>
        <p className="hero-copy">
          Isi formulir di bawah untuk gabung agency TikTok Picnic Club. Setelah kirim, kamu akan
          diminta konfirmasi ke admin lewat WhatsApp supaya pendaftaran cepat diproses.
        </p>

        <JoinForm
          program="tiktok"
          adminWa="6287888527772"
          socialLabel="Username TikTok"
          waMessage={
            "Halo admin Picnic Club, saya baru saja mengisi formulir Join Agency TikTok.\nMohon dikonfirmasi ya. Terima kasih."
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
