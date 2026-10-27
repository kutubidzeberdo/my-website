# Phase 4.2 — admin improvements and live CMS cutover

Implemented locally on 27 October 2026. No deployment, Git push, package installation, database reset, role recreation or content reimport was performed.

## Public source of truth

The existing public components now receive server-read Payload/PostgreSQL data:

| Public surface | CMS source and policy |
| --- | --- |
| `/news`, `/news/[slug]`, homepage latest News | Published canonical News only. Newest effective timestamp first: `publishedAt`, otherwise `createdAt`; numeric ID breaks ties. Homepage maximum 3. |
| `/projects`, `/projects/ongoing`, `/projects/completed`, `/projects/[slug]` | One published Projects collection. Ongoing/completed views filter the saved lifecycle status. Actual numeric progress, including 0, is shown; null remains unknown. |
| Homepage infrastructure / ongoing cards | Existing category/status filtering and layouts. Maximum 6 infrastructure cards / 2 ongoing cards. |
| Homepage slider | Active Slides in `order`, then ID order. Existing carousel adapts to the actual number of slides; controls, proportions, animations and buttons remain. |
| Testimonials / yellow counters | Active records in saved order. Illustrative testimonials retain their explicit sample notice; actual saved numbers drive the existing animations. |
| `/about` | Unified localized About Lexical document and optional saved image/SEO. Exact original Georgian copy is retained. |
| Header / footer / contact | Public Site Settings, including company name, telephone, email, address, social links and authorized logo assets. Homepage section copy comes from the Homepage global. |

Queries explicitly use `overrideAccess: false`, Georgian locale/fallback, `depth: 0`, intentional field selection, and publication/active filters. They do not query Users or Audit Logs. Client card props contain previews rather than full editor JSON, redirect history, CMS record IDs, SEO internals, Payload configuration or credentials. Full editor documents remain on the server for detail rendering. Draft-only/unreferenced uploads are excluded from anonymous Media reads; authorized staff retain their normal reusable Media library. Public assets are collected only from published records, active homepage collections and public globals.

There is no stale static-content fallback when PostgreSQL is unavailable. The original static data modules remain for reference/import tooling. Canonical Slides, Testimonials and Statistics collections control displayed records; their historical global copy arrays are retained as reference data. The former static About paragraphs are preserved verbatim in `src/data/about.ts`; the existing importer now reads that archive, but was **not run**. Gmail's operational recipient and OAuth configuration remain unchanged when an administrator changes public contact-display information.

## Updates and caching

The public route-group layout is `force-dynamic`: every public request reads fresh CMS data. React `cache` deduplicates queries within a render; it does not retain content across requests. Authorized CMS after-change/delete hooks also call Next's `revalidatePath('/', 'layout')`. CLI calls without a Next request store need no invalidation because public content is not persistently cached. There is no exposed revalidation endpoint.

Publishing, editing, changing status, deactivating and deleting content therefore take effect on the next request/refresh without restarting Next or redeploying. This favors correctness for the current local dataset; large-scale caching/pagination optimization is outside this cutover.

