PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assignment` (
	`assignment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `material`(`material_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assignment`("assignment_id", "material_id", "subject_id", "title", "description", "attachment", "created_at") SELECT "assignment_id", "material_id", "subject_id", "title", "description", "attachment", "created_at" FROM `assignment`;--> statement-breakpoint
DROP TABLE `assignment`;--> statement-breakpoint
ALTER TABLE `__new_assignment` RENAME TO `assignment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `assignment_material_index` ON `assignment` (`material_id`);--> statement-breakpoint
CREATE INDEX `assignment_subject_index` ON `assignment` (`subject_id`);--> statement-breakpoint
CREATE TABLE `__new_comment` (
	`comment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`forum_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`forum_id`) REFERENCES `forum`(`forum_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_comment`("comment_id", "forum_id", "user_id", "content", "created_at") SELECT "comment_id", "forum_id", "user_id", "content", "created_at" FROM `comment`;--> statement-breakpoint
DROP TABLE `comment`;--> statement-breakpoint
ALTER TABLE `__new_comment` RENAME TO `comment`;--> statement-breakpoint
CREATE INDEX `comment_forum_index` ON `comment` (`forum_id`);--> statement-breakpoint
CREATE INDEX `comment_user_index` ON `comment` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_forum` (
	`forum_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `material`(`material_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_forum`("forum_id", "material_id", "user_id", "title", "description", "attachment", "created_at") SELECT "forum_id", "material_id", "user_id", "title", "description", "attachment", "created_at" FROM `forum`;--> statement-breakpoint
DROP TABLE `forum`;--> statement-breakpoint
ALTER TABLE `__new_forum` RENAME TO `forum`;--> statement-breakpoint
CREATE INDEX `forum_material_index` ON `forum` (`material_id`);--> statement-breakpoint
CREATE INDEX `forum_user_index` ON `forum` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_material` (
	`material_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`material_type_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_type_id`) REFERENCES `material_type`(`material_type_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_material`("material_id", "subject_id", "material_type_id", "title", "description", "content", "attachment", "created_at") SELECT "material_id", "subject_id", "material_type_id", "title", "description", "content", "attachment", "created_at" FROM `material`;--> statement-breakpoint
DROP TABLE `material`;--> statement-breakpoint
ALTER TABLE `__new_material` RENAME TO `material`;--> statement-breakpoint
CREATE INDEX `material_subject_index` ON `material` (`subject_id`);--> statement-breakpoint
CREATE INDEX `material_type_index` ON `material` (`material_type_id`);--> statement-breakpoint
CREATE TABLE `__new_submission` (
	`submission_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`assignment_id` integer NOT NULL,
	`score` integer,
	`content` text NOT NULL,
	`attachment` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`assignment_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_submission`("submission_id", "user_id", "assignment_id", "score", "content", "attachment", "created_at") SELECT "submission_id", "user_id", "assignment_id", "score", "content", "attachment", "created_at" FROM `submission`;--> statement-breakpoint
DROP TABLE `submission`;--> statement-breakpoint
ALTER TABLE `__new_submission` RENAME TO `submission`;--> statement-breakpoint
CREATE INDEX `submission_user_index` ON `submission` (`user_id`);--> statement-breakpoint
CREATE INDEX `submission_assignment_index` ON `submission` (`assignment_id`);--> statement-breakpoint
CREATE TABLE `__new_user` (
	`user_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`avatar` text,
	`school_id` integer,
	`role_id` integer NOT NULL,
	`fullname` text NOT NULL,
	`dob` text NOT NULL,
	`grades_id` integer,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `user_role`(`role_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grades_id`) REFERENCES `grades`(`grades_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("user_id", "avatar", "school_id", "role_id", "fullname", "dob", "grades_id", "username", "password", "created_at") SELECT "user_id", "avatar", "school_id", "role_id", "fullname", "dob", "grades_id", "username", "password", "created_at" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `school_index` ON `user` (`school_id`);--> statement-breakpoint
CREATE INDEX `role_index` ON `user` (`role_id`);--> statement-breakpoint
CREATE INDEX `grades_index` ON `user` (`grades_id`);