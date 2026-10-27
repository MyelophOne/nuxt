<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		label: string;
		reserveSpace?: boolean;
	}>(),
	{ reserveSpace: true },
);

const panel = ref<HTMLElement | null>(null);
const height = ref<number>();
const offsets = useState<Record<string, number>>(
	"myelophone:mobile-action-bar-offsets",
	() => ({}),
);
const id = useId();
let observer: ResizeObserver | undefined;

onMounted(() => {
	if (!panel.value || typeof ResizeObserver === "undefined") return;
	observer = new ResizeObserver(([entry]) => {
		if (!entry) return;
		const nextHeight = entry.target.getBoundingClientRect().height;
		const bottom =
			Number.parseFloat(getComputedStyle(entry.target).bottom) || 0;
		if (nextHeight > 0) height.value = nextHeight + Math.max(0, bottom);
		offsets.value = {
			...offsets.value,
			[id]: nextHeight > 0 ? nextHeight + Math.max(0, bottom) : 0,
		};
	});
	observer.observe(panel.value);
});

onBeforeUnmount(() => {
	observer?.disconnect();
	const remaining = { ...offsets.value };
	delete remaining[id];
	offsets.value = remaining;
});
</script>

<template>
	<div
		class="mobile-action-bar"
		:class="{ 'mobile-action-bar--reserve': props.reserveSpace }"
		:style="{
			'--mobile-action-bar-height': height ? `${height}px` : undefined,
		}"
	>
		<div
			ref="panel"
			class="mobile-action-bar__panel"
			role="group"
			:aria-label="label"
		>
			<slot />
		</div>
	</div>
</template>

<style scoped>
.mobile-action-bar {
	display: none;
}

@media (width < 768px) {
	.mobile-action-bar {
		display: block;
	}

	.mobile-action-bar--reserve {
		block-size: var(
			--mobile-action-bar-height,
			calc(5rem + env(safe-area-inset-bottom, 0px))
		);
		flex-shrink: 0;
	}

	.mobile-action-bar__panel {
		position: fixed;
		inset-inline-start: max(0.5rem, env(safe-area-inset-left, 0px));
		inset-inline-end: max(0.5rem, env(safe-area-inset-right, 0px));
		bottom: calc(
			var(--mobile-action-bar-bottom, 0px) +
				max(0.5rem, env(safe-area-inset-bottom, 0px))
		);
		z-index: var(--mobile-action-bar-z-index, 40);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 5.5rem), 1fr));
		align-items: stretch;
		gap: var(--mobile-action-bar-gap, 0.5rem);
		padding: 0.5rem;
		background: var(--mobile-action-bar-bg, var(--ui-bg));
		color: var(--mobile-action-bar-text, var(--ui-text));
		border: 1px solid
			var(
				--mobile-action-bar-border,
				color-mix(in srgb, var(--ui-text) 14%, transparent)
			);
		border-radius: var(--mobile-action-bar-radius, 1.5rem);
		box-shadow: var(
			--mobile-action-bar-shadow,
			0 4px 24px rgb(0 0 0 / 12%)
		);
	}

	.mobile-action-bar__panel > :slotted(*) {
		inline-size: 100%;
		min-inline-size: 0;
		min-block-size: 48px;
		padding: 0.625rem 0.5rem;
		border-radius: var(--mobile-action-bar-action-radius, 1rem);
		font-size: 0.9375rem;
		line-height: 1.3;
		white-space: normal;
		overflow-wrap: anywhere;
		text-align: center;
	}

	.mobile-action-bar__panel > :slotted(*:focus-visible) {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
}

@media print {
	.mobile-action-bar {
		display: none;
	}
}
</style>
