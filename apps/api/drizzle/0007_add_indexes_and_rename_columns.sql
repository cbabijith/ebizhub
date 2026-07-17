CREATE INDEX IF NOT EXISTS "businesses_category_idx" ON "businesses" ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "businesses_status_verified_idx" ON "businesses" ("status", "verification_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "businesses_created_at_idx" ON "businesses" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "businesses_name_idx" ON "businesses" ("business_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_providers_category_idx" ON "service_providers" ("service_category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_providers_status_verified_idx" ON "service_providers" ("status", "verification_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_providers_created_at_idx" ON "service_providers" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_providers_profession_idx" ON "service_providers" ("profession");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_analytics_business_idx" ON "business_analytics" ("business_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_analytics_provider_idx" ON "provider_analytics" ("provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interaction_logs_business_idx" ON "interaction_logs" ("business_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interaction_logs_created_at_idx" ON "interaction_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_interaction_logs_provider_idx" ON "provider_interaction_logs" ("provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_interaction_logs_created_at_idx" ON "provider_interaction_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "featured_listings_entity_idx" ON "featured_listings" ("entity_type", "entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "featured_listings_active_idx" ON "featured_listings" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_analytics_keyword_idx" ON "search_analytics" ("keyword");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_analytics_created_at_idx" ON "search_analytics" ("created_at");
