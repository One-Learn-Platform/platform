PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subject` (
	`subject_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_code` text NOT NULL,
	`grades_id` integer NOT NULL,
	`name` text NOT NULL,
	`subject_type_id` integer NOT NULL,
	`chapter_count` integer NOT NULL,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`grades_id`) REFERENCES `grades`(`grades_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_type_id`) REFERENCES `subject_type`(`subject_type_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subject`("subject_id", "subject_code", "grades_id", "name", "subject_type_id", "chapter_count", "school_id") SELECT "subject_id", "subject_code", "grades_id", "name", "subject_type_id", "chapter_count", "school_id" FROM `subject`;--> statement-breakpoint
DROP TABLE `subject`;--> statement-breakpoint
ALTER TABLE `__new_subject` RENAME TO `subject`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `subject_school_index` ON `subject` (`school_id`);--> statement-breakpoint
CREATE INDEX `subject_grades_index` ON `subject` (`grades_id`);