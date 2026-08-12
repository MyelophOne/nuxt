<script setup lang="ts">
const props = defineProps({
	src: { type: String, default: "" },
	gradient: { type: String, default: "" },
	fixed: { type: Boolean, default: false },
	auto: { type: Boolean, default: true },
	height: { type: String, default: "100vh" },
});

const wrapperStyles = computed(() => {
	const styles: Record<string, string> = {
		height: props.height,
	};

	if (props.src) {
		styles.backgroundImage = `url('${props.src}')`;
	} else if (props.gradient) {
		styles.background = props.gradient;
	}

	if (props.fixed) {
		styles.backgroundAttachment = "fixed";
	}

	return styles;
});
</script>

<template>
	<section
		class="smart-contrast-wrapper"
		:class="{ 'auto-mode': auto }"
		:style="wrapperStyles"
	>
		<slot />
	</section>
</template>

<style scoped>
.smart-contrast-wrapper {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	position: relative;
	background-color: #888;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	isolation: isolate;
	z-index: 0;
}

.smart-contrast-wrapper.auto-mode :deep(h1),
.smart-contrast-wrapper.auto-mode :deep(h2),
.smart-contrast-wrapper.auto-mode :deep(h3),
.smart-contrast-wrapper.auto-mode :deep(p),
.smart-contrast-wrapper.auto-mode :deep(span),
.smart-contrast-wrapper.auto-mode :deep(a) {
	color: #fff !important;
	mix-blend-mode: difference;
}

.smart-contrast-wrapper :deep(.invert-text) {
	color: #fff !important;
	mix-blend-mode: difference;
}

.smart-contrast-wrapper.auto-mode :deep(a) {
	text-decoration: underline;
}
</style>
