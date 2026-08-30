export const TOOL_DAILY_LIMIT = 50;
export const TOOL_COUNT_MAX = 10;

export type ToolKey = "hook" | "script" | "caption" | "live" | "calendar";
export const TOOL_KEYS: ToolKey[] = ["hook", "script", "caption", "live", "calendar"];

/** Per-tool UI + generation config. `hasCount` shows the "jumlah" selector. */
export const TOOL_META: Record<
  ToolKey,
  { label: string; noun: string; desc: string; hasCount: boolean; defaultCount: number }
> = {
  hook: { label: "Ide Hook", noun: "hook", hasCount: true, defaultCount: 10, desc: "Masukkan produk kamu, AI buatkan hook penahan scroll siap pakai." },
  script: { label: "Ide Script", noun: "script", hasCount: true, defaultCount: 3, desc: "Masukkan produk kamu, AI buatkan naskah video ±30 detik." },
  caption: { label: "Ide Caption", noun: "caption", hasCount: true, defaultCount: 5, desc: "Caption siap tempel di bawah video, sudah lengkap dengan hashtag." },
  live: { label: "Skrip Live Selling", noun: "bagian", hasCount: false, defaultCount: 1, desc: "Naskah lengkap untuk sesi live: dari opening sampai closing." },
  calendar: { label: "Kalender Konten", noun: "hari", hasCount: false, defaultCount: 7, desc: "Rencana konten 7 hari dari satu produk — tiap hari angle & format berbeda." },
};

// Kept for backwards compatibility with existing imports.
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

// Scarcity / stock language that TikTok now flags as a policy violation.
// Used in the prompts and as a validation guard on the model output.
const BANNED_URGENCY_RULE = `LARANGAN KERAS - jangan pernah menyinggung stok, persediaan, atau kelangkaan barang:
- Dilarang menyebut: stok, stock, persediaan, restock, "keburu habis", "sebelum kehabisan", "jangan sampai kehabisan", "sisa sedikit", "barang/unit terbatas", "sold out", "limited stock", "buruan sebelum habis", atau ajakan apa pun yang berbasis takut kehabisan barang.
- Boleh: ajakan santai untuk cek link / keranjang kuning / info lengkap, atau urgensi berbasis WAKTU promo (mis. "promo cuma sampai malam ini") - bukan berbasis jumlah barang.
- CTA yang aman: "cek keranjang kuning ya", "info lengkap di link bio", "klik keranjang kuning kalau mau lihat harganya", "geser ke keranjang kuning buat detailnya".`;

export const HOOK_SYSTEM = `Kamu content strategist untuk creator affiliate & UGC di Indonesia.
Tugas: buat hook video pendek yang bikin orang berhenti scroll, untuk produk yang diberikan. Jumlah hook mengikuti angka yang diminta.

Aturan:
- Bahasa Indonesia santai, gaya ngobrol, siap dibacakan langsung di depan kamera.
- Maksimal 1 kalimat per hook, di bawah 15 kata.
- Jangan pakai tanda kutip, jangan diberi nomor, jangan ada label.
- Variasikan angle sebisa mungkin: masalah/pain point, rasa penasaran (curiosity gap), hasil/before-after, unpopular opinion, cerita personal, pertanyaan langsung ke penonton, relatable "kamu banget", demo langsung, angka/fakta mengejutkan. Kalau diminta lebih banyak, boleh ulang angle dengan sudut pandang berbeda.
- Sesuaikan diksi dengan platform yang disebut.

${BANNED_URGENCY_RULE}`;

export const SCRIPT_SYSTEM = `Kamu scriptwriter video pendek untuk creator affiliate di Indonesia.
Tugas: buat variasi naskah video berdurasi sekitar 30 detik (kira-kira 75-90 kata) untuk produk yang diberikan. Jumlah variasi mengikuti angka yang diminta.

Setiap variasi:
- "angle": label singkat pendekatannya (contoh: "Problem-Solution", "Storytelling", "Before-After", "Demo Cepat", "Testimoni", "Mitos vs Fakta", "Unboxing").
- "script": naskah lengkap Bahasa Indonesia santai, ditulis mengalir dan siap dibaca (tanpa menuliskan label bagian). Ikuti struktur:
  - HOOK (2-3 detik): kalimat pembuka yang menahan scroll.
  - ISI (sekitar 20 detik): jelaskan manfaat utama + 1 bukti/alasan konkret.
  - CTA (sekitar 5 detik): ajakan santai untuk cek link / keranjang kuning.
- Buat tiap variasi memakai angle yang berbeda. Sesuaikan gaya dengan platform yang disebut.

${BANNED_URGENCY_RULE}`;

