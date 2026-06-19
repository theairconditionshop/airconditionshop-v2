-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- Migration 002
-- ============================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands            ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians       ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_followups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE media             ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views        ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin/staff?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin','admin','staff')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: is current user super_admin or admin?
CREATE OR REPLACE FUNCTION is_senior_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin','admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── PROFILES ────────────────────────────────────────────────
CREATE POLICY "profiles_read_own"    ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_admin_all"   ON profiles FOR ALL    USING (is_admin());

-- ── OTP SESSIONS ────────────────────────────────────────────
CREATE POLICY "otp_admin_only" ON otp_sessions FOR ALL USING (is_admin());

-- ── BRANDS ──────────────────────────────────────────────────
CREATE POLICY "brands_public_read"  ON brands FOR SELECT USING (is_active = TRUE);
CREATE POLICY "brands_admin_all"    ON brands FOR ALL    USING (is_admin());

-- ── CATEGORIES ──────────────────────────────────────────────
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "categories_admin_all"   ON categories FOR ALL    USING (is_admin());

-- ── PRODUCTS ────────────────────────────────────────────────
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_admin_all"   ON products FOR ALL    USING (is_admin());

-- ── PRODUCT IMAGES ──────────────────────────────────────────
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "product_images_admin_all"   ON product_images FOR ALL    USING (is_admin());

-- ── PRODUCT DOCUMENTS ───────────────────────────────────────
CREATE POLICY "product_docs_public_read" ON product_documents FOR SELECT USING (TRUE);
CREATE POLICY "product_docs_admin_all"   ON product_documents FOR ALL    USING (is_admin());

-- ── BLOG POSTS ──────────────────────────────────────────────
CREATE POLICY "blog_public_read"  ON blog_posts FOR SELECT USING (status = 'published' AND published_at <= NOW());
CREATE POLICY "blog_admin_all"    ON blog_posts FOR ALL    USING (is_admin());

-- ── TESTIMONIALS ────────────────────────────────────────────
CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT USING (is_active = TRUE);
CREATE POLICY "testimonials_admin_all"   ON testimonials FOR ALL    USING (is_admin());

-- ── FAQS ────────────────────────────────────────────────────
CREATE POLICY "faqs_public_read" ON faqs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "faqs_admin_all"   ON faqs FOR ALL    USING (is_admin());

-- ── ENQUIRIES ───────────────────────────────────────────────
CREATE POLICY "enquiries_public_insert" ON enquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "enquiries_admin_all"     ON enquiries FOR ALL    USING (is_admin());

-- ── TRADE APPLICATIONS ──────────────────────────────────────
CREATE POLICY "trade_app_insert"    ON trade_applications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "trade_app_read_own"  ON trade_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "trade_app_admin_all" ON trade_applications FOR ALL    USING (is_admin());

-- ── TECHNICIANS ─────────────────────────────────────────────
CREATE POLICY "technicians_admin_all" ON technicians FOR ALL USING (is_admin());

-- ── SERVICE REQUESTS ────────────────────────────────────────
CREATE POLICY "service_req_public_insert"  ON service_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "service_req_read_own"       ON service_requests FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "service_req_admin_all"      ON service_requests FOR ALL    USING (is_admin());

-- ── JOBS ────────────────────────────────────────────────────
CREATE POLICY "jobs_admin_all" ON jobs FOR ALL USING (is_admin());

-- ── JOB STATUS HISTORY ──────────────────────────────────────
CREATE POLICY "job_history_admin_all" ON job_status_history FOR ALL USING (is_admin());

-- ── QUOTE REQUESTS ──────────────────────────────────────────
CREATE POLICY "quote_req_public_insert" ON quote_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "quote_req_read_own"      ON quote_requests FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "quote_req_admin_all"     ON quote_requests FOR ALL    USING (is_admin());

-- ── QUOTES ──────────────────────────────────────────────────
CREATE POLICY "quotes_admin_all" ON quotes FOR ALL USING (is_admin());

-- ── QUOTE ITEMS ─────────────────────────────────────────────
CREATE POLICY "quote_items_admin_all" ON quote_items FOR ALL USING (is_admin());

-- ── CRM ─────────────────────────────────────────────────────
CREATE POLICY "crm_contacts_admin_all"  ON crm_contacts  FOR ALL USING (is_admin());
CREATE POLICY "crm_notes_admin_all"     ON crm_notes     FOR ALL USING (is_admin());
CREATE POLICY "crm_followups_admin_all" ON crm_followups FOR ALL USING (is_admin());

-- ── HOMEPAGE SECTIONS ───────────────────────────────────────
CREATE POLICY "homepage_public_read" ON homepage_sections FOR SELECT USING (TRUE);
CREATE POLICY "homepage_admin_write" ON homepage_sections FOR ALL    USING (is_admin());

-- ── SITE SETTINGS ───────────────────────────────────────────
CREATE POLICY "settings_public_read"  ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_write"  ON site_settings FOR ALL    USING (is_senior_admin());

-- ── EMAIL TEMPLATES ─────────────────────────────────────────
CREATE POLICY "email_templates_admin_all" ON email_templates FOR ALL USING (is_senior_admin());

-- ── MEDIA ───────────────────────────────────────────────────
CREATE POLICY "media_auth_read"   ON media FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "media_admin_write" ON media FOR ALL    USING (is_admin());

-- ── ADMIN LOGS ──────────────────────────────────────────────
CREATE POLICY "admin_logs_admin_read" ON admin_logs FOR SELECT USING (is_admin());
CREATE POLICY "admin_logs_insert"     ON admin_logs FOR INSERT WITH CHECK (is_admin());

-- ── PAGE VIEWS ──────────────────────────────────────────────
CREATE POLICY "page_views_public_insert" ON page_views FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "page_views_admin_read"    ON page_views FOR SELECT USING (is_admin());
