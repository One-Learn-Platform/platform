DROP TABLE `enrollment`;--> statement-breakpoint
ALTER TABLE `user` ADD `classroom_id` integer REFERENCES classroom(classroom_id);