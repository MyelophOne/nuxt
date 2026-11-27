<script setup lang="ts">
import type { GalleryImage } from "../../types/reusable-ui";
const props = withDefaults(
	defineProps<{
		title: string;
		to: string;
		excerpt?: string;
		image?: GalleryImage;
		publishedAt?: string;
		locale?: string;
		timeZone?: string;
		readLabel?: string;
		variant?: "default" | "lead" | "compact";
	}>(),
	{ variant: "default", timeZone: "UTC" },
);
const settings = useSettingsStore();
const { t } = useMultiLang("interface");
const date = computed(() => {
	if (!props.publishedAt) return "";
	const value = new Date(
		isUiDate(props.publishedAt)
			? props.publishedAt + "T12:00:00Z"
			: props.publishedAt,
	);
	return Number.isFinite(value.getTime())
		? new Intl.DateTimeFormat(props.locale || settings.currentLocale, {
				dateStyle: "long",
				timeZone: props.timeZone,
			}).format(value)
		: "";
});
</script>

<template>
	<UiCard
		as="article"
		:padded="false"
		class="view-article-card"
		:class="`article-${variant}`"
	>
		<UiLangLink
			v-if="image"
			:to="to"
			class="article-photo"
			:aria-label="title"
			tabindex="-1"
			aria-hidden="true"
		>
			<SafeNuxtImg
				:src="image.src"
				:alt="image.alt || ''"
				:width="image.width || (variant === 'lead' ? 1100 : 650)"
				:height="image.height || 460"
				:sizes="image.sizes || 'xs:100vw lg:50vw'"
				loading="lazy"
			/>
		</UiLangLink>
		<div class="article-copy">
			<time v-if="date" :datetime="publishedAt">{{ date }}</time>
			<slot name="meta" />
			<h3>
				<UiLangLink :to="to">{{ title }}</UiLangLink>
			</h3>
			<p v-if="excerpt">{{ excerpt }}</p>
			<slot />
			<UiLangLink :to="to" class="article-action"
				>{{ readLabel || t("interface.readMore")
				}}<UiIcon name="lucide:arrow-up-right" aria-hidden="true"
			/></UiLangLink>
		</div>
	</UiCard>
</template>

<style scoped>
.view-article-card {
	min-width: 0;
	height: 100%;
	overflow: hidden;
}
.article-photo {
	display: block;
	overflow: hidden;
}
.article-photo :deep(img) {
	display: block;
	width: 100%;
	aspect-ratio: 1.5;
	height: auto;
	object-fit: cover;
	transition: transform 0.3s ease;
}
.article-copy {
	padding: var(--article-padding, 1.25rem);
}
h3 {
	margin-block: 0.75rem;
	font-size: var(--article-title-size, 1.4rem);
	line-height: 1.25;
	overflow-wrap: anywhere;
}
time {
	font-size: 0.875em;
}
.article-lead h3 {
	font-size: var(--article-lead-title-size, 2rem);
}
.article-action {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 1rem;
}
.article-compact :deep(> div) {
	display: flex;
	align-items: start;
}
.article-compact .article-photo {
	width: 35%;
	flex-shrink: 0;
}
.article-compact .article-copy {
	min-width: 0;
}
.article-compact h3 {
	font-size: 1.125rem;
}
@media (hover: hover) and (pointer: fine) {
	.view-article-card:hover .article-photo :deep(img) {
		transform: scale(1.035);
	}
}
.view-article-card:focus-within .article-photo :deep(img) {
	transform: scale(1.02);
}
@media (prefers-reduced-motion: reduce) {
	.article-photo :deep(img) {
		transition: none;
	}
	.view-article-card:hover .article-photo :deep(img),
	.view-article-card:focus-within .article-photo :deep(img) {
		transform: none;
	}
}
@media (max-width: 479px) {
	.article-compact :deep(> div) {
		display: block;
	}
	.article-compact .article-photo {
		width: 100%;
	}
}
</style>
