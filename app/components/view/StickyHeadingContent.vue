<script setup lang="ts">
import type { COL_SPAN } from "~/constants/layout";
import type { LayoutSize } from "~/constants/layout";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "display";
type StickyBreakpoint = "always" | "sm" | "md" | "lg";

interface Props {
	as?: string;
	title?: string;
	headingSide?: "left" | "right";
	headingLevel?: HeadingLevel;
	headingSize?: HeadingSize;
	headingSpan?: keyof typeof COL_SPAN;
	contentSpan?: keyof typeof COL_SPAN;
	containerSize?: LayoutSize;
	sticky?: boolean;
	stickyFrom?: StickyBreakpoint;
	stickyOffset?: string;
	class?: string;
	containerClass?: string;
	rowClass?: string;
	headingColumnClass?: string;
	headingClass?: string;
	contentColumnClass?: string;
	contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	as: "section",
	title: "",
	headingSide: "left",
	headingLevel: 2,
	headingSize: "lg",
	headingSpan: 5,
	contentSpan: 7,
	containerSize: "content",
	sticky: true,
	stickyFrom: "lg",
	stickyOffset: "6rem",
	class: "",
	containerClass: "",
	rowClass: "",
	headingColumnClass: "",
	headingClass: "",
	contentColumnClass: "",
	contentClass: "",
});

const stickyClasses: Record<StickyBreakpoint, string> = {
	always: "sticky",
	sm: "sm:sticky",
	md: "md:sticky",
	lg: "lg:sticky",
};

const rootClasses = computed(() =>
	["w-full", props.class].filter(Boolean).join(" "),
);

const containerClasses = computed(() => props.containerClass);

const rowClasses = computed(() =>
	["gap-y-8 md:-mx-6", props.rowClass].filter(Boolean).join(" "),
);

const headingColumnClasses = computed(() =>
	[
		"view-sticky-heading-content__heading-column md:px-6",
		props.headingSide === "right" ? "md:order-2" : "md:order-1",
		props.headingColumnClass,
	]
		.filter(Boolean)
		.join(" "),
);

const contentColumnClasses = computed(() =>
	[
		"view-sticky-heading-content__content-column md:px-6",
		props.headingSide === "right" ? "md:order-1" : "md:order-2",
		props.contentColumnClass,
	]
		.filter(Boolean)
		.join(" "),
);

const headingColumnStyles = computed(() => ({
	"--view-sticky-heading-column-width": `${(Number(props.headingSpan) / 12) * 100}%`,
}));

const contentColumnStyles = computed(() => ({
	"--view-sticky-content-column-width": `${(Number(props.contentSpan) / 12) * 100}%`,
}));

const stickyHeadingClasses = computed(() =>
	["w-full self-start", props.sticky && stickyClasses[props.stickyFrom]]
		.filter(Boolean)
		.join(" "),
);

const stickyHeadingStyles = computed(() =>
	props.sticky ? { top: props.stickyOffset } : undefined,
);
</script>

<template>
	<component :is="as" :class="rootClasses">
		<GridContainer :size="containerSize" :class="containerClasses">
			<GridRow align="stretch" :class="rowClasses">
				<GridCol
					:span="headingSpan"
					:class="headingColumnClasses"
					:style="headingColumnStyles"
				>
					<div
						:class="stickyHeadingClasses"
						:style="stickyHeadingStyles"
					>
						<UiHeading
							:level="headingLevel"
							:size="headingSize"
							:class="headingClass"
						>
							<slot name="heading">{{ title }}</slot>
						</UiHeading>

						<slot name="heading-after" />
					</div>
				</GridCol>

				<GridCol
					:span="contentSpan"
					:class="contentColumnClasses"
					:style="contentColumnStyles"
				>
					<div :class="contentClass">
						<slot />
					</div>
				</GridCol>
			</GridRow>
		</GridContainer>
	</component>
</template>

<style>
@media (min-width: 768px) {
	.view-sticky-heading-content__heading-column {
		flex-basis: var(--view-sticky-heading-column-width);
		max-width: var(--view-sticky-heading-column-width);
	}

	.view-sticky-heading-content__content-column {
		flex-basis: var(--view-sticky-content-column-width);
		max-width: var(--view-sticky-content-column-width);
	}
}
</style>
