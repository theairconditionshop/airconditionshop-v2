# THE AIRCONDITION SHOP — BUILD PLAN v2

**Domain:** theairconditionshop.com  
**Business:** Premium HVAC & Refrigeration — Malta  
**Status:** Architecture Approved — Ready for Phase 1

---

## 1. TECH STACK

| Layer | Technology | Reason |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR/SSG/ISR, RSC, best-in-class SEO, image optimisation |
| Language | **TypeScript 5** | Type safety across the entire codebase |
| Styling | **Tailwind CSS v4** | Utility-first, no CSS bloat, excellent purge |
| Animations | **Framer Motion 11** | Smooth, GPU-accelerated, tree-shakeable |
| Database | **Supabase (PostgreSQL)** | Realtime, RLS, auth, storage — all-in-one |
| Auth | **Supabase Auth** | Email+Password, Email OTP 2FA, session management, RLS |
| Storage | **Supabase Storage** | Images, PDFs, brand logos — served via CDN |
| Email | **Resend + React Email** | Transactional emails, beautiful templates |
| CMS | **Custom Admin Panel** | Built-in, no third-party CMS dependency |
| Forms | **React Hook Form + Zod** | Validation, type-safe, performant |
| State | **Zustand** | Lightweight client state |
| Cache | **Next.js ISR + React cache()** | Per-page revalidation, zero cold starts |
| Images | **Next.js Image + Supabase CDN** | WebP, AVIF, lazy loading, blur placeholder |
| SEO | **next-sitemap + JSON-LD** | Automatic sitemap, structured data |
| Analytics | **Vercel Analytics + custom DB** | Privacy-first, no cookie consent needed |
| Deployment | **Vercel** | Edge network, automatic HTTPS, preview deploys |
| Package Manager | **pnpm** | Fast, disk-efficient |

---

## 2. FOLDER STRUCTURE

```
airconditionshop/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── category/[slug]/page.tsx
│   │   ├── brands/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── services/page.tsx               # Public service info
│   │   ├── btu-calculator/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── quote/page.tsx                  # Public quote request
│   │   ├── trade/
│   │   │   ├── page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── account/
│   │   │   ├── page.tsx                    # Customer account
│   │   │   └── orders/page.tsx
│   │   ├── about/page.tsx
│   │   └── legal/
│   │       ├── privacy/page.tsx
│   │       └── terms/page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx                  # Email + Password
│   │   ├── register/page.tsx               # Optional customer account
│   │   ├── verify-otp/page.tsx             # 2FA OTP step (admin/staff)
│   │   ├── reset-password/page.tsx
│   │   └── auth/callback/route.ts
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # Dashboard
│   │   ├── analytics/page.tsx
│   │   ├── homepage/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── blog/
│   │   ├── services/
│   │   │   ├── page.tsx                    # Service requests list
│   │   │   ├── jobs/page.tsx               # Jobs board
│   │   │   ├── technicians/page.tsx        # Technician management
│   │   │   ├── schedule/page.tsx           # Calendar view
│   │   │   └── [id]/page.tsx               # Single job detail
│   │   ├── quotes/
│   │   │   ├── page.tsx                    # Quote list
│   │   │   └── [id]/page.tsx               # Quote detail + respond
│   │   ├── crm/
│   │   │   ├── page.tsx                    # Leads / customers list
│   │   │   ├── leads/page.tsx
│   │   │   └── [id]/page.tsx               # Customer profile + notes
│   │   ├── trade/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── enquiries/page.tsx
│   │   ├── media/page.tsx
│   │   ├── users/page.tsx                  # User management (super_admin)
│   │   └── settings/
│   │       ├── general/page.tsx
│   │       ├── seo/page.tsx
│   │       └── emails/page.tsx
│   │
│   └── api/
│       ├── contact/route.ts
│       ├── quote/route.ts
│       ├── trade/apply/route.ts
│       ├── services/book/route.ts
│       ├── btu/calculate/route.ts
│       ├── revalidate/route.ts
│       └── webhooks/resend/route.ts
│
├── components/
│   ├── ui/                                 # Primitive UI (Button, Input, Badge…)
│   ├── layout/                             # Navbar, Footer, Breadcrumb
│   ├── sections/                           # Homepage sections
│   ├── products/                           # Product card, grid, filters
│   ├── services/                           # Service booking form, status badge
│   ├── quotes/                             # Quote request form
│   ├── crm/                                # Note, follow-up components
│   ├── admin/                              # Admin shell components
│   └── shared/                             # SEO, JSON-LD, Analytics
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── admin.ts
│   ├── auth/
│   │   ├── session.ts                      # Role extraction helpers
│   │   ├── otp.ts                          # 2FA OTP helpers
│   │   └── permissions.ts                  # Role permission matrix
│   ├── resend/
│   │   ├── client.ts
│   │   └── templates/
│   │       ├── contact-enquiry.tsx
│   │       ├── quote-request.tsx
│   │       ├── quote-response.tsx
│   │       ├── service-booked.tsx
│   │       ├── service-update.tsx
│   │       ├── trade-application.tsx
│   │       ├── trade-approved.tsx
│   │       ├── trade-rejected.tsx
│   │       ├── password-reset.tsx
│   │       └── admin-notification.tsx
│   ├── pricing/
│   │   └── resolver.ts                     # Retail vs trade price logic
│   ├── validations/
│   ├── btu/
│   ├── seo/
│   └── utils.ts
│
├── types/
│   ├── database.ts
│   ├── product.ts
│   ├── service.ts
│   ├── quote.ts
│   ├── crm.ts
│   └── auth.ts
│
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── supabase/
    ├── migrations/
    └── seed.sql
```

