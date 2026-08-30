import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { JoinForm } from "./join-form";

export const metadata = {
  title: "Join as Creator | Picnic Club",
  description:
    "Daftar jadi creator Picnic Club. Isi formulir pendaftaran, lalu konfirmasi ke admin lewat WhatsApp.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <main className="legal-page">
      <SiteNav />
      <article className="legal">
        <div className="eyebrow">Picnic Club</div>
        <h1>Join as Creator</h1>
        <p className="hero-copy">
          Isi formulir di bawah untuk mendaftar jadi creator Picnic Club. Setelah selesai, kamu akan
          diminta konfirmasi ke admin lewat WhatsApp supaya pendaftaran cepat diproses.
        </p>

        <JoinForm />

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
