<script setup lang="ts">
import type { CSSProperties } from "vue";

type TabValue = string | number;
type TabsOrientation = "vertical" | "horizontal";
type TabsSide = "left" | "right" | "top" | "bottom";
type TabsAlign = "start" | "center" | "end";
type TabsWidth = "full" | "auto";

interface TabItem {
	label: string;
	value?: TabValue;
	content?: string;
	disabled?: boolean;
	[key: string]: unknown;
}

interface TabsClasses {
	root?: string;
	list?: string;
	tab?: string;
	activeTab?: string;
	panel?: string;
}

interface Props {
	items: TabItem[];
	modelValue?: TabValue;
	defaultValue?: TabValue;
	orientation?: TabsOrientation;
	side?: TabsSide;
	tabWidth?: TabsWidth;
	align?: TabsAlign;
	tabsWidth?: string;
	loop?: boolean;
	stackOnMobile?: boolean;
	ariaLabel?: string;
	ui?: TabsClasses;
}

const props = withDefaults(defineProps<Props>(), {
	orientation: "vertical",
	tabWidth: "full",
	align: "start",
	tabsWidth: "16rem",
	loop: true,
	stackOnMobile: true,
	ariaLabel: "Tabs",
	ui: () => ({}),
});

const emit = defineEmits<{
	"update:modelValue": [value: TabValue];
	change: [value: TabValue, item: TabItem, index: number];
}>();

const componentId = useId();
const tabButtons = ref<Array<HTMLButtonElement | null>>([]);

const getTabValue = (item: TabItem, index: number): TabValue =>
	item.value ?? index;
const firstEnabledValue = () => {
	const index = props.items.findIndex((item) => !item.disabled);
	return index >= 0
		? getTabValue(props.items[index] as TabItem, index)
		: undefined;
};

const activeValue = ref<TabValue | undefined>(
	props.modelValue ?? props.defaultValue ?? firstEnabledValue(),
);

const activeIndex = computed(() =>
	props.items.findIndex(
		(item, index) => getTabValue(item, index) === activeValue.value,
	),
);
const activeItem = computed(() => props.items[activeIndex.value]);

const resolvedSide = computed<TabsSide>(() => {
	if (props.orientation === "vertical") {
		return props.side === "right" ? "right" : "left";
	}

	return props.side === "bottom" ? "bottom" : "top";
});

type TabsStyles = CSSProperties & Record<`--ui-tabs-${string}`, string>;

const rootStyles = computed<TabsStyles>(() => ({
	"--ui-tabs-list-width": props.tabsWidth,
	"--ui-tabs-panel-enter-x":
		props.orientation === "vertical"
			? resolvedSide.value === "right"
				? "-0.5rem"
				: "0.5rem"
			: "0",
	"--ui-tabs-panel-enter-y":
		props.orientation === "horizontal" ? "0.4rem" : "0",
}));

const rootClasses = computed(() => [
	"ui-tabs",
	`ui-tabs--${props.orientation}`,
	`ui-tabs--side-${resolvedSide.value}`,
	`ui-tabs--align-${props.align}`,
	`ui-tabs--tab-${props.tabWidth}`,
	{ "ui-tabs--stack-mobile": props.stackOnMobile },
	props.ui.root,
]);

const selectTab = (item: TabItem, index: number) => {
	if (item.disabled) return;

	const value = getTabValue(item, index);
	activeValue.value = value;
	emit("update:modelValue", value);
	emit("change", value, item, index);
};

const enabledIndices = computed(() =>
	props.items.flatMap((item, index) => (item.disabled ? [] : [index])),
);

const focusTab = (index: number) => {
	const item = props.items[index];
	if (!item) return;

	tabButtons.value[index]?.focus();
	selectTab(item, index);
};

