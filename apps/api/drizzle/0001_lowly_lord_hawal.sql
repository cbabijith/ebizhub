ALTER TABLE "service_categories" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "service_categories" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "profession" text NOT NULL;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "qualification" text;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "languages" text;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "whatsapp" text;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "availability" text;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
