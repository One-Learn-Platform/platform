PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_material_type` (
	`material_type_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type_name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_material_type`("material_type_id", "type_name") SELECT "material_type_id", "type_name" FROM `material_type`;--> statement-breakpoint
DROP TABLE `material_type`;--> statement-breakpoint
ALTER TABLE `__new_material_type` RENAME TO `material_type`;--> statement-breakpoint
PRAGMA foreign_keys=ON;