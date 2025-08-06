<script lang="ts">
	import type { PageData } from "./$types";

	import * as Card from "$lib/components/ui/card/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	import UserChart from "$lib/components/chart/user.svelte";

	let { data }: { data: PageData } = $props();
	const stats = $derived.by(() => {
		const isSuperadmin = data.user.role === 1;
		return [
			...(isSuperadmin
				? [
						{
							title: "School Count",
							number: data.schoolList?.length,
						},
					]
				: []),
			{
				title: "Subject Count",
				number: data.subjectList?.length,
			},
			{
				title: "Material Count",
				number: data.materialList?.length,
			},
			{
				title: "Forum Count",
				number: data.forumList?.length,
			},
			{
				title: "Assignment Count",
				number: data.assignmentList?.length,
			},
			{
				title: "Submission Count",
				number: data.submissionList?.length,
			},
			{
				title: "Announcement Count",
				number: data.announcementList?.length,
			},
			{
				title: "Comment Count",
				number: data.commentList?.length,
			},
		];
	});
	const userFiltered = $derived.by(() => {
		const users = data.allUsers;
		const isSuperadmin = data.user.role === 1;

		return [
			{
				role: "total",
				count: users.length,
			},
			...(isSuperadmin
				? [
						{
							role: "superadmin",
							count: users.filter((u) => u.roleId === 1).length,
						},
					]
				: []),
			{
				role: "admin",
				count: users.filter((u) => u.roleId === 2).length,
			},
			{
				role: "teacher",
				count: users.filter((u) => u.roleId === 3).length,
			},
			{
				role: "student",
				count: users.filter((u) => u.roleId === 4).length,
			},
		];
	});
</script>

<div class="flex h-full flex-col gap-2">
	<Card.Root class="justify-between">
		<Card.Header class="">
			<Card.Title class="">User Count</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-row items-center justify-center gap-4 tracking-tight">
			{#each userFiltered as user, index (user.role)}
				{#if index > 0}
					<Separator orientation="vertical" />
				{/if}
				<div class="flex flex-col items-center justify-center gap-0">
					<p class="text-2xl font-semibold">{user.count}</p>
					<p class="text-sm text-muted-foreground {index === 0 ? 'font-semibold' : ''}">
						{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
					</p>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>
	<UserChart userList={data.userList} />
	<div class="grid w-full grid-cols-2 gap-2">
		{#each stats as stat (stat.title)}
			<Card.Root class=" justify-between">
				<Card.Header class="">
					<Card.Title class="">{stat.title}</Card.Title>
				</Card.Header>
				<Card.Content class="text-center font-mono text-3xl font-semibold tracking-tight">
					<p>{stat.number}</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
