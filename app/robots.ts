import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/superadmin", "/userpanel", "/api/", "/l/"],
    },
    sitemap: "https://picnicclub.id/sitemap.xml",
    host: "https://picnicclub.id",
  };
}
