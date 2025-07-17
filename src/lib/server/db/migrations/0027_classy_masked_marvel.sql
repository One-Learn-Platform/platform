PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_submission` (
	`submission_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`assignment_id` integer NOT NULL,
	`score` integer NOT NULL,
	`content` text NOT NULL,
	`attachment` text,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`assignment_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_submission`("submission_id", "user_id", "assignment_id", "score", "content", "attachment", "school_id", "created_at") SELECT "submission_id", "user_id", "assignment_id", "score", "content", "attachment", "school_id", "created_at" FROM `submission`;--> statement-breakpoint
DROP TABLE `submission`;--> statement-breakpoint
ALTER TABLE `__new_submission` RENAME TO `submission`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `submission_user_index` ON `submission` (`user_id`);--> statement-breakpoint
CREATE INDEX `submission_assignment_index` ON `submission` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `submission_school_index` ON `submission` (`school_id`);