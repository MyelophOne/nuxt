<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		title?: string;
		description?: string;

		icon?: string;
		avatar?: {
			src?: string;
			icon?: string;
			alt?: string;
		};

		color?: "primary" | "gray" | "info" | "success" | "warning" | "error";
		variant?: "solid" | "soft" | "outline";

		closable?: boolean;
		rounded?: boolean;
		bordered?: boolean;
	}>(),
	{
		color: "gray",
		variant: "soft",
		closable: false,
		rounded: true,
		bordered: false,
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
		solid: "bg-gray-800 text-white border border-gray-800/30",
		soft: "bg-gray-100 text-gray-900 border border-gray-300",
		outline: "bg-transparent text-gray-900 border border-gray-400",
	},
	primary: {
		solid: "bg-primary-600 text-white border border-primary-600/30",
		soft: "bg-primary-100 text-primary-900 border border-primary-300",
		outline: "bg-transparent text-primary-900 border border-primary-400",
	},
	info: {
		solid: "bg-blue-600 text-white border border-blue-600/30",
		soft: "bg-blue-100 text-blue-900 border border-blue-300",
		outline: "bg-transparent text-blue-900 border border-blue-400",
	},
	success: {
		solid: "bg-emerald-600 text-white border border-emerald-600/30",
		soft: "bg-emerald-100 text-emerald-900 border border-emerald-300",
		outline: "bg-transparent text-emerald-900 border border-emerald-400",
	},
	warning: {
		solid: "bg-amber-500 text-white border border-amber-500/30",
		soft: "bg-amber-100 text-amber-900 border border-amber-300",
		outline: "bg-transparent text-amber-900 border border-amber-400",
	},
	error: {
		solid: "bg-red-600 text-white border border-red-600/30",
		soft: "bg-red-100 text-red-900 border border-red-300",
		outline: "bg-transparent text-red-900 border border-red-400",
	},
};

const classes = computed(() => [
	"w-full flex items-center gap-4 px-4 py-3",
	colorVariants[props.color][props.variant],
	props.rounded ? "rounded-md" : "rounded-none",
	props.bordered || props.variant === "outline"
		? "border border-current/20"
		: null,
]);
</script>

<template>
	<div v-if="visible" role="region" :class="classes">
		<div
			v-if="avatar || icon"
			class="flex items-center justify-center shrink-0"
		>
			<div class="h-10 w-10 flex items-center justify-center">
				<SafeImgWithLoader
					v-if="avatar?.src"
					:src="avatar.src"
					:alt="avatar.alt || ''"
					class="h-full w-full object-contain rounded-full"
				/>
				<UiIcon
					v-else-if="avatar?.icon"
					:name="avatar.icon"
					class="h-full w-full"
				/>
				<UiIcon v-else-if="icon" :name="icon" class="h-6 w-6" />
			</div>
		</div>

		<div class="flex-1 min-w-0">
			<div
				v-if="$slots.title || title"
				class="font-semibold leading-tight"
			>
				<slot name="title">{{ title }}</slot>
			</div>

			<div
				v-if="$slots.default || description"
				class="text-sm opacity-90 leading-relaxed"
			>
				<slot>{{ description }}</slot>
			</div>
		</div>

		<div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
			<slot name="actions" />
		</div>

		<button
			v-if="closable"
			@click="close"
			class="ml-2 opacity-60 hover:opacity-100 transition shrink-0"
			aria-label="Close banner"
		>
			<UiIcon name="heroicons:x-mark" class="h-5 w-5" />
		</button>
	</div>
</template>
