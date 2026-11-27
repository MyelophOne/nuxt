<script setup lang="ts">
defineProps<{
	title: string;
	src: string;
	alt?: string;
	to?: string;
	description?: string;
	actionLabel?: string;
	width?: number;
	height?: number;
	sizes?: string;
}>();
</script>

<template>
	<UiCard
		as="article"
		:padded="false"
		:bordered="false"
		class="view-image-tile"
	>
		<SafeNuxtImg
			:src="src"
			:alt="alt || ''"
			:width="width || 1000"
			:height="height || 700"
			:sizes="sizes || 'xs:100vw lg:50vw'"
			loading="lazy"
			class="tile-image"
		/>
		<div class="tile-copy">
			<slot name="before" />
			<h3>
				<UiLangLink v-if="to" :to="to" class="tile-link">{{
					title
				}}</UiLangLink
				><template v-else>{{ title }}</template>
			</h3>
			<p v-if="description">{{ description }}</p>
			<span v-if="actionLabel" class="tile-action"
				>{{ actionLabel
				}}<UiIcon
					v-if="to"
					name="lucide:arrow-up-right"
					aria-hidden="true"
			/></span>
			<slot />
		</div>
	</UiCard>
</template>

<style scoped>
.view-image-tile {
	position: relative;
	isolation: isolate;
	overflow: hidden;
	height: 100%;
	min-height: var(--tile-height, 20rem);
	color: var(--tile-text, #fff);
}
.tile-image {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.35s ease;
}
.tile-copy {
	position: relative;
	min-height: var(--tile-height, 20rem);
	display: flex;
	flex-direction: column;
	justify-content: end;
	padding: var(--tile-padding, 1.5rem);
	background: var(
		--tile-overlay,
		linear-gradient(0deg, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0.1))
	);
}
h3 {
	margin: 0;
	font-size: var(--tile-title-size, 1.75rem);
	line-height: 1.2;
}
p {
	margin-top: 0.75rem;
}
.tile-link::after {
	content: "";
	position: absolute;
	inset: 0;
}
.tile-link:focus-visible {
	outline: none;
}
.view-image-tile:focus-within {
	outline: 2px solid var(--ui-text);
	outline-offset: 3px;
}
.tile-action {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 1rem;
}
@media (hover: hover) and (pointer: fine) {
	.view-image-tile:has(.tile-link):hover .tile-image {
		transform: scale(1.04);
	}
}
.view-image-tile:focus-within .tile-image {
	transform: scale(1.02);
}
@media (prefers-reduced-motion: reduce) {
	.tile-image {
		transition: none;
	}
	.view-image-tile:hover .tile-image,
	.view-image-tile:focus-within .tile-image {
		transform: none;
	}
}
</style>
