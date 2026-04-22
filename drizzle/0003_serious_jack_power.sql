CREATE TABLE `history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`tmdb_id` text NOT NULL,
	`type` text NOT NULL,
	`progress` real DEFAULT 0 NOT NULL,
	`last_watched` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `history_user_id_tmdb_id_type_unique` ON `history` (`user_id`,`tmdb_id`,`type`);--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`tmdb_id` text NOT NULL,
	`type` text NOT NULL,
	`added_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `watchlist_user_id_tmdb_id_type_unique` ON `watchlist` (`user_id`,`tmdb_id`,`type`);