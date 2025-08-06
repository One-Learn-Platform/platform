<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import type { TeacherAssign } from "$lib/schema/db";
	import type { PageProps } from "./$types";
	import { PersistedState } from "runed";

	import { cn } from "$lib/utils.js";
	import CheckIcon from "@lucide/svelte/icons/check";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import X from "@lucide/svelte/icons/x";
	import { tick } from "svelte";
	import { toast } from "svelte-sonner";

	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Command from "$lib/components/ui/command/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";

	import { columns } from "./table/column";
	import DataTable from "./table/enrollment-table.svelte";

	let { data, form }: PageProps = $props();

	let dialogOpen = $state(false);
	let toBeDeleted: (TeacherAssign & { fullname: string }) | undefined = $state();
	let tabsType = new PersistedState("admin_subject_tabs", "single");
	let open = $state(false);
	let value: number | undefined = $state(undefined);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(data.teacherList.find((f) => f.id === value)?.fullname);
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	$effect(() => {
		if (form) {
			if (form.assign) {
				if (form.assign.success) {
					invalidateAll();
					toast.success("Student assigned successfully.");
				} else if (form.assign.message) {
					toast.error(form.assign.message);
				}
			} else if (form.unassign) {
				if (form.unassign.success) {
					invalidateAll();
					dialogOpen = false;
					toast.success("Student unassigned successfully.");
				} else if (form.unassign.message) {
					toast.error(form.unassign.message);
				}
			}
		}
	});
</script>

<svelte:head>
	<title>Edit Subject - Assign Teacher | OneLearn</title>
</svelte:head>

<div class="space-y-2 pr-2 pb-2">
	<div>
		<h1 class="font-display text-3xl font-semibold tracking-tight">
			{data.subjectData.name}
		</h1>
		<p class="font-mono text-muted-foreground">{data.subjectData.code}</p>
	</div>
	<Dialog.Root>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline">Assign Teacher</Button>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content>
			<form method="POST" action="?/assign" class="contents" use:enhance>
				<input type="hidden" name="type" value={tabsType.current} />
				<input type="hidden" name="subjectId" value={data.subjectData.id} />
				<Dialog.Header>
					<Dialog.Title>Add Teacher</Dialog.Title>
					<Dialog.Description>
						<Tabs.Root bind:value={tabsType.current} class="w-full">
							<Tabs.List class="w-full">
								<Tabs.Trigger value="single" class="w-full">Single</Tabs.Trigger>
								<Tabs.Trigger value="multiple" class="w-full">Multiple</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content value="single" class="text-foreground">
								<input type="hidden" name="selected" {value} />
								<Popover.Root bind:open>
									<Popover.Trigger bind:ref={triggerRef}>
										{#snippet child({ props })}
											<Button
												{...props}
												variant="outline"
												class="w-full justify-between"
												role="combobox"
												aria-expanded={open}
											>
												{selectedValue || "Select a teacher..."}
												<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
											</Button>
										{/snippet}
									</Popover.Trigger>
									<Popover.Content class="w-fit max-w-sm p-0">
										<Command.Root>
											<Command.Input placeholder="Search teacher..." />
											<Command.List>
												<Command.Empty>No Teacher found.</Command.Empty>
												<Command.Group value="teacher">
													{#each data.teacherList as teacher (teacher.id)}
														<Command.Item
															value={teacher.id.toString()}
															onSelect={() => {
																value = teacher.id;
																closeAndFocusTrigger();
															}}
														>
															<CheckIcon
																class={cn(
																	"mr-2 size-4",
																	value !== teacher.id && "text-transparent",
																)}
															/>
															{teacher.fullname}
														</Command.Item>
													{/each}
												</Command.Group>
											</Command.List>
										</Command.Root>
									</Popover.Content>
								</Popover.Root>
							</Tabs.Content>
							<Tabs.Content value="multiple" class="text-foreground">
								<DataTable data={data.teacherList} {columns} />
							</Tabs.Content>
						</Tabs.Root>
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<Dialog.Close>
						{#snippet child({ props })}
							<Button {...props} type="reset" variant="outline">Close</Button>
						{/snippet}
					</Dialog.Close>
					<Button type="submit" variant="default">Save changes</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<Table.Root>
		<Table.Caption>Current Assigned Teacher</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">No.</Table.Head>
				<Table.Head>Full Name</Table.Head>
				<Table.Head>Action</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if data.assigned.length === 0}
				<Table.Row>
					<Table.Cell colspan={3} class="text-center">
						No teacher assigned to this subject.
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each data.assigned as teacher, index (teacher.userId)}
					<Table.Row>
						<Table.Cell class="font-medium">{index + 1}</Table.Cell>
						<Table.Cell>{teacher.fullname}</Table.Cell>
						<Table.Cell class="">
							<Button
								variant="destructive"
								size="icon"
								onclick={() => {
									dialogOpen = true;
									toBeDeleted = teacher;
								}}><X /></Button
							>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
<AlertDialog.Root bind:open={dialogOpen}>
	<AlertDialog.Content>
		<form action="?/unenroll" method="POST" class="contents" use:enhance>
			<AlertDialog.Header>
				<AlertDialog.Title>Do you want to remove {toBeDeleted?.fullname}?</AlertDialog.Title>
				<AlertDialog.Description>
					<input type="hidden" name="subjectId" value={data.subjectData.id} />
					<input type="hidden" name="id" value={toBeDeleted?.userId} />
					This action cannot be undone. This will remove the teacher from this subject.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="reset">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit">Continue</AlertDialog.Action>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
