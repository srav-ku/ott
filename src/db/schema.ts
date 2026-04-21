import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';

export const movies = sqliteTable('movies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tmdb_id: text('tmdb_id').unique().notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // movie/tv
  poster_path: text('poster_path'),
  backdrop_path: text('backdrop_path'),
  overview: text('overview'),
  rating: real('rating'),
  last_updated: integer('last_updated', { mode: 'timestamp' }),
  available_languages: text('available_languages'), // text JSON
  has_links: integer('has_links', { mode: 'boolean' }).default(false),
});

export const episodes = sqliteTable('episodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  series_id: integer('series_id').references(() => movies.id),
  tmdb_series_id: text('tmdb_series_id').notNull(),
  season_number: integer('season_number').notNull(),
  episode_number: integer('episode_number').notNull(),
  title: text('title').notNull(),
  overview: text('overview'),
  still_path: text('still_path'),
  vote_average: real('vote_average'),
  last_updated: integer('last_updated', { mode: 'timestamp' }),
}, (table) => {
  return {
    unq: unique().on(table.tmdb_series_id, table.season_number, table.episode_number)
  };
});

export const links = sqliteTable('links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  movie_id: integer('movie_id').references(() => movies.id),
  episode_id: integer('episode_id').references(() => episodes.id),
  type: text('type').notNull(), // direct/extract
  quality: text('quality').notNull(), // 720p/1080p
  url: text('url').notNull(),
  languages: text('languages'), // JSON text
});

export const linkQueue = sqliteTable('link_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tmdb_id: text('tmdb_id').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'), // pending/filled/ignored
  priority_score: integer('priority_score').default(0),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  last_checked_at: integer('last_checked_at', { mode: 'timestamp' }),
});
