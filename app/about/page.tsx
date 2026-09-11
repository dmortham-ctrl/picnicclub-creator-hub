import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { TrackedLink, TrackView } from "../components/analytics";
import { TiktokIcon, ShopeeIcon } from "../components/brand-icons";
import { JsonLd, organizationLd } from "../components/json-ld";

export const metadata = {
  title: "About Us | Picnic Club",
  description:
    "Picnic Club adalah ekosistem creator commerce Indonesia — rumah bagi training, mentoring, networking, dan kolaborasi brand. Dioperasikan oleh PT Trijata Kini Nusantara.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Picnic Club",
    description: "Rumah yang tumbuh bersama creator dan affiliator terbaik Indonesia.",
    url: "/about",
    type: "website",
  },
};

const pillars = [
  ["01", "Training yang practical", "Strategi affiliate, content, dan live yang bisa langsung dipakai, bukan sekadar teori."],
  ["02", "Support yang nyata", "Mentor dan manager yang hadir setiap kali creator butuh arah, bukan cuma saat campaign berjalan."],
  ["03", "Network yang terbuka", "Ruang untuk berbagi insight, kolaborasi, dan energi baik antar sesama creator."],
  ["04", "Peluang yang lebih besar", "Akses campaign, sample product, dan kesempatan tumbuh bersama brand ternama."],
];

export default function AboutPage() {
  return (
    <main className="site-shell">
      <JsonLd data={organizationLd} />
      <TrackView />
      <SiteNav />

      <section className="section about-intro">
        <div className="eyebrow">About Picnic Club / 001</div>
        <h1>Rumah yang tumbuh bersama creator-nya.</h1>
        <p className="hero-copy about-lede">
          Picnic Club adalah ekosistem creator commerce Indonesia — tempat training, mentoring,
          networking, dan kolaborasi brand bertemu dalam satu rumah. Kami percaya, creator tumbuh
          lebih jauh ketika mereka tidak berjalan sendirian.
        </p>
      </section>

      <section className="section about-story">
        <div className="section-head">
          <div>
            <div className="eyebrow">How it started / 002</div>
            <h2>Dari pengalaman langsung,<br />menjadi satu komunitas.</h2>
          </div>
          <p className="section-note">
            Lima praktisi yang membangun Picnic Club dari pengalaman nyata sebagai creator dan
            affiliator.
          </p>
        </div>
        <div className="about-story-body">
          <p>
            Picnic Club tidak dimulai dari ruang rapat. Kami dimulai dari pengalaman langsung
            sebagai creator dan affiliator — mengejar target, beradaptasi dengan algoritma yang
            terus berubah, dan mencari tahu caranya sendiri karena belum ada tempat yang benar-benar
            mengerti prosesnya.
          </p>
          <p>
            Dari situ, lima praktisi memutuskan membangun apa yang dulu mereka sendiri butuhkan:
            sebuah agency yang paham proses tumbuh dari nol — bukan cuma yang mengejar angka.
          </p>
          <p>
            Hari ini, Picnic Club menaungi ribuan creator dan affiliator di seluruh Indonesia,
            bekerja sama dengan puluhan brand, dan terus bertumbuh — bukan sekadar sebagai agency,
            tapi sebagai komunitas creator commerce yang saling mendukung.
          </p>
        </div>
      </section>

      <section className="section lime-section">
        <div className="eyebrow">What we stand for / 003</div>
        <h2>Lebih dari<br />sekadar agency.</h2>
        <p className="hero-copy lime-copy">
          Empat hal yang membuat Picnic Club terasa berbeda — dan akan terus kami jaga seiring
          bertumbuh.
        </p>
        <div className="benefit-grid">
          {pillars.map(([number, title, text]) => (
            <div className="benefit" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="section stats-inner">
          <div>
            <div className="eyebrow">By the numbers / 004</div>
            <h2>Angka yang<br />terus bertumbuh.</h2>
          </div>
          <div className="stats-grid">
            <div><strong>2K<span>+</span></strong><small>Creators</small></div>
            <div><strong>100<span>+</span></strong><small>Brand collaborations</small></div>
            <div><strong>100K<span>+</span></strong><small>Videos / month</small></div>
            <div><strong>100M<span>+</span></strong><small>Views / month</small></div>
          </div>
        </div>
      </section>

      <section className="section split-section about-legal">
        <div>
          <div className="eyebrow">Legal entity / 005</div>
          <h2>Badan hukum<br />kami.</h2>
        </div>
        <div>
          <p className="hero-copy">
            Picnic Club dioperasikan oleh <strong>PT Trijata Kini Nusantara</strong>, perusahaan
            yang berbadan hukum dan berkantor di Jakarta Selatan. Seluruh kerja sama resmi,
            kontrak, dan korespondensi bisnis Picnic Club dilakukan atas nama entitas ini.
          </p>
          <Link href="/contact" className="button-dark">Lihat alamat &amp; kontak resmi ↗</Link>
        </div>
      </section>

      <section className="final-cta">
        <div className="eyebrow">Your next chapter / 006</div>
        <h2>Siap tumbuh<br /><i>bersama kami?</i></h2>
        <div className="hero-actions">
          <TrackedLink ctaKey="about_join_tiktok" className="button-lime" href="/join">
            <TiktokIcon />Join Agency Tiktok
          </TrackedLink>
          <TrackedLink ctaKey="about_join_shopee" className="button-outline light-outline" href="/join-shopee">
            <ShopeeIcon />Join Agency Shopee
          </TrackedLink>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
