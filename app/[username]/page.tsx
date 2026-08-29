import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfile, getPublishedProfiles } from "@/lib/data";
import { TrackView } from "@/app/components/analytics";
import { MinisiteView } from "@/app/components/minisite-view";
import { JsonLd, SITE_URL } from "@/app/components/json-ld";

// Published minisites are largely static; refresh in the background hourly.
// Publish/unpublish also calls revalidatePath("/@<username>") for an instant update.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const profiles = await getPublishedProfiles();
  return profiles.map((profile) => ({ username: `@${profile.username}` }));
}

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfile(username);
  if (!data) {
    return { title: "Profile not found | Picnic Club", robots: { index: false, follow: false } };
  }
  const { profile } = data;
  const title = `${profile.display_name} (@${profile.username}) | Picnic Club`;
  const description = profile.bio || `${profile.display_name} di Picnic Club — ${profile.category}.`;
  const images = profile.avatar_url ? [{ url: profile.avatar_url }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/@${profile.username}` },
    openGraph: { title, description, type: "profile", url: `/@${profile.username}`, images },
    twitter: { card: "summary", title, description, images: profile.avatar_url ? [profile.avatar_url] : undefined },
  };
}

export default async function ProfilePage({ params }: Params) {
  const { username } = await params;
  const data = await getProfile(username);
  if (!data) notFound();
  const { profile, links } = data;

  const profileUrl = `${SITE_URL}/@${profile.username}`;
  const personLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateModified: new Date().toISOString(),
    mainEntity: {
      "@type": "Person",
      name: profile.display_name,
      alternateName: `@${profile.username}`,
      description: profile.bio || undefined,
      image: profile.avatar_url || undefined,
      url: profileUrl,
      memberOf: { "@type": "Organization", name: "Picnic Club", url: SITE_URL },
    },
  };

  return (
    <main>
      <JsonLd data={personLd} />
      <TrackView profileId={profile.id} />
      <MinisiteView profile={profile} links={links} interactive />
    </main>
  );
}
