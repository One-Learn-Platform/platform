PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assignment_question` (
	`question_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assignment_id` integer NOT NULL,
	`question` text NOT NULL,
	`question_type` text NOT NULL,
	`choice` text,
	`answer` text NOT NULL,
	`clue` text,
	`attachment` text,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`assignment_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assignment_question`("question_id", "assignment_id", "question", "question_type", "choice", "answer", "clue", "attachment") SELECT "question_id", "assignment_id", "question", "question_type", "choice", "answer", "clue", "attachment" FROM `assignment_question`;--> statement-breakpoint
DROP TABLE `assignment_question`;--> statement-breakpoint
ALTER TABLE `__new_assignment_question` RENAME TO `assignment_question`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `assignment_question_assignment_index` ON `assignment_question` (`assignment_id`);