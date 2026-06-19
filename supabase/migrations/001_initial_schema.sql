-- ============================================================
-- THE AIRCONDITION SHOP — Initial Schema
-- Migration 001
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  phone           TEXT,
  company         TEXT,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('super_admin','admin','staff','trade','customer')),
  trade_status    TEXT
                  CHECK (trade_status IN ('pending','approved','rejected','suspended')),
  two_fa_enabled  BOOLEAN DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- OTP SESSIONS (2FA)
-- ============================================================
CREATE TABLE otp_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_code    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX otp_sessions_user_id_idx ON otp_sessions(user_id);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE brands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  hero_url        TEXT,
  description     TEXT,
  website_url     TEXT,
  display_order   INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  seo_title       TEXT,
  seo_desc        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- CATEGORIES (recursive)
-- ============================================================
CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       UUID REFERENCES categories(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  image_url       TEXT,
  icon            TEXT,
  display_order   INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  seo_title       TEXT,
  seo_desc        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  sku                 TEXT UNIQUE,
  model_number        TEXT,
  brand_id            UUID REFERENCES brands(id),
  category_id         UUID REFERENCES categories(id),
  description         TEXT,
  features            JSONB DEFAULT '[]',
  specifications      JSONB DEFAULT '{}',
  energy_rating       TEXT,
  btu_value           INT,
  coverage_m2         DECIMAL(10,2),
  currency            TEXT DEFAULT 'EUR',
  retail_price        DECIMAL(10,2),
  trade_price         DECIMAL(10,2),
  trade_discount_pct  DECIMAL(5,2),
  trade_price_mode    TEXT DEFAULT 'fixed'
                      CHECK (trade_price_mode IN ('fixed','discount')),
  availability        TEXT DEFAULT 'in_stock'
                      CHECK (availability IN ('in_stock','out_of_stock','on_order','discontinued')),
  is_featured         BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  display_order       INT DEFAULT 0,
  seo_title           TEXT,
  seo_desc            TEXT,
  seo_keywords        TEXT,
  view_count          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX products_slug_idx ON products(slug);
CREATE INDEX products_brand_idx ON products(brand_id);
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX products_active_idx ON products(is_active);
CREATE INDEX products_featured_idx ON products(is_featured) WHERE is_featured = TRUE;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  alt_text        TEXT,
  is_primary      BOOLEAN DEFAULT FALSE,
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT DOCUMENTS
-- ============================================================
CREATE TABLE product_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  file_size   INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  excerpt       TEXT,
  content       TEXT,
  cover_url     TEXT,
  author_id     UUID REFERENCES profiles(id),
  category      TEXT DEFAULT 'general',
  tags          TEXT[] DEFAULT '{}',
  status        TEXT DEFAULT 'draft'
                CHECK (status IN ('draft','published','scheduled','archived')),
  published_at  TIMESTAMPTZ,
  seo_title     TEXT,
  seo_desc      TEXT,
  view_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX blog_posts_status_idx ON blog_posts(status);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE testimonials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  title           TEXT,
  company         TEXT,
  content         TEXT NOT NULL,
  rating          INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAQS
-- ============================================================
CREATE TABLE faqs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  category        TEXT DEFAULT 'general',
  display_order   INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENQUIRIES
-- ============================================================
CREATE TABLE enquiries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_contact_id    UUID,                    -- linked after CRM creation
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  company           TEXT,
  message           TEXT NOT NULL,
  source            TEXT DEFAULT 'contact_form',
  status            TEXT DEFAULT 'new'
                    CHECK (status IN ('new','read','replied','archived')),
  ip_address        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX enquiries_status_idx ON enquiries(status);

-- ============================================================
-- TRADE APPLICATIONS
-- ============================================================
CREATE TABLE trade_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  company_name    TEXT NOT NULL,
  vat_number      TEXT,
  business_type   TEXT,
  address         TEXT,
  phone           TEXT,
  documents       JSONB DEFAULT '[]',
  notes           TEXT,
  admin_notes     TEXT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','suspended')),
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trade_applications_updated_at
  BEFORE UPDATE ON trade_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TECHNICIANS
-- ============================================================
CREATE TABLE technicians (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID REFERENCES profiles(id),
  name              TEXT NOT NULL,
  email             TEXT,
  phone             TEXT,
  specialisations   TEXT[] DEFAULT '{}',
  is_active         BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SERVICE REQUESTS
-- ============================================================
CREATE TABLE service_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID REFERENCES profiles(id),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  company           TEXT,
  address           TEXT,
  service_type      TEXT NOT NULL
                    CHECK (service_type IN ('installation','repair','maintenance','inspection','commercial','coldroom','other')),
  description       TEXT NOT NULL,
  preferred_date    DATE,
  preferred_time    TEXT,
  urgency           TEXT DEFAULT 'normal'
                    CHECK (urgency IN ('low','normal','high','emergency')),
  status            TEXT DEFAULT 'new'
                    CHECK (status IN ('new','reviewed','scheduled','in_progress','completed','cancelled')),
  source            TEXT DEFAULT 'website',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX service_requests_status_idx ON service_requests(status);

CREATE TRIGGER service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id  UUID REFERENCES service_requests(id),
  job_number          TEXT UNIQUE NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  customer_name       TEXT NOT NULL,
  customer_email      TEXT NOT NULL,
  customer_phone      TEXT,
  customer_address    TEXT NOT NULL,
  service_type        TEXT NOT NULL,
  technician_id       UUID REFERENCES technicians(id),
  scheduled_date      DATE,
  scheduled_time      TEXT,
  estimated_duration  INTERVAL,
  actual_start        TIMESTAMPTZ,
  actual_end          TIMESTAMPTZ,
  status              TEXT DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled','confirmed','en_route','in_progress','completed','cancelled','no_show')),
  priority            TEXT DEFAULT 'normal'
                      CHECK (priority IN ('low','normal','high','emergency')),
  notes               TEXT,
  internal_notes      TEXT,
  completion_notes    TEXT,
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX jobs_status_idx ON jobs(status);
CREATE INDEX jobs_technician_idx ON jobs(technician_id);
CREATE INDEX jobs_date_idx ON jobs(scheduled_date);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate job number
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num   INT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM jobs
  WHERE job_number LIKE 'JOB-' || year_part || '-%';
  NEW.job_number := 'JOB-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_auto_number
  BEFORE INSERT ON jobs
  FOR EACH ROW
  WHEN (NEW.job_number IS NULL OR NEW.job_number = '')
  EXECUTE FUNCTION generate_job_number();

-- ============================================================
-- JOB STATUS HISTORY
-- ============================================================
CREATE TABLE job_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  changed_by  UUID REFERENCES profiles(id),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUOTE REQUESTS
-- ============================================================
CREATE TABLE quote_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID REFERENCES profiles(id),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  company       TEXT,
  address       TEXT,
  message       TEXT NOT NULL,
  product_ids   UUID[] DEFAULT '{}',
  service_type  TEXT,
  budget_range  TEXT,
  status        TEXT DEFAULT 'new'
                CHECK (status IN ('new','reviewed','quoted','accepted','rejected','expired')),
  source        TEXT DEFAULT 'website',
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER quote_requests_updated_at
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- QUOTES
-- ============================================================
CREATE TABLE quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID REFERENCES quote_requests(id),
  quote_number    TEXT UNIQUE NOT NULL,
  created_by      UUID REFERENCES profiles(id),
  valid_until     DATE,
  subtotal        DECIMAL(10,2),
  discount_pct    DECIMAL(5,2) DEFAULT 0,
  tax_pct         DECIMAL(5,2) DEFAULT 18,
  total           DECIMAL(10,2),
  notes           TEXT,
  internal_notes  TEXT,
  status          TEXT DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  sent_at         TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num   INT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM quotes
  WHERE quote_number LIKE 'QUO-' || year_part || '-%';
  NEW.quote_number := 'QUO-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_auto_number
  BEFORE INSERT ON quotes
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL OR NEW.quote_number = '')
  EXECUTE FUNCTION generate_quote_number();

-- ============================================================
-- QUOTE ITEMS
-- ============================================================
CREATE TABLE quote_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  description     TEXT NOT NULL,
  quantity        INT DEFAULT 1,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(10,2) NOT NULL,
  display_order   INT DEFAULT 0
);

