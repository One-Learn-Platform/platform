<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	import Logo from "$lib/assets/logosmall.svg";
	import LogoDark from "$lib/assets/logosmall_dark.svg";
	import HeroImage from "$lib/assets/landing/collaborating.jpg?enhanced";

	import Zap from "@lucide/svelte/icons/zap";
	import Shield from "@lucide/svelte/icons/shield";
	import Star from "@lucide/svelte/icons/star";

	import { features, stats } from "./data/landing";
</script>

<svelte:head>
	<title>One Learn</title>
</svelte:head>

<main class="space-y-8 antialiased">
	<section
		class="flex h-dvh flex-col items-center justify-center gap-4 bg-background bg-linear-150 from-orange-100 to-background to-75% px-2 sm:px-4 dark:from-orange-950"
	>
		<div class="flex flex-row items-center gap-1">
			<img src={Logo} alt="One Learn Logo" class="h-6 w-auto sm:h-8 dark:hidden" />
			<img src={LogoDark} alt="One Learn Logo Dark" class="hidden h-6 w-auto sm:h-8 dark:block" />
			<h1 class="font-display text-lg font-bold tracking-tight sm:text-xl">One Learn</h1>
		</div>
		<div class="space-y-4 px-2 sm:px-8">
			<p
				class="text-center text-4xl font-medium tracking-tight sm:text-5xl sm:tracking-tighter lg:text-6xl xl:text-7xl"
			>
				Empowering <span class="text-orange-500">Learning</span>. <wbr />Connecting
				<span class="text-orange-500">Minds</span>.
			</p>
			<p class="text-center text-lg tracking-tight text-muted-foreground sm:text-xl">
				A smart platform for students and teachers to connect, learn, and grow—anytime, anywhere
			</p>
		</div>
		<Button href="#intro">Get Started</Button>
	</section>
	<section
		id="intro"
		class="flex flex-col items-center justify-center gap-2 px-8 sm:px-16 sm:py-20 md:grid-cols-3 md:px-20 md:py-30 lg:grid-cols-4 lg:px-24"
	>
		<Badge
			variant="outline"
			class="border-none bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-100"
		>
			Features
		</Badge>
		<h2 class="text-center text-3xl font-semibold tracking-tighter sm:text-4xl lg:text-5xl">
			Everything you need to deliver exceptional learning
		</h2>
		<p class="mb-4 max-w-prose text-center text-muted-foreground sm:mb-8">
			Our comprehensive LMS platform provides all the tools educators need to create engaging,
			effective learning experiences.
		</p>
		<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
			{#each features as feature (feature.title)}
				{@const Icon = feature.icon}
				<Card.Root class="w-full gap-4">
					<Card.Content>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-sm bg-orange-500 text-white"
						>
							<Icon />
						</div>
					</Card.Content>
					<Card.Header>
						<Card.Title class="mt-2">{feature.title}</Card.Title>
						<Card.Description>{feature.description}</Card.Description>
					</Card.Header>
				</Card.Root>
			{/each}
		</div>
	</section>

	<section
		class="flex flex-col-reverse items-start justify-between gap-4 bg-neutral-50 px-8 py-16 sm:px-16 sm:py-20 md:px-20 md:py-30 lg:grid-cols-4 lg:flex-row lg:px-24 dark:bg-neutral-900"
	>
		<div class="space-y-1">
			<Badge
				variant="outline"
				class="border-none bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-100"
			>
				Why One Learn
			</Badge>
			<h2 class="text-4xl font-semibold tracking-tight">
				Accelerate learning outcomes with intelligent tools
			</h2>
			<p class="mb-4 max-w-prose text-muted-foreground">
				Our platform combines cutting-edge technology with proven educational methodologies to
				deliver measurable results for both educators and learners.
			</p>
			<ul class="space-y-4 font-medium">
				<li class="flex items-center gap-2">
					<Zap class="text-orange-500" /> Lightning-fast performance
				</li>
				<li class="flex items-center gap-2">
					<Shield class="text-orange-500" /> Enterprise-grade security
				</li>
				<li class="flex items-center gap-2">
					<Star class="text-orange-500" /> 99.9% uptime guarantee
				</li>
			</ul>
		</div>
		<div class="w-full lg:w-1/2">
			<enhanced:img src={HeroImage} alt="" />
		</div>
	</section>

	<section
		class="grid grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-16 sm:py-20 md:grid-cols-3 md:px-20 md:py-30 lg:grid-cols-4 lg:px-24"
	>
		{#each stats as stat (stat.label)}
			<div class="flex flex-col items-center text-center">
				<p class="text-4xl font-semibold text-orange-500 tabular-nums">{stat.value}</p>
				<p class="text-muted-foreground">{stat.label}</p>
			</div>
		{/each}
	</section>

	<section
		class="flex h-dvh flex-col items-center justify-center gap-4 bg-orange-500 px-4 text-white sm:px-8 dark:bg-orange-800"
	>
		<h2 class="text-center text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-6xl">
			Ready to transform your teaching?
		</h2>
		<p
			class="max-w-prose text-center text-lg leading-tight tracking-tight sm:text-xl sm:leading-normal"
		>
			Join thousands of educators who are already using One Learn to create amazing learning
			experiences.
		</p>
		<div class="flex w-full max-w-sm items-center space-x-2">
			<Input
				type="email"
				placeholder="email"
				class="border-border/30 bg-input/20 text-white placeholder:text-white"
			/>
			<Button class="bg-background font-medium text-orange-500 hover:bg-accent">Get Started</Button>
		</div>
	</section>
</main>
