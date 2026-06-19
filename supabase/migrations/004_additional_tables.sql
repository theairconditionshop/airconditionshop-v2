-- ============================================================
-- THE AIRCONDITION SHOP — Additional Tables
-- Migration 004
-- ============================================================
-- Adds: hero_banners, social_media_links, blog_categories,
--       locations, seo_settings
-- ============================================================

-- ============================================================
-- HERO BANNERS
-- (Dedicated table — replaces hero JSON in homepage_sections)
-- ============================================================
CREATE TABLE hero_banners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  cta_primary_label   TEXT,
  cta_primary_href    TEXT,
  cta_secondary_label TEXT,
  cta_secondary_href  TEXT,
  media_url       TEXT,
  media_type      TEXT DEFAULT 'image'
                  CHECK (media_type IN ('image','video')),
  overlay_opacity DECIMAL(3,2) DEFAULT 0.45,
  text_align      TEXT DEFAULT 'center'
                  CHECK (text_align IN ('left','center','right')),
  badge_text      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  display_order   INT DEFAULT 0,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX hero_banners_active_idx ON hero_banners(is_active, display_order);

CREATE TRIGGER hero_banners_updated_at
  BEFORE UPDATE ON hero_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SOCIAL MEDIA LINKS
-- ============================================================
CREATE TABLE social_media_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform      TEXT NOT NULL UNIQUE
                CHECK (platform IN ('facebook','instagram','linkedin','twitter','youtube','tiktok','whatsapp','google')),
  url           TEXT NOT NULL,
  display_label TEXT,
  icon          TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
CREATE TABLE blog_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  display_order INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  seo_title     TEXT,
  seo_desc      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Link blog_posts to blog_categories (additive — preserves existing TEXT category column)
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS blog_category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL;

CREATE INDEX blog_posts_category_fk_idx ON blog_posts(blog_category_id);

-- ============================================================
-- LOCATIONS / SERVICE AREAS
-- ============================================================
CREATE TABLE locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  region          TEXT,
  postcode        TEXT,
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),
  description     TEXT,
  is_service_area BOOLEAN DEFAULT TRUE,
  is_active       BOOLEAN DEFAULT TRUE,
  display_order   INT DEFAULT 0,
  seo_title       TEXT,
  seo_desc        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEO SETTINGS (per-page overrides)
-- ============================================================
CREATE TABLE seo_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path       TEXT NOT NULL UNIQUE,   -- e.g. '/', '/products', '/services'
  page_label      TEXT,                   -- human label for admin UI
  meta_title      TEXT,
  meta_desc       TEXT,
  meta_keywords   TEXT,
  og_title        TEXT,
  og_desc         TEXT,
  og_image_url    TEXT,
  canonical_url   TEXT,
  no_index        BOOLEAN DEFAULT FALSE,
  structured_data JSONB,                  -- raw JSON-LD override
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      UUID REFERENCES profiles(id)
);

CREATE INDEX seo_settings_path_idx ON seo_settings(page_path);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE hero_banners      ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings      ENABLE ROW LEVEL SECURITY;

-- Hero banners — public read, admin write
CREATE POLICY "hero_banners_public_read" ON hero_banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "hero_banners_admin_all"   ON hero_banners FOR ALL    USING (is_admin());

-- Social media — public read, senior admin write
CREATE POLICY "social_public_read"  ON social_media_links FOR SELECT USING (is_active = TRUE);
CREATE POLICY "social_admin_write"  ON social_media_links FOR ALL    USING (is_senior_admin());

-- Blog categories — public read, admin write
CREATE POLICY "blog_cats_public_read" ON blog_categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "blog_cats_admin_all"   ON blog_categories FOR ALL    USING (is_admin());

-- Locations — public read, admin write
CREATE POLICY "locations_public_read" ON locations FOR SELECT USING (is_active = TRUE);
CREATE POLICY "locations_admin_all"   ON locations FOR ALL    USING (is_admin());

-- SEO settings — public read (Next.js RSC), senior admin write
CREATE POLICY "seo_public_read"  ON seo_settings FOR SELECT USING (TRUE);
CREATE POLICY "seo_admin_write"  ON seo_settings FOR ALL    USING (is_senior_admin());

-- ============================================================
-- SEED DATA
-- ============================================================

-- Hero banner (initial)
INSERT INTO hero_banners (title, subtitle, description, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, media_type, overlay_opacity, is_active, display_order)
VALUES (
  'Malta''s Premier HVAC & Refrigeration Specialists',
  'Professional Climate Control',
  'Premium air conditioning, refrigeration and climate control solutions for homes, hotels and commercial spaces across Malta.',
  'Explore Products', '/products',
  'Get a Quote',      '/quote',
  'image', 0.45, TRUE, 0
) ON CONFLICT DO NOTHING;

-- Social media links
INSERT INTO social_media_links (platform, url, display_label, is_active, display_order) VALUES
('facebook',  'https://facebook.com/theairconditionshop',  'Facebook',  TRUE, 1),
('instagram', 'https://instagram.com/theairconditionshop', 'Instagram', TRUE, 2),
('linkedin',  '',                                           'LinkedIn',  FALSE, 3)
ON CONFLICT (platform) DO NOTHING;

