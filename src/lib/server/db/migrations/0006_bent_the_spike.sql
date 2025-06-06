ALTER TABLE `assignment` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `assignment_school_index` ON `assignment` (`school_id`);--> statement-breakpoint
ALTER TABLE `comment` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `comment_school_index` ON `comment` (`school_id`);--> statement-breakpoint
ALTER TABLE `enrollment` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
ALTER TABLE `forum` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `forum_school_index` ON `forum` (`school_id`);--> statement-breakpoint
ALTER TABLE `grades` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `grades_school_index` ON `grades` (`school_id`);--> statement-breakpoint
ALTER TABLE `material` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `material_school_index` ON `material` (`school_id`);--> statement-breakpoint
ALTER TABLE `material_type` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `material_type_school_index` ON `material_type` (`school_id`);--> statement-breakpoint
ALTER TABLE `school` ADD `created_at` text DEFAULT (current_timestamp) NOT NULL;--> statement-breakpoint
ALTER TABLE `subject` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `subject_school_index` ON `subject` (`school_id`);--> statement-breakpoint
ALTER TABLE `submission` ADD `school_id` integer REFERENCES school(school_id);--> statement-breakpoint
CREATE INDEX `submission_school_index` ON `submission` (`school_id`);