CREATE TABLE `subject_type` (
	`subject_type_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type_name` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `subject` ADD `subject_type_id` integer NOT NULL REFERENCES subject_type(subject_type_id);