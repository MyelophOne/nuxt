<template>
	<div
		ref="wrapper"
		class="lazy-image-wrapper"
		:style="{
			maxWidth: width ? width : undefined,
			height: height ? height : undefined,
		}"
	>
		<ClientOnly>
			<template v-if="isStatic">
				<img
					v-if="isVisible"
					:src="currentSrc"
					:alt="alt"
					:width="width"
					:height="height"
					:sizes="sizes"
					:class="[
						'lazy-image',
						imgClass,
						{ 'image-visible': isLoaded },
					]"
					@load="onLoad"
					@error="onError"
					loading="lazy"
					fit="cover"
				/>
			</template>

			<template v-else>
				<NuxtImg
					v-if="isVisible"
					:src="currentSrc"
					:alt="alt"
					:width="width"
					:height="height"
					:sizes="sizes"
					:class="[
						'lazy-image',
						imgClass,
						{ 'image-visible': isLoaded },
					]"
					@load="onLoad"
					@error="onError"
					loading="lazy"
					fit="cover"
					format="avif,webp"
				/>
			</template>
		</ClientOnly>

		<div v-if="!isLoaded" class="loaderparent imgpreloader">
			<svg
				width="26"
				height="26"
				viewBox="0 0 32 32"
				xmlns="http://www.w3.org/2000/svg"
				class="loadersvg"
			>
				<g fill="none" fill-rule="evenodd">
					<g fill="var(--loader-fill-color, #333)">
						<path
							d="M16 32a16 16 0 110-32 16 16 0 010 32zm0-2a14 14 0 100-28 14 14 0 000 28z"
							fill-rule="nonzero"
							opacity=".1"
						/>
						<path d="M16 2V0A16 16 0 000 16h2A14 14 0 0116 2z" />
					</g>
				</g>
			</svg>
		</div>
	</div>
</template>

<script setup lang="ts">
const isStatic = useStatic();

const props = defineProps<{
	src: string;
	alt?: string;
	width?: number | string;
	height?: number | string;
	sizes?: string;
	imgClass?: string;
}>();

const isLoaded = ref(false);
const isVisible = ref(false);
const currentSrc = ref("");
const wrapper = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

function onLoad() {
	isLoaded.value = true;
}

const img404 = "/img/image404.png";

function onError() {
	currentSrc.value = img404;
}

onMounted(() => {
	if (!wrapper.value) return;

	observer = new IntersectionObserver(
		([entry]) => {
			if (entry?.isIntersecting) {
				isVisible.value = true;
				currentSrc.value = props.src;
				observer?.disconnect();
			}
		},
		{
			rootMargin: "100px",
			threshold: 0.1,
		},
	);

	observer.observe(wrapper.value);
});

onBeforeUnmount(() => {
	observer?.disconnect();
});
</script>

<style scoped>
.lazy-image-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	display: block;
	overflow: hidden;
}

.lazy-image {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	opacity: 0;
	transition: opacity 0.4s ease-in-out;
	z-index: 2;
}

.image-visible {
	opacity: 1;
}

.loaderparent {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
	background: transparent;
}

.loadersvg {
	animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
