<script setup lang="ts">
import type { CSSProperties } from "vue";

import type { LayoutSize } from "~/constants/layout";

interface Props {
	as?: string;
	containerSize?: LayoutSize;
	backgroundHeightLeft?: string;
	backgroundHeightRight?: string;
	backgroundBeforeContent?: boolean;
	backgroundBeforeContentHeight?: string;
	backgroundAfterContent?: boolean;
	backgroundAfterContentHeight?: string;
	minHeight?: string;
	contentAlign?: "top" | "center" | "bottom";
	backgroundColor?: string;
	backgroundColorDark?: string;
	background?: string;
	backgroundDark?: string;
	backgroundSize?: string;
	backgroundPosition?: string;
	backgroundRepeat?: string;
	mask?: string;
	maskDark?: string;
	maskSize?: string;
	maskPosition?: string;
	maskRepeat?: string;
	layerClass?: string;
	contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	as: "section",
	containerSize: "content",
	backgroundHeightLeft: "60dvh",
	backgroundHeightRight: "60dvh",
	backgroundBeforeContent: false,
	backgroundBeforeContentHeight: "clamp(5rem, 12dvh, 10rem)",
	backgroundAfterContent: false,
	backgroundAfterContentHeight: "clamp(5rem, 12dvh, 10rem)",
	contentAlign: "top",
	backgroundColor: "transparent",
	background: "transparent",
	backgroundSize: "cover",
	backgroundPosition: "center",
	backgroundRepeat: "no-repeat",
	mask: "none",
	maskSize: "cover",
	maskPosition: "center",
	maskRepeat: "no-repeat",
	layerClass: "",
	contentClass: "",
});

type PartialBackgroundStyles = CSSProperties &
	Record<`--partial-background-${string}`, string>;

const rootStyles = computed<PartialBackgroundStyles>(() => ({
	"--partial-background-left": props.backgroundHeightLeft,
	"--partial-background-right": props.backgroundHeightRight,
	"--partial-background-before-content-height":
		props.backgroundBeforeContentHeight,
	"--partial-background-after-content-height":
		props.backgroundAfterContentHeight,
	"--partial-background-min-height": props.minHeight || "auto",
	"--partial-background-color-light": props.backgroundColor,
	"--partial-background-color-dark":
		props.backgroundColorDark || props.backgroundColor,
	"--partial-background-light": props.background,
	"--partial-background-dark": props.backgroundDark || props.background,
	"--partial-background-size": props.backgroundSize,
	"--partial-background-position": props.backgroundPosition,
	"--partial-background-repeat": props.backgroundRepeat,
	"--partial-background-mask-light": props.mask,
	"--partial-background-mask-dark": props.maskDark || props.mask,
	"--partial-background-mask-size": props.maskSize,
	"--partial-background-mask-position": props.maskPosition,
	"--partial-background-mask-repeat": props.maskRepeat,
}));

const contentAlignmentClass = computed(
	() =>
		({
			top: "justify-start",
			center: "justify-center",
			bottom: "justify-end",
		})[props.contentAlign],
);

const contentClasses = computed(() =>
	[
		"view-partial-background__content",
		contentAlignmentClass.value,
		props.contentClass,
	]
		.filter(Boolean)
		.join(" "),
);

const rootClasses = computed(() =>
	[
		"view-partial-background h-[auto]",
		props.backgroundBeforeContent &&
			"view-partial-background--before-content",
		props.backgroundAfterContent &&
			"view-partial-background--after-content",
	]
		.filter(Boolean)
		.join(" "),
);
</script>

<template>
	<GridStack :as="as" :class="rootClasses" :style="rootStyles">
		<div
			v-if="backgroundBeforeContent"
			class="view-partial-background__layer view-partial-background__layer--before"
			:class="layerClass"
			aria-hidden="true"
		>
			<slot name="background-before">
				<slot name="background" />
			</slot>
		</div>

		<GridContainer :size="containerSize" :class="contentClasses">
			<slot />
		</GridContainer>

		<div
			v-if="backgroundAfterContent"
			class="view-partial-background__layer view-partial-background__layer--after"
			:class="layerClass"
			aria-hidden="true"
		>
			<slot name="background-after">
				<slot name="background" />
			</slot>
		</div>

		<div
			v-if="!backgroundBeforeContent && !backgroundAfterContent"
			class="view-partial-background__layer view-partial-background__layer--behind"
			:class="layerClass"
			aria-hidden="true"
		>
			<slot name="background" />
		</div>
	</GridStack>
</template>

<style>
.view-partial-background {
	position: relative;
	isolation: isolate;
	width: 100%;
	min-height: var(--partial-background-min-height);
}

