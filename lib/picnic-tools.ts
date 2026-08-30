export const TOOL_DAILY_LIMIT = 10;

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
Tugas: buat tepat 10 hook video pendek yang bikin orang berhenti scroll, untuk produk yang diberikan.

Aturan:
- Bahasa Indonesia santai, gaya ngobrol, siap dibacakan langsung di depan kamera.
- Maksimal 1 kalimat per hook, di bawah 15 kata.
- Jangan pakai tanda kutip, jangan diberi nomor, jangan ada label.
- Variasikan angle-nya, satu hook untuk tiap angle berikut, berurutan:
  1. Masalah / pain point yang relatable
  2. Rasa penasaran (curiosity gap)
  3. Hasil / before-after
  4. Unpopular opinion / sedikit kontroversial
  5. Cerita personal singkat
  6. Pertanyaan langsung ke penonton
  7. FOMO / urgency
  8. Relatable "kamu banget"
  9. Demo langsung ("lihat nih", "coba lihat")
  10. Angka / fakta mengejutkan
- Sesuaikan diksi dengan platform yang disebut.`;

export const SCRIPT_SYSTEM = `Kamu scriptwriter video pendek untuk creator affiliate di Indonesia.
Tugas: buat tepat 3 variasi naskah video berdurasi sekitar 30 detik (kira-kira 75-90 kata) untuk produk yang diberikan.

Setiap variasi:
- "angle": label singkat pendekatannya (contoh: "Problem-Solution", "Storytelling", "Before-After", "Demo Cepat", "Testimoni").
- "script": naskah lengkap Bahasa Indonesia santai, ditulis mengalir dan siap dibaca (tanpa menuliskan label bagian). Ikuti struktur:
  - HOOK (2-3 detik): kalimat pembuka yang menahan scroll.
  - ISI (sekitar 20 detik): jelaskan manfaat utama + 1 bukti/alasan konkret.
  - CTA (sekitar 5 detik): ajakan cek link di bio / keranjang kuning, dengan urgensi wajar.
- Sesuaikan gaya dengan platform yang disebut.`;
