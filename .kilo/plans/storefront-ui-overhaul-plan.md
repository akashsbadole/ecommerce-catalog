# WCommerce Storefront UI/UX Modification Plan

## Global Design Rule

All buttons, CTAs, and anchor links across the entire storefront must use the **blue background + white text** combination (`#2639ED` / `bg-primary`, `text-white`, `text-primary-foreground`). This applies to every call-to-action, link button, card action, tab, badge link, header button, footer link, and any clickable element unless explicitly overridden by CMS. Consistent blue/white CTA palette is mandatory site-wide.

## Overview

Transform the storefront from hardcoded sections to a cleaner, B2B-focused layout with a unified contact form, light-only theme, and CMS-configurable blue/white CTAs.

---

## Phase 1: Theme & Layout Foundation

**Files:** `src/components/ThemeProvider.tsx`, `src/app/globals.css`, `tailwind.config.ts`, `src/components/store/StoreHeader.tsx`, `src/components/store/StoreLayout.tsx`

1. **Force light mode only**
   - Remove `next-themes` provider and all theme toggle components
   - Remove `darkMode: "class"` from tailwind config
   - Remove `.dark` overrides from `globals.css`, merge into `:root`
   - Remove `<ThemeToggle />` and `<SimpleThemeToggle />` from `StoreHeader`

2. **Homepage layout adjustments**
   - Remove top navigation bar (if present in homepage wrapper; keep header minimal) - add anounce bar
   - Add announcement bar at very top of homepage (`StoreLayout` or `HomePage` hero area)
   - Make hero/banner full-width (remove `max-w-7xl` / container constraints from slider/hero blocks)

---

## Phase 2: Homepage Changes

**Files:** `src/components/store/HomePage.tsx`, `src/components/store/PageBlockRenderer.tsx`, `src/lib/page-blocks.ts`, `src/components/store/StickyCtaBar.tsx`

1. **"Who we serve" (audience-cards block)**
   - Center-align the section
   - Replace card links/actions with buttons: **"Enquire now"**, **"Get details"**, **"Partner with us"**, **"Send requirement"**
   - Default style: `bg-primary` (blue `#2639ED`) background, white text
   - Add CMS field `ctaButtonColor` / `ctaTextColor` to block data so admin can change colors

2. **"Our product range" (product-categories block)**
   - Center-align section
   - Show **6 categories** instead of 5 (update default block data, grid to 3×2 or 6-col)
   - Default button color: blue (`bg-primary`) with white text, configurable from CMS

3. **Hide "Ready to manufacture at scale" (sticky-cta block)**
   - Remove `sticky-cta` from default homepage blocks
   - Add a `visible` CMS flag so it can be re-enabled if needed

4. **Banner full-width**
   - Update `slider` and `hero-split` renderers to use `w-full` without container

---

## Phase 3: About Us Page

**File:** `src/components/store/AboutPage.tsx`

1. **Hero banner background**
   - Make hero background image configurable from CMS (add image field to hero block or About CMS page)
   - Add fallback gradient if no image set

2. **Director / Author profiles (The People behind Purva Bites)**
   - Add CMS-configurable image support (edit inline or upload)
   - Remove WhatsApp icon buttons
   - Remove tag/label chips under names
   - Add `imageUrl`, `name`, `role`, `bio` fields backed by CMS or ContentPage

3. **"Ready to work with us" section**
   - Fix color combination (too dark / low contrast currently)
   - 2nd and 3rd cards should link to `/contact` (inline contact form trigger) instead of static text

---

## Phase 4: Manufacturing Page

**File:** `src/components/store/ManufacturingPage.tsx`

1. **Production lines tab**
   - Add "View Products" button on each production-line tab
   - Button redirects to `/catalogue` with category filter or directly to relevant product category page, here you need to create category pages
   - Make target category/product configurable from CMS per production line

2. **"Your brand Our Factory" section**
   - Fix color combination (current dark bg / dark text issue)
   - Ensure text visibility; use light background with dark text or white cards
   - Add CMS editable colors if applicable