---

## 3. DATABASE SCHEMA

### 3.1 Users & Auth

```sql
-- PROFILES (extends Supabase auth.users)
profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id),
  email           text NOT NULL,
  full_name       text,
  phone           text,
  company         text,
  avatar_url      text,
  role            text NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('super_admin','admin','staff','trade','customer')),
  trade_status    text
                  CHECK (trade_status IN ('pending','approved','rejected','suspended')),
  two_fa_enabled  bool DEFAULT false,
  last_login_at   timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- OTP SESSIONS (2FA state between password verify and OTP verify)
otp_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_code        text NOT NULL,               -- 6-digit, hashed
  expires_at      timestamptz NOT NULL,
  used            bool DEFAULT false,
  ip_address      text,
  created_at      timestamptz DEFAULT now()
)
```

### 3.2 Products & Catalog

```sql
-- BRANDS
brands (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL UNIQUE,
  slug            text NOT NULL UNIQUE,
  logo_url        text,
  hero_url        text,
  description     text,
  website_url     text,
  display_order   int DEFAULT 0,
  is_active       bool DEFAULT true,
  seo_title       text,
  seo_desc        text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- CATEGORIES (recursive tree)
categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       uuid REFERENCES categories(id),
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  image_url       text,
  icon            text,
  display_order   int DEFAULT 0,
  is_active       bool DEFAULT true,
  seo_title       text,
  seo_desc        text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- PRODUCTS
products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  sku                   text UNIQUE,
  model_number          text,
  brand_id              uuid REFERENCES brands(id),
  category_id           uuid REFERENCES categories(id),
  description           text,
  features              jsonb DEFAULT '[]',
  specifications        jsonb DEFAULT '{}',
  energy_rating         text,
  btu_value             int,
  coverage_m2           decimal(10,2),
  currency              text DEFAULT 'EUR',

  -- Pricing
  retail_price          decimal(10,2),
  trade_price           decimal(10,2),            -- fixed trade price (if set)
  trade_discount_pct    decimal(5,2),             -- e.g. 15.00 = 15% off retail
  trade_price_mode      text DEFAULT 'fixed'
                        CHECK (trade_price_mode IN ('fixed','discount')),
  -- 'fixed'    → use trade_price column directly
  -- 'discount' → trade price = retail_price * (1 - trade_discount_pct/100)

  availability          text DEFAULT 'in_stock'
                        CHECK (availability IN ('in_stock','out_of_stock','on_order','discontinued')),
  is_featured           bool DEFAULT false,
  is_active             bool DEFAULT true,
  display_order         int DEFAULT 0,
  seo_title             text,
  seo_desc              text,
  seo_keywords          text,
  view_count            int DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
)

-- PRODUCT IMAGES
product_images (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url             text NOT NULL,
  alt_text        text,
  is_primary      bool DEFAULT false,
  display_order   int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
)

-- PRODUCT DOCUMENTS
product_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name            text NOT NULL,
  url             text NOT NULL,
  file_size       int,
  created_at      timestamptz DEFAULT now()
)
```

