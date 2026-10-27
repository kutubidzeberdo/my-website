# Adjara Project Management Company

Local Next.js App Router / TypeScript / Tailwind implementation, based on the supplied Construction Architect screenshots. No WordPress code is included.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. Production: `npm run build`, then `npm start`. Suitable for a future DigitalOcean App Platform Node service using the platform's PORT environment variable. No secrets or backend are currently required.

## Implementation phases

1. Shared layout, responsive header, four-slide carousel, footer — implemented.
2. Homepage work process, categories, project cards, transparency, statistics, progress and news — implemented; ready for visual review.
3. Internal routes, project details, galleries and filtering.
4. Complete bilingual content, interactive maps, demo forms and documents.
5. Mobile browser testing, accessibility and production validation.

The homepage includes a company introduction, four process cards, service categories, five filterable project previews, a transparency feature, demo statistics, two progress previews and three sample news cards. Project and news previews use accessible native dialogs; internal routes remain for Phase 3. Only the homepage exists at this stage. No fabricated statistics, budgets, contact details, management names or certificates are presented.

Content is centralized in `src/data/content.ts` and `src/data/homepage.ts`. The KA/EN setting is persisted locally, the carousel supports direct slide selection, previous/next and pause, and reduced-motion preferences disable autoplay. Navigation uses homepage anchors until internal routes are implemented.

## Media

Locally stored illustrative photographs from Unsplash (https://unsplash.com/license). These do not depict the named projects and are labeled illustrative in the interface:

- arena.jpg: https://images.unsplash.com/photo-1522778119026-d647f0596c20
- mountains.jpg: https://images.unsplash.com/photo-1464822759023-fed622ff2c3b
- infrastructure.jpg: https://images.unsplash.com/photo-1486406146926-c627a92ad1ab
- construction.jpg: https://images.unsplash.com/photo-1504307651254-35680f356dfd

Noto Sans Georgian is loaded through Google Fonts with a system font fallback. Replace illustrative media with approved organizational assets before production.

Local Payload CMS integration is documented below. No deployment or GitHub push has been performed.

## Phase 2 validation

Production build and TypeScript checks pass. Local headless Chrome checks cover 320, 375, 390, 440, 768 and 1440px, plus category filtering, project dialogs, English translation, persisted language selection and mobile navigation. Screenshots and QA output are kept outside the repository under `/tmp/adjara-phase2-qa`. Sample statuses, progress, dates, statistics and news are visibly marked DEMO. No internal pages were started.

## News, projects and Gmail integration

News: `/news`, `/news/[slug]`. Projects: `/projects`, `/projects/ongoing`, `/projects/[slug]`. Listing pages share Grid/List controls and category/status filtering. Homepage previews keep their existing styling and navigate to details in the same tab. Optional project fields (location, budget, contractor, timeline, gallery, video, before/after) are supported and omitted when unavailable; no official details were fabricated.

The contact page uses the Gmail API over HTTPS with OAuth refresh credentials, not Resend or SMTP. Missing configuration disables real sending. See [the numbered Gmail owner setup guide](docs/GMAIL_SETUP.md) and [Facebook sharing verification](docs/SHARING.md). No real Gmail authorization or email delivery has been verified. No public Facebook preview has been verified.

All visible content currently remains Georgian in KA and EN; the switcher still retains the selected language for later translations. Payload/PostgreSQL is now the live source for published public content; administration is available at `/admin`. No deployment or GitHub push was performed.

The contact endpoint validates fields/consent, caps JSON bodies at 16 KiB, rejects cross-origin requests and honeypots, and rate-limits attempts. Idempotency keys and content fingerprints reduce duplicate sends. Rate limits and duplicate records are in memory per Node process; shared ingress protections are required before multi-instance hosting. Unknown send outcomes are not automatically retried. No personal data or tokens are logged.

Run `node --test tests/gmail-contact.test.cjs` for mocked Gmail/MIME/contact validation tests; these never authorize or send email to Google.

## Local Payload CMS

Payload 3.92.0 is integrated at `/admin`, using PostgreSQL 17 on port 5433.
See [local setup and initial login](docs/PAYLOAD_SETUP.md),
[content migration](docs/CMS_MIGRATION.md), [security](docs/CMS_SECURITY.md),
and [notifications](docs/CMS_ADMIN_NOTIFICATIONS.md).

```sh
npm run cms -- migrate:status
npm run dev
```

Phase 4.2 connects public News, Projects, homepage collections, About and Site Settings to Payload. Public pages use fresh server queries; CMS updates appear without a rebuild. See [the Phase 4.2 implementation and verification report](docs/PHASE4_2_IMPLEMENTATION_REPORT.md).
Do not recreate the existing database/role or overwrite `.env.local`.
