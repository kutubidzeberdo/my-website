# DigitalOcean Phase 1 — Spaces schema migration prepared

Status: **prepared and tested; NOT applied to `pmc_cms` or any live database**.

The complete `digitalocean-production-readiness.md` report was reviewed. This phase addresses only the conditional S3 storage schema blocker. Other deployment-readiness gates remain open.

## Files

Created:

- `src/cms/migrations/20261028_150352_spaces_object_key.ts` — additive migration and protected rollback.
- `src/cms/migrations/20261028_150352_spaces_object_key.json` — native Payload/Drizzle snapshot for S3-enabled schema.
- `tests/cms-spaces-schema.test.ts` — registration, snapshot, actual installed schema, proxy URLs and legacy storage-path checks.
- `tests/helpers/cms-spaces-schema-probe.ts` — connection-disabled child-process schema inspection.
- `tests/cms-spaces-migration-postgres.test.ts` — SQL execution against an automatically created/removed disposable PostgreSQL 17 cluster.
- `docs/digitalocean-phase1-spaces-schema.md` — this implementation report and future execution order.

Modified:

- `src/cms/migrations/index.ts` — append the sixth migration; retain the five existing entries in order.

The pre-existing `next-env.d.ts` modification and untracked readiness report were retained, not changed by this phase. No runtime configuration, Media collection, frontend, CMS UI, authentication, image files or environment secrets were edited.

## Exact schema change

The installed `@payloadcms/storage-s3@3.92.0` / cloud-storage plugin adds `_objectKey` as a hidden stored `text` field when S3 is enabled. The installed PostgreSQL adapter's naming/type mapping and the native migration generator both confirm:

```sql
ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
```

The SQL type is unlimited `character varying`, **nullable, without a default**, with no new index, uniqueness, foreign key or required-value constraint. Existing rows acquire only a NULL value. There is no UPDATE, DELETE, URL rewrite, file operation, image generation or data backfill in the migration.

The migration was generated using the project's actual Payload CLI in an isolated temporary source copy, with database connections disabled and dummy process-only S3 settings. Neither `.env.local` nor the user's normal S3-disabled process configuration was enabled/changed.

The new native snapshot differs from the fifth snapshot only by `public.media.columns._objectkey` and the generated snapshot ID. It does not change any other table, enum, relationship, locale, derivative, constraint or index.

### Rollback policy

`down()` deliberately throws before issuing SQL. Dropping `_objectkey` after cloud uploads have populated it would lose object-folder locations. Application code can be rolled back while retaining this nullable column; this migration refuses a destructive schema rollback. The existing migration ledger prevents normal forward reapplication. No rollback or migration command was run against the real local database.

## Legacy/private storage compatibility

The native storage resolver was exercised with missing, NULL and empty object keys. Originals, 400×300 thumbnails and card derivatives continue resolving to their existing bare filenames. A populated new object key resolves to its folder plus filename, without changing Media IDs.

The actual S3-enabled schema has exactly one SQL-column difference from the S3-disabled schema. Native URL hooks keep main/thumbnail/card URLs on the same-origin `/api/media/file/...` proxy in both modes. The existing Media read-access function and S3 proxy handler remain present; no public-read bucket ACL, direct-Spaces URL conversion, access-control bypass or remote-image wildcard was introduced.

Local development remains S3-disabled and does not expect the new column. Do not add the field unconditionally to local runtime configuration while the local database is intentionally unmigrated.

**Future migration-generation rule:** generate/review later production schema changes using the correct S3-enabled configuration in an isolated environment. Comparing an S3-disabled schema against this S3-enabled snapshot can propose dropping `_objectkey`; do not accept such a deletion. No automatic schema push was enabled.

## Verification

Executed:

