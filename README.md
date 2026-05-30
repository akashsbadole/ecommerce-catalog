# StyleStore — B2B E-Commerce Catalogue CMS

A full-featured **Next.js 16** single-page e-commerce catalogue CMS with B2B wholesale capabilities, built for managing product catalogues, processing B2B enquiries, and delivering a rich storefront experience.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (React 19, Turbopack) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Prisma 6 |
| Auth | JWT (jose) + bcryptjs + RBAC |
| State | Zustand 5 + TanStack React Query 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix primitives) |
| UI Animations | Framer Motion + tailwindcss-animate |
| Rich Text | MDXEditor |
| Charts | Recharts |
| Drag & Drop | dnd-kit |
| Email | Nodemailer |
| Testing | Playwright |

## Features

### Storefront
- Product catalogue with search, filter, sort, pagination
- Product detail with images, variants, tiered B2B pricing
- Quick-view modal & enquiry/RFQ forms
- Blog with tags and search
- Dynamic content pages (About, Shipping, Terms, Privacy)
- Contact form with B2B fields
- Buyer portal for account management
- Newsletter subscription
- SEO: JSON-LD schemas, sitemap, robots.txt, meta fields
- Cookie consent banner

### Admin Dashboard
- Dashboard with analytics & charts
- Products: full CRUD, variants, B2B tiers, bulk actions, CSV import/export
- Categories: hierarchical (parent/child), bulk operations
- Enquiries: status management, B2B enquiry workflow
- Media library: upload, folders, thumbnails
- Content pages with drag-and-drop PageBuilder
- Blog: CRUD, publish/unpublish
- Banners: CRUD with sort order
- URL redirects: 301/302 management
- Users: admin/clerk management with RBAC
- Activity log: audit trail with filters
- Site settings: SMTP, SEO, B2B config
- Global search (Cmd+K)

### B2B Features
- Wholesale pricing per product
- Volume-based pricing tiers (ProductTier)
- Product variants (size, color, etc.)
- Min order quantity enforcement
- B2B enquiry/RFQ workflow
- Buyer portal with account status & history
- WhatsApp integration for product enquiries

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (Neon or local)

### Installation

```bash
npm install
cp .env.example .env
```

Configure your `.env` file with:
- `DATABASE_URL` — PostgreSQL connection string
- `DIRECT_URL` — Direct (non-pooled) connection for migrations
- `JWT_SECRET` — Secret key for JWT tokens
- `JWT_EXPIRES_IN` — Token expiry (default: `7d`)
- `NEXT_PUBLIC_SITE_URL` — Site URL (default: `http://localhost:3000`)

### Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed demo data
npx tsx prisma/seed.ts
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@store.com | admin123 |
| Clerk | clerk@store.com | clerk123 |

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `next dev -p 3000` | Start dev server |
| `npm run build` | `next build` | Build for production |
| `npm run start` | `node .next/standalone/server.js` | Start production server |
| `npm run lint` | `eslint .` | Lint code |
| `npm run db:push` | `prisma db push` | Push schema to database |
| `npm run db:generate` | `prisma generate` | Generate Prisma client |
| `npm run db:migrate` | `prisma migrate dev` | Run Prisma migrations |
| `npm run db:reset` | `prisma migrate reset` | Reset database & re-run migrations |

## Project Structure

```
src/
  app/             Next.js App Router (API routes + layout)
    api/           65+ API route files
    page.tsx       SPA entry point
    layout.tsx     Root layout
    portal/        Buyer portal page
  components/
    admin/         Admin dashboard components (14 sections)
    store/         Storefront components (12 pages/sections)
    ui/            shadcn/ui components (40+ primitives)
  lib/             Utilities (db, auth, store, validations, email, etc.)
  hooks/           Custom React hooks
  middleware.ts    Edge middleware for auth/RBAC
prisma/
  schema.prisma    16 models
  seed.ts          Demo data
  migrations/      Prisma migrations
```

## Deployment

### Docker

```bash
docker build -t stylestore .
docker run -d -p 3000:3000 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  stylestore
```

### Vercel

Connect your Neon PostgreSQL database and deploy via Vercel dashboard.

See `DEPLOY.md` for detailed deployment instructions (Docker, reverse proxy with Caddy/Nginx, monitoring).
