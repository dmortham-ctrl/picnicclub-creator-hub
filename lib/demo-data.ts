import { Profile, ProfileLink } from "./types";

export const demoProfiles: Profile[] = [
  { id: "1", username: "inproduk", display_name: "Daniel", bio: "Creator commerce, product finds, dan daily inspiration.", avatar_url: "https://i.pravatar.cc/160?img=12", category: "Lifestyle", status: "published", is_featured: true, featured_order: 1 },
  { id: "2", username: "bertosb1m", display_name: "Berto", bio: "Sharing products worth talking about.", avatar_url: "https://i.pravatar.cc/160?img=11", category: "Gadget", status: "published", is_featured: true, featured_order: 2 },
  { id: "3", username: "aditsur88", display_name: "Adit Suryo", bio: "Affiliate tips and honest product reviews.", avatar_url: "https://i.pravatar.cc/160?img=13", category: "Education", status: "published", is_featured: true, featured_order: 3 },
  { id: "4", username: "adli.hibatul", display_name: "Adli Hibatul", bio: "Build, learn, and grow together.", avatar_url: "https://i.pravatar.cc/160?img=14", category: "Lifestyle", status: "published", is_featured: true, featured_order: 4 },
  { id: "5", username: "rendyherpy", display_name: "Rendy Herpy", bio: "Temukan rekomendasi pilihan setiap hari.", avatar_url: "https://i.pravatar.cc/160?img=15", category: "Fashion", status: "published", is_featured: true, featured_order: 5 },
  { id: "6", username: "aisyacollecion", display_name: "Aisya Collecion", bio: "Beauty, style, and little things I love.", avatar_url: "https://i.pravatar.cc/160?img=16", category: "Beauty", status: "published", is_featured: false, featured_order: 6 },
  { id: "7", username: "sobatkaryawan", display_name: "Sobat Karyawan", bio: "Life hacks untuk pekerja modern.", avatar_url: "https://i.pravatar.cc/160?img=17", category: "Lifestyle", status: "published", is_featured: false, featured_order: 7 },
  { id: "8", username: "apin.ketiduran", display_name: "Apin Ketiduran", bio: "Review jujur, rekomendasi seru.", avatar_url: "https://i.pravatar.cc/160?img=18", category: "Food", status: "published", is_featured: false, featured_order: 8 }
];

export const demoLinks: ProfileLink[] = demoProfiles.flatMap((profile) => [
  { id: `${profile.id}-1`, profile_id: profile.id, label: "Follow me on TikTok", url: `https://www.tiktok.com/@${profile.username}`, link_type: "tiktok", icon_key: "tiktok", sort_order: 1, is_active: true, affiliate_disclosure: false },
  { id: `${profile.id}-2`, profile_id: profile.id, label: "My favorite finds", url: "https://www.tiktok.com/", link_type: "shop", icon_key: "shopping-bag", sort_order: 2, is_active: true, affiliate_disclosure: true },
  { id: `${profile.id}-3`, profile_id: profile.id, label: "Instagram", url: `https://www.instagram.com/${profile.username}`, link_type: "instagram", icon_key: "instagram", sort_order: 3, is_active: true, affiliate_disclosure: false }
]);
