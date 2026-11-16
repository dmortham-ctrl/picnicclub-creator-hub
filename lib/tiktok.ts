/**
 * Latest videos + profile stats for the TikTok account shown in the homepage phone mockup.
 *
 * TikTok has no free public API for this, but its own profile-embed page
 * (tiktok.com/embed/@handle) ships the creator's latest videos as JSON. We read that
 * server-side and cache it for an hour (matches the homepage's ISR). Cover URLs are
 * signed and expire after ~2 days, so the hourly refresh keeps them valid.
 * If TikTok changes the page or is unreachable we return null and the section falls
 * back to TikTok's own embed.
 */
export const TIKTOK_HANDLE = "picnicclub.id";
export const TIKTOK_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

export type TikTokVideo = { id: string; cover: string; desc: string; plays: number };
export type TikTokFeed = {
  nickname: string;
  avatar: string;
  followers: number;
  following: number;
  likes: number;
  bio: string;
  videos: TikTokVideo[];
};

type EmbedVideo = { id?: string; desc?: string; originCoverUrl?: string; coverUrl?: string; playCount?: number };
type EmbedUser = { nickname?: string; avatarThumbUrl?: string; followerCount?: number; followingCount?: number; heartCount?: number; signature?: string };

/** How many videos the phone shows. */
const VIDEO_COUNT = 9;

/**
 * TikTok's profile embed only returns the 7 newest videos, so the next-oldest ones are
 * added here (newest first) to reach VIDEO_COUNT. Covers are saved in /public/tiktok.
 * Videos that already appear in the embed list are skipped, so this stays correct as new
 * videos push these further down.
 */
const OLDER_VIDEOS: TikTokVideo[] = [
  { id: "7685396114064821524", cover: "/tiktok/7685396114064821524.jpg", desc: "Makasih Seller yang selalu pasang Gmv Maks. @Kualitasstore", plays: 3942 },
  { id: "7685307594918858004", cover: "/tiktok/7685307594918858004.jpg", desc: "Picnic Club Dalam Acara Matchmaking Fashion Muslimah di Graha Pos Bandung. 14 Sept 2026.", plays: 2415 },
];

export async function getTikTokFeed(): Promise<TikTokFeed | null> {
  try {
    const res = await fetch(`https://www.tiktok.com/embed/@${TIKTOK_HANDLE}`, {
      headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const json = html.match(/<script id="__FRONTITY_CONNECT_STATE__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!json) return null;
    const data = JSON.parse(json)?.source?.data?.[`/embed/@${TIKTOK_HANDLE}`] as { videoList?: EmbedVideo[]; userInfo?: EmbedUser } | undefined;
    const videos = (data?.videoList ?? [])
      .filter((video): video is EmbedVideo & { id: string } => Boolean(video.id && (video.originCoverUrl || video.coverUrl)))
      .map((video) => ({ id: video.id, cover: video.originCoverUrl || video.coverUrl || "", desc: video.desc ?? "", plays: video.playCount ?? 0 }));
    if (!videos.length) return null;
    const seen = new Set(videos.map((video) => video.id));
    const feedVideos = [...videos, ...OLDER_VIDEOS.filter((video) => !seen.has(video.id))].slice(0, VIDEO_COUNT);
    const user = data?.userInfo ?? {};
    return {
      nickname: user.nickname || "Picnic Club",
      avatar: user.avatarThumbUrl ?? "",
      followers: user.followerCount ?? 0,
      following: user.followingCount ?? 0,
      likes: user.heartCount ?? 0,
      bio: (user.signature ?? "").replace(/[^\p{L}\p{N}\p{P}\p{Zs}\n]/gu, "").trim(),
      videos: feedVideos,
    };
  } catch {
    return null;
  }
}
