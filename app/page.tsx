import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreatorCard } from "./components/creator-card";
import { SiteNav } from "./components/site-nav";
import { TrackedLink, TrackView } from "./components/analytics";
import { getPublishedProfiles } from "@/lib/data";
import { getFaqs, getSiteContent } from "@/lib/content";
import { getActiveBrands } from "@/lib/brand-data";
import { JsonLd, organizationLd } from "./components/json-ld";
import { TiktokIcon, ShopeeIcon } from "./components/brand-icons";

export const revalidate = 3600;

export const metadata = {
  title: "Picnic Club — More Than an Agency",
  description:
    "Rumah bagi para creator dan affiliator terbaik Indonesia. Komunitas creator commerce: training, mentoring, networking, dan kolaborasi brand.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Picnic Club — More Than an Agency",
    description: "Rumah bagi para creator dan affiliator terbaik Indonesia.",
    url: "/",
    type: "website",
  },
};

const benefits = [
  ["01", "Training yang practical", "Strategi affiliate, content, dan live yang bisa langsung dipakai."],
  ["02", "Support yang nyata", "Mentor dan manager yang siap membantu creator tumbuh konsisten."],
  ["03", "Network yang terbuka", "Temukan kolaborasi, insight, dan energi baik dari creator lain."],
  ["04", "Peluang lebih besar", "Akses campaign, sample product, dan kesempatan bersama brand."],
];

