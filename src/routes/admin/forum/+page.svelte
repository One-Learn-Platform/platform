<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";

	import Plus from "@lucide/svelte/icons/plus";

	import { Button } from "$lib/components/ui/button/index.js";
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
	<Button disabled variant="outline"><Plus />Add</Button>
	<DataTable data={forumList} {columns} />
</div>
