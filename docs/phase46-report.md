# Phase 4.6 — obsolete controls and existing-media selection

Implemented locally on 28 October 2026. No deployment or GitHub push.

## Changes

Thirteen obsolete fields no longer generate editing controls or bilingual aliases:

| Collection/global | Retired field paths |
| --- | --- |
| News | `illustrative` |
| Projects | `illustrative`, `progressVerified` |
| Testimonials | `illustrative`, `notice` |
| Statistics | `illustrative` |
| Homepage | `previewNotice`, `sections.demo`, `sections.sample`, `sections.transparencyNote`, `testimonialsCopy.placeholder`, `testimonialsCopy.note` |
| Site Settings | `copy.demo` |

The schema pass runs before the existing bilingual adapter. It removes labels/descriptions and sets these legacy definitions to hidden/read-only in the admin schema. Their storage definitions remain deliberately intact: no columns, localized values or version rows were dropped, and no schema migration was needed. This is schema-level retirement, not CSS concealment or renamed replacement controls.

Slides, About, Media, Project Categories, Users and Activity Log were also inspected; they have no additional applicable demo controls. Legitimate titles, descriptions, quotes and translations were retained. Public testimonial rendering no longer depends on the retired flag/note, including its illustrative portrait-alt branch. Project public serialization no longer carries the unused verification boolean.

The real Project percentage field, its existing 0–100 validation, preview, status and public display are unchanged. There is no verification gate. The Homepage warning is no longer editable, and no public disclaimer was restored.

## Media root cause and fix

`MediaPreview` rendered a bare image as a custom table cell. Payload's custom-cell renderer bypasses its default cell, which normally supplies the List Drawer selection callback. Consequently, clicking the thumbnail invoked no selection handler. Before the fix, a real browser click left the drawer open and the featured-image field empty.

The thumbnail now becomes a keyboard-accessible button inside a selector. It calls the existing `useListDrawerContext().onSelect` with the collection, media document and ID. Payload continues to own assignment, field paths, Lexical cursor restoration and drawer closure. The component also uses native selection state for bulk-only drawers; ordinary Media list thumbnails retain their appearance. No overlay, storage, ID, upload or modal workaround was introduced.

## Executed browser verification

Tests ran against the actual production application on local port 3100 in headless Chrome. Disposable records were created first and then opened as existing records; no real organization record was saved for testing. Every disposable record and test upload was deleted through the normal API afterward.

| Workflow | Actual result |
| --- | --- |
| News featured image | Thumbnail click → drawer closes → preview → Publish → reopen; relationship ID `8` persisted |
| Projects featured image | Same complete workflow; ID `8` persisted |
| News/Projects optional SEO image | Thumbnail selection saved ID `7`; public OG metadata used the override |
| News/Projects standard galleries | Two thumbnail clicks persisted exactly `[8, 7]`, in order, without duplicate rows; reopened previews |
| News/Projects Lexical image | Inserted at the editor cursor, previewed, saved and reopened; unsaved Georgian text and existing English content survived |
| News/Projects Lexical gallery block | Two thumbnail clicks persisted exactly `[7, 8]`; native gallery preview displayed both |
| Slides, 390px viewport | Thumbnail selection, preview, Save and reopen; image ID `8` persisted |
| Testimonials, 390px viewport | Thumbnail selection, preview, Save and reopen; portrait ID `8` persisted |
| About image and SEO image | Actual thumbnail selection and previews; intentionally left unsaved |
| Site Settings logo, symbolLogo, fullLogo | Cleared/replaced in the unsaved form, clicked actual thumbnails and saw assigned previews; no Settings save |
| New media upload | Actual browser file selection, Save, authenticated file retrieval and reopen succeeded; disposable upload removed |

Public News and Projects rendered the selected images and saved text. Galleries opened their lightbox, accepted keyboard navigation and closed with Escape. Both manual OG override and featured-image fallback passed; no social-sharing implementation changes were required.

Project UI retained the percentage input and live 55% preview. Entering 101 produced a validation error and left the saved percentage at 55. Actual Payload validation accepted 0, 55 and 100 and rejected -1 and 101 inside a rolled-back transaction. The published ongoing Project displayed 55%.

