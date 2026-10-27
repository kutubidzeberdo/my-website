# Phase 4.1 — branded Payload administration

Implemented locally on 27 October 2026. This report concerns the admin-only follow-up to Phase 4. No deployment, Git push, package installation, database reset or source-content reimport was performed.

## Implementation

- Exact existing brand colors: navy `#152033`, gold `#e9d54f`, soft gray `#f1f1f3`. The admin uses a light workspace, dark navigation, gold active links, restrained borders/shadows, responsive cards and forms, readable tables and reduced-motion support.
- Official `/images/company-logo.png` appears on the centered login card and sidebar, with **აჭარის პროექტების მართვის კომპანია**. Existing public assets are unchanged.
- Native Payload admin extension points provide the login view, navigation, dashboard, graphics, cells and Lexical features. The editor uses supported client/server feature APIs; there is no runtime DOM injection.
- Dashboard counts are computed through Payload with the current request and `overrideAccess: false`. Authorization gates prevent unauthorized user counts and unavailable quick actions. Ongoing Projects links to the canonical Projects collection with a status filter.
- News and Projects use unnamed editing tabs, preserving field paths. About has Content / Media / SEO tabs and a single continuous rich-text editor. Structured dates, progress, status, counters and short testimonial fields remain structured.
- The visible Lexical toolbar includes bold, italic, underline, strikethrough, H1–H4, alignment, lists, indentation, quotes, separators, links, native uploads, gallery/video blocks, undo, redo and clear formatting. Keyboard shortcuts and native cursor/selection behavior remain. Core toolbar labels are Georgian; some advanced native help/menu strings retain upstream English fallback.
- Inline images use Payload's native Media picker and upload drawer, image previews, alternative text and caption fields. Existing file validation and responsive image metadata remain.
- Gallery blocks use native repeatable image rows, ordering/removal controls and live ordered previews. Video blocks validate HTTPS YouTube/Vimeo URLs on the server and preview only allowlisted player URLs in sandboxed iframes. Arbitrary embed scripts are rejected. Native block forms synchronize edits immediately into Lexical so a quick Save includes the latest URL/gallery changes.
- Existing Georgian native Sonner success/error feedback and delete confirmation remain one system. The theme brands confirmation dialogs and retains reduced-motion behavior; success feedback follows server persistence.

## Remember Me

Unchecked login uses the existing **2-hour** session. Checked login issues an HttpOnly persistent cookie and native Payload session with an absolute **30-day maximum**. Refresh cannot extend a remembered session beyond that original deadline. Explicit logout and account deactivation revoke the native session.

The server delegates password verification, salted hashing, login-attempt limits, session creation, JWT verification and refresh to Payload 3.92.0 public authentication operations. A request-local copy of the collection's token duration prevents cross-user global configuration changes. Private `users.session_policies` metadata associates native session IDs with remembered-session deadlines; clients cannot read or write it. The custom login/refresh responses do not return access tokens. No password or token is stored in localStorage. Cookies retain the existing HttpOnly / SameSite=Lax policy and Secure flag in production. Development HTTP retains the existing development cookie policy.

Custom session endpoints require an allowed Origin. Login accepts bounded JSON and only username/password/rememberMe; it does not accept client-supplied token lifetimes or roles. Existing native lockout, active-account, last-super-admin, role, publish and recovery rules remain.

## Safe About migration

Before schema changes, private backups were created in `.cms-backups/phase4-1/`: a mode-0600 PostgreSQL custom-format dump, admin-source archive, exact source-content snapshot, and public/environment checksums. This directory remains Git-ignored and must not be published.

Migration `20261027_092030_admin_editor_and_session_policy` adds three columns only:

- `users.session_policies`
- `about_locales.content`
- `_about_v_locales.version_content`

It converts saved localized paragraph rows, in their original order, to one valid Lexical document. The same conversion preserves historical versions. Existing rich-text documents are never overwritten (`WHERE content IS NULL`); guarded column additions make repeat execution safe. No tables or old paragraph rows are deleted. The legacy paragraph field is hidden and cannot be edited through the normal update API. Georgian default/fallback behavior is retained.

Recovery is deliberately forward-only: the migration's `down` refuses to drop live rich-text edits. For recovery, first back up the current database, restore the private dump to a **separate** recovery database using the documented local PostgreSQL 17 client, inspect the required records, and prepare a reviewed corrective migration. Do not overwrite the live database with the old dump. The retained legacy paragraph tables and source archive also permit comparison and a reviewed temporary restoration of the old editing configuration.

## Files in this phase

Created:

- `src/app/(payload)/theme.css`
- `src/cms/admin/{Brand,Cells,Dashboard,Icon,Login,LoginForm,Navigation,NavigationClient}.tsx`
- `src/cms/editor/{AccessibilityFeature,AccessibilityFeature.client,ActionsFeature,ActionsFeature.client,BlockEditor,Previews}.tsx` / `.ts`, and `config.ts`
- `src/cms/session-policy.ts`, `src/cms/video.ts`
- `src/cms/migrations/20261027_092030_admin_editor_and_session_policy.{ts,json}`
- `tests/cms-phase41-{data,sessions}.test.ts`, `tests/cms-phase41-{browser,upload,feedback,public}.test.mjs`
- This report.

