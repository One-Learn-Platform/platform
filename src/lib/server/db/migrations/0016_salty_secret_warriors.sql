CREATE TABLE `announcement` (
	`announcement_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `announcement_school_index` ON `announcement` (`school_id`);--> statement-breakpoint
DROP TABLE `material_type`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_material` (
	`material_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`chapter` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`attachment` text DEFAULT '[]' NOT NULL,
	`school_id` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_material`("material_id", "subject_id", "chapter", "title", "description", "content", "attachment", "school_id", "created_at") SELECT "material_id", "subject_id", "chapter", "title", "description", "content", "attachment", "school_id", "created_at" FROM `material`;--> statement-breakpoint
DROP TABLE `material`;--> statement-breakpoint
ALTER TABLE `__new_material` RENAME TO `material`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `material_subject_index` ON `material` (`subject_id`);--> statement-breakpoint
CREATE INDEX `material_school_index` ON `material` (`school_id`);