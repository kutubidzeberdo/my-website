# PMC media upload repair — 2 November 2026

## Root causes and changes

1. **Media Library bulk uploads:** the installed Payload 3.92.0 already has a native multi-file drawer, sequential per-file requests, file manager, progress and result messages. Its generated forms include virtual bilingual title fields. Requests use the current locale, while the project's generic bilingual hook rejected any aliases outside `locale=all`. The previous extra uploader did not repair the native controls. The extra list control is removed; the existing native Media Library uploader remains enabled.
2. **Gallery uploads:** installed `UploadInput` and `Dropzone` explicitly reduce a FileList to its first file when `hasMany` is false. Gallery rows correctly store a single Media relationship, so simply changing their stored schema would be wrong. A scoped `GalleryImage` extension now renders the native UploadInput at the same field position. Empty slots use its multi-file behavior and native batch drawer. Successful IDs fill the empty slot and append additional single-image rows. Existing rows, IDs, captions and order remain; duplicate returned IDs are ignored. Filled rows return to single-image display. The batch provider and completion callback remain mounted so remaining failed files can be retried after the first success. Featured images are unchanged. The shared field also covers Lexical gallery blocks.
3. **`locale=all` errors:** only Media's scalar-locale requests normalize virtual bilingual metadata back to the requested locale's scalar values. Other locales are not written. Explicit all-locale editing remains unchanged, as do the strict rules for Projects, News and other content. Empty titles still derive from the original Unicode filename before randomized storage naming.
4. **Size error:** `payload.config.ts` imposed a 10 MiB parser limit; Media's upload hook independently rejected sizes over 10 MiB. The installed parser also has 20 MiB per-file and 50 MiB request defaults, so merely deleting configuration would not remove byte caps. Configuration now explicitly disables those byte ceilings and uses native temporary-file streaming. The duplicate Media byte-size check is removed. Sharp validates the server-generated temporary path when present instead of an empty memory buffer. Existing MIME/content validation, authorization, image sizes and the 40-megapixel decoded-image safeguard remain.
5. **Memory/storage:** multipart input streams to temporary disk with parser backpressure. Native Payload operations clean temporary originals on success/failure. The existing S3 adapter supports file streams and multipart transfers; its paths and credentials are unchanged. Each file still uses its own request. Image decoding, derivatives and animated-image processing still consume memory; this patch does not promise unlimited file acceptance.
6. **Partial success:** native HTTP validation failures remain individual failed forms; successfully created Media records remain saved. Gallery attachment processes only successful returned IDs and checks current relationships before appending. Retrying failed forms does not reattach completed IDs. Native uploader transport failures and production proxy-generated responses were not authenticated end-to-end tested; do not infer those tests from the isolated browser fixture.
7. **Extra controls:** `MediaBatchImages` and the custom BatchImages picker/drop area are removed. No new button, file input, dropzone or bulk page is introduced in production code. Gallery fields use Payload's native Create new, Choose existing and Dropzone controls.
8. **Footer:** only `rights` now reads the existing `content[language].rights` translations. Georgian is exactly `ყველა უფლება დაცულია`; English is `All rights reserved.`. Copyright markup, year, spacing and styling are unchanged. Stored CMS translations are not edited.

## Remaining limits

No application byte-size ceiling remains for media uploads. Existing MIME/format checks, 40-megapixel validation, multipart field/file-count defaults and Payload's 60-second idle upload timeout remain. These native batches submit one image per request, so the multipart file-count limit does not cap the number of selected images.

DigitalOcean documents a **4 GiB total ephemeral local filesystem** and **600-second upload timeout** for App Platform. Temporary originals share that disk with the application; available space can be lower. Container memory/CPU, image decoding, edge/proxy restrictions and Spaces limits still apply. The actual application's resource allocation, Cloudflare/proxy settings and runtime behavior could not be inspected without authorized deployment access. These are not claims that every arbitrarily large photograph will succeed.

