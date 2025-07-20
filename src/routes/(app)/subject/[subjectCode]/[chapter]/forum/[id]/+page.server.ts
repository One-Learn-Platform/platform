import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";

import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { formSchema, formSchemaEdit as formSchemaEditComment } from "./schema";
import { formSchemaEdit } from "$lib/schema/forum/schema";

import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { comment, forum, user, subject } from "$lib/schema/db";
import { and, eq, count, getTableColumns, desc } from "drizzle-orm";
import { getFileExtension, getTimeStamp } from "$lib/utils";
import { getFileName } from "$lib/functions/material";

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
			form: await superValidate(zod4(formSchema), { id: "create" }),
			formEditComment: await superValidate(zod4(formSchemaEditComment), { id: "edit" }),
			formEditForum: await superValidate(zod4(formSchemaEdit)),
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
	editforum: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const r2 = getR2(event);
		const db = getDb(event);
		const userId = event.locals.user.id;
		const chapter = Number(event.params.chapter);
		if (isNaN(chapter) || chapter < 1) {
			return fail(400, {
				editforum: {
					success: false,
					message: "Invalid chapter",
				},
			});
		}
		const id = Number(event.params.id);
		const form = await superValidate(event, zod4(formSchemaEdit));
		if (isNaN(id) || id < 1) {
			return fail(400, {
				editforum: {
					success: false,
					message: "Invalid forum ID",
				},
				form,
			});
		}
		if (!form.valid) {
			setError(form, "", "Form is invalid");
			return fail(400, {
				editforum: {
					success: false,
					message: "Form is invalid",
				},
				form,
			});
		}
		const toEditForum = await db.select().from(forum).where(eq(forum.id, id)).get();
		if (!toEditForum) {
			return fail(404, {
				editforum: {
					success: false,
					message: "Forum not found",
				},
				form,
			});
		}
		if (toEditForum.userId !== userId) {
			return fail(403, {
				editforum: {
					success: false,
					message: "You are not allowed to edit this forum",
				},
				form,
			});
		}
		const subjectId = await db
			.select()
			.from(subject)
			.where(eq(subject.code, event.params.subjectCode))
			.get();
		if (!subjectId) {
			setError(form, "", "Subject not found. Please try again.");
			return fail(404, {
				editforum: {
					success: false,
					message: "Subject not found. Please try again.",
				},
				form,
			});
		}
		let attachment;
		try {
			if (form.data.attachment) {
				const uniqueFileName = `subject/${subjectId.id}/${chapter}/${getFileName(form.data.attachment.name)}-${getTimeStamp()}.${getFileExtension(form.data.attachment.name)}`;
				attachment = uniqueFileName;
				const attachmentBuffer = await form.data.attachment.arrayBuffer();
				await r2.put(uniqueFileName, attachmentBuffer);
			}
			await db
				.update(forum)
				.set({
					title: form.data.title,
					description: form.data.description,
				})
				.where(eq(forum.id, id));
		} catch (error) {
			if (attachment) {
				await r2.delete(attachment);
			}
			console.error("Error updating forum:", error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "An error occurred while updating the forum.",
			);
			return fail(500, {
				editforum: {
					success: false,
					message:
						error instanceof Error ? error.message : "An error occurred while updating the forum.",
				},
				form,
			});
		}
		return {
			editforum: {
				success: true,
				message: "Forum edited successfully",
			},
			form,
		};
	},
	editcomment: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const userId = event.locals.user.id;
		const id = Number(event.params.id);
		const form = await superValidate(event, zod4(formSchemaEditComment));
		if (isNaN(id) || id < 1) {
			return fail(400, {
				editcomment: {
					success: false,
					message: "Invalid forum ID",
				},
				form,
			});
		}
		if (!form.valid) {
			setError(form, "", "Form is invalid");
			return fail(400, {
				editcomment: {
					success: false,
					message: "Form is invalid",
				},
				form,
			});
		}
		const toEditComment = await db.select().from(comment).where(eq(comment.id, id)).get();
		if (!toEditComment) {
			return fail(404, {
				editcomment: {
					success: false,
					message: "Comment not found",
				},
				form,
			});
		}
		if (toEditComment.userId !== userId) {
			return fail(403, {
				editcomment: {
					success: false,
					message: "You are not allowed to edit this comment",
				},
				form,
			});
		}
		try {
			await db
				.update(comment)
				.set({
					content: form.data.content,
				})
				.where(eq(comment.id, id));
		} catch (error) {
			console.error("Error updating comment:", error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "An error occurred while updating the comment.",
			);
			return fail(500, {
				editcomment: {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "An error occurred while updating the comment.",
				},
				form,
			});
		}
		return {
			editcomment: {
				success: true,
				message: "Comment edited successfully",
			},
			form,
		};
	},
	deleteforum: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const userId = event.locals.user.id;
		const schoolId = event.locals.user.school;
		const { subjectCode } = event.params;
		const chapter = Number(event.params.chapter);
		const formData = await event.request.formData();
		const id = Number(formData.get("id"));
		if (isNaN(chapter) || chapter < 1) {
			return fail(400, {
				deleteforum: {
					success: false,
					message: "Invalid chapter",
				},
			});
		}
		if (isNaN(id) || id < 1) {
			return fail(400, {
				deleteforum: {
					success: false,
					message: "Invalid forum ID",
				},
			});
		}
		if (!schoolId) {
			return fail(404, {
				deleteforum: {
					success: false,
					message: "School not found",
				},
			});
		}
		const toDeleteForum = await db.select().from(forum).where(eq(forum.id, id)).get();
		if (!toDeleteForum) {
			return fail(404, {
				deleteforum: {
					success: false,
					message: "Forum not found",
				},
			});
		}
		if (toDeleteForum.userId !== userId || event.locals.user.role !== 2) {
			return fail(403, {
				deleteforum: {
					success: false,
					message: "You are not allowed to delete this forum",
				},
			});
		}
		try {
			await db.delete(comment).where(eq(comment.forumId, id));
			await db.delete(forum).where(eq(forum.id, id));
		} catch (error) {
			console.error("Error deleting forum or comments:", error);
			return fail(500, {
				deleteforum: {
					success: false,
					message:
						error instanceof Error ? error.message : "An error occurred while deleting the forum.",
				},
			});
		}
		return redirect(302, `/subject/${subjectCode}/${chapter}/forum`);
	},
	deletecomment: async (event) => {
		if (!event.locals.user) {
			return redirect(302, "/signin");
		}
		const db = getDb(event);
		const userId = event.locals.user.id;
		const form = await event.request.formData();
		const id = Number(form.get("comment_id"));
		if (isNaN(id) || id < 1) {
			return fail(400, {
				deletecomment: {
					success: false,
					message: "Invalid comment ID",
				},
			});
		}
		const toDeleteComment = await db.select().from(comment).where(eq(comment.id, id)).get();
		if (!toDeleteComment) {
			return fail(404, {
				deletecomment: {
					success: false,
					message: "Comment not found",
				},
			});
		}
		if (toDeleteComment.userId !== userId || event.locals.user.role !== 2) {
			return fail(403, {
				deletecomment: {
					success: false,
					message: "You are not allowed to delete this comment",
				},
			});
		}
		try {
			await db.delete(comment).where(eq(comment.id, id));
		} catch (error) {
			console.error("Error deleting comment:", error);
			return fail(500, {
				deletecomment: {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "An error occurred while deleting the comment.",
				},
			});
		}
		return {
			deletecomment: {
				success: true,
				message: "Comment deleted successfully",
			},
		};
	},
};
