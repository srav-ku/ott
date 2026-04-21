PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`poster_path` text,
	`backdrop_path` text,
	`overview` text,
	`rating` real,
	`last_updated` integer,
	`available_languages` text,
	`has_links` integer DEFAULT false
);
--> statement-breakpoint
INSERT INTO `__new_movies`("id", "tmdb_id", "title", "type", "poster_path", "backdrop_path", "overview", "rating", "last_updated", "available_languages", "has_links") SELECT "id", "tmdb_id", "title", "type", "poster_path", "backdrop_path", "overview", "rating", "last_updated", "available_languages", "has_links" FROM `movies`;--> statement-breakpoint
DROP TABLE `movies`;--> statement-breakpoint
ALTER TABLE `__new_movies` RENAME TO `movies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `movies_tmdb_id_unique` ON `movies` (`tmdb_id`);--> statement-breakpoint
ALTER TABLE `episodes` ADD `tmdb_series_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `episodes` ADD `overview` text;--> statement-breakpoint
ALTER TABLE `episodes` ADD `still_path` text;--> statement-breakpoint
ALTER TABLE `episodes` ADD `vote_average` real;--> statement-breakpoint
ALTER TABLE `episodes` ADD `last_updated` integer;