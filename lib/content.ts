import { supabase } from "./supabase";

const defaults: Record<string, string> = {
  hero_title: "More than an agency.",
  hero_description: "Rumah bagi para creator dan affiliator terbaik Indonesia. Grow your influence, income, and network together.",
  marquee_text: "Indonesia's largest affiliate community",
  about_title: "We make creator growth feel less lonely.",
  brands_title: "Brands we've worked with.",
  faq_intro: "Masih ingin tahu lebih banyak? Tim Picnic Club siap membantu."
};

export async function getSiteContent() {
  if (!supabase) return defaults;
  const { data } = await supabase.from("site_content").select("key,value");
  return { ...defaults, ...Object.fromEntries((data ?? []).map((item) => [item.key, item.value])) };
}
