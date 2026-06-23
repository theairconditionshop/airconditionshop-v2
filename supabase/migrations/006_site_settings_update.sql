-- ============================================================
-- THE AIRCONDITION SHOP — Site Settings Update
-- Migration 006
-- ============================================================
-- Adds: legal_name, vat_number, google_review_url,
--       individual opening hour keys, copyright_text
-- Fixes: Saturday hours (08:00–14:00 per source of truth)
-- Removes: fake seed testimonials
-- ============================================================

-- ── Add missing site_settings keys ──────────────────────────
INSERT INTO site_settings (key, value, category) VALUES
('legal_name',              '"AS GROUP"',                                   'general'),
('vat_number',              '"MT3103-8724"',                                'general'),
('google_review_url',       '"https://g.page/r/CdjWGAZmBi4pEAE/review"',   'social'),
('company_hours_weekday',   '"08:00–18:00"',                               'general'),
('company_hours_saturday',  '"08:00–14:00"',                               'general'),
('company_hours_sunday',    '"Closed"',                                    'general'),
('copyright_text',          '"THE AIRCONDITION SHOP. All rights reserved."','general')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ── Fix Saturday hours in the legacy company_hours JSON ─────
UPDATE site_settings
SET value = '{"mon_fri": "08:00–18:00", "sat": "08:00–14:00", "sun": "Closed"}'
WHERE key = 'company_hours';

-- ── Clear LinkedIn (does not exist) ─────────────────────────
UPDATE site_settings SET value = '""' WHERE key = 'social_linkedin';

-- ── Delete fake seed testimonials ───────────────────────────
DELETE FROM testimonials
WHERE name IN ('Mark Borg', 'Sandra Camilleri', 'Joseph Farrugia');
