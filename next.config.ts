import type { NextConfig } from "next";
import { wordpressRedirects } from "./lib/redirects";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : undefined;

// After the DNS cutover, picnicclub.id/wp-content/** hits this app instead of
// WordPress and would 404. Until the media is moved into Supabase Storage,
// set LEGACY_MEDIA_ORIGIN (e.g. the old host's URL or a preserved subdomain)
// to keep hot-linked images resolving. Unset in local dev.
const legacyMediaOrigin = process.env.LEGACY_MEDIA_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async redirects() {
    return wordpressRedirects;
  },
  async rewrites() {
    return legacyMediaOrigin
      ? [{ source: "/wp-content/:path*", destination: `${legacyMediaOrigin}/wp-content/:path*` }]
      : [];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picnicclub.id" },
      { protocol: "https", hostname: "i.pravatar.cc" }, // demo avatars
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
};

export default nextConfig;