-- ============================================================
-- CRM CONTACTS
-- ============================================================
CREATE TABLE crm_contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  company       TEXT,
  address       TEXT,
  type          TEXT DEFAULT 'lead'
                CHECK (type IN ('lead','customer','trade','contractor','hotel')),
  lead_status   TEXT DEFAULT 'new'
                CHECK (lead_status IN ('new','contacted','qualified','proposal','won','lost','dormant')),
  source        TEXT,
  assigned_to   UUID REFERENCES profiles(id),
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX crm_contacts_email_idx ON crm_contacts(email);
CREATE INDEX crm_contacts_status_idx ON crm_contacts(lead_status);

CREATE TRIGGER crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- CRM NOTES
-- ============================================================
CREATE TABLE crm_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES profiles(id),
  note        TEXT NOT NULL,
  note_type   TEXT DEFAULT 'note'
              CHECK (note_type IN ('note','call','email','meeting','visit')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CRM FOLLOW-UPS
-- ============================================================
CREATE TABLE crm_followups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  assigned_to   UUID REFERENCES profiles(id),
  due_date      DATE NOT NULL,
  due_time      TIME,
  title         TEXT NOT NULL,
  notes         TEXT,
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','done','cancelled')),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX crm_followups_due_idx ON crm_followups(due_date) WHERE status = 'pending';

-- ============================================================
-- HOMEPAGE CMS SECTIONS
-- ============================================================
CREATE TABLE homepage_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  data        JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id)
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL,
  category    TEXT DEFAULT 'general',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMAIL TEMPLATES
-- ============================================================
CREATE TABLE email_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  html_body   TEXT NOT NULL,
  variables   TEXT[] DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
CREATE TABLE media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        TEXT NOT NULL,
  original_name   TEXT,
  url             TEXT NOT NULL,
  size            INT,
  mime_type       TEXT,
  width           INT,
  height          INT,
  folder          TEXT DEFAULT '/',
  alt_text        TEXT,
  tags            TEXT[] DEFAULT '{}',
  uploaded_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX media_folder_idx ON media(folder);

-- ============================================================
-- ADMIN LOGS
-- ============================================================
CREATE TABLE admin_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id),
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     TEXT,
  details       JSONB DEFAULT '{}',
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX admin_logs_user_idx ON admin_logs(user_id);
CREATE INDEX admin_logs_created_idx ON admin_logs(created_at DESC);

-- ============================================================
-- PAGE VIEWS
-- ============================================================
CREATE TABLE page_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path        TEXT NOT NULL,
  referrer    TEXT,
  country     TEXT,
  device      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX page_views_path_idx ON page_views(path);
CREATE INDEX page_views_date_idx ON page_views(created_at DESC);
