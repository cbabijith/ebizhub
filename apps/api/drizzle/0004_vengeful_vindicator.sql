CREATE TABLE IF NOT EXISTS "provider_verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"submitted_by" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "provider_analytics" ADD COLUMN "phone_clicks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_analytics" ADD COLUMN "whatsapp_clicks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_analytics" ADD COLUMN "map_clicks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "service_provider_areas" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "service_provider_skills" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "provider_verification_requests" ADD CONSTRAINT "provider_verification_requests_provider_id_service_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "provider_verification_requests" ADD CONSTRAINT "provider_verification_requests_submitted_by_profiles_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "provider_verification_requests" ADD CONSTRAINT "provider_verification_requests_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sp_areas_district_idx" ON "service_provider_areas" ("district_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sp_skills_name_idx" ON "service_provider_skills" ("skill_name");