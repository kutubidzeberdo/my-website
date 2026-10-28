# DigitalOcean production deployment readiness audit

Audit date: 28 October 2026. Project: `~/Documents/MyWebsite`.

**Overall: BLOCKER — do not deploy the unchanged configuration yet.** The production application is built and locally operational, but Spaces-enabled schema compatibility, production infrastructure configuration and migration rehearsal remain incomplete.

Status meanings: **READY** = supported by inspected evidence; **ACTION REQUIRED** = preparation or a decision remains; **BLOCKER** = prevents the stated production outcome; **NOT VERIFIED** = no live test/evidence establishes it.

## 1. Current project status

| Finding | Status | Verified evidence |
|---|---|---|
| Branch and repository | READY | Branch `main`; origin is `https://github.com/kutubidzeberdo/my-website.git`. |
| Latest commit | READY | Local HEAD and GitHub `main` both resolve to `512614c7378584ee105f72ece5613de1eae6c203`, “Implement Payload image optimization and preserve frontend layouts.” Remote checked through the GitHub connector. |
| Working tree before audit | ACTION REQUIRED | Only `next-env.d.ts` was modified: generated references point to `.next/types` rather than committed `.next/dev/types`. This pre-existing change was left untouched. Review it before preparing a release commit. |
| Secret/upload exclusions | READY | `.env.local`, `.cms-backups/`, `media/`, `.next/` and `node_modules/` are ignored and absent from the tracked-file checks. `.env.example` and `package-lock.json` are tracked. |
| Full repository-history secret/security scan | NOT VERIFIED | This audit did not certify every historical Git object or run a current vulnerability-database audit. |
| DigitalOcean account/resources/DNS | NOT VERIFIED | No DigitalOcean account, app, database, bucket, GitHub installation permission, domain or certificate was inspected or created. Local absence of cloud credentials does not establish whether resources already exist elsewhere. |
| Older deployment notes | ACTION REQUIRED | `docs/DIGITALOCEAN_DEPLOYMENT.md` contains obsolete statements about static public content and an older PostgreSQL setup. Current public pages read Payload; the actual database is PostgreSQL 17.11. Use this audit for planning. |

## 2. Runtime and production build readiness

| Component | Status | Current evidence |
|---|---|---|
| Node.js | READY | Installed `24.22.1`; Payload 3.92.0 requires `^22.23.4 || >=24.22.1`. |
| Node engine selection | ACTION REQUIRED | `package.json` has no `engines` pin. Select the tested `24.22.1` runtime for the production build/service/job rather than relying on a platform default. |
| Next.js / React | READY | Lockfile and installed packages: Next `16.4.3`, React/React DOM `19.3.1`. These satisfy the installed Payload/Next peer ranges. |
| Payload packages | READY | Core, PostgreSQL, Next, Lexical and S3 packages are consistently `3.92.0`; Sharp is `0.35.5`. |
| Production commands | READY | Build: `npm run build` → `next build --webpack`. Run: `npm run start` → `next start --hostname 0.0.0.0`. Next supports the platform-provided `PORT`. Do not use `npm run dev`. |
| Existing build/start | READY | `.next/BUILD_ID`, required-server-files, route/prerender manifests exist; build ID `rbDKp5746MIsGXhYmRdxo`, dated 18:08:12 Tbilisi time. No tracked source file was newer than that build. A Node listener exists on port 3000; the user reports successful production start. |
| Fresh type check | READY | Executed `node_modules/.bin/tsc --noEmit --incremental false`; passed without generating files. |
| Fresh production build/start/browser tests | NOT VERIFIED | Not rerun here: a build writes `.next`, generated types and possibly `next-env.d.ts`; runtime requests can write caches. That would violate the only-report-write rule. Phase 4.7 records prior build, 46 tests and browser success, not a new cloud validation. |
| Linux/App Platform build | NOT VERIFIED | No clean Linux buildpack build or production resource sizing test was performed. Install from the lockfile on Linux; do not ship the Mac `node_modules` or `.next` directory. |

