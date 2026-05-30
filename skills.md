# StyleStore Project Skills

## Architecture Overview

This is a **Next.js 16 Single Page Application (SPA)** — all page transitions happen client-side via Zustand state (`store.ts`), not Next.js file-based routing. The root `page.tsx` renders a single component (`MainApp`) that switches between storefront views and the admin dashboard based on `currentPage` state.

**Two apps in one:**
- **Storefront** — Public-facing catalogue, blog, content pages, buyer portal
- **Admin Dashboard** — Password-protected CMS with 14 sections

## Key Architectural Decisions

### SPA Navigation (not file-based routing)
- `src/lib/store.ts` — `useAppStore` with `navigate(page)` action
- `src/app/page.tsx` — `MainApp` renders store or admin based on state
- All storefront pages: home, catalogue, product, blog, blog-post, contact, content-page
- Admin tabs: dashboard, analytics, products, categories, enquiries, media, pages, blog, banners, redirects, users, activity-log, data-export, settings

### Authentication
- **JWT-based** using `jose` library (HS256 algorithm)
- `src/lib/auth.ts` — Token generation & verification (Node.js runtime)
- `src/lib/auth-edge.ts` — Token verification (Edge runtime)
- `src/middleware.ts` — Protects admin API routes with RBAC
- Two roles: `admin` (full access) and `clerk` (restricted write access)
- Token stored in Zustand's persisted state (localStorage `app-storage`), with fallback to `admin_token` key

### Database
- PostgreSQL via Neon Serverless
- Prisma ORM with `@prisma/adapter-neon` for connection pooling
- `src/lib/db.ts` — Singleton PrismaClient cached on `globalThis`
- Two connection URLs: `DATABASE_URL` (pooled for runtime), `DIRECT_URL` (direct for migrations)
- 16 models covering products, categories, variants, tiers, enquiries, users, blog, content, banners, media, etc.

### State Management
- **Zustand 5** with `persist` middleware — Client-side app state (navigation, auth, settings)
- **TanStack React Query 5** — Server state caching in admin components

### Styling
- Tailwind CSS 4 with `@tailwindcss/typography` (prose classes)
- `tw-animate-css` for animations
- shadcn/ui design system (40+ Radix-based components in `src/components/ui/`)
- Dark mode via `next-themes` with `.dark` class

## Admin Dashboard Components

| Section | File | Key Features |
|---------|------|-------------|
| Dashboard | `AdminDashboardHome.tsx` | Stats, recent activity, charts |
| Analytics | `AdminAnalytics.tsx` | Recharts (bar, line, pie) |
| Products | `AdminProducts.tsx` | CRUD, variants, tiers, bulk, CSV, WYSIWYG |
| Categories | `AdminCategories.tsx` | CRUD, hierarchy, bulk |
| Enquiries | `AdminEnquiries.tsx` | Status management, B2B workflow |
| Media | `AdminMedia.tsx` | Upload, folders, thumbnails |
| Pages | `AdminPages.tsx` | PageBuilder (drag-and-drop blocks) |
| Blog | `AdminBlog.tsx` | CRUD, publish/unpublish |
| Banners | `AdminBanners.tsx` | CRUD, sort order |
| Redirects | `AdminRedirects.tsx` | 301/302 management |
| Users | `AdminUsers.tsx` | Admin/clerk management |
| Activity Log | `AdminActivityLog.tsx` | Audit trail |
| Data Export | `AdminDataExport.tsx` | CSV export |
| Settings | `AdminSettings.tsx` | Site config, SMTP, SEO, B2B |

## Storefront Components

| Page | File | Description |
|------|------|-------------|
| Home | `HomePage.tsx` | Banners, categories, featured products, blog, newsletter |
| Catalogue | `CataloguePage.tsx` | Product grid, search, filters, quick view |
| Product Detail | `ProductDetailPage.tsx` | Full detail, variants, tiers, enquiry |
| Blog | `BlogPage.tsx` | Blog listing with tags |
| Blog Post | `BlogPostView.tsx` | Single post |
| Content Page | `ContentPageView.tsx` | Dynamic pages via PageBuilder |
| Contact | `ContactPage.tsx` | Contact form |
| Buyer Portal | `portal/page.tsx` | Account status, history |
| Layout | `StoreLayout.tsx` | Header, footer, search, theme toggle |

## API Architecture

- **65+ route files** in `src/app/api/`
- Public routes (catalogue, blog, content, banners, settings, sitemap, robots, health, contact, enquiries, newsletter subscribe, auth)
- Admin routes protected by middleware RBAC
- Key patterns: `adminFetch()` automatically attaches JWT Bearer token
- Rate limiting on sensitive endpoints (login, contact, enquiries, upload)

## Common Development Patterns

### Adding a new API route
1. Create file in `src/app/api/<resource>/route.ts` (or `[id]/route.ts` for dynamic routes)
2. Export `GET`, `POST`, `PUT`, `DELETE`, or `PATCH` async functions
3. Use `NextRequest` and `NextResponse` from `next/server`
4. Use `db` from `@/lib/db` for database access
5. Use `auth.ts` utilities for protected operations

### Adding a new admin section
1. Create component in `src/components/admin/`
2. Add import & case in `AdminDashboard.tsx` `renderContent()` switch
3. Add sidebar navigation entry in `AdminDashboard.tsx` sidebar mapping

### Adding a new storefront page
1. Create component in `src/components/store/`
2. Add import & case in `src/app/page.tsx` `renderStoreContent()` switch

### Adding a new UI component
1. Create file in `src/components/ui/` following shadcn/ui conventions
2. Use `cn()` from `@/lib/utils` for class merging
3. Use Radix primitives for accessible behavior

## Database Schema

See `prisma/schema.prisma` for full schema. Key models:
- `User` (admin/clerk with roles and B2B fields)
- `Product` (with B2B pricing, stock, images, specs, SEO)
- `Category` (hierarchical with parent/children)
- `ProductVariant` (size/color/options per product)
- `ProductTier` (volume-based pricing)
- `Enquiry` (B2B enquiries linked to products/users)
- `BlogPost` (with soft delete, SEO fields, blocks)
- `ContentPage` (with PageBuilder blocks)
- `Banner` (homepage banners)
- `Media` (file library with thumbnails)
- `SiteSetting` (key-value configuration)
- `ActivityLog` (audit trail)
- `Notification` (in-app notifications)
- `Redirect` (URL redirects)
- `PasswordResetToken` (password recovery)
- `NewsletterSubscriber` (email subscriptions)

## Deployment Notes

- **Build output:** `next build` with `output: "standalone"` in `next.config.ts`
- **Static files:** Copy `.next/static` and `public` to standalone directory
- **Database:** PostgreSQL via Neon (or any PostgreSQL provider)
- **Docker:** Multi-stage build (node:20-alpine)
- **Reverse proxy:** Caddy (`Caddyfile`) or Nginx examples in `DEPLOY.md`
- **Monitoring:** Health check at `GET /api/health`
- **Vercel:** Compatible via `vercel.json`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | Pooled PostgreSQL connection string |
| `DIRECT_URL` | Yes | — | Direct PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiry |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public site URL |
| `SMTP_HOST` | No | — | Email SMTP host |
| `SMTP_PORT` | No | — | Email SMTP port |
| `SMTP_USER` | No | — | Email SMTP username |
| `SMTP_PASS` | No | — | Email SMTP password |
| `EMAIL_FROM` | No | — | From address for emails |
