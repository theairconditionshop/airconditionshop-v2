-- ============================================================
-- SEED DATA
-- Migration 003
-- ============================================================

-- ── SITE SETTINGS ───────────────────────────────────────────
INSERT INTO site_settings (key, value, category) VALUES
('company_name',    '"THE AIRCONDITION SHOP"',                        'general'),
('company_phone',   '"+356 7966 1889"',                               'general'),
('company_email',   '"support@theairconditionshop.com"',              'general'),
('company_address', '"220 Vjal L-Indipendenza, Mosta MST 9022, Malta"','general'),
('company_hours',   '{"mon_fri": "08:00–18:00", "sat": "09:00–13:00", "sun": "Closed"}', 'general'),
('social_facebook', '"https://facebook.com/theairconditionshop"',     'social'),
('social_instagram','"https://instagram.com/theairconditionshop"',    'social'),
('social_linkedin', '""',                                             'social'),
('google_maps_url', '"https://maps.google.com/?q=220+Vjal+L-Indipendenza+Mosta+Malta"', 'general'),
('maintenance_mode','false',                                          'general'),
('site_tagline',    '"Malta''s Premium HVAC & Refrigeration Specialists"', 'seo'),
('default_seo_title','"THE AIRCONDITION SHOP | HVAC & Refrigeration Malta"', 'seo'),
('default_seo_desc', '"Premium air conditioning, refrigeration and HVAC solutions in Malta. Daikin, Mitsubishi Electric, Panasonic and more. Expert installation and service."', 'seo')
ON CONFLICT (key) DO NOTHING;

-- ── HOMEPAGE SECTIONS ───────────────────────────────────────
INSERT INTO homepage_sections (section_key, data) VALUES
('hero', '{
  "type": "image",
  "headline": "Malta''s Premier HVAC & Refrigeration Specialists",
  "description": "Premium air conditioning, refrigeration and climate control solutions for homes, hotels and commercial spaces across Malta.",
  "cta_primary": {"label": "Explore Products", "href": "/products"},
  "cta_secondary": {"label": "Get a Quote", "href": "/quote"},
  "media_url": "",
  "overlay_opacity": 0.45
}'),
('why_choose_us', '{
  "heading": "Why Choose THE AIRCONDITION SHOP",
  "items": [
    {"icon": "shield-check", "title": "Authorised Dealer", "description": "Official dealer for Daikin, Mitsubishi Electric, Panasonic and more premium brands."},
    {"icon": "wrench", "title": "Expert Installation", "description": "Certified engineers with years of experience in residential and commercial HVAC."},
    {"icon": "clock", "title": "Fast Response", "description": "Quick turnaround on installations, repairs and emergency call-outs across Malta."},
    {"icon": "star", "title": "Premium Quality", "description": "Only the highest-quality products from world-leading manufacturers."}
  ]
}'),
('services', '{
  "heading": "Our Services",
  "items": [
    {"icon": "thermometer", "title": "Air Conditioning Installation", "description": "Professional installation of split, multi-split and VRF systems."},
    {"icon": "snowflake", "title": "Refrigeration", "description": "Commercial refrigeration, cold rooms, freezers and fridges for businesses."},
    {"icon": "tool", "title": "Maintenance & Service", "description": "Scheduled maintenance and emergency repairs to keep your systems running."},
    {"icon": "building", "title": "Commercial Projects", "description": "Large-scale HVAC solutions for hotels, restaurants and commercial buildings."}
  ]
}'),
('cta', '{
  "heading": "Ready to get started?",
  "description": "Request a free quote or get in touch with our team today.",
  "cta_primary": {"label": "Request a Quote", "href": "/quote"},
  "cta_secondary": {"label": "Contact Us", "href": "/contact"}
}'),
('testimonials_section', '{
  "heading": "What Our Customers Say",
  "description": "Trusted by homeowners, hotels and businesses across Malta."
}'),
('faq_section', '{
  "heading": "Frequently Asked Questions",
  "description": "Everything you need to know about air conditioning and refrigeration."
}')
ON CONFLICT (section_key) DO NOTHING;