**READY — App Platform compatibility:** a Node **Web Service**, not a Static Site or Droplet, suits this repository. Use repository root, `main`, lockfile installation, the existing build/run commands, one initial web instance and a configured HTTP port such as 8080. Route the entire `/` namespace to the same service, retaining `/admin`, `/api` and `/_next` paths. No Dockerfile or app specification currently exists; neither is mandatory when configuring a Node buildpack service in the dashboard. App Platform supports Node/Next builds and normally prunes dev dependencies after building. [Node buildpack](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/nodejs/), [port configuration](https://docs.digitalocean.com/support/how-to-troubleshoot-apps-in-app-platform/).

**READY — migration-tool dependency correction:** `tsx` is listed in this project's dev dependencies, but Payload itself depends on `tsx@4.23.15` in production. The lockfile does not mark it dev-only. `@next/env` also survives through production dependencies. Therefore dev-dependency pruning is **not an established migration blocker** for this lockfile; verify the command in the actual release image.

### Does the production build access PostgreSQL?

- **READY — source fact:** importing `payload.config.ts` requires `DATABASE_URL` and `PAYLOAD_SECRET` to be present, including during build-time module evaluation.
- **READY — source fact:** public layout uses `force-dynamic`; CMS reads call `getPayload` and request cookies. Current prerender output contains only error pages/icons, not News, Projects or the homepage. No `generateStaticParams` database enumeration was found.
- **NOT VERIFIED — network behavior:** these facts support request-time content reads, but do not prove that every build path avoids connecting to PostgreSQL. No isolated build/network trace was run. Do not equate “configuration variable required” with “database queried.”
- **ACTION REQUIRED:** rehearse a production-shaped clean build without database network access. Supply required configuration at build time; do not assume runtime database bindings exist during build. If a build actually needs database queries, decouple that initialization or use an explicitly authorized trusted build environment. Do not broadly disable the database firewall. DigitalOcean documents build-time binding and trusted-source limitations. [Database bindings](https://docs.digitalocean.com/support/why-are-my-database-bind-variables-missing-from-my-app/), [database networking](https://docs.digitalocean.com/products/app-platform/how-to/manage-databases/).

## 3. Database and migration readiness

**READY — actual configuration:** `payload.config.ts` uses `postgresAdapter`, a `pg` pool with `DATABASE_URL`, `push:false`, `disableCreateDatabase:true`, and `src/cms/migrations`. It does not configure automatic `prodMigrations`. Neither normal build nor start commands explicitly run migrations.

**READY — read-only database inspection:** source is local PostgreSQL **17.11**, port **5433**, with TLS off on the loopback connection. The audit transaction reported read-only mode. Installed extension: `plpgsql` only. The application role is not a superuser and cannot create databases or roles.

| Existing data | Status | Count |
|---|---|---:|
| Users | READY | 2 |
| News | READY | 3 |
| Projects | READY | 5 |
| Slides | READY | 4 |
| Testimonials | READY | 2 |
| Statistics | READY | 4 |
| Project categories | READY | 4 |
| Media documents | READY | 8 |
| About / Homepage / Site Settings | READY | 1 each |
| Current Site Settings history | READY | 20 revisions |

**READY — five versioned migrations exist and are recorded as applied:**

1. `20261027_081756_initial_cms`
2. `20261027_092030_admin_editor_and_session_policy`
3. `20261027_112506_phase42_live_content`
4. `20261028_083709_phase43_optional_english`
5. `20261028_131818_phase47_card_images`

**ACTION REQUIRED — correct first migration strategy:** restore a complete fresh dump into an **empty target application database**, including all content, localized/child tables, versions, users, permission rows, sequences and `payload_migrations`. Preserve passwords/hashes rather than recreating users. Map database ownership/grants to Managed PostgreSQL roles using an appropriately reviewed restore such as `pg_restore --no-owner --no-acl`; this is distinct from preserving the CMS permission data. Do not first migrate-create the same tables and then restore an entire schema over them. A dump plus an editing freeze suits this small local source. [DigitalOcean database migration](https://docs.digitalocean.com/products/databases/postgresql/how-to/migrate/).

**ACTION REQUIRED — release migration execution:** after restoring the five-migration state, run only reviewed pending forward migrations, once, using `NODE_ENV=production` and `npm run cms -- migrate` in a serialized pre-deploy job or controlled release runner. Keep the migration source files in that image. Do not run seeds, `cms:import`, bootstrap, reset/fresh/down migrations, or the previously declined Settings-history restoration. Migration commands were not executed during this audit. [Payload migration workflow](https://payloadcms.com/docs/database/migrations), [App Platform deployment jobs](https://docs.digitalocean.com/products/app-platform/how-to/manage-jobs/).

**BLOCKER — production connection/restore is not ready:** no Managed PostgreSQL connection, restore rehearsal or target migration run was verified. Prefer Managed PostgreSQL major **17**, avoiding an unrelated major upgrade. DigitalOcean currently supports that major. [Supported PostgreSQL versions](https://docs.digitalocean.com/products/databases/postgresql/how-to/create/).

**ACTION REQUIRED — TLS and networking:** local non-TLS settings must not become production settings. Use certificate/hostname verification, appropriate CA trust and narrowly configured trusted sources for the app and release/restore runner. The present connection-string-only pool can accept explicit TLS URL parameters and a CA-file path; alternatively, a later reviewed change can load a CA into explicit pool SSL options. Do not use disabled certificate verification. Do not mix URL SSL parameters and a separate SSL object casually: node-postgres warns that URL options can replace that object. Budget connections across replicas and migration jobs. [Managed PostgreSQL TLS](https://docs.digitalocean.com/products/databases/postgresql/how-to/connect/), [node-postgres SSL](https://node-postgres.com/features/ssl).

## 4. Media and Spaces migration readiness

### Current storage and complete file inventory

**READY — verified source:** `src/cms/collections.ts` resolves `staticDir` to `/Users/Admin/Documents/MyWebsite/media`. That is a local development path, not a production disk requirement. There are **19 files, 3,816,393 bytes**: 8 originals, 7 admin thumbnails and 4 card derivatives. All were readable and SHA-256 hashed; no extra/orphan filenames were found in this directory.

Every non-dash filename below must be copied. Paths are relative to local `media/`; with the current no-prefix configuration, legacy Spaces object keys should be these exact basenames.

| Media ID | Original | Admin thumbnail | Card derivative |
|---:|---|---|---|
| 1 | `83028b1a-37ed-4a3d-9c92-03325f97bdca.jpg` | `83028b1a-37ed-4a3d-9c92-03325f97bdca-400x300.jpg` | `83028b1a-37ed-4a3d-9c92-03325f97bdca-card-960x640.webp` |
| 2 | `71d15315-0d8b-4c79-99c5-1fe5b31f4178.webp` | `71d15315-0d8b-4c79-99c5-1fe5b31f4178-400x300.webp` | — |
| 3 | `ec968850-4e38-4c05-99cb-89d02223c638.webp` | — | — |
| 4 | `cb6aab41-f20b-4d1e-9e73-b8873ad440a5.png` | `cb6aab41-f20b-4d1e-9e73-b8873ad440a5-400x300.png` | — |
| 5 | `5e73c1ef-8d81-4e84-a1f5-1d6000845bda.jpg` | `5e73c1ef-8d81-4e84-a1f5-1d6000845bda-400x300.jpg` | `5e73c1ef-8d81-4e84-a1f5-1d6000845bda-card-960x636.webp` |
| 6 | `9f0c0123-a40a-42d7-86ef-6649007971f2.jpg` | `9f0c0123-a40a-42d7-86ef-6649007971f2-400x300.jpg` | `9f0c0123-a40a-42d7-86ef-6649007971f2-card-960x640.webp` |
| 7 | `c6af93b8-68c9-4f39-85ca-3cd0151f77b6.jpg` | `c6af93b8-68c9-4f39-85ca-3cd0151f77b6-400x300.jpg` | `c6af93b8-68c9-4f39-85ca-3cd0151f77b6-card-960x640.webp` |
| 8 | `0db7193c-c6c3-4251-b536-3249e7e5983b.jpg` | `0db7193c-c6c3-4251-b536-3249e7e5983b-400x300.jpg` | — |

**READY — repository assets:** Git separately tracks eight `public/images/` files: `arena.jpg`, `company-logo-full.webp`, `company-logo-symbol.webp`, `company-logo.png`, `construction.jpg`, `infrastructure.jpg`, `mountains.jpg`, `testimonial-portrait.jpg`; also `src/app/apple-icon.png` and `src/app/icon.png`. These travel through Git/build and must remain present; they do not replace the 19 CMS objects. Google Fonts is an existing external browser dependency in `globals.css`; retain it for appearance parity.

**READY — relationships:** direct News, Project, Slide, testimonial and gallery references checked have no missing Media IDs. News featured IDs are 6/5/7; Projects 1/7/6/5/1; Slides 1/7/6/5; both testimonial portraits use ID 8. Five Project gallery rows and zero standalone News gallery rows exist. Current persisted News/Project Lexical documents contained no upload nodes; insertion functionality is documented as previously tested, not re-exercised here.

### Integration and the concrete schema blocker

**READY — adapter exists:** `@payloadcms/storage-s3@3.92.0` is installed and conditionally enabled in `payload.config.ts` when `S3_BUCKET` is present. Current local environment does not enable it. Inspection of the installed adapter and an in-memory, dummy-credential configuration confirmed S3 mode sets `disableLocalStorage:true`. No bucket request or Payload/database initialization was made by that configuration check.

**BLOCKER — S3 changes the stored schema:** the installed cloud-storage plugin adds a hidden stored text field named `_objectKey`. The installed PostgreSQL adapter maps it to **`media._objectkey`**. This column is absent from the local database and all five existing migration snapshots. Merely setting S3 variables and restoring today's database is insufficient; subsequent Media reads can reference the missing column. Generate/review a minimal additive migration under the actual S3-enabled configuration in a later authorized implementation step, then apply it before serving production traffic. Preserve existing rows and leave legacy object-key values null/empty. No migration was created here.

**BLOCKER — durable media must be transferred before cutover:** App Platform's filesystem is ephemeral and has no persistent volume support; Git also excludes `media/`. Do not rely on copying the folder into an application container. [App Platform storage limits](https://docs.digitalocean.com/products/app-platform/details/limits/).

**ACTION REQUIRED — preserve same-origin protected delivery:** keep a private Spaces bucket and the default Payload access-control proxy. Existing `/api/media/file/...` routes can remain unchanged while the server fetches objects from Spaces. The configured adapter does not disable Payload access control or request direct client uploads. Do not make private/draft assets public merely to simplify deployment. [Payload storage/access behavior](https://payloadcms.com/docs/upload/storage-adapters).

**ACTION REQUIRED — copy bytes, not documents:** transfer all 19 files directly to their expected object keys with correct MIME types. Do not upload them again through the CMS, regenerate originals/derivatives or create replacement Media records. Restore the database unchanged, then add only the storage schema migration. Current stored main/derivative URLs are relative; no localhost editor URLs were found in News/Projects/About content. No blanket content/URL rewrite is indicated. Verify each object's bytes/hash and metadata after transfer; an ETag is not universally a SHA-256 checksum.

**ACTION REQUIRED — endpoint/access setup:** use the selected regional Spaces API endpoint and a bucket-scoped read/write/delete key appropriate for the adapter. The SDK signs requests separately from endpoint-based region selection; follow the official JavaScript example, including its signing-region guidance, rather than assuming a DigitalOcean region slug must be the AWS signing region. The existing config supports endpoint/region/credentials without a new provider. New cloud uploads may acquire native `_objectKey` folders; old null-key records resolve to bare filenames. [Spaces SDK setup](https://docs.digitalocean.com/products/spaces/reference/aws-sdks/), [scoped access](https://docs.digitalocean.com/products/spaces/how-to/manage-access/).

**NOT VERIFIED — live Spaces behavior:** credentials, permissions, object presence, upload/delete, private reads and focal regeneration against Spaces have not been exercised. `phase47-backfill.ts` is a local-file maintenance tool, not a Spaces migration uploader; do not run it blindly in an ephemeral production container.

## 5. Image optimization and remote-image configuration

**READY — current implementation:** admin thumbnail is 400×300; card derivative is proportional width 960, WebP quality 85, no fixed-height crop. Small sources fall back to main images. `cms-public.ts` exposes separate main/card URLs, original dimensions and focal coordinates. `media-images.ts` applies focal `object-position` with centered fallback; native focal edits are forwarded by the Media Save action. Listing/homepage containers retain Cover; detail featured images use main URLs and Contain; Lightbox retains main photographs and Contain. No design changes are needed for migration.

**READY — preferred Spaces path needs no remote host allowance:** `next.config.mjs` permits local card-version query strings and other query-free local paths; it has no remote-image allowlist. That is compatible with the recommended same-origin Payload proxy. Do not add wildcard `remotePatterns` unnecessarily. If a later decision changes cards/Hero to direct Spaces/CDN URLs, narrowly configure that exact HTTPS host/path and query policy and retest every Next Image consumer. Gallery components' absolute-URL behavior alone does not establish card/Hero support.

**ACTION REQUIRED — cache/platform verification:** Next's image cache may remain ephemeral because originals/derivatives are durable in Spaces. Size the service for Sharp and simultaneous uploads/optimization. Verify cache-versioned card reads, protected assets and `/_next/image` after a deployment replacement. Review DigitalOcean's documented Next.js cache-poisoning caveat and actual cache headers without globally rewriting immutable asset caching. [Next self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [DigitalOcean known issue](https://docs.digitalocean.com/products/app-platform/details/limits/).

## 6. Authentication and security readiness

**READY — inspected controls:** `src/cms/users.ts`, `session-policy.ts` and access hooks implement username login, active-user enforcement, role/section permissions, server-side sessions, login lockout, last-super-admin protection and restricted public registration. Cookies are Secure in production, HTTP-only through Payload's cookie generator and SameSite Lax. No hard-coded cookie domain is configured, supporting same-domain website/admin operation.

**ACTION REQUIRED — production origin:** set `CMS_SERVER_URL` and `NEXT_PUBLIC_SITE_URL` consistently to the same canonical HTTPS origin. Payload uses the former first; metadata uses the latter first. CORS/CSRF allow the selected server origin only, and custom login/refresh endpoints require a matching Origin. Redirect alternate domains or configure a separately reviewed staging environment; do not use permissive wildcard CORS. Verify forwarded HTTPS/Host behavior, including the contact form's comparison against `request.nextUrl.origin`.

**ACTION REQUIRED — preserve identity securely:** transfer the existing database users/roles/password hashes and `PAYLOAD_SECRET` through encrypted channels. Do not copy the ignored initial-admin JSON into the app image or reset accounts. A new domain does not transfer browser cookies automatically; users should expect to log in again. Keep a consistent secret across replicas. Do not publish secret values in Git, build logs or this report.

**NOT VERIFIED — live production controls:** HTTPS/domain issuance, proxy behavior, real role tests, recovery email, current dependency advisories and production penetration testing were not verified. For multiple build artifacts/rolling replicas, review Next server-action key/version consistency; `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` is an optional framework deployment setting, not a currently required project-specific variable. [Next multi-server guidance](https://nextjs.org/docs/app/guides/self-hosting).

## 7. Gmail/contact and CMS recovery email readiness

**BLOCKER for working contact delivery — missing local configuration:** only `DATABASE_URL` and `PAYLOAD_SECRET` are populated locally. Gmail OAuth/contact variables are absent; the source's configured check would therefore be false. This does not prevent the website from starting, but successful contact sending is not production-ready.

**READY — implementation:** `src/lib/gmail.ts` refreshes an access token server-side and uses Gmail `users.messages.send`; tokens are not sent to browser JavaScript. Both contact-address variables must match the organization address defined in `src/data/contact.ts`. The local owner helper uses desktop/loopback OAuth; there is no production visitor OAuth callback route to register for this implementation.

**ACTION REQUIRED — account-owner authorization:** enable the Gmail API, obtain an appropriate owner-authorized token and configure the exact names below securely. Verify consent-screen production status, scope and token lifetime. External OAuth apps left in Testing generally receive seven-day refresh tokens for Gmail scope, unsuitable for an unattended permanent deployment. No account authorization, token refresh or email was attempted. [Google token rules](https://developers.google.com/identity/protocols/oauth2#expiration).

**ACTION REQUIRED — public abuse/duplicate policy:** `src/app/api/contact/route.ts` keeps rate limits and idempotency in process-local Maps. With proxy trust disabled, clients share a five-attempt/ten-minute bucket; restarts reset it, and multiple/rolling processes do not share duplicate protection. Set `CONTACT_TRUST_PROXY` only after verifying the ingress overwrites the trusted client-IP header. Before scaling contact delivery, implement shared protection or an approved ingress policy. Do not infer reliable global idempotency from a single instance.

**ACTION REQUIRED — separate CMS recovery decision:** Gmail OAuth does not power Payload password reset. SMTP is independently configured in `payload.config.ts`; without it, the custom user hook returns 503 for ordinary recovery requests. Configure/verify SMTP if recovery is required for launch, or explicitly accept its current disabled behavior. Never put a Gmail login password into the OAuth variables.

## 8. Exact environment variable names

**ACTION REQUIRED — deployment configuration:** names below come from actual project/framework usage. No secret values are included. Check the service and release job separately; local presence does not certify DigitalOcean values.

| Names | Purpose / recommended scope |
|---|---|
| `NODE_ENV` | Production mode for build, web service and migration job. |
| `PORT` | Runtime listener port; normally supplied by App Platform to match its HTTP port. |
| `DATABASE_URL` | Required by config import at build and by runtime/migrations; encrypted; target connection must have verified TLS. Build-time bindings need separate planning. |
| `PAYLOAD_SECRET` | Required at build/runtime/migrations; encrypted; keep stable across the restored installation. |
| `CMS_SERVER_URL`, `NEXT_PUBLIC_SITE_URL` | Matching canonical HTTPS origin; available at build and runtime. The latter is public, not a place for secrets. |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` | Spaces configuration; maintain the same S3-enabled shape at build, runtime and migration time. |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Encrypted server-side Spaces credentials. Supply where the S3-enabled service/job requires them; do not log them or bake them into public assets. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Runtime Gmail OAuth settings; securely manage all credentials, particularly the secret/token. |
| `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Runtime contact configuration; must match the source's organization address. |
| `CONTACT_TRUST_PROXY` | Runtime policy flag; enable only after verifying trusted-header handling. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_ADDRESS` | Runtime CMS recovery email settings, if that feature is required; password/credentials encrypted. |

**ACTION REQUIRED — conditional CA handling:** the current app has no `DATABASE_CA_CERT` reader. If using a custom CA, either arrange a runtime CA file referenced by the connection settings, or authorize an explicit CA-loading code change. A newly named CA variable would be a proposed deployment addition, not an already implemented feature. DigitalOcean documents using environment contents to materialize certificate files in a later deployment command. [Certificate handling](https://docs.digitalocean.com/support/can-i-inject-certificates-or-other-files-into-my-app-at-build-time/).

**READY — scope distinction:** `NEXT_PUBLIC_*` values are build-inlined/public. Do not place database, S3 or OAuth secrets there. A release job must receive its own applicable secrets; web-service configuration alone does not prove job configuration. [Next environment variables](https://nextjs.org/docs/app/guides/environment-variables).

## 9. Health checks and remaining deployment gates

| Finding | Status | Exact next action |
|---|---|---|
| Dedicated readiness/liveness endpoint | ACTION REQUIRED | None exists. TCP checks can establish that the process listens. An HTTP check on `/` exercises current CMS/database rendering but is heavier; a later minimal no-store readiness endpoint with a short DB check is preferable. |
| Contact availability endpoint as readiness | ACTION REQUIRED | `/api/contact` GET can return 200 with availability false and does not prove database/Spaces readiness; do not treat it as full health. |
| Probe setup | ACTION REQUIRED | Match configured service port; use suitable startup grace, e.g. 30 seconds, and realistic timeout/thresholds. Keep liveness from repeatedly restarting the app solely because an external database is temporarily unavailable. Verify probes on the deployed service. |
| Release/restore rehearsal | BLOCKER | Prove full database restore, S3 schema migration, all 19 objects and private/proxied media behavior before public cutover. |
| Appearance/functionality parity | NOT VERIFIED on target | Local Phase 4.7 evidence exists; cloud screenshots, font loading, responsive geometry, auth and full workflows still require staging validation. |
| Backup/rollback operations | ACTION REQUIRED | Schedule database backups, private media backup/versioning and restore tests. Keep the old local installation intact and retain a schema-compatible prior release. Avoid writes to two divergent databases during rollback. |

Health-check behavior and supported parameters are documented by [DigitalOcean health checks](https://docs.digitalocean.com/products/app-platform/how-to/manage-health-checks/).

## 10. Necessary code/configuration work — not implemented

1. **BLOCKER:** create/review the S3-enabled additive storage migration for `_objectKey`/`_objectkey`; no content or relationship rewrite is required for the recommended proxy design.
2. **ACTION REQUIRED:** pin the tested Node engine or equivalent explicit build/runtime selection.
3. **ACTION REQUIRED:** define the production Web Service, environment scopes, HTTPS origin, database trust/TLS, Spaces bucket policy/key, release job and probes. Dashboard configuration can supply these; an app-spec file is optional.
4. **ACTION REQUIRED, conditional:** add explicit CA loading only if the selected TLS arrangement cannot be supplied through current connection settings; add shared contact protection for multiple processes; add a dedicated health endpoint if desired.
5. **READY — no required redesign:** keep current local API media URLs, IDs, derivatives, Cover/Contain rules, bilingual forms, login UI, navigation and Lightbox. No direct-Spaces URL conversion or remote-image wildcard is needed.

## 11. Ordered production migration checklist

All steps below are **ACTION REQUIRED — future authorized work only; none was deployed by this audit**.

1. Resolve the S3 schema blocker and review a release commit containing only approved deployment support. Preserve the current appearance and data; retain a known-good source revision and the audit evidence.
2. Select the tested Node version and verify a clean Linux lockfile install/build, with production-shaped configuration. Reconfirm whether the build needs database network access; do not weaken trusted sources as a shortcut.
3. With owner approval, select or provision the App Platform **Web Service**, Managed PostgreSQL 17 and a private Spaces bucket. Grant DigitalOcean access to only the intended GitHub repository. Do not choose a Droplet, dev database or Static Site for this app.
4. Configure least-privilege database/runtime/migration access, verified TLS/CA trust and trusted sources for the app and controlled restore/release runner. Plan connection limits.
5. Configure Spaces credentials and regional API endpoint. Keep default Payload access checks and server-side uploads; establish the legacy flat-key layout before copying files.
6. Populate encrypted/core/environment settings for the service and job, with matching canonical HTTPS URLs and production mode. Ensure build-time config requirements are satisfied independently of runtime-only bindings.
7. Freeze local CMS editing for the final snapshot. Make a fresh complete PostgreSQL dump and media backup with checksums; verify archive readability. Do not use a stale earlier-phase backup as the final source.
8. Restore the complete database into an empty target application database with suitable ownership/grant mapping. Preserve user hashes, permissions, sessions, locales, IDs, versions, sequences and the migration ledger. Do not seed/import/bootstrap.
9. Verify the restored five-migration state, then execute only reviewed pending forward migrations, including S3 storage schema, in a controlled release step before serving traffic. Rehearse this order in staging.
10. Copy all 19 CMS files directly to Spaces under exact expected object keys, preserving bytes and MIME types. Do not create new Media documents or regenerate derivatives to migrate them.
11. Compare object sizes/checksums and database counts/IDs/relationships. Keep the small image's absent thumbnail and missing card variants valid; do not fabricate them. Preserve the current 20 Settings revisions and leave the declined older-history restoration alone.
12. Configure the Web Service to build with `npm run build` and run with `npm run start`, listening on the platform HTTP port. Route all paths to it unchanged and configure startup/readiness/liveness probes. Keep migrations out of per-request handlers.
13. Validate staging website/admin on the same HTTPS origin: login/logout/Remember Me, permissions, drafts, one Publish action, bilingual editing, fallback, slugs, News/Projects, Slides and all logo/portrait fields.
14. Validate real staging media uploads, existing-image selection, Lexical insertion, gallery order, focal saves and regenerated thumbnails. Verify original bytes, card-version URLs and `/_next/image`; ensure anonymous users cannot fetch draft-only/private assets.
15. Compare homepage, News/Project Grid/List and detail/Lightbox screenshots at 320, 375, 390, 768, 1024 and 1440px. Check fonts, Hero animations and approved geometry; adjust no design merely to suit hosting.
16. Have the account owner finish production Gmail authorization/token setup if contact delivery is required. Verify trusted-proxy/rate-limit policy and one explicitly approved email end to end; separately test SMTP recovery if enabled.
17. Replace/redeploy a staging container and confirm media remains available from Spaces. Verify database reconnects, cache behavior, probes and the absence of local-disk persistence assumptions.
18. After all gates pass, authorize production deployment/DNS cutover, issue/verify HTTPS and redirect alternate origins to the canonical domain. Ensure there has been no source write after the final snapshot; otherwise repeat a controlled final synchronization.
19. Run production smoke tests and count/hash/relationship checks; monitor authentication, image requests, database connections, storage operations and contact failures. Enable backup/retention and alerts with an assigned operator.
20. Reopen editing only on the accepted production installation. Keep the old environment read-only for rollback; reconcile any post-cutover writes before reverting databases. Remove temporary broad access and retain documented recovery procedures.

## 12. Audit safety and limits

**READY — audit boundaries respected:** repository/config/dependency inspection, GitHub read access, official-documentation checks, local file reads/hashing, an in-memory S3-config comparison and read-only PostgreSQL transactions were used. Only `docs/digitalocean-production-readiness.md` was written. No source/environment/database record was changed; no install, build, migration, upload, email, Git push, deployment or paid-resource creation was performed.

**NOT VERIFIED:** actual DigitalOcean infrastructure, Linux release image, a DB-disconnected clean build, production TLS/DNS/proxy headers, live Spaces/Gmail/SMTP operations and target visual/functionality parity remain release gates. This report is a readiness audit, not approval to deploy.