-- Blog categories
INSERT INTO blog_categories (name, slug, description, display_order, is_active) VALUES
('Tips & Guides',    'tips-guides',    'Helpful tips and how-to guides',               1, TRUE),
('Product News',     'product-news',   'New arrivals and product updates',             2, TRUE),
('Industry News',    'industry-news',  'HVAC and refrigeration industry news',         3, TRUE),
('Case Studies',     'case-studies',   'Real installation and project case studies',   4, TRUE),
('Maintenance',      'maintenance',    'Service and maintenance advice',               5, TRUE),
('Trade Resources',  'trade-resources','Resources for contractors and installers',     6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Locations / service areas in Malta
INSERT INTO locations (name, slug, region, is_service_area, is_active, display_order) VALUES
('Mosta',       'mosta',       'Northern',  TRUE, TRUE,  1),
('Valletta',    'valletta',    'Central',   TRUE, TRUE,  2),
('Sliema',      'sliema',      'Central',   TRUE, TRUE,  3),
('St. Julian''s','st-julians',  'Central',   TRUE, TRUE,  4),
('Birkirkara',  'birkirkara',  'Central',   TRUE, TRUE,  5),
('Qormi',       'qormi',       'Southern',  TRUE, TRUE,  6),
('Żabbar',      'zabbar',      'Southern',  TRUE, TRUE,  7),
('Marsaskala',  'marsaskala',  'Southern',  TRUE, TRUE,  8),
('Mellieħa',    'mellieha',    'Northern',  TRUE, TRUE,  9),
('Naxxar',      'naxxar',      'Northern',  TRUE, TRUE, 10),
('San Ġwann',   'san-gwann',   'Central',   TRUE, TRUE, 11),
('Msida',       'msida',       'Central',   TRUE, TRUE, 12),
('Paola',       'paola',       'Southern',  TRUE, TRUE, 13),
('Rabat',       'rabat',       'Western',   TRUE, TRUE, 14),
('Mdina',       'mdina',       'Western',   TRUE, TRUE, 15),
('Gozo',        'gozo',        'Gozo',      TRUE, TRUE, 16)
ON CONFLICT (slug) DO NOTHING;

-- SEO settings for key pages
INSERT INTO seo_settings (page_path, page_label, meta_title, meta_desc, meta_keywords, no_index) VALUES
('/',
 'Homepage',
 'THE AIRCONDITION SHOP | HVAC & Refrigeration Malta',
 'Premium air conditioning, refrigeration and HVAC solutions in Malta. Daikin, Mitsubishi Electric, Panasonic and more. Expert installation and service.',
 'air conditioning Malta, HVAC Malta, refrigeration Malta, Daikin Malta, air con installation Malta',
 FALSE),
('/products',
 'Products',
 'Air Conditioning & Refrigeration Products | THE AIRCONDITION SHOP Malta',
 'Browse our full range of air conditioning, heat pumps, VRF systems and commercial refrigeration equipment available in Malta.',
 'air conditioners Malta, heat pumps Malta, VRF systems Malta, refrigeration equipment Malta',
 FALSE),
('/services',
 'Services',
 'HVAC Installation, Maintenance & Repair Services | Malta',
 'Professional HVAC installation, maintenance and emergency repair services across Malta. Certified engineers, fast response.',
 'air conditioning installation Malta, HVAC maintenance Malta, AC repair Malta',
 FALSE),
('/trade',
 'Trade',
 'Trade Accounts for HVAC Contractors | THE AIRCONDITION SHOP',
 'Apply for a trade account and access exclusive trade pricing on air conditioning, refrigeration and HVAC equipment.',
 'trade account Malta, HVAC contractor Malta, wholesale air conditioning Malta',
 FALSE),
('/about',
 'About Us',
 'About THE AIRCONDITION SHOP | HVAC Specialists Malta',
 'Learn about THE AIRCONDITION SHOP — Malta''s leading HVAC and refrigeration specialists.',
 'about THE AIRCONDITION SHOP, HVAC Malta company',
 FALSE),
('/contact',
 'Contact',
 'Contact Us | THE AIRCONDITION SHOP Malta',
 'Get in touch with THE AIRCONDITION SHOP. Call +356 7966 1889 or email us for sales, service and support.',
 'contact THE AIRCONDITION SHOP, HVAC Malta contact',
 FALSE),
('/quote',
 'Request a Quote',
 'Request a Free Quote | THE AIRCONDITION SHOP Malta',
 'Request a free, no-obligation quote for air conditioning installation or refrigeration equipment in Malta.',
 'air conditioning quote Malta, HVAC quote Malta, free quote Malta',
 FALSE),
('/blog',
 'Blog',
 'HVAC & Refrigeration Blog | THE AIRCONDITION SHOP Malta',
 'Tips, guides, industry news and case studies from Malta''s HVAC specialists.',
 'HVAC blog Malta, air conditioning tips Malta',
 FALSE)
ON CONFLICT (page_path) DO NOTHING;
