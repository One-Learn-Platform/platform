<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import type { Subject } from "$lib/schema/db";
	import { subjectColor, subjectAbbreviation } from "$lib/functions/subject";

	import Dna from "@lucide/svelte/icons/dna";
	import Calculator from "@lucide/svelte/icons/calculator";
	import UsersRound from "@lucide/svelte/icons/users-round";
	import Microscope from "@lucide/svelte/icons/microscope";
	import Shapes from "@lucide/svelte/icons/shapes";
	import Users from "@lucide/svelte/icons/users";
	import Atom from "@lucide/svelte/icons/atom";

	const Icons = $derived.by(() => {
		if (subject.name.toLocaleLowerCase().includes("bio")) return Dna;
		if (subject.name.toLocaleLowerCase().includes("math")) return Calculator;
		if (subject.name.toLocaleLowerCase().includes("science")) return Microscope;
		if (subject.name.toLocaleLowerCase().includes("history")) return UsersRound;
		if (subject.name.toLocaleLowerCase().includes("social")) return Users;
		if (subject.name.toLocaleLowerCase().includes("physics")) return Atom;

		return Shapes;
	});

	type SubjectWithName = Subject & { subjectTypeName: string };
	let { subject }: { subject: SubjectWithName } = $props();
</script>

<Button
	variant="outline"
	class="flex h-fit w-full flex-row items-stretch justify-start gap-4 p-6!"
	href={`/subject/${subject.code}`}
>
	<Icons class="size-12" />
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
