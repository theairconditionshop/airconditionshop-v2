export type UserRole = 'super_admin' | 'admin' | 'staff' | 'trade' | 'customer'
export type TradeStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type TradeApplicationStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'on_order' | 'discontinued'
export type TradePriceMode = 'fixed' | 'discount'
export type BlogStatus = 'draft' | 'published' | 'scheduled' | 'archived'
export type EnquiryStatus = 'new' | 'read' | 'replied' | 'archived'
export type ServiceType = 'installation' | 'repair' | 'maintenance' | 'inspection' | 'commercial' | 'coldroom' | 'other'
export type ServiceRequestStatus = 'new' | 'reviewed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type JobStatus = 'scheduled' | 'confirmed' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type JobPriority = 'low' | 'normal' | 'high' | 'emergency'
export type QuoteRequestStatus = 'new' | 'reviewed' | 'quoted' | 'accepted' | 'rejected' | 'expired'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type CrmContactType = 'lead' | 'customer' | 'trade' | 'contractor' | 'hotel'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost' | 'dormant'
export type NoteType = 'note' | 'call' | 'email' | 'meeting' | 'visit'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company: string | null
  avatar_url: string | null
  role: UserRole
  trade_status: TradeStatus | null
  two_fa_enabled: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  hero_url: string | null
  logo_display_mode: string
  description: string | null
  website_url: string | null
  display_order: number
  is_active: boolean
  seo_title: string | null
  seo_desc: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  seo_title: string | null
  seo_desc: string | null
  created_at: string
  updated_at: string
  children?: Category[]
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  model_number: string | null
  brand_id: string | null
  category_id: string | null
  description: string | null
  features: string[]
  specifications: Record<string, string>
  energy_rating: string | null
  btu_value: number | null
  coverage_m2: number | null
  // HVAC technical fields
  cooling_btu: number | null
  heating_btu: number | null
  room_size_min: number | null
  room_size_max: number | null
  seer: number | null
  scop: number | null
  wifi_enabled: boolean
  refrigerant: string | null
  indoor_noise_db: number | null
  outdoor_noise_db: number | null
  voltage: number | null
  warranty_years: number | null
  currency: string
  retail_price: number | null
  trade_price: number | null
  trade_discount_pct: number | null
  trade_price_mode: TradePriceMode
  availability: ProductAvailability
  is_featured: boolean
  is_active: boolean
  display_order: number
  seo_title: string | null
  seo_desc: string | null
  seo_keywords: string | null
  view_count: number
  created_at: string
  updated_at: string
  // joined
  brand?: Brand
  category?: Category
  images?: ProductImage[]
  documents?: ProductDocument[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface ProductDocument {
  id: string
  product_id: string
  name: string
  url: string
  file_size: number | null
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  author_id: string | null
  category: string
  tags: string[]
  status: BlogStatus
  published_at: string | null
  seo_title: string | null
  seo_desc: string | null
  view_count: number
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Enquiry {
  id: string
  crm_contact_id: string | null
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  source: string
  status: EnquiryStatus
  ip_address: string | null
  created_at: string
}

export interface TradeApplication {
  id: string
  user_id: string | null
  company_name: string
  vat_number: string | null
  business_type: string | null
  address: string | null
  phone: string | null
  documents: string[]
  notes: string | null
  admin_notes: string | null
  status: TradeApplicationStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  user?: Profile
}

export interface Technician {
  id: string
  profile_id: string | null
  name: string
  email: string | null
  phone: string | null
  specialisations: string[]
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ServiceRequest {
  id: string
  customer_id: string | null
  name: string
  email: string
  phone: string
  company: string | null
  address: string | null
  service_type: ServiceType
  description: string
  preferred_date: string | null
  preferred_time: string | null
  urgency: JobPriority
  status: ServiceRequestStatus
  source: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  service_request_id: string | null
  job_number: string
  title: string
  description: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_address: string
  service_type: string
  technician_id: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  estimated_duration: string | null
  actual_start: string | null
  actual_end: string | null
  status: JobStatus
  priority: JobPriority
  notes: string | null
  internal_notes: string | null
  completion_notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  technician?: Technician
}

export interface QuoteRequest {
  id: string
  customer_id: string | null
  name: string
  email: string
  phone: string | null
  company: string | null
  address: string | null
  message: string
  product_ids: string[]
  service_type: string | null
  budget_range: string | null
  status: QuoteRequestStatus
  source: string
  ip_address: string | null
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  request_id: string | null
  quote_number: string
  created_by: string | null
  valid_until: string | null
  subtotal: number | null
  discount_pct: number
  tax_pct: number
  total: number | null
  notes: string | null
  internal_notes: string | null
  status: QuoteStatus
  sent_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
  items?: QuoteItem[]
}

export interface QuoteItem {
  id: string
  quote_id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  total_price: number
  display_order: number
}

export interface CrmContact {
  id: string
  profile_id: string | null
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  type: CrmContactType
  lead_status: LeadStatus
  source: string | null
  assigned_to: string | null
  tags: string[]
  created_at: string
  updated_at: string
  notes?: CrmNote[]
  followups?: CrmFollowup[]
}

export interface CrmNote {
  id: string
  contact_id: string
  author_id: string | null
  note: string
  note_type: NoteType
  created_at: string
  author?: Profile
}

export interface CrmFollowup {
  id: string
  contact_id: string
  assigned_to: string | null
  due_date: string
  due_time: string | null
  title: string
  notes: string | null
  status: 'pending' | 'done' | 'cancelled'
  completed_at: string | null
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  title: string | null
  company: string | null
  content: string
  rating: number
  avatar_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export interface Faq {
  id: string
  question: string
  answer: string
  category: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface HomepageSection {
  id: string
  section_key: string
  data: Record<string, unknown>
  updated_at: string
  updated_by: string | null
}

export interface SiteSetting {
  id: string
  key: string
  value: unknown
  category: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  key: string
  name: string
  subject: string
  html_body: string
  variables: string[]
  updated_at: string
}

export interface MediaItem {
  id: string
  filename: string
  original_name: string | null
  url: string
  size: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  folder: string
  alt_text: string | null
  tags: string[]
  uploaded_by: string | null
  created_at: string
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'archived'
export type CampaignType   = 'competition' | 'giveaway' | 'seasonal_promotion' | 'world_cup_promotion' | 'referral' | 'discount' | 'free_installation' | 'trade' | 'product_launch'

export interface Campaign {
  id: string
  title: string
  slug: string
  campaign_type: CampaignType
  hero_image: string | null
  gallery_images: string[]
  short_description: string | null
  full_description: string | null
  prize: string | null
  prize_value: number | null
  how_to_enter: string[]
  rules: string | null
  start_date: string | null
  end_date: string | null
  terms_and_conditions: string | null
  eligibility: string | null
  status: CampaignStatus
  featured: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface CampaignAnalyticsEvent {
  id: string
  campaign_id: string
  event_type: 'view' | 'cta_click' | 'share' | 'lead_submit'
  referrer: string | null
  user_agent: string | null
  ip_hash: string | null
  created_at: string
}

export interface CampaignAnalyticsSummary {
  campaign_id: string
  title: string
  views: number
  cta_clicks: number
  shares: number
  lead_submits: number
  conversion_rate: number
}

export interface AdminLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
  user?: Profile
}