3. **Unified contact form**
   - Add the shared contact form component (see Phase 8) to the manufacturing page
   - Position it in a prominent CTA section

4. **Certifications section**
   - Hide/remove "Download PDF" buttons from certification cards

---

## Phase 5: Catalogue Page

**File:** `src/components/store/CataloguePage.tsx`

1. **Category tabs → Functional navigation**
   - Clicking a category tab filters products (already does this) AND provides a category-specific header/hero
   - Hide tag chips on product cards and category hero strip
   - Remove "Min order quantity" display from product cards

2. **Enquire now → Inline contact form on same page**
   - Clicking "Enquire" on a product or category opens the unified contact form inline (or modal) within the catalogue page instead of navigating away

3. **Category detail pages**
   - Create `src/components/store/CategoryPage.tsx`
   - Route: `/catalogue/[slug]` via catch-all or file-based route (currently hardcoded in SPA router)
   - Each category gets its own hero, description, and product grid
   - Add "Send enquiry" button on category page that submits via unified contact form

4. **Hide elements**
   - Remove "We do not sell retail. All orders are b2b bulk and trade only" banner
   - Remove "Download full catalogue" button/link

---

## Phase 6: Contact Us Page

**File:** `src/components/store/ContactPage.tsx`

1. **Color combos**
   - Re-style "Get in touch" hero / form sections for better contrast
   - Use blue (`#2639ED`) background with white text where appropriate; ensure all text passes accessibility

2. **Remove / hide**
   - WhatsApp phone number from sidebar
   - WhatsApp button from form (keep if requested, but user said hide)
   - "Prefer a quicker channel" section
   - "What happens — Get in touch" CRM flow section (or move it)

3. **Schedule a factory visit**
   - Change CTA to scroll-to / open the unified contact form on the same page with enquiry type pre-selected as "factory visit"

---

## Phase 7: Footer Changes

**File:** `src/components/store/StoreFooter.tsx`

1. **Remove WhatsApp link** from contact info column
2. **Remove Newsletter section** (entire border container + input + button)

---

## Phase 8: Shared Contact Form Component

**New file:** `src/components/store/SharedContactForm.tsx`

1. Build a reusable `<SharedContactForm />` component accepting props:
   - `initialEnquiryType` (default: "contact")
   - `categories` (for product/category dropdown)
   - `onSubmitSuccess` callback
   - `variant`: "full" | "compact" | "inline"
   - `bgColor` and `textColor` props (default blue bg / white text)

2. Form fields: name, company, phone, email, productInterest (optional), quantity (optional), message, source (optional)

3. Submits to `POST /api/enquiries` (existing endpoint) with proper validation

4. Replace inline forms in:
   - `ContactPage.tsx`
   - `CataloguePage.tsx` (enquire modal/section)
   - `ManufacturingPage.tsx`
   - Any CMS `lead-capture` block rendering

5. Ensure CMS integration so author can toggle button colors per block instance

---

## Phase 9: Blogs Page — Category Enquiry

**Files:** `src/components/store/BlogPage.tsx`, `src/app/[[...slug]]/page.tsx`, `src/lib/page-blocks.ts`

1. **Blog listing** — remove linking to individual blog post detail pages (keep grid/list view only)
2. **Category enquiry flow**
   - Define blog categories/tags as enquiry targets
   - Add "Enquire about this category" button on blog cards or filter bar
   - Clicking opens `SharedContactForm` with `initialEnquiryType` pre-filled and category context
3. **Optionally create a generic `/blog/category/[slug]` page** for category-specific blog collections with a unified contact form at the bottom

---

## Phase 10: CMS Admin / Content Model Updates

**Files:** `src/lib/page-blocks.ts`, CMS editor in admin (if separate), `prisma/schema.prisma` (if new fields needed)

1. Add configurable `ctaButtonColor`, `ctaTextColor`, `ctaUrl`, `showButton` fields to block types:
   - `audience-cards`
   - `product-categories`
   - `slider` / `hero-split`
   - `sticky-cta`