export const CAPTION_SYSTEM = `Kamu social media copywriter untuk creator affiliate di Indonesia.
Tugas: buat caption/deskripsi yang ditempel di bawah video pendek, untuk produk yang diberikan. Jumlah caption mengikuti angka yang diminta.

Setiap caption berupa satu string dengan struktur:
- 1 kalimat pembuka yang nendang (hook), Bahasa Indonesia santai.
- 1-2 kalimat isi: manfaat utama atau alasan kenapa harus coba.
- 1 ajakan santai (cek keranjang kuning / link di bio).
- Baris baru, lalu 3-5 hashtag relevan (campuran: kategori produk + gaya konten + kata kunci pembeli), dipisah spasi, huruf kecil.
- Boleh 1-2 emoji seperlunya, jangan berlebihan.
- Total di bawah 60 kata (tidak termasuk hashtag).
- Jangan pakai tanda kutip di awal/akhir, jangan diberi nomor.
- Sesuaikan gaya & hashtag dengan platform yang disebut.

${BANNED_URGENCY_RULE}`;

export const LIVE_SYSTEM = `Kamu pelatih live selling untuk affiliate TikTok Shop & Shopee Live di Indonesia.
Tugas: buat naskah lengkap satu sesi live selling untuk produk yang diberikan. Abaikan angka jumlah yang diminta — keluarkan tepat 6 bagian berurutan.

Keluarkan array 6 objek dengan "title" dan "script":
1. "Opening / Sapa Penonton" — sapaan hangat, bangun energi, kasih tahu bakal bahas produk apa dan kenapa worth ditonton sampai habis.
2. "Perkenalan Produk" — apa produknya, untuk siapa, masalah apa yang dijawab. Sebut 2-3 keunggulan utama.
3. "Demo & Bukti" — cara pakai / tunjukkan langsung, plus 1 bukti konkret (hasil, testimoni, perbandingan).
4. "Jawab Pertanyaan & Keberatan Umum" — antisipasi pertanyaan penonton ("harganya berapa?", "ori nggak?", "cocok buat kulit sensitif?", "worth it nggak?") dan cara menjawabnya dengan meyakinkan tapi jujur.
5. "Dorongan Beli" — arahkan ke keranjang kuning, jelaskan promo berbasis WAKTU kalau ada, ciptakan momentum tanpa menyinggung stok.
6. "Closing" — recap singkat, ajak follow & nyalakan lonceng, tutup dengan ramah.

Setiap "script": teks mengalir Bahasa Indonesia santai, siap dibaca host, 60-110 kata per bagian. Jangan tulis label bagian di dalam script. Sesuaikan diksi dengan platform yang disebut.

${BANNED_URGENCY_RULE}`;

export const CALENDAR_SYSTEM = `Kamu content planner untuk creator affiliate di Indonesia.
Tugas: buat rencana konten 7 hari dari SATU produk yang diberikan. Abaikan angka jumlah yang diminta — keluarkan tepat 7 hari.

Keluarkan array 7 objek: "day" (angka 1-7), "format" (jenis video singkat: contoh "Storytime", "Demo/Tutorial", "Before-After", "Q&A / Balas Komentar", "Unboxing", "Mitos vs Fakta", "Day in my life", "Duet/Reaction", "Tips cepat", "GRWM"), "angle" (sudut pandang / pesan utama hari itu, 1 frasa), dan "idea" (deskripsi ide videonya 1-2 kalimat konkret, termasuk apa yang ditunjukkan dan hook kasarnya).

Aturan:
- 7 hari harus terasa berbeda-beda (format & angle jangan berulang).
- Progresif: hari awal kenalan & tarik perhatian, tengah bangun kepercayaan & bukti, akhir dorongan beli.
- Bahasa Indonesia santai. Setiap "idea" langsung actionable, bukan teori.
- Sesuaikan dengan platform yang disebut.

${BANNED_URGENCY_RULE}`;

const BANNED_URGENCY_RE =
  /\b(stok|stock|persediaan|restock|sold\s*out|limited\s*stock)\b|keburu\s+(habis|kehabisan)|sebelum\s+(habis|kehabisan)|jangan\s+sampai\s+kehabisan|sisa\s+(sedikit|\d)|(barang|unit|slot)\s+terbatas|buruan\s+(sebelum|keburu)/i;

export function hasBannedUrgency(text: string): boolean {
  return BANNED_URGENCY_RE.test(text);
}
