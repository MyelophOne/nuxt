<script setup lang="ts">
import type { CSSProperties } from "vue";

type SkeletonRounded = "none" | "sm" | "md" | "lg" | "full";

interface Props {
	as?: string | Component;
	animated?: boolean;
	rounded?: SkeletonRounded;
	width?: string | number;
	height?: string | number;
	ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
	as: "div",
	animated: true,
	rounded: "md",
});

const roundedClasses: Record<SkeletonRounded, string> = {
	none: "rounded-none",
	sm: "rounded-sm",
	md: "rounded-md",
	lg: "rounded-lg",
	full: "rounded-full",
};

const toCssSize = (value: string | number | undefined) =>
	typeof value === "number" ? `${value}px` : value;

const skeletonStyles = computed<CSSProperties>(() => ({
	width: toCssSize(props.width),
	height: toCssSize(props.height),
}));
</script>

<template>
	<component
		:is="as"
		:class="[
			'ui-skeleton',
			roundedClasses[rounded],
			{ 'ui-skeleton--animated': animated },
		]"
		:style="skeletonStyles"
		:role="ariaLabel ? 'status' : undefined"
		:aria-label="ariaLabel"
		:aria-hidden="ariaLabel ? undefined : 'true'"
		data-nosnippet
	/>
</template>

<style scoped>
.ui-skeleton {
	display: block;
	flex-shrink: 0;
	background-color: var(--ui-border);
	background-color: color-mix(in srgb, var(--ui-text) 11%, var(--ui-bg));
}

.ui-skeleton--animated {
	will-change: opacity;
	animation: ui-skeleton-pulse 1.6s ease-in-out infinite;
}

@keyframes ui-skeleton-pulse {
	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.48;
	}
}

@media (prefers-reduced-motion: reduce) {
	.ui-skeleton--animated {
		animation: none;
		will-change: auto;
	}
}

@media (forced-colors: active) {
	.ui-skeleton {
		background-color: CanvasText;
		opacity: 0.2;
	}
}
</style>
