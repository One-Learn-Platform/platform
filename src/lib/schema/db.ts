import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import { QUESTION_TYPE_VALUE } from "../types/assignment";

export const school = sqliteTable("school", {
	id: integer("school_id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	logo: text("logo").notNull(),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(current_timestamp)`),
});

export const userRole = sqliteTable("user_role", {
	id: integer("role_id").primaryKey({ autoIncrement: true }),
	name: text("role_name").notNull(),
});

export const grades = sqliteTable(
	"grades",
	{
		id: integer("grades_id").primaryKey({ autoIncrement: true }),
		level: integer("level").notNull(),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
	},
	(table) => [index("grades_school_index").on(table.schoolId)],
);

export const user = sqliteTable(
	"user",
	{
		id: integer("user_id").primaryKey({ autoIncrement: true }),
		avatar: text("avatar"),
		schoolId: integer("school_id").references(() => school.id),
		roleId: integer("role_id")
			.references(() => userRole.id)
			.notNull(),
		fullname: text("fullname").notNull(),
		dob: text("dob").notNull(),
		gradesId: integer("grades_id").references(() => grades.id),
		username: text("username").unique().notNull(),
		password: text("password").notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		index("school_index").on(table.schoolId),
		index("role_index").on(table.roleId),
		index("grades_index").on(table.gradesId),
	],
);

export const subjectType = sqliteTable("subject_type", {
	id: integer("subject_type_id").primaryKey({ autoIncrement: true }),
	name: text("type_name").notNull(),
});

export const subject = sqliteTable(
	"subject",
	{
		id: integer("subject_id").primaryKey({ autoIncrement: true }),
		code: text("subject_code").notNull(),
		teacher: integer("teacher_id")
			.notNull()
			.references(() => user.id),
		name: text("name").notNull(),
		subjectType: integer("subject_type_id")
			.references(() => subjectType.id)
			.notNull(),
		chapterCount: integer("chapter_count").notNull(),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
	},
	(table) => [
		index("teacher_index").on(table.teacher),
		index("subject_school_index").on(table.schoolId),
	],
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
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.subjectId] }),
		index("enrollment_user_index").on(table.userId),
		index("enrollment_subject_index").on(table.subjectId),
		index("enrollment_school_index").on(table.schoolId),
	],
);

export const material = sqliteTable(
	"material",
	{
		id: integer("material_id").primaryKey({ autoIncrement: true }),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
		chapter: integer("chapter").notNull(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		content: text("content").notNull(),
		attachment: text("attachment"),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		index("material_subject_index").on(table.subjectId),
		index("material_school_index").on(table.schoolId),
	],
);

export const forum = sqliteTable(
	"forum",
	{
		id: integer("forum_id").primaryKey({ autoIncrement: true }),
		subjectId: integer("subject_id")
			.references(() => subject.id)
			.notNull(),
		chapter: integer("chapter").notNull(),
		userId: integer("user_id")
			.references(() => user.id)
			.notNull(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		attachment: text("attachment"),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		index("forum_user_index").on(table.userId),
		index("forum_school_index").on(table.schoolId),
		index("forum_subject_index").on(table.subjectId),
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
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		index("comment_forum_index").on(table.forumId),
		index("comment_user_index").on(table.userId),
		index("comment_school_index").on(table.schoolId),
	],
);

export const assignment = sqliteTable(
	"assignment",
	{
		id: integer("assignment_id").primaryKey({ autoIncrement: true }),
		chapter: integer("chapter").notNull(),
		subjectId: integer("subject_id")
			.references(() => subject.id)
			.notNull(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		attachment: text("attachment"),
		quiz: integer("quiz", { mode: "boolean" }).notNull(),
		startDate: text("start_date"),
		limitUser: integer("limit_user"),
		dueDate: text("due_date").notNull(),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		index("assignment_subject_index").on(table.subjectId),
		index("assignment_school_index").on(table.schoolId),
	],
);

export const assignmentQuestion = sqliteTable(
	"assignment_question",
	{
		id: integer("question_id").primaryKey({ autoIncrement: true }),
		assignmentId: integer("assignment_id")
			.references(() => assignment.id)
			.notNull(),
		question: text("question").notNull(),
		questionType: text("question_type", {
			enum: QUESTION_TYPE_VALUE,
		}).notNull(),
		choice: text("choice"),
		answer: text("answer").notNull(),
		clue: text("clue"),
		attachment: text("attachment"),
	},
	(table) => [index("assignment_question_assignment_index").on(table.assignmentId)],
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
		score: integer("score").notNull(),
		content: text("content").notNull(),
		attachment: text("attachment"),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [
		index("submission_user_index").on(table.userId),
		index("submission_assignment_index").on(table.assignmentId),
		index("submission_school_index").on(table.schoolId),
	],
);

export const announcement = sqliteTable(
	"announcement",
	{
		id: integer("announcement_id").primaryKey({ autoIncrement: true }),
		title: text("title").notNull(),
		content: text("content").notNull(),
		startDate: text("start_date").notNull(),
		endDate: text("end_date").notNull(),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [index("announcement_school_index").on(table.schoolId)],
);

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
	},
	(table) => [index("session_user_index").on(table.userId)],
);

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type UserRole = typeof userRole.$inferSelect;
export type School = typeof school.$inferSelect;
export type Grades = typeof grades.$inferSelect;
export type Subject = typeof subject.$inferSelect;
export type SubjectType = typeof subjectType.$inferSelect;
export type Material = typeof material.$inferSelect;
export type Forum = typeof forum.$inferSelect;
export type Comment = typeof comment.$inferSelect;
export type Assignment = typeof assignment.$inferSelect;
export type AssignmentQuestion = typeof assignmentQuestion.$inferSelect;
export type Submission = typeof submission.$inferSelect;
export type Enrollment = typeof enrollment.$inferSelect;
export type Announcement = typeof announcement.$inferSelect;

export const userInsertSchema = createInsertSchema(user);
