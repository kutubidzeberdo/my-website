# Phase 4.5 — implementation report

Corrected the existing bilingual forms: **ქართული shows the complete editing form; English shows translation fields only.** Removed the Shared Settings heading and corrected Add New alignment. No public page, Contact Form, navigation, authentication, Gmail configuration or database schema was changed.

## What changed

`translation-policy.ts` defines explicit English field rules by content meaning and existing stored path. The adapter preserves the original form order instead of moving shared fields to a separate section. Georgian retains localized text, images, galleries, URLs, slug, dates, relationships, status, progress, numeric values, ordering and active controls normally available to the authorized editor. Previously hidden internal/archive fields remain hidden, including About's archived paragraphs.

Shared fields use presentational wrappers that remain mounted but are hidden in English. Mixed groups show their permitted translation text only. Repeatable text arrays have one native Georgian structure editor; English edits existing row translations without add/delete/reorder/ID controls. Both locale input bindings share one native form state, including nested rows. No collection, document, persisted field or relationship was duplicated.

Hidden translations are retained in form state. The existing write adapter now forwards only locale keys actually submitted; it no longer synthesizes null for an omitted locale. This protects pre-existing English values when only Georgian is submitted. Explicit empty English input remains empty, allowing field-level public fallback.

The Shared Settings UI field, renderer and styling are removed rather than renamed or replaced. No artificial shared-settings section remains.

The top-right interface language selector and its styling are unchanged. It still affects interface labels only; content tabs operate independently. The existing full Lexical editors, one-record saves, draft handling, permissions, validation and single document-level Publish/Unpublish actions are retained. News and Projects retain Publish/Unpublish; non-draft content types retain their existing single Save/active-state workflow. No locale-specific publication submenu was introduced.

List title/action containers now use flex alignment with `align-items: center` and `justify-content: space-between`, with native bottom offsets removed. At 390px they intentionally stack. Green background, white centered text, rounded shape, button size and functionality remain; no icons or negative positioning were added.

## Complete collection/global audit

The paths below are the existing stored paths, not new translation records. `[]` denotes existing repeatable rows.

| Collection/global | Exact English fields | Georgian form |
|---|---|---|
| News | Title (`title`), Short Description (`summary`), Full Content (`content`, Lexical) | Complete, including media/gallery, slug, author, publication date, video, SEO and existing flags |
| Projects — All/Ongoing/Completed | Title, Short Description, Full Content (Lexical), Location, Construction Phase, Budget, Contractor, Client, Investment, Area | Complete, including status, progress, categories, dates, relationships, media/gallery, slug and SEO |
| Slides | Title, Subtitle, Description, Button Text | Complete, including image, button URL, order and active state |
| Testimonials | Name, Position / Organization, Testimonial, Illustrative Note | Complete, including portrait, illustrative flag, order and active state |
| Statistics | Label (`title`), Suffix | Complete, including numeric counter, order and existing flags |
| About | Title, Full Company Description (continuous Lexical), SEO Title, SEO Description | Complete, including image and shared SEO image; archived paragraphs remain hidden |
| Homepage | Existing localized section and testimonial copy; exact nested paths below | Complete, including all existing repeatable structure and legacy metric values |
| Site Settings | Company Name, Address and existing localized site copy; exact paths below | Complete, including shared phone, telephone link, email, social URLs and logos |
| Project Categories | Name (`title`) | Complete, including order |
| Media | Alternative Text (`alt`), Caption | Complete, including descriptive title, upload/file controls, filename and image metadata |
| Users | None; no bilingual tabs | Original technical form unchanged |
| Audit Logs | None; no bilingual tabs | Original technical view unchanged |
| Payload KV, document locks, preferences, migrations | None; no bilingual tabs | Internal technical schemas unchanged |

Projects use the original fields `title`, `summary`, `content`, `location`, `phase`, `budget`, `contractor`, `client`, `investment`, `area`. Budget, Investment and Area are already localized **descriptive text** fields; they were not converted from numbers. There is no numeric-field exception among the ten requested paths. Progress, numeric counters and structured values remain shared.

Existing English News/Project SEO and gallery-caption values and Media title translations remain stored even though their English inputs are not exposed. No existing testimonial/disclaimer text was changed. The removed public slider sentence and development disclaimer were not restored.

Homepage legacy `sections.metrics` contains numeric values stored as strings, so it is not exposed in English. The standalone legacy `previewNotice` is also not exposed there. Site copy's removed hero/disclaimer fields `copy.eyebrow` and `copy.demo` are Georgian-only. Their stored values were not deleted or changed.

### Exact Homepage English paths

- `sections.processLabel`
- `sections.processTitle`
- `sections.processIntro`
- `sections.stages[].value[].value`
- `sections.servicesLabel`
- `sections.servicesTitle`
- `sections.categories[].value`
- `sections.serviceDescriptions[].value`
- `sections.portfolioLabel`
- `sections.portfolioTitle`
- `sections.demo`
- `sections.all`
- `sections.preview`
- `sections.close`
- `sections.transparencyLabel`
- `sections.transparencyTitle`
- `sections.transparencyText`
- `sections.transparencyPanel`
- `sections.transparencyItems[].value`
- `sections.transparencyNote`
- `sections.progressLabel`
- `sections.progressTitle`
- `sections.phase`
- `sections.updated`
- `sections.newsLabel`
- `sections.newsTitle`
- `sections.read`
- `sections.sample`
- `testimonialsCopy.title`
- `testimonialsCopy.intro`
- `testimonialsCopy.label`
- `testimonialsCopy.placeholder`
- `testimonialsCopy.quotes[].value`
- `testimonialsCopy.note`
- `testimonialsCopy.previous`
- `testimonialsCopy.next`

