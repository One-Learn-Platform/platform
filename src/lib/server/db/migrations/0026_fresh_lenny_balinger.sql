PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_announcement` (
	`announcement_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_announcement`("announcement_id", "title", "content", "start_date", "end_date", "school_id", "created_at") SELECT "announcement_id", "title", "content", "start_date", "end_date", "school_id", "created_at" FROM `announcement`;--> statement-breakpoint
DROP TABLE `announcement`;--> statement-breakpoint
ALTER TABLE `__new_announcement` RENAME TO `announcement`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `announcement_school_index` ON `announcement` (`school_id`);--> statement-breakpoint
ALTER TABLE `material` DROP COLUMN `thumbnail`;