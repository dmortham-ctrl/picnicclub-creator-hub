import Image from "next/image";
import Link from "next/link";
import { LinkIcon } from "@/app/components/link-icon";
import { SocialIcon } from "@/app/components/social-icons";
import { sanitizeRichText, socialPlatformLabel } from "@/lib/blocks";
import type { BlockContent, BlockType } from "@/lib/types";

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
  block_type?: BlockType | null;
  content?: BlockContent | null;
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
  const hasAffiliate = visible.some((link) => (link.block_type ?? "link") === "link" && link.affiliate_disclosure);

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

        {visible.map((block) => (
          <Block key={block.id} block={block} interactive={interactive} />
        ))}

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

function Block({ block, interactive }: { block: MinisiteLink; interactive: boolean }) {
  const type = block.block_type ?? "link";

  if (type === "text") {
    return (
      <div
        className="bio-text"
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.content?.html ?? "") }}
      />
    );
  }

  if (type === "social") {
    const items = block.content?.items ?? [];
    if (items.length === 0) return null;
    return (
      <div className="bio-social">
        {items.map((item, i) =>
          interactive ? (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noreferrer nofollow"
              aria-label={socialPlatformLabel(item.platform)}
            >
              <SocialIcon platform={item.platform} />
            </a>
          ) : (
            <span key={i} aria-label={socialPlatformLabel(item.platform)}>
              <SocialIcon platform={item.platform} />
            </span>
          ),
        )}
      </div>
    );
  }

  if (type === "photo") {
    if (!block.image_url) return null;
    const img = (
      <Image
        className="bio-photo-img"
        src={block.image_url}
        alt={block.label || block.content?.caption || ""}
        width={520}
        height={520}
      />
    );
    return (
      <figure className="bio-photo">
        {interactive && block.url ? (
          <a href={`/l/${block.id}`} target="_blank" rel="noreferrer nofollow">
            {img}
          </a>
        ) : (
          img
        )}
        {block.content?.caption && <figcaption>{block.content.caption}</figcaption>}
      </figure>
    );
  }

  // link
  const body = (
    <>
      {block.image_url ? (
        <Image className="bio-link-thumb" src={block.image_url} alt="" width={48} height={48} />
      ) : (
        <LinkIcon linkType={block.link_type} />
      )}
      <span className="bio-link-label">{block.label}</span>
      {block.affiliate_disclosure && <small>affiliate</small>}
    </>
  );
  return interactive ? (
    <a className="bio-link" href={`/l/${block.id}`} target="_blank" rel="noreferrer nofollow">
      {body}
    </a>
  ) : (
    <div className="bio-link">{body}</div>
  );
}