### 3.3 Blog

```sql
blog_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  excerpt         text,
  content         text,
  cover_url       text,
  author_id       uuid REFERENCES profiles(id),
  category        text DEFAULT 'general',
  tags            text[] DEFAULT '{}',
  status          text DEFAULT 'draft'
                  CHECK (status IN ('draft','published','scheduled','archived')),
  published_at    timestamptz,
  seo_title       text,
  seo_desc        text,
  view_count      int DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)
```

### 3.4 Service Management

```sql
-- TECHNICIANS
technicians (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid REFERENCES profiles(id),   -- optional (staff user link)
  name            text NOT NULL,
  email           text,
  phone           text,
  specialisations text[] DEFAULT '{}',            -- e.g. ['installation','repair','commercial']
  is_active       bool DEFAULT true,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- SERVICE REQUESTS (submitted by public / trade / admin)
service_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES profiles(id),   -- null if guest
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  company         text,
  address         text,
  service_type    text NOT NULL
                  CHECK (service_type IN (
                    'installation','repair','maintenance',
                    'inspection','commercial','coldroom','other'
                  )),
  description     text NOT NULL,
  preferred_date  date,
  preferred_time  text,
  urgency         text DEFAULT 'normal'
                  CHECK (urgency IN ('low','normal','high','emergency')),
  status          text DEFAULT 'new'
                  CHECK (status IN ('new','reviewed','scheduled','in_progress','completed','cancelled')),
  source          text DEFAULT 'website',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- JOBS (admin creates job from service request)
jobs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id  uuid REFERENCES service_requests(id),
  job_number          text UNIQUE NOT NULL,        -- e.g. JOB-2025-0001
  title               text NOT NULL,
  description         text,
  customer_name       text NOT NULL,
  customer_email      text NOT NULL,
  customer_phone      text,
  customer_address    text NOT NULL,
  service_type        text NOT NULL,
  technician_id       uuid REFERENCES technicians(id),
  scheduled_date      date,
  scheduled_time      text,
  estimated_duration  interval,
  actual_start        timestamptz,
  actual_end          timestamptz,
  status              text DEFAULT 'scheduled'
                      CHECK (status IN (
                        'scheduled','confirmed','en_route',
                        'in_progress','completed','cancelled','no_show'
                      )),
  priority            text DEFAULT 'normal'
                      CHECK (priority IN ('low','normal','high','emergency')),
  notes               text,
  internal_notes      text,
  completion_notes    text,
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
)

-- JOB STATUS HISTORY
job_status_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status          text NOT NULL,
  changed_by      uuid REFERENCES profiles(id),
  note            text,
  created_at      timestamptz DEFAULT now()
)
```

### 3.5 Quote Management

```sql
-- QUOTE REQUESTS (public form)
quote_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES profiles(id),   -- null if guest
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text,
  company         text,
  address         text,
  message         text NOT NULL,
  product_ids     uuid[] DEFAULT '{}',            -- products they're interested in
  service_type    text,
  budget_range    text,
  status          text DEFAULT 'new'
                  CHECK (status IN ('new','reviewed','quoted','accepted','rejected','expired')),
  source          text DEFAULT 'website',
  ip_address      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- QUOTES (admin responds to request)
quotes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid REFERENCES quote_requests(id),
  quote_number    text UNIQUE NOT NULL,            -- e.g. QUO-2025-0001
  created_by      uuid REFERENCES profiles(id),
  valid_until     date,
  subtotal        decimal(10,2),
  discount_pct    decimal(5,2) DEFAULT 0,
  tax_pct         decimal(5,2) DEFAULT 18,
  total           decimal(10,2),
  notes           text,
  internal_notes  text,
  status          text DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  sent_at         timestamptz,
  accepted_at     timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- QUOTE LINE ITEMS
quote_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id      uuid REFERENCES products(id),
  description     text NOT NULL,
  quantity        int DEFAULT 1,
  unit_price      decimal(10,2) NOT NULL,
  total_price     decimal(10,2) NOT NULL,
  display_order   int DEFAULT 0
)
```

