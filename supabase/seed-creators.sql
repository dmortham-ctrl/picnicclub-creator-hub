-- Public creator seed from the current picnicclub.id member showcase.
-- Auth users are intentionally not created here because Supabase Auth requires
-- a real, unique email for verification and password recovery.
insert into public.profiles
  (username, display_name, bio, avatar_url, category, status, is_featured, featured_order)
values
  ('inproduk', 'Daniel', 'Creator commerce, product finds, dan daily inspiration.', 'https://picnicclub.id/wp-content/uploads/2026/06/daniel.jpeg', 'Elektronik', 'published', true, 1),
  ('bertosb1m', 'Berto', 'Sharing products worth talking about.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-16-at-16.52.22.jpeg', 'Education', 'published', true, 2),
  ('adli.hibatul', 'Adli Hibatul', 'Build, learn, and grow together.', 'https://picnicclub.id/wp-content/uploads/2026/06/adli.jpg', 'Education', 'published', true, 3),
  ('aditsur88', 'Adit Suryo', 'Affiliate tips and honest product reviews.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-14.54.17.jpeg', 'Fashion', 'published', true, 4),
  ('rendyherpy', 'Rendy Herpy', 'Temukan rekomendasi pilihan setiap hari.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.37.21.jpeg', 'Lifestyle', 'published', true, 5),
  ('aisyacollecion', 'Aisya Collecion', 'Beauty, style, and little things I love.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-19.31.47.jpeg', 'Beauty', 'published', true, 6),
  ('ohinijuan', 'Ohinijuan', 'Rekomendasi produk pilihan setiap hari.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.18-1-1024x985.jpeg', 'Lifestyle', 'published', true, 7),
  ('sobatkaryawan', 'Sobat Karyawan', 'Life hacks untuk pekerja modern.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.20-1024x939.jpeg', 'Fashion', 'published', true, 8),
  ('apin.ketiduran', 'Apin Ketiduran', 'Review jujur, rekomendasi seru.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.16-1-1024x981.jpeg', 'Lifestyle', 'published', true, 9),
  ('ajunperwira9288', 'Ajun Perwira', 'Daily finds and creator stories.', 'https://picnicclub.id/wp-content/uploads/2026/07/ajun2.jpeg', 'Lifestyle', 'published', true, 10),
  ('kulfa23', 'Kulfa 23', 'Rekomendasi pilihan dan tips belanja.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.19-2-1024x928.jpeg', 'Lifestyle', 'published', true, 11),
  ('jamesthoms', 'James Thoms', 'Products, places, and things worth sharing.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.40.59.jpeg', 'Lifestyle', 'published', true, 12),
  ('chandkelvin173', 'Chand Kelvin', 'Style, stories, and favorite finds.', 'https://picnicclub.id/wp-content/uploads/2026/06/chand.jpeg', 'Fashion', 'published', true, 13),
  ('edoborne', 'Edo Borne', 'Discover something new every day.', 'https://picnicclub.id/wp-content/uploads/2026/06/edoborne.jpeg', 'Lifestyle', 'published', true, 14),
  ('taktikers', 'Taktikers', 'Smart recommendations for everyday life.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.18-2-1024x987.jpeg', 'Lifestyle', 'published', true, 15),
  ('mkosim28', 'M. Kosim', 'Tips, reviews, and useful discoveries.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.19-1-1024x920.jpeg', 'Lifestyle', 'published', true, 16),
  ('sofiatulkaromah98', 'Sofiatul Karomah', 'Beauty and lifestyle recommendations.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.18-1024x934.jpeg', 'Beauty', 'published', true, 17),
  ('cocohan.id', 'Cocohan', 'Finds, stories, and everyday inspiration.', 'https://picnicclub.id/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-12-at-15.53.19-1024x960.jpeg', 'Lifestyle', 'published', true, 18)
on conflict (username) do update set
  display_name = excluded.display_name,
  bio = excluded.bio,
  avatar_url = excluded.avatar_url,
  category = excluded.category,
  status = excluded.status,
  is_featured = excluded.is_featured,
  featured_order = excluded.featured_order,
  updated_at = now();

insert into public.profile_links
  (profile_id, label, url, link_type, icon_key, sort_order, is_active, affiliate_disclosure)
select id, 'Follow me on TikTok', 'https://www.tiktok.com/@' || username, 'tiktok', 'tiktok', 1, true, false
from public.profiles
where username in ('inproduk', 'bertosb1m', 'adli.hibatul', 'aditsur88', 'rendyherpy', 'aisyacollecion', 'ohinijuan', 'sobatkaryawan', 'apin.ketiduran', 'ajunperwira9288', 'kulfa23', 'jamesthoms', 'chandkelvin173', 'edoborne', 'taktikers', 'mkosim28', 'sofiatulkaromah98', 'cocohan.id')
  and not exists (
    select 1 from public.profile_links links
    where links.profile_id = profiles.id and links.link_type = 'tiktok'
  );

update public.profiles
set level = 'All Star'
where username in ('inproduk', 'bertosb1m', 'adli.hibatul', 'aditsur88', 'rendyherpy', 'aisyacollecion', 'ohinijuan', 'sobatkaryawan', 'apin.ketiduran', 'ajunperwira9288', 'kulfa23', 'jamesthoms', 'chandkelvin173', 'edoborne', 'taktikers', 'mkosim28', 'sofiatulkaromah98', 'cocohan.id');
