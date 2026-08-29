import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, getPublishedProfiles } from "@/lib/data";
import { TrackView } from "@/app/components/analytics";
import { LinkIcon } from "@/app/components/link-icon";
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

  const hasAffiliate = links.some((link) => link.affiliate_disclosure);
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
    <main className="bio-page">
      <JsonLd data={personLd} />
      <TrackView profileId={profile.id} />
      <div className="bio-card">
        <div className="bio-brand">picnic club</div>
        {profile.avatar_url && (
          <Image
            className="bio-avatar"
            src={profile.avatar_url}
            alt={profile.display_name}
            width={104}
            height={104}
            priority
          />
        )}
        <h1>{profile.display_name}</h1>
        <div className="bio-username">
          @{profile.username} · {profile.category}
        </div>
        {profile.bio && <p className="bio-copy">{profile.bio}</p>}
        {links.map((link) => (
          <a
            className="bio-link"
            href={`/l/${link.id}`}
            key={link.id}
            target="_blank"
            rel="noreferrer nofollow"
          >
            <LinkIcon linkType={link.link_type} />
            <span className="bio-link-label">{link.label}</span>
            {link.affiliate_disclosure && <small>affiliate</small>}
          </a>
        ))}
        {hasAffiliate && (
          <p className="bio-disclosure">
            Sebagian tautan di atas adalah tautan affiliasi. Picnic Club dapat memperoleh komisi
            tanpa biaya tambahan untuk Anda.{" "}
            <Link href="/affiliate-disclosure">Selengkapnya</Link>
          </p>
        )}
        <Link className="button-dark" href="/members" style={{ marginTop: 24, display: "inline-block" }}>
          Explore more creators ↗
        </Link>
        <div className="bio-footer">Part of the Picnic Club community ↗</div>
      </div>
    </main>
  );
}
