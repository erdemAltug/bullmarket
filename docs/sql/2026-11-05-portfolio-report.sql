-- Weekly portfolio check-up opt-in (matches src/db/schema.ts).
-- Run once in the Neon SQL editor (production branch). Safe to re-run.

CREATE TABLE IF NOT EXISTS portfolio_report_subscriptions (
  user_id       text PRIMARY KEY,
  email         text NOT NULL,
  active        boolean NOT NULL DEFAULT true,
  token         uuid NOT NULL DEFAULT gen_random_uuid(),
  last_sent_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
