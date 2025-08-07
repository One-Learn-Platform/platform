<script lang="ts">
	import { us } from "../data/about";

	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import { acronym } from "$lib/utils";
</script>

<svelte:head>
	<title>One Learn - About</title>
</svelte:head>

<main class="min-h-dvh px-4 py-12 pt-14 sm:px-16 sm:py-20 md:px-20 md:py-30 lg:px-24">
	<h1 class="text-center text-4xl font-medium tracking-tight sm:text-5xl sm:tracking-tighter">
		About Us
	</h1>
	<Separator class="mb-1" />
	<div class="space-y-4">
		{#each us as person (person.name)}
			<div class="flex flex-row items-start gap-4 p-2">
				<Avatar.Root>
					<Avatar.Image src={person.image} alt="@shadcn" />
					<Avatar.Fallback>{acronym(person.name)}</Avatar.Fallback>
				</Avatar.Root>
				<div class="space-y-1">
					<h2 class="text-3xl font-medium tracking-tight">{person.name}</h2>
					<div class="space-x-1">
						<Button variant="outline" size="sm" href={`mailto:${person.email}`}>Email</Button>
						<Button
							variant="outline"
							size="sm"
							href={person.linkedin}
							target="_blank"
							rel="noopener noreferrer">LinkedIn</Button
						>
						{#if person.github}
							<Button
								variant="outline"
								size="sm"
								href={person.github}
								target="_blank"
								rel="noopener noreferrer">GitHub</Button
							>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</main>
