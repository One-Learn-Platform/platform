<script lang="ts">
	import { page } from "$app/state";
	import { browser } from "$app/environment";
	import { invalidate } from "$app/navigation";
	import { PUBLIC_R2_URL } from "$env/static/public";

	import type { Grades, School } from "$lib/schema/db";

	import { PersistedState } from "runed";

	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	const sidebar = useSidebar();

	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";

	import { appNav } from "$lib/assets/nav/app";
	let { grades, school }: { grades: Grades[]; school: School } = $props();
	const grade = $derived([
		...grades.map((g) => ({
			title: `Grade ${g.level}`,
			number: g.level.toString(),
			id: g.id,
		})),
		{
			title: "Show All",
			number: "all",
			id: -1,
		},
	]);

	let selectedGrade = new PersistedState<{ title: string; number: string; id: number } | null>(
		"selectedGrade",
		null,
	);
	$effect(() => {
		if (!selectedGrade.current && grade.length > 0) {
			selectedGrade.current = grade[0];
		}
	});
	const updateGrade = async (newGrade: (typeof grade)[0]) => {
		selectedGrade.current = newGrade;
		if (browser) {
			document.cookie = `selectedGrade=${newGrade.number}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
			await invalidate("app:selectedGrade");
		}
	};
</script>

<Sidebar.Root
	collapsible="icon"
	class="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
>
	<Sidebar.Header class="bg-background">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="h-16 data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<img
								src="{PUBLIC_R2_URL}/{school.logo}"
								alt=""
								class="size-12 object-contain p-1 transition-all duration-200 ease-linear group-data-[collapsible=icon]:p-0"
							/>
							<div class="font-display text-xl font-semibold tracking-tight text-primary">
								{school.name}
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								size="md"
								class="border p-1.5 shadow-xs group-data-[collapsible=icon]:border-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div
									class="flex aspect-square size-6 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground duration-150 group-data-[collapsible=icon]:size-8"
								>
									<span
										class="flex items-center justify-center font-display text-sm font-extrabold tabular-nums duration-150 group-data-[collapsible=icon]:text-lg"
									>
										{selectedGrade.current?.number}
									</span>
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{selectedGrade.current?.title}</span>
								</div>
								<ChevronsUpDownIcon class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
						align="start"
						side={sidebar.isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenu.Label class="text-xs text-muted-foreground">Grades</DropdownMenu.Label>
						{#each grade as item (item.title)}
							<DropdownMenu.Item
								class="gap-2 p-2"
								onclick={async () => {
									selectedGrade.current = item;
									await updateGrade(item);
								}}
							>
								<div class="flex size-6 items-center justify-center rounded-md border">
									<span
										class="flex size-3.5 shrink-0 items-center justify-center font-display text-sm font-extrabold tabular-nums"
									>
										{item.number}
									</span>
								</div>
								{item.title}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content class="bg-background">
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each appNav as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton class="h-10" isActive={page.url.pathname.startsWith(item.href)}>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
