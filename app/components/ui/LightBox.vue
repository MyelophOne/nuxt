<script setup lang="ts">
import type { CSSProperties } from "vue";
type LightboxImage = string | Partial<GalleryImage>;
type ClassValue =
	string | Record<string, unknown> | (string | Record<string, unknown>)[];
const props = withDefaults(
	defineProps<{
		images: LightboxImage[];
		itemStyle?: CSSProperties | CSSProperties[];
		imgStyle?: CSSProperties | CSSProperties[];
		itemClass?: ClassValue;
		imgClass?: ClassValue;
		lightboxProps?: Record<string, unknown>;
		visible?: boolean;
		index?: number;
		layout?: "default" | "mosaic" | "single";
		maxPreviews?: number;
		label?: string;
		allLabel?: string;
		priority?: boolean;
	}>(),
	{
		images: () => [],
		itemStyle: () => ({}),
		imgStyle: () => ({ maxWidth: "100%" }),
		itemClass: "",
		imgClass: "",
		lightboxProps: () => ({}),
		layout: "default",
		maxPreviews: 9,
	},
);
const emit = defineEmits<{
	"update:visible": [value: boolean];
	"update:index": [value: number];
	open: [index: number];
	hide: [];
}>();
const { t } = useMultiLang("reusable-ui");
const VueEasyLightbox = defineAsyncComponent(() => import("vue-easy-lightbox"));
const internalVisible = ref(false);
const internalIndex = ref(0);
const openedOnce = ref(false);
let opener: HTMLElement | null = null;
const visibleRef = computed(() => props.visible ?? internalVisible.value);
const indexRef = computed(() => props.index ?? internalIndex.value);
const viewerVisible = computed(
	() => props.lightboxProps.visible ?? visibleRef.value,
);
const previews = computed(() =>
	props.images.slice(
		0,
		props.layout === "single"
			? 1
			: props.layout === "mosaic"
				? Math.max(1, Math.floor(props.maxPreviews) || 1)
				: undefined,
	),
);
const extractSrc = (image: LightboxImage) =>
	typeof image === "string" ? image : image.src || "";
const extractAlt = (image: LightboxImage) =>
	typeof image === "string" ? "" : (image.alt ?? image.title ?? "");
function showImg(index: number, event?: Event) {
	if (index < 0 || index >= props.images.length) return;
	opener =
		event?.currentTarget instanceof HTMLElement
			? event.currentTarget
			: document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
	internalIndex.value = index;
	internalVisible.value = true;
	openedOnce.value = true;
	emit("update:index", index);
	emit("update:visible", true);
	emit("open", index);
}
function onHide() {
	internalVisible.value = false;
	emit("update:visible", false);
	emit("hide");
	if (opener?.isConnected) opener.focus({ preventScroll: true });
}
function onIndexChange(_oldIndex: number, newIndex: number) {
	internalIndex.value = newIndex;
	emit("update:index", newIndex);
}
watch(viewerVisible, (value, previous) => {
	if (value) {
		openedOnce.value = true;
		if (
			!previous &&
			import.meta.client &&
			document.activeElement instanceof HTMLElement
		)
			opener = document.activeElement;
	}
});
watch(
	() => props.images.length,
	(length) => {
		if (!length && visibleRef.value && !props.lightboxProps.imgs) onHide();
		else if (length && indexRef.value >= length) {
			internalIndex.value = length - 1;
			emit("update:index", length - 1);
		}
	},
);
defineExpose({ open: showImg, close: onHide });
</script>

