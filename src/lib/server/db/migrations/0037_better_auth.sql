-- Migrate from the Lucia-style session auth to better-auth.
-- Hand-written: drizzle-kit would add NOT NULL columns without defaults (fails on a non-empty
-- table) and would need a full `user` table rebuild. Existing bcrypt hashes are copied into
-- `account` so every user keeps their password. Old sessions are dropped; users sign in once.
CREATE TABLE `account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_index` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_index` ON `verification` (`identifier`);--> statement-breakpoint
ALTER TABLE `user` ADD `email` text;--> statement-breakpoint
ALTER TABLE `user` ADD `email_verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `display_username` text;--> statement-breakpoint
ALTER TABLE `user` ADD `auth_created_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `auth_updated_at` integer;--> statement-breakpoint
UPDATE `user` SET
	`email` = 'user-' || `user_id` || '@lms.invalid',
	`auth_created_at` = coalesce(unixepoch(`created_at`), unixepoch()) * 1000,
	`auth_updated_at` = coalesce(unixepoch(`created_at`), unixepoch()) * 1000;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
INSERT INTO `account` (`account_id`, `provider_id`, `user_id`, `password`, `created_at`, `updated_at`)
SELECT CAST(`user_id` AS text), 'credential', `user_id`, `password`, unixepoch() * 1000, unixepoch() * 1000
FROM `user`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
CREATE TABLE `session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_index` ON `session` (`user_id`);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `password`;
