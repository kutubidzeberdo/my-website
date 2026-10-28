# Phase 4.7 — image processing and fitting

Implemented locally on 28 October 2026. No deployment or push.

## Approved frontend geometry

All existing homepage and listing geometry is retained. No card container received a new aspect ratio, width, height, breakpoint or spacing rule. The Hero Slider, Header/Footer and Lightbox components were not changed.

Before/after Chrome captures cover 320, 375, 390, 768, 1024 and 1440px widths (1000px viewport height), homepage and all four listing routes, including Grid/List modes: **54 cases, 714 measured elements**. Every recorded x/y/width/height matches the baseline. Grid columns, gaps, padding, typography, colors, borders, shadows and radii also match. One Chromium auto-margin shorthand serialization differed while its actual bounds and authored CSS remained identical; the comparison explicitly checks that condition.

The following representative image areas are **before = after**, in CSS pixels. Listing values describe the first existing card; List height remains content-dependent. The full JSON records every card and measured section.

| Width | Hero | Homepage News | Homepage ongoing | Homepage portfolio | News grid image | News list image | Project grid image | Project list image |
|---:|---|---|---|---|---|---|---|---|
| 320 | 320.00 × 860.00 | 281.59 × 230.00 | 279.59 × 220.00 | 281.59 × 400.00 | 279.59 × 220.00 | 279.59 × 220.00 | 279.59 × 220.00 | 279.59 × 220.00 |
| 375 | 375.00 × 860.00 | 330.00 × 230.00 | 328.00 × 220.00 | 330.00 × 400.00 | 328.00 × 220.00 | 328.00 × 220.00 | 328.00 × 220.00 | 328.00 × 220.00 |
| 390 | 390.00 × 860.00 | 343.19 × 230.00 | 341.19 × 220.00 | 343.19 × 400.00 | 341.19 × 220.00 | 341.19 × 220.00 | 341.19 × 220.00 | 341.19 × 220.00 |
| 768 | 768.00 × 850.00 | 333.59 × 220.00 | 329.59 × 260.00 | 333.59 × 390.00 | 329.59 × 260.00 | 265.06 × 397.36 | 329.59 × 260.00 | 265.06 × 288.17 |
| 1024 | 1024.00 × 950.00 | 291.19 × 220.00 | 444.80 × 260.00 | 291.19 × 412.78 | 444.80 × 260.00 | 353.69 × 333.97 | 444.80 × 260.00 | 353.69 × 261.58 |
| 1440 | 1440.00 × 950.00 | 387.19 × 220.00 | 588.80 × 260.00 | 387.19 × 390.00 | 588.80 × 260.00 | 464.45 × 270.58 | 588.80 × 260.00 | 464.45 × 261.58 |

Baseline/after screenshots and measurements are saved in `.cms-backups/phase47/` (`before-geometry.json`, `after-geometry.json`, `before-*.png`, `after-*.png`). The final capture explicitly requires each card/Hero image to load and decode. Screenshot comparison excludes only intended card-image areas, allowing at most 20 isolated rasterization pixels per full-page capture. Hero pixels are checked separately.

## Derivatives and delivery

The unchanged admin size remains `thumbnail: 400 × 300`, centered, with the same native eligibility behavior.

The new `card` derivative is **960px wide with proportional height**, `fit: inside`, WebP quality 85. It has no fixed height and no crop. Width-only Payload sizing omits sources narrower than 960px, so small images use the existing main-image/Next.js path. Examples from actual uploads:

| Original | New card | Admin thumbnail |
|---|---|---|
| 1920 × 1080 | 960 × 540 | 400 × 300 |
| 4000 × 3000 | 960 × 720 | 400 × 300 |
| 900 × 1200 | Main-image fallback | 400 × 300 |
| 1080 × 1920 | 960 × 1707 | 400 × 300 |
| 3000 × 3000 | 960 × 960 | 400 × 300 |
| 256 × 236 | Main-image fallback | Native small-image omission |

A pre-cropped 960 × 540 source was deliberately avoided: current portfolio cards and content-driven List images have different proportions. The proportional source preserves the entire composition until the existing CSS performs its single Cover crop.

News/Project records retain their existing main `image` URL and gain separate card source, original dimensions, localized alt and focal metadata. Homepage News, portfolio and ongoing-project cards and all main listing modes use the card source when present, otherwise the main source. Existing responsive `sizes`, loading behavior and Next Image optimization are retained. Sliders still receive main URLs and their presentation/animation code is unchanged.

Card URLs carry an `updatedAt` cache version. Next.js requires an explicit local-image pattern for query strings: the added rule permits version queries only on `/api/media/file/*-card-*.webp`; the default query-free rule remains for other local images. No external provider or storage change was added.

