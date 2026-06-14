# Hero Banner Carousel Slider Plan

## Goal
Convert the existing single-image hero banner block into a multi-slide carousel slider managed from the CMS page builder, using the already-installed `embla-carousel-react` library, with swipe/touch support, animations, and per-slide CTAs.

## Approach
**Modify the existing `hero` block type** (not create a new one). This keeps all existing homepages working via a data migration. Each slide has its own CTA button (text + link).

---

## Step 1: Update `src/lib/page-blocks.ts` (default data schema)

**Change the `hero` defaultData**:
- Remove `backgroundImage`, `buttonText`, `buttonLink`
- Add `items` array: `{ image: string; title: string; subtitle: string; buttonText: string; buttonLink: string }[]`
- Keep `height` and `alignment` (apply per-slide or globally — apply globally to the carousel container)
- Add `autoplay` (boolean, default `true`) and `interval` (number, default `5000`)
- Add `showArrows` (boolean, default `true`) and `showDots` (boolean, default `true`)

New defaultData:
```ts
hero: {
  label: "Hero Banner",
  icon: "Image",
  defaultData: {
    title: "",
    subtitle: "",
    items: [
      {
        image: "",
        title: "Slide 1",
        subtitle: "Description",
        buttonText: "Learn More",
        buttonLink: "/catalogue",
      },
    ],
    height: "medium",
    alignment: "center",
    autoplay: true,
    interval: 5000,
    showArrows: true,
    showDots: true,
  },
},
```

**No Prisma schema change needed** — hero data lives in the `ContentPage.blocks` JSON field.

---

## Step 2: Update `HeroBlock` in `src/components/store/PageBlockRenderer.tsx`

Replace the current static single-image `HeroBlock` (lines 185-254) with an **Embla-based carousel**.

Implementation details:
- Import `useEmblaCarousel` from `embla-carousel-react`
- Import the existing `Carousel`, `CarouselContent`, `CarouselItem` from `@/components/ui/carousel` (or use Embla directly for more control)
- Render each slide with:
  - Full-width background image (`object-cover`)
  - Dark overlay (`bg-black/30`)
  - Title, subtitle, CTA button (positioned per `alignment`: left/center/right)
  - Framer Motion `animate` for slide entry (fade + slight scale or slide-up)
- Navigation: prev/next arrows if `showArrows`, dot indicators if `showDots`
- Autoplay via Embla's plugin system or `setInterval` with `api.scrollNext()`
- Maintain `height` classes (small/medium/large) on the container
- Maintain `alignment` on the text content within each slide

The `onNavigate` callback handles button clicks per slide's `buttonLink`.

---

## Step 3: Data Migration for Existing Hero Blocks

In `PageBlockRenderer.tsx` `HeroBlock`, add a **runtime migration guard** at the top:

```ts
const items = (() => {
  const raw = data.items as Array<{ image: string; title: string; subtitle: string; buttonText: string; buttonLink: string }> | undefined;
  if (raw && Array.isArray(raw) && raw.length > 0) return raw;
  // Legacy single-image format — migrate at render time
  return [{
    image: (data.backgroundImage as string) || "",
    title: (data.title as string) || "Welcome",
    subtitle: (data.subtitle as string) || "",
    buttonText: (data.buttonText as string) || "",
    buttonLink: (data.buttonLink as string) || "/catalogue",
  }];
})();
```

This means **no database migration is needed** — existing hero blocks render correctly immediately via the runtime migration, and admins can optionally re-save to get the new format.

---

## Step 4: Update `src/components/admin/PageBuilder.tsx` (hero block editor)

Replace the current hero editor (lines 355-424) with a new multi-slide editor:

1. **Global settings** (top of form):
   - Title, Subtitle (optional global subtitle shown above slides or just metadata — decide: keep as optional global text, or remove since each slide has its own text)
   - Height select (small/medium/large)
   - Alignment select (left/center/right)
   - Autoplay checkbox + interval input
   - Show Arrows checkbox, Show Dots checkbox

2. **Slides sub-list** (like the existing slider block has, lines 948-1069):
   - Each slide card: image picker, title input, subtitle input, button text input, button link input, remove button
   - "Add Slide" button at the bottom

3. **Live preview** continues to work via `PageBlockRenderer` (the PreviewRenderer dynamically imports it)

---

## Step 5: Update Seed Data `src/app/api/content-pages/seed/route.ts`

Update the `createBlock('hero')` calls in the seed templates to produce blocks with the new `items` format. The `createBlock` function reads `BLOCK_DEFAULTS`, so updating `page-blocks.ts` defaultData is sufficient — **no changes needed in seed route** since it calls `createBlock('hero')` which picks up the new defaults automatically.

However, if we want the seeded homepage to have 2-3 nice demo slides with images, we may optionally enhance the seed route. **Recommend leaving it as-is** — the default slide will show with the gradient fallback if no image is set, and admins can configure via the PageBuilder.

---

## Step 6: Verify Build

After implementation:
```bash
npx tsc --noEmit    # Type check
npm run lint        # Lint
npm run build       # Build check
```

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/lib/page-blocks.ts` | Update `hero` defaultData schema (items array, autoplay, interval, showArrows, showDots) |
| `src/components/store/PageBlockRenderer.tsx` | Rewrite `HeroBlock` to use Embla carousel with per-slide CTAs, animations, arrows, dots, runtime migration guard |
| `src/components/admin/PageBuilder.tsx` | Replace hero editor form with multi-slide editor (slides list with image/text/link per slide, global settings) |

---

## Decision: Legacy Migration Strategy

- **Runtime migration in `HeroBlock`**: existing hero blocks with `backgroundImage` auto-convert to a single-item `items` array
- **No DB migration needed**: `ContentPage.blocks` is JSON, so schema changes don't require Prisma migrations
- **Admins can re-save** via PageBuilder to get the new format permanently stored
