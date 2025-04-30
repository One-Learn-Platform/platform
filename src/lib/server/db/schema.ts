import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

export const school = sqliteTable("school", {
	id: integer("school_id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	logo: text("logo").notNull(),
});

export const userRole = sqliteTable("user_role", {
	id: integer("role_id").primaryKey({ autoIncrement: true }),
	name: text("role_name").notNull(),
});

export const grades = sqliteTable("grades", {
	id: integer("grades_id").primaryKey({ autoIncrement: true }),
	level: integer("level").notNull(),
});

export const user = sqliteTable(
	"user",
	{
		id: integer("user_id").primaryKey({ autoIncrement: true }),
		avatar: text("avatar"),
		schooldId: integer("school_id").references(() => school.id),
		roleId: integer("role_id")
			.references(() => userRole.id)
			.notNull(),
		fullname: text("fullname").notNull(),
		dob: text("dob").notNull(),
		gradesId: integer("grades_id").references(() => grades.id),
		username: text("username").unique().notNull(),
		password: text("password").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		index("school_index").on(table.schooldId),
		index("role_index").on(table.roleId),
		index("grades_index").on(table.gradesId),
	],
);

export const subject = sqliteTable(
	"subject",
	{
		id: integer("subject_id").primaryKey({ autoIncrement: true }),
		teacher: integer("teacher_id")
			.notNull()
			.references(() => user.id),
		name: text("name").notNull(),
	},
	(table) => [index("teacher_index").on(table.teacher)],
);

export const enrollment = sqliteTable(
	"enrollment",
	{
		userId: integer("user_id")
			.notNull()
			.references(() => user.id),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
		score: integer("score"),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.subjectId] }),
		index("enrollment_user_index").on(table.userId),
		index("enrollment_subject_index").on(table.subjectId),
	],
);

export const materialType = sqliteTable("material_type", {
	id: integer("material_type_id").primaryKey({ autoIncrement: true }),
	name: text("type_name").notNull(),
});

export const material = sqliteTable(
	"material",
	{
		id: integer("material_id").primaryKey({ autoIncrement: true }),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
		materialTypeId: integer("material_type_id")
			.references(() => materialType.id)
			.notNull(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		content: text("content").notNull(),
		attachment: text("attachment").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(current_timestamp)`),
	},
	(table) => [
		index("material_subject_index").on(table.subjectId),
		index("material_type_index").on(table.materialTypeId),
	],
);

export const forum = sqliteTable(
	"forum",
	{
		id: integer("forum_id").primaryKey({ autoIncrement: true }),
		materialId: integer("material_id")
			.references(() => material.id)
			.notNull(),
		userId: integer("user_id")
			.references(() => user.id)
			.notNull(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		attachment: text("attachment").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(current_timestamp)`),
	},
	(table) => [
		index("forum_material_index").on(table.materialId),
		index("forum_user_index").on(table.userId),
	],
);

export const comment = sqliteTable(
	"comment",
	{
		id: integer("comment_id").primaryKey({ autoIncrement: true }),
		forumId: integer("forum_id")
			.references(() => forum.id)
			.notNull(),
		userId: integer("user_id")
			.references(() => user.id)
			.notNull(),
		content: text("content").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(current_timestamp)`),
	},
	(table) => [
		index("comment_forum_index").on(table.forumId),
		index("comment_user_index").on(table.userId),
	],
);

export const assignment = sqliteTable(
	"assignment",
	{
		id: integer("assignment_id").primaryKey({ autoIncrement: true }),
		materialId: integer("material_id")
			.references(() => material.id)
			.notNull(),
		subjectId: integer("subject_id")
			.references(() => subject.id)
			.notNull(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		attachment: text("attachment").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(current_timestamp)`),
	},
	(table) => [
		index("assignment_material_index").on(table.materialId),
		index("assignment_subject_index").on(table.subjectId),
	],
);

export const submission = sqliteTable(
	"submission",
	{
		id: integer("submission_id").primaryKey({ autoIncrement: true }),
		userId: integer("user_id")
			.references(() => user.id)
			.notNull(),
		assignmentId: integer("assignment_id")
			.references(() => assignment.id)
			.notNull(),
		score: integer("score"),
		content: text("content").notNull(),
		attachment: text("attachment").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(current_timestamp)`),
	},
	(table) => [
		index("submission_user_index").on(table.userId),
		index("submission_assignment_index").on(table.assignmentId),
	],
);

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [index("session_user_index").on(table.userId)],
);

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type UserRole = typeof userRole.$inferSelect;
export type School = typeof school.$inferSelect;
export type Grades = typeof grades.$inferSelect;
export type Subject = typeof subject.$inferSelect;
export type MaterialType = typeof materialType.$inferSelect;
export type Material = typeof material.$inferSelect;
export type Forum = typeof forum.$inferSelect;
export type Comment = typeof comment.$inferSelect;
export type Assignment = typeof assignment.$inferSelect;
export type Submission = typeof submission.$inferSelect;
export type Enrollment = typeof enrollment.$inferSelect;

export const userInsertSchema = createInsertSchema(user);
