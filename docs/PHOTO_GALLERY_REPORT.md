# Dynamic photo gallery

## Implementation

One reusable `PhotoGallery` client component uses CSS Grid and the native HTML modal dialog. No lightbox package or other dependency was installed. Native modality supplies focus containment; the component adds scroll locking/restoration, close focus restoration, keyboard arrows, Escape, touch swipe, counter, captions and a scrollable active thumbnail strip. Only the current full-size image is loaded eagerly; preview/filmstrip images use responsive Next.js Image sizes.

| Valid unique images | Page preview |
| --- | --- |
| 0 | Entire section and heading hidden |
| 1 | Full-width landscape; no previous/next lightbox controls |
| 2 | Equal desktop pair; vertically stacked on phones |
| 3 | Large left photograph, two stacked right |
| 4 | Large left photograph, three stacked right |
| 5 | Large left photograph, four in a 2×2 right grid; no overlay |
| More than 5 | First five preview tiles; fifth shows `ყველა ფოტო +N`; every valid image remains in the lightbox |

Mobile uses a prominent first image with supporting tiles. Lightbox arrows sit below the full-width mobile image. Images use cover in preview and contain in the lightbox, without stretching. Reduced-motion preferences disable hover animation.

The gallery normalizer ignores malformed/unsafe/empty sources and exact duplicate sources. Failed network images are removed; an all-invalid collection hides the entire section. Optional captions and accessible alt text are retained. Explicit project gallery arrays are preserved for future CMS records.

## Existing record integration

Both detail templates use the same gallery. Their featured images and all non-gallery content remain intact. The previous adapter manufactured a second unrelated stock photo for every project; that automatic filler was removed. Current project galleries therefore contain only their existing associated featured photo. Current news records supply no gallery arrays, so no empty gallery heading is displayed. No new photos, fictional content or duplicate filler were added to actual records.

## Validation

- `node --test tests/photo-gallery.test.cjs tests/project-navigation.test.cjs`: **14 passed**. Count cases include 0, 1, 2, 3, 4, 5, 8 and 20, exact preview/overlay counts, invalid and duplicate inputs, alt/captions, and existing route/sharing regressions. The navigation test's local TypeScript loader was updated to resolve the new relative gallery helper import.
- `npm run typecheck`: passed.
- `npm run build`: passed. No QA fixture route appears in the final build.
- Chrome fixtures verified 0/1/2/3/4/5/8 image behavior, 49 layout/lightbox viewport checks across **320, 375, 390, 440, 768, 1024, 1440px**, no horizontal overflow, correct first/middle/last indices, arrow buttons, keyboard Left/Right, Escape, swipe, thumbnail selection, active counter, single-image hidden controls, scroll lock/restoration and trigger focus restoration.
- Eight images show five previews with `ყველა ფოტო +3`; index 8 remains accessible in the filmstrip. Clicking the overlay opens index 5. A mobile swipe advances index 5 to 6. Clicking the photo leaves the lightbox open.
- Broken-image browser cases verified duplicate + failed sources collapse to one valid tile, and all-failed sources hide the complete section. No runtime exceptions were detected.
- Loaded desktop/mobile screenshots were visually inspected. The mobile image uses full width and arrows do not cover it. Screenshots and QA output are outside the repository in `/tmp/adjara-phase2-qa/gallery-*`.
- Final real production detail URLs: all five projects and all three news articles return HTTP 200. Direct project refresh works. The real single-image project lightbox was checked at all seven widths; close controls remain in bounds. News with no gallery stays hidden. No hydration or runtime errors were detected.

Browser count fixtures ran only in an isolated temporary checkout, with existing local assets used as test inputs rather than fabricated project records. No test page remains in website source. The user's existing development server was not stopped.

## Files created

- `src/components/PhotoGallery.tsx`
- `src/lib/gallery.ts`
- `tests/photo-gallery.test.cjs`
- `docs/PHOTO_GALLERY_REPORT.md`

## Files modified

- `src/components/ContentElements.tsx` — shared gallery export
- `src/lib/records.ts` — optional captions, preserve explicit galleries, remove automatic unrelated filler
- `src/app/news/[slug]/page.tsx` — shared gallery handles empty collections
- `src/app/projects/[slug]/page.tsx` — shared gallery heading and before/after integration
- `src/app/globals.css` — scoped gallery/lightbox styles
- `tests/project-navigation.test.cjs` — test loader supports the relative shared helper import

## Remaining content limitation

More actual record-associated photographs are needed to show multi-image compositions on real articles/projects. The component is ready for those collections; none were invented to populate layouts. No known gallery functional issue remains from the tested cases.

Homepage, slider, listing/toggle UI, navigation, header/footer, sharing metadata/buttons, Gmail and contact functionality were not changed. No deployment, GitHub push, CMS or database work was performed.
