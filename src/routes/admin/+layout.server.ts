import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

import {
  announcement,
  assignment,
  comment,
  forum,
  material,
  school,
  subject,
  submission,
  user,
  type Announcement,
  type Assignment,
  type Comment,
  type Forum,
  type Material,
  type School,
  type Subject,
  type Submission,
  type User,
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { and, asc, eq, getTableColumns, ne } from "drizzle-orm";

export const load: LayoutServerLoad = async (event) => {
	const db = getDb(event);
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const schoolId = event.locals.user.school;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...restUserColumn } = getTableColumns(user);
			const allUsers = await db
				.select({ ...restUserColumn })
				.from(user)
				.orderBy(asc(user.createdAt));

			const isSuperadmin = event.locals.user.role === 1 || !schoolId;

			const queries = [
				isSuperadmin
					? db.select({ ...restUserColumn }).from(user)
					: db
							.select({ ...restUserColumn })
							.from(user)
							.where(and(ne(user.roleId, 1), eq(user.schoolId, schoolId))),
				isSuperadmin ? db.select().from(school) : Promise.resolve([]),
				isSuperadmin
					? db.select().from(subject)
					: db.select().from(subject).where(eq(subject.schoolId, schoolId)),
				isSuperadmin
					? db.select().from(material)
					: db.select().from(material).where(eq(material.schoolId, schoolId)),
				isSuperadmin
					? db.select().from(forum)
					: db.select().from(forum).where(eq(forum.schoolId, schoolId)),
				isSuperadmin
					? db.select().from(assignment)
					: db.select().from(assignment).where(eq(assignment.schoolId, schoolId)),
				isSuperadmin
					? db.select().from(submission)
					: db.select().from(submission).where(eq(submission.schoolId, schoolId)),
				isSuperadmin
					? db.select().from(announcement)
					: db.select().from(announcement).where(eq(announcement.schoolId, schoolId)),
				isSuperadmin
					? db.select().from(comment)
					: db.select().from(comment).where(eq(comment.schoolId, schoolId)),
			];

			const [
				userList,
				schoolList,
				subjectList,
				materialList,
				forumList,
				assignmentList,
				submissionList,
				announcementList,
				commentList,
			] = await Promise.all(queries);

			return {
				user: event.locals.user,
				session: event.locals.session,
				userList: userList as User[],
				schoolList: schoolList as School[],
				subjectList: subjectList as Subject[],
				materialList: materialList as Material[],
				forumList: forumList as Forum[],
				assignmentList: assignmentList as Assignment[],
				submissionList: submissionList as Submission[],
				announcementList: announcementList as Announcement[],
				commentList: commentList as Comment[],
				allUsers: allUsers,
			};
		} else {
			return error(404, { message: "Not Found" });
		}
	}
	return redirect(302, "/signin");
};
