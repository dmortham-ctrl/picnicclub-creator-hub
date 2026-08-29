import Image from "next/image";
import Link from "next/link";

/**
 * The Picnic Club wordmark, rendered as a single-colour treatment of
 * /picnic-logo.png (same asset as the site nav).
 *   theme="dark"  -> ink logo, for light backgrounds (admin / dashboard)
 *   theme="light" -> white logo, for dark backgrounds (CMS sidebar)
 */
export function BrandLogo({
  href = "/",
  theme = "dark",
}: {
  href?: string | null;
  theme?: "dark" | "light";
}) {
  const img = (
    <Image
      src="/picnic-logo.png"
      alt="Picnic Club"
      width={96}
      height={40}
      className={`brand-logo brand-logo--${theme}`}
      priority
    />
  );
  return href ? (
    <Link href={href} className="brand-link" aria-label="Picnic Club">
      {img}
    </Link>
  ) : (
    <span className="brand-link">{img}</span>
  );
}
