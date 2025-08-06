ALTER TABLE `assignment` ADD `subject_id` integer NOT NULL REFERENCES subject(subject_id);--> statement-breakpoint
ALTER TABLE `forum` ADD `subject_id` integer NOT NULL REFERENCES subject(subject_id);--> statement-breakpoint
ALTER TABLE `material` ADD `subject_id` integer NOT NULL REFERENCES subject(subject_id);--> statement-breakpoint
CREATE INDEX `material_subject_index` ON `material` (`subject_id`);