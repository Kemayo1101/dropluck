-- =============================================
-- DROPLUCK — Schema Supabase complet
-- Coller dans Dashboard Supabase → SQL Editor → Run
-- =============================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: profiles (utilisateurs)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  tirages_restants INTEGER DEFAULT 2,
  total_tirages INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: themes
-- =============================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  designs_count INTEGER DEFAULT 0,
  tag TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: designs
-- =============================================
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image_url TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'legendary')) DEFAULT 'common',
  probability FLOAT DEFAULT 0.7,
  downloads_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: draw_history (historique tirages)
-- =============================================
CREATE TABLE IF NOT EXISTS draw_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  design_id UUID REFERENCES designs(id),
  theme_id UUID REFERENCES themes(id),
  rarity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: favorites
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, design_id)
);

-- =============================================
-- TABLE: downloads
-- =============================================
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  design_id UUID REFERENCES designs(id),
  shirt_color TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: payments
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  method TEXT CHECK (method IN ('wave', 'orange_money')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  tirages_added INTEGER DEFAULT 1,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: referrals
-- =============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tirage_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- =============================================
-- TABLE: reviews (avis)
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: site_stats (analytics admin)
-- =============================================
CREATE TABLE IF NOT EXISTS site_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  visitors INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: chaque user voit uniquement son profil
CREATE POLICY "users_own_profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Draw history: chaque user voit son historique
CREATE POLICY "users_own_draws" ON draw_history FOR ALL USING (auth.uid() = user_id);

-- Favorites: chaque user gère ses favoris
CREATE POLICY "users_own_favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Downloads: chaque user voit ses téléchargements
CREATE POLICY "users_own_downloads" ON downloads FOR ALL USING (auth.uid() = user_id);

-- Payments: chaque user voit ses paiements
CREATE POLICY "users_own_payments" ON payments FOR ALL USING (auth.uid() = user_id);

-- Reviews: lecture publique, écriture par owner
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_write" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_update" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Themes et Designs: lecture publique
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "themes_public_read" ON themes FOR SELECT USING (true);
CREATE POLICY "designs_public_read" ON designs FOR SELECT USING (true);

-- =============================================
-- TRIGGER: créer profil automatiquement
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- DONNÉES DE DÉMONSTRATION
-- =============================================

-- Thèmes
INSERT INTO themes (slug, name, emoji, description, tag, designs_count) VALUES
('streetwear', 'Streetwear Urbain', '🧢', 'Designs urbains tendance pour les amateurs de street culture', 'TENDANCE', 58),
('christianisme', 'Christianisme & Spiritualité', '✝️', 'Designs inspirés de la foi chrétienne et de la spiritualité', 'INSPIRANT', 47),
('motivation', 'Motivation Gagnante', '⚡', 'Designs motivants pour les gagnants et les ambitieux', 'POPULAIRE', 62),
('anime', 'Anime & Manga', '⛩️', 'Designs inspirés des animes et mangas japonais', 'VIRAL', 74)
ON CONFLICT (slug) DO NOTHING;

-- Designs Streetwear
INSERT INTO designs (theme_id, name, emoji, rarity, probability) 
SELECT t.id, d.name, d.emoji, d.rarity, d.prob
FROM themes t, (VALUES
  ('HUSTLE MODE ON', '🔥', 'legendary', 0.15),
  ('NO DAYS OFF', '💪', 'common', 0.7),
  ('STREETS NEVER SLEEP', '🌃', 'legendary', 0.15),
  ('DRIP OR DROWN', '💧', 'common', 0.7),
  ('BORN IN THE CITY', '🏙️', 'common', 0.7),
  ('STAY FRESH', '✨', 'common', 0.7),
  ('URBAN KING', '👑', 'legendary', 0.15),
  ('COLD WORLD', '❄️', 'common', 0.7)
) AS d(name, emoji, rarity, prob)
WHERE t.slug = 'streetwear'
ON CONFLICT DO NOTHING;

-- Designs Christianisme
INSERT INTO designs (theme_id, name, emoji, rarity, probability)
SELECT t.id, d.name, d.emoji, d.rarity, d.prob
FROM themes t, (VALUES
  ('GOD IS MY ARMOR', '✝️', 'legendary', 0.15),
  ('FAITH OVER FEAR', '🙏', 'common', 0.7),
  ('BLESSED & FOCUSED', '☀️', 'legendary', 0.15),
  ('HIS GRACE', '🕊️', 'common', 0.7),
  ('PRAY WITHOUT CEASING', '📖', 'common', 0.7),
  ('CHOSEN ONE', '⭐', 'legendary', 0.15),
  ('WALK BY FAITH', '🌿', 'common', 0.7),
  ('HE IS RISEN', '🌅', 'legendary', 0.15)
) AS d(name, emoji, rarity, prob)
WHERE t.slug = 'christianisme'
ON CONFLICT DO NOTHING;

-- Designs Motivation
INSERT INTO designs (theme_id, name, emoji, rarity, probability)
SELECT t.id, d.name, d.emoji, d.rarity, d.prob
FROM themes t, (VALUES
  ('BORN TO WIN', '🏆', 'legendary', 0.15),
  ('GRIND TIME', '⚡', 'common', 0.7),
  ('KING MENTALITY', '👑', 'legendary', 0.15),
  ('LEVEL UP', '🚀', 'common', 0.7),
  ('NO EXCUSES', '💯', 'common', 0.7),
  ('LION MODE', '🦁', 'legendary', 0.15),
  ('EAT OR BE EATEN', '🔱', 'common', 0.7),
  ('BUILT DIFFERENT', '⚔️', 'legendary', 0.15)
) AS d(name, emoji, rarity, prob)
WHERE t.slug = 'motivation'
ON CONFLICT DO NOTHING;

-- Designs Anime
INSERT INTO designs (theme_id, name, emoji, rarity, probability)
SELECT t.id, d.name, d.emoji, d.rarity, d.prob
FROM themes t, (VALUES
  ('AKATSUKI VIBES', '🌙', 'legendary', 0.15),
  ('SAIYAN SPIRIT', '⚡', 'common', 0.7),
  ('DEMON SLAYER', '🗡️', 'legendary', 0.15),
  ('NARUTO MODE', '🦊', 'common', 0.7),
  ('PLUS ULTRA', '💪', 'legendary', 0.15),
  ('TITAN SHIFT', '🔥', 'common', 0.7),
  ('ISEKAI DREAMS', '🌸', 'common', 0.7),
  ('ONE PUNCH', '👊', 'legendary', 0.15)
) AS d(name, emoji, rarity, prob)
WHERE t.slug = 'anime'
ON CONFLICT DO NOTHING;

-- Avis démo
INSERT INTO reviews (user_id, rating, comment)
SELECT p.id, 5, 'J''ai eu un design Légendaire au premier tirage ! L''animation est incroyable 😱'
FROM profiles p LIMIT 1
ON CONFLICT DO NOTHING;
