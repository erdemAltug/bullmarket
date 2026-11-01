import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/** Watchlist symbols per user (Clerk/auth-ready via userId). */
export const watchlists = pgTable(
  'watchlists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    symbol: text('symbol').notNull(),
    assetType: text('asset_type').notNull(), // BIST | CRYPTO | FX
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('user_symbol_idx').on(table.userId, table.symbol)]
);

/** Portfolio buy lots / positions. */
export const portfolioTransactions = pgTable('portfolio_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull().default(''),
  assetClass: text('asset_class').notNull().default('bist'), // bist | crypto | gold
  buyPrice: numeric('buy_price', { precision: 12, scale: 4 }).notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 4 }).notNull(),
  currency: text('currency').notNull().default('TRY'), // TRY | USD
  boughtAt: timestamp('bought_at', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Price / % change alerts.
 * condition: price_above | price_below | change_above | change_below | rsi_above | rsi_below
 * (maps ABOVE/BELOW style for price_* kinds)
 */
export const priceAlerts = pgTable('price_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  displaySymbol: text('display_symbol').notNull(),
  targetPrice: numeric('target_price', { precision: 12, scale: 4 }).notNull(),
  condition: text('condition').notNull(),
  isTriggered: boolean('is_triggered').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Opt-in morning digest (top scores) — one row per signed-in user. */
export const digestSubscriptions = pgTable('digest_subscriptions', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull(),
  active: boolean('active').default(true).notNull(),
  /** Opaque token for the one-click unsubscribe link. */
  token: uuid('token').defaultRandom().notNull(),
  lastSentAt: timestamp('last_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Pro waitlist — interest signal before any pricing exists. */
export const proWaitlist = pgTable(
  'pro_waitlist',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    userId: text('user_id'),
    source: text('source').notNull().default('unknown'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex('pro_waitlist_email_idx').on(table.email)]
);

export type WatchlistRow = typeof watchlists.$inferSelect;
export type PortfolioRow = typeof portfolioTransactions.$inferSelect;
export type PriceAlertRow = typeof priceAlerts.$inferSelect;
