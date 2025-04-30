PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`user_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`avatar` text,
	`school_id` integer,
	`role_id` integer NOT NULL,
	`fullname` text NOT NULL,
	`dob` text NOT NULL,
	`grades_id` integer,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `user_role`(`role_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grades_id`) REFERENCES `grades`(`grades_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("user_id", "avatar", "school_id", "role_id", "fullname", "dob", "grades_id", "username", "password", "created_at") SELECT "user_id", "avatar", "school_id", "role_id", "fullname", "dob", "grades_id", "username", "password", "created_at" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `school_index` ON `user` (`school_id`);--> statement-breakpoint
CREATE INDEX `role_index` ON `user` (`role_id`);--> statement-breakpoint
CREATE INDEX `grades_index` ON `user` (`grades_id`);