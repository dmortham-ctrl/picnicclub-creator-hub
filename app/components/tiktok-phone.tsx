"use client";

import { useState } from "react";
import type { TikTokFeed } from "@/lib/tiktok";

const compact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",").replace(",0", "")}K`;
  return String(n);
};

/**
 * An iPhone mockup showing the TikTok profile: header, stats and a scrollable grid of the
 * latest videos. Tapping a video plays it inside the phone (TikTok's own embedded player).
 * With no feed (TikTok unreachable) the phone shows TikTok's creator embed instead.
 */
export function TikTokPhone({ feed, handle }: { feed: TikTokFeed | null; handle: string }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="tt-phone" role="group" aria-label={`TikTok @${handle}`}>
      <span className="tt-btn tt-btn-a" aria-hidden="true" />
      <span className="tt-btn tt-btn-b" aria-hidden="true" />
      <span className="tt-btn tt-btn-c" aria-hidden="true" />
      <span className="tt-btn tt-btn-power" aria-hidden="true" />
      <div className="tt-screen">
        <span className="tt-island" aria-hidden="true" />
        <div className="tt-status" aria-hidden="true"><b>9:41</b><i /></div>

        {feed ? (
          <div className="tt-scroll" tabIndex={0} aria-label="Video terbaru, bisa di-scroll">
            <header className="tt-profile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {feed.avatar ? <img className="tt-avatar" src={feed.avatar} alt="" referrerPolicy="no-referrer" width={76} height={76} /> : <span className="tt-avatar" />}
              <h3>@{handle}</h3>
              <div className="tt-stats">
                <div><strong>{compact(feed.following)}</strong><span>Following</span></div>
                <div><strong>{compact(feed.followers)}</strong><span>Followers</span></div>
                <div><strong>{compact(feed.likes)}</strong><span>Likes</span></div>
              </div>
              <a className="tt-follow" href={`https://www.tiktok.com/@${handle}`} target="_blank" rel="noopener noreferrer">Follow</a>
              {feed.bio && <p className="tt-bio">{feed.bio}</p>}
            </header>
            <div className="tt-tab" aria-hidden="true"><span /></div>
            <ul className="tt-grid">
              {feed.videos.map((video) => (
                <li key={video.id}>
                  <button type="button" onClick={() => setPlaying(video.id)} aria-label={video.desc ? `Putar video: ${video.desc.slice(0, 80)}` : "Putar video"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={video.cover} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    <span className="tt-plays">{compact(video.plays)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <a className="tt-more" href={`https://www.tiktok.com/@${handle}`} target="_blank" rel="noopener noreferrer">Lihat semua video di TikTok</a>
          </div>
        ) : (
          <iframe className="tt-fallback" src={`https://www.tiktok.com/embed/@${handle}`} title={`TikTok @${handle}`} loading="lazy" allow="encrypted-media; fullscreen" />
        )}

        {playing && (
          <div className="tt-player">
            <iframe src={`https://www.tiktok.com/player/v1/${playing}?autoplay=1&music_info=1&description=1&rel=0`} title="Video TikTok Picnic Club" allow="autoplay; fullscreen; encrypted-media" allowFullScreen />
            <button type="button" className="tt-close" onClick={() => setPlaying(null)} aria-label="Tutup video">×</button>
          </div>
        )}
        <span className="tt-home" aria-hidden="true" />
      </div>
    </div>
  );
}