### 3.6 CRM

```sql
-- CRM CONTACTS (unified customer/lead view)
crm_contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid REFERENCES profiles(id),   -- linked if registered user
  name            text NOT NULL,
  email           text,
  phone           text,
  company         text,
  address         text,
  type            text DEFAULT 'lead'
                  CHECK (type IN ('lead','customer','trade','contractor','hotel')),
  lead_status     text DEFAULT 'new'
                  CHECK (lead_status IN ('new','contacted','qualified','proposal','won','lost','dormant')),
  source          text,                            -- 'contact_form','trade_app','quote','manual'
  assigned_to     uuid REFERENCES profiles(id),
  tags            text[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- CRM NOTES
crm_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  author_id       uuid REFERENCES profiles(id),
  note            text NOT NULL,
  note_type       text DEFAULT 'note'
                  CHECK (note_type IN ('note','call','email','meeting','visit')),
  created_at      timestamptz DEFAULT now()
)

-- CRM FOLLOW-UPS
crm_followups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  assigned_to     uuid REFERENCES profiles(id),
  due_date        date NOT NULL,
  due_time        time,
  title           text NOT NULL,
  notes           text,
  status          text DEFAULT 'pending'
                  CHECK (status IN ('pending','done','cancelled')),
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
)
```

### 3.7 Content & CMS

```sql
-- CONTACT ENQUIRIES
enquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_contact_id  uuid REFERENCES crm_contacts(id),  -- auto-linked on submission
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text,
  company         text,
  message         text NOT NULL,
  source          text DEFAULT 'contact_form',
  status          text DEFAULT 'new'
                  CHECK (status IN ('new','read','replied','archived')),
  ip_address      text,
  created_at      timestamptz DEFAULT now()
)

-- TRADE APPLICATIONS
trade_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  company_name    text NOT NULL,
  vat_number      text,
  business_type   text,
  address         text,
  phone           text,
  documents       jsonb DEFAULT '[]',
  notes           text,
  admin_notes     text,
  status          text DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','suspended')),
  reviewed_by     uuid REFERENCES profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- TESTIMONIALS
testimonials (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  title           text,
  company         text,
  content         text NOT NULL,
  rating          int DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url      text,
  is_active       bool DEFAULT true,
  display_order   int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
)

-- FAQ
faqs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question        text NOT NULL,
  answer          text NOT NULL,
  category        text DEFAULT 'general',
  display_order   int DEFAULT 0,
  is_active       bool DEFAULT true,
  created_at      timestamptz DEFAULT now()
)

-- HOMEPAGE CMS
homepage_sections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key     text NOT NULL UNIQUE,
  data            jsonb NOT NULL DEFAULT '{}',
  updated_at      timestamptz DEFAULT now(),
  updated_by      uuid REFERENCES profiles(id)
)

-- SITE SETTINGS
site_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text NOT NULL UNIQUE,
  value           jsonb NOT NULL,
  category        text DEFAULT 'general',
  updated_at      timestamptz DEFAULT now()
)

-- EMAIL TEMPLATES
email_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text NOT NULL UNIQUE,
  name            text NOT NULL,
  subject         text NOT NULL,
  html_body       text NOT NULL,
  variables       text[] DEFAULT '{}',
  updated_at      timestamptz DEFAULT now()
)

-- MEDIA LIBRARY
media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        text NOT NULL,
  original_name   text,
  url             text NOT NULL,
  size            int,
  mime_type       text,
  width           int,
  height          int,
  folder          text DEFAULT '/',
  alt_text        text,
  tags            text[] DEFAULT '{}',
  uploaded_by     uuid REFERENCES profiles(id),
  created_at      timestamptz DEFAULT now()
)

-- ADMIN ACTIVITY LOG
admin_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  action          text NOT NULL,
  entity_type     text,
  entity_id       text,
  details         jsonb DEFAULT '{}',
  ip_address      text,
  created_at      timestamptz DEFAULT now()
)

-- PAGE VIEWS (analytics)
page_views (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path            text NOT NULL,
  referrer        text,
  country         text,
  device          text,
  created_at      timestamptz DEFAULT now()
)
```

