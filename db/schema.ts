import { pgTable, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'
import type { Election, Selection } from '../src/lib/election'
export const settings = pgTable('election_settings', {
  id: integer('id').primaryKey(),
  data: jsonb('data').$type<Election>().notNull(),
  version: integer('version').notNull().default(1),
})
export const ballots = pgTable('ballots', {
  id: text('id').primaryKey(),
  voterHash: text('voter_hash').notNull().unique(),
  selections: jsonb('selections').$type<Selection[]>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
export const sessions = pgTable('admin_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})
export const attempts = pgTable('login_attempts', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})
