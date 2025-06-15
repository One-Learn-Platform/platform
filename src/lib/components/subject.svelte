<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import type { Subject } from "$lib/schema/db";
	import { subjectColor, subjectAbbreviation } from "$lib/functions/subject";

	import Dna from "@lucide/svelte/icons/dna";
	type SubjectWithName = Subject & { subjectTypeName: string };
	let { subject }: { subject: SubjectWithName } = $props();
</script>

<Button
	variant="outline"
	class="flex h-fit w-full flex-row items-stretch justify-start gap-4 p-6!"
	href={`/subject/${subject.code}`}
>
	<Dna class="size-12 " />
	<div>
		<div class="flex items-center gap-2">
			{subject.code}
			<Badge variant={subjectColor(subject.subjectTypeName)}>
				{subjectAbbreviation(subject.subjectTypeName)}
			</Badge>
		</div>
		<div class="text-2xl font-semibold">{subject.name}</div>
	</div>
</Button>
