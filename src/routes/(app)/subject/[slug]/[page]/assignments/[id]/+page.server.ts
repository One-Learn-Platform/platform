import type { QuestionType } from "$lib/types/assignment";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { formSchema } from "$lib/schema/assignment/schema";
import { fail as superFail, setError, superValidate, withFiles } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { assignment, assignmentQuestion, subject } from "$lib/schema/db";
import { getDb } from "$lib/server/db";
import { getR2 } from "$lib/server/r2";
import { getFileExtension, getFileName, getTimeStamp } from "$lib/utils";
import { and, count, eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
	const schoolId = event.locals.user?.school;
	const subjectCode = event.params.slug;
	const chapter = Number(event.params.page);
	const id = Number(event.params.id);
	if (event.locals.user) {
		if (!event.locals.user.school) {
			return error(403, "Forbidden");
		}
		if (isNaN(id) || id < 1) {
			return error(400, "Invalid assignment ID");
		}
		if (isNaN(chapter) || chapter < 1) {
			return error(400, "Invalid chapter");
		}
		if (!subjectCode) {
			return error(400, "Invalid subject");
		}
		if (!schoolId) {
			return error(403, "Forbidden");
		}
		const db = getDb(event);
		const selectedSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!selectedSubject) {
			return error(404, "Subject not found");
		}
		const selectedAssignments = await db
			.select()
			.from(assignment)
			.where(
				and(
					eq(assignment.subjectId, selectedSubject.id),
					eq(assignment.schoolId, schoolId),
					eq(assignment.chapter, chapter),
					eq(assignment.id, id),
				),
			)
			.get();
		if (!selectedAssignments) {
			return error(404, "Assignment not found");
		}
		const allQuestions = await db
			.select()
			.from(assignmentQuestion)
			.where(eq(assignmentQuestion.assignmentId, id));
		const questionCount = await db
			.select({ count: count() })
			.from(assignmentQuestion)
			.where(eq(assignmentQuestion.assignmentId, id))
			.get();

		return {
			assignment: selectedAssignments,
			questions: allQuestions,
			questionCount: questionCount?.count ?? 0,
			form: await superValidate(event, zod4(formSchema)),
		};
	}
	return redirect(302, "/signin");
};

