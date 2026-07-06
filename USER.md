# WCommerce Catalogue - User Guide

## Introduction

WCommerce Catalogue is a multi-tenant e-commerce platform that lets businesses create and manage their own online stores. This guide covers the main features for store owners (admins).

## Table of Contents

- [For Store Owners (Admins)](#for-store-owners-admins)
  - [Logging In](#admin-login)
  - [Dashboard](#dashboard)
  - [Product Management](#product-management)
  - [Category Management](#category-management)
  - [Enquiries & Quotes](#enquiries-quotes)
  - [Customer Management](#customer-management)
  - [Blog & Content Pages](#blog--content-pages)
  - [Media Library](#media-library)
  - [Banners](#banners)
  - [Settings](#settings)
  - [Multi-Store Management](#multi-store-management)
  - [Backup & Restore](#backup-restore)
  - [Import & Export](#import-export)
- [Frequently Asked Questions](#faq)
- [Blocks Reference](#blocks-reference)
  - [Layout Blocks](#layout-blocks)
  - [Library Blocks](#library-blocks)
  - [Page Content Blocks](#page-content-blocks)
  - [Product Page Blocks](#product-page-blocks)
  - [Category Fields Reference](#category-fields-reference)
  - [Icon Name Reference](#icon-name-reference)
  - [JSON Editor Tips](#json-editor-tips)
  - [Platform Page Slugs](#platform-page-slugs)

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
   - **Name** (required) — Product title
   - **Slug** — Auto-generated from name, editable
   - **Description** — Full product description
   - **Short Description** — Brief summary for listings
   - **Price** (required) — Regular selling price
   - **Compare Price** — Original/struck-through price (optional)
   - **Wholesale Price** — Wholesale pricing (optional)
   - **SKU** — Stock Keeping Unit identifier
   - **Stock** — Available quantity
   - **Low Stock Threshold** — Alert level for low stock
   - **Category** — Assign to a category
   - **Images** — Upload product images
   - **Specifications** — Technical specs
   - **Min Order Qty** — Minimum order quantity
   - **WhatsApp Number** — For quick enquiry via WhatsApp
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

| Field             | Description                                              |
| ----------------- | -------------------------------------------------------- |
| **Hero**          | Large banner with heading, subtext, and optional buttons |
| **Content Split** | Two-column text + image section                          |
| **Cards**         | Feature / info cards grid                                |
| **CTA**           | Call-to-action banner with button                        |
| **Process**       | Step-by-step process flow (up to 4 steps)                |
| **Infographic**   | Image-rich infographic section                           |

These fields render on the storefront at `/product/<slug>` (e.g. `/product/khakhra`). Use them to create branded, content-rich category landing pages — no coding required.

Categories also support the full **Page Builder** via the block editor for more complex layouts (26+ block types available).

### Enquiries & Quotes

#### Enquiries

- View all product enquiries and contact form submissions
- Update status: New → Contacted → In Progress → Resolved → Closed
- Link enquiries to products and users
- Bulk update status or delete

#### Quotes

1. Go to **Quotes** tab
2. Create formal quotes for customers:
   - Link to an enquiry
   - Add line items with products, quantities, and prices
   - Set validity date
   - Add notes
3. Send quotes to customers
4. Track status: Draft → Sent → Accepted → Rejected

### Customer Management

1. Go to **Users** tab
2. View all registered users
3. Manage roles: Admin, Clerk
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
- **Contact**: Email, phone, address, social media links
- **Company Details**: GSTIN, FSSAI, CIN registration numbers
- **SMTP**: Email server configuration for notifications
- **SEO**: Default meta tags, schema.org settings
- **Scripts**: Custom header and footer scripts

### Multi-Store Management

If you operate multiple stores:

1. Go to **Stores** in admin
2. Create new stores with unique slugs
3. Switch between stores from the admin
4. Each store has isolated data (products, orders, settings)

### Backup & Restore

- **Backup** — Export all data as JSON (products, orders, users, settings, etc.)
- **Restore** — Import from a JSON backup file
- Settings and categories are upserted during restore

### Import & Export

#### CSV Import

- Products, categories, blog posts, users, redirects
- Shopify CSV import supported
- WooCommerce CSV import supported

#### CSV Export

- Export any entity type as CSV download

---

## Frequently Asked Questions

### How do I reset my password?

1. Click **Forgot Password** on the login page
2. Enter your email address
3. Check your email for a reset link (valid for 1 hour)
4. Click the link and set a new password

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

| Field                 | Type    | Description                 |
| --------------------- | ------- | --------------------------- |
| `slides[].image`      | string  | Slide background image URL  |
| `slides[].title`      | string  | Slide heading               |
| `slides[].subtitle`   | string  | Slide sub-heading           |
| `slides[].buttonText` | string  | CTA button label            |
| `slides[].buttonLink` | string  | CTA destination             |
| `autoplay`            | boolean | Auto-advance slides         |
| `interval`            | number  | Milliseconds between slides |
| `height`              | string  | Height preset               |
| `alignment`           | string  | Text alignment              |

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

Cards targeting different audience types with individual CTAs.

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
      "title": "Brands",
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
| `ctaLink`               | string   | CTA button destination                                |
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
| `ctaLink`      | string | CTA button destination        |

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
| `ctaLink`           | string   | CTA button destination    |
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
| `ctaLink`         | string | CTA button destination    |
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
      "text": "Purva Bites Distribution",
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
      "description": "Contact us to schedule a visit..."
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
  ...
}
```

Full schema is too large to display here. Refer to the `manufacturing-content` block in the Page Builder JSON editor for all available fields.

---

#### `about-content`

Controls the **About** page (`/about`). Renders: hero, intro/about text, leadership cards, journey timeline, values/approch section, and call-to-action.

```json
{
  "hero": {
    "title": "Our Story",
    "subtitle": "How Purva Bites started and where we are today",
    "backgroundImage": "..."
  },
  "intro": {
    "heading": "From a small beginning to a trusted name",
    "content": "<p>Full HTML content about the company...</p>",
    "image": "...",
    "imagePosition": "left"
  },
  ...
}
```

---

### Product Page Blocks

#### `product-page-content`

Controls individual **Product** pages (`/products/<slug>`). Renders: product hero, key specs, features/benefits, variants (if any), specifications, packaging grid, related products, usage instructions, nutritional information (if any), certifications, and enquiry CTA.

```json
{
  "productId": "...",
  "hero": {
    "title": "Product Name",
    "subtitle": "Product tagline",
    "images": ["...", "..."]
  },
  ...
}
```

---

### Category Fields Reference

Categories support the following custom fields, rendered on their landing pages:

| Field Key               | Label               | Type      | Description                                      |
| ----------------------- | ------------------- | --------- | ------------------------------------------------ |
| `hero_title`            | Hero Title          | text      | Large heading on category page                   |
| `hero_subtitle`         | Hero Subtitle       | text      | Sub-heading below title                          |
| `hero_bg`               | Hero Background     | image     | Background image for hero banner                 |
| `content_split_heading` | Content Heading     | text      | Heading for content split section                |
| `content_split_content` | Content Body        | rich-text | HTML content for description block               |
| `content_split_image`   | Content Image       | image     | Image shown alongside text                       |
| `cards_heading`         | Cards Heading       | text      | Heading for the cards grid section               |
| `cta_heading`           | CTA Heading         | text      | Call-to-action section heading                   |
| `cta_text`              | CTA Button Text     | text      | Button label                                     |
| `cta_link`              | CTA Button Link     | url       | Button destination                               |
| `process_heading`       | Process Heading     | text      | Section heading for process steps                |
| `process_subtitle`      | Process Subtitle    | text      | Lead text above steps                            |
| `process_steps`         | Process Steps       | JSON      | Array of step objects (title, description, icon) |
| `infographic_title`     | Infographic Title   | text      | Section heading                                  |
| `infographic_content`   | Infographic Content | rich-text | Supporting text                                  |
| `infographic_image`     | Infographic Image   | image     | Main infographic image                           |
| `infographic_items`     | Infographic Items   | JSON      | Array of {title, description} items              |

---

### Icon Name Reference

Use any Lucide icon name in the `icon` field of blocks that support it.

Common examples: `Star`, `ShieldCheck`, `Truck`, `Package`, `Leaf`, `Flame`, `CheckCircle`, `ClipboardCheck`, `Award`, `Users`, `Building2`, `Globe`, `Mail`, `Phone`, `MapPin`, `Clock`, `ExternalLink`.

Full list: https://lucide.dev/icons/

---

### JSON Editor Tips

- Always use valid JSON syntax (double quotes, no trailing commas)
- Use `null` or `""` to clear optional string fields
- Arrays must be enclosed in `[]` — even empty arrays `[]`
- For rich-text fields, HTML strings are supported (`<p>`, `<ul>`, `<a>`, etc.)
- Save the block first after switching to JSON mode before editing

---

### Platform Page Slugs

| Slug                                 | Page                     |
| ------------------------------------ | ------------------------ |
| `home` / `homepage`                  | Home page                |
| `distribution`                       | Distribution / Catalogue |
| `about` / `about-us`                 | About Us                 |
| `manufacturing` / `mfg-page-content` | Manufacturing            |
| `contact` / `contact-us`             | Contact                  |
| `blog`                               | Blog                     |
| `products` / `product`               | Distribution redirect    |
