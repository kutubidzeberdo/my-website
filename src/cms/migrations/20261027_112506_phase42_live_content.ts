import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "previous_slugs" jsonb;
  ALTER TABLE "_news_v" ADD COLUMN IF NOT EXISTS "version_previous_slugs" jsonb;
  ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "previous_slugs" jsonb;
  ALTER TABLE "_projects_v" ADD COLUMN IF NOT EXISTS "version_previous_slugs" jsonb;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {throw new Error('Preserve URL alias history. Recover into a separate database from the private Phase 4.2 backup; do not drop live aliases.');}