---

## 4. AUTHENTICATION FLOW

### Role Hierarchy

```
super_admin   → full system access, user management, all admin features
admin         → all content + business features, cannot manage super_admin users
staff         → limited: service jobs, quotes, enquiries (no settings, no user mgmt)
trade         → trade portal, trade prices, own account
customer      → optional account, no special pricing
(public)      → browse products at retail prices, contact forms
```

### Auth Methods by Role

| Role | Auth Method | 2FA |
|---|---|---|
| super_admin | Email + Password | Email OTP required |
| admin | Email + Password | Email OTP required |
| staff | Email + Password | Email OTP required |
| trade | Email + Password | Optional |
| customer | Email + Password | No |

### Login Flow

```
All roles → /login (email + password form)
│
├── Password correct?
│   ├── Role = super_admin / admin / staff
│   │   → 2FA required
│   │   → Generate 6-digit OTP → store hashed in otp_sessions (expires 10min)
│   │   → Send OTP via Resend email
│   │   → Redirect to /verify-otp
│   │   → User enters OTP
│   │   → Verify hash → if valid → set session → redirect to /admin
│   │
│   ├── Role = trade (approved)
│   │   → Set session → redirect to /trade/dashboard
│   │
│   ├── Role = trade (pending/rejected)
│   │   → Show status message, no dashboard access
│   │
│   └── Role = customer
│       → Set session → redirect to /account or previous page
│
└── Password wrong → generic error (no account enumeration)
```

### Registration Flow

```
Customer:
  /register → email + password + name
  → Supabase creates auth user + profile (role = 'customer')
  → Optional: send welcome email
  → Redirect to /account

Trade:
  /trade/register → full form (company, VAT, documents)
  → Supabase creates auth user + profile (role = 'customer' initially)
  → Insert trade_applications record (status = 'pending')
  → Send confirmation email to applicant
  → Send notification to admin
  → After admin approval → profile.role = 'trade', trade_status = 'approved'
  → Send approval email

Admin / Staff:
  Created directly in Supabase Dashboard (never self-registration)
  → Admin sets email, sends invite
  → User sets own password via invite link
  → 2FA enforced on first login
```

### Middleware Protection

```typescript
// middleware.ts routing rules
/admin/*          → role IN ('super_admin','admin','staff') + 2FA verified
/admin/users/*    → role IN ('super_admin')
/admin/settings/* → role IN ('super_admin','admin')
/trade/dashboard  → role = 'trade' AND trade_status = 'approved'
/account/*        → authenticated (any role)
/verify-otp       → pending_2fa session cookie present
```

---

## 5. PRICING SYSTEM

### Two Pricing Modes (per product)

```
trade_price_mode = 'fixed':
  → trade user sees: product.trade_price directly
  → Admin sets exact trade price

trade_price_mode = 'discount':
  → trade user sees: retail_price × (1 − trade_discount_pct / 100)
  → Admin sets percentage, price auto-calculates
  → Changing retail_price automatically updates effective trade price
```

### Price Resolver (lib/pricing/resolver.ts)

```typescript
function resolvePrice(product: Product, role: UserRole): PriceResult {
  if (role === 'trade' || role === 'admin' || role === 'super_admin') {
    if (product.trade_price_mode === 'fixed' && product.trade_price) {
      return { price: product.trade_price, label: 'Trade Price', isTrade: true }
    }
    if (product.trade_price_mode === 'discount' && product.trade_discount_pct) {
      const discounted = product.retail_price * (1 - product.trade_discount_pct / 100)
      return { price: discounted, label: `Trade Price (${product.trade_discount_pct}% off)`, isTrade: true }
    }
  }
  return { price: product.retail_price, label: 'Price', isTrade: false }
}
```

**All price resolution happens server-side (RSC). No trade prices sent to unauthenticated browsers.**

---

## 6. SERVICE MANAGEMENT MODULE

### Admin Panel: /admin/services

