<script setup lang="ts">
import { COL_SPAN, COL_SPAN_SM, COL_ORDER } from "~/constants/layout";
import type { LayoutOrder } from "~/constants/layout";
import { getYoutubeEmbed, getYoutubePoster } from "~/utils/ytVideo";

interface Props {
	span?: keyof typeof COL_SPAN;
	smSpan?: keyof typeof COL_SPAN_SM;
	mdSpan?: keyof typeof COL_SPAN;
	smOrder?: LayoutOrder;
	class?: string;
	id?: string;
	hideOnMobile?: boolean;
	hideOnDesktop?: boolean;
	bgColor?: string;
	bgImage?: string;
	bgImageSm?: string;
	bgGradient?: string;
	bgGradientSm?: string;
	bgSize?: string;
	bgSizeSm?: string;
	bgVideo?: string;
	bgVideoSm?: string;
	bgVideoPoster?: string;
	bgVideoPosterSm?: string;
	bgYoutube?: string;
	bgYoutubeSm?: string;
}

const props = withDefaults(defineProps<Props>(), {
	span: 12,
	hideOnMobile: false,
	hideOnDesktop: false,
	bgSize: "cover",
});

const hasVideo = computed(() => {
	const hasYt =
		(props.bgYoutube && props.bgYoutube !== "none") ||
		(props.bgYoutubeSm && props.bgYoutubeSm !== "none");
	if (hasYt) return true;

	return (
		(props.bgVideo && props.bgVideo !== "none") ||
		(props.bgVideoSm && props.bgVideoSm !== "none")
	);
});

const classes = computed(() => {
	const result: string[] = [];

	if (bgStyles.value || hasVideo.value)
		result.push("layout-col-root relative overflow-hidden");

	if (props.bgGradient || props.bgGradientSm) {
		result.push("has-gradient-overlay");
	}

	if (props.hideOnMobile) {
		result.push("hidden md:flex");
	} else if (props.hideOnDesktop) {
		result.push("flex md:hidden");
	} else {
		result.push("flex");
	}

	result.push("flex-col");

	result.push(
		"md:group-[.group\\/equal]:self-stretch md:group-[.group\\/equal]:min-h-0",
	);

	if (props.smSpan) {
		result.push(COL_SPAN_SM[props.smSpan]);
	} else {
		result.push("basis-full");
	}

	if (props.span) {
		result.push(COL_SPAN[props.span]);
	}
	if (props.mdSpan) {
		result.push(COL_SPAN[props.mdSpan]);
	}

	if (props.smOrder) {
		result.push(COL_ORDER[props.smOrder]);
		result.push("md:order-none");
	}

	if (props.class) result.push(props.class);

	return result.join(" ");
});

const bgStyles = computed(() => {
	const styles: Record<string, string> = {};

	const hasBg =
		props.bgColor ||
		props.bgImage ||
		props.bgImageSm ||
		props.bgGradient ||
		props.bgGradientSm ||
		hasVideo.value;
	if (!hasBg) return null;

	if (props.bgColor) styles["--bg-color"] = props.bgColor;

	let img = "";
	if (props.bgImage) {
		img = `url('${props.bgImage}')`;
	} else if (props.bgYoutube && props.bgYoutube !== "none") {
		img = getYoutubePoster(props.bgYoutube);
	} else if (props.bgVideoPoster) {
		img = `url('${props.bgVideoPoster}')`;
	}
	const grad = props.bgGradient || "";

	styles["--bg-img-desktop"] = img;
	styles["--bg-grad-desktop"] = grad;
	styles["--bg-size-desktop"] = props.bgSize;

	let imgSm = "";
	if (props.bgImageSm === "none") {
		imgSm = "";
	} else if (props.bgImageSm) {
		imgSm = `url('${props.bgImageSm}')`;
	} else if (props.bgYoutubeSm && props.bgYoutubeSm !== "none") {
		imgSm = getYoutubePoster(props.bgYoutubeSm);
	} else if (props.bgVideoPosterSm) {
		imgSm = `url('${props.bgVideoPosterSm}')`;
	} else {
		imgSm = img;
	}
	const gradSm = props.bgGradientSm || grad;

	styles["--bg-img-mobile"] = imgSm;
	styles["--bg-grad-mobile"] = gradSm;
	styles["--bg-size-mobile"] = props.bgSizeSm || props.bgSize;

	return Object.keys(styles).length > 0 ? styles : null;
});

const rootRef = ref<HTMLElement | null>(null);

const refreshMyVideo = () => {
	const iframe = rootRef.value?.querySelector("iframe");
	if (iframe) {
		const src = iframe.getAttribute("src");
		if (src) iframe.setAttribute("src", src);
	}
};

onMounted(() => {
	window.addEventListener("focus", refreshMyVideo);
});

onUnmounted(() => {
	window.removeEventListener("focus", refreshMyVideo);
});
</script>

<template>
	<div
		ref="rootRef"
		:id="id"
		:class="classes"
		v-bind="bgStyles ? { style: bgStyles } : {}"
	>
		<div
			v-if="bgYoutube && bgYoutube !== 'none'"
			class="video-background-container"
			:class="[
				bgYoutubeSm && bgYoutubeSm !== 'none'
					? 'hidden md:block'
					: 'block',
			]"
		>
			<iframe
				:src="getYoutubeEmbed(bgYoutube)!"
				frameborder="0"
				allow="autoplay; encrypted-media"
				loading="lazy"
			></iframe>
		</div>

		<div
			v-if="bgYoutubeSm && bgYoutubeSm !== 'none'"
			class="video-background-container md:hidden"
		>
			<iframe
				:src="getYoutubeEmbed(bgYoutubeSm)!"
				frameborder="0"
				allow="autoplay; encrypted-media"
				loading="lazy"
			></iframe>
		</div>

		<video
			v-if="
				bgVideo &&
				bgVideo !== 'none' &&
				(!bgYoutube || bgYoutube === 'none')
			"
			autoplay
			muted
			loop
			playsinline
			:poster="bgVideoPoster"
			class="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none"
			:class="[
				(bgVideoSm && bgVideoSm !== 'none') ||
				(bgYoutubeSm && bgYoutubeSm !== 'none')
					? 'hidden md:block'
					: 'block',
			]"
		>
			<source :src="bgVideo" />
		</video>

		<video
			v-if="
				bgVideoSm &&
				bgVideoSm !== 'none' &&
				(!bgYoutubeSm || bgYoutubeSm === 'none')
			"
			autoplay
			muted
			loop
			playsinline
			:poster="bgVideoPosterSm || bgVideoPoster"
			class="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none md:hidden"
		>
			<source :src="bgVideoSm" />
		</video>

		<slot />
	</div>
</template>

<style>
.layout-col-root {
	background-color: var(--bg-color, transparent);
	background-image: var(--bg-img-mobile, none);
	background-size: var(--bg-size-mobile, cover);
}

.layout-col-root.has-gradient-overlay::before {
	background-image: var(--bg-grad-mobile, none);
}

@media (min-width: 768px) {
	.layout-col-root {
		background-image: var(--bg-img-desktop, none);
		background-size: var(--bg-size-desktop, cover);
	}
	.layout-col-root.has-gradient-overlay::before {
		background-image: var(--bg-grad-desktop, none);
	}
}
</style>
