CREATE TABLE IF NOT EXISTS "search_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword" text NOT NULL,
	"result_count" integer DEFAULT 0 NOT NULL,
	"business_count" integer DEFAULT 0 NOT NULL,
	"provider_count" integer DEFAULT 0 NOT NULL,
	"category_count" integer DEFAULT 0 NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
