# CMS content copy and schema migration

## Current status — Phase 4.2

The authorized public cutover is implemented. Published News/Projects, active homepage collections, About and public Site Settings now read PostgreSQL through Payload. The following original-import notes describe Phase 4 history. Do not reimport to publish edits. See [the Phase 4.2 report](PHASE4_2_IMPLEMENTATION_REPORT.md) for the additive URL-history migration, backups and live tests.

## Original Phase 4 scope

The CMS copy is local and complete for the inventoried editable content. **Public pages intentionally still read their existing static sources.** The frontend query switch was deferred during Phase 4 and Phase 4.1; Phase 4.2 explicitly authorized it. Original source data/media has not been removed or overwritten.

Next route groups separate public and Payload root layouts. Existing pages moved verbatim under `src/app/(frontend)`; only their layout's relative CSS import changed. URLs, metadata, galleries, sharing, navigation, design and data reads remain the same. API contact/Gmail files were not moved or edited.

## Applied schema

`src/cms/migrations/20261027_081756_initial_cms.ts` and its JSON snapshot define the schema. It was applied once to pmc_cms on PostgreSQL 17:5433. Project lifecycle uses a distinct enum from Payload's draft/publication status. Schema push is disabled; no reset/drop was performed. The generated down migration exists for review, but was not executed and must not be run casually.

Collections: Users, Media, Project Categories, News, Projects, Slides, Testimonials, Statistics and Audit Logs. Globals: About, Site Settings and Homepage. PostgreSQL tables include localized fields, relationships, gallery arrays, auth sessions, granular permissions, revisions, admin preferences/locks and migration history.

Ongoing Projects is a link to the Projects list filtered by status=ongoing. There is no duplicated ongoing-project collection. The planned source project remains planned; no status/progress was invented.

## Imported records

| Destination | Count | Original source |
| --- | ---: | --- |
| Media | 8 | public/images, copied uploads and thumbnail generation |
| Project categories | 4 | homepage.categories |
| Projects | 5 | homepage.projects and records.ts gallery/date semantics |
| News | 3 | homepage.news |
| Slides | 4 | content.ka.slides and slideImages |
| Statistics | 4 | homepage.metrics (24, 8, 6, 4) |
| Testimonials | 2 | actual rendered sampleReview / quotes[1], clearly illustrative |
| About | 1 global | original heading and all five paragraphs verbatim |
| Site Settings | 1 global | public contacts, company identity, logo assets, structured footer/site copy |
| Homepage | 1 global | structured section/process/services/transparency copy, testimonial labels and demo notice |

All source slugs and news dates are preserved. Existing progress 68/42 remains illustrative and not verified. Unknown progress stays null. Categories and images use real CMS relationships. Projects retain their one-photo fallback galleries. News had no additional gallery assets in the source. Framework icons remain code assets and are not editable content.

## Repeatable import

```sh
npm run cms -- migrate:status
npm run cms:import -- --dry-run
npm run cms:import
node --import tsx tests/cms-data.test.ts
```

The dry-run ran first and proposed 30 collection documents plus 3 globals, with no writes. Actual import created those records. A second actual run created **0**, skipping all **33** existing source entries. Import uses unique sourceKey identifiers; media additionally stores a SHA-256 source checksum. It does not update existing records, so administrator edits are not overwritten by reruns. Globals use a guarded migrationSource marker. Partial imports can resume; there is no wipe/reset operation.

The importer reads original TypeScript data and extracts About string literals via TypeScript's AST; it does not evaluate arbitrary source or rewrite official text. Structured global fields preserve all inventoried homepage/site copy, including arrays. Georgian is stored once; English falls back to Georgian.

## Verification

The data suite compares counts, unique keys, all project slugs/statuses/progress/text, news titles/body/date, English fallback, exact official About paragraphs, contact values, counter order/values, rendered testimonial text/disclaimers, media source hashes and native thumbnails (small logos use original-size fallback). It compares public source checksums against CMS_SOURCE_INVENTORY.json, accounting for route moves. It also checks that users have salted native hashes and no plaintext password column.

Existing baseline tests: 36 passed. API and browser checks are detailed in PHASE4_IMPLEMENTATION_REPORT.md. No claim of public CMS rendering is made.

## Backups and rollback

Pre-CMS source/media archive: `/private/tmp/pmc-phase4-audit-20261027/project-before-cms.tar.gz`; pre-existing next-env diff is alongside it. Temporary storage is not durable. A private copy is retained under `.cms-backups` when the original archive is available. `docs/CMS_SOURCE_INVENTORY.json` stores original checksums.

Pre-schema database backup: `.cms-backups/before-payload-schema.dump`, custom pg_dump format, mode 0600. `.cms-backups` and `media/` are Git ignored. Back up these directories plus the database privately before future migrations. No restoration drill has yet been performed.

Recover source into a NEW directory for comparison; never overwrite current work blindly or use destructive Git reset/clean. Restore a database dump only into a separate explicitly chosen recovery database first; do not drop/reset this database or touch PostgreSQL 13. Keep original public assets and static data until a separately authorized frontend migration and visual parity review.
