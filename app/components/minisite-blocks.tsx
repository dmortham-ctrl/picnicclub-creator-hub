"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { LinkIcon } from "@/app/components/link-icon";
import { SocialIcon } from "@/app/components/social-icons";
import { sanitizeRichText, socialPlatformLabel } from "@/lib/blocks";
import type { MinisiteLink } from "@/app/components/minisite-view";

function blockText(block: MinisiteLink): string {
  const type = block.block_type ?? "link";
  if (type === "text") return (block.content?.html ?? "").replace(/<[^>]+>/g, " ");
  if (type === "social") {
    return (block.content?.items ?? [])
      .map((i) => `${i.platform} ${socialPlatformLabel(i.platform)} ${i.url}`)
      .join(" ");
  }
  if (type === "photo") return `${block.label ?? ""} ${block.content?.caption ?? ""}`;
  return `${block.label ?? ""} ${block.url ?? ""} ${block.link_type ?? ""}`;
}

export function MinisiteBlocks({
  blocks,
  interactive,
}: {
  blocks: MinisiteLink[];
  interactive: boolean;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () => (q ? blocks.filter((b) => blockText(b).toLowerCase().includes(q)) : blocks),
    [blocks, q],
  );

  return (
    <>
      {blocks.length >= 3 && (
        <div className="bio-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari..."
            aria-label="Cari di halaman ini"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {filtered.map((block) => (
        <Block key={block.id} block={block} interactive={interactive} />
      ))}

      {q && filtered.length === 0 && <p className="bio-search-empty">Tidak ada yang cocok dengan &ldquo;{query}&rdquo;.</p>}
    </>
  );
}

function Block({ block, interactive }: { block: MinisiteLink; interactive: boolean }) {
  const type = block.block_type ?? "link";

  if (type === "text") {
    return (
      <div className="bio-text" dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.content?.html ?? "") }} />
    );
  }

  if (type === "social") {
    const items = block.content?.items ?? [];
    if (items.length === 0) return null;
    return (
      <div className="bio-social">
        {items.map((item, i) =>
          interactive ? (
            <a key={i} href={item.url} target="_blank" rel="noreferrer nofollow" aria-label={socialPlatformLabel(item.platform)}>
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