## Cover, Focal Point, Contain

Existing card CSS remains `object-fit: cover`. Saved coordinates become `object-position: X% Y%`; missing/invalid values default to center, zero remains valid, and values are bounded to 0–100. No fit selector or custom editor was added.

The native Media Focal Point dialog is retained. The bilingual Save action now forwards its native focal coordinates, which its custom URL previously omitted. It does not forward destructive original-crop requests. Native cropped thumbnails respond to focal changes; the uncropped card source intentionally keeps the whole photograph, with composition controlled by CSS. Cache-versioned card/custom admin thumbnail URLs prevent stale replacements.

On News/Project details, the main URL remains in use and actual Media width/height replace the previous hard-coded dimensions. The only CSS change is `.record-hero`: `object-fit: contain` and `max-height: min(650px, 80svh)`, retaining width, automatic height and margins. Portrait, landscape, square, panoramic proportions and small sources fit without stretching/cropping; tall portraits stay within a sensible viewing area. No surrounding article/project markup, content, status, progress, SEO or sharing behavior changed.

`PhotoGallery.tsx` and Lightbox CSS/controls/order remain unchanged. The main Lightbox still uses the main photograph and Contain; no card derivative is substituted.

## Existing-media backfill and safety

Fresh pre-migration backup:

`.cms-backups/phase47-2026-10-28T13-15-27-331Z.dump`

`pg_restore --list` verified readability (1,050 lines). A further verified backup was made before derivative metadata writes. The versioned migration adds only six nullable `sizes_card_*` columns and a filename index. No existing column, record, relationship or history table is removed or rewritten.

Final existing-media coverage: **4 useful derivatives retained, 4 images excluded, 0 failures**. The initial generation pass reported 6 processed / 2 skipped / 0 failed; the final reference audit removed only the two newly generated, unused logo derivatives and cleared their new card metadata. The final repeat reported 0 processed / 8 skipped / 0 failed. The four useful sources are Media IDs 1, 5, 6 and 7, referenced by existing News/Project cards. Logo-only media and small/unreferenced media are left on their existing delivery paths. The four sources total 2,608,179 bytes; their stored card derivatives total 625,430 bytes (about 76% smaller before Next.js delivery optimization; this is not a browser-transfer benchmark).

`phase47-backfill.ts` defaults to dry-run; `--apply` creates/verifies a fresh backup before its first write. It inspects actual main files, skips unused/small/already-processed sources, avoids animated-source backfill, rejects file-name collisions with different bytes, and writes only missing useful derivatives. Existing matching files can be reused if metadata is absent. Repeating it processes zero records.

Backfill uses narrow transactional adapter updates, explicitly retaining the original timestamp. The initial normal-save path persisted computed thumbnail URLs and re-keyed six locale rows. Those incidental values, timestamps and row IDs were restored exactly from the fresh snapshot, with content-equality guards. The corrected adapter path avoids those side effects. Final strict parity checks include every original value and ID; no differences remain. A disposable missing-card test verifies the actual adapter path preserves every pre-existing metadata column, locale IDs, original/thumbnail bytes and timestamp, then verifies a second run makes no changes.

SHA-256 comparison confirms all **15 original/main and existing thumbnail files** are byte-identical. All **18,450 original compared database values** are unchanged, including content, localized text, IDs, original Media metadata, slugs, relationships, statuses, progress, user credentials/roles and current Settings/history. Final real counts remain 3 News, 5 Projects, 4 Slides, 2 Testimonials, 4 Statistics, 4 Categories and 8 Media. Normal test audit entries/session/preferences/locks and the new migration entry are operational additions; original audit entries were also compared.

All 20 current Settings revisions and their child rows were preserved. The previously declined restoration of three older revisions was not performed.

## Executed verification

All final checks below were actually executed:

