import Link from "next/link";
import { Profile } from "@/lib/types";

export function CreatorCard({ profile }: { profile: Profile }) {
  return <Link href={`/@${profile.username}`} className="creator-card"><img className="creator-photo" src={profile.avatar_url} alt={profile.display_name} /><div className="creator-meta"><strong>{profile.display_name}</strong><span>@{profile.username} · {profile.category}</span></div></Link>;
}
