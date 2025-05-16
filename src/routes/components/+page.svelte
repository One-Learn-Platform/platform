<script lang="ts">
	import * as Alert from "$lib/components/ui/alert/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";

	import BadgeInfo from "@lucide/svelte/icons/badge-info";
</script>

<h1>All Components</h1>
<div class="flex flex-wrap items-center justify-start">
	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Alert</h2>
		<div class="mt-2 flex gap-2">
			<Alert.Root variant="default">
				<BadgeInfo class="size-4" />
				<Alert.Title>Default</Alert.Title>
				<Alert.Description>Default</Alert.Description>
			</Alert.Root>
			<Alert.Root variant="destructive">
				<BadgeInfo class="size-4" />

				<Alert.Title>Destructive</Alert.Title>
				<Alert.Description>Fill</Alert.Description>
			</Alert.Root>
			<Alert.Root variant="destructive" outline>
				<BadgeInfo class="size-4" />
				<Alert.Title>Destructive</Alert.Title>
				<Alert.Description>Outline</Alert.Description>
			</Alert.Root>
			<Alert.Root variant="informative">
				<BadgeInfo class="size-4" />
				<Alert.Title>Informative</Alert.Title>
				<Alert.Description>Informative</Alert.Description>
			</Alert.Root>
			<Alert.Root variant="informative" outline>
				<BadgeInfo class="size-4" />
				<Alert.Title>Informative</Alert.Title>
				<Alert.Description>Informative</Alert.Description>
			</Alert.Root>
			<Alert.Root variant="warning">
				<BadgeInfo class="size-4" />
				<Alert.Title>Warning</Alert.Title>
				<Alert.Description>Warning</Alert.Description>
			</Alert.Root>
			<Alert.Root variant="warning" outline>
				<BadgeInfo class="size-4" />
				<Alert.Title>Warning</Alert.Title>
				<Alert.Description>Warning</Alert.Description>
			</Alert.Root>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Avatar</h2>
		<div class="mt-2 flex gap-2">
			<Avatar.Root>
				<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
				<Avatar.Fallback>CN</Avatar.Fallback>
			</Avatar.Root>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Button</h2>
		<div class="mt-2 flex gap-2">
			<Button variant="default">Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="link">Link</Button>
			<Button variant="destructive">Destructive</Button>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Card</h2>
		<div class="mt-2 flex gap-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Card Title</Card.Title>
					<Card.Description>Card Description</Card.Description>
				</Card.Header>
				<Card.Content>
					<p>Card Content</p>
				</Card.Content>
				<Card.Footer>
					<p>Card Footer</p>
				</Card.Footer>
			</Card.Root>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Dialog</h2>
		<div class="mt-2 flex gap-2">
			<Dialog.Root>
				<Dialog.Trigger>Open</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
						<Dialog.Description>
							This action cannot be undone. This will permanently delete your account and remove
							your data from our servers.
						</Dialog.Description>
					</Dialog.Header>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Label & Input</h2>
		<div class="mt-2 flex gap-2">
			<Label>Your email address</Label>
			<Input />
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Select</h2>
		<div class="mt-2 flex gap-2">
			<Select.Root type="single">
				<Select.Trigger class="w-[180px]"></Select.Trigger>
				<Select.Content>
					<Select.Item value="light">Light</Select.Item>
					<Select.Item value="dark">Dark</Select.Item>
					<Select.Item value="system">System</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Separator</h2>
		<div class="mt-2 flex gap-2">
			<Separator />
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Sheet</h2>
		<div class="mt-2 flex gap-2">
			<Sheet.Root>
				<Sheet.Trigger>Open</Sheet.Trigger>
				<Sheet.Content>
					<Sheet.Header>
						<Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
						<Sheet.Description>
							This action cannot be undone. This will permanently delete your account and remove
							your data from our servers.
						</Sheet.Description>
					</Sheet.Header>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Skeleton</h2>
		<div class="mt-2 flex gap-2">
			<Skeleton class="h-[20px] w-[100px] rounded-full" />
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Table</h2>
		<div class="mt-2 flex gap-2">
			<Table.Root>
				<Table.Caption>A list of your recent invoices.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Invoice</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Method</Table.Head>
						<Table.Head class="text-right">Amount</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.Cell class="font-medium">INV001</Table.Cell>
						<Table.Cell>Paid</Table.Cell>
						<Table.Cell>Credit Card</Table.Cell>
						<Table.Cell class="text-right">$250.00</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</div>
	</section>

	<section class="mx-8 my-4 h-fit w-fit rounded-md border px-4 py-2 pb-4">
		<h2 class="text-xl font-medium">Tabs</h2>
		<div class="mt-2 flex gap-2">
			<Tabs.Root value="account" class="w-[400px]">
				<Tabs.List>
					<Tabs.Trigger value="account">Account</Tabs.Trigger>
					<Tabs.Trigger value="password">Password</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="account">Make changes to your account here.</Tabs.Content>
				<Tabs.Content value="password">Change your password here.</Tabs.Content>
			</Tabs.Root>
		</div>
	</section>
</div>
