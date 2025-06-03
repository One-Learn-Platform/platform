<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const alertVariants = tv({
		base: "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
		variants: {
			variant: {
				default: "bg-card text-card-foreground",
				destructive:
					"bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
				informative:
					"bg-card text-informative *:data-[slot=alert-description]:text-informative/90 [&>svg]:text-informative",
				warning:
					"bg-card text-warning *:data-[slot=alert-description]:text-warning/90 [&>svg]:text-warning",
				success:
					"bg-card text-success *:data-[slot=alert-description]:text-success/90 [&>svg]:text-success",
			},
			fill: {
				outline: "border-current",
				muted: "",
				default: "bg-card",
			},
		},
		compoundVariants: [
			{
				variant: "default",
				fill: "muted",
				class: "border-muted bg-muted",
			},
			{
				variant: "informative",
				fill: "muted",
				class: "border-informative-muted bg-informative-muted text-informative",
			},
			{
				variant: "warning",
				fill: "muted",
				class: "border-warning-muted bg-warning-muted text-warning",
			},
			{
				variant: "success",
				fill: "muted",
				class: "border-success-muted bg-success-muted text-success",
			},
			{
				variant: "destructive",
				fill: "muted",
				class: "border-destructive-muted bg-destructive-muted text-destructive",
			},
		],
		defaultVariants: {
			variant: "default",
		},
	});

	export type AlertVariant = VariantProps<typeof alertVariants>["variant"];
	export type AlertFill = VariantProps<typeof alertVariants>["fill"];
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		fill = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
		fill?: AlertFill;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert"
	class={cn(alertVariants({ variant, fill }), className)}
	{...restProps}
	role="alert"
>
	{@render children?.()}
</div>
