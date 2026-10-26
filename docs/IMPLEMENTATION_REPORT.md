# News, projects, sharing and Gmail implementation report

## Completed

- `/news`: responsive two-column Grid and one-column List views; normal links to all three existing sample articles.
- `/news/[slug]`: title/date/photo/full existing sample body, related news, Back link and Facebook sharing. Optional gallery and validated YouTube embed support.
- `/projects`: same reusable Grid/List design, four statuses, category filtering and clear combined-filter empty states.
- `/projects/ongoing`: the two existing ongoing records, with current sample progress values and bars.
- `/projects/[slug]`: one shared detail structure for all five existing projects, related links and illustrative galleries using existing local images. Optional location, timeline, budget, client, contractor, investment, area, video and before/after fields render only when supplied. No official financial, contractor, location or deadline data was invented.
- All internal previews now navigate in the same tab. No news/project/contact dialogs remain. Existing homepage slider, photos, section order, logo and footer styling are preserved. KA/EN selection is retained; visible content is Georgian in both modes pending translations.
- Dynamic detail metadata includes record-specific title/description, canonical, Open Graph and Twitter metadata, using NEXT_PUBLIC_SITE_URL for absolute URLs. Share links encode the individual detail URL.
- The contact endpoint now uses Gmail OAuth refresh + users.messages.send over HTTPS. From/To are fixed to the authorized organizational account; visitor email is Reply-To. UTF-8 MIME, folded encoded Subject, Base64 body and Base64URL Gmail payload are tested. No Resend/SMTP/Nodemailer sending remains.
- Server validation, honeypot, same-origin JSON checks, 16 KiB body limit, bounded process-local rate limits, idempotency keys and duplicate-content protection are present. Tokens and message personal data are not logged or emitted into client bundles.

## Validation

- `npm run typecheck`: passed.
- `NEXT_PUBLIC_SITE_URL=http://localhost:3001 npm run build`: passed. The URL is a test-only environment value, not a hardcoded production fallback.
- `node --test tests/gmail-contact.test.cjs`: 22 passed. Covers invalid/missing fields, invalid email, excessive length/body size, header injection, consent, honeypot, origin, missing credentials, revoked refresh token, Gmail failure/quota, acceptance ID, recipient/Reply-To, MIME encoding, duplicate protection, rate limiting, stable project statuses and metadata origin.
- `node --check scripts/gmail-authorize.mjs`: passed. The helper was NOT authorized or run against Google.
- Headless Chrome: 56 route/viewport checks at 320, 375, 390, 440, 768, 1024 and 1440px on Home, News, News detail, Projects, Ongoing Projects, Project detail, About and Contact. No horizontal overflow, missing shared header/footer, dialogs, hydration errors or runtime console errors.
- Grid/List switching works. Planned + tourism filters produce the expected empty state; ongoing listing shows exactly two ongoing records. KA/EN selection persists and all tested titles remain Georgian. Contact field validation and missing-configuration mode work.
- All 15 public existing/new content URLs return HTTP 200. Unknown project detail returns HTTP 404 with shared layout.
- Local HTML verifies unique canonical, og:url, og:image and summary_large_image Twitter metadata and correct encoded Facebook Share URLs. No public Facebook preview was verified.
- Frontend static assets contain no Gmail OAuth client secret/refresh-token variables or Google sending endpoint implementation. `.env.local` and `.env.production` are ignored by Git.
- Browser QA output is outside the repo at `/tmp/adjara-phase2-qa/news-projects-gmail-results.json`.

## Still required before deployment

The account owner must configure Gmail OAuth using [the numbered setup guide](GMAIL_SETUP.md). No account was authorized, no billing was enabled, no OAuth app was published and no real email delivery was verified. Missing credentials leave sending unavailable. Google sensitive-scope verification, token expiration, API quotas and account restrictions may apply.

Set NEXT_PUBLIC_SITE_URL to the approved public HTTPS origin at build and runtime. Then use [the sharing verification guide](SHARING.md); localhost cannot verify Facebook crawler photo previews.

The rate limiter and duplicate store are per-process and reset on restart. Add shared ingress protections before multi-instance production hosting. Review approved real content and replace illustrative records when supplied. Optional unverified project fields remain omitted.

No CMS, database, deployment or GitHub push was performed.

## Files created

- `src/lib/records.ts`
- `src/lib/site-metadata.ts`
- `src/lib/gmail.ts`
- `src/components/ContentElements.tsx`
- `src/components/ContentListing.tsx`
- `src/app/news/page.tsx`
- `src/app/news/[slug]/page.tsx`
- `src/app/projects/ongoing/page.tsx`
- `src/app/projects/[slug]/page.tsx`
- `src/app/not-found.tsx`
- `scripts/gmail-authorize.mjs`
- `tests/gmail-contact.test.cjs`
- `docs/GMAIL_SETUP.md`
- `docs/SHARING.md`
- `docs/IMPLEMENTATION_REPORT.md`

## Files modified

- `.env.example`
- `README.md`
- `src/app/api/contact/route.ts`
- `src/app/projects/page.tsx`
- `src/app/globals.css`
- `src/components/ContactForm.tsx`
- `src/components/InternalPage.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/Website.tsx`
- `src/components/HomepageSections.tsx`
- `src/components/ProjectPortfolio.tsx`
- `src/components/Testimonials.tsx`
- `src/data/content.ts`
- `src/data/homepage.ts`
- `src/lib/contact-validation.ts`
