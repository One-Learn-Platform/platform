CREATE TABLE `report` (
	`user_id` integer NOT NULL,
	`classroom_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`school_id` integer NOT NULL,
	`score` integer NOT NULL,
	PRIMARY KEY(`user_id`, `classroom_id`, `subject_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`classroom_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `report_user_index` ON `report` (`user_id`);--> statement-breakpoint
CREATE INDEX `report_classroom_index` ON `report` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `report_subject_index` ON `report` (`subject_id`);--> statement-breakpoint
CREATE INDEX `report_school_index` ON `report` (`school_id`);