All ten localized forms were audited in both content tabs and both interface languages: none displayed the retired controls or prohibited labels. Georgian retained the complete form, English retained its exact translation-only fields, and unsaved text survived tab/interface-language switches. Users and Activity Log retained their technical forms without translation tabs.

## Validation results

- `npm run typecheck` — passed.
- `npm test` — 43/43 passed.
- `npm run build` — passed, including TypeScript and all application routes.
- Payload import-map generation — completed, no new imports required.
- Payload type generation — completed; obsolete virtual aliases removed from generated types.
- `tests/cms-phase46-fields.test.mjs` — passed; all applicable forms audited in both languages/tabs.
- `tests/cms-phase46-media.test.mjs` — passed; workflows above, publishing and public media checks.
- `tests/cms-phase46-upload.test.mjs` — passed.
- `tests/cms-phase46-progress.test.ts` — passed; transaction rolled back.
- `tests/cms-phase44-data.test.ts` — passed; bilingual writes, required Georgian and denied viewer writes; transaction rolled back, no Settings writes.
- `tests/cms-phase44-publishing.test.mjs` — passed; draft/publish/unpublish/republish, KA/EN rendering and field-level fallback.
- `tests/cms-phase45-forms.test.mjs` — passed; exact English fields, full Georgian controls, nested-row state and independent interface language.
- `tests/cms-phase45-preservation.test.mjs` — passed; hidden SEO/captions, dates, relationships, other-locale values, Georgian-only publish and partial-English fallback.
- `tests/cms-phase45-policy.test.ts` — passed.
- `tests/cms-phase45-public-read.test.ts` — passed; anonymous public reads.
- `tests/cms-phase46-parity.test.ts` — passed; 17,914 original values preserved.
- `git diff --check` — passed.

## Data preservation

A fresh custom-format archive and complete row snapshot were created before implementation:

`.cms-backups/phase46-2026-10-28T12-15-13-098Z.dump`

`pg_restore --list` successfully read the archive (1,050 lines). The matching `-before.json` snapshot was compared against the database after fixture cleanup. Original IDs, every compared stored value, translations, slugs, relationships, publication statuses, percentages, users/credentials and history were unchanged. Content counts remain: 3 News, 5 Projects, 4 Slides, 2 Testimonials, 4 Statistics, 4 Categories and 8 Media.

All 20 existing Site Settings revisions and their child rows remain unchanged. The three previously missing revisions were not restored, and the old recovery script was not run. Test logins/preferences/locks and appended normal audit events are operational activity excluded from strict content-count parity; original audit entries were still checked.

## Exact files changed for this phase

Runtime/source:

- `payload.config.ts` — retire fields before the existing bilingual adapter.
- `src/cms/retired-fields.ts` — explicit storage-preserving retirement manifest/pass.
- `src/cms/admin/MediaPreview.tsx` — native drawer thumbnail selection.
- `src/cms/translation-policy.ts` — remove retired testimonial notice from editable translations.
- `src/cms/payload-types.ts` — regenerated Payload types.
- `src/lib/cms-public.ts` — remove retired testimonial/progress flag dependencies.
- `src/lib/cms-model.ts` — remove obsolete public testimonial properties.
- `src/lib/records.ts` — remove unused public progress-verification property.
- `src/components/Testimonials.tsx` — remove obsolete illustrative-note rendering.

Verification/documentation:

- `scripts/cms/phase46-inspect.ts`.
- `tests/cms-phase45-forms.test.mjs` — update only expectations for retired controls.
- `tests/cms-phase46-fields.test.mjs`.
- `tests/cms-phase46-media.test.mjs`.
- `tests/cms-phase46-upload.test.mjs`.
- `tests/cms-phase46-progress.test.ts`.
- `tests/cms-phase46-parity.test.ts`.
- `docs/phase46-report.md`.

Earlier Phase 4.3–4.5 workspace changes were retained. No Phase 4.6 changes to public/admin layout, buttons, navigation, theme, authentication, roles, Gmail, dependencies, environment files or storage configuration. Generated `next-env.d.ts` was restored to its saved pre-phase contents.

No unresolved defect was found in the requested scope. Global relationship selections were intentionally not persisted to avoid changing real About/Settings records. Mobile verification used a 390px browser viewport, not a physical device. Bulk-only picker support follows native state but was not separately exercised; the site's existing galleries use individually selected upload rows, which were fully tested.
