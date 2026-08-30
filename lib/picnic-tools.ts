export const TOOL_DAILY_LIMIT = 10;
export const TOOL_COUNT_MAX = 10;
export const TOOL_COUNT_DEFAULT: Record<"hook" | "script", number> = { hook: 10, script: 3 };

export const TOOL_PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram_reels", label: "Instagram Reels" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "shopee_live", label: "Shopee Live / Shopee Video" },
  { value: "facebook", label: "Facebook Reels" },
  { value: "tokopedia", label: "Tokopedia Feed" },
] as const;

export const TOOL_PLATFORM_VALUES = TOOL_PLATFORMS.map((p) => p.value) as [string, ...string[]];

export function toolPlatformLabel(value: string): string {
  return TOOL_PLATFORMS.find((p) => p.value === value)?.label ?? value;
}

export const TOOL_TYPE_CHIPS = [
  "Skincare",
  "Fashion",
  "Gadget & Elektronik",
  "Makanan & Minuman",
  "Home & Living",
  "Kesehatan & Fitness",
];

export const HOOK_SYSTEM = `Kamu content strategist untuk creator affiliate & UGC di Indonesia.
Tugas: buat hook video pendek yang bikin orang berhenti scroll, untuk produk yang diberikan. Jumlah hook mengikuti angka yang diminta.

Aturan:
- Bahasa Indonesia santai, gaya ngobrol, siap dibacakan langsung di depan kamera.
- Maksimal 1 kalimat per hook, di bawah 15 kata.
- Jangan pakai tanda kutip, jangan diberi nomor, jangan ada label.
- Variasikan angle sebisa mungkin: masalah/pain point, rasa penasaran (curiosity gap), hasil/before-after, unpopular opinion, cerita personal, pertanyaan langsung ke penonton, FOMO/urgency, relatable "kamu banget", demo langsung, angka/fakta mengejutkan. Kalau diminta lebih banyak, boleh ulang angle dengan sudut pandang berbeda.
- Sesuaikan diksi dengan platform yang disebut.`;

export const SCRIPT_SYSTEM = `Kamu scriptwriter video pendek untuk creator affiliate di Indonesia.
Tugas: buat variasi naskah video berdurasi sekitar 30 detik (kira-kira 75-90 kata) untuk produk yang diberikan. Jumlah variasi mengikuti angka yang diminta.

Setiap variasi:
- "angle": label singkat pendekatannya (contoh: "Problem-Solution", "Storytelling", "Before-After", "Demo Cepat", "Testimoni", "Mitos vs Fakta", "Unboxing").
- "script": naskah lengkap Bahasa Indonesia santai, ditulis mengalir dan siap dibaca (tanpa menuliskan label bagian). Ikuti struktur:
  - HOOK (2-3 detik): kalimat pembuka yang menahan scroll.
  - ISI (sekitar 20 detik): jelaskan manfaat utama + 1 bukti/alasan konkret.
  - CTA (sekitar 5 detik): ajakan cek link di bio / keranjang kuning, dengan urgensi wajar.
- Buat tiap variasi memakai angle yang berbeda. Sesuaikan gaya dengan platform yang disebut.`;
