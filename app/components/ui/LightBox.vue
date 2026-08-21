<template>
	<div class="lightbox-grid">
		<div
			v-for="(img, index) in images"
			:key="index"
			:class="['pic-item', itemClass]"
			:style="itemStyle"
			@click="showImg(index)"
		>
			<SafeImgWithLoader
				:src="extractSrc(img)"
				:alt="extractTitle(img)"
				crossorigin="anonymous"
				:class="imgClass"
				:style="[{ cursor: 'pointer' }, imgStyle]"
			/>
		</div>

		<ClientOnly>
			<VueEasyLightbox
				:visible="visibleRef"
				:imgs="images"
				:index="indexRef"
				v-bind="lightboxProps"
				@hide="onHide"
			>
				<template #loading>
					<div class="lightbox-loader-overlay">
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							xmlns="http://www.w3.org/2000/svg"
							class="loadersvg-lightbox"
						>
							<g fill="none" fill-rule="evenodd">
								<g fill="var(--loader-fill-color, #fff)">
									<path
										d="M16 32a16 16 0 110-32 16 16 0 010 32zm0-2a14 14 0 100-28 14 14 0 000 28z"
										fill-rule="nonzero"
										opacity=".1"
									/>
									<path
										d="M16 2V0A16 16 0 000 16h2A14 14 0 0116 2z"
									/>
								</g>
							</g>
						</svg>
					</div>
				</template>
			</VueEasyLightbox>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
interface LightboxImg {
	src?: string;
	title?: string;
	alt?: string;
}
import type { PropType, CSSProperties } from "vue";
const VueEasyLightbox = defineAsyncComponent(() => import("vue-easy-lightbox"));

const props = defineProps({
	images: {
		type: Array as PropType<(string | LightboxImg)[]>,
		required: true,
		default: () => [],
	},
	itemStyle: {
		type: [Object, Array] as PropType<CSSProperties | CSSProperties[]>,
		default: () => ({}),
	},
	imgStyle: {
		type: [Object, Array] as PropType<CSSProperties | CSSProperties[]>,
		default: () => ({ maxWidth: "100%" }),
	},
	itemClass: {
		type: [String, Object, Array] as PropType<
			| string
			| Record<string, unknown>
			| (string | Record<string, unknown>)[]
		>,
		default: "",
	},
	imgClass: {
		type: [String, Object, Array] as PropType<
			| string
			| Record<string, unknown>
			| (string | Record<string, unknown>)[]
		>,
		default: "",
	},
	lightboxProps: { type: Object, default: () => ({}) },
});

const visibleRef = ref(false);
const indexRef = ref(0);

const extractSrc = (img: any) =>
	typeof img === "string" ? img : img?.src || "";
const extractTitle = (img: any) =>
	typeof img === "object" ? img.title || "" : "";

const showImg = (index: number) => {
	indexRef.value = index;
	visibleRef.value = true;
};
const onHide = () => (visibleRef.value = false);
</script>

<style scoped>
.lightbox-loader-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	z-index: 9999;
}

.loadersvg-lightbox {
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

:deep(.vel-loading) {
	background: transparent !important;
	display: block !important;
}

.lightbox-grid {
	width: 100%;
}

.pic-item {
	transition: opacity 0.2s;
}
.pic-item:hover {
	opacity: 0.8;
}
</style>
