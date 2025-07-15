<script lang="ts">
	import type { ActionData, PageServerData } from "./$types";

	import Plus from "@lucide/svelte/icons/plus";

	import { Button } from "$lib/components/ui/button/index.js";
	import { toast } from "svelte-sonner";

	import DataTable from "$lib/components/table/enrollment-table.svelte";
	import { columns } from "./columns";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	const subjectList = $derived(data.subjectList);

	$effect(() => {
		if (form?.delete) {
			if (form.delete.success)
				toast.success(`Subject ${form.delete.data?.name} successfully deleted`);
			else toast.error(form.delete.message ?? "Unknown error");
		} else {
			if (form?.create) {
				if (form.create.success)
					toast.success(`Subject ${form.create.data?.name} successfully created`);
				else toast.error(form.create.message ?? "Unknown error");
			}
		}
	});
</script>

<div class="flex flex-col gap-2 bg-background">
	<Button variant="outline" href="/admin/subject"><Plus />Add</Button>
	<DataTable data={subjectList} {columns} />
</div>