<template>
	<div
		class="lightbox-grid"
		:class="{
			'lightbox-mosaic': layout === 'mosaic',
			'lightbox-single': layout === 'single',
		}"
		:aria-label="label || t('reusable-ui.gallery')"
	>
		<slot name="previews" :images="images" :open="showImg">
			<UiButton
				v-for="(img, position) in previews"
				:key="`${extractSrc(img)}-${position}`"
				as="a"
				:href="extractSrc(img)"
				target="_blank"
				rel="noopener noreferrer"
				variant="ghost"
				:class="['pic-item', itemClass]"
				:style="itemStyle"
				aria-haspopup="dialog"
				:aria-label="
					t('reusable-ui.openImage', { number: position + 1 })
				"
				@click.prevent="showImg(position, $event)"
			>
				<SafeNuxtImg
					:src="extractSrc(img)"
					:alt="extractAlt(img)"
					:width="typeof img === 'object' ? img.width || 1200 : 1200"
					:height="typeof img === 'object' ? img.height || 800 : 800"
					:sizes="
						typeof img === 'object'
							? img.sizes || 'xs:100vw lg:800px'
							: 'xs:100vw lg:800px'
					"
					:loading="priority && position === 0 ? 'eager' : 'lazy'"
					:preload="priority && position === 0"
					:fetchpriority="
						priority && position === 0 ? 'high' : undefined
					"
					:class="imgClass"
					:style="imgStyle"
				/>
			</UiButton>
			<UiButton
				v-if="layout !== 'default' && images.length > 1"
				type="button"
				class="lightbox-all"
				variant="outline"
				leading-icon="lucide:images"
				:label="
					allLabel ||
					t('reusable-ui.allImages', { count: images.length })
				"
				@click="showImg(0, $event)"
			/>
		</slot>
		<ClientOnly>
			<VueEasyLightbox
				v-if="openedOnce || viewerVisible"
				:visible="visibleRef"
				:imgs="images"
				:index="indexRef"
				v-bind="lightboxProps"
				@hide="onHide"
				@on-index-change="onIndexChange"
			>
				<template #loading
					><div class="lightbox-loader-overlay">
						<span class="loadersvg-lightbox" /></div
				></template>
			</VueEasyLightbox>
		</ClientOnly>
	</div>
</template>

<style scoped>
.lightbox-grid {
	width: 100%;
	position: relative;
}
.pic-item {
	display: block;
	width: 100%;
	padding: 0;
	border: 0;
	border-radius: var(--gallery-radius, 0.75rem);
	overflow: hidden;
	background: var(--ui-bg);
}
.pic-item :deep(img) {
	display: block;
	width: 100%;
	height: auto;
	transition: transform 0.3s ease;
}
.pic-item:focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 3px;
}
.lightbox-mosaic {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: var(--gallery-gap, 0.625rem);
}
.lightbox-mosaic .pic-item:first-child {
	grid-column: span 3;
	grid-row: span 2;
}
.lightbox-mosaic .pic-item {
	min-height: 0;
}
.lightbox-mosaic .pic-item :deep(img),
.lightbox-single .pic-item :deep(img) {
	height: 100%;
	object-fit: cover;
	aspect-ratio: 3 / 2;
}
.lightbox-mosaic .pic-item:only-of-type {
	grid-column: 1 / -1;
}
.lightbox-all {
	position: absolute;
	right: 1rem;
	bottom: 1rem;
	max-width: calc(100% - 2rem);
	white-space: normal;
}
.lightbox-loader-overlay {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
}
.loadersvg-lightbox {
	width: 2rem;
	height: 2rem;
	border: 3px solid transparent;
	border-top-color: var(--loader-fill-color, currentColor);
	border-radius: 50%;
	animation: lightbox-rotate 0.8s linear infinite;
}
@keyframes lightbox-rotate {
	to {
		transform: rotate(360deg);
	}
}
@media (hover: hover) and (pointer: fine) {
	.pic-item:hover :deep(img) {
		transform: scale(1.03);
	}
}
@media (prefers-reduced-motion: reduce) {
	.pic-item :deep(img) {
		transition: none;
	}
	.pic-item:hover :deep(img) {
		transform: none;
	}
	.loadersvg-lightbox {
		animation: none;
	}
}
@media (max-width: 639px) {
	.lightbox-mosaic {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.lightbox-mosaic .pic-item:first-child {
		grid-column: 1 / -1;
		grid-row: auto;
	}
}
</style>
