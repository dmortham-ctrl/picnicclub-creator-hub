import { getPublicSupabase } from "./supabase-server";

const defaults: Record<string, string> = {
  hero_title: "More than an agency.",
  hero_description:
    "Rumah bagi para creator dan affiliator terbaik Indonesia. Grow your influence, income, and network together.",
  marquee_text: "Indonesia's largest affiliate community",
  about_title: "We make creator growth feel less lonely.",
  brands_title: "Brands we've worked with.",
  faq_intro: "Masih ingin tahu lebih banyak? Tim Picnic Club siap membantu.",
  founder_usernames: "inproduk,bertosb1m,adli.hibatul,aditsur88,sobatkaryawan",
};

export type Faq = { question: string; answer: string };

export const fallbackFaqs: Faq[] = [
  { question: "Apa Itu Picnic Club?", answer: "Picnic Club adalah MCN dan komunitas creator commerce yang dibangun oleh praktisi content creation dan affiliate marketing. Kami membantu creator dan affiliator bertumbuh melalui edukasi, mentoring, networking, akses campaign, dan kolaborasi dengan brand." },
  { question: "Penting Gak Ikut MCN/Agency?", answer: "Bergabung dengan MCN membantu creator mendapatkan akses yang biasanya sulit didapatkan sendiri, seperti voucher dan promo platform, dukungan iklan, event matchmaking, pendampingan, bantuan pelanggaran akun, serta komunitas untuk belajar dan berkembang." },
  { question: "Benefit apa Join Picnic Club?", answer: "Member mendapatkan training online rutin, Zoom materi dan tips, chat support dengan mentor, networking dan kopdar, reward dan trip, peluang support iklan, update hook dan ide konten, akses ruang konten, sample produk, serta support manager." },
  { question: "Apa Syarat Join Picnic Club?", answer: "Syarat utama: memiliki akun TikTok dengan minimal 600 followers, GMV minimal Rp1.000.000, berusia minimal 18 tahun, berdomisili di Indonesia, aktif membuat konten atau live, bersedia belajar, konsisten, kreatif, dan mematuhi kebijakan platform." },
  { question: "Berapa Potongan Fee Picnic Club?", answer: "Picnic Club berkomitmen memberikan potongan fee yang kompetitif. Detail sharing fee dan mekanismenya akan dijelaskan oleh admin sesuai platform dan program yang diikuti." },
  { question: "Gimana cara Join?", answer: "Hubungi admin Picnic Club melalui WhatsApp, kemudian isi formulir pendaftaran TikTok atau Shopee. Tim kami akan memandu proses verifikasi, penautan akun, dan mekanisme sharing fee." },
];

export async function getSiteContent(): Promise<Record<string, string>> {
  const supabase = getPublicSupabase();
  if (!supabase) return defaults;
  const { data } = await supabase.from("site_content").select("key,value");
  return { ...defaults, ...Object.fromEntries((data ?? []).map((item) => [item.key, item.value])) };
}

export async function getFaqs(): Promise<Faq[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return fallbackFaqs;
  const { data } = await supabase
    .from("faqs")
    .select("question,answer")
    .eq("is_active", true)
    .order("sort_order");
  return data && data.length ? (data as Faq[]) : fallbackFaqs;
}