Modified:

- `payload.config.ts`
- `src/app/(payload)/layout.tsx` and generated `admin/importMap.js`
- `src/cms/{users,collections,globals,fields,hooks,translations,payload-types}.ts`
- `src/cms/migrations/index.ts`

The package versions and lockfile were not changed during Phase 4.1. Git also contains pre-existing Phase 4 changes; the entire working-tree diff is not a Phase 4.1-only diff.

## Validation

Verified before the final browser pass:

- PostgreSQL verification: correct credentials connect to `pmc_app / pmc_cms / 5433`; an incorrect password is rejected.
- TypeScript: passes, including regenerated Payload types.
- Existing public/Gmail/unit regressions: **36/36 pass**.
- Existing CMS API suite: **20/20 pass**, covering roles, granular overrides, own drafts, publish restrictions, unauthorized writes, strong passwords, lockout, deactivation, last-super-admin protection, audit access, all managed CRUD and byte-validated uploads.
- Password recovery regression: passes on a disposable account, including invalid/reused/expired tokens and old-password rejection; no email sent.
- Production session tests: pass for 2-hour / 30-day policies, matching database expiry, HttpOnly/Secure/SameSite cookies, refresh deadlines, no response token/private metadata, logout, deactivation, custom-endpoint lockout, and viewer dashboard/navigation privacy.
- Public browser regression: all ten checked routes return 200, header/footer/navigation render, gallery opens/closes, Facebook share URL remains correct, no JavaScript exceptions.
- Exact data verification: all saved source content matches the private snapshot; all five Georgian About paragraphs retain exact words/order, historical versions and Georgian fallback pass, legacy rows remain, repeat migration is harmless inside a rolled-back test transaction, protected public/Gmail/environment hashes match.
- Retained source records: News 3, Projects 5, Media 8, Slides 4, Counters 4, Testimonials 2, Categories 4. **Imported this phase: 0.**

Final production build and browser acceptance **pass**:

- `npm run build`: optimized production build succeeds, including TypeScript and all 21 generated static pages.
- Branded login, official logo, username authentication, password visibility, busy/disabled submit and a real Chrome restart with remembered authentication pass.
- Live dashboard count matches the API; navy navigation and icons render correctly.
- About opens in one continuous editor; an unchanged-content save succeeds without losing the legacy paragraphs.
- Bold/italic/underline, H2, ordered/unordered lists and hyperlinks persist after Save Draft/reopen. Clear-formatting, undo and redo buttons work.
- Existing-media insertion and a real new PNG upload through the native drawer render visible inline images and survive save/reopen. Temporary uploads are deleted after testing.
- Safe video preview URL and persisted block pass; gallery insertion, two-image preview, reordering, removal and reopening pass.
- Login, dashboard, Media and Projects lists, About, complete rich editor with images/video/gallery, native media picker, success toast and delete confirmation are checked at **320, 375, 390, 440, 768, 1024 and 1440px** without horizontal page overflow.
- Confirmed create/update/delete use the native Georgian success feedback; invalid URL validation produces a persistent dismissible error with no false success; cancelling deletion preserves the document. Reduced-motion toast animation is disabled.
- Every collection/global admin screen loads; no admin JavaScript exceptions are detected.

Reproducible tests (run API/browser tests sequentially against a running local server; production tests used a temporary server on port 3100 with `CMS_SERVER_URL=http://localhost:3100`):

```sh
npm run typecheck
npm test
npm run build
npm run cms -- migrate:status
node --import tsx tests/cms-phase41-data.test.ts
CMS_TEST_URL=http://localhost:3100 node --import tsx tests/cms-phase41-sessions.test.ts
CMS_TEST_URL=http://localhost:3100 CMS_TEST_ORIGIN=http://localhost:3100 node tests/cms-api.test.mjs
node --import tsx tests/cms-recovery.test.ts
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase41-browser.test.mjs
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase41-upload.test.mjs
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase41-feedback.test.mjs
CMS_TEST_URL=http://localhost:3100 node tests/cms-phase41-public.test.mjs
```

For development HTTP only, the session test supports `CMS_TEST_SECURE=0`; final acceptance used the production Secure-cookie assertion. Browser tests require the installed local Google Chrome and read the existing private bootstrap credentials without printing them. Screenshots are retained in `.cms-backups/phase4-1/screenshots/`; verification logs are in `.cms-backups/phase4-1/verification/`. Test fixtures use disposable documents and users and are deleted after each test. Existing content is compared to the pre-migration snapshot. Audit entries and ordinary session/version metadata from real test operations are expected additions.

## Scope and limitations

Public frontend sources, routes, static content, images, Gmail source and existing `.env.local` values remain protected by checksum comparison. Public pages continue using their original data sources. PostgreSQL 13 was not touched.

External video-player requests are isolated in automated browser tests: safe embed URL, preview structure and save/reopen are verified; live third-party playback is not claimed. Uploaded video storage limits are unchanged; this phase provides safe URL-based rich-text video blocks. SMTP password-delivery configuration is unchanged. Some native advanced UI/help text uses English fallback because upstream Payload has no Georgian pack.
