PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assignment` (
	`assignment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chapter` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`start_date` text,
	`limit_user` integer,
	`due_date` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assignment`("assignment_id", "chapter", "subject_id", "title", "description", "attachment", "start_date", "limit_user", "due_date", "school_id", "created_at") SELECT "assignment_id", "chapter", "subject_id", "title", "description", "attachment", "start_date", "limit_user", "due_date", "school_id", "created_at" FROM `assignment`;--> statement-breakpoint
DROP TABLE `assignment`;--> statement-breakpoint
ALTER TABLE `__new_assignment` RENAME TO `assignment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `assignment_subject_index` ON `assignment` (`subject_id`);--> statement-breakpoint
CREATE INDEX `assignment_school_index` ON `assignment` (`school_id`);