- `node_modules/.bin/tsc --noEmit --incremental false` — passed.
- `npm test` — 46/46 existing tests passed.
- `TSX_DISABLE_CACHE=1 node --import tsx --test tests/cms-spaces-schema.test.ts` — 3/3 passed. These inspect actual installed package/schema behavior, including same-origin URL hooks and flat legacy paths; no database or bucket connection is made.
- `TSX_DISABLE_CACHE=1 node --import tsx --test tests/cms-spaces-migration-postgres.test.ts` — 1/1 passed. A separate temporary PostgreSQL 17.11 cluster on an automatically selected loopback port, explicitly different from 5433, applied the five prior migrations and the new migration using synthetic fixtures. The test never reads `DATABASE_URL` or `.env.local`. It verified every existing row/value, localized row ID, main/derivative URL, dimension, relationship and prior migration-ledger entry remained identical apart from the new NULL column. A populated test object key survived the refused rollback. The cluster and its files were removed afterward.
- `npm run build` — passed in a temporary source copy with final sources, dummy S3 settings, an unreachable placeholder database address and no `.env.local`. Next.js compiled, type-checked and generated its production routes successfully. The user's active `.next` build and server were not used or replaced. This verifies this build path without a reachable database; it does not test live DigitalOcean or Spaces permissions.
- `git diff --check` — passed.

S3 test settings exist only in isolated child processes. No cloud resource was created or contacted and no image was uploaded, moved or regenerated.

## Real local database/data preservation

Only direct read-only PostgreSQL transactions were used for the real local database. A before/after hash comparison covers all **99 public tables** and all **19 existing Media files**, plus `.env.local`, the existing Payload/Media/Next configuration files and `next-env.d.ts`.

Final before/after verification **passed with no differences** across all 99 public tables and all 24 hashed files (19 images and five environment/configuration files). The real local database still has exactly five applied migrations and **no `_objectkey` column**. This sixth migration remains pending there until separately authorized.

No previously declined Settings history restoration was attempted. No deployment, Git push, paid resource creation, dependency install or actual local migration was performed.

## Future restore/migration execution order

These are instructions for a later explicitly authorized target environment, **not commands to run on the current local project/database**:

1. Review this migration, its snapshot, tests and protected rollback policy. Keep a release revision containing all six migration files/index entries. Do not use `prodMigrations` or per-request migration execution as an unreviewed shortcut.
2. Resolve the readiness report's remaining configuration decisions before authorizing paid infrastructure: tested Node version, production HTTPS origin, Managed PostgreSQL TLS/CA/trusted-source plan, private Spaces bucket/proxy/key layout, environment scopes, health checks, backup/rollback and contact-email requirements. None of those unrelated changes was implemented here.
3. After separate infrastructure/migration approval, freeze source CMS editing and make fresh complete database/media backups with hashes. Preserve the source and its current five-entry migration ledger.
4. Restore the full database into an **empty** target application database. Include users/hashes/permissions, locales, relationships, versions, sequences and `payload_migrations`. Do not first run all migrations to create duplicate tables, and do not seed/import/bootstrap over the restore.
5. Verify the restored target is at the five existing migrations and has the expected data/IDs. Bind the migration runner explicitly to that target; never allow a missing target variable to fall back to the local `.env.local` database.
6. Configure that runner with production mode and the intended S3-enabled schema. In a controlled release/pre-deploy step, inspect migration status, run `npm run cms -- migrate` once, then inspect status again. The five restored migrations are skipped and `20261028_150352_spaces_object_key` is applied/recorded as the sixth. This must happen **before serving traffic with S3 enabled**.
7. Verify `_objectkey` is nullable `varchar`, legacy rows remain NULL and every original value/relationship is preserved. Copy the 19 existing files to the private bucket under their exact flat legacy keys in the separately authorized media-transfer phase; do not recreate Media documents.
8. Test the same-origin media proxy, actual cloud upload/focal workflows, private access and restart persistence in staging. Reconfirm image/layout/auth/content parity and the remaining readiness gates before requesting production deployment approval.

The SQL blocker is now addressed by a reviewable migration, not by a live schema change. DigitalOcean resources, live migration and deployment still require explicit authorization.
