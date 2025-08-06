import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

export const classroom = sqliteTable(
	"classroom",
	{
		id: integer("classroom_id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull(),
		gradesId: integer("grades_id")
			.notNull()
			.references(() => grades.id),
		schoolId: integer("school_id")
			.notNull()
			.references(() => school.id),
	},
	(table) => [
		index("classroom_school_index").on(table.schoolId),
		index("classroom_grades_index").on(table.gradesId),
	],
);

export const user = sqliteTable(
	"user",
	{
		id: integer("user_id").primaryKey({ autoIncrement: true }),
		avatar: text("avatar"),
		schoolId: integer("school_id").references(() => school.id),
		classroomId: integer("classroom_id").references(() => classroom.id),
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
		gradesId: integer("grades_id")
			.notNull()
			.references(() => grades.id),
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
		index("subject_school_index").on(table.schoolId),
		index("subject_grades_index").on(table.gradesId),
	],
);

export const report = sqliteTable(
	"report",
	{
		userId: integer("user_id")
			.notNull()
			.references(() => user.id),
		classroomId: integer("classroom_id")
			.notNull()
			.references(() => classroom.id),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
		schoolId: integer("school_id")
			.notNull()
			.references(() => school.id),
		score: integer("score").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.classroomId, table.subjectId] }),
		index("report_user_index").on(table.userId),
		index("report_classroom_index").on(table.classroomId),
		index("report_subject_index").on(table.subjectId),
		index("report_school_index").on(table.schoolId),
	],
);

export const teacherAssign = sqliteTable(
	"teacher_assign",
	{
		userId: integer("user_id")
			.notNull()
			.references(() => user.id),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
		schoolId: integer("school_id")
			.notNull()
			.references(() => school.id),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.subjectId] }),
		index("teacher_assign_user_index").on(table.userId),
		index("teacher_assign_subject_index").on(table.subjectId),
		index("teacher_assign_school_index").on(table.schoolId),
	],
);

export const schedule = sqliteTable(
	"schedule",
	{
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
		classroomId: integer("classroom_id")
			.notNull()
			.references(() => classroom.id),
		periodStart: integer("period_start"),
		periodEnd: integer("period_end"),
		dayOfWeek: text("day_of_week"),
		startTime: text("start_time"),
		endTime: text("end_time"),
		schoolId: integer("school_id")
			.references(() => school.id)
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.subjectId, table.classroomId] }),
		index("schedule_subject_index").on(table.subjectId),
		index("schedule_classroom_index").on(table.classroomId),
		index("schedule_school_index").on(table.schoolId),
	],
);

export const material = sqliteTable(
	"material",
	{
		id: integer("material_id").primaryKey({ autoIncrement: true }),
		classroomId: integer("classroom_id")
			.notNull()
			.references(() => classroom.id),
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
		index("material_classroom_index").on(table.classroomId),
		index("material_school_index").on(table.schoolId),
		index("material_subject_index").on(table.subjectId),
	],
);

export const forum = sqliteTable(
	"forum",
	{
		id: integer("forum_id").primaryKey({ autoIncrement: true }),
		classroomId: integer("classroom_id")
			.references(() => classroom.id)
			.notNull(),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
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
		index("forum_classroom_index").on(table.classroomId),
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
		classroomId: integer("classroom_id")
			.notNull()
			.references(() => classroom.id),
		subjectId: integer("subject_id")
			.notNull()
			.references(() => subject.id),
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
		index("assignment_classroom_index").on(table.classroomId),
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
export type Classroom = typeof classroom.$inferSelect;
export type Report = typeof report.$inferSelect;
export type TeacherAssign = typeof teacherAssign.$inferSelect;
export type Schedule = typeof schedule.$inferSelect;
export type Assignment = typeof assignment.$inferSelect;
export type AssignmentQuestion = typeof assignmentQuestion.$inferSelect;
export type Submission = typeof submission.$inferSelect;
export type Announcement = typeof announcement.$inferSelect;
