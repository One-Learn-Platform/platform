import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";

import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";

import { getDb } from "$lib/server/db";
import { comment, forum, user, subject } from "$lib/schema/db";
import { and, eq, count, getTableColumns, desc } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const db = getDb(event);
		const chapter = Number(event.params.chapter);
		const id = Number(event.params.id);

		if (isNaN(chapter) || chapter < 1) {
			return error(400, "Invalid chapter");
		}
		const forumColumns = getTableColumns(forum);
		const selectedForum = await db
			.select({
				...forumColumns,
				fullname: user.fullname,
				avatar: user.avatar,
			})
			.from(forum)
			.leftJoin(user, eq(forum.userId, user.id))
			.where(and(eq(forum.chapter, chapter), eq(forum.id, id)))
			.get();
		if (!selectedForum) {
			return error(404, "Forum not found");
		}
		const commentColumns = getTableColumns(comment);
		const commentsCount = await db
			.select({ count: count() })
			.from(comment)
			.where(eq(comment.forumId, selectedForum.id))
			.get();

		const allComments = await db
			.select({
				...commentColumns,
				fullname: user.fullname,
				avatar: user.avatar,
			})
			.from(comment)
			.leftJoin(user, eq(comment.userId, user.id))
			.where(eq(comment.forumId, selectedForum.id))
			.orderBy(desc(comment.createdAt));
		return {
			forum: selectedForum,
			comments: allComments,
			commentsCount: commentsCount?.count ?? 0,
			form: await superValidate(zod4(formSchema)),
		};
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	comment: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const userId = event.locals.user.id;
		const schoolId = event.locals.user.school;
		const { subjectCode } = event.params;
		const chapter = Number(event.params.chapter);
		const form = await superValidate(event, zod4(formSchema));
		if (!schoolId) {
			return fail(404, {
				comment: {
					success: false,
					message: "School not found",
				},
				form,
			});
		}
		if (isNaN(chapter) || chapter < 1) {
			return fail(400, {
				comment: {
					success: false,
					message: "Invalid chapter",
				},
				form,
			});
		}
		if (!form.valid) {
			setError(form, "", "Form is invalid");
			return fail(400, {
				comment: {
					success: false,
					message: "Form is invalid",
				},
				form,
			});
		}

		const currentSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!currentSubject) {
			return fail(404, {
				comment: {
					success: false,
					message: "Subject not found",
				},
				form,
			});
		}
		const currentForum = await db
			.select()
			.from(forum)
			.where(and(eq(forum.chapter, chapter), eq(forum.id, Number(event.params.id))))
			.get();
		if (!currentForum) {
			return fail(404, {
				comment: {
					success: false,
					message: "Forum not found",
				},
				form,
			});
		}
		try {
			await db.insert(comment).values({
				content: form.data.content,
				userId: userId,
				forumId: currentForum.id,
				schoolId: schoolId,
			});
		} catch (error) {
			console.error("Error inserting comment:", error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "An error occurred while submitting your comment.",
			);
			return fail(500, {
				comment: {
					success: false,
					message: "An error occurred while submitting your comment.",
				},
				form,
			});
		}
		return {
			comment: {
				success: true,
				message: "Comment submitted successfully",
			},
			form: await superValidate(zod4(formSchema)),
		};
	},
};
