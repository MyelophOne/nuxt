<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		label?: string;

		color?: "primary" | "gray" | "info" | "success" | "warning" | "error";
		variant?: "solid" | "soft" | "outline";
		size?: "xs" | "sm" | "md";

		rounded?: boolean;
		pill?: boolean;

		icon?: string;
		leadingIcon?: string;
		trailingIcon?: string;
		showLeading?: boolean;
		showTrailing?: boolean;

		avatar?: {
			src?: string;
			icon?: string;
			alt?: string;
		};
	}>(),
	{
		color: "gray",
		variant: "soft",
		size: "sm",
		rounded: true,
		pill: false,
		showLeading: true,
		showTrailing: true,
	},
);

const sizes = {
	xs: {
		container: "text-xs px-2 py-0.5 gap-1",
		icon: "h-3 w-3",
		avatar: "h-4 w-4",
	},
	sm: {
		container: "text-xs px-3 py-0.5 gap-1.5",
		icon: "h-3.5 w-3.5",
		avatar: "h-5 w-5",
	},
	md: {
		container: "text-sm px-4 py-1 gap-2",
		icon: "h-4 w-4",
		avatar: "h-6 w-6",
	},
} as const;

const colorVariants: Record<
	NonNullable<typeof props.color>,
	Record<NonNullable<typeof props.variant>, string>
> = {
	gray: {
		solid: "bg-gray-800 text-white",
		soft: "bg-gray-100 text-gray-800",
		outline: "border border-gray-300 text-gray-800",
	},
	primary: {
		solid: "bg-primary-600 text-white",
		soft: "bg-primary-100 text-primary-800",
		outline: "border border-primary-300 text-primary-700",
	},
	info: {
		solid: "bg-blue-600 text-white",
		soft: "bg-blue-100 text-blue-800",
		outline: "border border-blue-300 text-blue-700",
	},
	success: {
		solid: "bg-emerald-600 text-white",
		soft: "bg-emerald-100 text-emerald-800",
		outline: "border border-emerald-300 text-emerald-700",
	},
	warning: {
		solid: "bg-amber-500 text-white",
		soft: "bg-amber-100 text-amber-800",
		outline: "border border-amber-300 text-amber-700",
	},
	error: {
		solid: "bg-red-600 text-white",
		soft: "bg-red-100 text-red-800",
		outline: "border border-red-300 text-red-700",
	},
};

const leadingIconName = computed<string | null>(() => {
	return props.leadingIcon ?? props.icon ?? null;
});

const showLeadingIcon = computed(
	() => props.showLeading && !!leadingIconName.value && !props.avatar,
);

const showTrailingIcon = computed(
	() => props.showTrailing && !!props.trailingIcon,
);

const classes = computed(() => [
	"inline-flex items-center font-medium whitespace-nowrap w-fit",
	sizes[props.size].container,
	colorVariants[props.color][props.variant],
	props.pill ? "rounded-full" : props.rounded ? "rounded-md" : "rounded-none",
]);

const trailingIconName = computed<string | null>(() => {
	return props.showTrailing && props.trailingIcon ? props.trailingIcon : null;
});
</script>

<template>
	<span :class="classes">
		<span
			v-if="avatar"
			class="flex items-center justify-center shrink-0"
			:class="sizes[size].avatar"
		>
			<SafeImgWithLoader
				v-if="avatar.src"
				:src="avatar.src"
				:alt="avatar.alt || ''"
				class="h-full w-full rounded-full object-contain"
			/>
			<UiIcon
				v-else-if="avatar.icon"
				:name="avatar.icon"
				class="h-full w-full"
			/>
		</span>

		<UiIcon
			v-if="showLeadingIcon && leadingIconName"
			:name="leadingIconName"
			:class="sizes[size].icon"
		/>

		<span>
			<slot>{{ label }}</slot>
		</span>

		<UiIcon
			v-if="trailingIconName"
			:name="trailingIconName"
			:class="sizes[size].icon"
		/>
	</span>
</template>
