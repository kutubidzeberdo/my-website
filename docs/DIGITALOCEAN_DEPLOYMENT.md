# DigitalOcean preparation — no deployment

No resources, billing, deployment or GitHub push performed. This integration was validated locally only. Public pages still use static content, by current scope; a separate authorized phase must connect safe published-only CMS reads and revalidation before public CMS updates become visible.

Use an App Platform Web Service with the existing `npm run build` / `npm start` scripts and assigned PORT, listening on 0.0.0.0. Keep the lockfile; review the exact runtime Node requirement of the pinned Payload release. Database startup must not run schema push. Run reviewed versioned forward migrations once in a release job with a migration role, before serving traffic.

Set encrypted runtime/build variables as required: DATABASE_URL, PAYLOAD_SECRET, the existing Gmail OAuth settings, SMTP settings and S3 settings from .env.example. NEXT_PUBLIC_SITE_URL/CMS_SERVER_URL must match the HTTPS canonical origin; only public URLs belong in NEXT_PUBLIC variables. Never copy local example credentials to production. Production cookies are Secure, HTTP-only and SameSite=Lax; verify trusted origins, domain and HTTPS before login tests.

Managed PostgreSQL needs verified TLS, backups and least privilege. Separate runtime and migration roles where practical. No paid database was created. PostgreSQL 13 on the development Mac has no role in deployment and must remain untouched.

Production uploads require the official @payloadcms/storage-s3 adapter. Configure a DigitalOcean Spaces bucket, region, endpoint and least-privilege access credentials. Choose bucket delivery/access behavior explicitly and verify actual URLs. Do not rely on App Platform local disk persistence. Move the local CMS media directory/files into Spaces and verify record paths, thumbnails, alt text and gallery order before production. The S3 path is configured but has not been tested against a live bucket.

Before migration take encrypted custom-format pg_dump and media backups with retention, and rehearse a restore into a separate environment. Keep the old application release and source/content backups; do not reset/drop production data to roll back code. Check schema compatibility before application rollback. Exact forward command is `npm run cms -- migrate` (review migrations first).

GitHub changes remain local until permission to push. Domain work requires DNS verification, HTTPS, canonical metadata and Facebook sharing checks. Repeat role/auth/upload/draft tests in staging and test recovery email. Audit the five remaining moderate migration-tooling dependency advisories before release. No production penetration test, live SMTP/S3 test or restoration rehearsal is claimed.

No prices are quoted: consult current DigitalOcean pricing before purchase, accounting for compute, managed database, Spaces, transfer, backups and staging. No paid service is needed for current local development.
