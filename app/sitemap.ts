import type { MetadataRoute } from "next";
import { getPublishedProfiles } from "@/lib/data";

const BASE = "https://picnicclub.id";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await getPublishedProfiles();
  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/members`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/pelanggaran`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/affiliate-disclosure`, changeFrequency: "yearly", priority: 0.2 },
    ...profiles.map((profile) => ({
      url: `${BASE}/@${profile.username}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
