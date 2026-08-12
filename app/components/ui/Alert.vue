<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		variant?: "info" | "success" | "warning" | "error";

		title?: string;
		description?: string;

		icon?: string;
		avatar?: {
			src?: string;
			icon?: string;
			alt?: string;
		};

		size?: "sm" | "md" | "lg";
		closable?: boolean;
		rounded?: boolean;

		avatarSize?: AvatarSize;
	}>(),
	{
		variant: "info",
		size: "md",
		closable: false,
		rounded: true,
	},
);

const visible = ref(true);

const slots = useSlots();

type AvatarSize = "sm" | "md" | "lg";

const avatarSize = computed<AvatarSize>(() => {
	if (props.avatarSize) return props.avatarSize;
	if (slots.actions) return "lg";
	if (props.description || slots.default) return "md";
	return "sm";
});

const avatarSizes: Record<AvatarSize, string> = {
	sm: "h-8 w-8",
	md: "h-10 w-10",
	lg: "h-14 w-14",
};

const avatarPadding: Record<AvatarSize, string> = {
	sm: "px-2",
	md: "px-3",
	lg: "px-4",
};

const close = () => {
	visible.value = false;
};

const styles = computed(() => {
	const map = {
		info: {
			base: "bg-blue-50 text-blue-900",
			border: "border-blue-200",
			accent: "text-blue-600",
		},
		success: {
			base: "bg-emerald-50 text-emerald-900",
			border: "border-emerald-200",
			accent: "text-emerald-600",
		},
		warning: {
			base: "bg-amber-50 text-amber-900",
			border: "border-amber-200",
			accent: "text-amber-600",
		},
		error: {
			base: "bg-red-50 text-red-900",
			border: "border-red-200",
			accent: "text-red-600",
		},
	};
	return map[props.variant];
});

const sizes = computed(
	() =>
		({
			sm: {
				container: "p-3 gap-3 text-sm",
				icon: "h-4 w-4",
				avatar: "w-12",
			},
			md: {
				container: "p-4 gap-4 text-sm",
				icon: "h-5 w-5",
				avatar: "w-14",
			},
			lg: {
				container: "p-5 gap-5 text-base",
				icon: "h-6 w-6",
				avatar: "w-16",
			},
		})[props.size],
);
</script>

<template>
	<div
		v-if="visible"
		role="alert"
		:class="[
			avatar ? 'grid grid-cols-[auto,1fr]' : 'block',
			'relative border',
			styles.base,
			styles.border,
			sizes.container,
			rounded ? 'rounded-xl' : 'rounded-none',
		]"
	>
		<div
			v-if="avatar"
			class="self-stretch flex items-center justify-center"
			:class="avatarPadding[avatarSize]"
		>
			<div
				:class="[
					'flex items-center justify-center',
					avatarSizes[avatarSize],
				]"
			>
				<SafeImgWithLoader
					v-if="avatar.src"
					:src="avatar.src"
					:alt="avatar.alt || ''"
					class="h-full w-full object-contain rounded-full"
				/>

				<UiIcon
					v-else-if="avatar.icon"
					:name="avatar.icon"
					class="h-full w-full"
				/>
			</div>
		</div>

		<div class="flex flex-col justify-center gap-1 min-w-0">
			<div
				v-if="$slots.title || title"
				class="font-semibold leading-tight"
			>
				<span v-if="icon" class="inline-flex align-middle mr-2">
					<UiIcon :name="icon" :class="[sizes.icon, styles.accent]" />
				</span>

				<slot name="title">{{ title }}</slot>
			</div>

			<div
				v-if="$slots.default || description"
				class="leading-relaxed opacity-90"
			>
				<slot>{{ description }}</slot>
			</div>

			<div v-if="$slots.actions" class="mt-2">
				<slot name="actions" />
			</div>
		</div>

		<button
			v-if="closable"
			@click="close"
			class="absolute top-3 right-3 opacity-60 hover:opacity-100 transition"
			aria-label="Close alert"
		>
			<UiIcon name="heroicons:x-mark" class="h-5 w-5" />
		</button>
	</div>
</template>
