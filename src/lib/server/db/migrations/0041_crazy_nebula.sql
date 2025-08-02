PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_teacher_assign` (
	`user_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`school_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `subject_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_teacher_assign`("user_id", "subject_id", "school_id") SELECT "user_id", "subject_id", "school_id" FROM `teacher_assign`;--> statement-breakpoint
DROP TABLE `teacher_assign`;--> statement-breakpoint
ALTER TABLE `__new_teacher_assign` RENAME TO `teacher_assign`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `teacher_assign_user_index` ON `teacher_assign` (`user_id`);--> statement-breakpoint
CREATE INDEX `teacher_assign_subject_index` ON `teacher_assign` (`subject_id`);--> statement-breakpoint
CREATE INDEX `teacher_assign_school_index` ON `teacher_assign` (`school_id`);