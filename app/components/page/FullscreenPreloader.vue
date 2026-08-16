<script setup lang="ts">
import type { CSSProperties } from "vue";

interface Props {
	transparent?: boolean;
	background?: string;
	backgroundDark?: string;
	zIndex?: number | string;
	ariaLabel?: string;
	class?: string;
	contentClass?: string;
	minimumDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
	transparent: false,
	background: "var(--ui-bg)",
	zIndex: 9999,
	ariaLabel: "Page loading",
	class: "",
	contentClass: "",
	minimumDuration: 250,
});

const nuxtApp = useNuxtApp();
const autoVisible = ref(true);
let visibleSince = import.meta.client ? performance.now() : 0;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let waitingForWindowLoad = true;

const showAutomatically = () => {
	if (hideTimer) clearTimeout(hideTimer);
	hideTimer = undefined;
	visibleSince = import.meta.client ? performance.now() : 0;
	autoVisible.value = true;
};

const hideAutomatically = () => {
	if (!import.meta.client || waitingForWindowLoad) return;

	const elapsed = performance.now() - visibleSince;
	const minimumDuration = Number.isFinite(props.minimumDuration)
		? Math.max(0, props.minimumDuration)
		: 250;
	const remaining = Math.max(0, minimumDuration - elapsed);

	if (hideTimer) clearTimeout(hideTimer);
	hideTimer = setTimeout(() => {
		autoVisible.value = false;
		hideTimer = undefined;
	}, remaining);
};

const removePageStartHook = nuxtApp.hook("page:start", showAutomatically);
const removePageFinishHook = nuxtApp.hook("page:finish", hideAutomatically);

const handleWindowLoad = () => {
	waitingForWindowLoad = false;
	hideAutomatically();
};

onMounted(() => {
	if (document.readyState === "complete") {
		handleWindowLoad();
	} else {
		window.addEventListener("load", handleWindowLoad, { once: true });
	}
});

onBeforeUnmount(() => {
	if (hideTimer) clearTimeout(hideTimer);
	window.removeEventListener("load", handleWindowLoad);
	removePageStartHook();
	removePageFinishHook();
});

type FullscreenPreloaderStyles = CSSProperties &
	Record<`--page-fullscreen-preloader-${string}`, string>;

const rootStyles = computed<FullscreenPreloaderStyles>(() => ({
	"--page-fullscreen-preloader-background-light": props.transparent
		? "transparent"
		: props.background,
	"--page-fullscreen-preloader-background-dark": props.transparent
		? "transparent"
		: props.backgroundDark || props.background,
	"--page-fullscreen-preloader-z-index": String(props.zIndex),
}));

const rootClasses = computed(() =>
	["page-fullscreen-preloader", props.class].filter(Boolean).join(" "),
);

const contentClasses = computed(() =>
	["page-fullscreen-preloader__content", props.contentClass]
		.filter(Boolean)
		.join(" "),
);
</script>

<template>
	<Transition name="page-fullscreen-preloader">
		<div
			v-if="autoVisible"
			:class="rootClasses"
			:style="rootStyles"
			role="status"
			aria-live="polite"
			aria-busy="true"
			:aria-label="ariaLabel"
			@wheel.prevent
			@touchmove.prevent
		>
			<div :class="contentClasses">
				<slot />
			</div>
		</div>
	</Transition>
</template>

<style>
.page-fullscreen-preloader {
	position: fixed;
	z-index: var(--page-fullscreen-preloader-z-index);
	inset: 0;
	display: none;
	place-items: center;
	width: 100%;
	height: 100vh;
	height: 100dvh;
	overflow: hidden;
	overscroll-behavior: contain;
	background: var(--page-fullscreen-preloader-background-light);
}

html.js .page-fullscreen-preloader {
	display: grid;
}

.page-fullscreen-preloader__content {
	display: flex;
	max-width: 100%;
	max-height: 100%;
	align-items: center;
	justify-content: center;
	padding: 1rem;
}

.page-fullscreen-preloader-leave-active {
	pointer-events: none;
	transition: opacity 160ms ease-out;
}

.page-fullscreen-preloader-leave-to {
	opacity: 0;
}

@media (prefers-color-scheme: dark) {
	.page-fullscreen-preloader {
		background: var(--page-fullscreen-preloader-background-dark);
	}
}

[data-theme="light"] .page-fullscreen-preloader {
	background: var(--page-fullscreen-preloader-background-light);
}

[data-theme="dark"] .page-fullscreen-preloader {
	background: var(--page-fullscreen-preloader-background-dark);
}

@media (prefers-reduced-motion: reduce) {
	.page-fullscreen-preloader-leave-active {
		transition: none;
	}
}
</style>
