PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assignment` (
	`assignment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `material`(`material_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assignment`("assignment_id", "material_id", "subject_id", "title", "description", "attachment", "school_id", "created_at") SELECT "assignment_id", "material_id", "subject_id", "title", "description", "attachment", "school_id", "created_at" FROM `assignment`;--> statement-breakpoint
DROP TABLE `assignment`;--> statement-breakpoint
ALTER TABLE `__new_assignment` RENAME TO `assignment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `assignment_material_index` ON `assignment` (`material_id`);--> statement-breakpoint
CREATE INDEX `assignment_subject_index` ON `assignment` (`subject_id`);--> statement-breakpoint
CREATE INDEX `assignment_school_index` ON `assignment` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_comment` (
	`comment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`forum_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`content` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`forum_id`) REFERENCES `forum`(`forum_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_comment`("comment_id", "forum_id", "user_id", "content", "school_id", "created_at") SELECT "comment_id", "forum_id", "user_id", "content", "school_id", "created_at" FROM `comment`;--> statement-breakpoint
DROP TABLE `comment`;--> statement-breakpoint
ALTER TABLE `__new_comment` RENAME TO `comment`;--> statement-breakpoint
CREATE INDEX `comment_forum_index` ON `comment` (`forum_id`);--> statement-breakpoint
CREATE INDEX `comment_user_index` ON `comment` (`user_id`);--> statement-breakpoint
CREATE INDEX `comment_school_index` ON `comment` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_enrollment` (
	`user_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`score` integer,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `subject_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_enrollment`("user_id", "subject_id", "score", "school_id", "created_at") SELECT "user_id", "subject_id", "score", "school_id", "created_at" FROM `enrollment`;--> statement-breakpoint
DROP TABLE `enrollment`;--> statement-breakpoint
ALTER TABLE `__new_enrollment` RENAME TO `enrollment`;--> statement-breakpoint
CREATE INDEX `enrollment_user_index` ON `enrollment` (`user_id`);--> statement-breakpoint
CREATE INDEX `enrollment_subject_index` ON `enrollment` (`subject_id`);--> statement-breakpoint
CREATE INDEX `enrollment_school_index` ON `enrollment` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_forum` (
	`forum_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `material`(`material_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_forum`("forum_id", "material_id", "user_id", "title", "description", "attachment", "school_id", "created_at") SELECT "forum_id", "material_id", "user_id", "title", "description", "attachment", "school_id", "created_at" FROM `forum`;--> statement-breakpoint
DROP TABLE `forum`;--> statement-breakpoint
ALTER TABLE `__new_forum` RENAME TO `forum`;--> statement-breakpoint
CREATE INDEX `forum_material_index` ON `forum` (`material_id`);--> statement-breakpoint
CREATE INDEX `forum_user_index` ON `forum` (`user_id`);--> statement-breakpoint
CREATE INDEX `forum_school_index` ON `forum` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_grades` (
	`grades_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` integer NOT NULL,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_grades`("grades_id", "level", "school_id") SELECT "grades_id", "level", "school_id" FROM `grades`;--> statement-breakpoint
DROP TABLE `grades`;--> statement-breakpoint
ALTER TABLE `__new_grades` RENAME TO `grades`;--> statement-breakpoint
CREATE INDEX `grades_school_index` ON `grades` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_material` (
	`material_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`material_type_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`attachment` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_type_id`) REFERENCES `material_type`(`material_type_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_material`("material_id", "subject_id", "material_type_id", "title", "description", "content", "attachment", "school_id", "created_at") SELECT "material_id", "subject_id", "material_type_id", "title", "description", "content", "attachment", "school_id", "created_at" FROM `material`;--> statement-breakpoint
DROP TABLE `material`;--> statement-breakpoint
ALTER TABLE `__new_material` RENAME TO `material`;--> statement-breakpoint
CREATE INDEX `material_subject_index` ON `material` (`subject_id`);--> statement-breakpoint
CREATE INDEX `material_type_index` ON `material` (`material_type_id`);--> statement-breakpoint
CREATE INDEX `material_school_index` ON `material` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_material_type` (
	`material_type_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type_name` text NOT NULL,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_material_type`("material_type_id", "type_name", "school_id") SELECT "material_type_id", "type_name", "school_id" FROM `material_type`;--> statement-breakpoint
DROP TABLE `material_type`;--> statement-breakpoint
ALTER TABLE `__new_material_type` RENAME TO `material_type`;--> statement-breakpoint
CREATE INDEX `material_type_school_index` ON `material_type` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_subject` (
	`subject_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_code` text NOT NULL,
	`teacher_id` integer NOT NULL,
	`name` text NOT NULL,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subject`("subject_id", "subject_code", "teacher_id", "name", "school_id") SELECT "subject_id", "subject_code", "teacher_id", "name", "school_id" FROM `subject`;--> statement-breakpoint
DROP TABLE `subject`;--> statement-breakpoint
ALTER TABLE `__new_subject` RENAME TO `subject`;--> statement-breakpoint
CREATE INDEX `teacher_index` ON `subject` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `subject_school_index` ON `subject` (`school_id`);--> statement-breakpoint
CREATE TABLE `__new_submission` (
	`submission_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`assignment_id` integer NOT NULL,
	`score` integer,
	`content` text NOT NULL,
	`attachment` text NOT NULL,
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
CREATE INDEX `submission_user_index` ON `submission` (`user_id`);--> statement-breakpoint
CREATE INDEX `submission_assignment_index` ON `submission` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `submission_school_index` ON `submission` (`school_id`);--> statement-breakpoint
ALTER TABLE `session` ADD `created_at` text DEFAULT (current_timestamp) NOT NULL;