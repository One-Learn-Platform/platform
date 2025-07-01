CREATE TABLE `assignment_question` (
	`question_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assignment_id` integer NOT NULL,
	`question` text NOT NULL,
	`choice` text,
	`answer` text NOT NULL,
	`clue` text,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`assignment_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assignment_question_assignment_index` ON `assignment_question` (`assignment_id`);