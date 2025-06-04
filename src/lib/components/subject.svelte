<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";

	import type { Subject } from "$lib/schema/db";

	import Dna from "@lucide/svelte/icons/dna";
	let { subject }: { subject: Subject } = $props();
</script>

<Card.Root>
	<Card.Header class="">
		<div class="flex h-full items-center gap-2">
			<Dna class="h-full w-auto" />
			<div>
				<Card.Description>
					Card Description <Badge variant="informative_muted">LAB</Badge>
				</Card.Description>
				<Card.Title class="text-2xl">Card Title</Card.Title>
			</div>
		</div>
	</Card.Header>
</Card.Root>
