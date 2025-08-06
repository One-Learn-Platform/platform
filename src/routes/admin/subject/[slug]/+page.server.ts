import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaEdit } from "$lib/schema/subject/schema";
import { fail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import {
	assignment,
	assignmentQuestion,
	comment,
	forum,
	grades,
	material,
	schedule,
	subject,
	subjectType,
	submission,
	user,
} from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, inArray } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const params = event.params;
	const { slug } = params;
	const schoolId = parseInt(slug, 10);

	if (event.locals.user && (event.locals.user.role === 1 || event.locals.user.role === 2)) {
		if (isNaN(schoolId)) {
			return error(400, { message: "Invalid School ID" });
		} else {
			const gradesList = await db.select().from(grades);
			const teacherList = await db.select().from(user).where(eq(user.roleId, 3));
			const subjectData = await db.select().from(subject).where(eq(subject.id, schoolId)).get();
			const subjectTypeList = await db.select().from(subjectType);
			if (subjectData) {
				return {
					gradesList: gradesList,
					subjectData: subjectData,
					teacherList: teacherList,
					subjectTypeList: subjectTypeList,
					form: await superValidate(zod4(formSchemaEdit)),
				};
			} else {
				return error(404, { message: "Subject Not Found" });
			}
		}
	}
	return error(404, { message: "Not Found" });
};

export const actions: Actions = {
	edit: async (event) => {
		const db = getDb(event);
		const params = event.params;
		const { slug } = params;
		const form = await superValidate(event, zod4(formSchemaEdit));
		const subjectId = Number(slug);

		if (isNaN(subjectId) || subjectId <= 0) {
			setError(form, "", "Invalid subject ID, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Invalid subject ID, please try again" },
				form,
			});
		}

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				edit: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		try {
			await db
				.update(subject)
				.set({
					name: form.data.name,
					code: form.data.code.toLocaleLowerCase(),
					gradesId: form.data.gradesId,
					chapterCount: Number(form.data.chapterCount),
					subjectType: Number(form.data.subjectType),
				})
				.where(eq(subject.id, subjectId));
		} catch (error) {
			console.error(error);
			setError(
				form,
				"",
				error instanceof Error ? error.message : "Unknown error. Please try again.",
				{ status: 500 },
			);
			return fail(500, {
				edit: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
				form,
			});
		}

		if (event.url.searchParams.has("ref")) redirect(303, "/admin/subject");
		else {
			return withFiles({
				edit: {
					success: true,
					data: {
						name: form.data.name,
					},
					message: "User created successfully",
				},
				form,
			});
		}
	},
	delete: async (event) => {
		const db = getDb(event);
		const form = await event.request.formData();
		const id = form.get("id");

		if (!id) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}
		const numberId = Number(id);
		if (isNaN(numberId)) {
			return fail(400, {
				delete: { success: false, data: null, message: "ID is not a number. Please try again." },
			});
		}
		const subjectForum = await db.select().from(forum).where(eq(forum.subjectId, numberId));
		const subjectAssignment = await db
			.select()
			.from(assignment)
			.where(eq(assignment.subjectId, numberId));
		const name = await db.select().from(subject).where(eq(subject.id, numberId)).get();
		if (!name) {
			return fail(400, {
				delete: { success: false, data: null, message: "Subject not found. Please try again." },
			});
		}
		try {
			await db.delete(comment).where(
				inArray(
					comment.forumId,
					subjectForum.map((f) => f.id),
				),
			);
			await db.delete(forum).where(eq(forum.subjectId, numberId));
			await db.delete(submission).where(
				inArray(
					submission.assignmentId,
					subjectAssignment.map((a) => a.id),
				),
			);
			await db.delete(assignmentQuestion).where(
				inArray(
					assignmentQuestion.assignmentId,
					subjectAssignment.map((a) => a.id),
				),
			);
			await db.delete(assignment).where(eq(assignment.subjectId, numberId));
			await db.delete(material).where(eq(material.subjectId, numberId));
			await db.delete(schedule).where(eq(schedule.subjectId, numberId));
			await db.delete(subject).where(eq(subject.id, numberId));
		} catch (error) {
			console.error(error);
			return fail(500, {
				delete: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error. Please try again.",
				},
			});
		}
		redirect(303, "/admin/subject");
	},
};
