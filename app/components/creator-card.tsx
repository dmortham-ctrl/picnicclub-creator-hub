import Image from "next/image";
import Link from "next/link";
import { Profile } from "@/lib/types";

export function CreatorCard({ profile }: { profile: Profile }) {
  return <Link href={`/@${profile.username}`} className="creator-card">{profile.avatar_url ? <Image className="creator-photo" src={profile.avatar_url} alt={profile.display_name} width={360} height={360} sizes="(max-width: 760px) 50vw, 300px" /> : <span className="creator-photo creator-photo-empty" aria-hidden="true" />}<div className="creator-meta"><strong>{profile.display_name}</strong><span>@{profile.username} · {profile.category}</span></div></Link>;
}
