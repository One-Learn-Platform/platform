<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const alertVariants = tv({
		base: "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
		variants: {
			variant: {
				default: "bg-background text-foreground",
				informative:
					"bg-informative text-informative-foreground dark:border-informative [&>svg]:text-informative-foreground",
				warning:
					"bg-warning text-warning-foreground dark:border-warning [&>svg]:text-warning-foreground",
				destructive:
					"bg-destructive text-destructive-foreground [&>svg]:text-destructive-foreground",
			},
			outline: {
				true: "",
			},
		},
		compoundVariants: [
			{
				variant: "destructive",
				outline: true,
				class:
					"border-destructive/50 bg-background text-destructive dark:border-destructive [&>svg]:text-destructive",
			},
			{
				variant: "informative",
				outline: true,
				class:
					"border-informative/50 bg-background text-informative dark:border-informative [&>svg]:text-informative",
			},
			{
				variant: "warning",
				outline: true,
				class:
					"border-warning/50 bg-background text-warning dark:border-warning [&>svg]:text-warning",
			},
		],
		defaultVariants: {
			variant: "default",
		},
	});

	export type AlertVariant = VariantProps<typeof alertVariants>["variant"];
	export type AlertOutline = VariantProps<typeof alertVariants>["outline"];
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		outline,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
		outline?: AlertOutline;
	} = $props();
</script>

<div
	bind:this={ref}
	class={cn(alertVariants({ variant, outline }), className)}
	{...restProps}
	role="alert"
>
	{@render children?.()}
</div>
