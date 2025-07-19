ALTER TABLE `subject` ADD `grades_id` integer REFERENCES grades(grades_id);--> statement-breakpoint
CREATE INDEX `subject_grades_index` ON `subject` (`grades_id`);