PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_schedule` (
	`schedule_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`classroom_id` integer NOT NULL,
	`period_start` integer,
	`period_end` integer,
	`day_of_week` text,
	`start_time` text,
	`end_time` text,
	`school_id` integer NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`classroom_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_schedule`("schedule_id", "subject_id", "classroom_id", "period_start", "period_end", "day_of_week", "start_time", "end_time", "school_id") SELECT "schedule_id", "subject_id", "classroom_id", "period_start", "period_end", "day_of_week", "start_time", "end_time", "school_id" FROM `schedule`;--> statement-breakpoint
DROP TABLE `schedule`;--> statement-breakpoint
ALTER TABLE `__new_schedule` RENAME TO `schedule`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `schedule_subject_index` ON `schedule` (`subject_id`);--> statement-breakpoint
CREATE INDEX `schedule_classroom_index` ON `schedule` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `schedule_school_index` ON `schedule` (`school_id`);