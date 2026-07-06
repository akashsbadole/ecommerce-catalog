# Plan: Remove Unimplemented Features from USER.html and USER.md

## Goal
Synchronize documentation with the actual codebase by removing features that are not implemented from both `USER.html` and `USER.md`.

## Why
Cross-checking `USER.html` against the codebase shows multiple documented features that do not exist. Keep the docs aligned to the real system state.

## Verified Unimplemented Features to Remove

### From both USER.html and USER.md

1. **Order Management (admin section)**
   - Lines ~605-619 in `USER.html`
   - Lines ~123-131 in `USER.md`
   - There is no order-management admin UI. Remove the entire section from both files.

2. **Coupons & Discounts**
   - Lines ~757-780 in `USER.html`
   - Lines ~208-216 in `USER.md`
   - No coupon admin or checkout validation exists. Remove from both.

3. **Settings rows**
   - In `USER.html` and `USER.md`, keep only what actually exists:
     - Keep: General, SMTP, B2B, SEO
     - Remove: Shipping, Payment/Razorpay, Theme customization
   - Affects:
     - `USER.html` lines ~806-831
     - `USER.md` lines ~218-229

4. **Customer: Shopping Cart & Checkout (extra checkout steps)**
   - Keep the cart/checkout heading if desired, but remove anything beyond the existing cart icon. If the cart/checkout page is not implemented, remove the whole section:
     - `USER.html` lines ~931-955
     - `USER.md` lines ~272-283
   - Remove: coupon-apply step, payment-method step

5. **Customer: Account & Orders**
   - Remove order-history, saved-addresses, order-tracking claims unless present in code. If no account/orders page exists, remove this section:
     - `USER.html` lines ~957-970
     - `USER.md` lines ~285-292

6. **FAQ: Product Compare**
   - `USER.html` lines ~1107-1111
   - `USER.md` lines ~359-361
   - There is no product-compare feature. Remove the entire comparison FAQ item.

7. **FAQ: How do I use a coupon code?**
   - `USER.html` lines ~1113-1124
   - `USER.md` lines ~363-368
   - Since coupons are unimplemented, remove this FAQ item as well.

## Keep Only What Exists

### Confirmed present (keep)
- Admin login, dashboard, product management, category management, B2B enquiries/quotes, company management, customer management, blog/content pages, media library, banners, multistore, backup/restore, import/export, blocks reference
- Customer: browsing products, B2B buyer portal at `/portal`, enquiries/quotes, contact form

### Do not touch
- Unrelated layout/CSS work planned in `.kilo/plans/1783273822802-left-title-right-content-plan.md`
- The sidebar/doc-body CSS work already in place

## Consistency Rule
Apply the same removals in both `USER.html` and `USER.md` so the Markdown source and HTML output stay aligned.

## Validation
1. Re-run the same feature audit against `USER.html` and `USER.md`.
2. Confirm removed sections no longer appear.
3. Verify heading IDs, TOC links, and anchors remain valid after removals.
4. Open both files and confirm no orphaned TOC entries / broken internal links.

## Out of Scope
- Building the missing features in code.
- Any feature not listed above.
