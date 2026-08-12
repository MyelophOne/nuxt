<script setup lang="ts">
interface Props {
	src?: string;
	alt?: string;
	name?: string;
	icon?: string;
	text?: string;
	size?: "sm" | "md" | "lg" | "xl";
	chipColor?: string;
	chipPosition?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
	class?: any;
}

const props = withDefaults(defineProps<Props>(), {
	size: "md",
	chipPosition: "top-right",
});

const initials = computed(() => {
	if (props.text) return props.text.slice(0, 2).toUpperCase();
	if (!props.name) return "";
	const parts = props.name.trim().split(/\s+/);
	if (parts.length >= 2) {
		const first = parts[0]?.[0] || "";
		const second = parts[1]?.[0] || "";
		return (first + second).toUpperCase();
	}
	return parts[0]?.slice(0, 2).toUpperCase() || "";
});

const sizeClasses = {
	sm: "w-8 h-8 text-[10px]",
	md: "w-10 h-10 text-xs",
	lg: "w-12 h-12 text-sm",
	xl: "w-16 h-16 text-base",
};

const chipPositionClasses = {
	"top-right": "-top-0.5 -right-0.5",
	"bottom-right": "-bottom-0.5 -right-0.5",
	"top-left": "-top-0.5 -left-0.5",
	"bottom-left": "-bottom-0.5 -left-0.5",
};
</script>

<template>
	<div
		:class="[
			'relative inline-flex shrink-0 items-center justify-center select-none rounded-full',
			sizeClasses[size],
			props.class,
		]"
	>
		<div
			class="absolute inset-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-medium"
		>
			<span v-if="initials && !src" class="uppercase">
				{{ initials }}
			</span>

			<UiIcon v-else-if="icon" :name="icon" class="w-1/2 h-1/2" />

			<SafeImgWithLoader
				v-else-if="src"
				:src="src"
				:alt="alt || name || 'avatar'"
				class="absolute inset-0 h-full w-full object-cover"
				loading="lazy"
			/>

			<UiIcon
				v-else
				name="i-heroicons-user-20-solid"
				class="w-1/2 h-1/2 opacity-50"
			/>
		</div>

		<span
			v-if="chipColor"
			:class="[
				'absolute block rounded-full border-2 border-white dark:border-zinc-900 z-10',
				size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
				chipPositionClasses[chipPosition],
			]"
			:style="{ backgroundColor: chipColor }"
		></span>
	</div>
</template>
