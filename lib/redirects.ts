type Redirect = { source: string; destination: string; statusCode: 301 };

const gone = (source: string, destination: string): Redirect => ({
  source,
  destination,
  statusCode: 301,
});

// 301 map for the WordPress -> Next.js migration of picnicclub.id.
// The old site was tiny: the homepage, /pelanggaran (kept, rebuilt as a
// page), and WordPress default junk. Everything else here bounces stale
// indexed URLs somewhere sensible. /wp-content/** is deliberately NOT
// matched here - media is handled by a rewrite (see next.config.ts).
export const wordpressRedirects: Redirect[] = [
  // WordPress default content
  gone("/sample-page", "/"),
  gone("/hello-world", "/"),
  gone("/2026/06/11/hello-world", "/"),

  // Date archives, taxonomy and author archives
  gone("/2025/:path*", "/"),
  gone("/2026/:path*", "/"),
  gone("/category/:path*", "/members"),
  gone("/tag/:path*", "/members"),
  gone("/author/:path*", "/members"),

  // Feeds
  gone("/feed", "/"),
  gone("/feed/:path*", "/"),
  gone("/comments/feed", "/"),

  // Old sitemaps -> the Next.js one
  gone("/sitemaps.xml", "/sitemap.xml"),
  gone("/sitemap_index.xml", "/sitemap.xml"),
  gone("/:name(wp-sitemap.*\\.xml)", "/sitemap.xml"),
  gone("/:name((?:post|page|category)-sitemap\\d*\\.xml)", "/sitemap.xml"),

  // WordPress admin surface -> the new admin
  gone("/wp-login.php", "/admin"),
  gone("/wp-admin", "/admin"),
  gone("/wp-admin/:path*", "/admin"),
];