const moveFocus = (currentIndex: number, direction: 1 | -1) => {
	const indices = enabledIndices.value;
	const position = indices.indexOf(currentIndex);
	if (position < 0 || !indices.length) return;

	let nextPosition = position + direction;
	if (props.loop) {
		nextPosition = (nextPosition + indices.length) % indices.length;
	} else {
		nextPosition = Math.min(Math.max(nextPosition, 0), indices.length - 1);
	}

	focusTab(indices[nextPosition] as number);
};

const onTabKeydown = (event: KeyboardEvent, index: number) => {
	const previousKey =
		props.orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
	const nextKey =
		props.orientation === "vertical" ? "ArrowDown" : "ArrowRight";

	if (event.key === previousKey || event.key === nextKey) {
		event.preventDefault();
		moveFocus(index, event.key === nextKey ? 1 : -1);
	} else if (event.key === "Home") {
		event.preventDefault();
		focusTab(enabledIndices.value[0] as number);
	} else if (event.key === "End") {
		event.preventDefault();
		focusTab(enabledIndices.value.at(-1) as number);
	}
};

watch(
	() => props.modelValue,
	(value) => {
		if (value !== undefined) activeValue.value = value;
	},
);

watch(
	() =>
		props.items.map((item, index) => [
			getTabValue(item, index),
			item.disabled,
		]),
	() => {
		const current = props.items[activeIndex.value];
		if (!current || current.disabled)
			activeValue.value = firstEnabledValue();
	},
	{ immediate: true },
);

onBeforeUpdate(() => {
	tabButtons.value = [];
});
</script>

<template>
	<div :class="rootClasses" :style="rootStyles">
		<div
			:class="['ui-tabs__list', ui.list]"
			role="tablist"
			:aria-label="ariaLabel"
			:aria-orientation="orientation"
		>
			<button
				v-for="(item, index) in items"
				:id="`${componentId}-tab-${index}`"
				:key="getTabValue(item, index)"
				:ref="
					(element) =>
						(tabButtons[index] =
							element as HTMLButtonElement | null)
				"
				type="button"
				role="tab"
				:class="[
					'ui-tabs__tab',
					ui.tab,
					{ 'ui-tabs__tab--active': activeIndex === index },
					activeIndex === index && ui.activeTab,
				]"
				:disabled="item.disabled"
				:tabindex="activeIndex === index ? 0 : -1"
				:aria-selected="activeIndex === index"
				:aria-controls="`${componentId}-panel-${index}`"
				@click="selectTab(item, index)"
				@keydown="onTabKeydown($event, index)"
			>
				<slot
					name="tab"
					:item="item"
					:index="index"
					:active="activeIndex === index"
					:disabled="item.disabled"
				>
					{{ item.label }}
				</slot>
			</button>
		</div>

		<div class="ui-tabs__panel-wrap">
			<Transition name="ui-tabs-panel" mode="out-in" appear>
				<div
					v-if="activeItem"
					:id="`${componentId}-panel-${activeIndex}`"
					:key="activeValue"
					:class="['ui-tabs__panel', ui.panel]"
					role="tabpanel"
					:aria-labelledby="`${componentId}-tab-${activeIndex}`"
					tabindex="0"
				>
					<slot
						name="panel"
						:item="activeItem"
						:index="activeIndex"
						:value="activeValue"
					>
						{{ activeItem.content }}
					</slot>
				</div>
			</Transition>
		</div>
	</div>
</template>

<style scoped>
.ui-tabs {
	display: flex;
	width: 100%;
	min-width: 0;
	gap: 1.5rem;
	color: var(--ui-text);
}

.ui-tabs--vertical {
	align-items: flex-start;
}

.ui-tabs--horizontal {
	flex-direction: column;
	gap: 1rem;
}

.ui-tabs--side-right .ui-tabs__list,
.ui-tabs--side-bottom .ui-tabs__list {
	order: 2;
}

.ui-tabs__list {
	display: flex;
	flex: 0 0 var(--ui-tabs-list-width);
	min-width: 0;
	gap: 0.4rem;
}

.ui-tabs--vertical .ui-tabs__list {
	width: var(--ui-tabs-list-width);
	flex-direction: column;
}

