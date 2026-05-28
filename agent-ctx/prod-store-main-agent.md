# Task ID: prod-store — Main Agent

## Objective
Upgrade ALL storefront components with B2B features, SEO, and professional design for production B2B use.

## Files Updated (9 components)

### Storefront Components
1. **EnquiryModal** (`/src/components/store/EnquiryModal.tsx`)
   - Added collapsible "Business Details" section with Company Name, Company Email, Company Phone, Company Address
   - Added "Required Quantity" number input (default 1)
   - Added "Enquiry Type" selector: General Enquiry / Request for Quote (RFQ)
   - RFQ mode makes quantity required with amber ring highlight
   - Dynamic submit button text: "Send Enquiry" vs "Request Quote" (Hash icon)

2. **ProductDetailPage** (`/src/components/store/ProductDetailPage.tsx`)
   - Dynamic document.title using product.metaTitle
   - Dynamic meta description injection
   - JSON-LD Product structured data with wholesale priceSpecification
   - Breadcrumbs: Home > Catalogue > Category > Product
   - Wholesale pricing card (amber accent) with MOQ info
   - Min order quantity display
   - B2B enquiry form with type selector, quantity, collapsible business details

3. **CataloguePage** (`/src/components/store/CataloguePage.tsx`)
   - document.title: "Product Catalogue | StyleStore"
   - Meta description set on mount
   - "MOQ" badge on product cards where minOrderQty > 1
   - Wholesale price shown on cards
   - "Request Quote" button for wholesale products

4. **HomePage** (`/src/components/store/HomePage.tsx`)
   - document.title: "StyleStore - Premium Products"
   - Meta description set on mount
   - JSON-LD WebSite + Organization structured data
   - "Request Quote" button alongside "Enquire" on featured products with wholesale

5. **ContactPage** (`/src/components/store/ContactPage.tsx`)
   - document.title: "Contact Us | StyleStore"
   - Meta description set on mount
   - Collapsible Business Details section (Company Name, Company Phone)

6. **StoreLayout** (`/src/components/store/StoreLayout.tsx`)
   - JSON-LD Organization structured data from site settings
   - Settings propagation to children via React.cloneElement

### Admin Components
7. **AdminProducts** (`/src/components/admin/AdminProducts.tsx`)
   - Collapsible B2B Section: Wholesale Price, Min Order Quantity
   - Collapsible SEO Section: Meta Title, Meta Description (160 char counter)
   - Wholesale column in products table

8. **AdminCategories** (`/src/components/admin/AdminCategories.tsx`)
   - Collapsible SEO Section: Meta Title, Meta Description (160 char counter)

9. **AdminEnquiries** (`/src/components/admin/AdminEnquiries.tsx`)
   - B2B fields in detail view: Company Name/Email/Phone/Address, Quantity
   - RFQ type badge with Hash icon, amber styling
   - Type label mapping: General, Contact, RFQ
   - Company name shown in table rows

## Design Decisions
- Amber accent color for B2B/wholesale elements (professional, trustworthy)
- Lucide icons: Building2, Hash, Package, SearchCode
- shadcn/ui Collapsible for expandable sections
- All Tailwind CSS, zero inline styles
- Mobile responsive throughout
