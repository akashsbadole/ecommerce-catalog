# WCommerce Catalogue - User Guide

## Introduction

WCommerce Catalogue is a multi-tenant e-commerce platform that lets businesses create and manage their own online stores. This guide covers the main features for store owners (admins) and customers (buyers).

## Table of Contents

- [For Store Owners (Admins)](#for-store-owners-admins)
  - [Logging In](#admin-login)
  - [Dashboard](#dashboard)
  - [Product Management](#product-management)
  - [Category Management](#category-management)
  - [B2B: Enquiries & Quotes](#b2b-enquiries--quotes)
  - [Company Management](#company-management)
  - [Customer Management](#customer-management)
  - [Blog & Content Pages](#blog--content-pages)
  - [Media Library](#media-library)
  - [Banners](#banners)
  - [Settings](#settings)
  - [Multi-Store Management](#multi-store-management)
  - [Backup & Restore](#backup--restore)
  - [Import & Export](#import--export)
- [For Customers (Buyers)](#for-customers-buyers)
  - [Browsing Products](#browsing-products)
  - [Enquiries & Quotes](#enquiries--quotes-buyer)
  - [Contact Form](#contact-form)

---

## For Store Owners (Admins)

### Admin Login

1. Navigate to `/admin`
2. Enter your email and password
3. Click **Login**

The admin dashboard provides full control over your store.

### Dashboard

The dashboard shows:

- **Total Products** - Number of active products
- **Total Orders** - Number of orders received
- **Total Revenue** - Sum of all confirmed orders
- **Enquiries** - New and total enquiry counts
- **Quote Stats** - Sent, accepted, and total quote values
- **Enquiry Trends** - 30-day chart of daily enquiries
- **Recent Activity** - Latest actions performed in the admin

### Product Management

#### Adding a Product

1. Go to **Products** tab
2. Click **Add Product**
3. Fill in:
   - **Name** (required) - Product title
   - **Slug** - Auto-generated from name, editable
   - **Description** - Full product description
   - **Short Description** - Brief summary for listings
   - **Price** (required) - Regular selling price
   - **Compare Price** - Original/struck-through price (optional)
   - **Wholesale Price** - B2B pricing (optional)
   - **SKU** - Stock Keeping Unit identifier
   - **Stock** - Available quantity
   - **Low Stock Threshold** - Alert level for low stock
   - **Category** - Assign to a category
   - **Images** - Upload product images
   - **Specifications** - Technical specs
   - **Min Order Qty** - Minimum order quantity for B2B
   - **WhatsApp Number** - For quick enquiry via WhatsApp
4. Click **Save**

#### Product Variants

For products with options (size, color, etc.):

1. Open a product
2. Go to **Variants** section
3. Add variants with independent pricing, SKU, stock, and images

#### Bulk Actions

Select multiple products to:

- Publish / Unpublish
- Delete (soft) / Restore
- Permanent Delete

#### Trash & Restore

Deleted products go to Trash. You can restore them or permanently delete.

### Category Management

1. Go to **Categories** tab
2. Create categories with name, slug, description, and image
3. Support **hierarchical nesting** (parent/child categories)
4. Categories with active products cannot be deleted

#### Category Landing Pages

Each category has a **rich landing page** with dedicated builder sections:

| Field | Description |
|---|---|
| **Hero** | Large banner with heading, subtext, and optional buttons |
| **Content Split** | Two-column text + image section |
| **Cards** | Feature / info cards grid |
| **CTA** | Call-to-action banner with button |
| **Process** | Step-by-step process flow (up to 4 steps) |
| **Infographic** | Image-rich infographic section |

These fields render on the storefront at `/product/<slug>` (e.g. `/product/khakhra`). Use them to create branded, content-rich category landing pages — no coding required.

Categories also support the full **Page Builder** via the block editor for more complex layouts (26+ block types available).

### B2B: Enquiries & Quotes

#### Enquiries

- View all product enquiries and contact form submissions
- Update status: New > Contacted > In Progress > Resolved > Closed
- Link enquiries to products and users
- Bulk update status or delete

#### Quotes

1. Go to **Quotes** tab
2. Create formal quotes for customers:
   - Link to an enquiry
   - Add line items with products, quantities, and prices
   - Set validity date
   - Add notes and admin notes
3. Send quotes to customers
4. Track status: Draft > Sent > Accepted > Rejected

### Company Management

- View all registered B2B companies
- Verify companies (grants verified status to all company users)
- Assign pricing tiers: Standard, Silver, Gold, Platinum
- View company users, enquiries, and quotes

### Customer Management

1. Go to **Users** tab
2. View all registered users
3. Manage roles: Admin, Clerk, Buyer
4. Activate/deactivate users
5. Bulk operations: delete, activate, deactivate
6. Import users from CSV

### Blog & Content Pages

#### Blog

1. Go to **Blog** tab
2. Create posts with WYSIWYG editor
3. Add block-based content (26 block types available)
4. Set SEO meta tags, cover image, tags
5. Publish/unpublish workflow

#### Content Pages

1. Go to **Pages** tab
2. Build pages using the **Page Builder** with drag-and-drop blocks:
   - Hero sections
   - Feature grids
   - Testimonials
   - FAQ sections
   - Product carousels
   - Pricing tables
   - Partner logos
   - And 18 more block types
3. Set SEO fields (meta title, description, OG image)
4. Custom JSON schema for advanced SEO

### Media Library

- Upload images, PDFs, CSVs, Excel files
- Organize into folders
- Search and filter by type
- Edit alt text
- 10MB per file, max 20 files per upload

### Banners

- Create homepage banners with title, subtitle, image, and link
- Set sort order for display priority
- Activate/deactivate banners

### Settings

Configure your store under the **Settings** tab:

- **General**: Site name, description, logo, favicon
- **SMTP**: Email server configuration for notifications
- **B2B**: Enable/disable B2B features, set tier discounts
- **Tax**: Tax rate configuration
- **SEO**: Default meta tags, schema.org settings

### Multi-Store Management

If you operate multiple stores:

1. Go to **Stores** in admin
2. Create new stores with unique slugs
3. Switch between stores from the admin
4. Each store has isolated data (products, orders, settings)

### Backup & Restore

- **Backup**: Export all data as JSON (products, orders, users, settings, etc.)
- **Restore**: Import from a JSON backup file
- Settings and categories are upserted during restore

### Import & Export

#### CSV Import

- Products, categories, blog posts, users, redirects
- Shopify CSV import supported
- WooCommerce CSV import supported

#### CSV Export

- Export any entity type as CSV download

---

## For Customers (Buyers)

### Browsing Products

1. Visit the store homepage
2. Browse **Featured Products** or navigate to **Catalogue** (`/product`)
3. Use **filters** to narrow by:
   - Category
   - Price range
   - In-stock availability
4. **Search** for products by name or description (opens enquiry modal directly)
5. **Sort** by relevance, price, newest, or name
6. Click a **category** to view its landing page at `/product/<slug>` with hero, cards, CTA, and other sections
7. Click **Enquire** on any product card to open the enquiry modal — fill in quantity and message to send a request directly to the admin

### Enquiries & Quotes (Buyer)

#### Submitting an Enquiry

1. On any **product card** (category pages, search results, featured products), click **Enquire**
2. Fill in name, email, phone, quantity, and message
3. Submit — admins will respond with a formal quote

#### Responding to Quotes

1. Go to **Portal** > **Quotes**
2. View quote details with line items and totals
3. **Accept** or **Decline** the quote
4. Accepted quotes can proceed to order

### Contact Form

- Visit the **Contact** page
- Fill in name, email, subject, and message
- Submit - you'll receive a confirmation email

---

## Frequently Asked Questions

### How do I reset my password?

1. Click **Forgot Password** on the login page
2. Enter your email address
3. Check your email for a reset link (valid for 1 hour)
4. Click the link and set a new password

### How do I become a B2B buyer?

1. Click **Register** and select B2B registration
2. Provide your company details (name, tax ID, address)
3. Wait for admin verification
4. Once verified, you'll have access to B2B pricing and the Buyer Portal

### What pricing tiers are available?

| Tier     | Discount |
| -------- | -------- |
| Standard | 0%       |
| Silver   | 5%       |
| Gold     | 10%      |
| Platinum | 15%      |

Tiers are assigned by the admin based on your business relationship.

---

## Blocks Reference

This section documents every block type available in the Page Builder, their JSON data structures, and how content editors can use them to build pages.

### PageBuilder Overview

Located in the **Pages** tab of the admin dashboard, the PageBuilder is a drag-and-drop interface for building content pages and blog posts.

**Adding a block:**

1. Open a page in the PageBuilder
2. Click **Add Block** from the sidebar
3. Select a block type — it appends to the bottom of the block list
4. Drag to reorder, or use the up/down arrows

**Two editing modes:**

- **UI Editor** — dedicated form fields for each block type (simpler blocks only; page content blocks show a notice to use the JSON Editor)
- **JSON Editor** — raw JSON textarea for direct editing of the block's `data` object. Required for Page Content Blocks and advanced customisation

**Block actions:**

- **Drag handle** (left side) — click and drag to reorder
- **Move up/down** — reorder by one position
- **Duplicate** — copies the block and its data
- **Edit** — opens the editor dialog
- **Delete** — removes the block (confirm dialog)

**Preview mode:** Toggle the eye icon to preview the page at desktop, tablet, or mobile width.

---

### Layout Blocks

Simple, flat JSON structures for basic page sections.

#### Hero

Full-width banner section with background image, heading, and optional button.

```json
{
  "title": "Welcome",
  "subtitle": "",
  "buttonText": "Learn More",
  "buttonLink": "/products",
  "backgroundImage": "",
  "height": "medium",
  "alignment": "center"
}
```

| Field             | Type                           | Description                             |
| ----------------- | ------------------------------ | --------------------------------------- |
| `title`           | string                         | Main heading text                       |
| `subtitle`        | string                         | Sub-heading below the title             |
| `buttonText`      | string                         | CTA button label (empty = no button)    |
| `buttonLink`      | string                         | Button destination URL or page slug     |
| `backgroundImage` | string                         | Cloudinary image URL for the background |
| `height`          | `"small"` `"medium"` `"large"` | Section height preset                   |
| `alignment`       | `"center"` `"left"` `"right"`  | Text alignment within the hero          |

#### Hero Carousel

Rotating slideshow of hero banners with autoplay.

```json
{
  "slides": [
    {
      "image": "",
      "title": "Slide 1",
      "subtitle": "Description for slide 1",
      "buttonText": "Shop Now",
      "buttonLink": "/distribution"
    },
    {
      "image": "",
      "title": "Slide 2",
      "subtitle": "Description for slide 2",
      "buttonText": "Learn More",
      "buttonLink": "/about"
    }
  ],
  "autoplay": true,
  "interval": 6000,
  "height": "large",
  "alignment": "center"
}
```

| Field                 | Type    | Description                                  |
| --------------------- | ------- | -------------------------------------------- |
| `slides[].image`      | string  | Slide background image URL                   |
| `slides[].title`      | string  | Slide heading                                |
| `slides[].subtitle`   | string  | Slide sub-heading                            |
| `slides[].buttonText` | string  | CTA button label                             |
| `slides[].buttonLink` | string  | CTA destination                              |
| `autoplay`            | boolean | Auto-advance slides                          |
| `interval`            | number  | Milliseconds between slides (e.g. 6000 = 6s) |
| `height`              | string  | Height preset                                |
| `alignment`           | string  | Text alignment                               |

#### Text

Simple rich-text block. Supports HTML content.

```json
{
  "content": "<p>Enter your text here...</p>"
}
```

| Field     | Type   | Description                                                                                     |
| --------- | ------ | ----------------------------------------------------------------------------------------------- |
| `content` | string | HTML content. Supports `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<a>`, `<img>`, `<strong>`, `<em>` |

#### Image Gallery

Grid of images with configurable column count.

```json
{
  "title": "Gallery",
  "columns": 3,
  "images": [""]
}
```

| Field     | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `title`   | string   | Section heading                |
| `columns` | number   | Number of columns (2, 3, or 4) |
| `images`  | string[] | Array of Cloudinary image URLs |

#### Features

Grid of icon + title + description cards.

```json
{
  "title": "Our Features",
  "columns": 3,
  "features": [
    { "title": "Feature 1", "description": "Description text", "icon": "Star" }
  ]
}
```

| Field                    | Type   | Description                                 |
| ------------------------ | ------ | ------------------------------------------- |
| `title`                  | string | Section heading                             |
| `columns`                | number | Grid columns (2, 3, or 4)                   |
| `features[].title`       | string | Feature card heading                        |
| `features[].description` | string | Feature description text                    |
| `features[].icon`        | string | Lucide icon name (see Icon Reference below) |

#### CTA (Call to Action)

Strip with heading, description, and a button.

```json
{
  "title": "Get Started Today",
  "description": "Contact us now",
  "buttonText": "Get Quote",
  "buttonLink": "/contact",
  "backgroundColor": "primary"
}
```

| Field             | Type                           | Description               |
| ----------------- | ------------------------------ | ------------------------- |
| `title`           | string                         | CTA heading               |
| `description`     | string                         | Supporting text           |
| `buttonText`      | string                         | Button label              |
| `buttonLink`      | string                         | Button destination        |
| `backgroundColor` | `"primary"` `"dark"` `"light"` | Section background colour |

#### Testimonials

Quote cards from customers or partners.

```json
{
  "title": "What Our Clients Say",
  "testimonials": [
    {
      "name": "John Doe",
      "role": "CEO",
      "quote": "Great service!",
      "avatar": ""
    }
  ]
}
```

| Field                   | Type   | Description                 |
| ----------------------- | ------ | --------------------------- |
| `title`                 | string | Section heading             |
| `testimonials[].name`   | string | Person's name               |
| `testimonials[].role`   | string | Person's title/role         |
| `testimonials[].quote`  | string | Testimonial text            |
| `testimonials[].avatar` | string | Avatar image URL (optional) |

#### FAQ

Accordion-style questions and answers.

```json
{
  "title": "Frequently Asked Questions",
  "items": [{ "question": "Question?", "answer": "Answer text." }]
}
```

| Field              | Type   | Description                 |
| ------------------ | ------ | --------------------------- |
| `title`            | string | Section heading             |
| `items[].question` | string | The question                |
| `items[].answer`   | string | The answer (HTML supported) |

#### Spacer

Vertical spacing between blocks.

```json
{ "height": 64 }
```

| Field    | Type   | Description             |
| -------- | ------ | ----------------------- |
| `height` | number | Spacer height in pixels |

#### Divider

Horizontal rule / separator line.

```json
{ "style": "solid" }
```

| Field   | Type                            | Description |
| ------- | ------------------------------- | ----------- |
| `style` | `"solid"` `"dashed"` `"dotted"` | Line style  |

#### Products

Dynamic product showcase grid. Pulls products from the catalogue automatically.

```json
{
  "title": "Featured Products",
  "maxProducts": 6,
  "layout": "grid"
}
```

| Field         | Type                           | Description                 |
| ------------- | ------------------------------ | --------------------------- |
| `title`       | string                         | Section heading             |
| `maxProducts` | number                         | Maximum products to display |
| `layout`      | `"grid"` `"list"` `"carousel"` | Display layout              |

---

### Library Blocks

Medium-complexity blocks for specific content patterns.

#### Slider

Full-width image slider with captions and optional CTA.

```json
{
  "items": [
    { "image": "", "title": "Slide 1", "subtitle": "Description 1", "link": "" }
  ],
  "autoplay": true,
  "interval": 5000,
  "ctaButtonColor": "var(--primary)",
  "ctaTextColor": "#FFFFFF",
  "showButton": true,
  "fullWidth": true
}
```

| Field              | Type    | Description                     |
| ------------------ | ------- | ------------------------------- |
| `items[].image`    | string  | Image URL                       |
| `items[].title`    | string  | Slide title                     |
| `items[].subtitle` | string  | Slide description               |
| `items[].link`     | string  | Optional link destination       |
| `autoplay`         | boolean | Auto-advance                    |
| `interval`         | number  | Millisecond interval            |
| `ctaButtonColor`   | string  | Button CSS colour               |
| `ctaTextColor`     | string  | Button text CSS colour          |
| `showButton`       | boolean | Show/hide CTA button            |
| `fullWidth`        | boolean | Full browser width vs contained |

#### Product Carousel

Horizontal product carousel from a specific category.

```json
{
  "title": "Our Products",
  "maxProducts": 10,
  "categoryId": ""
}
```

| Field         | Type   | Description                         |
| ------------- | ------ | ----------------------------------- |
| `title`       | string | Section heading                     |
| `maxProducts` | number | Max products to show                |
| `categoryId`  | string | Filter by category ID (empty = all) |

#### About Section

Text + image split layout for company info.

```json
{
  "title": "About Us",
  "content": "<p>Tell your story here...</p>",
  "image": "",
  "imagePosition": "left",
  "buttonText": "Read More",
  "buttonLink": ""
}
```

| Field           | Type               | Description            |
| --------------- | ------------------ | ---------------------- |
| `title`         | string             | Section heading        |
| `content`       | string             | HTML content           |
| `image`         | string             | Image URL              |
| `imagePosition` | `"left"` `"right"` | Image side             |
| `buttonText`    | string             | CTA button label       |
| `buttonLink`    | string             | CTA button destination |

#### Trust Bar

Highlight numbers / statistics row.

```json
{
  "stats": [
    { "value": 15, "suffix": "+", "label": "Years in manufacturing" },
    { "value": 5000, "suffix": "+", "label": "MT annual capacity" },
    { "value": 80, "suffix": "+", "label": "SKUs across categories" },
    { "value": 12, "suffix": "+", "label": "States served" },
    { "value": 100, "suffix": "%", "label": "Own manufacturing" }
  ]
}
```

| Field            | Type   | Description                        |
| ---------------- | ------ | ---------------------------------- |
| `stats[].value`  | number | The number to display              |
| `stats[].suffix` | string | Text after the number (+, %, etc.) |
| `stats[].label`  | string | Description below the number       |

#### Audience Cards

Cards targeting different B2B buyer types with individual CTAs.

```json
{
  "label": "Who we serve",
  "heading": "We manufacture for",
  "description": "From first batch to full-scale production",
  "ctaButtonColor": "var(--primary)",
  "ctaTextColor": "#FFFFFF",
  "showButton": true,
  "cards": [
    {
      "title": "B2B brands",
      "description": "Bulk supply of finished goods under your brand",
      "cta": "Enquire now",
      "link": "/contact"
    },
    {
      "title": "Private label",
      "description": "Custom packaging, your branding, our recipe",
      "cta": "Get details",
      "link": "/contact"
    },
    {
      "title": "Distributors",
      "description": "Trade pricing, consistent supply, multi-SKU range",
      "cta": "Partner with us",
      "link": "/contact"
    },
    {
      "title": "Institutional buyers",
      "description": "Canteens, airlines, hospitality, govt procurement",
      "cta": "Send requirement",
      "link": "/contact"
    }
  ]
}
```

| Field                 | Type    | Description                   |
| --------------------- | ------- | ----------------------------- |
| `label`               | string  | Small label above heading     |
| `heading`             | string  | Main section heading          |
| `description`         | string  | Section description paragraph |
| `ctaButtonColor`      | string  | Button CSS colour             |
| `ctaTextColor`        | string  | Button text CSS colour        |
| `showButton`          | boolean | Show shared CTA button        |
| `cards[].title`       | string  | Card heading                  |
| `cards[].description` | string  | Card text                     |
| `cards[].cta`         | string  | Card button label             |
| `cards[].link`        | string  | Card button destination       |

#### Capabilities

Manufacturing capabilities with image gallery and CTA.

```json
{
  "label": "Manufacturing capabilities",
  "heading": "Why partner with us",
  "items": [
    "Own factory & machinery",
    "FSSAI & ISO certified",
    "5 production lines",
    "Custom packaging ready",
    "Hygiene-first processes",
    "On-time delivery"
  ],
  "image": "",
  "videoUrl": "",
  "imageCaption": "Facility / production line image",
  "galleryImages": ["", "", "", ""],
  "ctaText": "View full capabilities",
  "ctaLink": "/page/manufacturing"
}
```

| Field           | Type     | Description                   |
| --------------- | -------- | ----------------------------- |
| `label`         | string   | Small label above heading     |
| `heading`       | string   | Main heading                  |
| `items`         | string[] | Bullet list of capabilities   |
| `image`         | string   | Main image URL                |
| `videoUrl`      | string   | Optional video URL            |
| `imageCaption`  | string   | Caption below image           |
| `galleryImages` | string[] | Additional gallery image URLs |
| `ctaText`       | string   | CTA button label              |
| `ctaLink`       | string   | CTA button destination        |

#### Product Categories

Preview grid of product categories with CTAs.

```json
{
  "label": "Our product range",
  "heading": "Product categories",
  "description": "Manufactured in-house...",
  "categoryIds": [],
  "categories": [
    { "name": "Khakhra", "variants": "12+ variants" },
    { "name": "Bhakhri", "variants": "8+ varieties" },
    { "name": "Makhana", "variants": "6+ flavours" },
    { "name": "Extruder", "variants": "10+ shapes" },
    { "name": "Digestive", "variants": "5+ varieties" },
    { "name": "Seeds & Nuts", "variants": "10+ varieties" }
  ],
  "ctaText": "View all products & packaging",
  "ctaLink": "/distribution",
  "ctaButtonColor": "var(--primary)",
  "ctaTextColor": "#FFFFFF",
  "showButton": true
}
```

| Field                   | Type     | Description                                           |
| ----------------------- | -------- | ----------------------------------------------------- |
| `label`                 | string   | Small label above heading                             |
| `heading`               | string   | Main heading                                          |
| `description`           | string   | Description paragraph                                 |
| `categoryIds`           | string[] | Filter by specific category IDs                       |
| `categories`            | array    | Static category list (used when categoryIds is empty) |
| `categories[].name`     | string   | Category display name                                 |
| `categories[].variants` | string   | Variant count text                                    |
| `ctaText`               | string   | CTA button label                                      |
| `ctaLink`               | string   | CTA destination                                       |
| `showButton`            | boolean  | Show CTA button                                       |

#### Factory Reel

Video showcase for factory tour or facility walkthrough.

```json
{
  "label": "Factory & facility reel",
  "heading": "See our facility in action",
  "description": "Factory floor · machinery · warehouse ...",
  "videoUrl": "",
  "thumbnailUrl": "",
  "ctaText": "Watch full factory tour",
  "ctaLink": "/page/manufacturing"
}
```

| Field          | Type   | Description                   |
| -------------- | ------ | ----------------------------- |
| `label`        | string | Small label above heading     |
| `heading`      | string | Main heading                  |
| `description`  | string | Description text              |
| `videoUrl`     | string | Video URL (YouTube or direct) |
| `thumbnailUrl` | string | Cover image before play       |
| `ctaText`      | string | CTA button label              |
| `ctaLink`      | string | CTA destination               |

#### Certifications (Award)

Certifications and compliance badges with optional gallery.

```json
{
  "label": "Certifications & compliance",
  "heading": "Certified. Compliant. Trusted.",
  "items": ["FSSAI", "ISO", "BIS", "HACCP", "GMP"],
  "ctaText": "View all certifications",
  "ctaLink": "/page/manufacturing",
  "gallery": [{ "image": "", "caption": "" }]
}
```

| Field               | Type     | Description               |
| ------------------- | -------- | ------------------------- |
| `label`             | string   | Small label above heading |
| `heading`           | string   | Main heading              |
| `items`             | string[] | Certification names       |
| `ctaText`           | string   | CTA button label          |
| `ctaLink`           | string   | CTA destination           |
| `gallery[].image`   | string   | Certificate image URL     |
| `gallery[].caption` | string   | Image caption             |

#### Leadership

Team/director profile cards.

```json
{
  "label": "Leadership",
  "heading": "Meet the leadership",
  "ctaText": "Read full story",
  "ctaLink": "/page/about-us",
  "members": [
    {
      "name": "Director name",
      "role": "Co-founder & Director",
      "bio": "20+ yrs FMCG distribution...",
      "image": ""
    },
    {
      "name": "Director name",
      "role": "Co-founder & Director",
      "bio": "Operations & manufacturing lead...",
      "image": ""
    }
  ]
}
```

| Field             | Type   | Description               |
| ----------------- | ------ | ------------------------- |
| `label`           | string | Small label above heading |
| `heading`         | string | Main heading              |
| `ctaText`         | string | CTA button label          |
| `ctaLink`         | string | CTA destination           |
| `members[].name`  | string | Person's name             |
| `members[].role`  | string | Their title               |
| `members[].bio`   | string | Biography text            |
| `members[].image` | string | Profile photo URL         |

#### Partner Logos

Logo grid with optional testimonials.

```json
{
  "heading": "Trusted by brands across India",
  "logos": ["", "", ""],
  "testimonials": [
    {
      "quote": "\"Consistent quality, on-time delivery...\"",
      "author": "Brand name, City"
    },
    {
      "quote": "\"Private label setup was smooth...\"",
      "author": "Distributor name, State"
    },
    {
      "quote": "\"Scale, hygiene standards and response time...\"",
      "author": "Company name, State"
    }
  ]
}
```

| Field                   | Type     | Description      |
| ----------------------- | -------- | ---------------- |
| `heading`               | string   | Section heading  |
| `logos`                 | string[] | Logo image URLs  |
| `testimonials[].quote`  | string   | Testimonial text |
| `testimonials[].author` | string   | Attribution      |

#### Lead Capture

Customisable enquiry form with configurable fields.

```json
{
  "label": "Looking for a manufacturing partner?",
  "heading": "Let's talk manufacturing",
  "description": "Fill in your details...",
  "successMessage": "Enquiry submitted! We'll get back to you...",
  "apiEndpoint": "/api/enquiries",
  "submitText": "Submit enquiry — we'll call you back",
  "disclaimer": "Data goes directly to CRM...",
  "fields": [
    {
      "name": "name",
      "label": "Your name",
      "type": "text",
      "required": true,
      "placeholder": "Your name *"
    },
    {
      "name": "company",
      "label": "Company name",
      "type": "text",
      "required": true,
      "placeholder": "Company name *"
    },
    {
      "name": "phone",
      "label": "Phone number",
      "type": "tel",
      "required": true,
      "placeholder": "Phone number *"
    },
    {
      "name": "email",
      "label": "Email address",
      "type": "email",
      "required": false,
      "placeholder": "Email address"
    },
    {
      "name": "requirement",
      "label": "Requirement type",
      "type": "select",
      "required": false,
      "placeholder": "Requirement type",
      "options": [
        "Bulk order",
        "Private label",
        "Distribution",
        "Investment",
        "Other"
      ]
    },
    {
      "name": "city",
      "label": "City / state",
      "type": "text",
      "required": false,
      "placeholder": "City / state"
    }
  ],
  "messageField": true,
  "bgColor": "#016129"
}
```

| Field                  | Type                                  | Description                                  |
| ---------------------- | ------------------------------------- | -------------------------------------------- |
| `label`                | string                                | Small label above form                       |
| `heading`              | string                                | Form heading                                 |
| `description`          | string                                | Form description                             |
| `successMessage`       | string                                | Message shown after submit                   |
| `apiEndpoint`          | string                                | Backend endpoint (default: `/api/enquiries`) |
| `submitText`           | string                                | Submit button label                          |
| `disclaimer`           | string                                | Small text below form                        |
| `fields[]`             | array                                 | Form field definitions                       |
| `fields[].name`        | string                                | Field identifier (lowercase, no spaces)      |
| `fields[].label`       | string                                | Field label                                  |
| `fields[].type`        | `"text"` `"tel"` `"email"` `"select"` | Input type                                   |
| `fields[].required`    | boolean                               | Whether the field is mandatory               |
| `fields[].placeholder` | string                                | Placeholder text                             |
| `fields[].options`     | string[]                              | Dropdown options (only for `select` type)    |
| `messageField`         | boolean                               | Show a multi-line message textarea           |
| `bgColor`              | string                                | Form background hex colour                   |

#### Blog Grid

Recent blog posts grid/carousel.

```json
{
  "title": "Latest from our blog",
  "maxPosts": 6,
  "layout": "grid",
  "categoryId": "",
  "showFeatured": true
}
```

| Field          | Type                           | Description              |
| -------------- | ------------------------------ | ------------------------ |
| `title`        | string                         | Section heading          |
| `maxPosts`     | number                         | Max posts to show        |
| `layout`       | `"grid"` `"list"` `"carousel"` | Display layout           |
| `categoryId`   | string                         | Filter by blog category  |
| `showFeatured` | boolean                        | Show featured post first |

#### Pricing Table

Three-tier pricing comparison with features list.

```json
{
  "title": "Our Pricing",
  "description": "Choose the plan that suits your needs",
  "tiers": [
    {
      "name": "Basic",
      "price": "₹___",
      "description": "For small businesses",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "ctaText": "Get started",
      "ctaLink": "/contact",
      "highlighted": false
    },
    {
      "name": "Professional",
      "price": "₹___",
      "description": "For growing companies",
      "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
      "ctaText": "Get started",
      "ctaLink": "/contact",
      "highlighted": true
    },
    {
      "name": "Enterprise",
      "price": "Custom",
      "description": "For large organizations",
      "features": [
        "Feature 1",
        "Feature 2",
        "Feature 3",
        "Feature 4",
        "Feature 5"
      ],
      "ctaText": "Contact us",
      "ctaLink": "/contact",
      "highlighted": false
    }
  ]
}
```

| Field                 | Type     | Description                |
| --------------------- | -------- | -------------------------- |
| `title`               | string   | Section heading            |
| `description`         | string   | Section description        |
| `tiers[].name`        | string   | Tier name                  |
| `tiers[].price`       | string   | Price display text         |
| `tiers[].description` | string   | Tier description           |
| `tiers[].features`    | string[] | Feature bullet list        |
| `tiers[].ctaText`     | string   | Button label               |
| `tiers[].ctaLink`     | string   | Button destination         |
| `tiers[].highlighted` | boolean  | Mark as featured/spotlight |

#### Sticky CTA

Fixed-position bar at the bottom of the viewport for quick actions.

```json
{
  "visible": false,
  "text": "Ready to manufacture at scale?",
  "buttons": [
    {
      "text": "Get bulk quote",
      "type": "primary",
      "action": "enquiry",
      "link": "#contact"
    },
    {
      "text": "WhatsApp us",
      "type": "whatsapp",
      "action": "whatsapp",
      "link": "https://wa.me/91XXXXXXXXXX"
    },
    {
      "text": "+91 XXXXX XXXXX",
      "type": "phone",
      "action": "phone",
      "link": "tel:+91XXXXXXXXXX"
    }
  ]
}
```

| Field              | Type                                        | Description             |
| ------------------ | ------------------------------------------- | ----------------------- |
| `visible`          | boolean                                     | Show/hide the bar       |
| `text`             | string                                      | CTA message text        |
| `buttons[].text`   | string                                      | Button label            |
| `buttons[].type`   | `"primary"` `"whatsapp"` `"phone"`          | Button style variant    |
| `buttons[].action` | `"enquiry"` `"whatsapp"` `"phone"` `"link"` | Action type             |
| `buttons[].link`   | string                                      | Destination URL or page |

#### Hero Split

Two-column hero with text on one side and optional media.

```json
{
  "title": "Your headline here",
  "subtitle": "Supporting text goes here",
  "description": "",
  "backgroundImage": "",
  "height": "medium",
  "alignment": "left",
  "buttons": [
    { "text": "Primary CTA", "link": "/contact", "variant": "primary" },
    { "text": "Secondary CTA", "link": "/distribution", "variant": "outline" }
  ],
  "badges": [],
  "ctaButtonColor": "var(--primary)",
  "ctaTextColor": "#FFFFFF",
  "showButton": true,
  "fullWidth": true
}
```

| Field               | Type                    | Description                            |
| ------------------- | ----------------------- | -------------------------------------- |
| `title`             | string                  | Main heading                           |
| `subtitle`          | string                  | Sub-heading                            |
| `description`       | string                  | Additional text                        |
| `backgroundImage`   | string                  | Background image URL                   |
| `height`            | string                  | Height preset                          |
| `alignment`         | `"left"` `"center"`     | Text alignment                         |
| `buttons[].text`    | string                  | Button label                           |
| `buttons[].link`    | string                  | Destination                            |
| `buttons[].variant` | `"primary"` `"outline"` | Button style                           |
| `badges`            | string[]                | Badge labels (e.g. ["New", "Popular"]) |
| `ctaButtonColor`    | string                  | Button colour                          |
| `ctaTextColor`      | string                  | Button text colour                     |
| `showButton`        | boolean                 | Show buttons                           |
| `fullWidth`         | boolean                 | Full browser width                     |

#### Timeline

Company history / milestone timeline.

```json
{
  "title": "Our Journey",
  "subtitle": "How we got here",
  "items": [
    {
      "year": "2010",
      "title": "Founded",
      "description": "Company established."
    },
    {
      "year": "2015",
      "title": "Expansion",
      "description": "New facility and production lines."
    },
    {
      "year": "Today",
      "title": "Growing",
      "description": "Serving brands across India.",
      "current": true
    }
  ]
}
```

| Field                 | Type    | Description            |
| --------------------- | ------- | ---------------------- |
| `title`               | string  | Section heading        |
| `subtitle`            | string  | Section sub-heading    |
| `items[].year`        | string  | Year label             |
| `items[].title`       | string  | Milestone title        |
| `items[].description` | string  | Detailed description   |
| `items[].current`     | boolean | Mark as current/recent |

#### Metrics Bar

Horizontal statistics bar (numbers with labels).

```json
{
  "stats": [
    { "value": "5", "label": "Production lines" },
    { "value": "5,000+", "label": "MT / year capacity" },
    { "value": "80+", "label": "Active SKUs" },
    { "value": "15+", "label": "Years experience" }
  ]
}
```

| Field           | Type   | Description         |
| --------------- | ------ | ------------------- |
| `stats[].value` | string | The statistic value |
| `stats[].label` | string | Description label   |

#### Process Flow

Step-by-step process with optional trust items footer.

```json
{
  "title": "Our Process",
  "subtitle": "From start to finish",
  "steps": [
    {
      "title": "Step 1",
      "description": "Description of step 1",
      "icon": "ClipboardCheck"
    },
    {
      "title": "Step 2",
      "description": "Description of step 2",
      "icon": "Settings"
    },
    {
      "title": "Step 3",
      "description": "Description of step 3",
      "icon": "CheckCircle"
    }
  ],
  "trustItems": ["Quality assured", "Batch tracked", "Certified process"]
}
```

| Field                 | Type     | Description                    |
| --------------------- | -------- | ------------------------------ |
| `title`               | string   | Section heading                |
| `subtitle`            | string   | Section sub-heading            |
| `steps[].title`       | string   | Step title                     |
| `steps[].description` | string   | Step description               |
| `steps[].icon`        | string   | Lucide icon name               |
| `trustItems`          | string[] | Checkmark list below the steps |

#### Packaging Grid

Three-card packaging format comparison with highlight support.

```json
{
  "title": "Packaging formats",
  "subtitle": "Choose what works for your business",
  "items": [
    {
      "title": "Branded retail",
      "description": "Ready-branded packs for distributors",
      "tag": "Distributor friendly",
      "highlight": false
    },
    {
      "title": "Private label",
      "description": "Your brand, our manufacturing",
      "tag": "Most requested",
      "highlight": true
    },
    {
      "title": "Bulk / institutional",
      "description": "5kg, 10kg, 25kg formats",
      "tag": "Bulk format",
      "highlight": false
    }
  ]
}
```

| Field                 | Type    | Description                       |
| --------------------- | ------- | --------------------------------- |
| `title`               | string  | Section heading                   |
| `subtitle`            | string  | Section sub-heading               |
| `items[].title`       | string  | Card title                        |
| `items[].description` | string  | Card description                  |
| `items[].tag`         | string  | Tag label                         |
| `items[].highlight`   | boolean | Highlight card with accent border |

#### Certification Cards

Certification badges with footer text.

```json
{
  "title": "Certified. Audited. Trusted.",
  "certs": [
    { "name": "FSSAI", "description": "Food safety & standards authority" },
    { "name": "ISO", "description": "Quality management systems" },
    { "name": "BIS", "description": "Bureau of Indian standards" }
  ],
  "footerText": "All certifications are current and regularly renewed."
}
```

| Field                 | Type   | Description          |
| --------------------- | ------ | -------------------- |
| `title`               | string | Section heading      |
| `certs[].name`        | string | Certification name   |
| `certs[].description` | string | Description          |
| `footerText`          | string | Text below the cards |

#### Address Cards

Location cards for factory, office, and visit information.

```json
{
  "title": "Our locations",
  "cards": [
    {
      "type": "factory",
      "title": "Manufacturing facility",
      "address": "[Factory address]",
      "badge": "Primary"
    },
    {
      "type": "office",
      "title": "Corporate office",
      "address": "[Office address]",
      "badge": ""
    },
    {
      "type": "visit",
      "title": "Planning a factory visit?",
      "description": "We welcome B2B buyers..."
    }
  ]
}
```

| Field                 | Type                             | Description                        |
| --------------------- | -------------------------------- | ---------------------------------- |
| `title`               | string                           | Section heading                    |
| `cards[].type`        | `"factory"` `"office"` `"visit"` | Card type (affects icon)           |
| `cards[].title`       | string                           | Card title                         |
| `cards[].address`     | string                           | Address text                       |
| `cards[].badge`       | string                           | Badge label                        |
| `cards[].description` | string                           | Description text (for visit cards) |

#### Quick Connect

Contact channel buttons (WhatsApp, phone, email, etc.).

```json
{
  "title": "Prefer a quicker channel?",
  "channels": [
    {
      "type": "whatsapp",
      "title": "WhatsApp us",
      "description": "Quick questions, product photos",
      "value": "+91 XXXXX XXXXX"
    },
    {
      "type": "phone",
      "title": "Call us directly",
      "description": "For urgent requirements",
      "value": "+91 XXXXX XXXXX"
    },
    {
      "type": "email",
      "title": "Email us",
      "description": "For detailed enquiries",
      "value": "sales@purvabites.com"
    },
    {
      "type": "distribution",
      "title": "View Distribution",
      "description": "Explore distribution options",
      "value": "Pan-India coverage"
    }
  ]
}
```

| Field                    | Type                                              | Description             |
| ------------------------ | ------------------------------------------------- | ----------------------- |
| `title`                  | string                                            | Section heading         |
| `channels[].type`        | `"whatsapp"` `"phone"` `"email"` `"distribution"` | Channel type            |
| `channels[].title`       | string                                            | Display title           |
| `channels[].description` | string                                            | Description text        |
| `channels[].value`       | string                                            | The actual contact info |

#### CRM Flow

Visual step-by-step of the post-enquiry process.

```json
{
  "title": "What happens after you get in touch",
  "steps": [
    {
      "num": 1,
      "title": "Enquiry received",
      "description": "Logged in CRM automatically"
    },
    {
      "num": 2,
      "title": "Auto-acknowledgement",
      "description": "Email confirmation within minutes"
    },
    {
      "num": 3,
      "title": "Sales team review",
      "description": "Routed to the right person"
    },
    {
      "num": 4,
      "title": "First response",
      "description": "Call or WhatsApp within 4-24 hours"
    },
    {
      "num": 5,
      "title": "Proposal / sample",
      "description": "Pricing or sample dispatch"
    }
  ]
}
```

| Field                 | Type   | Description      |
| --------------------- | ------ | ---------------- |
| `title`               | string | Section heading  |
| `steps[].num`         | number | Step number      |
| `steps[].title`       | string | Step title       |
| `steps[].description` | string | Step description |

---

### Page Content Blocks

These are **nested JSON payloads** that control entire page layouts. Each maps to a specific page in the storefront. Unlike simple blocks, these contain the full page data in one block.

> **Important:** Page Content Blocks must be edited using the **JSON Editor** tab. The UI Editor will show a notice indicating nested fields are only editable via JSON.

---

#### `manufacturing-content`

Controls the **Manufacturing** page (`/manufacturing`). Renders: hero banner, intro + metrics, production lines (interactive tabs), quality process, private label section, certifications, and lead capture form.

```json
{
  "hero": {
    "title": "State-of-the-art FMCG Food Contract Manufacturing",
    "subtitle": "From raw material to finished, packaged goods - at scale, with precision, under one roof",
    "badge": "FSSAI Certified · ISO Compliant · 100% Own Manufacturing",
    "backgroundImage": "https://res.cloudinary.com/.../image/upload/...jpg"
  },
  "metrics": [
    { "value": "7", "label": "Production lines" },
    { "value": "1,000+", "label": "MT / year capacity" },
    { "value": "55+", "label": "Active SKUs" },
    { "value": "17+", "label": "Years experience" }
  ],
  "intro": {
    "heading": "Built to Manufacture. Not to Outsource.",
    "description": "Every product that leaves our facility is made in-house on our machinery..."
  },
  "productionLines": [
    {
      "id": "khakhra",
      "name": "Roasted Khakhra",
      "flagship": true,
      "capacity": "1,000 kg",
      "variants": "12+ flavours",
      "packs": "200g · Bulk",
      "desc": "Made from fresh wheat, ground in-house...",
      "tags": ["100% Roasted, Never Fried", "Fresh Wheat, Ground In-House"],
      "ctaText": "View Products →",
      "ctaLink": "/product/coin-khakhra-manufacturer-india",
      "ctaEnabled": true,
      "image": "https://res.cloudinary.com/...jpg"
    }
  ],
  "qualitySteps": [
    {
      "icon": "Leaf",
      "color": "bg-primary/10 text-primary",
      "title": "Raw material intake",
      "desc": "Supplier grading, moisture check, lab testing before acceptance"
    },
    {
      "icon": "Filter",
      "color": "bg-emerald-50 text-emerald-600",
      "title": "Cleaning & prep",
      "desc": "Sieving, washing, pre-treatment as per product spec"
    },
    {
      "icon": "Flame",
      "color": "bg-amber-50 text-amber-600",
      "title": "Production",
      "desc": "Automated processing on dedicated line - controlled temp, time, texture"
    },
    {
      "icon": "Microscope",
      "color": "bg-orange-50 text-orange-600",
      "title": "In-line QC checks",
      "desc": "Colour, texture, weight, taste checks at every 30 min intervals"
    },
    {
      "icon": "Package",
      "color": "bg-blue-50 text-blue-600",
      "title": "Packaging",
      "desc": "Auto-fill, seal, label - Purva Bites or custom private label pack"
    },
    {
      "icon": "Truck",
      "color": "bg-green-50 text-green-700",
      "title": "Dispatch",
      "desc": "Lot-tagged, batch-coded, climate-appropriate loading & dispatch"
    }
  ],
  "qualityFooterItems": [
    "Batch traceability maintained",
    "Staff in hygienic uniforms & gloves",
    "CCTV-monitored production areas",
    "Third-party lab testing on request"
  ],
  "privateLabel": {
    "heading": "Your brand. Our factory.",
    "subtitle": "We handle the entire manufacturing and packaging process - you bring the brand identity",
    "items": [
      {
        "icon": "Package",
        "title": "Custom packaging",
        "desc": "Supply your artwork / brief - we print and pack under your brand"
      },
      {
        "icon": "Settings",
        "title": "Custom formulation",
        "desc": "Adjust flavour, spice levels, ingredients"
      },
      {
        "icon": "ShieldCheck",
        "title": "Regulatory compliance handled",
        "desc": "FSSAI declaration, nutritional labels, batch coding"
      }
    ],
    "details": [
      {
        "label": "Minimum order qty (MOQ)",
        "value": "As per product - share requirement"
      },
      { "label": "Lead time (first batch)", "value": "15-21 working days" },
      { "label": "Pack size flexibility", "value": "10g to 1kg - all sizes" },
      { "label": "NDA / confidentiality", "value": "Available on request" },
      { "label": "Sample order", "value": "Available before bulk" }
    ],
    "ctaText": "Enquire for private label →",
    "ctaLink": "#contact"
  },
  "certifications": [
    { "name": "FSSAI licence", "desc": "Food safety & standards authority" },
    { "name": "ISO certification", "desc": "Quality management systems" },
    { "name": "BIS certification", "desc": "Bureau of Indian standards" },
    { "name": "Other certification", "desc": "To be added by client" }
  ],
  "cta": {
    "title": "Ready to see it for yourself?",
    "subtitle": "Share your details - we'll get back within 24 hours",
    "formBgColor": "#2639ED",
    "formTextColor": "#FFFFFF"
  }
}
```

| Field                          | Type     | Description                                                          |
| ------------------------------ | -------- | -------------------------------------------------------------------- | --- |
| `hero.title`                   | string   | Main hero heading                                                    |
| `hero.subtitle`                | string   | Hero sub-heading                                                     |
| `hero.badge`                   | string   | Badge text (e.g. certifications)                                     |
| `hero.backgroundImage`         | string   | Hero background image URL                                            |
| `metrics[].value`              | string   | Statistic value                                                      |
| `metrics[].label`              | string   | Statistic label                                                      |
| `intro.heading`                | string   | Intro section heading                                                |
| `intro.description`            | string   | Intro paragraph                                                      |
| `productionLines[].id`         | string   | Unique identifier (used as tab key)                                  |
| `productionLines[].name`       | string   | Display name on tab button                                           |
| `productionLines[].flagship`   | boolean  | Show "Flagship line" badge                                           |
| `productionLines[].capacity`   | string   | Daily capacity display                                               |
| `productionLines[].variants`   | string   | Variant count display                                                |
| `productionLines[].packs`      | string   | Pack size options                                                    |
| `productionLines[].desc`       | string   | Detailed description                                                 |
| `productionLines[].tags`       | string[] | Tag badges                                                           |
| `productionLines[].ctaText`    | string   | CTA button label (renders only if non-empty)                         |
| `productionLines[].ctaLink`    | string   | Button destination (`/path`, `http://`, `#hash`, or page type)       |
| `productionLines[].ctaEnabled` | boolean  | Show/hide the CTA button                                             |
| `productionLines[].image`      | string   | Production line image                                                |
| `qualitySteps[].icon`          | string   | Lucide icon name                                                     |
| `qualitySteps[].color`         | string   | Tailwind CSS colour classes                                          |
| `qualitySteps[].title`         | string   | Step heading                                                         |
| `qualitySteps[].desc`          | string   | Step description                                                     |
| `qualityFooterItems`           | string[] | Checkmark items below quality section                                |
| `privateLabel.heading`         | string   | Section heading                                                      |
| `privateLabel.subtitle`        | string   | Section sub-heading                                                  |
| `privateLabel.items[].icon`    | string   | Lucide icon                                                          |     |
| `privateLabel.items[].title`   | string   | Item title                                                           |
| `privateLabel.items[].desc`    | string   | Item description                                                     |
| `privateLabel.details[].label` | string   | Detail row label                                                     |
| `privateLabel.details[].value` | string   | Detail row value                                                     |
| `privateLabel.ctaText`         | string   | CTA button label                                                     |
| `privateLabel.ctaLink`         | string   | Button destination (renders button only if both text and link exist) |
| `certifications[].name`        | string   | Certification name                                                   |
| `certifications[].desc`        | string   | Description                                                          |
| `cta.title`                    | string   | Lead capture form heading                                            |
| `cta.subtitle`                 | string   | Form sub-heading                                                     |
| `cta.formBgColor`              | string   | Form background colour                                               |
| `cta.formTextColor`            | string   | Form text colour                                                     |

---

#### `about-page-content`

Controls the **About** page (`/about`). Renders: hero, company story, stats, timeline, directors, quote, mission/vision/values, factory location with logistics, and CTA cards.

```json
{
  "hero": {
    "title": "Built on trust. Driven by quality.",
    "subtitle": "From a distribution background to a full-scale FMCG manufacturing company",
    "estYear": "Est. 2010 · Gujarat, India",
    "backgroundImage": "",
    "backgroundColor": "#3d6f08",
    "pattern": "none",
    "overlayColor": "#1c1917",
    "overlayOpacity": "0.45",
    "badge": ""
  },
  "stats": [
    { "value": "15+", "label": "Years in business" },
    { "value": "5", "label": "Production lines" },
    { "value": "5,000+", "label": "MT / year" },
    { "value": "80+", "label": "Active SKUs" }
  ],
  "story": {
    "heading": "How we got here",
    "subtitle": "A business built from the ground up...",
    "narrative": [
      "The founders began their journey in FMCG distribution...",
      "That ground-level experience gave them a perspective...",
      "Today, Purva Bites operates a state-of-the-art manufacturing facility..."
    ],
    "ctaText": "Meet the founders →",
    "ctaPage": "manufacturing",
    "timeline": [
      {
        "year": "2010",
        "title": "Founded",
        "desc": "Purva Bites was established..."
      },
      {
        "year": "2015",
        "title": "First manufacturing unit",
        "desc": "Opened own production facility..."
      },
      {
        "year": "2018",
        "title": "Expansion",
        "desc": "Added new production lines..."
      },
      {
        "year": "2020",
        "title": "Quality certification",
        "desc": "Achieved FSSAI certification..."
      },
      {
        "year": "2023",
        "title": "Scale-up",
        "desc": "Expanded to multiple product categories..."
      },
      {
        "year": "Today",
        "title": "Pan-India presence",
        "desc": "Serving brands and distributors across India...",
        "current": true
      }
    ]
  },
  "directors": [
    {
      "name": "[Director name]",
      "role": "Co-founder & Managing Director",
      "bio": "With 20+ years of experience in FMCG manufacturing and distribution...",
      "imageUrl": "",
      "socialUrl": ""
    }
  ],
  "quote": {
    "text": "\"The business was built on the belief that quality manufacturing should be accessible...\"",
    "author": "[Director name], Co-founder"
  },
  "ctaCard": {
    "title": "Direct access to leadership",
    "desc": "We believe in building partnerships, not just fulfilling orders. Reach out directly to our management team.",
    "cta": "Speak to us directly →"
  },
  "missionVisionValues": [
    {
      "icon": "Target",
      "color": "text-primary",
      "bg": "bg-primary/10",
      "label": "Mission",
      "title": "To deliver high-quality FMCG products...",
      "desc": "We strive to make premium food products accessible..."
    },
    {
      "icon": "Eye",
      "color": "text-emerald-600",
      "bg": "bg-emerald-50",
      "label": "Vision",
      "title": "To be India's most trusted FMCG manufacturing partner...",
      "desc": "Setting benchmarks in quality, innovation and reliability..."
    },
    {
      "icon": "HeartHandshake",
      "color": "text-amber-600",
      "bg": "bg-amber-50",
      "label": "Values",
      "title": "Integrity. Quality. Partnership.",
      "desc": "Every decision we make is guided by these three principles..."
    }
  ],
  "location": {
    "factoryAddress": "[Factory address line 1]\n[Area / Industrial estate]\n[City, District] - [PIN]\nGujarat, India",
    "googleMapsEmbedUrl": "",
    "logistics": [
      {
        "icon": "Train",
        "label": "Nearest railway station",
        "value": "[Station] - X km"
      },
      {
        "icon": "Plane",
        "label": "Nearest airport",
        "value": "[Airport] - X km"
      },
      { "icon": "Route", "label": "National highway", "value": "NH-X - X km" },
      {
        "icon": "Truck",
        "label": "Freight terminal",
        "value": "[Terminal] - X km"
      }
    ],
    "dispatchTags": ["Pan-India dispatch", "Road + rail", "Batch-tracked"],
    "dispatchDesc": "We dispatch to all major markets across India via road and rail freight."
  },
  "cta": {
    "title": "Ready to work with us?",
    "cards": [
      {
        "icon": "Factory",
        "title": "See our manufacturing",
        "desc": "Explore our production lines, quality processes and certifications.",
        "cta": "View manufacturing →",
        "page": "manufacturing",
        "useForm": false
      },
      {
        "icon": "Target",
        "title": "Distribution enquiry",
        "desc": "Looking to stock Purva Bites products in your region?",
        "cta": "Send enquiry →",
        "page": "contact",
        "useForm": true
      },
      {
        "icon": "Linkedin",
        "title": "Partner with us",
        "desc": "Institutional buyers, private label partners, suppliers.",
        "cta": "Send enquiry →",
        "page": "contact",
        "useForm": true
      }
    ]
  }
}
```

| Field                         | Type                                     | Description                                    |
| ----------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `hero.title`                  | string                                   | Hero heading                                   |
| `hero.subtitle`               | string                                   | Hero sub-heading                               |
| `hero.estYear`                | string                                   | Est. year display                              |
| `hero.backgroundImage`        | string                                   | Background image URL                           |
| `hero.backgroundColor`        | string                                   | Fallback background colour                     |
| `hero.pattern`                | `"none"` `"dots"` `"diagonal"` `"waves"` | Overlay pattern                                |
| `hero.overlayColor`           | string                                   | Overlay tint colour                            |
| `hero.overlayOpacity`         | string                                   | Overlay opacity (e.g. `"0.45"`)                |
| `hero.badge`                  | string                                   | Badge text                                     |
| `stats[].value`               | string                                   | Statistic                                      |
| `stats[].label`               | string                                   | Statistic label                                |
| `story.heading`               | string                                   | Story section heading                          |
| `story.subtitle`              | string                                   | Story section sub-heading                      |
| `story.narrative`             | string[]                                 | Paragraphs of the company story                |
| `story.ctaText`               | string                                   | CTA button text (renders only if non-empty)    |
| `story.ctaPage`               | string                                   | CTA destination page type                      |
| `story.timeline[].year`       | string                                   | Year label                                     |
| `story.timeline[].title`      | string                                   | Milestone title                                |
| `story.timeline[].desc`       | string                                   | Milestone description                          |
| `story.timeline[].current`    | boolean                                  | Mark as most recent                            |
| `directors[].name`            | string                                   | Director name                                  |
| `directors[].role`            | string                                   | Director role                                  |
| `directors[].bio`             | string                                   | Biography                                      |
| `directors[].imageUrl`        | string                                   | Photo URL                                      |
| `directors[].socialUrl`       | string                                   | LinkedIn or social URL                         |
| `quote.text`                  | string                                   | Quote text                                     |
| `quote.author`                | string                                   | Quote attribution                              |
| `quote.authorImage`           | string                                   | Author photo URL                               |
| `ctaCard.title`               | string                                   | CTA card heading                               |
| `ctaCard.desc`                | string                                   | CTA card description                           |
| `ctaCard.cta`                 | string                                   | CTA card button text                           |
| `missionVisionValues[].icon`  | string                                   | Lucide icon name                               |
| `missionVisionValues[].color` | string                                   | Tailwind text colour                           |
| `missionVisionValues[].bg`    | string                                   | Tailwind background colour                     |
| `missionVisionValues[].label` | string                                   | Card label (Mission/Vision/Values)             |
| `missionVisionValues[].title` | string                                   | Card heading                                   |
| `missionVisionValues[].desc`  | string                                   | Card description                               |
| `location.factoryAddress`     | string                                   | Factory address (support `\n` for line breaks) |
| `location.googleMapsEmbedUrl` | string                                   | Google Maps embed URL                          |
| `location.logistics[].icon`   | string                                   | Lucide icon name                               |
| `location.logistics[].label`  | string                                   | Logistics label                                |
| `location.logistics[].value`  | string                                   | Value (e.g. distance)                          |
| `location.dispatchTags`       | string[]                                 | Dispatch capability tags                       |
| `location.dispatchDesc`       | string                                   | Dispatch description paragraph                 |
| `cta.title`                   | string                                   | CTA section heading                            |
| `cta.cards[].icon`            | string                                   | Lucide icon name                               |
| `cta.cards[].title`           | string                                   | Card title                                     |
| `cta.cards[].desc`            | string                                   | Card description                               |
| `cta.cards[].cta`             | string                                   | Card button text                               |
| `cta.cards[].page`            | string                                   | Card button destination page                   |
| `cta.cards[].useForm`         | boolean                                  | Open enquiry form instead of navigating        |

---

#### `contact-page-content`

Controls the **Contact** page (`/contact`). Renders: hero with requirement type pills, contact form, response promise table, and location cards.

```json
{
  "hero": {
    "title": "Let's talk about your requirement",
    "subtitle": "Whether you're looking for bulk supply, private label manufacturing or a distribution partnership - share your requirement and we'll respond within 24 hours",
    "backgroundImage": "https://res.cloudinary.com/.../image/upload/...jpg"
  },
  "formSection": {
    "title": "Send us your requirement",
    "subtitle": "Fields marked * are required. We respond within 24 working hours."
  },
  "responsePromise": {
    "title": "Our response commitment",
    "items": [
      { "label": "Bulk / PL enquiries", "time": "Within 4 hours" },
      { "label": "Distribution enquiries", "time": "Within 24 hours" },
      { "label": "All other enquiries", "time": "Within 24 hours" }
    ],
    "footer": "Mon-Sat, 9am-6pm IST"
  },
  "locations": {
    "title": "Our locations",
    "cards": [
      {
        "type": "factory",
        "title": "Manufacturing & Registered Unit",
        "subtitle": "Primary",
        "address": "[Full address with PIN]",
        "accessibility": "[Station] X km · [Airport] X km",
        "buttons": [
          {
            "text": "Get directions",
            "icon": "MapPin",
            "link": "https://maps.google.com/..."
          },
          { "text": "Book visit", "icon": "Factory", "link": "" }
        ]
      },
      {
        "type": "office",
        "title": "Corporate office",
        "subtitle": "",
        "address": "[Office address with PIN]",
        "accessibility": "Mon-Sat · 10am - 7pm IST",
        "buttons": [
          {
            "text": "Get directions",
            "icon": "MapPin",
            "link": "https://maps.google.com/..."
          }
        ]
      },
      {
        "type": "visit",
        "title": "Planning a factory visit?",
        "subtitle": "",
        "description": "We welcome B2B buyers, private and white label partners and distributors to visit our facility. Please schedule in advance.",
        "highlights": [
          "Full production line walkthrough",
          "Warehouse & dispatch area tour",
          "Meet the directors in person",
          "Product sampling on request"
        ],
        "cta": "Schedule a factory visit →",
        "link": "#contact-form"
      }
    ]
  }
}
```

| Field                              | Type                             | Description                     |
| ---------------------------------- | -------------------------------- | ------------------------------- |
| `hero.title`                       | string                           | Hero heading                    |
| `hero.subtitle`                    | string                           | Hero sub-heading                |
| `hero.backgroundImage`             | string                           | Hero background image           |
| `formSection.title`                | string                           | Contact form heading            |
| `formSection.subtitle`             | string                           | Contact form description        |
| `responsePromise.title`            | string                           | Response commitment heading     |
| `responsePromise.items[].label`    | string                           | Enquiry type label              |
| `responsePromise.items[].time`     | string                           | Response time                   |
| `responsePromise.footer`           | string                           | Footer text                     |
| `locations.title`                  | string                           | Locations section heading       |
| `locations.cards[].type`           | `"factory"` `"office"` `"visit"` | Card type                       |
| `locations.cards[].title`          | string                           | Card title                      |
| `locations.cards[].subtitle`       | string                           | Badge/subtitle                  |
| `locations.cards[].address`        | string                           | Full address                    |
| `locations.cards[].accessibility`  | string                           | Accessibility info              |
| `locations.cards[].description`    | string                           | Description (visit cards)       |
| `locations.cards[].highlights`     | string[]                         | Highlight bullets (visit cards) |
| `locations.cards[].cta`            | string                           | CTA button text                 |
| `locations.cards[].link`           | string                           | CTA button link                 |
| `locations.cards[].buttons[].text` | string                           | Button label                    |
| `locations.cards[].buttons[].icon` | string                           | Lucide icon name                |
| `locations.cards[].buttons[].link` | string                           | Button destination              |

---

#### `distribution-content`

Controls the **Distribution** page (`/distribution`). Renders: hero, stats bar, alternating two-column sections, CTA strip, promo banner grid, and lead capture form.

```json
{
  "hero": {
    "title": "Purva Bites Distribution",
    "subtitle": "Your trusted FMCG distribution partner - pan-India coverage, quality assured supply chain.",
    "backgroundImage": "https://res.cloudinary.com/...jpg",
    "ctaText": "Become a Distributor"
  },
  "stats": [
    { "label": "Cities Covered", "value": "500+", "icon": "MapPin" },
    { "label": "Retail Touch Points", "value": "50K+", "icon": "Package" },
    { "label": "Years of Excellence", "value": "25+", "icon": "Clock" },
    { "label": "Product Variants", "value": "100+", "icon": "TrendingUp" }
  ],
  "sections": [
    {
      "title": "Nationwide Reach",
      "description": "Our distribution network covers over 500 cities across India...",
      "imageUrl": "",
      "imageSide": "left",
      "icon": "Globe"
    },
    {
      "title": "Quality Assured Supply Chain",
      "description": "Every product is batch-tracked and quality-checked...",
      "imageUrl": "",
      "imageSide": "right",
      "icon": "Shield"
    },
    {
      "title": "Timely Delivery Commitment",
      "description": "We maintain a consistent supply chain with on-time delivery...",
      "imageUrl": "",
      "imageSide": "left",
      "icon": "Truck"
    }
  ],
  "promoTitle": "Our Product Range",
  "promoBanners": [
    {
      "image": "",
      "headline": "Khakhra Range",
      "description": "Thin, crispy roasted flatbreads in 12+ flavours",
      "buttonText": "Inquiry"
    },
    {
      "image": "",
      "headline": "Makhana Range",
      "description": "Premium roasted fox nuts in 6+ flavours",
      "buttonText": "Inquiry"
    },
    {
      "image": "",
      "headline": "Bhakhri Range",
      "description": "Traditional thick roasted flatbreads",
      "buttonText": "Inquiry"
    },
    {
      "image": "",
      "headline": "Extruder Range",
      "description": "Puffed snacks and shaped novelties",
      "buttonText": "Inquiry"
    }
  ],
  "cta": {
    "title": "Ready to partner with us?",
    "description": "Join our growing network of distributors across India.",
    "buttonText": "Enquire Now"
  }
}
```

| Field                        | Type               | Description                                      |
| ---------------------------- | ------------------ | ------------------------------------------------ |
| `hero.title`                 | string             | Hero heading                                     |
| `hero.subtitle`              | string             | Hero sub-heading                                 |
| `hero.backgroundImage`       | string             | Hero background image URL                        |
| `hero.ctaText`               | string             | Hero CTA button text (renders only if non-empty) |
| `stats[].label`              | string             | Statistic label                                  |
| `stats[].value`              | string             | Statistic value                                  |
| `stats[].icon`               | string             | Lucide icon name                                 |
| `sections[].title`           | string             | Section heading                                  |
| `sections[].description`     | string             | Section text                                     |
| `sections[].imageUrl`        | string             | Section image URL                                |
| `sections[].imageSide`       | `"left"` `"right"` | Image placement                                  |
| `sections[].icon`            | string             | Lucide icon name                                 |
| `promoTitle`                 | string             | Promo banners section heading                    |
| `promoBanners[].image`       | string             | Banner image URL                                 |
| `promoBanners[].headline`    | string             | Banner title                                     |
| `promoBanners[].description` | string             | Banner description                               |
| `promoBanners[].buttonText`  | string             | Inquiry button label                             |
| `cta.title`                  | string             | CTA section heading                              |
| `cta.description`            | string             | CTA description                                  |
| `cta.buttonText`             | string             | CTA button text                                  |

---

### Product Page Blocks

Six block types available for **product page content** (used in the product admin, not the PageBuilder). These are added to individual products via the product editor.

#### product-hero

```json
{
  "title": "Product Name",
  "subtitle": "Bulk Manufacturer · Private Label Ready",
  "description": "Premium quality product manufactured in-house..."
}
```

#### product-content-split

```json
{
  "image": "",
  "heading": "Sourced direct. Made in-house. Built for bulk.",
  "paragraph": "Our product is sourced directly...",
  "bullets": [
    "Direct sourcing, no middlemen",
    "In-house processing",
    "FSSAI certified, hygienic packaging"
  ]
}
```

#### product-cards

```json
{
  "title": "Our range",
  "productIds": [],
  "maxCards": 8,
  "columns": 4
}
```

#### product-cta

```json
{
  "heading": "Looking for bulk supply or private label?",
  "description": "Share your requirement...",
  "showBulkCta": true,
  "bulkCtaText": "Enquire for Bulk Order →",
  "bulkCtaLink": "/contact",
  "showPrivateLabelCta": true,
  "privateLabelCtaText": "Start Private Label →",
  "privateLabelCtaLink": "/contact",
  "backgroundColor": "dark"
}
```

#### product-process

```json
{
  "title": "From raw material to dispatch",
  "subtitle": "Every batch follows the same controlled process",
  "steps": [
    {
      "title": "Raw material intake",
      "description": "Sourced direct from growers"
    },
    {
      "title": "Grading & cleaning",
      "description": "Sorted by size and quality"
    },
    { "title": "Processing", "description": "Controlled heat and time" },
    { "title": "Quality check", "description": "Batch-level inspection" },
    {
      "title": "Packing & dispatch",
      "description": "Sealed, labelled, shipped"
    }
  ]
}
```

#### product-infographic

```json
{
  "image": "",
  "caption": "",
  "altText": "Infographic"
}
```

---

### Category Fields Reference

Categories in the admin have their own field system (separate from the PageBuilder). These fields render on the category landing page at `/product/<slug>`.

| Admin Field             | JSON Key                | Storefront Section | Description                                  |
| ----------------------- | ----------------------- | ------------------ | -------------------------------------------- |
| Hero Title              | `heroTitle`             | Hero Banner        | Large heading at top of page                 |
| Hero Subtitle           | `heroSubtitle`          | Hero Banner        | Sub-heading below title                      |
| Hero Description        | `heroDescription`       | Hero Banner        | Additional text                              |
| Hero BG Color           | `heroBackgroundColor`   | Hero Banner        | Background colour style (dark/light/brand)   |
| Hero BG Image           | `heroBackgroundImage`   | Hero Banner        | Background image (displayed over colour)     |
| Content Split Image     | `contentSplitImage`     | Content Split      | Two-column section image                     |
| Content Split Heading   | `contentSplitHeading`   | Content Split      | Section heading                              |
| Content Split Paragraph | `contentSplitParagraph` | Content Split      | Section text                                 |
| Content Split Bullets   | `contentSplitBullets`   | Content Split      | JSON array of bullet points                  |
| Cards Title             | `cardsTitle`            | Product Cards      | Section heading                              |
| Card Product IDs        | `cardsProductIds`       | Product Cards      | Comma-separated product IDs                  |
| Cards Max Count         | `cardsMaxCount`         | Product Cards      | Maximum cards to show                        |
| Cards Columns           | `cardsColumns`          | Product Cards      | Grid columns (2/3/4)                         |
| CTA Heading             | `ctaHeading`            | CTA Strip          | CTA section heading                          |
| CTA Description         | `ctaDescription`        | CTA Strip          | CTA supporting text                          |
| CTA Bulk Text           | `ctaBulkText`           | CTA Strip          | Bulk order button label                      |
| CTA Bulk Link           | `ctaBulkLink`           | CTA Strip          | Bulk order destination                       |
| CTA Private Label Text  | `ctaPrivateLabelText`   | CTA Strip          | Private label button label                   |
| CTA Private Label Link  | `ctaPrivateLabelLink`   | CTA Strip          | Private label destination                    |
| CTA BG Color            | `ctaBackgroundColor`    | CTA Strip          | Background style (dark/light/brand)          |
| Process Title           | `processTitle`          | Process Flow       | Section heading                              |
| Process Subtitle        | `processSubtitle`       | Process Flow       | Section sub-heading                          |
| Process Steps           | `processSteps`          | Process Flow       | JSON array of `{title, description}` objects |
| Infographic Image       | `infographicImage`      | Infographic        | Main image                                   |
| Infographic Video URL   | `infographicVideoUrl`   | Infographic        | YouTube video URL (replaces image if set)    |
| Infographic Caption     | `infographicCaption`    | Infographic        | Image caption                                |
| Infographic Alt Text    | `infographicAltText`    | Infographic        | Image alt text                               |
| Gallery Title           | `galleryTitle`          | Gallery            | Section heading                              |
| Gallery Images          | `galleryImages`         | Gallery            | JSON array of image URLs                     |
| FAQ Title               | `faqTitle`              | FAQ                | Section heading                              |
| FAQ Items               | `faqItems`              | FAQ                | JSON array of `{question, answer}` objects   |
| Lead Capture Enabled    | `leadCaptureEnabled`    | Lead Capture       | Show/hide enquiry form                       |

> **Note:** The category hero section also supports a **YouTube video URL** field for the infographic. If set, the video embeds as a 16:9 responsive iframe instead of the static infographic image.

---

### Icon Name Reference

Many blocks use Lucide icon names for visual elements. Use any of these valid names:

| Category          | Icon Names                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **General**       | `Star`, `Heart`, `Shield`, `Award`, `Target`, `Eye`, `Flag`, `Home`, `Search`, `Bell`, `Settings`, `User`, `Users`, `UserCircle` |
| **Business**      | `Building`, `Factory`, `Warehouse`, `Store`, `Briefcase`, `Globe`, `TrendingUp`, `BarChart3`, `LineChart`, `PieChart`            |
| **Commerce**      | `Package`, `Box`, `ShoppingBag`, `ShoppingCart`, `Tag`, `CreditCard`, `Truck`, `Ship`, `Plane`, `Train`                          |
| **Communication** | `Mail`, `Phone`, `MessageSquare`, `Send`, `Headphones`, `Voicemail`, `MapPin`, `Navigation`                                      |
| **Media**         | `Image`, `Images`, `Camera`, `Video`, `Film`, `Music`, `Play`                                                                    |
| **Arrows**        | `ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `ChevronRight`, `ChevronLeft`, `MoveRight`, `ExternalLink`                    |
| **Actions**       | `Download`, `Upload`, `Share`, `Link`, `Trash`, `Edit`, `Copy`, `Check`, `X`, `Plus`, `Minus`                                    |
| **UI**            | `LayoutGrid`, `Columns`, `Rows`, `Table`, `List`, `Grid3X3`, `Sidebar`, `PanelRight`                                             |
| **Content**       | `FileText`, `Newspaper`, `BookOpen`, `Quote`, `HelpCircle`, `Info`, `AlertCircle`, `ClipboardCheck`, `CheckCircle`               |
| **Status**        | `ShieldCheck`, `ShieldAlert`, `ShieldOff`, `Verified`, `BadgeCheck`, `BadgePercent`                                              |
| **Process**       | `GitBranch`, `GitMerge`, `GitCommit`, `Workflow`, `Route`, `Map`, `Compass`                                                      |
| **Nature**        | `Leaf`, `Flame`, `Microscope`, `Sun`, `Moon`, `Cloud`, `Droplet`                                                                 |

Usage: set the `icon` field to the exact PascalCase name (e.g. `"ShieldCheck"`). The component will render the matching Lucide icon or nothing if the name is invalid.

---

### JSON Editor Tips

**Validating JSON:**

- Use **double quotes** for strings, never single quotes
- No **trailing commas** after the last item in arrays or objects
- Boolean values: `true` / `false` (no quotes)
- Numbers: no quotes
- Null: use `null` (not `"null"`)

**Example of valid JSON:**

```json
{
  "title": "Correct",
  "count": 42,
  "enabled": true,
  "items": ["one", "two"],
  "metadata": null
}
```

**Example of invalid JSON (will error):**

```json
{
  "title": "Wrong", // ← single quotes
  "count": 42,
  "enabled": true,
  "items": ["one", "two"] // ← trailing comma
}
```

**Getting image URLs:**

1. Upload images via the **Media Library** tab in admin
2. Copy the Cloudinary URL from the media item
3. Paste into the image field

**HTML in text fields:**
The `content` field in the **Text** block supports HTML. Safe tags: `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<li>`, `<a>`, `<img>`, `<strong>`, `<em>`, `<br>`, `<blockquote>`, `<span>`.

**Page content blocks must use JSON Editor:**
The UI Editor shows a notice for nested blocks. Always use the **JSON Editor** tab for `manufacturing-content`, `about-page-content`, `contact-page-content`, and `distribution-content` blocks.

**Copy-paste defaults:**
Use the default JSON shown in this reference as a starting point. Paste it into the JSON Editor, then customise the fields you need. Fields you leave as empty strings `""` will not render a default value.

---

### Platform Page Slugs

These page slugs are reserved for the core platform pages and cannot be used for custom content pages:

| Slug            | Route                                   |
| --------------- | --------------------------------------- |
| `homepage`      | `/`                                     |
| `about-us`      | `/about`                                |
| `manufacturing` | `/manufacturing`                        |
| `contact`       | `/contact`                              |
| `distribution`  | `/distribution`                         |
| `products`      | `/products` (redirects to distribution) |
| `blog`          | `/blog`                                 |

Content pages use the **Pages** tab in admin and can have any custom slug not in this reserved list.
