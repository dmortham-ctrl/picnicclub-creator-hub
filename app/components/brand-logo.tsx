import Image from "next/image";
import Link from "next/link";

/** Picnic Club logo, identical treatment to the public site nav (.site-logo):
 *  next/image optimisation + white monochrome filter, on a dark surface. */
export function BrandLogo({ href = "/" }: { href?: string | null }) {
  const img = (
    <Image
      src="/picnic-logo.png"
      alt="Picnic Club"
      width={92}
      height={42}
      className="site-logo"
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
