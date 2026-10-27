import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ka', 'en');
  CREATE TYPE "public"."enum_users_permissions_actions" AS ENUM('read', 'create', 'update', 'publish', 'delete');
  CREATE TYPE "public"."enum_users_permissions_section" AS ENUM('news', 'projects', 'project-categories', 'slides', 'media', 'testimonials', 'statistics', 'about', 'site-settings', 'homepage', 'users');
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'administrator', 'editor', 'author', 'viewer');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_published_locale" AS ENUM('ka', 'en');
  CREATE TYPE "public"."project_lifecycle" AS ENUM('ongoing', 'completed', 'planned');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('ka', 'en');
  CREATE TYPE "public"."enum_audit_logs_outcome" AS ENUM('success', 'failure');
  CREATE TABLE "users_permissions_actions" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_permissions_actions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_permissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_users_permissions_section" NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'viewer' NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"username" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar,
  	"source_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"title" varchar,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "project_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "news_gallery_locales" (
  	"caption" varchar,
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar,
  	"slug" varchar,
  	"image_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"author_id" integer,
  	"video_u_r_l" varchar,
  	"seo_image_id" integer,
  	"illustrative" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "news_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_news_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_v_version_gallery_locales" (
  	"caption" varchar,
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_source_key" varchar,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_author_id" integer,
  	"version_video_u_r_l" varchar,
  	"version_seo_image_id" integer,
  	"version_illustrative" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__news_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_news_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "projects_gallery_locales" (
  	"caption" varchar,
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar,
  	"slug" varchar,
  	"image_id" integer,
  	"video_u_r_l" varchar,
  	"author_id" integer,
  	"category_id" integer,
  	"status" "project_lifecycle" DEFAULT 'planned',
  	"progress" numeric,
  	"progress_verified" boolean DEFAULT false,
  	"progress_updated_at" timestamp(3) with time zone,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"seo_image_id" integer,
  	"illustrative" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"location" varchar,
  	"phase" varchar,
  	"budget" varchar,
  	"contractor" varchar,
  	"client" varchar,
  	"investment" varchar,
  	"area" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_gallery_locales" (
  	"caption" varchar,
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_source_key" varchar,
  	"version_slug" varchar,
  	"version_image_id" integer,
  	"version_video_u_r_l" varchar,
  	"version_author_id" integer,
  	"version_category_id" integer,
  	"version_status" "project_lifecycle" DEFAULT 'planned',
  	"version_progress" numeric,
  	"version_progress_verified" boolean DEFAULT false,
  	"version_progress_updated_at" timestamp(3) with time zone,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_seo_image_id" integer,
  	"version_illustrative" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_location" varchar,
  	"version_phase" varchar,
  	"version_budget" varchar,
  	"version_contractor" varchar,
  	"version_client" varchar,
  	"version_investment" varchar,
  	"version_area" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "slides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar,
  	"image_id" integer,
  	"button_u_r_l" varchar,
  	"order" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "slides_locales" (
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"description" varchar,
  	"button_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar,
  	"portrait_id" integer,
  	"illustrative" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"title" varchar NOT NULL,
  	"position" varchar,
  	"quote" varchar NOT NULL,
  	"notice" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "statistics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar,
  	"value" numeric NOT NULL,
  	"order" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"illustrative" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "statistics_locales" (
  	"title" varchar NOT NULL,
  	"suffix" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"actor_id" integer,
  	"action" varchar NOT NULL,
  	"collection_name" varchar NOT NULL,
  	"record_i_d" varchar NOT NULL,
  	"outcome" "enum_audit_logs_outcome" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"project_categories_id" integer,
  	"news_id" integer,
  	"projects_id" integer,
  	"slides_id" integer,
  	"testimonials_id" integer,
  	"statistics_id" integer,
  	"audit_logs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "about_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_paragraphs_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"migration_source" varchar,
  	"image_id" integer,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_locales" (
  	"title" varchar NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_v_version_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v_version_paragraphs_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_migration_source" varchar,
  	"version_image_id" integer,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_about_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_copy_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "site_settings_copy_slides_value" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "site_settings_copy_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_copy_footer_titles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "site_settings_copy_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"migration_source" varchar,
  	"telephone_href" varchar,
  	"email" varchar,
  	"facebook" varchar,
  	"instagram" varchar,
  	"logo_id" integer,
  	"symbol_logo_id" integer,
  	"full_logo_id" integer,
  	"copy_company" varchar,
  	"copy_short" varchar,
  	"copy_second" varchar,
  	"copy_contact" varchar,
  	"copy_explore" varchar,
  	"copy_eyebrow" varchar,
  	"copy_overview" varchar,
  	"copy_description" varchar,
  	"copy_demo" varchar,
  	"copy_footer_text" varchar,
  	"copy_contact_note" varchar,
  	"copy_rights" varchar,
  	"copy_pause" varchar,
  	"copy_play" varchar,
  	"copy_next" varchar,
  	"copy_previous" varchar,
  	"copy_menu" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"company_name" varchar NOT NULL,
  	"phone" varchar,
  	"address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_copy_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_copy_slides_value" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_copy_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_copy_footer_titles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_copy_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_migration_source" varchar,
  	"version_telephone_href" varchar,
  	"version_email" varchar,
  	"version_facebook" varchar,
  	"version_instagram" varchar,
  	"version_logo_id" integer,
  	"version_symbol_logo_id" integer,
  	"version_full_logo_id" integer,
  	"version_copy_company" varchar,
  	"version_copy_short" varchar,
  	"version_copy_second" varchar,
  	"version_copy_contact" varchar,
  	"version_copy_explore" varchar,
  	"version_copy_eyebrow" varchar,
  	"version_copy_overview" varchar,
  	"version_copy_description" varchar,
  	"version_copy_demo" varchar,
  	"version_copy_footer_text" varchar,
  	"version_copy_contact_note" varchar,
  	"version_copy_rights" varchar,
  	"version_copy_pause" varchar,
  	"version_copy_play" varchar,
  	"version_copy_next" varchar,
  	"version_copy_previous" varchar,
  	"version_copy_menu" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_locales" (
  	"version_company_name" varchar NOT NULL,
  	"version_phone" varchar,
  	"version_address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_sections_stages_value" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_stages_value_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_sections_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_categories_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_sections_service_descriptions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_service_descriptions_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_sections_transparency_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_sections_transparency_items_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_sections_metrics_value" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "homepage_sections_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "homepage_testimonials_copy_quotes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"migration_source" varchar,
  	"testimonials_copy_title" varchar,
  	"testimonials_copy_intro" varchar,
  	"testimonials_copy_label" varchar,
  	"testimonials_copy_placeholder" varchar,
  	"testimonials_copy_note" varchar,
  	"testimonials_copy_previous" varchar,
  	"testimonials_copy_next" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_locales" (
  	"sections_process_label" varchar,
  	"sections_process_title" varchar,
  	"sections_process_intro" varchar,
  	"sections_services_label" varchar,
  	"sections_services_title" varchar,
  	"sections_portfolio_label" varchar,
  	"sections_portfolio_title" varchar,
  	"sections_demo" varchar,
  	"sections_all" varchar,
  	"sections_preview" varchar,
  	"sections_close" varchar,
  	"sections_transparency_label" varchar,
  	"sections_transparency_title" varchar,
  	"sections_transparency_text" varchar,
  	"sections_transparency_panel" varchar,
  	"sections_transparency_note" varchar,
  	"sections_progress_label" varchar,
  	"sections_progress_title" varchar,
  	"sections_phase" varchar,
  	"sections_updated" varchar,
  	"sections_news_label" varchar,
  	"sections_news_title" varchar,
  	"sections_read" varchar,
  	"sections_sample" varchar,
  	"preview_notice" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_sections_stages_value" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_stages_value_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_sections_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_categories_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_sections_service_descriptions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_service_descriptions_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_sections_transparency_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_transparency_items_locales" (
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_sections_metrics_value" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_testimonials_copy_quotes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_migration_source" varchar,
  	"version_testimonials_copy_title" varchar,
  	"version_testimonials_copy_intro" varchar,
  	"version_testimonials_copy_label" varchar,
  	"version_testimonials_copy_placeholder" varchar,
  	"version_testimonials_copy_note" varchar,
  	"version_testimonials_copy_previous" varchar,
  	"version_testimonials_copy_next" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_homepage_v_locales" (
  	"version_sections_process_label" varchar,
  	"version_sections_process_title" varchar,
  	"version_sections_process_intro" varchar,
  	"version_sections_services_label" varchar,
  	"version_sections_services_title" varchar,
  	"version_sections_portfolio_label" varchar,
  	"version_sections_portfolio_title" varchar,
  	"version_sections_demo" varchar,
  	"version_sections_all" varchar,
  	"version_sections_preview" varchar,
  	"version_sections_close" varchar,
  	"version_sections_transparency_label" varchar,
  	"version_sections_transparency_title" varchar,
  	"version_sections_transparency_text" varchar,
  	"version_sections_transparency_panel" varchar,
  	"version_sections_transparency_note" varchar,
  	"version_sections_progress_label" varchar,
  	"version_sections_progress_title" varchar,
  	"version_sections_phase" varchar,
  	"version_sections_updated" varchar,
  	"version_sections_news_label" varchar,
  	"version_sections_news_title" varchar,
  	"version_sections_read" varchar,
  	"version_sections_sample" varchar,
  	"version_preview_notice" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_permissions_actions" ADD CONSTRAINT "users_permissions_actions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_permissions" ADD CONSTRAINT "users_permissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_categories_locales" ADD CONSTRAINT "project_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_gallery" ADD CONSTRAINT "news_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_gallery" ADD CONSTRAINT "news_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_gallery_locales" ADD CONSTRAINT "news_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_version_gallery" ADD CONSTRAINT "_news_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_version_gallery" ADD CONSTRAINT "_news_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_version_gallery_locales" ADD CONSTRAINT "_news_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_locales" ADD CONSTRAINT "_news_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery_locales" ADD CONSTRAINT "projects_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery_locales" ADD CONSTRAINT "_projects_v_version_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_version_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_category_id_project_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "slides" ADD CONSTRAINT "slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "slides_locales" ADD CONSTRAINT "slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "statistics_locales" ADD CONSTRAINT "statistics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_categories_fk" FOREIGN KEY ("project_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_slides_fk" FOREIGN KEY ("slides_id") REFERENCES "public"."slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_statistics_fk" FOREIGN KEY ("statistics_id") REFERENCES "public"."statistics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_paragraphs" ADD CONSTRAINT "about_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_paragraphs_locales" ADD CONSTRAINT "about_paragraphs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_paragraphs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_locales" ADD CONSTRAINT "about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_paragraphs" ADD CONSTRAINT "_about_v_version_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_paragraphs_locales" ADD CONSTRAINT "_about_v_version_paragraphs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v_version_paragraphs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_locales" ADD CONSTRAINT "_about_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_nav" ADD CONSTRAINT "site_settings_copy_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_slides_value" ADD CONSTRAINT "site_settings_copy_slides_value_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_copy_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_slides" ADD CONSTRAINT "site_settings_copy_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_footer_titles" ADD CONSTRAINT "site_settings_copy_footer_titles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_copy_footer_links" ADD CONSTRAINT "site_settings_copy_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_symbol_logo_id_media_id_fk" FOREIGN KEY ("symbol_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_full_logo_id_media_id_fk" FOREIGN KEY ("full_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_nav" ADD CONSTRAINT "_site_settings_v_version_copy_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_slides_value" ADD CONSTRAINT "_site_settings_v_version_copy_slides_value_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_copy_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_slides" ADD CONSTRAINT "_site_settings_v_version_copy_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_footer_titles" ADD CONSTRAINT "_site_settings_v_version_copy_footer_titles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_copy_footer_links" ADD CONSTRAINT "_site_settings_v_version_copy_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_symbol_logo_id_media_id_fk" FOREIGN KEY ("version_symbol_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_full_logo_id_media_id_fk" FOREIGN KEY ("version_full_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_stages_value" ADD CONSTRAINT "homepage_sections_stages_value_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_stages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_stages_value_locales" ADD CONSTRAINT "homepage_sections_stages_value_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_stages_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_stages" ADD CONSTRAINT "homepage_sections_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_categories" ADD CONSTRAINT "homepage_sections_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_categories_locales" ADD CONSTRAINT "homepage_sections_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_service_descriptions" ADD CONSTRAINT "homepage_sections_service_descriptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_service_descriptions_locales" ADD CONSTRAINT "homepage_sections_service_descriptions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_service_descriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_transparency_items" ADD CONSTRAINT "homepage_sections_transparency_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_transparency_items_locales" ADD CONSTRAINT "homepage_sections_transparency_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_transparency_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_metrics_value" ADD CONSTRAINT "homepage_sections_metrics_value_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_metrics" ADD CONSTRAINT "homepage_sections_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_testimonials_copy_quotes" ADD CONSTRAINT "homepage_testimonials_copy_quotes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_stages_value" ADD CONSTRAINT "_homepage_v_version_sections_stages_value_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections_stages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_stages_value_locales" ADD CONSTRAINT "_homepage_v_version_sections_stages_value_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections_stages_value"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_stages" ADD CONSTRAINT "_homepage_v_version_sections_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_categories" ADD CONSTRAINT "_homepage_v_version_sections_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_categories_locales" ADD CONSTRAINT "_homepage_v_version_sections_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_service_descriptions" ADD CONSTRAINT "_homepage_v_version_sections_service_descriptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_service_descriptions_locales" ADD CONSTRAINT "_homepage_v_version_sections_service_descriptions_locales_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections_service_descriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_transparency_items" ADD CONSTRAINT "_homepage_v_version_sections_transparency_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_transparency_items_locales" ADD CONSTRAINT "_homepage_v_version_sections_transparency_items_locales_p_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections_transparency_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_metrics_value" ADD CONSTRAINT "_homepage_v_version_sections_metrics_value_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_metrics" ADD CONSTRAINT "_homepage_v_version_sections_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_testimonials_copy_quotes" ADD CONSTRAINT "_homepage_v_version_testimonials_copy_quotes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_locales" ADD CONSTRAINT "_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_permissions_actions_order_idx" ON "users_permissions_actions" USING btree ("order");
  CREATE INDEX "users_permissions_actions_parent_idx" ON "users_permissions_actions" USING btree ("parent_id");
  CREATE INDEX "users_permissions_order_idx" ON "users_permissions" USING btree ("_order");
  CREATE INDEX "users_permissions_parent_id_idx" ON "users_permissions" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");
  CREATE UNIQUE INDEX "media_source_key_idx" ON "media" USING btree ("source_key");
  CREATE UNIQUE INDEX "media_source_hash_idx" ON "media" USING btree ("source_hash");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "project_categories_source_key_idx" ON "project_categories" USING btree ("source_key");
  CREATE INDEX "project_categories_order_idx" ON "project_categories" USING btree ("order");
  CREATE INDEX "project_categories_updated_at_idx" ON "project_categories" USING btree ("updated_at");
  CREATE INDEX "project_categories_created_at_idx" ON "project_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "project_categories_locales_locale_parent_id_unique" ON "project_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "project_categories_locales_parent_id_idx" ON "project_categories_locales" USING btree ("_parent_id");
  CREATE INDEX "news_gallery_order_idx" ON "news_gallery" USING btree ("_order");
  CREATE INDEX "news_gallery_parent_id_idx" ON "news_gallery" USING btree ("_parent_id");
  CREATE INDEX "news_gallery_image_idx" ON "news_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "news_gallery_locales_locale_parent_id_unique" ON "news_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "news_gallery_locales_parent_id_idx" ON "news_gallery_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "news_source_key_idx" ON "news" USING btree ("source_key");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_image_idx" ON "news" USING btree ("image_id");
  CREATE INDEX "news_published_at_idx" ON "news" USING btree ("published_at");
  CREATE INDEX "news_author_idx" ON "news" USING btree ("author_id");
  CREATE INDEX "news_seo_seo_image_idx" ON "news" USING btree ("seo_image_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE UNIQUE INDEX "news_locales_locale_parent_id_unique" ON "news_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "news_locales_parent_id_idx" ON "news_locales" USING btree ("_parent_id");
  CREATE INDEX "_news_v_version_gallery_order_idx" ON "_news_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_news_v_version_gallery_parent_id_idx" ON "_news_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_news_v_version_gallery_image_idx" ON "_news_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_news_v_version_gallery_locales_locale_parent_id_unique" ON "_news_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_v_version_gallery_locales_parent_id_idx" ON "_news_v_version_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_source_key_idx" ON "_news_v" USING btree ("version_source_key");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_image_idx" ON "_news_v" USING btree ("version_image_id");
  CREATE INDEX "_news_v_version_version_published_at_idx" ON "_news_v" USING btree ("version_published_at");
  CREATE INDEX "_news_v_version_version_author_idx" ON "_news_v" USING btree ("version_author_id");
  CREATE INDEX "_news_v_version_seo_version_seo_image_idx" ON "_news_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_snapshot_idx" ON "_news_v" USING btree ("snapshot");
  CREATE INDEX "_news_v_published_locale_idx" ON "_news_v" USING btree ("published_locale");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_news_v_locales_locale_parent_id_unique" ON "_news_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_v_locales_parent_id_idx" ON "_news_v_locales" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_gallery_locales_locale_parent_id_unique" ON "projects_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_gallery_locales_parent_id_idx" ON "projects_gallery_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_source_key_idx" ON "projects" USING btree ("source_key");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_image_idx" ON "projects" USING btree ("image_id");
  CREATE INDEX "projects_author_idx" ON "projects" USING btree ("author_id");
  CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category_id");
  CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");
  CREATE INDEX "projects_seo_seo_image_idx" ON "projects" USING btree ("seo_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_locales_parent_id_idx" ON "projects_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "_projects_v_version_gallery_locales_locale_parent_id_unique" ON "_projects_v_version_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_version_gallery_locales_parent_id_idx" ON "_projects_v_version_gallery_locales" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_source_key_idx" ON "_projects_v" USING btree ("version_source_key");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_image_idx" ON "_projects_v" USING btree ("version_image_id");
  CREATE INDEX "_projects_v_version_version_author_idx" ON "_projects_v" USING btree ("version_author_id");
  CREATE INDEX "_projects_v_version_version_category_idx" ON "_projects_v" USING btree ("version_category_id");
  CREATE INDEX "_projects_v_version_version_status_idx" ON "_projects_v" USING btree ("version_status");
  CREATE INDEX "_projects_v_version_seo_version_seo_image_idx" ON "_projects_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_locales_parent_id_idx" ON "_projects_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "slides_source_key_idx" ON "slides" USING btree ("source_key");
  CREATE INDEX "slides_image_idx" ON "slides" USING btree ("image_id");
  CREATE INDEX "slides_order_idx" ON "slides" USING btree ("order");
  CREATE INDEX "slides_active_idx" ON "slides" USING btree ("active");
  CREATE INDEX "slides_updated_at_idx" ON "slides" USING btree ("updated_at");
  CREATE INDEX "slides_created_at_idx" ON "slides" USING btree ("created_at");
  CREATE UNIQUE INDEX "slides_locales_locale_parent_id_unique" ON "slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "slides_locales_parent_id_idx" ON "slides_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "testimonials_source_key_idx" ON "testimonials" USING btree ("source_key");
  CREATE INDEX "testimonials_portrait_idx" ON "testimonials" USING btree ("portrait_id");
  CREATE INDEX "testimonials_order_idx" ON "testimonials" USING btree ("order");
  CREATE INDEX "testimonials_active_idx" ON "testimonials" USING btree ("active");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_locales_parent_id_idx" ON "testimonials_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "statistics_source_key_idx" ON "statistics" USING btree ("source_key");
  CREATE INDEX "statistics_order_idx" ON "statistics" USING btree ("order");
  CREATE INDEX "statistics_active_idx" ON "statistics" USING btree ("active");
  CREATE INDEX "statistics_updated_at_idx" ON "statistics" USING btree ("updated_at");
  CREATE INDEX "statistics_created_at_idx" ON "statistics" USING btree ("created_at");
  CREATE UNIQUE INDEX "statistics_locales_locale_parent_id_unique" ON "statistics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "statistics_locales_parent_id_idx" ON "statistics_locales" USING btree ("_parent_id");
  CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_project_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("project_categories_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("slides_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_statistics_id_idx" ON "payload_locked_documents_rels" USING btree ("statistics_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "about_paragraphs_order_idx" ON "about_paragraphs" USING btree ("_order");
  CREATE INDEX "about_paragraphs_parent_id_idx" ON "about_paragraphs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_paragraphs_locales_locale_parent_id_unique" ON "about_paragraphs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_paragraphs_locales_parent_id_idx" ON "about_paragraphs_locales" USING btree ("_parent_id");
  CREATE INDEX "about_image_idx" ON "about" USING btree ("image_id");
  CREATE INDEX "about_seo_seo_image_idx" ON "about" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "about_locales_locale_parent_id_unique" ON "about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_locales_parent_id_idx" ON "about_locales" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_paragraphs_order_idx" ON "_about_v_version_paragraphs" USING btree ("_order");
  CREATE INDEX "_about_v_version_paragraphs_parent_id_idx" ON "_about_v_version_paragraphs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_about_v_version_paragraphs_locales_locale_parent_id_unique" ON "_about_v_version_paragraphs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_v_version_paragraphs_locales_parent_id_idx" ON "_about_v_version_paragraphs_locales" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_version_image_idx" ON "_about_v" USING btree ("version_image_id");
  CREATE INDEX "_about_v_version_seo_version_seo_image_idx" ON "_about_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_about_v_locales_locale_parent_id_unique" ON "_about_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_v_locales_parent_id_idx" ON "_about_v_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_copy_nav_order_idx" ON "site_settings_copy_nav" USING btree ("_order");
  CREATE INDEX "site_settings_copy_nav_parent_id_idx" ON "site_settings_copy_nav" USING btree ("_parent_id");
  CREATE INDEX "site_settings_copy_slides_value_order_idx" ON "site_settings_copy_slides_value" USING btree ("_order");
  CREATE INDEX "site_settings_copy_slides_value_parent_id_idx" ON "site_settings_copy_slides_value" USING btree ("_parent_id");
  CREATE INDEX "site_settings_copy_slides_order_idx" ON "site_settings_copy_slides" USING btree ("_order");
  CREATE INDEX "site_settings_copy_slides_parent_id_idx" ON "site_settings_copy_slides" USING btree ("_parent_id");
  CREATE INDEX "site_settings_copy_footer_titles_order_idx" ON "site_settings_copy_footer_titles" USING btree ("_order");
  CREATE INDEX "site_settings_copy_footer_titles_parent_id_idx" ON "site_settings_copy_footer_titles" USING btree ("_parent_id");
  CREATE INDEX "site_settings_copy_footer_links_order_idx" ON "site_settings_copy_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_copy_footer_links_parent_id_idx" ON "site_settings_copy_footer_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_symbol_logo_idx" ON "site_settings" USING btree ("symbol_logo_id");
  CREATE INDEX "site_settings_full_logo_idx" ON "site_settings" USING btree ("full_logo_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_nav_order_idx" ON "_site_settings_v_version_copy_nav" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_copy_nav_parent_id_idx" ON "_site_settings_v_version_copy_nav" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_slides_value_order_idx" ON "_site_settings_v_version_copy_slides_value" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_copy_slides_value_parent_id_idx" ON "_site_settings_v_version_copy_slides_value" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_slides_order_idx" ON "_site_settings_v_version_copy_slides" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_copy_slides_parent_id_idx" ON "_site_settings_v_version_copy_slides" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_footer_titles_order_idx" ON "_site_settings_v_version_copy_footer_titles" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_copy_footer_titles_parent_id_idx" ON "_site_settings_v_version_copy_footer_titles" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_copy_footer_links_order_idx" ON "_site_settings_v_version_copy_footer_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_copy_footer_links_parent_id_idx" ON "_site_settings_v_version_copy_footer_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version_logo_idx" ON "_site_settings_v" USING btree ("version_logo_id");
  CREATE INDEX "_site_settings_v_version_version_symbol_logo_idx" ON "_site_settings_v" USING btree ("version_symbol_logo_id");
  CREATE INDEX "_site_settings_v_version_version_full_logo_idx" ON "_site_settings_v" USING btree ("version_full_logo_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_locales_parent_id_idx" ON "_site_settings_v_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_stages_value_order_idx" ON "homepage_sections_stages_value" USING btree ("_order");
  CREATE INDEX "homepage_sections_stages_value_parent_id_idx" ON "homepage_sections_stages_value" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_sections_stages_value_locales_locale_parent_id_uniq" ON "homepage_sections_stages_value_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_sections_stages_value_locales_parent_id_idx" ON "homepage_sections_stages_value_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_stages_order_idx" ON "homepage_sections_stages" USING btree ("_order");
  CREATE INDEX "homepage_sections_stages_parent_id_idx" ON "homepage_sections_stages" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_categories_order_idx" ON "homepage_sections_categories" USING btree ("_order");
  CREATE INDEX "homepage_sections_categories_parent_id_idx" ON "homepage_sections_categories" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_sections_categories_locales_locale_parent_id_unique" ON "homepage_sections_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_sections_categories_locales_parent_id_idx" ON "homepage_sections_categories_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_service_descriptions_order_idx" ON "homepage_sections_service_descriptions" USING btree ("_order");
  CREATE INDEX "homepage_sections_service_descriptions_parent_id_idx" ON "homepage_sections_service_descriptions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_sections_service_descriptions_locales_locale_parent" ON "homepage_sections_service_descriptions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_sections_service_descriptions_locales_parent_id_idx" ON "homepage_sections_service_descriptions_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_transparency_items_order_idx" ON "homepage_sections_transparency_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_transparency_items_parent_id_idx" ON "homepage_sections_transparency_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_sections_transparency_items_locales_locale_parent_i" ON "homepage_sections_transparency_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_sections_transparency_items_locales_parent_id_idx" ON "homepage_sections_transparency_items_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_metrics_value_order_idx" ON "homepage_sections_metrics_value" USING btree ("_order");
  CREATE INDEX "homepage_sections_metrics_value_parent_id_idx" ON "homepage_sections_metrics_value" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_metrics_order_idx" ON "homepage_sections_metrics" USING btree ("_order");
  CREATE INDEX "homepage_sections_metrics_parent_id_idx" ON "homepage_sections_metrics" USING btree ("_parent_id");
  CREATE INDEX "homepage_testimonials_copy_quotes_order_idx" ON "homepage_testimonials_copy_quotes" USING btree ("_order");
  CREATE INDEX "homepage_testimonials_copy_quotes_parent_id_idx" ON "homepage_testimonials_copy_quotes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_locales_parent_id_idx" ON "homepage_locales" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_stages_value_order_idx" ON "_homepage_v_version_sections_stages_value" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_stages_value_parent_id_idx" ON "_homepage_v_version_sections_stages_value" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_sections_stages_value_locales_locale_par" ON "_homepage_v_version_sections_stages_value_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_sections_stages_value_locales_parent_idx" ON "_homepage_v_version_sections_stages_value_locales" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_stages_order_idx" ON "_homepage_v_version_sections_stages" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_stages_parent_id_idx" ON "_homepage_v_version_sections_stages" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_categories_order_idx" ON "_homepage_v_version_sections_categories" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_categories_parent_id_idx" ON "_homepage_v_version_sections_categories" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_sections_categories_locales_locale_paren" ON "_homepage_v_version_sections_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_sections_categories_locales_parent_i_idx" ON "_homepage_v_version_sections_categories_locales" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_service_descriptions_order_idx" ON "_homepage_v_version_sections_service_descriptions" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_service_descriptions_parent_id_idx" ON "_homepage_v_version_sections_service_descriptions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_sections_service_descriptions_locales_lo" ON "_homepage_v_version_sections_service_descriptions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_sections_service_descriptions_locale_idx" ON "_homepage_v_version_sections_service_descriptions_locales" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_transparency_items_order_idx" ON "_homepage_v_version_sections_transparency_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_transparency_items_parent_id_idx" ON "_homepage_v_version_sections_transparency_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_sections_transparency_items_locales_loca" ON "_homepage_v_version_sections_transparency_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_sections_transparency_items_locales__idx" ON "_homepage_v_version_sections_transparency_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_metrics_value_order_idx" ON "_homepage_v_version_sections_metrics_value" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_metrics_value_parent_id_idx" ON "_homepage_v_version_sections_metrics_value" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_metrics_order_idx" ON "_homepage_v_version_sections_metrics" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_metrics_parent_id_idx" ON "_homepage_v_version_sections_metrics" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_testimonials_copy_quotes_order_idx" ON "_homepage_v_version_testimonials_copy_quotes" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_testimonials_copy_quotes_parent_id_idx" ON "_homepage_v_version_testimonials_copy_quotes" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_homepage_v_locales_locale_parent_id_unique" ON "_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_locales_parent_id_idx" ON "_homepage_v_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_permissions_actions" CASCADE;
  DROP TABLE "users_permissions" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "project_categories" CASCADE;
  DROP TABLE "project_categories_locales" CASCADE;
  DROP TABLE "news_gallery" CASCADE;
  DROP TABLE "news_gallery_locales" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "news_locales" CASCADE;
  DROP TABLE "_news_v_version_gallery" CASCADE;
  DROP TABLE "_news_v_version_gallery_locales" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "_news_v_locales" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects_gallery_locales" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v_version_gallery_locales" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "slides" CASCADE;
  DROP TABLE "slides_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "statistics" CASCADE;
  DROP TABLE "statistics_locales" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "about_paragraphs" CASCADE;
  DROP TABLE "about_paragraphs_locales" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "about_locales" CASCADE;
  DROP TABLE "_about_v_version_paragraphs" CASCADE;
  DROP TABLE "_about_v_version_paragraphs_locales" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  DROP TABLE "_about_v_locales" CASCADE;
  DROP TABLE "site_settings_copy_nav" CASCADE;
  DROP TABLE "site_settings_copy_slides_value" CASCADE;
  DROP TABLE "site_settings_copy_slides" CASCADE;
  DROP TABLE "site_settings_copy_footer_titles" CASCADE;
  DROP TABLE "site_settings_copy_footer_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "_site_settings_v_version_copy_nav" CASCADE;
  DROP TABLE "_site_settings_v_version_copy_slides_value" CASCADE;
  DROP TABLE "_site_settings_v_version_copy_slides" CASCADE;
  DROP TABLE "_site_settings_v_version_copy_footer_titles" CASCADE;
  DROP TABLE "_site_settings_v_version_copy_footer_links" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  DROP TABLE "homepage_sections_stages_value" CASCADE;
  DROP TABLE "homepage_sections_stages_value_locales" CASCADE;
  DROP TABLE "homepage_sections_stages" CASCADE;
  DROP TABLE "homepage_sections_categories" CASCADE;
  DROP TABLE "homepage_sections_categories_locales" CASCADE;
  DROP TABLE "homepage_sections_service_descriptions" CASCADE;
  DROP TABLE "homepage_sections_service_descriptions_locales" CASCADE;
  DROP TABLE "homepage_sections_transparency_items" CASCADE;
  DROP TABLE "homepage_sections_transparency_items_locales" CASCADE;
  DROP TABLE "homepage_sections_metrics_value" CASCADE;
  DROP TABLE "homepage_sections_metrics" CASCADE;
  DROP TABLE "homepage_testimonials_copy_quotes" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "_homepage_v_version_sections_stages_value" CASCADE;
  DROP TABLE "_homepage_v_version_sections_stages_value_locales" CASCADE;
  DROP TABLE "_homepage_v_version_sections_stages" CASCADE;
  DROP TABLE "_homepage_v_version_sections_categories" CASCADE;
  DROP TABLE "_homepage_v_version_sections_categories_locales" CASCADE;
  DROP TABLE "_homepage_v_version_sections_service_descriptions" CASCADE;
  DROP TABLE "_homepage_v_version_sections_service_descriptions_locales" CASCADE;
  DROP TABLE "_homepage_v_version_sections_transparency_items" CASCADE;
  DROP TABLE "_homepage_v_version_sections_transparency_items_locales" CASCADE;
  DROP TABLE "_homepage_v_version_sections_metrics_value" CASCADE;
  DROP TABLE "_homepage_v_version_sections_metrics" CASCADE;
  DROP TABLE "_homepage_v_version_testimonials_copy_quotes" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_permissions_actions";
  DROP TYPE "public"."enum_users_permissions_section";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum__news_v_published_locale";
  DROP TYPE "public"."project_lifecycle";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_audit_logs_outcome";`)
}
