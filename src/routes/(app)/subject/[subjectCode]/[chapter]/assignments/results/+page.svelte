<script lang="ts">
	import type { PageServerData } from "./$types.js";
	import { page } from "$app/state";

	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";

	let { data }: { data: PageServerData } = $props();

	// Group submissions by assignment using the new data structure
	const assignmentsWithSubmissions = $derived.by(() => {
		return data.assignments.map((assignment) => {
			const students = data.submissions.filter((item) => item.id === assignment.id);
			const studentsGroup = students.map((student) => ({
				...student,
				hasSubmitted: student.submissionId !== null,
			}));

			const submissionCount = studentsGroup.filter((s) => s.hasSubmitted).length;

			const submittedStudents = studentsGroup.filter((s) => s.hasSubmitted && s.score !== null);
			const totalScore = submittedStudents.reduce((sum, student) => sum + (student.score || 0), 0);
			const averageScore = submittedStudents.length > 0 ? totalScore / submittedStudents.length : 0;

			return {
				...assignment,
				allStudentsWithStatus: studentsGroup,
				submissionCount,
				totalStudents: studentsGroup.length,
				submissionRate:
					studentsGroup.length > 0 ? (submissionCount / studentsGroup.length) * 100 : 0,
				averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
				totalScore,
				gradedCount: submittedStudents.length, // Number of students with scores
			};
		});
	});
</script>

<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Assignment Results</h1>
<div class="space-y-4">
	{#each assignmentsWithSubmissions as assignment (assignment.id)}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center justify-between text-xl">
					{assignment.title}
					<Button
						variant="outline"
						href="/subject/{page.params.subjectCode}/{page.params
							.chapter}/assignments/{assignment.id}/details"
					>
						View Details
					</Button>
				</Card.Title>
				<Card.Description>
					{assignment.description}
					<br class="mb-2" />
					<span class="text-base font-medium text-foreground">
						Due Date: {new Date(assignment.dueDate + "Z").toLocaleDateString(undefined, {
							dateStyle: "full",
						})}
					</span>
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Caption class="text-left">
						Submission Rate: {assignment.submissionRate.toFixed(1)}% ({assignment.submissionCount}/{assignment.totalStudents})
						<br />
						Average Score: {assignment.averageScore > 0
							? `${assignment.averageScore}/100`
							: "No scores yet"}
						{#if assignment.gradedCount < assignment.submissionCount}
							<span class="text-xs text-muted-foreground">({assignment.gradedCount} graded)</span>
						{/if}
					</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head class="w-[200px]">Status</Table.Head>
							<Table.Head class="w-[200px]">Score</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each assignment.allStudentsWithStatus as student (`${assignment.id}-${student.userId}`)}
							<Table.Row>
								<Table.Cell class="font-medium">{student.fullname}</Table.Cell>
								<Table.Cell>
									{#if student.hasSubmitted}
										<Badge variant="success_muted">Submitted</Badge>
									{:else}
										<Badge variant="destructive_muted">Not Submitted</Badge>
									{/if}
								</Table.Cell>
								<Table.Cell class="font-mono">
									{student.hasSubmitted ? student.score : "-"}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer>
				<p class="text-sm text-muted-foreground">
					<span class="text-success">
						{assignment.submissionCount} submitted
					</span>
					•
					<span class="text-destructive">
						{assignment.totalStudents - assignment.gradedCount} not submitted
					</span>
				</p>
			</Card.Footer>
		</Card.Root>
	{/each}
</div>
