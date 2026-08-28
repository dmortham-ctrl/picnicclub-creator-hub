import Link from "next/link";
import { CreatorCard } from "./components/creator-card";
import { SiteNav } from "./components/site-nav";
import { getPublishedProfiles } from "@/lib/data";
import { getSiteContent } from "@/lib/content";
import { getActiveBrands } from "@/lib/brand-data";

const benefits = [
  ["01", "Training yang practical", "Strategi affiliate, content, dan live yang bisa langsung dipakai."],
  ["02", "Support yang nyata", "Mentor dan manager yang siap membantu creator tumbuh konsisten."],
  ["03", "Network yang terbuka", "Temukan kolaborasi, insight, dan energi baik dari creator lain."],
  ["04", "Peluang lebih besar", "Akses campaign, sample product, dan kesempatan bersama brand."],
];

const faqs = [
  ["Apa Itu Picnic Club?", "Picnic Club adalah MCN dan komunitas creator commerce yang dibangun oleh praktisi content creation dan affiliate marketing. Kami membantu creator dan affiliator bertumbuh melalui edukasi, mentoring, networking, akses campaign, dan kolaborasi dengan brand."],
  ["Penting Gak Ikut MCN/Agency?", "Bergabung dengan MCN membantu creator mendapatkan akses yang biasanya sulit didapatkan sendiri, seperti voucher dan promo platform, dukungan iklan, event matchmaking, pendampingan, bantuan pelanggaran akun, serta komunitas untuk belajar dan berkembang."],
  ["Benefit apa Join Picnic Club?", "Member mendapatkan training online rutin, Zoom materi dan tips, chat support dengan mentor, networking dan kopdar, reward dan trip, peluang support iklan, update hook dan ide konten, akses ruang konten, sample produk, serta support manager."],
  ["Apa Syarat Join Picnic Club?", "Syarat utama: memiliki akun TikTok dengan minimal 600 followers, GMV minimal Rp1.000.000, berusia minimal 18 tahun, berdomisili di Indonesia, aktif membuat konten atau live, bersedia belajar, konsisten, kreatif, dan mematuhi kebijakan platform."],
  ["Berapa Potongan Fee Picnic Club?", "Picnic Club berkomitmen memberikan potongan fee yang kompetitif. Detail sharing fee dan mekanismenya akan dijelaskan oleh admin sesuai platform dan program yang diikuti."],
  ["Gimana cara Join?", "Hubungi admin Picnic Club melalui WhatsApp, kemudian isi formulir pendaftaran TikTok atau Shopee. Tim kami akan memandu proses verifikasi, penautan akun, dan mekanisme sharing fee."],
];

