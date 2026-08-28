import Link from "next/link";

export function SiteNav() {
  return <nav className="nav"><Link href="/" className="brand"><span className="brand-mark">P</span> picnic club</Link><div className="nav-links"><Link href="/#about">About us</Link><Link href="/members">Creators</Link><Link href="/#brands">For brands</Link></div><Link href="https://wa.me/62895364547187" className="nav-cta">Let&apos;s talk ↗</Link></nav>;
}
