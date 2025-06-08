<script lang="ts">
	import type { PageData } from "./$types";

	import UserChart from "$lib/components/chart/user.svelte";
	import Stats from "$lib/components/stats.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-2">
	<UserChart userList={data.allUsers} />
	<div class="flex w-full flex-row gap-2 *:grow">
		<Stats title="User Count" number={data.userCount?.count} />
		<Stats title="School Count" number={data.schoolCount?.count} />
	</div>
</div>