References: [Payload Local API/access options](https://payloadcms.com/docs/local-api/overview), [Next route segment configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config), [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath). Installed Payload 3.92.0 and Next 16.4.3 source/types were inspected for the actual extension points.

## Admin controls

- Native Add New collection actions use green `#167647`, white text and a decorative white plus, rounded corners, spacing, hover/focus and disabled treatment. Inline relationship/upload create controls receive the same treatment. Other Save buttons retain the navy theme.
- Supported Publish/Unpublish component slots delegate to native Payload operations. Publish is green with a check; Unpublish is amber with an eye-off icon. The native Edit tab and bulk Edit are blue with a pencil; document and bulk Delete controls are red with a trash icon. Bulk Publish/Unpublish use matching icons/colors; both document and bulk publication controls honor the existing granular publish permission. Labels remain Georgian. No runtime DOM injection or replacement mock CRUD was added.
- News/Project slug label is **გვერდის მისამართი (URL)** with the requested explanatory text and a live path preview. New titles produce deterministic Georgian-to-Latin URLs. Editing the slug stops title-following; an explicit regenerate action restores it. Existing documents retain their slugs when titles change.
- Server hooks normalize/validate slugs, reserve listing route names, reject taken manual URLs and suffix automatically generated duplicates. A PostgreSQL transaction advisory lock serializes slug/alias decisions; native unique indexes also remain. Old URLs are retained in protected `previousSlugs` JSON and redirect with HTTP 308 to the current published record. Draft/unpublished aliases do not resolve publicly. Existing slugs were not regenerated.
- Project status and **შესრულების პროგრესი (%)** are directly above the editing tabs in the initially open **პროექტის სტატუსი და შესრულების პროგრესი** section. The existing `progress` column is reused; there is no duplicate field. A live preview bar displays the entered number or an unknown state. Native/server validation allows 0–100 and null, with Georgian errors.
- Admin navigation groups **ყველა პროექტი**, **მიმდინარე პროექტები**, **დასრულებული პროექტები**. They use the native Projects list and server filtering, retaining permissions, search, sort, pagination, bulk actions and editing. The supported list-view wrapper carries ongoing/completed defaults into the native Create form; a user can subsequently change the status. No Projects records or collections are duplicated.
- Media has the requested Georgian explanation, reusable native pickers/upload drawers, native bulk-upload support, thumbnail rows, filename/type/size/dimensions, search/filter/sort, alt text and captions. A separate custom grid was not introduced. Shared media deletion is blocked with a Georgian explanation until references are removed, including references in drafts and globals; native delete confirmation remains.

## Rich text and SEO

`CMSRichText` safely renders paragraphs, H1–H6, bold/italic/underline/strike, inline code/sub/sup, lists, quotes, alignment/indentation, separators, safe external/internal links, inline Media images, native gallery blocks and allowlisted YouTube/Vimeo blocks. It does not inject arbitrary HTML. Public social/telephone destinations are also validated before saving. Internal links resolve only published News/Projects. Gallery rows retain saved order and reuse the existing classical `PhotoGallery`/fullscreen lightbox unchanged. Video embeds use validated player URLs and sandboxed iframes.

Detail metadata uses each record's own title/description/featured or SEO image, canonical URL, Open Graph values and Twitter card. Same-origin Payload file URLs are normalized to local paths for Next's image optimizer; metadata converts them back to absolute URLs. Non-HTTP metadata URLs are rejected. Configure the real public `NEXT_PUBLIC_SITE_URL` when eventually deploying; local acceptance used `http://localhost:3100` without editing `.env.local`.

The existing public CSS, photographs, gallery/lightbox, sharing button, section order, navigation and Grid/List components are preserved. A pre-existing cross-runtime date-format issue discovered by the new January-1 publication test was fixed: Node and Chrome now normalize the day identically rather than hydrating `1` versus `01`. No public redesign was performed; exact pixel equality is not claimed because live CMS-created content now appears.

## Database and backups

Private, Git-ignored checkpoints are under `.cms-backups/phase4-2/`:

- `before.dump` — PostgreSQL 17 custom-format backup, mode 0600.
- `media-before.tar.gz` — existing local uploaded files, mode 0600.
- `source-before.tar.gz` — source/configuration/tests/docs checkpoint, mode 0600.
- `content-before.json` — all original managed records/globals, including the user-created News and media, mode 0600.
- `environment.sha256` — integrity check of the existing `.env.local`; no credentials printed.

Migration `20261027_112506_phase42_live_content` adds only four guarded nullable JSON columns: `news.previous_slugs`, `_news_v.version_previous_slugs`, `projects.previous_slugs`, `_projects_v.version_previous_slugs`. No new collection/table, drop, reset or bulk data rewrite was needed. Its down operation deliberately refuses to discard URL history. Restore backups to a separate recovery database and review a forward correction rather than overwriting the live database.

The initial checkpoint includes 4 News (including the user's published `/news/aaa`), 5 Projects, 9 Media, 4 Slides, 2 Testimonials, 4 Counters and 4 Categories. Test operations create normal audit/version/session metadata; official content and globals are restored exactly and disposable fixtures are removed. Existing native version-retention limits remain in effect.

## Validation

All checks below were actually executed locally:

| Check | Actual result |
| --- | --- |
| TypeScript and production build | PASS. Public pages build as dynamic routes; no static-parameter list limits newly published slugs. |
| Automated unit/public/Gmail regressions | **39 passed, 0 failed**. Includes deterministic Georgian transliteration and empty/partial CMS-copy handling. Existing metadata/navigation fixtures were adapted to the database cutover; Gmail/MIME/contact mock coverage remains. |
| Existing CMS API/security suite | **20 passed**: username-only authentication, no response hash/salt/token, strong passwords, CSRF/origin, anonymous writes, roles, own drafts, publish restrictions, last Super Administrator, lockout, deactivation, audit access, granular overrides, CRUD and upload-byte validation. |
| Production sessions | PASS: regular 2h / remembered 30d, matching server expiry, HttpOnly/Secure/SameSite cookies, refresh cap, logout/deactivation, five-attempt lockout and viewer dashboard/navigation privacy. |
| Password recovery | PASS on disposable accounts: reset, short/reused/expired-token rejection, old-password rejection and replacement acceptance. No recovery email sent. |
| Admin browser | PASS: green Add New across eight collections and inline creation; automatic/title-following/manual/regenerated News slugs and URL warnings; project slugs stay stable; green publish, amber unpublish, blue edit, red delete; native bulk icons; Author can edit own draft but cannot see document/bulk publication controls. |
| Project administration | PASS: filtered ongoing/completed Create defaults, one canonical record, visible progress section/bar, save/reopen 65 and 0; API tests cover 0/100/null and rejection of -1/101. |
| CMS-to-public News | PASS: disposable draft hidden; publish appears on listing/home/detail with real uploaded photo, rich text, inline photo, gallery/video, sharing and metadata; edits appear after refresh; manual normalization and HTTP 308 alias work; unpublish hides listing/detail/aliases. The user's existing `/news/aaa` is also visible and preserved. |
| Slug concurrency | PASS: simultaneous automatic-title creations receive distinct slugs. Manual URL/alias collisions are rejected. |
| Client transport | PASS: a disposable published article preview appears on homepage/listing without its full editor body in the serialized card props; the complete body renders on its detail route. |
| Public media privacy | PASS: draft-only asset metadata **and original file URL** are inaccessible anonymously; published images load; referenced-file deletion is blocked. |
| CMS-to-public Projects | PASS: published detail/gallery/share, saved progress updates, ongoing → completed movement, unpublish removal. |
| Other collections/globals | PASS: new/edited slide and counter render on refresh; illustrative testimonial/notice render; About, public telephone and homepage notice updates appear. Globals were restored from exact pre-test values, with a concurrent-edit guard before restoring. Unsafe public social/tel destinations are rejected before saving. |
| Public regression | PASS: every original published News/Project URL, exact titles, featured photos, unique metadata, header/footer, routes, category/status filters, Grid/List, maximum 6/2/3 cards, all View All destinations and exact two-item public Projects submenu. |
| Notifications/confirmation | PASS: Georgian native create/update/delete success, persistent dismissible validation error with no false success, delete cancellation, confirmed deletion, reduced motion, every collection/global admin screen loads. |
| Responsiveness / runtime | PASS at 320/375/390/440/768/1024/1440 for tested public layouts, selected native bulk controls, Media lists, success toast and delete confirmation. No admin/public JavaScript exceptions in the acceptance runs. |
| Migration / database | All three migrations report applied. PostgreSQL verification confirms `pmc_app / pmc_cms / 5433` and rejects an incorrect password. |
| Final preservation audit | PASS: all original managed records, IDs/slugs, user-created News and exact About/globals match the checkpoint; all original local media bytes, public assets/styles, gallery/sharing source, Gmail/contact source and `.env.local` remain unchanged. All disposable records/uploads are removed. |

The production browser server used port 3100 with temporary command-level `CMS_SERVER_URL` and `NEXT_PUBLIC_SITE_URL`; `.env.local` was never overwritten. The existing development server on port 3000 remains the review entry point.

Commands:

```sh
npm run typecheck
npm test
npm run build
npm run cms -- migrate:status
python3 scripts/verify-local-cms-db.py
CMS_TEST_URL=http://localhost:3100 CMS_TEST_ORIGIN=http://localhost:3100 node tests/cms-api.test.mjs
CMS_TEST_URL=http://localhost:3100 node --import tsx tests/cms-phase41-sessions.test.ts
node --import tsx tests/cms-recovery.test.ts
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase42-integration.test.mjs
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase42-admin.test.mjs
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase42-public.test.mjs
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase42-transport.test.mjs
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase41-feedback.test.mjs
node --import tsx tests/cms-phase42-data.test.ts
```

API/browser tests run sequentially when they mutate fixtures. They require the local private bootstrap credentials and baseline backups; these are Git-ignored. Verification logs are retained privately in `.cms-backups/phase4-2/verification/`. A project-editor screenshot is in `.cms-backups/phase4-2/screenshots/`; public/Media screenshots containing the existing user-uploaded personal document are not included in the review bundle.

## Files

Created:

- `docs/PHASE4_2_IMPLEMENTATION_REPORT.md`
- `src/cms/admin/Actions.tsx`
- `src/cms/admin/MediaPreview.tsx`
- `src/cms/admin/ProjectControls.tsx`
- `src/cms/admin/SlugField.tsx`
- `src/cms/media-usage.ts`
- `src/cms/migrations/20261027_112506_phase42_live_content.json`
- `src/cms/migrations/20261027_112506_phase42_live_content.ts`
- `src/cms/public-assets.ts`
- `src/cms/public-invalidation.ts`
- `src/cms/slug-shared.ts`
- `src/cms/slug.ts`
- `src/components/CMSContext.tsx`
- `src/components/CMSRichText.tsx`
- `src/data/about.ts`
- `src/lib/cms-copy.ts`
- `src/lib/cms-model.ts`
- `src/lib/cms-public.ts`
- `src/lib/video-embed.ts`
- `tests/cms-phase42-admin.test.mjs`
- `tests/cms-phase42-copy.test.cjs`
- `tests/cms-phase42-data.test.ts`
- `tests/cms-phase42-integration.test.mjs`
- `tests/cms-phase42-public.test.mjs`
- `tests/cms-phase42-slug.test.cjs`
- `tests/cms-phase42-transport.test.mjs`

Modified:

- `README.md`
- `docs/CMS_MIGRATION.md`
- `docs/CMS_SECURITY.md`
- `scripts/cms/import.ts`
- `src/app/(frontend)/about/page.tsx`
- `src/app/(frontend)/contact/page.tsx`
- `src/app/(frontend)/layout.tsx`
- `src/app/(frontend)/news/[slug]/page.tsx`
- `src/app/(frontend)/news/page.tsx`
- `src/app/(frontend)/page.tsx`
- `src/app/(frontend)/projects/[slug]/page.tsx`
- `src/app/(frontend)/projects/completed/page.tsx`
- `src/app/(frontend)/projects/ongoing/page.tsx`
- `src/app/(frontend)/projects/page.tsx`
- `src/app/(payload)/admin/importMap.js`
- `src/app/(payload)/theme.css`
- `src/cms/admin/Navigation.tsx`
- `src/cms/admin/NavigationClient.tsx`
- `src/cms/collections.ts`
- `src/cms/editor/Previews.tsx`
- `src/cms/fields.ts`
- `src/cms/globals.ts`
- `src/cms/migrations/index.ts`
- `src/cms/payload-types.ts`
- `src/components/ContactForm.tsx`
- `src/components/ContentListing.tsx`
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/components/HomepageSections.tsx`
- `src/components/PageUtilities.tsx`
- `src/components/ProjectPortfolio.tsx`
- `src/components/Statistics.tsx`
- `src/components/Testimonials.tsx`
- `src/components/Website.tsx`
- `src/lib/records.ts`
- `src/lib/site-metadata.ts`
- `tests/gmail-contact.test.cjs`
- `tests/project-navigation.test.cjs`

Installed packages: **none**. `package.json`, `package-lock.json`, `next.config.mjs` and `payload.config.ts` are unchanged from the Phase 4.2 checkpoint. The working tree also contains earlier uncommitted Phase 4/4.1 work; the full Git diff must not be treated as this phase alone.

## Content review item

The preserved published article `/news/aaa` uses a featured photograph that appears to contain an identity document. Review this administrator-uploaded content before any external deployment. It was not removed or altered, and no deployment was performed. No identifying document details are transcribed here.

## Limits

- Local production-mode tests do not verify remote Facebook scraper previews or live third-party video playback. They verify share URLs, metadata, safe embed URLs/structure and persisted rendering. External video requests are isolated in automated tests.
- The native multi-file bulk-upload flow was retained but not separately exercised as a browser batch. Single-file upload, reuse, previews, public rendering and protected deletion were exercised.
- A native thumbnail list is retained instead of adding an independent Media grid implementation.
- No paid cloud service, DigitalOcean configuration, PostgreSQL 13 change, live Gmail send, deployment or Git push was performed.
