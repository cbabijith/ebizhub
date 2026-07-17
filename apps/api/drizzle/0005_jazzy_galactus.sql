ALTER TABLE "businesses" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "service_providers" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;