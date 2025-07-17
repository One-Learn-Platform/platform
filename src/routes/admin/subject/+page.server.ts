import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchemaCreate } from "$lib/schema/subject/schema";
import { fail, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { school, subject, subjectType, user } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { eq, getTableColumns, or } from "drizzle-orm";
import { and } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		if (event.locals.user.role === 1 || event.locals.user.role === 2) {
			const db = getDb(event);
			const { ...rest } = getTableColumns(subject);
			const teacherList = await db.select().from(user).where(eq(user.roleId, 3));
			const schoolList = await db.select().from(school);
			const subjectTypeList = await db.select().from(subjectType);
			let subjectList;
			if (event.locals.user.school) {
				subjectList = await db
					.select({ ...rest, teacherName: user.fullname, subjectTypeName: subjectType.name })
					.from(subject)
					.where(eq(subject.schoolId, event.locals.user.school))
					.leftJoin(user, eq(user.id, subject.teacher))
					.leftJoin(subjectType, eq(subject.subjectType, subjectType.id));
			} else {
				subjectList = await db
					.select({ ...rest, teacherName: user.fullname, subjectTypeName: subjectType.name })
					.from(subject)
					.leftJoin(user, eq(user.id, subject.teacher))
					.leftJoin(subjectType, eq(subject.subjectType, subjectType.id));
			}
			return {
				subjectList: subjectList,
				teacherList: teacherList,
				schoolList: schoolList,
				subjectTypeList: subjectTypeList,
				form: await superValidate(zod4(formSchemaCreate)),
			};
		}
	} else {
		return error(404, { message: "Not Found" });
	}
	return redirect(302, "/sigin");
};

export const actions: Actions = {
	create: async (event) => {
		const db = getDb(event);
		const form = await superValidate(event, zod4(formSchemaCreate));
		const teacherId = Number(form.data.teacher);
		const school = event.locals.user?.school;

		if (event.locals.user?.role === 1) {
			setError(form, "", "Super Admin cannot create subjects");
			return fail(400, {
				create: {
					success: false,
					data: null,
					message: "Super Admin cannot create subjects",
				},
				form,
			});
		}
		if (!school) {
			setError(form, "", "No school found for the user");
			return fail(400, {
				create: {
					success: false,
					data: null,
					message: "No school found for the user",
				},
				form,
			});
		}

		if (!form.valid) {
			setError(form, "", "Content is invalid, please try again");
			return fail(400, {
				create: { success: false, data: null, message: "Content is invalid, please try again" },
				form,
			});
		}

		if (isNaN(teacherId) || teacherId <= 0) {
			setError(form, "teacher", "Invalid teacher ID, please select a valid teacher");
			return fail(400, {
				create: {
					success: false,
					data: null,
					message: "Invalid teacher ID, please select a valid teacher",
				},
				form,
			});
		}

		const teacher = await db.select().from(user).where(eq(user.id, teacherId)).get();
		if (!teacher) {
			setError(form, "teacher", "Teacher not found, please select a valid teacher");
			return fail(404, {
				create: {
					success: false,
					data: null,
					message: "Teacher not found, please select a valid teacher",
				},
				form,
			});
		}

		const existingSubject = await db
			.select()
			.from(subject)
			.where(
				and(eq(subject.code, form.data.code.toLocaleLowerCase()), eq(subject.schoolId, school)),
			)
			.get();
		if (existingSubject) {
			setError(form, "code", "Subject code already exists, please use a different code");
			return fail(400, {
				create: {
					success: false,
					data: null,
					message: "Subject code already exists, please use a different code",
				},
				form,
			});
		}

		try {
			await db.insert(subject).values({
				teacher: teacher.id,
				code: form.data.code.toLocaleLowerCase(),
				name: form.data.name,
				schoolId: school,
				chapterCount: Number(form.data.chapterCount),
				subjectType: Number(form.data.subjectType),
			});

			return {
				create: {
					success: true,
					data: { name: form.data.name, code: form.data.code },
					message: null,
				},
				form,
			};
		} catch (error) {
			console.error(error);
			setError(form, "", error instanceof Error ? error.message : "Unknown error", { status: 500 });
			return fail(500, {
				create: {
					success: false,
					data: null,
					message: error instanceof Error ? error.message : "Unknown error",
				},
				form,
			});
		}
	},

	delete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const id = formData.get("id");

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
		try {
			const name = await db.select().from(subject).where(eq(subject.id, numberId)).get();
			await db.delete(subject).where(eq(subject.id, numberId));
			return {
				delete: {
					success: true,
					data: {
						id: numberId,
						name: name?.name,
					},
					message: null,
				},
			};
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
	},
	multidelete: async (event) => {
		const db = getDb(event);
		const formData = await event.request.formData();
		const ids = formData.get("ids");
		const idArray = ids
			?.toString()
			.split(",")
			.map((id) => Number(id));

		if (!idArray) {
			return fail(400, {
				delete: { success: false, data: null, message: "Failed to get ID. Please try again." },
			});
		}

		const subjectArray = await db
			.select()
			.from(subject)
			.where(or(...idArray.map((id) => eq(subject.id, id))));
		const SubjectNameArray = subjectArray.map((subject) => subject.name);

		idArray.forEach(async (id) => {
			if (isNaN(id)) {
				return fail(400, {
					delete: { success: false, data: null, message: "ID is not a number. Please try again." },
				});
			}
			try {
				await db.delete(subject).where(eq(subject.id, id));
			} catch (error) {
				console.error(error);
				return fail(500, {
					delete: {
						success: false,
						data: null,
						message: error instanceof Error ? error.message : "Unknown error, please try again.",
					},
				});
			}
		});

		return {
			delete: {
				success: true,
				data: {
					id: idArray?.join(","),
					name: SubjectNameArray.join(", "),
				},
				message: null,
			},
		};
	},
};