```
Service Requests     — incoming requests from website, phone, trade
Jobs Board           — all jobs with status, assigned technician, date
Technicians          — manage technician profiles and skills
Schedule / Calendar  — week/month calendar view of all jobs
Single Job           — full detail, status update, notes, history
```

### Service Request → Job Workflow

```
Public submits service request (/services → form)
→ Inserted into service_requests (status = 'new')
→ Admin notification email sent
→ CRM contact auto-created or matched

Admin reviews request in /admin/services
→ Creates Job from request
→ Assigns technician
→ Sets scheduled date/time
→ Job number auto-generated (JOB-YYYY-NNNN)
→ Customer confirmation email sent
→ Technician notification email sent

Job lifecycle:
  scheduled → confirmed → en_route → in_progress → completed
                                                  → cancelled

Every status change:
  → logged in job_status_history
  → email sent to customer (if configured)
  → admin log entry
```

### Job Fields (Admin View)

- Job number, title, service type
- Customer details (name, email, phone, address)
- Assigned technician + reassign
- Scheduled date + time + estimated duration
- Priority (low / normal / high / emergency)
- Status with one-click update
- Notes (customer-visible) + internal notes
- Status history timeline
- Linked quote (if applicable)
- Linked service request

---

## 7. QUOTE MANAGEMENT MODULE

### Public Flow

```
/quote → Quote Request Form
Fields: name, email, phone, company, address, 
        interested products (multi-select), 
        service type, message, budget range
→ Inserted into quote_requests (status = 'new')
→ Confirmation email to customer
→ Notification to admin
→ CRM contact auto-created
```

### Admin Flow

```
/admin/quotes → Quote list (new, reviewed, quoted, accepted, rejected)

Single quote request (/admin/quotes/[id]):
→ View customer details and requirements
→ Create Quote response:
   - Line items (product or custom description, qty, unit price)
   - Discount percentage
   - VAT (18%)
   - Valid until date
   - Notes for customer
   - Internal notes
→ Preview quote
→ Send Quote → email sent to customer with quote PDF/summary
→ Quote number auto-generated (QUO-YYYY-NNNN)
→ Track: sent → accepted / rejected / expired
```

### Quote Email

- Beautiful HTML email with quote details
- Itemised line items
- Total with tax breakdown
- Valid until date
- CTA: "Accept Quote" / "Contact Us"

---

## 8. CRM MODULE

### What it is

Lightweight CRM built into the admin panel. Not a full Salesforce — focused on what an HVAC business in Malta actually needs.

### CRM Contact Sources (auto-populated)

| Source | Created When |
|---|---|
| Contact Form | Enquiry submitted |
| Trade Application | Trade registration |
| Quote Request | Quote form submitted |
| Service Request | Service form submitted |
| Manual | Admin adds manually |

### CRM Features

```
/admin/crm — Contact list
  Filter by: type, lead_status, assigned_to, tags
  Search: name, email, company

/admin/crm/[id] — Contact profile
  ├── Contact details (editable)
  ├── Lead status pipeline (visual kanban or dropdown)
  ├── Linked enquiries
  ├── Linked quotes
  ├── Linked service jobs
  ├── Notes timeline
  │   └── Add note: text + type (note/call/email/meeting/visit)
  └── Follow-ups
      └── Add follow-up: title, due date, assigned to

Lead status pipeline:
  new → contacted → qualified → proposal → won / lost / dormant
```

### Follow-Up Notifications

- Admin dashboard shows overdue + today's follow-ups
- Email digest (optional, daily) of pending follow-ups
- Filter by assigned staff member

---

## 9. ADMIN PANEL ARCHITECTURE

### Role-Based Sidebar

```
super_admin / admin:                   staff:
  Dashboard                              Dashboard
  ├── Analytics                          ├── Enquiries
  Content                                ├── Quotes
  ├── Homepage CMS                       ├── Services / Jobs
  ├── Blog                               └── CRM
  ├── FAQs
  ├── Testimonials
  Products
  ├── All Products
  ├── Categories
  └── Brands
  Business
  ├── Quotes
  ├── Services / Jobs
  ├── Trade Accounts
  └── Enquiries
  CRM
  ├── Contacts / Leads
  └── Follow-ups
  Library
  └── Media
  Settings (admin/super_admin only)
  ├── General
  ├── SEO
  ├── Emails
  └── Users (super_admin only)
```

