# THE AIRCONDITION SHOP — Design System

This document records the actual design decisions in this codebase as of the cinematic redesign (2026). It is descriptive, not aspirational — every rule here reflects real code in `src/`. Treat it as the reference for all future frontend work. When extending the site, match these patterns rather than inventing new ones.

---

## 1. Design Philosophy

Premium European HVAC supplier, not an ecommerce template. Reference points: Apple, Dyson, Mercedes, Linear, Stripe. Flat geometry (near-zero border radius), generous whitespace, serif display headings paired with a clean sans body, restrained color (mostly slate + one blue accent), motion that reveals content rather than decorates it, and — where used — cinematic Mediterranean/Malta photography with a consistent warm color grade.

Business model: quote-request + trade-account HVAC supplier. There is no cart, wishlist, compare, or checkout — do not invent these.

---

## 2. Typography

**Font stack** (`src/app/layout.tsx`, `src/app/globals.css`):
- **Display / headings** — `DM_Serif_Display` (Google Font, weight 400, normal + italic), exposed as `.font-display` / Tailwind `font-display`. Falls back to `Georgia, serif`.
- **Body / UI** — `Inter` (Google Font), the Tailwind default sans stack.

**Heading scale** (as actually used across hero sections and page headers):
| Context | Classes |
|---|---|
| Hero H1 (large, image-backed) | `font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.0]` |
| Section H2 | `font-display text-3xl lg:text-4xl` or `text-4xl lg:text-5xl`, `tracking-[-0.02em]` |
| Card / sub-section heading | `font-display text-xl` or `text-2xl`, `tracking-[-0.01em]` |
| Eyebrow label (above headings) | `text-[11px] font-semibold uppercase tracking-[0.28em]` (hero) or `tracking-[0.15em]`–`[0.25em]` (cards) |

Rules:
- Serif (`font-display`) is reserved for headings and standalone display numbers/stats. Never use it for body copy, labels, or UI chrome (buttons, badges, form labels).
- Heading tracking is always negative (`-0.01em` to `-0.02em`) — tightens the serif at large sizes.
- Eyebrow/label tracking is always positive and wide (`0.15em`–`0.28em`), uppercase, small (`text-[10px]`–`text-[11px]`), and colored `text-blue-600` (light backgrounds) or `text-blue-300` (dark/image backgrounds).
- Body copy: `text-slate-500`/`text-slate-600` on light backgrounds, `text-slate-200`/`text-slate-300` on dark/image backgrounds, `leading-relaxed`.

---

## 3. Color Palette

Defined in `src/app/globals.css` as CSS custom properties, mapped into Tailwind's `@theme`:

```
--brand-blue:         #0ea5e9   (accent — used sparingly)
--brand-blue-dark:    #0284c7
--brand-blue-light:   #e0f2fe
--brand-blue-subtle:  #f0f9ff

--brand-gold:         #ca8a04   (trade/amber accent — Trade page only)
--brand-gold-light:   #fbbf24

--background: #ffffff   --foreground: #0f172a
--muted:      #64748b   --muted-bg:   #f8fafc
--border:     #e2e8f0   --input-border: #cbd5e1

--success: #16a34a  --warning: #d97706  --error: #dc2626
```

In practice, most UI uses **Tailwind's slate scale directly** (`slate-50` … `slate-950`) rather than the CSS vars, plus `blue-600`/`blue-700` as the single primary accent. Slate-900/black is the primary CTA color (not blue) — blue is reserved for links, focus rings, and secondary accents.

- **Primary CTA:** `bg-slate-900 text-white hover:bg-blue-600` (dark button that shifts to blue on hover) — used for the main hero/section CTA everywhere.
- **Secondary CTA:** outlined, `border-slate-200/300 hover:border-slate-900` (light) or `border-white/20 hover:bg-white/[0.08]` (dark hero).
- **Trade section only** uses amber/gold (`amber-500`, `slate-950` bg) as its distinct sub-brand accent — signals "professional/industrial" vs. the blue-accented consumer pages.
- **Emergency/urgent CTA:** `red-600`/`red-300` — reserved exclusively for "Emergency Call" style actions.
- Dark hero overlays: `bg-slate-950` at 40–55% opacity (see §11), or a `bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20` when the image needs to stay legible at the top (logo/breadcrumb) but fully readable at the bottom (heading).

---

## 4. Spacing System

Tailwind's default spacing scale (4px base unit) — no custom scale was introduced. Conventions that recur:

- **Section vertical padding:** `py-16 lg:py-24` (most common), `py-16 lg:py-20`, `py-14 lg:py-20` for secondary sections.
- **Card internal padding:** `p-4 lg:p-5` (product/series cards), `p-5` (panels, gauges).
- **Grid gaps:** `gap-4` (dense card grids), `gap-5` (section-level card grids), `gap-8`–`gap-12` (two-column layouts like gallery+details).
- **Stagger/Reveal delay increments:** `0.05`–`0.08`s between successive elements (see §9).

---

## 5. Grid & Container Widths

- **Primary content container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` — used on the overwhelming majority of pages (32 of ~55 container instances). This is the default; use it unless there's a specific reason not to.
- **Narrower text-focused containers:** `max-w-3xl` / `max-w-2xl` for prose blocks, FAQs, single-column forms.
- **Card grids:**
  - Product/series listing: `grid-cols-2 sm:grid-cols-2 xl:grid-cols-3` (skeleton/loading) up to `lg:grid-cols-4` for populated grids.
  - Two-column detail layout (gallery + info): `grid lg:grid-cols-2 gap-8 lg:gap-12`.

---

## 6. Border Radius Rules

**The entire site uses a near-flat 2px radius, not Tailwind's `rounded-lg`/`xl`/`2xl` scale.** This is the single most distinctive geometric signature of the redesign.

```
style={{ borderRadius: 2 }}   → cards, buttons, panels, badges, image frames
style={{ borderRadius: 1 }}   → tiny elements (dot indicators, thin bars)
```

Rules:
- Never use Tailwind's `rounded-xl`/`rounded-2xl`/`rounded-lg` for cards, buttons, or panels — these read as generic ecommerce/SaaS template and have been actively removed everywhere they were found (product cards, series cards, trade CTAs, calculator cards, quote reminder toast, etc.).
- Exceptions (where full/large radius is correct and intentional):
  - `rounded-full` for genuinely circular UI: avatars, dot/status indicators, decorative background blur "orbs" (`blur-[140px]`), color-swatch buttons.
  - Form `<input>`/`<select>` fields use `rounded-lg` — this is a deliberate, consistent exception across every form (contact, quote, services, BTU calculator) and should **not** be flattened to match cards.
  - The shared `Button` component (`src/components/ui/button.tsx`) still uses `rounded-lg` — it predates the flat redesign and is used mostly in admin/utility contexts, not on marketing-page hero CTAs (those are hand-built `<a>`/`<Link>` with `borderRadius: 2`).

---

## 7. Shadow System

Shadows are almost entirely **removed** in favor of border-color transitions. The rule: **hover state = border color change, not elevation.**

```
Old (removed):  hover:shadow-lg hover:-translate-y-0.5
New (standard): border border-slate-200 hover:border-slate-900 transition-colors duration-300
```

- Cards never lift or gain a drop shadow on hover.
- The only sanctioned shadow uses: `shadow-2xl` on the floating `QuoteReminder` toast (justified — it's a genuinely floating overlay element, not a card in a grid), and small `shadow-sm` on the BTU calculator's unit toggle pill (legacy, low-visual-weight).
- Brand logo badges on dark hero images use a plain white chip (`bg-white`, `borderRadius: 2`) rather than a shadow to separate from the background.

---

## 8. Border Conventions

- Default card/panel border: `border border-slate-200`.
- Hover state: `hover:border-slate-900` (light cards) or `hover:border-blue-500`/`hover:border-slate-300` (utility contexts).
- Dividers: `border-t border-slate-100` (section separators), `divide-y divide-slate-100` (list/table rows).
- Transition: always pair a border-color hover with `transition-colors duration-300` (cards) or `duration-200` (smaller controls).

---

## 9. Animation System & Motion Timing

All motion lives in `src/components/motion/primitives.tsx` (Framer Motion). **Never hand-roll scroll-reveal or stagger logic — use these primitives.**

| Primitive | Purpose | Notes |
|---|---|---|
| `<Reveal mode="up\|blur\|fade\|left\|right\|scale">` | Single-element scroll-reveal | Default duration `0.7s`, ease `[0.22, 1, 0.36, 1]`, distance `28px`. `blur` mode also animates `filter: blur(12px) → 0`. |
| `<Stagger><StaggerItem/></Stagger>` | Cascading reveal for grids/lists | Default `gap: 0.09s` between children, `delay: 0.05s` initial. Defaults `amount: 'some'` (not a numeric fraction) — required for grids taller than the viewport, otherwise the reveal may never fire. |
| `<CountUp to={n}>` | Animated number count | `duration: 1.8s` default, eased, fires once on scroll-into-view. |
| `<Magnetic strength={0.2–0.35}>` | Cursor-following hover on buttons | Spring `stiffness: 200, damping: 15, mass: 0.4`. Used on primary hero CTAs only, not every button. |
| `<SplitText>` | Word-by-word headline reveal | Rare/hero-only use. |

**Global rules:**
- Every primitive checks `useReducedMotion()` and renders motion-free instantly if reduced motion is preferred. Never bypass this.
- Standard ease curve: `[0.22, 1, 0.36, 1]` (motion primitives) or `[0.16, 1, 0.3, 1]` (product gallery/card micro-interactions) — both are "ease-out-expo"-family curves. Don't introduce a third easing curve without reason.
- Reveal delays cascade in `0.05`–`0.08s` increments for a heading → subheading → body → CTA sequence.
- Micro-interaction durations (hover states, not scroll reveals): `duration-200` (small controls) to `duration-300` (cards, buttons) to `duration-[600ms]` (image scale/crossfade on card hover — deliberately slower for a "premium" feel, not snappy).

**Signature flagship interactions** (do not reuse casually — these are intentionally reserved for the product detail/gallery/card "hero" experiences):
- **Cursor-follow zoom** (`product-gallery.tsx`): mouse position drives `transform-origin`, `scale: 1 → 1.7` on hover, `duration: 0.4s`, ease `[0.16, 1, 0.3, 1]`.
- **3D tilt** (`product-card.tsx`): mouse position drives `rotateX`/`rotateY` (±6° range) via spring (`stiffness: 300, damping: 25`), wrapped in a `perspective: 1000` parent.
- **Secondary-image crossfade** on card hover: `duration-[600ms]`.
- **Animated spec gauge** (`spec-gauge.tsx`): `CountUp` number + a fill-bar that animates `width: 0 → pct%` over `1.1s`, delayed `0.15s`, gated by `useInView`.

---

## 10. Button Variants

Two parallel systems exist — know which one to use where:

**A. Marketing/hero CTAs** — hand-built, not the shared `Button` component:
```
Primary:   bg-slate-900 text-white hover:bg-blue-600, h-14, px-7, borderRadius:2, focus-visible:ring-2 ring-blue-500 ring-offset-2
Secondary: border border-slate-200/300 hover:border-slate-900 (or border-white/20 hover:bg-white/10 on dark heroes)
Emergency: border-red-300 text-red-600 hover:bg-red-50 bg-white
Trade primary: bg-amber-500 text-slate-950 hover:bg-amber-400 (Trade page only)
```
Always include `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-{color}-500 focus-visible:ring-offset-2` (or `ring-white/60` + `ring-offset-slate-950` on dark backgrounds) — every hero CTA must have a visible keyboard focus state, matching the shared `Button` component's own focus ring.

**B. Shared `Button` component** (`src/components/ui/button.tsx`, CVA-based) — used in forms, admin, cards:
```
variant: default | destructive | outline | secondary | ghost | link | brand
size:    sm | default | lg | xl | icon
```
Note this component still uses `rounded-lg` (pre-dates the flat redesign) — acceptable for form/utility contexts, not for new marketing hero CTAs (use pattern A there).

---

## 11. Card Variants

**Product/Series card** (`product-card.tsx`, `series-card.tsx` — kept visually identical to each other):
```
bg-white border border-slate-200 hover:border-slate-900, borderRadius:2, overflow-hidden, transition-colors duration-300
Image: aspect-[4/3], object-cover, group-hover:scale-[1.06] over 600ms
Secondary image (if present): crossfades in on hover
```

**Data/spec card** (`HvacSpecCard`, `SpecGauge`):
```
bg-white border border-slate-200 hover:border-slate-900, p-4/p-5, borderRadius:2
Icon in a small colored chip: w-9 h-9, bg-{accent}-50, borderRadius:2
```

**Panel** (price box, trade-pricing CTA, result cards):
```
bg-slate-50 border border-slate-100 (neutral) or bg-blue-50/60 border-blue-100 (trade-gated), p-5, borderRadius:2
```

---

## 12. Hero Layouts

Two hero patterns coexist by design:

**A. Shared `<PageHero>` component** (`src/components/shared/page-hero.tsx`) — the CMS-driven, reusable pattern. Use this for any *new* static page.
```
min-h-[46vh], flex items-end, pt-24
<picture> with 3 independent <source> breakpoints (mobile ≤767px / tablet ≤1279px / desktop ≥1280px), object-cover, object-[center_30%]
Dark overlay: bg-slate-950 at hero.overlayOpacity (CMS-controlled, typically 0.4–0.55)
Falls back to a plain text hero (grid-paper texture bg, no image) when no CMS image is set — never breaks
```

**B. Bespoke inline heroes** (Services, Trade, Contact, Brand detail, Category detail) — same visual language, hand-built per page because each needed a distinct CTA row, trust-badge strip, or colour selector that `<PageHero>` doesn't support:
```
min-h-[52–62vh], flex items-end, pt-24, <Navbar transparent={hasImage} />
Image via plain <img> (not next/image) covering absolute inset-0, z-0
Overlay: bg-slate-950/40–55 (flat) or gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 (when top-of-image content like a logo badge needs to stay legible)
Conditional text color: text-white/slate-200 when an image is present, text-slate-900/slate-500 when falling back to the plain variant
```
**Rule:** every hero must support a no-image fallback (checked via `!!imageUrl`) — never assume the CMS field is populated. Every hero must also flip `<Navbar transparent>` only when an image is present (a transparent navbar over a white fallback background is unreadable).

---

## 13. Image Treatment

- **Generation pipeline:** OpenAI `gpt-image-1`, `quality: "high"`, `size: "1536x1024"` (widest landscape option) — see `src/lib/media/openai-image.ts`. This is the sole image-generation pipeline; do not reintroduce a third-party generator.
- **Post-processing:** every generated image is converted to WebP via `sharp` (`quality: 82`) before upload — typically an 85–95% size reduction (2.5–3.2MB PNG → 75–330KB WebP).
- **Storage:** Supabase Storage `media` bucket, `media/{timestamp}-{random}.webp` path convention, row inserted into the `media` table (`filename`, `original_name`, `url`, `mime_type`, `size`) so it's tracked by the orphan-cleanup system.
- **Creative direction for generated imagery:** ultra-photorealistic, luxury commercial advertising, Mediterranean/Malta lifestyle or architecture, editorial quality, warm consistent color grading, no people (reserves "no generic stock-photo" and avoids the uncanny-face problem), no visible logos/brand markings when depicting a specific manufacturer's category (brand-safety — never fabricate a real brand's product design).
- **Real product photography** (AC units, accessories) is never AI-generated — only real manufacturer photos are used on Product Listing/Detail pages.
- **Reject criteria** (grounds to regenerate): breaks the warm/architectural color grade (e.g. cold-toned, moody/dark kitchen), lacks Malta/Mediterranean specificity (e.g. reads as literally Japan), includes a person's face (breaks the "environmental, no-people" consistency), or has an SVG/logo asset issue (e.g. brand logos with baked-in white backgrounds must be shown in a white chip, never `invert`-filtered onto a dark hero).

---

## 14. CMS Image Fields & Sizes

| Table / Field | Purpose | Slots |
|---|---|---|
| `page_heroes` (page_key, title, subtitle, desktop/tablet/mobile_image_url, overlay_opacity, cta_label, cta_href, show_breadcrumb) | Reusable hero CMS for static pages | Desktop/tablet/mobile independently settable; tablet/mobile fall back to desktop if unset |
| `categories.image_url` | Category page banner | Single image, full-bleed |
| `brands.hero_url` + `brands.logo_url` | Brand page hero + logo badge | hero_url full-bleed; logo_url shown in a white chip, never inverted |
| `media` table | Central asset registry | Every uploaded/generated image gets a row — required for orphan-detection (`find_orphaned_media()`) to work |

Source images are generated at **1536×1024** (3:2 landscape) — sufficient for hero use at all three breakpoints without upscaling; do not generate below this for hero purposes.

---

## 15. Form Styles

Consistent across Contact, Quote, Services, BTU Calculator:
```
Input/Select: h-11 or h-12, w-full, rounded-lg, border border-slate-200, bg-white, px-3,
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500, transition-colors duration-150
Label:        text-sm font-medium text-slate-700
Error text:   text-xs text-red-500
```
`rounded-lg` on form fields is an intentional, permanent exception to the site's flat 2px card language (see §6) — do not "fix" it to match cards.

---

## 16. Mobile / Tablet / Desktop Rules

- **Breakpoints:** Tailwind defaults (`sm` 640px, `lg` 1024px, `xl` 1280px). Hero `<picture>` sources use custom breakpoints: mobile ≤767px, tablet ≤1279px, desktop ≥1280px.
- **Mobile is designed independently, not scaled down** — e.g. product grids go `grid-cols-2` on mobile (not 1), hero images get their own `object-position` tuning and, where the CMS field is populated, a genuinely distinct mobile crop/image rather than a squashed desktop image.
- Large serif hero headings are permitted to occupy a large share of the mobile viewport (this is intentional editorial pacing established on the homepage, not a bug) — but always verify no text is clipped by the sticky bottom Call/WhatsApp bar.
- Sticky elements: product detail's purchase panel uses `lg:sticky lg:top-24` — **desktop/tablet only**, never sticky on mobile (no room).
- Always verify a new page at 375px (mobile), 768px (tablet), and 1440px+ (desktop) before considering it done — this project has repeatedly caught real crop/overflow issues only at specific breakpoints.

---

## 17. Component Naming

- One component = one visual concept, named for what it *is*, not what page it's on: `ProductCard`, `SeriesCard`, `SpecGauge`, `PageHero`, `TradePricingCta`. Avoid page-specific names like `ServicesHeroCard`.
- Shared/reusable pieces live in `src/components/shared/`; product-domain pieces in `src/components/products/`; motion primitives in `src/components/motion/`; pure UI atoms (Button, Skeleton, Badge) in `src/components/ui/`.
- Server-only utility modules that must never leak into a client bundle are documented with a comment stating so at the top of the file (see `openai-image.ts`) rather than relying on a `server-only` package that isn't installed in this project.

---

## 18. Icon Usage

- **Library:** `lucide-react` exclusively. No emoji-as-icon, no mixed icon sets.
- **Standard sizes:** `w-3 h-3`/`w-3.5 h-3.5` (inline with small text, badges), `w-4 h-4` (buttons, list items — the most common size), `w-5 h-5` (icon chips), `w-9 h-9`/`w-10 h-10`/`w-11 h-11` container around a `w-4/w-5` icon (spec cards, contact method icons).
- Icons are almost always `aria-hidden="true"` when paired with visible text; given a real `aria-label` only when they're the sole content of an interactive element (icon-only buttons).
- Icon chip pattern: `w-9 h-9 bg-{accent}-50 flex items-center justify-center` + `borderRadius: 2` (never a circle, matching §6's flat-geometry rule) — the one exception being genuinely circular UI like avatars or color swatches.

---

## 19. Empty States

Pattern (see `ProductGrid.tsx`): centered, quiet, no illustration —
```
font-display text-2xl text-slate-900 — the "nothing here" headline
text-sm text-slate-500 — one supporting line
An outbound action (e.g. "Browse all products" link) — never a dead end
```
Category pages with zero products still render the full hero/breadcrumb/filter chrome — only the grid area shows the empty state, so the page never feels broken.

---

## 20. Loading States

- **Skeletons, not spinners**, for content that has a known shape (`src/components/ui/skeleton.tsx`): `ProductCardSkeleton`, `ProductGridSkeleton`, `SidebarSkeleton` — each mirrors the exact dimensions/padding of its real counterpart so there's no layout shift on hydration.
- Skeleton fill: `.animate-shimmer` utility class, flat `borderRadius: 2` (matching real cards).
- **Spinners** (`animate-spin`) are reserved for in-flight *actions*, not page/section loads: form submit buttons (`Button loading` prop shows an inline spinner + disables the button) and the BTU calculator's async product-recommendation fetch (`Loader2` + "Matching systems to your room…" text).
- Route-level `loading.tsx` files use the same skeleton components as the real page, never a generic spinner.

---

## 21. Error States

- **404** (`src/app/not-found.tsx`): quiet, on-brand, serif "404 / Page not found" headline, one supporting line, a primary "Back to Homepage" action + secondary "Browse Products", plus a short "Popular pages" list so the visitor always has a next step. No imagery needed or used.
- **Runtime errors** (`src/app/error.tsx`): App Router error boundary, same restrained visual language as 404 (no stack traces or technical detail shown to visitors).
- **Form field errors:** inline, `text-xs text-red-500`, directly beneath the offending field — never a toast/modal for validation errors.
- **Toast notifications** (`sonner`, via `<Toaster />` in the root layout): reserved for async action feedback (upload success/failure, form submission results), not for validation.

---

## Change Log Discipline

When you add a new pattern that isn't covered above (a new card variant, a new motion primitive, a new hero layout), **update this document in the same PR/session.** This file is only useful if it stays true to the code.