export const actions: Actions = {
	edit: async (event) => {
		if (!event.locals.user) {
			return error(403, "Forbidden");
		}

		const form = await superValidate(event, zod4(formSchema));
		const subjectId = event.params.slug;
		const chapter = Number(event.params.page);
		const schoolId = event.locals.user.school;
		const assignmentId = Number(event.params.id);
		if (isNaN(chapter) || chapter < 1) {
			return error(400, "Invalid chapter");
		}
		if (isNaN(assignmentId) || assignmentId < 1) {
			return error(400, "Invalid assignment ID");
		}
		if (!schoolId) {
			return error(403, "Forbidden");
		}
		if (!form.valid) {
			setError(form, "", "Invalid form data");
			return superFail(400, {
				edit: {
					success: false,
					message: "Invalid form data",
				},
				form,
			});
		}
		const db = getDb(event);
		const selectedSubject = await db
			.select({ id: subject.id })
			.from(subject)
			.where(and(eq(subject.code, subjectId), eq(subject.schoolId, schoolId)))
			.get();

		if (!selectedSubject) {
			return superFail(404, {
				edit: {
					success: false,
					message: "Subject not found",
				},
				form,
			});
		}

		const oldAssignment = await db
			.select()
			.from(assignment)
			.where(eq(assignment.id, assignmentId))
			.get();
		if (!oldAssignment) {
			return superFail(404, {
				edit: {
					success: false,
					message: "Assignment not found",
				},
				form,
			});
		}
		const r2 = getR2(event);
		const attachmentArray: string[] = [];
		const oldAttachment = oldAssignment.attachment
			? (JSON.parse(oldAssignment.attachment) as string[])
			: [];
		if (form.data.attachment) {
			const uploadPromises = form.data.attachment.map(async (file) => {
				try {
					const uniqueFileName = `assignment/${selectedSubject.id}/${chapter}/${getFileName(file.name)}-${getTimeStamp()}.${getFileExtension(file.name)}`;
					attachmentArray.push(uniqueFileName);
					const fileBuffer = await file.arrayBuffer();
					await r2.put(uniqueFileName, fileBuffer);
					return { success: true };
				} catch (error) {
					console.error("Error uploading file:", error, file.name);
					return { success: false, fileName: file.name };
				}
			});
			const results = await Promise.all(uploadPromises);
			const failures = results.filter((result) => !result.success);
			if (failures.length > 0) {
				throw new Error(
					`Failed to upload files: ${failures.map((f) => f.fileName).join(", ")}. Please try again.`,
				);
			}
		}
		try {
			await db
				.update(assignment)
				.set({
					title: form.data.title,
					description: form.data.description,
					dueDate: form.data.dueDate,
					attachment: attachmentArray.length > 0 ? JSON.stringify(attachmentArray) : undefined,
				})
				.where(eq(assignment.id, assignmentId));
			if (form.data.attachment && oldAttachment.length > 0) {
				await Promise.all(
					oldAttachment.map(async (element) => {
						await r2.delete(element);
					}),
				);
			}
		} catch (error) {
			await Promise.all(
				attachmentArray.map(async (element) => {
					await r2.delete(element);
				}),
			);
			console.error("Error inserting assignment:", error);
			setError(form, "", error instanceof Error ? error.message : "Failed to create assignment");
			return superFail(500, {
				edit: {
					success: false,
					message: error instanceof Error ? error.message : "Failed to create assignment",
				},
				form,
			});
		}

		return withFiles({
			edit: {
				success: true,
				message: null,
			},
			form,
		});
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
		if (isNaN(numberId) || numberId < 1) {
			return fail(400, {
				delete: { success: false, data: null, message: "ID is invalid. Please try again." },
			});
		}
		const selectedAssignment = await db
			.select()
			.from(assignment)
			.where(eq(assignment.id, numberId))
			.get();
		if (!selectedAssignment) {
			return fail(404, {
				delete: {
					success: false,
					data: null,
					message: "Assignment not found. Please try again.",
				},
			});
		}
		try {
			await db.delete(assignmentQuestion).where(eq(assignmentQuestion.assignmentId, numberId));
			await db.delete(assignment).where(eq(assignment.id, numberId));
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
		return redirect(
			303,
			"/subject/" +
				selectedAssignment.subjectId +
				"/" +
				selectedAssignment.chapter +
				"/assignments",
		);
	},
	addquestion: async (event) => {
		if (!event.locals.user) {
			return error(403, "Forbidden");
		}
		if (event.locals.user.role !== 3) {
			return error(403, "Forbidden");
		}
		const subjectCode = event.params.slug;
		const schoolId = event.locals.user.school;
		const chapter = Number(event.params.page);
		const formData = await event.request.formData();

		const db = getDb(event);
		const r2 = getR2(event);
		const assignmentId = Number(event.params.id);
		if (isNaN(assignmentId) || assignmentId < 1) {
			return fail(400, {
				create: { success: false, input: null, message: "Invalid assignment ID" },
			});
		}
		if (isNaN(chapter) || chapter < 1) {
			return fail(400, {
				create: { success: false, input: null, message: "Invalid chapter" },
			});
		}
		if (!subjectCode) {
			return error(400, "Invalid subject");
		}
		if (!schoolId) {
			return error(403, "Forbidden");
		}
		const selectedSubject = await db
			.select()
			.from(subject)
			.where(and(eq(subject.code, subjectCode), eq(subject.schoolId, schoolId)))
			.get();
		if (!selectedSubject) {
			return fail(404, {
				create: { success: false, input: null, message: "Subject not found" },
			});
		}

		const questionAmount = Number(formData.get("questionAmount"));
		for (let i = 0; i < questionAmount; i++) {
			const questionType = formData.get(`question-${i}-type`) as QuestionType;
			const question = formData.get(`question-${i}`) as string;
			const answer = formData.get(`answer-${i}`) as string;
			if (!question || question === "") {
				return fail(400, {
					create: {
						success: false,
						input: "question",
						message: `Question ${i + 1} is empty. Please fill in the question`,
					},
				});
			}
			const attachmentArray: string[] = [];
			const attachment = formData
				.getAll(`question-${i}-attachment`)
				.filter((file): file is File => {
					return file instanceof File && file.size > 0 && file.name !== "";
				});

			const beforeQuestion = await db
				.select()
				.from(assignmentQuestion)
				.where(
					and(
						eq(assignmentQuestion.assignmentId, assignmentId),
						eq(assignmentQuestion.question, question),
						eq(assignmentQuestion.answer, answer),
					),
				)
				.get();
			if (beforeQuestion) {
				if (beforeQuestion.attachment) {
					const beforeAttachment = JSON.parse(beforeQuestion.attachment) as string[];
					if (beforeAttachment.length > 0) {
						await Promise.all(
							beforeAttachment.map(async (element) => {
								await r2.delete(element);
							}),
						);
					}
				}
				await db.delete(assignmentQuestion).where(eq(assignmentQuestion.id, beforeQuestion.id));
			}
			if (attachment && attachment.length > 0) {
				console.log("Uploading attachments for question", i + 1);
				const uploadPromises = attachment.map(async (file) => {
					try {
						const uniqueFileName = `assignment/${selectedSubject.id}/${chapter}/${assignmentId}/${getFileName(file.name)}-${getTimeStamp()}.${getFileExtension(file.name)}`;
						attachmentArray.push(uniqueFileName);
						const fileBuffer = await file.arrayBuffer();
						await r2.put(uniqueFileName, fileBuffer);
						return { success: true };
					} catch (error) {
						console.error("Error uploading file:", error, file.name);
						return { success: false, fileName: file.name };
					}
				});
				const results = await Promise.all(uploadPromises);
				const failures = results.filter((result) => !result.success);
				if (failures.length > 0) {
					throw new Error(
						`Failed to upload files: ${failures.map((f) => f.fileName).join(", ")}. Please try again.`,
					);
				}
			}
			if (!questionType) {
				return fail(400, {
					create: { success: false, input: null, message: "Invalid question type" },
				});
			} else if (questionType === "multiple-choice") {
				const choices = formData.getAll(`answer-${i}-choice`);
				if (!choices || choices.length === 0) {
					return fail(400, {
						create: {
							success: false,
							input: "answer",
							message: `Question ${i + 1} doesn't have any answer choices. At least 2 choices are required for multiple choice questions`,
						},
					});
				}
				if (choices.length < 2) {
					return fail(400, {
						create: {
							success: false,
							input: "answer",
							message: `Question ${i + 1} has too few choices. At least 2 choices are required for multiple choice questions`,
						},
					});
				}
				if (choices.length > 6) {
					return fail(400, {
						create: {
							success: false,
							input: "answer",
							message: `Question ${i + 1} has too many choices. Maximum 6 choices are allowed for multiple choice questions`,
						},
					});
				}
				for (const choice of choices) {
					if (!choice || choice === "") {
						return fail(400, {
							create: {
								success: false,
								input: "answer",
								message: `Question ${i + 1} has an invalid choice. Choice cannot be empty`,
							},
						});
					}
				}
				// Check for duplicates using Set size comparison
				if (new Set(choices).size !== choices.length) {
					return fail(400, {
						create: {
							success: false,
							input: "answer",
							message: `Question ${i + 1} has duplicate choices. Choices must be unique`,
						},
					});
				}
				if (!answer) {
					return fail(400, {
						create: {
							success: false,
							input: "answer",
							message: `Question ${i + 1} doesn't not have answer. Answer is required for multiple choice questions`,
						},
					});
				}
				try {
					await db.insert(assignmentQuestion).values({
						assignmentId: assignmentId,
						question: question.toString(),
						choice: JSON.stringify(choices),
						questionType: questionType,
						attachment: attachmentArray.length > 0 ? JSON.stringify(attachmentArray) : undefined,
						answer: answer.toString(),
					});
				} catch (error) {
					await Promise.all(
						attachmentArray.map(async (element) => {
							await r2.delete(element);
						}),
					);
					console.error("Error inserting question:", error);
					return fail(500, {
						create: {
							success: false,
							input: null,
							message:
								error instanceof Error
									? error.message
									: "Unknown error occurred while inserting question",
						},
					});
				}
			} else {
				if (!answer || answer === "") {
					return fail(400, {
						create: {
							success: false,
							input: "answer",
							message: `Question ${i + 1} doesn't not have answer. Answer is required`,
						},
					});
				}
				try {
					await db.insert(assignmentQuestion).values({
						assignmentId: assignmentId,
						question: question.toString(),
						questionType: questionType,
						answer: answer.toString(),
						attachment: attachmentArray.length > 0 ? JSON.stringify(attachmentArray) : undefined,
					});
				} catch (error) {
					await Promise.all(
						attachmentArray.map(async (element) => {
							await r2.delete(element);
						}),
					);
					console.error("Error inserting question:", error);
					return fail(500, {
						create: {
							success: false,
							input: null,
							message:
								error instanceof Error
									? error.message
									: "Unknown error occurred while inserting question",
						},
					});
				}
			}
		}
		return {
			create: {
				success: true,
				input: null,
				message: null,
			},
		};
	},
};
