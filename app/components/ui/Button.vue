<script setup lang="ts">
import { NuxtLink } from "#components";

const props = withDefaults(
	defineProps<{
		as?: "button" | "a" | "nuxt-link" | any;

		label?: string;

		to?: string | object;
		href?: string;
		target?: string;

		color?:
			| "primary"
			| "gray"
			| "info"
			| "success"
			| "warning"
			| "error"
			| "base";
		variant?: "solid" | "soft" | "outline" | "ghost";
		size?: "xs" | "sm" | "md" | "lg";

		icon?: string;
		leadingIcon?: string;
		trailingIcon?: string;

		loading?: boolean;
		disabled?: boolean;

		block?: boolean;
		rounded?: boolean;
		square?: boolean;
	}>(),
	{
		as: "button",
		color: "base",
		variant: "solid",
		size: "md",
		loading: false,
		disabled: false,
		block: false,
		rounded: true,
		square: false,
	},
);

const resolvedAs = computed(() => {
	if (props.as === "nuxt-link") return NuxtLink;
	return props.as;
});

const isDisabled = computed(() => props.disabled || props.loading);

const leadingIconName = computed<string | null>(() => {
	return props.leadingIcon ?? props.icon ?? null;
});

const trailingIconName = computed<string | null>(() => {
	return props.trailingIcon ?? null;
});

const sizes = {
	xs: "text-xs px-2 py-1 gap-1",
	sm: "text-sm px-2.5 py-1.5 gap-1.5",
	md: "text-sm px-4 py-2 gap-2",
	lg: "text-base px-5 py-2.5 gap-2.5",
} as const;

const iconSizes = {
	xs: "h-3 w-3",
	sm: "h-4 w-4",
	md: "h-5 w-5",
	lg: "h-6 w-6",
} as const;

const baseVariants = {
	solid: "bg-[var(--ui-bg)] text-[var(--ui-text)] border border-[var(--ui-border,var(--ui-text))]",
	soft: "bg-[color-mix(in srgb, var(--ui-bg) 85%, transparent)] text-[var(--ui-text)] border border-[var(--ui-border,var(--ui-text))]",
	outline:
		"bg-transparent text-[var(--ui-text)] border border-[var(--ui-border,var(--ui-text))]",
	ghost: "bg-transparent text-[var(--ui-text)]",
};

const colorVariants: Record<
	NonNullable<typeof props.color>,
	Record<NonNullable<typeof props.variant>, string>
> = {
	base: baseVariants,

	gray: {
		solid: "bg-gray-800 text-white border border-gray-800/30",
		soft: "bg-gray-100 text-gray-900 border border-gray-300",
		outline: "bg-transparent text-gray-900 border border-gray-400",
		ghost: "bg-transparent text-gray-900",
	},
	primary: {
		solid: "bg-primary-600 text-white border border-primary-600/30",
		soft: "bg-primary-100 text-primary-900 border border-primary-300",
		outline: "bg-transparent text-primary-900 border border-primary-400",
		ghost: "bg-transparent text-primary-900",
	},
	info: {
		solid: "bg-blue-600 text-white border border-blue-600/30",
		soft: "bg-blue-100 text-blue-900 border border-blue-300",
		outline: "bg-transparent text-blue-900 border border-blue-400",
		ghost: "bg-transparent text-blue-900",
	},
	success: {
		solid: "bg-emerald-600 text-white border border-emerald-600/30",
		soft: "bg-emerald-100 text-emerald-900 border border-emerald-300",
		outline: "bg-transparent text-emerald-900 border border-emerald-400",
		ghost: "bg-transparent text-emerald-900",
	},
	warning: {
		solid: "bg-amber-500 text-white border border-amber-500/30",
		soft: "bg-amber-100 text-amber-900 border border-amber-300",
		outline: "bg-transparent text-amber-900 border border-amber-400",
		ghost: "bg-transparent text-amber-900",
	},
	error: {
		solid: "bg-red-600 text-white border border-red-600/30",
		soft: "bg-red-100 text-red-900 border border-red-300",
		outline: "bg-transparent text-red-900 border border-red-400",
		ghost: "bg-transparent text-red-900",
	},
};

const classes = computed(() => [
	"inline-flex items-center justify-center font-medium whitespace-nowrap transition",
	sizes[props.size],
	colorVariants[props.color][props.variant],
	props.block ? "w-full" : "w-fit",
	props.square ? "aspect-square p-0" : null,
	props.rounded ? "rounded-md" : "rounded-none",
	isDisabled.value ? "opacity-50 pointer-events-none" : "hover:brightness-95",
]);
</script>

<template>
	<component
		:is="resolvedAs"
		:to="to"
		:href="href"
		:target="target"
		:disabled="resolvedAs === 'button' ? isDisabled : undefined"
		:aria-disabled="isDisabled || undefined"
		:class="classes"
	>
		<UiIcon
			v-if="loading"
			name="heroicons:arrow-path"
			class="animate-spin"
			:style="{ color: 'var(--loader-fill-color, currentColor)' }"
			:class="iconSizes[size]"
		/>

		<UiIcon
			v-else-if="leadingIconName"
			:name="leadingIconName"
			:class="iconSizes[size]"
		/>

		<span v-if="$slots.default || label">
			<slot>{{ label }}</slot>
		</span>

		<UiIcon
			v-if="!loading && trailingIconName"
			:name="trailingIconName"
			:class="iconSizes[size]"
		/>
	</component>
</template>
