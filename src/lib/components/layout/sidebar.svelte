<script lang="ts">
	import { page } from "$app/state";

	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	const sidebar = useSidebar();

	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";

	import { appNav } from "$lib/assets/nav/app";

	const grade = [
		{ title: "Grade 12", number: "12" },
		{ title: "Grade 11", number: "11" },
		{ title: "Grade 10", number: "10" },
	];
	let selectedGrade = $state(grade[0]);
</script>

<Sidebar.Root
	collapsible="icon"
	class="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
>
	<Sidebar.Header class="bg-background">
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
										class="flex items-center justify-center font-mono text-sm font-extrabold tracking-tight duration-150 group-data-[collapsible=icon]:text-lg"
									>
										{selectedGrade.number}
									</span>
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{selectedGrade.title}</span>
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
							<DropdownMenu.Item class="gap-2 p-2" onclick={() => (selectedGrade = item)}>
								<div class="flex size-6 items-center justify-center rounded-md border">
									<span
										class="flex size-3.5 shrink-0 items-center justify-center font-mono text-sm font-extrabold tracking-tight"
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
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each appNav as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								class="h-10"
								isActive={item.title === "Dashboard"
									? page.url.pathname === item.href
									: page.url.pathname.startsWith(item.href)}
							>
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