### CMS-Controlled Homepage Sections

Every section below is editable from `/admin/homepage` with no code required:

| Section | Editable Fields |
|---|---|
| Hero | type (image/video/slider), headline, description, CTA buttons, media |
| Brand Showcase | logos, order, enable/disable |
| Product Categories | selection, order |
| Featured Products | product selection, order |
| Why Choose Us | icon, title, description per card |
| Services | service cards (icon, title, body) |
| Testimonials | pick from testimonials pool |
| FAQ | pick from FAQ pool |
| CTA Section | heading, body, button label/link |
| Footer | phone, email, address, hours, social links |

**Site Settings (always code-free):**
- Company phone, email, address, hours
- Social media links (Facebook, Instagram, LinkedIn, etc.)
- Google Maps embed URL
- Analytics IDs
- Maintenance mode toggle

---

## 10. EMAIL ARCHITECTURE

**Provider:** Resend  
**From:** `support@theairconditionshop.com`

### Email Inventory

| Key | Trigger | To |
|---|---|---|
| `contact_enquiry_user` | Contact form submitted | Customer (auto-reply) |
| `contact_enquiry_admin` | Contact form submitted | Admin |
| `quote_request_user` | Quote form submitted | Customer (confirmation) |
| `quote_request_admin` | Quote form submitted | Admin |
| `quote_sent` | Admin sends quote | Customer |
| `service_booked_user` | Job scheduled | Customer |
| `service_update` | Job status changes | Customer |
| `trade_application_user` | Trade form submitted | Applicant (confirmation) |
| `trade_application_admin` | Trade form submitted | Admin |
| `trade_approved` | Admin approves | Trade applicant |
| `trade_rejected` | Admin rejects | Trade applicant |
| `otp_code` | Admin/staff login | Admin/staff (2FA code) |
| `password_reset` | Reset requested | Any user |
| `welcome_customer` | Customer registers | New customer |

**All email subjects and HTML bodies are editable from `/admin/settings/emails`.**  
Code templates in `lib/resend/templates/` serve as fallbacks if DB templates are deleted.

---

## 11. SEO ARCHITECTURE

- `generateMetadata()` on every page (Next.js Metadata API)
- JSON-LD: `Product`, `LocalBusiness`, `BreadcrumbList`, `BlogPosting`, `FAQPage`
- Auto sitemap at `/sitemap.xml` (products, categories, brands, blog, pages)
- Auto `robots.txt` (blocks `/admin`, `/api`, `/auth`)
- Open Graph images for all key pages
- Canonical URLs on all pages
- Per-product + per-page SEO fields editable from admin

---

## 12. MEDIA MANAGEMENT

```
Supabase Storage Buckets:
├── products/          public  — product images
├── brands/            public  — logos, hero images
├── blog/              public  — blog cover images
├── documents/         public  — spec sheets, manuals
├── trade-docs/        private — trade application documents (signed URLs)
└── media/             public  — general media library
```

Admin Media Library (`/admin/media`):
- Upload single or bulk
- Search by filename, tag, folder
- Drag-and-drop organisation
- Copy URL button
- Delete with usage check (warn if image is in use)

---

## 13. SECURITY

| Risk | Mitigation |
|---|---|
| Auth bypass | Middleware + server-side role check on every RSC and API route |
| 2FA bypass | OTP stored hashed (bcrypt), 10min expiry, single use |
| Account enumeration | Generic error messages on login failure |
| SQL injection | Supabase parameterised queries only |
| XSS | React default escaping, DOMPurify on rich text output |
| CSRF | SameSite=Lax cookies, origin check on all mutations |
| Rate limiting | Vercel Edge on `/api/contact`, `/api/quote`, `/api/services/book`, `/login` |
| File upload abuse | MIME type + magic byte check, 10MB image / 50MB PDF limits |
| Trade doc exposure | Private Supabase bucket, short-lived signed URLs only |
| Privilege escalation | RLS policies enforce role boundaries at DB level |
| Secrets exposure | All secrets in env vars, never committed |
| Admin activity | Every mutation logged to `admin_logs` with user + IP |

