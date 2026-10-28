import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Legacy rows stay NULL: the S3 proxy resolves their existing flat filenames.
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Once populated, this column locates private objects. Older local configs
  // can ignore it; dropping it would lose storage paths and break media reads.
  throw new Error('Refusing to drop media._objectkey: preserve storage keys when rolling back application code.')
}
