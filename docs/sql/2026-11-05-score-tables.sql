-- Server-side score scan tables (matches src/db/schema.ts).
-- Run once in the Neon SQL editor (production branch). Safe to re-run.

CREATE TABLE IF NOT EXISTS market_scores (
  symbol          text PRIMARY KEY,
  display_symbol  text NOT NULL,
  name            text NOT NULL DEFAULT '',
  category        text NOT NULL,
  score           integer NOT NULL,
  price           double precision NOT NULL,
  change_percent  double precision NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS market_scores_category_score_idx
  ON market_scores (category, score);

CREATE TABLE IF NOT EXISTS score_history (
  symbol      text NOT NULL,
  day         date NOT NULL,
  score       integer NOT NULL,
  price       double precision NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (symbol, day)
);
