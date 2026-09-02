// Custom next/image loader.
//
// Vercel's built-in image optimizer (/_next/image) is metered, and once the
// monthly transformation quota is spent it returns HTTP 402 for every image it
// hasn't already cached — silently breaking any new avatar, banner or logo.
//
// Supabase Storage can resize its own public objects on the fly
// (/render/image/public/...?width=), so we route those through Supabase and
// leave everything else (local files, data URIs, other hosts) untouched.

type LoaderArgs = { src: string; width: number; quality?: number };

const PUBLIC_OBJECT = "/storage/v1/object/public/";
const PUBLIC_RENDER = "/storage/v1/render/image/public/";

export default function supabaseImageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.includes(PUBLIC_OBJECT)) {
    const base = src.split("?")[0].replace(PUBLIC_OBJECT, PUBLIC_RENDER);
    // Supabase's resizer rejects dimensions above 2500px. `resize=contain` with
    // only a width scales height proportionally — without it the height is left
    // at the original and the image comes back squashed.
    const w = Math.min(width, 2000);
    return `${base}?width=${w}&resize=contain&quality=${quality ?? 75}`;
  }
  return src;
}
