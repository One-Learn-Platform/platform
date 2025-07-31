CREATE TABLE `classroom` (
	`classroom_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`grades_id` integer NOT NULL,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`grades_id`) REFERENCES `grades`(`grades_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `classroom_school_index` ON `classroom` (`school_id`);--> statement-breakpoint
CREATE INDEX `classroom_grades_index` ON `classroom` (`grades_id`);--> statement-breakpoint
CREATE TABLE `schedule` (
	`schedule_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`classroom_id` integer NOT NULL,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`day_of_week` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`classroom_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `schedule_subject_index` ON `schedule` (`subject_id`);--> statement-breakpoint
CREATE INDEX `schedule_classroom_index` ON `schedule` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `schedule_school_index` ON `schedule` (`school_id`);--> statement-breakpoint
CREATE TABLE `teacher_assign` (
	`teacher_assign_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `teacher_assign_user_index` ON `teacher_assign` (`user_id`);--> statement-breakpoint
CREATE INDEX `teacher_assign_subject_index` ON `teacher_assign` (`subject_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assignment` (
	`assignment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chapter` integer NOT NULL,
	`classroom_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text,
	`quiz` integer NOT NULL,
	`start_date` text,
	`limit_user` integer,
	`due_date` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`classroom_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assignment`("assignment_id", "chapter", "classroom_id", "title", "description", "attachment", "quiz", "start_date", "limit_user", "due_date", "school_id", "created_at") SELECT "assignment_id", "chapter", "classroom_id", "title", "description", "attachment", "quiz", "start_date", "limit_user", "due_date", "school_id", "created_at" FROM `assignment`;--> statement-breakpoint
DROP TABLE `assignment`;--> statement-breakpoint
ALTER TABLE `__new_assignment` RENAME TO `assignment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `assignment_classroom_index` ON `assignment` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `assignment_school_index` ON `assignment` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_enrollment` (
	`user_id` integer NOT NULL,
	`classroom_id` integer NOT NULL,
	`score` integer,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `classroom_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`classroom_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_enrollment`("user_id", "classroom_id", "score", "school_id", "created_at") SELECT "user_id", "classroom_id", "score", "school_id", "created_at" FROM `enrollment`;--> statement-breakpoint
DROP TABLE `enrollment`;--> statement-breakpoint
ALTER TABLE `__new_enrollment` RENAME TO `enrollment`;--> statement-breakpoint
CREATE INDEX `enrollment_user_index` ON `enrollment` (`user_id`);--> statement-breakpoint
CREATE INDEX `enrollment_classroom_index` ON `enrollment` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `enrollment_school_index` ON `enrollment` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_forum` (
	`forum_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`classroom_id` integer NOT NULL,
	`chapter` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`classroom_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_forum`("forum_id", "classroom_id", "chapter", "user_id", "title", "description", "attachment", "school_id", "created_at") SELECT "forum_id", "classroom_id", "chapter", "user_id", "title", "description", "attachment", "school_id", "created_at" FROM `forum`;--> statement-breakpoint
DROP TABLE `forum`;--> statement-breakpoint
ALTER TABLE `__new_forum` RENAME TO `forum`;--> statement-breakpoint
CREATE INDEX `forum_user_index` ON `forum` (`user_id`);--> statement-breakpoint
CREATE INDEX `forum_school_index` ON `forum` (`school_id`);--> statement-breakpoint
CREATE INDEX `forum_classroom_index` ON `forum` (`classroom_id`);--> statement-breakpoint
CREATE TABLE `__new_material` (
	`material_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`classroom_id` integer NOT NULL,
	`chapter` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`attachment` text,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`classroom_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_material`("material_id", "classroom_id", "chapter", "title", "description", "content", "attachment", "school_id", "created_at") SELECT "material_id", "classroom_id", "chapter", "title", "description", "content", "attachment", "school_id", "created_at" FROM `material`;--> statement-breakpoint
DROP TABLE `material`;--> statement-breakpoint
ALTER TABLE `__new_material` RENAME TO `material`;--> statement-breakpoint
CREATE INDEX `material_classroom_index` ON `material` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `material_school_index` ON `material` (`school_id`);