export default async function Home() {
  const profiles = await getPublishedProfiles();
  const content = await getSiteContent();
  const brands = await getActiveBrands();
  const featured = profiles.filter((profile) => profile.level === "All Star").slice(0, 20);
  const founderUsernames = ["inproduk", "bertosb1m", "adli.hibatul", "aditsur88", "sobatkaryawan"];
  const founders = founderUsernames.map((username) => profiles.find((profile) => profile.username === username)).filter((profile): profile is typeof profiles[number] => Boolean(profile));
  const heroCreators = Array.from({ length: 20 }, (_, index) => ({ avatar: featured[index]?.avatar_url ?? `https://i.pravatar.cc/160?img=${index + 20}`, href: featured[index] ? `/@${featured[index].username}` : "/members" }));

  return <main className="site-shell">
    <SiteNav />
    <section className="hero">
      <div><div className="eyebrow">Creator commerce ecosystem / 001</div><h1>{content.hero_title}</h1><p className="hero-copy">{content.hero_description}</p><div className="hero-actions"><Link className="button-lime" href="https://forms.gle/yEmDWsFd1q5DHjjP8">Join as creator ↗</Link><Link className="button-outline" href="https://wa.me/62895364547187">Collaborate with us</Link></div></div>
      <div className="orbit">{heroCreators.map((creator, index) => <Link className={`avatar ${index < 12 ? "avatar-outer" : "avatar-inner"}`} href={creator.href} key={index} aria-label="View creator profile"><img src={creator.avatar} alt="" /></Link>)}<div className="orbit-center">Top Creator<br />Picnic</div></div>
    </section>
    <div className="band">{content.marquee_text}</div>

    <section id="community" className="section">
      <div className="section-head"><div><div className="eyebrow">The founders / 002</div><h2>The<br />Founders.</h2><p className="section-note founder-note">Lima praktisi yang membangun Picnic Club dari pengalaman nyata sebagai creator dan affiliator.</p></div></div>
      <div className="creator-grid founder-grid">{founders.map((profile) => <CreatorCard key={profile.id} profile={profile} />)}</div>
    </section>

    <section className="stats-section"><div className="section stats-inner"><div><div className="eyebrow">A growing movement / 003</div><h2>Small team.<br />Big energy.</h2></div><div className="stats-grid"><div><strong>2K<span>+</span></strong><small>Creators</small></div><div><strong>100<span>+</span></strong><small>Brand collaborations</small></div><div><strong>100K<span>+</span></strong><small>Videos / month</small></div><div><strong>100M<span>+</span></strong><small>Views / month</small></div></div></div></section>

    <section className="brands-section"><div className="section brands-heading"><div className="eyebrow">The good company / 004</div><h2>{content.brands_title}</h2><p className="section-note">Partner dengan brand yang percaya pada creator-led commerce.</p></div><div className="brand-marquee" aria-label="Partner brands"><div className="brand-track">{[...brands, ...brands].map((brand, index) => <div className="brand-logo" key={`${brand.name}-${index}`}><img src={brand.logo_url} alt={brand.name} /></div>)}</div></div></section>

    <section id="about" className="section lime-section"><div className="eyebrow">Why Picnic Club / 005</div><h2>{content.about_title}</h2><p className="hero-copy lime-copy">Dari training, mentoring, networking, sampai peluang kolaborasi dengan brand. Picnic Club hadir untuk membantu creator tumbuh dengan support yang nyata.</p><div className="benefit-grid">{benefits.map(([number, title, text]) => <div className="benefit" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>

    <section id="brands" className="section split-section"><div><div className="eyebrow">For brands / 006</div><h2>Make your<br />next move.</h2></div><div><p className="hero-copy">Berkolaborasi dengan komunitas creator affiliate yang terus berkembang untuk meningkatkan visibilitas, konversi, dan penjualan brand Anda.</p><Link className="button-dark" href="https://wa.me/62895364547187">Talk to our team ↗</Link></div></section>

    <section id="faq" className="section faq-section"><div className="section-head"><div><div className="eyebrow">Good to know / 007</div><h2>Questions,<br />answered.</h2></div><p className="section-note">{content.faq_intro}</p></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="final-cta"><div className="eyebrow">Your next chapter / 008</div><h2>Ready to grow<br /><i>together?</i></h2><div className="hero-actions"><Link className="button-lime" href="https://forms.gle/yEmDWsFd1q5DHjjP8">Join as creator ↗</Link><Link className="button-outline light-outline" href="https://wa.me/62895364547187">Work with us</Link></div></section>
    <footer className="footer"><div className="footer-top"><div className="footer-intro"><div className="brand"><span className="brand-mark" style={{ background: "var(--lime)", color: "var(--ink)" }}>P</span> picnic club</div><p>Indonesia&apos;s home for creators, affiliators, and brands that want to grow together.</p><div className="footer-socials"><Link href="https://www.tiktok.com/@picnicclub.id">TikTok ↗</Link><Link href="https://www.instagram.com/picnicclub.id/">Instagram ↗</Link></div></div><div className="footer-column"><span className="footer-label">Explore</span><Link href="/#about">About us</Link><Link href="/members">Creators</Link><Link href="/#faq">FAQ</Link></div><div className="footer-column"><span className="footer-label">For creators</span><Link href="https://forms.gle/yEmDWsFd1q5DHjjP8">Join Picnic Club ↗</Link><Link href="/admin?mode=login">Login</Link><Link href="/admin?mode=signup">Sign up</Link></div><div className="footer-column"><span className="footer-label">For brands</span><Link href="https://wa.me/62895364547187">Collaborate ↗</Link><Link href="mailto:hello@picnicclub.id">hello@picnicclub.id</Link><Link href="https://wa.me/62895364547187">WhatsApp ↗</Link></div></div><div className="footer-bottom"><span>© 2026 Picnic Club. All rights reserved.</span><div><Link href="#">Privacy policy</Link><Link href="#">Terms of use</Link><Link href="#">Report an issue</Link></div></div></footer>
  </main>;
}
