CREATE TABLE `assignment` (
	`assignment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp),
	FOREIGN KEY (`material_id`) REFERENCES `material`(`material_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assignment_material_index` ON `assignment` (`material_id`);--> statement-breakpoint
CREATE INDEX `assignment_subject_index` ON `assignment` (`subject_id`);--> statement-breakpoint
CREATE TABLE `comment` (
	`comment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`forum_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp),
	FOREIGN KEY (`forum_id`) REFERENCES `forum`(`forum_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comment_forum_index` ON `comment` (`forum_id`);--> statement-breakpoint
CREATE INDEX `comment_user_index` ON `comment` (`user_id`);--> statement-breakpoint
CREATE TABLE `enrollment` (
	`user_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`score` integer,
	PRIMARY KEY(`user_id`, `subject_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `enrollment_user_index` ON `enrollment` (`user_id`);--> statement-breakpoint
CREATE INDEX `enrollment_subject_index` ON `enrollment` (`subject_id`);--> statement-breakpoint
CREATE TABLE `forum` (
	`forum_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp),
	FOREIGN KEY (`material_id`) REFERENCES `material`(`material_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `forum_material_index` ON `forum` (`material_id`);--> statement-breakpoint
CREATE INDEX `forum_user_index` ON `forum` (`user_id`);--> statement-breakpoint
CREATE TABLE `grades` (
	`grades_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `material` (
	`material_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`material_type_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp),
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_type_id`) REFERENCES `material_type`(`material_type_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `material_subject_index` ON `material` (`subject_id`);--> statement-breakpoint
CREATE INDEX `material_type_index` ON `material` (`material_type_id`);--> statement-breakpoint
CREATE TABLE `material_type` (
	`material_type_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `school` (
	`school_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`logo` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_user_index` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `subject` (
	`subject_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `teacher_index` ON `subject` (`teacher_id`);--> statement-breakpoint
CREATE TABLE `submission` (
	`submission_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`assignment_id` integer NOT NULL,
	`score` integer,
	`content` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`assignment_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `submission_user_index` ON `submission` (`user_id`);--> statement-breakpoint
CREATE INDEX `submission_assignment_index` ON `submission` (`assignment_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`user_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`fullname` text NOT NULL,
	`dob` text NOT NULL,
	`grades_id` integer NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `user_role`(`role_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grades_id`) REFERENCES `grades`(`grades_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `school_index` ON `user` (`school_id`);--> statement-breakpoint
CREATE INDEX `role_index` ON `user` (`role_id`);--> statement-breakpoint
CREATE INDEX `grades_index` ON `user` (`grades_id`);--> statement-breakpoint
CREATE TABLE `user_role` (
	`role_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_name` text NOT NULL
);
