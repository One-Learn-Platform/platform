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

export const grades = sqliteTable("grades", {
	id: integer("grades_id").primaryKey({ autoIncrement: true }),
	level: integer("level").notNull(),
});

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
		createdAt: text("created_at")
			.notNull()
			.default(sql`(current_timestamp)`),
		// better-auth fields. Users sign in by username; email is a unique placeholder.
		email: text("email").notNull().unique(),
		emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		displayUsername: text("display_username"),
		authCreatedAt: integer("auth_created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		authUpdatedAt: integer("auth_updated_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
		// better-auth admin plugin. "admin" for super admins, "user" for everyone else.
		authRole: text("auth_role").notNull().default("user"),
		banned: integer("banned", { mode: "boolean" }).notNull().default(false),
		banReason: text("ban_reason"),
		banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
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
		gradesId: integer("grades_id")
			.notNull()
			.references(() => grades.id),
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
		index("subject_grades_index").on(table.gradesId),
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
		id: integer("id").primaryKey({ autoIncrement: true }),
		token: text("token").notNull().unique(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		impersonatedBy: integer("impersonated_by"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [index("session_user_index").on(table.userId)],
);

export const account = sqliteTable(
	"account",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
		refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
		scope: text("scope"),
		password: text("password"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [index("account_user_index").on(table.userId)],
);

export const verification = sqliteTable(
	"verification",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date()),
	},
	(table) => [index("verification_identifier_index").on(table.identifier)],
);

export const rateLimit = sqliteTable("rate_limit", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	key: text("key").notNull().unique(),
	count: integer("count").notNull(),
	lastRequest: integer("last_request").notNull(),
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
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
