<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";

	import Plus from "@lucide/svelte/icons/plus";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	import { toast } from "svelte-sonner";

	import DataTable from "$lib/components/table/data-table.svelte";
	import { columns } from "./columns";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const forumList = $derived(data.forumList);

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success)
				toast.success(`Forum ${form.delete.data?.name} successfully deleted`);
			else toast.error(form.delete.message ?? "Unknown error");
		}
	});
</script>

<div class="flex flex-col gap-2 bg-background">
	<Tooltip.Provider delayDuration={300}>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						disabled
						variant="outline"
						class="hover:bg-background disabled:pointer-events-auto!"
					>
						<Plus />Add
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content class="bg-destructive" arrowClasses="bg-destructive">
				<p>You can't create a forum here.</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
	<DataTable data={forumList} {columns} />
</div>