Sources: [App Platform limits](https://docs.digitalocean.com/products/app-platform/details/limits/), [large upload troubleshooting](https://docs.digitalocean.com/support/why-are-large-files-failing-to-upload-to-my-app-on-app-platform/), [Spaces limits](https://docs.digitalocean.com/products/spaces/details/limits/). The installed `@payloadcms/storage-s3` adapter uses file streams and SDK multipart transfers for temporary originals.

## Read-only investigation: requested homepage text

`აჭარის ინფრასტრუქტურული პროექტები — ერთ სივრცეში.` is the initial Georgian value of **`content.ka.footerText` in `src/data/content.ts`**, seeded by `scripts/cms/import.ts` into **Site Settings → `copy.footerText`**. It is rendered by **`Footer` in `src/components/Footer.tsx`**, which also appears on the homepage. It is not a hero-slider field.

The live application reads the CMS field through `getPublicShell` in `src/lib/cms-public.ts`; it does not substitute the static seed for that value. `src/cms/globals.ts` defines it as a localized textarea.

Exact Georgian admin path: **კომპანია → საიტის პარამეტრები → საიტის ტექსტები → ქვედა ნაწილის ტექსტი**, route `/admin/globals/site-settings`, field **`copy.footerText`** (virtual editor field `copy.bilingual_footerText`). Georgian and English use separate localized values, edited under the Georgian/English content tabs. Missing English uses the existing Georgian fallback. The public renderer, field definition, seed string and stored value for this text were not changed. Only the unrelated requested rights translation changed in `src/data/content.ts`.

## Validation

- `npm run typecheck`: passed.
- `npm test`: 66 passed, including both rendered footer languages and existing mocked contact/Facebook regressions.
- `node --import tsx --test tests/cms-upload-repair.test.ts tests/cms-admin-title.test.ts tests/cms-requested-schema.test.ts`: 18 passed. Covers Media locale normalization, unchanged content guards, gallery ordering/deduplication/retry mapping, existing title/progress regressions and original-filename defaults.
- The upload repair tests use Payload's **actual multipart parser**, a streamed original over **51 MiB**, disk-size/buffer assertions, the real image validation hook and native temporary-file cleanup. These perform no database writes or cloud uploads.
- The exact reported names `201138754_1439484456418731_160240318526518761_n.jpg`, `DJI_0021.jpg`, `stad.jpg`, and a Georgian filename pass the Media hook chain using Georgian-only native form aliases and synthetic valid JPEG bytes. They are not the user's original image bytes.
- `node --import tsx --test tests/cms-spaces-schema.test.ts`: 3 passed; validates installed local/S3 schema construction, legacy proxy URLs and storage key compatibility without a database connection.
- `node tests/cms-requested-upload.browser.mjs`: passed in Chrome. Uses Payload's real native Dropzone with **mocked form context, UploadInput fixture and upload responses**. Verifies chooser/drop processing, mapping, partial success retention and the single-relationship transition. It is not a real authenticated CMS/S3 upload test.
- `npm run build`: passed.
- `git diff --check`: passed.

Authenticated CMS/browser and Spaces upload tests remain **unverified**. No credentials from backup files were read. No production test content was created/deleted. No production database or existing media was modified. No migration is needed or was executed. The pre-existing uncommitted `next-env.d.ts` is excluded from this commit.

## Git and deployment

Fetched `origin/main` safely before committing; it matched local base `ba1edb752c709cee5f0e00f295232b86bfdd54a8`. Commit/push results and the exact resulting hash are reported in the final task response.

DigitalOcean publishing remains pending. No `doctl`, CLI configuration, relevant environment credentials or authorized deployment integration was found; plugin discovery returned no DigitalOcean integration. Existing automatic deployment settings, deployments and logs cannot be inspected. A GitHub push alone is not confirmation of production deployment.

Minimal remaining action: open **App Platform → `king-prawn-app`** (`f2d597d6-1c33-4535-b7bd-75bf43e87860`), check whether the pushed commit has auto-deployed, and otherwise deploy that exact commit from the existing `main` source. Wait for a successful deployment, verify its commit and logs, then check public Georgian/English pages, both footer translations, `/admin` and approved authenticated Media/gallery uploads. Do not run migrations or change secrets, DNS, domains or infrastructure for this patch.

## Modified files

- `docs/2026-11-02-upload-repair.md`
- `payload.config.ts`
- `src/app/(payload)/admin/importMap.js`
- `src/cms/admin/BatchImages.tsx`
- `src/cms/bilingual.ts`
- `src/cms/collections.ts`
- `src/cms/fields.ts`
- `src/cms/gallery-upload.ts`
- `src/cms/upload-options.ts`
- `src/components/Footer.tsx`
- `src/data/content.ts` (rights text only)
- `tests/cms-requested-upload.browser.mjs`
- `tests/cms-upload-repair.test.ts`
- `tests/privacy-page.test.cjs`