.view-partial-background__layer {
	position: absolute;
	z-index: -1;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
	background: var(--partial-background-light);
	background-color: var(--partial-background-color-light);
	background-position: var(--partial-background-position);
	background-repeat: var(--partial-background-repeat);
	background-size: var(--partial-background-size);
	clip-path: polygon(
		0 0,
		100% 0,
		100% var(--partial-background-right),
		0 var(--partial-background-left)
	);
	-webkit-mask: var(--partial-background-mask-light);
	mask: var(--partial-background-mask-light);
	-webkit-mask-position: var(--partial-background-mask-position);
	mask-position: var(--partial-background-mask-position);
	-webkit-mask-repeat: var(--partial-background-mask-repeat);
	mask-repeat: var(--partial-background-mask-repeat);
	-webkit-mask-size: var(--partial-background-mask-size);
	mask-size: var(--partial-background-mask-size);
}

.view-partial-background__content {
	position: relative;
	z-index: 1;
	min-height: inherit;
}

.view-partial-background--before-content::before,
.view-partial-background--after-content::before {
	position: absolute;
	z-index: -1;
	right: 0;
	left: 0;
	content: "";
	pointer-events: none;
	background-color: var(--partial-background-color-light);
}

.view-partial-background--before-content::before {
	top: var(--partial-background-before-content-height);
	bottom: 0;
}

.view-partial-background--after-content::before {
	top: 0;
	bottom: var(--partial-background-after-content-height);
}

.view-partial-background--before-content.view-partial-background--after-content::before {
	top: var(--partial-background-before-content-height);
	bottom: var(--partial-background-after-content-height);
}

.view-partial-background__layer--before,
.view-partial-background__layer--after {
	position: relative;
	z-index: 0;
	inset: auto;
	width: 100%;
	flex: none;
}

.view-partial-background__layer--before {
	height: var(--partial-background-before-content-height);
	clip-path: polygon(
		0 calc(100% - var(--partial-background-left)),
		100% calc(100% - var(--partial-background-right)),
		100% 100%,
		0 100%
	);
}

.view-partial-background__layer--after {
	height: var(--partial-background-after-content-height);
	clip-path: polygon(
		0 0,
		100% 0,
		100% var(--partial-background-right),
		0 var(--partial-background-left)
	);
}

@media (prefers-color-scheme: dark) {
	.view-partial-background__layer {
		background: var(--partial-background-dark);
		background-color: var(--partial-background-color-dark);
		background-position: var(--partial-background-position);
		background-repeat: var(--partial-background-repeat);
		background-size: var(--partial-background-size);
		-webkit-mask: var(--partial-background-mask-dark);
		mask: var(--partial-background-mask-dark);
		-webkit-mask-position: var(--partial-background-mask-position);
		mask-position: var(--partial-background-mask-position);
		-webkit-mask-repeat: var(--partial-background-mask-repeat);
		mask-repeat: var(--partial-background-mask-repeat);
		-webkit-mask-size: var(--partial-background-mask-size);
		mask-size: var(--partial-background-mask-size);
	}

	.view-partial-background--before-content::before,
	.view-partial-background--after-content::before {
		background-color: var(--partial-background-color-dark);
	}
}

[data-theme="light"] .view-partial-background__layer {
	background: var(--partial-background-light);
	background-color: var(--partial-background-color-light);
	background-position: var(--partial-background-position);
	background-repeat: var(--partial-background-repeat);
	background-size: var(--partial-background-size);
	-webkit-mask: var(--partial-background-mask-light);
	mask: var(--partial-background-mask-light);
	-webkit-mask-position: var(--partial-background-mask-position);
	mask-position: var(--partial-background-mask-position);
	-webkit-mask-repeat: var(--partial-background-mask-repeat);
	mask-repeat: var(--partial-background-mask-repeat);
	-webkit-mask-size: var(--partial-background-mask-size);
	mask-size: var(--partial-background-mask-size);
}

[data-theme="light"] .view-partial-background--before-content::before,
[data-theme="light"] .view-partial-background--after-content::before {
	background-color: var(--partial-background-color-light);
}

[data-theme="dark"] .view-partial-background__layer {
	background: var(--partial-background-dark);
	background-color: var(--partial-background-color-dark);
	background-position: var(--partial-background-position);
	background-repeat: var(--partial-background-repeat);
	background-size: var(--partial-background-size);
	-webkit-mask: var(--partial-background-mask-dark);
	mask: var(--partial-background-mask-dark);
	-webkit-mask-position: var(--partial-background-mask-position);
	mask-position: var(--partial-background-mask-position);
	-webkit-mask-repeat: var(--partial-background-mask-repeat);
	mask-repeat: var(--partial-background-mask-repeat);
	-webkit-mask-size: var(--partial-background-mask-size);
	mask-size: var(--partial-background-mask-size);
}

[data-theme="dark"] .view-partial-background--before-content::before,
[data-theme="dark"] .view-partial-background--after-content::before {
	background-color: var(--partial-background-color-dark);
}
</style>
