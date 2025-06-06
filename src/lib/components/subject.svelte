<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import type { Subject } from "$lib/schema/db";

	import Dna from "@lucide/svelte/icons/dna";
	let { subject }: { subject: Subject } = $props();
</script>

<Button
	variant="outline"
	class="flex h-full w-full flex-row items-stretch justify-start gap-4 p-6!"
	href={`/subject/${subject.code}`}
>
	<Dna class="size-12 " />
	<div>
		<div>
			{subject.code}
			<Badge variant="informative_muted">LAB</Badge>
		</div>
		<div class="text-2xl font-semibold">{subject.name}</div>
	</div>
</Button>
