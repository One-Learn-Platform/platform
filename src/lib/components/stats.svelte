<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";

	let { number, desc, title }: { number?: number; desc?: string; title: string } = $props();
	const formattedNumber = $derived.by(() => number?.toLocaleString());
</script>

<Card.Root>
	<Card.Header class="">
		<Card.Title class="">{title}</Card.Title>
		{#if desc}
			<Card.Description>{desc}</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content class="text-center font-mono text-3xl font-semibold tracking-tight">
		<p>{formattedNumber}</p>
	</Card.Content>
</Card.Root>
