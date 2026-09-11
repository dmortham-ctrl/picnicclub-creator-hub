import Link from "next/link";

/** Shared site footer — used on the homepage and standalone marketing pages. */
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-intro">
          <div className="brand">
            <span className="brand-mark" style={{ background: "var(--lime)", color: "var(--ink)" }}>P</span> picnic club
          </div>
          <p>Indonesia&apos;s home for creators, affiliators, and brands that want to grow together.</p>
          <Link href="/contact" className="footer-entity">PT Trijata Kini Nusantara</Link>
          <div className="footer-socials">
            <Link href="https://www.tiktok.com/@picnicclub.id">TikTok ↗</Link>
            <Link href="https://www.instagram.com/picnicclub.id/">Instagram ↗</Link>
          </div>
        </div>
        <div className="footer-column">
          <span className="footer-label">Explore</span>
          <Link href="/about">About us</Link>
          <Link href="/members">Creators</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer-column">
          <span className="footer-label">For creators</span>
          <Link href="/join">Join Picnic Club ↗</Link>
          <Link href="/admin?mode=login">Login</Link>
          <Link href="/admin?mode=signup">Sign up</Link>
        </div>
        <div className="footer-column">
          <span className="footer-label">For brands</span>
          <Link href="https://wa.me/62895364547187">Collaborate ↗</Link>
          <Link href="mailto:picnicclubcircle@gmail.com">picnicclubcircle@gmail.com</Link>
          <Link href="https://wa.me/62895364547187">WhatsApp ↗</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Picnic Club. All rights reserved.</span>
        <div>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of use</Link>
          <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
          <Link href="/report">Report an issue</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
