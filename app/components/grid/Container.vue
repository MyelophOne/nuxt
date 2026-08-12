<script setup lang="ts">
import type { LayoutSize } from "~/constants/layout";
import { getYoutubeEmbed, getYoutubePoster } from "~/utils/ytVideo";

import { CONTAINER_MAX_WIDTH, CONTAINER_PADDING_X } from "~/constants/layout";

interface Props {
	size?: LayoutSize;
	py?: string;
	my?: string;
	mdPy?: string;
	mdMy?: string;
	id?: string;
	class?: string;
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
	size: "content",
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

const classes = computed(() => [
	{
		"layout-container-root relative overflow-hidden":
			bgStyles.value || hasVideo.value,
	},
	{ "has-gradient-overlay": props.bgGradient || props.bgGradientSm },
	"mx-auto w-full flex-col",
	props.hideOnMobile ? "hidden md:flex" : "",
	props.hideOnDesktop ? "flex md:hidden" : "",
	!props.hideOnMobile && !props.hideOnDesktop ? "flex" : "",
	CONTAINER_MAX_WIDTH[props.size],
	props.size !== "fullwidth" && CONTAINER_PADDING_X,
	props.py && `py-${props.py}`,
	props.my && `my-${props.my}`,
	props.mdPy && `md:py-${props.mdPy}`,
	props.mdMy && `md:my-${props.mdMy}`,
	props.class,
]);

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
.layout-container-root {
	background-color: var(--bg-color, transparent);
	background-image: var(--bg-img-mobile, none);
	background-size: var(--bg-size-mobile, cover);
}

.layout-container-root.has-gradient-overlay::before {
	background-image: var(--bg-grad-mobile, none);
}

@media (min-width: 768px) {
	.layout-container-root {
		background-image: var(--bg-img-desktop, none);
		background-size: var(--bg-size-desktop, cover);
	}
	.layout-container-root.has-gradient-overlay::before {
		background-image: var(--bg-grad-desktop, none);
	}
}
</style>
