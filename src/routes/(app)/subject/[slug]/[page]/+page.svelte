<script lang="ts">
	import type { PageServerData } from "./$types";
	import Forum from "$lib/components/page/forum.svelte";

	let { data }: { data: PageServerData } = $props();
</script>

<Forum forumList={data.forum} />