- `npm run build` — passed, including TypeScript and route generation; emitted a non-fatal webpack warning without further diagnostic text.
- `npm run typecheck` — passed.
- `npm test` — **46/46 passed**.
- `cms-phase47-geometry.test.mjs` — passed with all image sources loaded/decoded: 54 cases, 714 elements, identical rendered bounds and Grid/List geometry.
- `cms-phase47-screenshots.test.mjs` — passed: 54 screenshot pairs, **102,418,213 pixels outside card-image areas compared; 40 isolated differing pixels**, maximum 18 in any one capture. Hero pixels were identical. There was no significant layout/design change; intended image-content/compression differences are excluded from this check.
- `cms-phase47-images.test.mjs` — passed: all six representative images uploaded through the real native browser form; originals hash-matched the input buffers, correct thumbnail/card metadata, localized alt preserved, exactly one Media record per upload. Both News and Project details were checked with all six images at 390px and 1440px widths (24 detail cases), with actual image decoding and Contain/dimension checks. Portrait and small-image card fallbacks also decoded successfully.
- The same test saved focal coordinates **15%, 80%** through the native dialog and Save button, reopened them, verified original bytes and filename unchanged, verified the native thumbnail crop changed, and verified the uncropped card bytes stayed unchanged. **Actual card screenshot pixels changed while card width/height stayed fixed**; the optimized URL carried the saved cache version.
- Original-source Lightbox selection and Contain were verified; keyboard next/Escape and gallery order passed on both detail types.
- `cms-phase47-backfill.test.ts` — passed on a disposable image referenced by a disposable draft: only new card fields changed; all original metadata, timestamps, locale-row IDs and original/thumbnail bytes stayed unchanged; repeating the backfill made zero changes.
- `cms-phase47-parity.test.ts` — passed: exactly four useful WebP card files with accurate dimensions/byte sizes; all 15 original/thumbnail hashes and 18,450 original compared values preserved.
- `cms-phase46-media.test.mjs` — passed: actual existing-thumbnail selection, assignment/insertion, save and reopen for News/Project featured images, SEO overrides, ordinary galleries, Lexical images/gallery blocks, mobile Slides and Testimonials. About and all Settings logo fields selected correctly without saving real globals. Public gallery/lightbox/progress and OG override/fallback checks passed.
- `cms-phase44-publishing.test.mjs` — passed: native draft/publish/unpublish/republish, both languages, English fallback and shared progress.
- `cms-phase44-data.test.ts` — passed: rollback-only bilingual writes, Georgian-required validation and denied viewer writes; no persistent Settings writes.
- `cms-phase45-policy.test.ts` — passed.
- `git diff --check` — passed.

Representative mobile/desktop portrait/landscape detail screenshots are also stored as `detail-news-*.png` and `detail-projects-*.png` in `.cms-backups/phase47/`. Mobile verification used Chrome viewports, not physical devices. Six listed upload shapes were exercised; panoramic images use the same aspect-preserving/Contain code path but were not a separate seventh upload fixture. The configured card width is capped at 960px; no processing can restore detail absent from a small source.

No unresolved defect was found in the requested scope. All disposable content and test uploads were cleaned up.

## Exact files modified

Runtime and schema:

- `next.config.mjs` — narrowly allow cache-versioned local card-image optimization.
- `src/cms/image-sizes.ts` — proportional card derivative definition.
- `src/cms/collections.ts` — add that size without changing the admin thumbnail.
- `src/cms/admin/Actions.tsx` — forward native Media focal edits on Save.
- `src/cms/admin/MediaPreview.tsx` — version its thumbnail URL, preserving selection handling.
- `src/cms/migrations/20261028_131818_phase47_card_images.ts`.
- `src/cms/migrations/20261028_131818_phase47_card_images.json`.
- `src/cms/migrations/index.ts`.
- `src/cms/payload-types.ts` — generated card metadata types.
- `src/lib/media-images.ts` — shared card/focal/dimension helpers.
- `src/lib/cms-public.ts` — expose separate image metadata and normalize card URLs.
- `src/lib/records.ts` — supporting image metadata types.
- `src/components/ContentListing.tsx` — existing containers, new source/focal props.
- `src/components/HomepageSections.tsx` — same, only News/ongoing cards.
- `src/components/ProjectPortfolio.tsx` — same, existing portfolio cards.
- `src/app/(frontend)/news/[slug]/page.tsx` — actual original dimensions.
- `src/app/(frontend)/projects/[slug]/page.tsx` — actual original dimensions.
- `src/app/globals.css` — detail hero rule only; all other CSS is byte-identical to baseline.

Supporting scripts, tests and documentation:

- `scripts/cms/phase47-inspect.ts`.
- `scripts/cms/phase47-backfill.ts`.
- `tests/cms-phase47-geometry.test.mjs`.
- `tests/cms-phase47-screenshots.test.mjs`.
- `tests/cms-phase47-images.test.mjs`.
- `tests/cms-phase47-images.test.cjs`.
- `tests/cms-phase47-backfill.test.ts`.
- `tests/cms-phase47-parity.test.ts`.
- `docs/phase47-report.md`.

No dependencies, environment files, storage architecture, auth/roles, bilingual layout, public content or unrelated design files were changed. Generated `next-env.d.ts` was restored to its saved pre-phase contents.
