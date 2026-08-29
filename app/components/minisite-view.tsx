import Image from "next/image";
import Link from "next/link";
import { LinkIcon } from "@/app/components/link-icon";

export type MinisiteProfile = {
  username: string;
  display_name: string;
  category: string;
  bio: string;
  avatar_url: string;
  theme?: string | null;
};

export type MinisiteLink = {
  id: string;
  label: string;
  url: string;
  link_type: string;
  affiliate_disclosure: boolean;
  image_url?: string | null;
  is_active?: boolean;
};

/**
 * The published minisite card. Rendered live on /@username (interactive) and as
 * a read-only preview inside the creator dashboard.
 */
export function MinisiteView({
  profile,
  links,
  interactive = false,
}: {
  profile: MinisiteProfile;
  links: MinisiteLink[];
  interactive?: boolean;
}) {
  const visible = links.filter((link) => link.is_active !== false);
  const hasAffiliate = visible.some((link) => link.affiliate_disclosure);

  return (
    <div className="bio-page" data-theme={profile.theme || "default"}>
      <div className="bio-card">
        <div className="bio-brand">picnic club</div>
        {profile.avatar_url && (
          <Image
            className="bio-avatar"
            src={profile.avatar_url}
            alt={profile.display_name}
            width={104}
            height={104}
            priority={interactive}
          />
        )}
        <h1>{profile.display_name || "Nama kamu"}</h1>
        <div className="bio-username">
          @{profile.username} · {profile.category || "Kategori"}
        </div>
        {profile.bio && <p className="bio-copy">{profile.bio}</p>}

        {visible.map((link) => {
          const body = (
            <>
              {link.image_url ? (
                <Image className="bio-link-thumb" src={link.image_url} alt="" width={48} height={48} />
              ) : (
                <LinkIcon linkType={link.link_type} />
              )}
              <span className="bio-link-label">{link.label}</span>
              {link.affiliate_disclosure && <small>affiliate</small>}
            </>
          );
          return interactive ? (
            <a
              className="bio-link"
              href={`/l/${link.id}`}
              key={link.id}
              target="_blank"
              rel="noreferrer nofollow"
            >
              {body}
            </a>
          ) : (
            <div className="bio-link" key={link.id}>
              {body}
            </div>
          );
        })}

        {hasAffiliate && (
          <p className="bio-disclosure">
            Sebagian tautan di atas adalah tautan affiliasi. Picnic Club dapat memperoleh komisi
            tanpa biaya tambahan untuk Anda.{" "}
            {interactive ? <Link href="/affiliate-disclosure">Selengkapnya</Link> : <span>Selengkapnya</span>}
          </p>
        )}

        {interactive && (
          <Link className="button-dark" href="/members" style={{ marginTop: 24, display: "inline-block" }}>
            Explore more creators ↗
          </Link>
        )}
        <div className="bio-footer">Part of the Picnic Club community ↗</div>
      </div>
    </div>
  );
}
