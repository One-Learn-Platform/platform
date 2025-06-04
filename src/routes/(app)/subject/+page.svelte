<script lang="ts">
	import type { PageServerData } from "./$types";

	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";

	import Dna from "@lucide/svelte/icons/dna";

	import Subject from "$lib/components/subject.svelte";

	let { data }: { data: PageServerData } = $props();
</script>

<h1 class="font-display text-3xl font-semibold">Subjects</h1>
{#each data.subjectList as subject (subject.id)}
	<Subject {subject} />
{/each}
