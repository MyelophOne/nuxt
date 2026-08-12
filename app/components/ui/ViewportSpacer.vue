<script setup lang="ts">
interface Props {
	size?: number | string;
	mobileSize?: number | string;
	horizontal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	size: 5,
	horizontal: false,
});

const spacerStyle = computed(() => {
	const u = props.horizontal ? "vw" : "vh";
	const du = props.horizontal ? "dvw" : "dvh";

	const desktop =
		typeof props.size === "number"
			? `${props.size}`
			: props.size.toString().replace(/[a-z]/g, "");
	const mobile =
		props.mobileSize !== undefined
			? typeof props.mobileSize === "number"
				? props.mobileSize
				: props.mobileSize.toString().replace(/[a-z]/g, "")
			: desktop;

	return {
		"--sp-desktop": `${desktop}${u}`,
		"--sp-desktop-d": `${desktop}${du}`,
		"--sp-mobile": `${mobile}${u}`,
		"--sp-mobile-d": `${mobile}${du}`,
	};
});
</script>

<template>
	<div
		:style="spacerStyle"
		class="viewport-spacer"
		:class="[horizontal ? 'is-horizontal' : 'is-vertical']"
		aria-hidden="true"
	/>
</template>

<style scoped>
.viewport-spacer {
	display: block;
	flex-shrink: 0;
	pointer-events: none;

	--final-size: var(--sp-mobile);
	--final-size: var(--sp-mobile-d);
}

@media (min-width: 768px) {
	.viewport-spacer {
		--final-size: var(--sp-desktop);
		--final-size: var(--sp-desktop-d);
	}
}

.is-vertical {
	width: 100%;
	height: var(--final-size);
}

.is-horizontal {
	height: 100%;
	width: var(--final-size);
}
</style>
