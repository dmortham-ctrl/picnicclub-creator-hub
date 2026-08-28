import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getProfile, getPublishedProfiles } from "@/lib/data";

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

  return (
    <main className="bio-page">
      <div className="bio-card">
        <div className="bio-brand">picnic club</div>
        {profile.avatar_url && (
          <img className="bio-avatar" src={profile.avatar_url} alt={profile.display_name} />
        )}
        <h1>{profile.display_name}</h1>
        <div className="bio-username">
          @{profile.username} · {profile.category}
        </div>
        {profile.bio && <p className="bio-copy">{profile.bio}</p>}
        {links.map((link) => (
          <a className="bio-link" href={link.url} key={link.id} target="_blank" rel="noreferrer nofollow">
            {link.label}
            <ExternalLink size={15} style={{ position: "absolute", right: 17 }} />
            {link.affiliate_disclosure && <small>affiliate</small>}
          </a>
        ))}
        <Link className="button-dark" href="/members" style={{ marginTop: 24, display: "inline-block" }}>
          Explore more creators ↗
        </Link>
        <div className="bio-footer">Part of the Picnic Club community ↗</div>
      </div>
    </main>
  );
}