-- ── BRANDS ──────────────────────────────────────────────────
INSERT INTO brands (name, slug, display_order, is_active) VALUES
('Daikin',              'daikin',              1, TRUE),
('Mitsubishi Electric', 'mitsubishi-electric',  2, TRUE),
('Panasonic',           'panasonic',            3, TRUE),
('Toshiba',             'toshiba',              4, TRUE),
('Fujitsu',             'fujitsu',              5, TRUE),
('Gree',                'gree',                 6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ── CATEGORIES ──────────────────────────────────────────────
INSERT INTO categories (name, slug, display_order, is_active) VALUES
('Air Conditioners',      'air-conditioners',      1, TRUE),
('Multi-Split Systems',   'multi-split-systems',   2, TRUE),
('VRF Systems',           'vrf-systems',           3, TRUE),
('Heat Pumps',            'heat-pumps',            4, TRUE),
('Ventilation',           'ventilation',           5, TRUE),
('Air Curtains',          'air-curtains',          6, TRUE),
('Commercial Refrigeration','commercial-refrigeration', 7, TRUE),
('Cold Rooms',            'cold-rooms',            8, TRUE),
('Freezers & Fridges',    'freezers-fridges',      9, TRUE),
('HVAC Tools',            'hvac-tools',           10, TRUE),
('Copper Pipes',          'copper-pipes',         11, TRUE),
('Refrigerants',          'refrigerants',         12, TRUE),
('Accessories',           'accessories',          13, TRUE),
('Spare Parts',           'spare-parts',          14, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ── FAQS ────────────────────────────────────────────────────
INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES
('How do I choose the right air conditioner size?',
 'The right size depends on the room dimensions, insulation, sun exposure and number of occupants. Use our BTU Calculator for an instant recommendation, or contact us for a free site survey.',
 'buying', 1, TRUE),
('Do you offer installation services?',
 'Yes — we provide professional installation by certified engineers for all products we sell. Installation can be booked at the same time as your purchase.',
 'installation', 2, TRUE),
('What brands do you stock?',
 'We are authorised dealers for Daikin, Mitsubishi Electric, Panasonic, Toshiba, Fujitsu and Gree, among others. Contact us if you are looking for a specific brand.',
 'general', 3, TRUE),
('Do you service commercial properties?',
 'Yes — we handle commercial HVAC for hotels, restaurants, offices and large industrial spaces including VRF systems and cold rooms.',
 'commercial', 4, TRUE),
('How do I apply for a trade account?',
 'Installers and contractors can apply for a trade account online. Once approved, you will have access to trade pricing across our entire product range.',
 'trade', 5, TRUE),
('What is your warranty policy?',
 'All products come with the manufacturer warranty. We also offer extended service contracts for commercial installations.',
 'general', 6, TRUE)
ON CONFLICT DO NOTHING;

-- ── TESTIMONIALS ────────────────────────────────────────────
INSERT INTO testimonials (name, title, company, content, rating, display_order, is_active) VALUES
('Mark Borg',      'Property Manager', 'Borg Properties Ltd',
 'Excellent service from start to finish. The team installed 8 units across our building on time and with minimal disruption. Highly recommended.',
 5, 1, TRUE),
('Sandra Camilleri', 'Hotel Manager', 'The Mosta Hotel',
 'We had THE AIRCONDITION SHOP install a full VRF system in our hotel. Professional, clean and efficient. The system has been faultless.',
 5, 2, TRUE),
('Joseph Farrugia', 'Homeowner', NULL,
 'Straightforward process from quote to installation. Got a great Daikin system at a competitive price. The engineers were polite and tidy.',
 5, 3, TRUE)
ON CONFLICT DO NOTHING;

-- ── EMAIL TEMPLATES ─────────────────────────────────────────
INSERT INTO email_templates (key, name, subject, html_body, variables) VALUES
('contact_enquiry_user',
 'Contact Form — Auto Reply',
 'We received your message — THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Thank you for contacting THE AIRCONDITION SHOP. We have received your message and will be in touch within 1 business day.</p><p>If your enquiry is urgent, please call us on <strong>+356 7966 1889</strong>.</p><p>Kind regards,<br>THE AIRCONDITION SHOP Team</p>',
 ARRAY['name', 'email', 'message']),

('contact_enquiry_admin',
 'Contact Form — Admin Notification',
 'New contact enquiry from {{name}}',
 '<p>A new enquiry has been submitted:</p><p><strong>Name:</strong> {{name}}<br><strong>Email:</strong> {{email}}<br><strong>Phone:</strong> {{phone}}<br><strong>Company:</strong> {{company}}<br><strong>Message:</strong> {{message}}</p>',
 ARRAY['name', 'email', 'phone', 'company', 'message']),

('quote_request_user',
 'Quote Request — Confirmation',
 'Your quote request — THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Thank you for your quote request. Our team will review your requirements and send you a detailed quote within 2 business days.</p><p>Kind regards,<br>THE AIRCONDITION SHOP Team</p>',
 ARRAY['name', 'email', 'message']),

('quote_request_admin',
 'Quote Request — Admin Notification',
 'New quote request from {{name}}',
 '<p>A new quote request has been submitted by {{name}} ({{email}}).</p><p>Please review in the admin panel.</p>',
 ARRAY['name', 'email', 'company', 'message']),

('quote_sent',
 'Your Quote — THE AIRCONDITION SHOP',
 'Your quote {{quote_number}} from THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Please find your quote <strong>{{quote_number}}</strong> attached.</p><p><strong>Total: {{total}}</strong><br>Valid until: {{valid_until}}</p><p>To accept this quote or ask questions, please reply to this email or call us on +356 7966 1889.</p>',
 ARRAY['name', 'quote_number', 'total', 'valid_until', 'notes']),

('service_booked_user',
 'Service Booking Confirmation',
 'Your service booking — {{job_number}}',
 '<p>Dear {{customer_name}},</p><p>Your service booking has been confirmed.</p><p><strong>Job Reference:</strong> {{job_number}}<br><strong>Date:</strong> {{scheduled_date}}<br><strong>Time:</strong> {{scheduled_time}}<br><strong>Technician:</strong> {{technician_name}}</p><p>If you need to reschedule, please call +356 7966 1889.</p>',
 ARRAY['customer_name', 'job_number', 'scheduled_date', 'scheduled_time', 'technician_name']),

('trade_application_user',
 'Trade Application Received',
 'Your trade application — THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Thank you for applying for a trade account with THE AIRCONDITION SHOP. We will review your application and notify you within 2 business days.</p>',
 ARRAY['name', 'company_name']),

('trade_application_admin',
 'Trade Application — Admin Notification',
 'New trade application from {{company_name}}',
 '<p>A new trade application has been submitted by {{name}} from {{company_name}}. Please review in the admin panel.</p>',
 ARRAY['name', 'company_name', 'email']),

('trade_approved',
 'Trade Account Approved',
 'Your trade account has been approved — THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Congratulations! Your trade account with THE AIRCONDITION SHOP has been approved. You can now log in to view trade prices across our full product range.</p><p>Login at: <a href="https://theairconditionshop.com/login">theairconditionshop.com/login</a></p>',
 ARRAY['name', 'email']),

('trade_rejected',
 'Trade Application Update',
 'Regarding your trade application — THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Thank you for your interest in a trade account. Unfortunately, we are unable to approve your application at this time. Please contact us on +356 7966 1889 to discuss further.</p>',
 ARRAY['name', 'reason']),

('otp_code',
 '2FA Login Code',
 'Your login verification code — THE AIRCONDITION SHOP',
 '<p>Your verification code is:</p><h1 style="font-size:48px;letter-spacing:8px;font-weight:bold;">{{code}}</h1><p>This code expires in 10 minutes. Do not share it with anyone.</p>',
 ARRAY['code', 'name']),

('password_reset',
 'Password Reset',
 'Reset your password — THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="{{reset_url}}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>',
 ARRAY['name', 'reset_url']),

('welcome_customer',
 'Welcome to THE AIRCONDITION SHOP',
 'Welcome to THE AIRCONDITION SHOP',
 '<p>Dear {{name}},</p><p>Welcome! Your account has been created. You can now save favourites, track enquiries and manage your details.</p><p><a href="https://theairconditionshop.com/account">View your account</a></p>',
 ARRAY['name', 'email'])

ON CONFLICT (key) DO NOTHING;