---

## 14. PERFORMANCE STRATEGY

| Page Type | Strategy | Target |
|---|---|---|
| Homepage | ISR 60s | LCP < 1.8s |
| Product pages | ISR 300s | LCP < 2.0s |
| Category/Brand | ISR 300s | LCP < 2.0s |
| Blog posts | ISR 600s | LCP < 2.0s |
| Admin | CSR (no SEO) | TTI < 2s |
| API routes | Edge runtime | < 50ms |

- Hero image: `priority` + `fetchPriority="high"` + preload
- Fonts: `next/font` self-hosted (zero layout shift)
- Animations: Framer Motion with `LazyMotion` (reduce bundle)
- Third-party scripts: zero on public pages
- DB: indexed on `slug`, `is_active`, `category_id`, `brand_id`, `status`
- Images: all via `<Image>`, `sizes` prop set, WebP/AVIF auto

---

## 15. ENVIRONMENT VARIABLES

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_SITE_URL=https://theairconditionshop.com
REVALIDATE_SECRET=

# OTP (salt rounds for bcrypt)
OTP_BCRYPT_ROUNDS=12
```

---

## 16. INITIAL SEED DATA

Created via `supabase/seed.sql` on first deploy:

**Accounts (passwords via Supabase Auth invite — never in code):**
- `sales@asgroupmalta.com` → role = `admin`
- `a.r.alinur.arafat@gmail.com` → role = `trade`, trade_status = `approved`

**Default content:**
- Homepage sections (all with placeholder content)
- Site settings (phone, email, address, hours, social links)
- Email templates (all 14 templates)
- Brands: Daikin, Mitsubishi Electric, Panasonic, Toshiba, Fujitsu, Gree
- Categories: Air Conditioners, Multi-Split, VRF, Heat Pumps, Refrigeration, Cold Rooms, HVAC Tools, Accessories

---

## 17. IMPLEMENTATION PHASES

### Phase 1 — Foundation
1. Next.js 15 scaffold (pnpm, TypeScript, Tailwind v4)
2. Supabase project + all migrations + RLS policies
3. Auth middleware (role hierarchy, 2FA state machine)
4. Supabase client helpers (server, browser, admin)
5. Base layout (navbar, footer, next/font)
6. Seed data

### Phase 2 — Public Site
7. Homepage (all CMS-driven sections)
8. Product catalog + filters + single product (pricing resolver)
9. Category + brand pages
10. Blog list + single post
11. BTU Calculator
12. Contact page + form
13. Quote request form
14. Service request form
15. Trade registration + info page

### Phase 3 — Admin Panel
16. Admin shell (sidebar, role-aware nav, header)
17. Dashboard + analytics cards
18. Homepage CMS editor (all sections)
19. Product CRUD (full editor, image gallery, specs)
20. Category + brand management
21. Blog management (rich text, scheduling)
22. Service management (requests, jobs, technicians, calendar)
23. Quote management (requests, quote builder, send)
24. CRM (contacts, notes, follow-ups, pipeline)
25. Trade account management
26. Enquiries inbox
27. Media library
28. Settings (general, SEO, email templates, users)

### Phase 4 — Email + SEO
29. All 14 Resend email templates (React Email)
30. Sitemap + robots.txt
31. JSON-LD structured data (all page types)
32. Open Graph images

### Phase 5 — Polish + Deploy
33. Framer Motion animations (hero, scroll, hover)
34. Lighthouse audit + fixes
35. Accessibility audit (WCAG 2.1 AA)
36. Vercel deployment + env vars
37. DNS + domain configuration
38. Post-deploy smoke tests

---

## APPROVAL STATUS

- [x] Tech stack
- [x] Auth: Email + Password + Email OTP 2FA (admin/staff)
- [x] Role hierarchy: super_admin / admin / staff / trade / customer
- [x] Pricing: retail + fixed trade + discount percentage
- [x] Service management module
- [x] Quote management module
- [x] CRM module
- [x] Full CMS control from admin panel
- [x] Database schema
- [x] Email architecture
- [x] SEO architecture

**→ Ready to begin Phase 1 on approval.**
