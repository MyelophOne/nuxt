<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		title?: string;
		description?: string;

		icon?: string;

		color?: "primary" | "gray" | "info" | "success" | "warning" | "error";
		variant?: "solid" | "soft" | "outline";

		sticky?: boolean;
		closable?: boolean;
	}>(),
	{
		color: "primary",
		variant: "soft",
		sticky: false,
		closable: false,
	},
);

const visible = ref(true);

const close = () => {
	visible.value = false;
};

const colorVariants: Record<
	NonNullable<typeof props.color>,
	Record<NonNullable<typeof props.variant>, string>
> = {
	gray: {
		solid: "bg-gray-800 text-white border-b border-gray-800/30",
		soft: "bg-gray-100 text-gray-900 border-b border-gray-300",
		outline: "bg-transparent text-gray-900 border-b border-gray-400",
	},
	primary: {
		solid: "bg-primary-600 text-white border-b border-primary-600/30",
		soft: "bg-primary-100 text-primary-900 border-b border-primary-300",
		outline: "bg-transparent text-primary-900 border-b border-primary-400",
	},
	info: {
		solid: "bg-blue-600 text-white border-b border-blue-600/30",
		soft: "bg-blue-100 text-blue-900 border-b border-blue-300",
		outline: "bg-transparent text-blue-900 border-b border-blue-400",
	},
	success: {
		solid: "bg-emerald-600 text-white border-b border-emerald-600/30",
		soft: "bg-emerald-100 text-emerald-900 border-b border-emerald-300",
		outline: "bg-transparent text-emerald-900 border-b border-emerald-400",
	},
	warning: {
		solid: "bg-amber-500 text-white border-b border-amber-500/30",
		soft: "bg-amber-100 text-amber-900 border-b border-amber-300",
		outline: "bg-transparent text-amber-900 border-b border-amber-400",
	},
	error: {
		solid: "bg-red-600 text-white border-b border-red-600/30",
		soft: "bg-red-100 text-red-900 border-b border-red-300",
		outline: "bg-transparent text-red-900 border-b border-red-400",
	},
};

const classes = computed(() => [
	"w-full flex items-center gap-4 px-4 py-2 text-sm",
	props.sticky ? "sticky top-0 z-50" : null,
	colorVariants[props.color][props.variant],
]);
</script>

<template>
	<div v-if="visible" role="region" :class="classes">
		<div v-if="icon" class="flex items-center shrink-0">
			<UiIcon :name="icon" class="h-5 w-5" />
		</div>

		<div class="flex-1 min-w-0 flex items-center gap-2">
			<span v-if="$slots.title || title" class="font-medium">
				<slot name="title">{{ title }}</slot>
			</span>

			<span
				v-if="$slots.default || description"
				class="opacity-90 truncate"
			>
				<slot>{{ description }}</slot>
			</span>
		</div>

		<div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
			<slot name="actions" />
		</div>

		<button
			v-if="closable"
			@click="close"
			class="ml-2 opacity-60 hover:opacity-100 transition shrink-0"
			aria-label="Close announcement"
		>
			<UiIcon name="heroicons:x-mark" class="h-4 w-4" />
		</button>
	</div>
</template>