.ui-tabs--horizontal .ui-tabs__list {
	width: 100%;
	flex: none;
	flex-flow: row wrap;
}

.ui-tabs--align-start .ui-tabs__list {
	align-items: flex-start;
	justify-content: flex-start;
}

.ui-tabs--align-center .ui-tabs__list {
	align-items: center;
	justify-content: center;
}

.ui-tabs--align-end .ui-tabs__list {
	align-items: flex-end;
	justify-content: flex-end;
}

.ui-tabs__tab {
	min-height: 2.65rem;
	padding: 0.65rem 0.85rem;
	font: inherit;
	font-size: 0.9rem;
	font-weight: 600;
	line-height: 1.25;
	color: var(--ui-text);
	text-align: inherit;
	background: transparent;
	border: 1px solid transparent;
	border-radius: 0.5rem;
	cursor: pointer;
	transition:
		color 140ms ease,
		background-color 140ms ease,
		border-color 140ms ease;
}

.ui-tabs--align-start .ui-tabs__tab {
	text-align: start;
}

.ui-tabs--align-center .ui-tabs__tab {
	text-align: center;
}

.ui-tabs--align-end .ui-tabs__tab {
	text-align: end;
}

.ui-tabs--tab-full.ui-tabs--vertical .ui-tabs__tab {
	width: 100%;
}

.ui-tabs--tab-full.ui-tabs--horizontal .ui-tabs__tab {
	flex: 1 1 0;
}

.ui-tabs--tab-auto .ui-tabs__tab {
	width: max-content;
	max-width: 100%;
}

.ui-tabs__tab:hover:not(:disabled) {
	background: color-mix(in srgb, var(--ui-text) 5%, var(--ui-bg));
}

.ui-tabs__tab--active {
	background: color-mix(in srgb, var(--ui-text) 10%, var(--ui-bg));
	border-color: color-mix(in srgb, var(--ui-text) 16%, transparent);
}

.ui-tabs__tab:focus-visible {
	outline: 2px solid color-mix(in srgb, var(--ui-text) 70%, transparent);
	outline-offset: 2px;
}

.ui-tabs__tab:disabled {
	cursor: not-allowed;
	opacity: 0.4;
}

.ui-tabs__panel-wrap {
	min-width: 0;
	flex: 1 1 auto;
}

.ui-tabs__panel {
	min-width: 0;
	outline: none;
}

.ui-tabs__panel:focus-visible {
	outline: 2px solid color-mix(in srgb, var(--ui-text) 45%, transparent);
	outline-offset: 0.35rem;
}

.ui-tabs-panel-enter-active,
.ui-tabs-panel-leave-active {
	transition:
		opacity 160ms ease,
		transform 160ms ease;
}

.ui-tabs-panel-enter-from {
	opacity: 0;
	transform: translate(
		var(--ui-tabs-panel-enter-x),
		var(--ui-tabs-panel-enter-y)
	);
}

.ui-tabs-panel-leave-to {
	opacity: 0;
}

@media (max-width: 767px) {
	.ui-tabs--vertical.ui-tabs--stack-mobile {
		flex-direction: column;
		gap: 1rem;
	}

	.ui-tabs--vertical.ui-tabs--stack-mobile .ui-tabs__list {
		order: 0;
		width: 100%;
		flex: none;
		flex-flow: row nowrap;
		overflow-x: auto;
	}

	.ui-tabs--vertical.ui-tabs--stack-mobile.ui-tabs--tab-full .ui-tabs__tab {
		width: auto;
		flex: 1 0 auto;
	}
}

@media (prefers-reduced-motion: reduce) {
	.ui-tabs__tab,
	.ui-tabs-panel-enter-active,
	.ui-tabs-panel-leave-active {
		transition: none;
	}

	.ui-tabs-panel-enter-from {
		transform: none;
	}
}

@media (forced-colors: active) {
	.ui-tabs__tab--active {
		border-color: CanvasText;
	}
}
</style>
