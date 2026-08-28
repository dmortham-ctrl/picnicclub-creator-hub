import { supabase } from "./supabase";

export type Brand = { id: string; name: string; logo_url: string; website_url: string; is_active: boolean; sort_order: number };

export const fallbackBrands: Brand[] = [
  { id: "pakalolo", name: "Pakalolo", logo_url: "https://picnicclub.id/wp-content/uploads/2026/06/pakalolo-150x150.jpeg", website_url: "", is_active: true, sort_order: 1 },
  { id: "torch", name: "Torch", logo_url: "https://picnicclub.id/wp-content/uploads/2026/06/logotorch-150x150.jpg", website_url: "", is_active: true, sort_order: 2 },
  { id: "antarestar", name: "Antarestar", logo_url: "https://picnicclub.id/wp-content/uploads/2026/06/antarestar-150x150.jpeg", website_url: "", is_active: true, sort_order: 3 },
  { id: "msglow", name: "MS Glow", logo_url: "https://picnicclub.id/wp-content/uploads/2026/06/msglow-150x150.jpeg", website_url: "", is_active: true, sort_order: 4 },
  { id: "kualitasstore", name: "Kualitas Store", logo_url: "https://picnicclub.id/wp-content/uploads/2026/06/kualitasstore-150x150.jpeg", website_url: "", is_active: true, sort_order: 5 },
  { id: "msglowb", name: "MS Glow Beauty", logo_url: "https://picnicclub.id/wp-content/uploads/2026/06/msglowb-150x150.jpg", website_url: "", is_active: true, sort_order: 6 }
];

export async function getActiveBrands(): Promise<Brand[]> {
  if (!supabase) return fallbackBrands;
  const { data } = await supabase.from("brands").select("*").eq("is_active", true).order("sort_order");
  return (data as Brand[] | null) ?? fallbackBrands;
}
