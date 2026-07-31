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

export type WatchlistRow = typeof watchlists.$inferSelect;
export type PortfolioRow = typeof portfolioTransactions.$inferSelect;
export type PriceAlertRow = typeof priceAlerts.$inferSelect;
