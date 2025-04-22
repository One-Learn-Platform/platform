<script lang="ts">
	import type { PageProps } from "./$types";

	import Stats from "$lib/components/stats.svelte";

	let { data }: PageProps = $props();
</script>

<div class="flex w-full flex-row gap-2 *:grow">
	<Stats title="User Count" number={data.userCount[0].count} />
	<Stats title="School Count" number={data.schoolCount[0].count} />
</div>