### Exact Site Settings English paths

- `companyName`
- `address`
- `copy.company`
- `copy.short`
- `copy.second`
- `copy.nav[].value`
- `copy.contact`
- `copy.explore`
- `copy.slides[].value[].value`
- `copy.overview`
- `copy.description`
- `copy.footerText`
- `copy.footerTitles[].value`
- `copy.footerLinks[].value`
- `copy.contactNote`
- `copy.rights`
- `copy.pause`
- `copy.play`
- `copy.next`
- `copy.previous`
- `copy.menu`

## Actual verification

- **TypeScript:** `npm run typecheck` passed, including regenerated Payload types.
- **Production build:** `npm run build` passed with all existing routes retained.
- **Automated regression suite:** `npm test` passed all 43 existing tests, including localization/fallback and unchanged contact endpoint tests.
- **Policy test:** `cms-phase45-policy.test.ts` passed exact field rules, semantic exclusions and omission-safe locale writes.
- **Full browser form audit:** `cms-phase45-forms.test.mjs` passed on the production build for all ten localized forms, plus Ongoing/Completed project creation views. It verified the exact English field lists, available Georgian controls, no Shared Settings heading, no English uploads/relationships/numbers/toggles/row controls, blank/actual stored English, independent interface language and preserved unsaved values. Nested Homepage stage rows and Site Settings navigation rows each had one binding per locale and preserved edits in both directions. No real global was saved. Users and Audit Logs were checked for absence of translation tabs.
- **Add New alignment:** `cms-phase45-alignment.test.mjs` passed for News, Projects, Slides, Testimonials, Statistics, Media, Categories and Users at 1440px and 390px. Desktop heading/button vertical centers differed by no more than 2px; mobile stacking and button viewport bounds passed. Original green/white styling and absence of visible icons passed. Audit Logs correctly had no create action.
- **Hidden-value preservation:** `cms-phase45-preservation.test.mjs` passed using disposable News/Projects containing existing English SEO/captions and shared media, gallery rows, dates, status, progress and categories. Saving English and then Georgian preserved hidden values, original row IDs, media references and the other locale. It also passed Georgian-only publishing, blank English editing, partial English title/Georgian-body public fallback and no writes of fallback text into English storage.
- **Existing CMS tests:** `cms-phase44-data.test.ts` passed coordinated bilingual writes for News, Projects, Slides, Testimonials, Statistics and Categories; About/Homepage saves were tested in a transaction that was rolled back. Georgian-required validation and viewer denial passed. Site Settings was not written.
- **Existing production browser regressions:** `cms-phase44-publishing.test.mjs` passed News/Projects Save Draft, one Publish, public KA/EN text and fallback, one Unpublish, anonymous 404 after unpublish and republish. `cms-phase44-browser.test.mjs` passed unsaved bilingual Lexical/title editing, repeated interface-language changes, saving/reopening both translations, embedded video editor labels and all localized views. Its obsolete Shared Settings expectation was updated to require absence.
- **Anonymous CMS reads:** `cms-phase45-public-read.test.ts` passed News, Projects, Slides, Testimonials and Media access without weakening permissions.
- **Final database comparison:** `cms-phase45-parity.test.ts` passed for **17,490 original values** against the fresh baseline; original content/translations, IDs, slugs, relationships, numeric values, media, user roles/credentials and current Settings/history were preserved. Disposable records were deleted; native audit entries and ordinary login-session activity remain.
- `git diff --check` passed.

Final browser verification used the isolated production server on port 3100 with a matching trusted origin. Intermediate dev-server errors were followed by passing production runs. There were no JavaScript exceptions in the passing form/workflow suites.

## Database safety and scope

Created `.cms-backups/phase45-2026-10-28T11-19-10-524Z.dump` and a private data snapshot before mutation tests. `pg_restore --list` verified that the archive was readable (1,050 listing lines). No schema migration, seed, import, reset or destructive data update ran. No real Site Settings value or historical Settings row was modified. The previously declined recovery of three older Settings revisions was not attempted.

The original data totals remain 3 News, 5 Projects, 4 Slides, 2 Testimonials, 4 Statistics, 4 Categories and 8 Media records. All 20 Settings revisions present at the start of this phase remain unchanged. No deployment, GitHub push, package installation or PostgreSQL configuration change was performed. `.env.local` was not written. The build-generated Next environment declaration is restored to its pre-task contents.

## Exact Phase 4.5 files changed or added

- `src/cms/translation-policy.ts`
- `src/cms/bilingual.ts`
- `src/cms/admin/BilingualFields.tsx`
- `src/app/(payload)/theme.css`
- `src/app/(payload)/admin/importMap.js` (generated)
- `src/cms/payload-types.ts` (generated)
- `scripts/cms/phase45-inspect.ts`
- `scripts/cms/phase45-audit.ts`
- `tests/cms-phase45-forms.test.mjs`
- `tests/cms-phase45-alignment.test.mjs`
- `tests/cms-phase45-preservation.test.mjs`
- `tests/cms-phase45-policy.test.ts`
- `tests/cms-phase45-public-read.test.ts`
- `tests/cms-phase45-parity.test.ts`
- `tests/cms-phase44-browser.test.mjs` (obsolete heading assertion corrected)
- `docs/phase45-report.md`

No known unresolved functional issue remains. Real Site Settings was intentionally not saved for testing; its UI/unsaved-state behavior and exact database preservation were verified. Every advanced Lexical command was not exhaustively retested, but text editing, embedded video controls and bilingual publication were exercised using the existing editor.
