ALTER TABLE `forum` ADD `subject_id` integer NOT NULL REFERENCES subject(subject_id);--> statement-breakpoint
CREATE INDEX `forum_subject_index` ON `forum` (`subject_id`);