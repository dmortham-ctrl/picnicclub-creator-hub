import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { MinisiteBlocks } from "@/app/components/minisite-blocks";
import { SocialIcon } from "@/app/components/social-icons";
import { isHexColor } from "@/lib/themes";
import type { BlockContent, BlockType } from "@/lib/types";

export type MinisiteProfile = {
  username: string;
  display_name: string;
  category: string;
  bio: string;
  avatar_url: string;
  theme?: string | null;
  accent_color?: string | null;
  button_style?: string | null;
  button_shape?: string | null;
  banner_url?: string | null;
  layout?: string | null;
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
  // A WhatsApp link marked "float" is lifted out of the list into a fixed
  // bottom-right button (rendered outside .bio-card so the card's entrance
  // animation transform doesn't trap position:fixed).
  const waFloat = visible.find(
    (link) => (link.block_type ?? "link") === "link" && link.link_type === "whatsapp" && link.content?.wa_float,
  );
  const listBlocks = waFloat ? visible.filter((link) => link.id !== waFloat.id) : visible;
  const hasAffiliate = listBlocks.some((link) => (link.block_type ?? "link") === "link" && link.affiliate_disclosure);
  const layout = profile.layout === "full" ? "full" : "classic";
  const pageStyle: CSSProperties = isHexColor(profile.accent_color)
    ? ({ ["--bio-accent" as string]: profile.accent_color })
    : {};

  return (
    <div
      className="bio-page"
      data-theme={profile.theme || "default"}
      data-layout={layout}
      data-btn={profile.button_style || "fill"}
      data-shape={profile.button_shape || "rounded"}
      style={pageStyle}
    >
      <div className="bio-card">
        {layout === "full" && profile.avatar_url ? (
          <div className="bio-hero">
            <Image
              className="bio-hero-img"
              src={profile.avatar_url}
              alt={profile.display_name}
              width={560}
              height={560}
              priority={interactive}
            />
            <div className="bio-hero-meta">
              <strong>{profile.display_name || "Nama kamu"}</strong>
              <span>@{profile.username} · {profile.category || "Kategori"}</span>
            </div>
          </div>
        ) : (
          <>
            {profile.banner_url && (
              <Image className="bio-banner" src={profile.banner_url} alt="" width={720} height={240} priority={interactive} />
            )}
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
          </>
        )}
        {profile.bio && <p className="bio-copy">{profile.bio}</p>}

        <MinisiteBlocks blocks={listBlocks} interactive={interactive} />

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

      {waFloat &&
        (interactive ? (
          <a
            className="bio-wa-float"
            href={`/l/${waFloat.id}`}
            target="_blank"
            rel="noreferrer nofollow"
            aria-label={waFloat.label || "Chat WhatsApp"}
          >
            <SocialIcon platform="whatsapp" size={26} />
          </a>
        ) : (
          <span className="bio-wa-float bio-wa-float--preview" aria-hidden="true">
            <SocialIcon platform="whatsapp" size={20} />
          </span>
        ))}
    </div>
  );
}
