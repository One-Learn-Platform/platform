CREATE TABLE `rate_limit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`count` integer NOT NULL,
	`last_request` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limit_key_unique` ON `rate_limit` (`key`);--> statement-breakpoint
ALTER TABLE `session` ADD `impersonated_by` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `auth_role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `banned` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_expires` integer;--> statement-breakpoint
-- Super admins (role_id 1) become better-auth admins.
UPDATE `user` SET `auth_role` = 'admin' WHERE `role_id` = 1;
