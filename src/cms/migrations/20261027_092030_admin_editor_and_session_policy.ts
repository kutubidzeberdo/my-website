import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "session_policies" jsonb;
  ALTER TABLE "about_locales" ADD COLUMN IF NOT EXISTS "content" jsonb;
  ALTER TABLE "_about_v_locales" ADD COLUMN IF NOT EXISTS "version_content" jsonb;`)
  // Preserve existing editor documents; convert saved localized rows in order.
  await db.execute(sql`UPDATE "about_locales" a SET "content" = (
    SELECT jsonb_build_object('root', jsonb_build_object(
      'type','root','version',1,'format','','indent',0,'direction',NULL,
      'children',jsonb_agg(jsonb_build_object(
        'type','paragraph','version',1,'format','','indent',0,'direction',NULL,'textFormat',0,'textStyle','',
        'children',jsonb_build_array(jsonb_build_object('type','text','version',1,'text',l.text,'format',0,'detail',0,'mode','normal','style',''))
      ) ORDER BY p._order)
    )) FROM "about_paragraphs" p JOIN "about_paragraphs_locales" l ON l._parent_id=p.id
    WHERE p._parent_id=a._parent_id AND l._locale=a._locale
  ) WHERE a."content" IS NULL AND EXISTS (
    SELECT 1 FROM "about_paragraphs" p JOIN "about_paragraphs_locales" l ON l._parent_id=p.id
    WHERE p._parent_id=a._parent_id AND l._locale=a._locale
  );`)

  // Preserve existing editor documents; convert saved localized rows in order.
  await db.execute(sql`UPDATE "_about_v_locales" a SET "version_content" = (
    SELECT jsonb_build_object('root', jsonb_build_object(
      'type','root','version',1,'format','','indent',0,'direction',NULL,
      'children',jsonb_agg(jsonb_build_object(
        'type','paragraph','version',1,'format','','indent',0,'direction',NULL,'textFormat',0,'textStyle','',
        'children',jsonb_build_array(jsonb_build_object('type','text','version',1,'text',l.text,'format',0,'detail',0,'mode','normal','style',''))
      ) ORDER BY p._order)
    )) FROM "_about_v_version_paragraphs" p JOIN "_about_v_version_paragraphs_locales" l ON l._parent_id=p.id
    WHERE p._parent_id=a._parent_id AND l._locale=a._locale
  ) WHERE a."version_content" IS NULL AND EXISTS (
    SELECT 1 FROM "_about_v_version_paragraphs" p JOIN "_about_v_version_paragraphs_locales" l ON l._parent_id=p.id
    WHERE p._parent_id=a._parent_id AND l._locale=a._locale
  );`)

}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('This additive content migration is forward-only. Preserve the new rich-text documents and recover from the private pre-migration backup into a separate recovery database after review.');
}
