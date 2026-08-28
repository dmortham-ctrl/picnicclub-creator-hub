import Link from "next/link";
import { SiteNav } from "./site-nav";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="legal-page">
      <SiteNav />
      <article className="legal">
        <div className="eyebrow">Picnic Club</div>
        <h1>{title}</h1>
        <p className="legal-meta">
          Terakhir diperbarui {updated} · <strong>Draf</strong> — teks ini masih perlu ditinjau tim
          dan penasihat hukum sebelum dianggap final.
        </p>
        {children}
        <hr />
        <p className="legal-contact">
          Pertanyaan soal halaman ini? Hubungi{" "}
          <a href="mailto:hello@picnicclub.id">hello@picnicclub.id</a> atau lihat{" "}
          <Link href="/report">halaman pelaporan</Link>.
        </p>
        <Link href="/" className="panel-back">← Kembali ke beranda</Link>
      </article>
    </main>
  );
}
