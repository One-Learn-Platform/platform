PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assignment` (
	`assignment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chapter` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assignment`("assignment_id", "chapter", "subject_id", "title", "description", "attachment", "school_id", "created_at") SELECT "assignment_id", "chapter", "subject_id", "title", "description", "attachment", "school_id", "created_at" FROM `assignment`;--> statement-breakpoint
DROP TABLE `assignment`;--> statement-breakpoint
ALTER TABLE `__new_assignment` RENAME TO `assignment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `assignment_subject_index` ON `assignment` (`subject_id`);--> statement-breakpoint
CREATE INDEX `assignment_school_index` ON `assignment` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_forum` (
	`forum_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`chapter` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_forum`("forum_id", "subject_id", "chapter", "user_id", "title", "description", "attachment", "school_id", "created_at") SELECT "forum_id", "subject_id", "chapter", "user_id", "title", "description", "attachment", "school_id", "created_at" FROM `forum`;--> statement-breakpoint
DROP TABLE `forum`;--> statement-breakpoint
ALTER TABLE `__new_forum` RENAME TO `forum`;--> statement-breakpoint
CREATE INDEX `forum_user_index` ON `forum` (`user_id`);--> statement-breakpoint
CREATE INDEX `forum_school_index` ON `forum` (`school_id`);--> statement-breakpoint
CREATE INDEX `forum_subject_index` ON `forum` (`subject_id`);