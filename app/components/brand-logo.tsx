import Image from "next/image";
import Link from "next/link";

/** The Picnic Club wordmark (same asset + white monochrome treatment as the
 *  public site nav and footer). Always rendered on a dark surface. */
export function BrandLogo({ href = "/" }: { href?: string | null }) {
  const img = (
    <Image
      src="/picnic-logo.png"
      alt="Picnic Club"
      width={96}
      height={40}
      className="brand-logo"
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
