PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_grades` (
	`grades_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_grades`("grades_id", "level") SELECT "grades_id", "level" FROM `grades`;--> statement-breakpoint
DROP TABLE `grades`;--> statement-breakpoint
ALTER TABLE `__new_grades` RENAME TO `grades`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_subject` (
	`subject_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_code` text NOT NULL,
	`teacher_id` integer NOT NULL,
	`name` text NOT NULL,
	`subject_type_id` integer NOT NULL,
	`chapter_count` integer NOT NULL,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_type_id`) REFERENCES `subject_type`(`subject_type_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subject`("subject_id", "subject_code", "teacher_id", "name", "subject_type_id", "chapter_count", "school_id") SELECT "subject_id", "subject_code", "teacher_id", "name", "subject_type_id", "chapter_count", "school_id" FROM `subject`;--> statement-breakpoint
DROP TABLE `subject`;--> statement-breakpoint
ALTER TABLE `__new_subject` RENAME TO `subject`;--> statement-breakpoint
CREATE INDEX `teacher_index` ON `subject` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `subject_school_index` ON `subject` (`school_id`);