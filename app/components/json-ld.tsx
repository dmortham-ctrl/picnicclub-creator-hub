export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const SITE_URL = "https://picnicclub.id";

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Picnic Club",
  url: SITE_URL,
  description: "MCN dan komunitas creator commerce untuk creator dan affiliator Indonesia.",
  sameAs: [
    "https://www.tiktok.com/@picnicclub.id",
    "https://www.instagram.com/picnicclub.id/",
  ],
};
