import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_copy_nav_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_copy_slides_value_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_copy_footer_titles_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_copy_footer_links_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_copy_nav_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_copy_slides_value_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_copy_footer_titles_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_copy_footer_links_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_sections_metrics_value_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_testimonials_copy_quotes_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_sections_metrics_value_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_testimonials_copy_quotes_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "media_locales" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "project_categories_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "slides_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "testimonials_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "testimonials_locales" ALTER COLUMN "quote" DROP NOT NULL;
  ALTER TABLE "statistics_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "about_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "_about_v_locales" ALTER COLUMN "version_title" DROP NOT NULL;
  ALTER TABLE "site_settings_locales" ALTER COLUMN "company_name" DROP NOT NULL;
  ALTER TABLE "_site_settings_v_locales" ALTER COLUMN "version_company_name" DROP NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "phone" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_company" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_short" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_second" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_contact" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_explore" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_overview" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_demo" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_footer_text" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_contact_note" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_rights" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_pause" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_play" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_next" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_previous" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "copy_menu" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_phone" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_company" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_short" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_second" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_contact" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_explore" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_eyebrow" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_overview" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_description" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_demo" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_footer_text" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_contact_note" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_rights" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_pause" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_play" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_next" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_previous" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_copy_menu" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "testimonials_copy_title" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "testimonials_copy_intro" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "testimonials_copy_label" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "testimonials_copy_placeholder" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "testimonials_copy_note" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "testimonials_copy_previous" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "testimonials_copy_next" varchar;
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_testimonials_copy_title" varchar;
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_testimonials_copy_intro" varchar;
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_testimonials_copy_label" varchar;
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_testimonials_copy_placeholder" varchar;
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_testimonials_copy_note" varchar;
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_testimonials_copy_previous" varchar;
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_testimonials_copy_next" varchar;
  ALTER TABLE "site_settings_copy_nav_locales" ADD CONSTRAINT "site_settings_copy_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_copy_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_slides_value_locales" ADD CONSTRAINT "site_settings_copy_slides_value_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_copy_slides_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_footer_titles_locales" ADD CONSTRAINT "site_settings_copy_footer_titles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_copy_footer_titles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_footer_links_locales" ADD CONSTRAINT "site_settings_copy_footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_copy_footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_nav_locales" ADD CONSTRAINT "_site_settings_v_version_copy_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_copy_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_slides_value_locales" ADD CONSTRAINT "_site_settings_v_version_copy_slides_value_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_copy_slides_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_footer_titles_locales" ADD CONSTRAINT "_site_settings_v_version_copy_footer_titles_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_copy_footer_titles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_footer_links_locales" ADD CONSTRAINT "_site_settings_v_version_copy_footer_links_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_copy_footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_metrics_value_locales" ADD CONSTRAINT "homepage_sections_metrics_value_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_metrics_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_testimonials_copy_quotes_locales" ADD CONSTRAINT "homepage_testimonials_copy_quotes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_testimonials_copy_quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_metrics_value_locales" ADD CONSTRAINT "_homepage_v_version_sections_metrics_value_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections_metrics_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_testimonials_copy_quotes_locales" ADD CONSTRAINT "_homepage_v_version_testimonials_copy_quotes_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_testimonials_copy_quotes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "site_settings_copy_nav_locales_locale_parent_id_unique" ON "site_settings_copy_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_copy_nav_locales_parent_id_idx" ON "site_settings_copy_nav_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_copy_slides_value_locales_locale_parent_id_uni" ON "site_settings_copy_slides_value_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_copy_slides_value_locales_parent_id_idx" ON "site_settings_copy_slides_value_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_copy_footer_titles_locales_locale_parent_id_un" ON "site_settings_copy_footer_titles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_copy_footer_titles_locales_parent_id_idx" ON "site_settings_copy_footer_titles_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_copy_footer_links_locales_locale_parent_id_uni" ON "site_settings_copy_footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_copy_footer_links_locales_parent_id_idx" ON "site_settings_copy_footer_links_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_settings_v_version_copy_nav_locales_locale_parent_id_u" ON "_site_settings_v_version_copy_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_nav_locales_parent_id_idx" ON "_site_settings_v_version_copy_nav_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_settings_v_version_copy_slides_value_locales_locale_pa" ON "_site_settings_v_version_copy_slides_value_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_slides_value_locales_paren_idx" ON "_site_settings_v_version_copy_slides_value_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_settings_v_version_copy_footer_titles_locales_locale_p" ON "_site_settings_v_version_copy_footer_titles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_footer_titles_locales_pare_idx" ON "_site_settings_v_version_copy_footer_titles_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_settings_v_version_copy_footer_links_locales_locale_pa" ON "_site_settings_v_version_copy_footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_footer_links_locales_paren_idx" ON "_site_settings_v_version_copy_footer_links_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_sections_metrics_value_locales_locale_parent_id_uni" ON "homepage_sections_metrics_value_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_sections_metrics_value_locales_parent_id_idx" ON "homepage_sections_metrics_value_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_testimonials_copy_quotes_locales_locale_parent_id_u" ON "homepage_testimonials_copy_quotes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_testimonials_copy_quotes_locales_parent_id_idx" ON "homepage_testimonials_copy_quotes_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_sections_metrics_value_locales_locale_pa" ON "_homepage_v_version_sections_metrics_value_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_sections_metrics_value_locales_paren_idx" ON "_homepage_v_version_sections_metrics_value_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_testimonials_copy_quotes_locales_locale_" ON "_homepage_v_version_testimonials_copy_quotes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_testimonials_copy_quotes_locales_par_idx" ON "_homepage_v_version_testimonials_copy_quotes_locales" USING btree ("_parent_id");
  -- Preserve Georgian copy and version history before moving storage.
  INSERT INTO "site_settings_copy_nav_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "site_settings_copy_nav";
  INSERT INTO "site_settings_copy_slides_value_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "site_settings_copy_slides_value";
  INSERT INTO "site_settings_copy_footer_titles_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "site_settings_copy_footer_titles";
  INSERT INTO "site_settings_copy_footer_links_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "site_settings_copy_footer_links";
  UPDATE "site_settings_locales" d SET "copy_company"=s."copy_company" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_short"=s."copy_short" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_second"=s."copy_second" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_contact"=s."copy_contact" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_explore"=s."copy_explore" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_eyebrow"=s."copy_eyebrow" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_overview"=s."copy_overview" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_description"=s."copy_description" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_demo"=s."copy_demo" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_footer_text"=s."copy_footer_text" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_contact_note"=s."copy_contact_note" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_rights"=s."copy_rights" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_pause"=s."copy_pause" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_play"=s."copy_play" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_next"=s."copy_next" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_previous"=s."copy_previous" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings_locales" d SET "copy_menu"=s."copy_menu" FROM "site_settings" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "site_settings" d SET "phone"=s."phone" FROM "site_settings_locales" s WHERE s._parent_id=d.id AND s._locale='ka';
  INSERT INTO "_site_settings_v_version_copy_nav_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "_site_settings_v_version_copy_nav";
  INSERT INTO "_site_settings_v_version_copy_slides_value_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "_site_settings_v_version_copy_slides_value";
  INSERT INTO "_site_settings_v_version_copy_footer_titles_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "_site_settings_v_version_copy_footer_titles";
  INSERT INTO "_site_settings_v_version_copy_footer_links_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "_site_settings_v_version_copy_footer_links";
  UPDATE "_site_settings_v_locales" d SET "version_copy_company"=s."version_copy_company" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_short"=s."version_copy_short" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_second"=s."version_copy_second" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_contact"=s."version_copy_contact" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_explore"=s."version_copy_explore" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_eyebrow"=s."version_copy_eyebrow" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_overview"=s."version_copy_overview" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_description"=s."version_copy_description" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_demo"=s."version_copy_demo" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_footer_text"=s."version_copy_footer_text" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_contact_note"=s."version_copy_contact_note" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_rights"=s."version_copy_rights" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_pause"=s."version_copy_pause" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_play"=s."version_copy_play" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_next"=s."version_copy_next" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_previous"=s."version_copy_previous" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v_locales" d SET "version_copy_menu"=s."version_copy_menu" FROM "_site_settings_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_site_settings_v" d SET "version_phone"=s."version_phone" FROM "_site_settings_v_locales" s WHERE s._parent_id=d.id AND s._locale='ka';
  INSERT INTO "homepage_sections_metrics_value_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "homepage_sections_metrics_value";
  INSERT INTO "homepage_testimonials_copy_quotes_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "homepage_testimonials_copy_quotes";
  UPDATE "homepage_locales" d SET "testimonials_copy_title"=s."testimonials_copy_title" FROM "homepage" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "homepage_locales" d SET "testimonials_copy_intro"=s."testimonials_copy_intro" FROM "homepage" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "homepage_locales" d SET "testimonials_copy_label"=s."testimonials_copy_label" FROM "homepage" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "homepage_locales" d SET "testimonials_copy_placeholder"=s."testimonials_copy_placeholder" FROM "homepage" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "homepage_locales" d SET "testimonials_copy_note"=s."testimonials_copy_note" FROM "homepage" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "homepage_locales" d SET "testimonials_copy_previous"=s."testimonials_copy_previous" FROM "homepage" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "homepage_locales" d SET "testimonials_copy_next"=s."testimonials_copy_next" FROM "homepage" s WHERE d._parent_id=s.id AND d._locale='ka';
  INSERT INTO "_homepage_v_version_sections_metrics_value_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "_homepage_v_version_sections_metrics_value";
  INSERT INTO "_homepage_v_version_testimonials_copy_quotes_locales" ("value","_locale","_parent_id") SELECT "value",'ka',id FROM "_homepage_v_version_testimonials_copy_quotes";
  UPDATE "_homepage_v_locales" d SET "version_testimonials_copy_title"=s."version_testimonials_copy_title" FROM "_homepage_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_homepage_v_locales" d SET "version_testimonials_copy_intro"=s."version_testimonials_copy_intro" FROM "_homepage_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_homepage_v_locales" d SET "version_testimonials_copy_label"=s."version_testimonials_copy_label" FROM "_homepage_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_homepage_v_locales" d SET "version_testimonials_copy_placeholder"=s."version_testimonials_copy_placeholder" FROM "_homepage_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_homepage_v_locales" d SET "version_testimonials_copy_note"=s."version_testimonials_copy_note" FROM "_homepage_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_homepage_v_locales" d SET "version_testimonials_copy_previous"=s."version_testimonials_copy_previous" FROM "_homepage_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  UPDATE "_homepage_v_locales" d SET "version_testimonials_copy_next"=s."version_testimonials_copy_next" FROM "_homepage_v" s WHERE d._parent_id=s.id AND d._locale='ka';
  ALTER TABLE "site_settings_copy_nav" DROP COLUMN "value";
  ALTER TABLE "site_settings_copy_slides_value" DROP COLUMN "value";
  ALTER TABLE "site_settings_copy_footer_titles" DROP COLUMN "value";
  ALTER TABLE "site_settings_copy_footer_links" DROP COLUMN "value";
  ALTER TABLE "site_settings" DROP COLUMN "copy_company";
  ALTER TABLE "site_settings" DROP COLUMN "copy_short";
  ALTER TABLE "site_settings" DROP COLUMN "copy_second";
  ALTER TABLE "site_settings" DROP COLUMN "copy_contact";
  ALTER TABLE "site_settings" DROP COLUMN "copy_explore";
  ALTER TABLE "site_settings" DROP COLUMN "copy_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "copy_overview";
  ALTER TABLE "site_settings" DROP COLUMN "copy_description";
  ALTER TABLE "site_settings" DROP COLUMN "copy_demo";
  ALTER TABLE "site_settings" DROP COLUMN "copy_footer_text";
  ALTER TABLE "site_settings" DROP COLUMN "copy_contact_note";
  ALTER TABLE "site_settings" DROP COLUMN "copy_rights";
  ALTER TABLE "site_settings" DROP COLUMN "copy_pause";
  ALTER TABLE "site_settings" DROP COLUMN "copy_play";
  ALTER TABLE "site_settings" DROP COLUMN "copy_next";
  ALTER TABLE "site_settings" DROP COLUMN "copy_previous";
  ALTER TABLE "site_settings" DROP COLUMN "copy_menu";
  ALTER TABLE "site_settings_locales" DROP COLUMN "phone";
  ALTER TABLE "_site_settings_v_version_copy_nav" DROP COLUMN "value";
  ALTER TABLE "_site_settings_v_version_copy_slides_value" DROP COLUMN "value";
  ALTER TABLE "_site_settings_v_version_copy_footer_titles" DROP COLUMN "value";
  ALTER TABLE "_site_settings_v_version_copy_footer_links" DROP COLUMN "value";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_company";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_short";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_second";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_contact";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_explore";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_eyebrow";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_overview";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_description";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_demo";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_footer_text";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_contact_note";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_rights";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_pause";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_play";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_next";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_previous";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_copy_menu";
  ALTER TABLE "_site_settings_v_locales" DROP COLUMN "version_phone";
  ALTER TABLE "homepage_sections_metrics_value" DROP COLUMN "value";
  ALTER TABLE "homepage_testimonials_copy_quotes" DROP COLUMN "value";
  ALTER TABLE "homepage" DROP COLUMN "testimonials_copy_title";
  ALTER TABLE "homepage" DROP COLUMN "testimonials_copy_intro";
  ALTER TABLE "homepage" DROP COLUMN "testimonials_copy_label";
  ALTER TABLE "homepage" DROP COLUMN "testimonials_copy_placeholder";
  ALTER TABLE "homepage" DROP COLUMN "testimonials_copy_note";
  ALTER TABLE "homepage" DROP COLUMN "testimonials_copy_previous";
  ALTER TABLE "homepage" DROP COLUMN "testimonials_copy_next";
  ALTER TABLE "_homepage_v_version_sections_metrics_value" DROP COLUMN "value";
  ALTER TABLE "_homepage_v_version_testimonials_copy_quotes" DROP COLUMN "value";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_testimonials_copy_title";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_testimonials_copy_intro";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_testimonials_copy_label";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_testimonials_copy_placeholder";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_testimonials_copy_note";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_testimonials_copy_previous";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_testimonials_copy_next";`)
}

// Rollback must not discard English translations written after migration.
export async function down(_args: MigrateDownArgs): Promise<void> {
 throw new Error('Forward-only content migration. Restore a verified backup in an isolated database or write a preserving forward migration.');
}