2. If new DB fields required per block (not just JSON in `blocks`), update `ContentPage` or relevant model and run migrations

3. Ensure admin Page Builder exposes these new fields

---

## Migration / Rollout Notes

- Run `npx prisma generate` after any schema changes
- Run `npm run build` and `npx tsc --noEmit` to verify
- Footer and theme removals are global; test on all storefront pages
- "Get Bulk Quote" existing theme (`StoreHeader`, `StickyCtaBar`) retains `bg-primary` behavior unless modified

---

## CMS Data Visibility & No-Cache Guarantee

- **Admin side**: `adminFetch` in `src/lib/admin-fetch.ts` uses `cache: 'no-store'`. Every admin save/read hits the database directly with no browser or CDN cache.
- **Frontend side**: `CmsPage.tsx`, `HomePage.tsx`, `ContentPageView.tsx`, and all CMS blocks use plain `fetch('/api/content-pages?slug=...')` with no `cache`, `revalidate`, or TTL. `ContentPage` API route sets `export const dynamic = 'force-dynamic'` with no `Cache-Control` headers.
- **No Zustand/React Query/SWR cache** exists for CMS content. Content is re-fetched fresh on every page mount.
- **Seed/Auto-seed** logic (`seed/route.ts`) is create-if-not-exists only; it **never overwrites** existing CMS records. If a page is deleted, frontend auto-seeds defaults, but in-place edits are never clobbered.
- **Result**: Any content added or updated in the CMS block editor is visible immediately to admin users and to storefront visitors on the next page load. No additional cache-busting or revalidation steps are required.

---

## Files to Modify (Summary)

| File                                                 | Changes                                                |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `src/components/ThemeProvider.tsx`                   | Remove next-themes, force light                        |
| `src/app/globals.css`                                | Remove `.dark` overrides                               |
| `tailwind.config.ts`                                 | Remove `darkMode: "class"`                             |
| `src/components/store/StoreHeader.tsx`               | Remove theme toggles, possibly simplify nav            |
| `src/components/store/StoreFooter.tsx`               | Remove WhatsApp link + newsletter                      |
| `src/components/store/StoreLayout.tsx`               | Add announcement bar, full-width wrapper               |
| `src/components/store/HomePage.tsx`                  | Update block defaults (6 categories, no sticky-cta)    |
| `src/components/store/PageBlockRenderer.tsx`         | Pass CMS colors to blocks                              |
| `src/lib/page-blocks.ts`                             | Add `ctaButtonColor` etc to block types                |
| `src/components/store/AboutPage.tsx`                 | Author images, remove WhatsApp/tags, fix colors        |
| `src/components/store/ManufacturingPage.tsx`         | Tabs → products, fix colors, add shared form, hide PDF |
| `src/components/store/CataloguePage.tsx`             | Inline enquiry form, hide B2B banner, hide download    |
| `src/components/store/ContactPage.tsx`               | Fix colors, hide WhatsApp/CRM/prefer quicker           |
| `src/components/store/BlogPage.tsx`                  | Remove post pages, add category enquiry                |
| **NEW** `src/components/store/SharedContactForm.tsx` | Reusable unified form                                  |
| **NEW** `src/components/store/CategoryPage.tsx`      | Category-level landing page                            |
| `src/app/[[...slug]]/page.tsx`                       | Add route for `/catalogue/[slug]`                      |

---

## Open Questions for User

1. **Announcement bar**: Should it be a CMS-editable block (text, link, dismissible) or a static banner?
2. **Homepage navigation removal**: Remove entire `<nav>` / header from homepage, or just simplify links?
3. **Contact form on same page (catalogue/manufacturing)**: Modal overlay or inline section?
4. **Blog category pages**: Full `/blog/category/[slug]` page, or just an enquiry-trigger button on the blog listing?
5. **Sticky CTA replacement**: Should the `sticky-cta` block type be deleted from `page-blocks.ts` and DB, or just hidden via `visible: false` default?
