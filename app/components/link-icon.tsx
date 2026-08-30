import { Facebook, Globe, Instagram, Mail, MessageCircle, Music2, ShoppingBag, Youtube } from "lucide-react";
import { linkTypeMeta } from "@/lib/link-types";

const ICONS = {
  link: Globe,
  tiktok: Music2,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  whatsapp: MessageCircle,
  shop: ShoppingBag,
  email: Mail,
} as const;

export function LinkIcon({ linkType, size = 17 }: { linkType: string; size?: number }) {
  const Icon = ICONS[linkTypeMeta(linkType).icon as keyof typeof ICONS] ?? Globe;
  return <Icon size={size} aria-hidden="true" />;
}
