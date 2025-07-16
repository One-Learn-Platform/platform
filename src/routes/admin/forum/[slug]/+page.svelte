<script lang="ts">
	import { enhance as svelteEnhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import type { PageProps } from "./$types";

	import { toast } from "svelte-sonner";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";

	let { data, form }: PageProps = $props();

	const forumDetail = $derived(data.forumData);

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success) {
				invalidateAll();
			} else toast.error(form.delete.message ?? "Unknown error");
		}
	});
</script>

<div class="space-y-2 pr-2 pb-2">
	<h1 class="font-display text-3xl font-semibold tracking-tight">Forum Detail</h1>
	<Card.Root id="edit">
		<Card.Header>
			<Card.Title class="font-display text-2xl sm:text-3xl">{forumDetail.title}</Card.Title>
		</Card.Header>

		<Card.Content class="space-y-2">
			{@html forumDetail.description}
		</Card.Content>
		<Card.Footer>
			<p class="text-sm text-muted-foreground">
				Created by {forumDetail.user} on {new Date(
					forumDetail.createdAt + "Z",
				).toLocaleDateString()}
			</p>
		</Card.Footer>
	</Card.Root>

	<AlertDialog.Root>
		<AlertDialog.Trigger class={buttonVariants({ variant: "destructive" })}>
			Delete
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<form class="contents" action="?/delete" method="POST" use:svelteEnhance>
				<AlertDialog.Header>
					<AlertDialog.Title>Do you want to delete subject {forumDetail.title}?</AlertDialog.Title>
					<AlertDialog.Description>
						<input type="hidden" name="id" value={forumDetail.id} />
						This action is irreversible. Are you sure you want to delete
						<b>{forumDetail.title}</b>?
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="submit">Delete</AlertDialog.Action>
				</AlertDialog.Footer>
			</form>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
