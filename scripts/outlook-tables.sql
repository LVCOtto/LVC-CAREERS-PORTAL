CREATE TABLE IF NOT EXISTS "outlook_integrations" (
  "id" serial PRIMARY KEY,
  "user_id" varchar(50) NOT NULL UNIQUE,
  "access_token" text NOT NULL,
  "refresh_token" text NOT NULL,
  "expires_at" text NOT NULL,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "created_date" text NOT NULL,
  "updated_date" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "calendar_sync_log" (
  "id" serial PRIMARY KEY,
  "user_id" varchar(50) NOT NULL,
  "source_type" text NOT NULL,
  "source_id" varchar(100) NOT NULL,
  "outlook_event_id" text NOT NULL,
  "event_title" text NOT NULL,
  "event_date" text NOT NULL,
  "synced_date" text NOT NULL,
  "last_updated" text NOT NULL
);