export default async function Home() {
  const profiles = await getPublishedProfiles();
  const content = await getSiteContent();
  const brands = await getActiveBrands();
  const faqs = await getFaqs();
  const founderUsernames = content.founder_usernames.split(",").map((name) => name.trim()).filter(Boolean);
  const founders = founderUsernames.map((username) => profiles.find((profile) => profile.username === username)).filter((profile): profile is typeof profiles[number] => Boolean(profile));

  // Hero orbit — "All Star" creators, ordered by featured_order. Ring split and the
  // angle of every avatar are derived from the count, so it stays even at any size.
  // Avatars are served as 128px Supabase Storage transforms (not /_next/image —
  // Vercel's optimizer quota is exhausted and 402s any uncached transform).
  const orbitThumb = (url: string) =>
    url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    (url.includes("/storage/v1/object/public/") ? "?width=128&height=128&resize=cover&quality=70" : "");
  const heroCreators = profiles
    .filter((profile) => profile.level === "All Star" && profile.avatar_url)
    .slice(0, 30)
    .map((profile) => ({ avatar: orbitThumb(profile.avatar_url), href: `/@${profile.username}` }));
  const outerCount = Math.ceil(heroCreators.length * 0.6);

  return <main className="site-shell">
    <JsonLd data={organizationLd} />
    <TrackView />
    <SiteNav />
    <section className="hero">
      <div><div className="eyebrow">Creator commerce ecosystem / 001</div><h1>{content.hero_title}</h1><p className="hero-copy">{content.hero_description}</p><div className="hero-actions"><TrackedLink ctaKey="join_tiktok" className="button-lime" href="/join"><TiktokIcon />Join Agency Tiktok</TrackedLink><TrackedLink ctaKey="join_shopee" className="button-outline" href="/join-shopee"><ShopeeIcon />Join Agency Shopee</TrackedLink></div></div>
      <div className="orbit">{heroCreators.map((creator, index) => {
        const isOuter = index < outerCount;
        const ringSize = isOuter ? outerCount : heroCreators.length - outerCount;
        const ringIndex = isOuter ? index : index - outerCount;
        const angle = (360 / ringSize) * ringIndex + (isOuter ? 0 : 180 / ringSize);
        return <Link className={`avatar ${isOuter ? "avatar-outer" : "avatar-inner"}`} style={{ "--angle": `${angle}deg` } as CSSProperties} href={creator.href} key={index} aria-label="View creator profile"><Image src={creator.avatar} alt="" width={58} height={58} loading="eager" unoptimized /></Link>;
      })}<div className="orbit-center">Top Creator<br />Picnic</div></div>
    </section>
    <div className="band">{content.marquee_text}</div>

    <section id="community" className="section">
      <div className="section-head"><div><div className="eyebrow">The founders / 002</div><h2>The<br />Founders.</h2><p className="section-note founder-note">Lima praktisi yang membangun Picnic Club dari pengalaman nyata sebagai creator dan affiliator.</p></div></div>
      <div className="creator-grid founder-grid">{founders.map((profile) => <CreatorCard key={profile.id} profile={profile} />)}</div>
    </section>

    <section className="stats-section"><div className="section stats-inner"><div><div className="eyebrow">A growing movement / 003</div><h2>Small team.<br />Big energy.</h2></div><div className="stats-grid"><div><strong>2K<span>+</span></strong><small>Creators</small></div><div><strong>100<span>+</span></strong><small>Brand collaborations</small></div><div><strong>100K<span>+</span></strong><small>Videos / month</small></div><div><strong>100M<span>+</span></strong><small>Views / month</small></div></div></div></section>

    <section className="brands-section"><div className="section brands-heading"><div className="eyebrow">The good company / 004</div><h2>{content.brands_title}</h2><p className="section-note">Partner dengan brand yang percaya pada creator-led commerce.</p></div><div className="brand-marquee" aria-label="Partner brands"><div className="brand-track">{[...brands, ...brands].map((brand, index) => <div className="brand-logo" key={`${brand.name}-${index}`}><Image src={brand.logo_url} alt={brand.name} width={78} height={78} /></div>)}</div></div></section>

    <section id="about" className="section lime-section"><div className="eyebrow">Why Picnic Club / 005</div><h2>{content.about_title}</h2><p className="hero-copy lime-copy">Dari training, mentoring, networking, sampai peluang kolaborasi dengan brand. Picnic Club hadir untuk membantu creator tumbuh dengan support yang nyata.</p><div className="benefit-grid">{benefits.map(([number, title, text]) => <div className="benefit" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>

    <section id="brands" className="section split-section"><div><div className="eyebrow">For brands / 006</div><h2>Make your<br />next move.</h2></div><div><p className="hero-copy">Berkolaborasi dengan komunitas creator affiliate yang terus berkembang untuk meningkatkan visibilitas, konversi, dan penjualan brand Anda.</p><TrackedLink ctaKey="brand_contact" className="button-dark" href="https://wa.me/62895364547187">Talk to our team ↗</TrackedLink></div></section>

    <section id="faq" className="section faq-section"><div className="section-head"><div><div className="eyebrow">Good to know / 007</div><h2>Questions,<br />answered.</h2></div><p className="section-note">{content.faq_intro}</p></div><div className="faq-list">{faqs.map(({ question, answer }) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="final-cta"><div className="eyebrow">Your next chapter / 008</div><h2>Ready to grow<br /><i>together?</i></h2><div className="hero-actions"><TrackedLink ctaKey="join_tiktok" className="button-lime" href="/join"><TiktokIcon />Join Agency Tiktok</TrackedLink><TrackedLink ctaKey="join_shopee" className="button-outline light-outline" href="/join-shopee"><ShopeeIcon />Join Agency Shopee</TrackedLink></div></section>
    <footer className="footer"><div className="footer-top"><div className="footer-intro"><div className="brand"><span className="brand-mark" style={{ background: "var(--lime)", color: "var(--ink)" }}>P</span> picnic club</div><p>Indonesia&apos;s home for creators, affiliators, and brands that want to grow together.</p><div className="footer-socials"><Link href="https://www.tiktok.com/@picnicclub.id">TikTok ↗</Link><Link href="https://www.instagram.com/picnicclub.id/">Instagram ↗</Link></div></div><div className="footer-column"><span className="footer-label">Explore</span><Link href="/#about">About us</Link><Link href="/members">Creators</Link><Link href="/#faq">FAQ</Link></div><div className="footer-column"><span className="footer-label">For creators</span><Link href="/join">Join Picnic Club ↗</Link><Link href="/admin?mode=login">Login</Link><Link href="/admin?mode=signup">Sign up</Link></div><div className="footer-column"><span className="footer-label">For brands</span><Link href="https://wa.me/62895364547187">Collaborate ↗</Link><Link href="mailto:picnicclubcircle@gmail.com">picnicclubcircle@gmail.com</Link><Link href="https://wa.me/62895364547187">WhatsApp ↗</Link></div></div><div className="footer-bottom"><span>© 2026 Picnic Club. All rights reserved.</span><div><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms of use</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link><Link href="/report">Report an issue</Link></div></div></footer>
  </main>;
}
