import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const studio = sqliteTable('studio', { id: text('id').primaryKey(), payload: text('payload').notNull(), version: integer('version').notNull().default(0) });
