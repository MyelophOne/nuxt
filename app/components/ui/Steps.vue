<script setup lang="ts">
type StepValue = string | number;
type StepsVariant = "progress" | "steps" | "cards";
type StepsPlacement = "top" | "bottom";
type StepsAlign = "start" | "center" | "end";
type StepStatus = "completed" | "active" | "locked" | "upcoming";

interface StepItem {
	title: string;
	value?: StepValue;
	description?: string;
	content?: string;
	icon?: string;
	disabled?: boolean;
	requires?: StepValue | StepValue[];
	requiresPrevious?: boolean;
	[key: string]: unknown;
}

interface StepsClasses {
	root?: string;
	navigation?: string;
	item?: string;
	activeItem?: string;
	completedItem?: string;
	panel?: string;
}

interface Props {
	items: StepItem[];
	modelValue?: StepValue;
	completed?: StepValue[];
	defaultValue?: StepValue;
	variant?: StepsVariant;
	placement?: StepsPlacement;
	align?: StepsAlign;
	clickable?: boolean;
	linear?: boolean;
	requirePrevious?: boolean;
	stackOnMobile?: boolean;
	ariaLabel?: string;
	ui?: StepsClasses;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "steps",
	placement: "top",
	align: "start",
	clickable: true,
	linear: false,
	requirePrevious: false,
	stackOnMobile: true,
	ariaLabel: "Progress steps",
	ui: () => ({}),
});

const emit = defineEmits<{
	"update:modelValue": [value: StepValue];
	"update:completed": [value: StepValue[]];
	change: [value: StepValue, item: StepItem, index: number];
	complete: [value: StepValue, item: StepItem, index: number];
	uncomplete: [value: StepValue, item: StepItem, index: number];
}>();

const componentId = useId();
const stepButtons = ref<Array<HTMLButtonElement | null>>([]);

const getStepValue = (item: StepItem, index: number): StepValue =>
	item.value ?? index;
const firstEnabledIndex = () => props.items.findIndex((item) => !item.disabled);
const firstEnabledValue = () => {
	const index = firstEnabledIndex();
	return index >= 0
		? getStepValue(props.items[index] as StepItem, index)
		: undefined;
};

const internalValue = ref<StepValue | undefined>(
	props.modelValue ?? props.defaultValue ?? firstEnabledValue(),
);
const completedValues = ref<StepValue[]>([...(props.completed ?? [])]);
const activeValue = computed(() => props.modelValue ?? internalValue.value);
const activeIndex = computed(() =>
	props.items.findIndex(
		(item, index) => getStepValue(item, index) === activeValue.value,
	),
);
const activeItem = computed(() => props.items[activeIndex.value]);
const furthestIndex = ref(Math.max(activeIndex.value, 0));

const enabledIndices = computed(() =>
	props.items.flatMap((item, index) => (item.disabled ? [] : [index])),
);
const progress = computed(() => {
	if (props.items.length <= 1) return props.items.length ? 100 : 0;
	return (Math.max(0, activeIndex.value + 1) / props.items.length) * 100;
});
const progressStyle = computed(() => ({ width: `${progress.value}%` }));
const progressSegmentsStyle = computed(() => ({
	gridTemplateColumns: `repeat(${Math.max(props.items.length, 1)}, minmax(0, 1fr))`,
}));

const rootClasses = computed(() => [
	"ui-steps",
	`ui-steps--${props.variant}`,
	`ui-steps--placement-${props.placement}`,
	`ui-steps--align-${props.align}`,
	{ "ui-steps--stack-mobile": props.stackOnMobile },
	props.ui.root,
]);

const isCompleted = (target: StepValue) => {
	const index = resolveIndex(target);
	const item = props.items[index];
	return item
		? completedValues.value.includes(getStepValue(item, index))
		: false;
};

const previousEnabledIndex = (index: number) => {
	for (let candidate = index - 1; candidate >= 0; candidate--) {
		if (!props.items[candidate]?.disabled) return candidate;
	}
	return -1;
};

const completionRequirementsMet = (item: StepItem, index: number) => {
	const requirements =
		item.requires === undefined
			? []
			: Array.isArray(item.requires)
				? item.requires
				: [item.requires];
	if (!requirements.every((value) => isCompleted(value))) return false;

	if (item.requiresPrevious ?? props.requirePrevious) {
		const previousIndex = previousEnabledIndex(index);
		if (previousIndex >= 0) {
			const previousItem = props.items[previousIndex] as StepItem;
			if (
				!completedValues.value.includes(
					getStepValue(previousItem, previousIndex),
				)
			)
				return false;
		}
	}

	return true;
};

const canSelect = (item: StepItem, index: number) => {
	if (item.disabled) return false;
	if (!completionRequirementsMet(item, index)) return false;
	if (!props.linear) return true;
	return index <= furthestIndex.value + 1;
};

const statusFor = (index: number): StepStatus => {
	const item = props.items[index];
	if (!item) return "upcoming";
	if (index === activeIndex.value) return "active";
	if (completedValues.value.includes(getStepValue(item, index)))
		return "completed";
	if (!canSelect(item, index)) return "locked";
	return "upcoming";
};

const selectStep = (item: StepItem, index: number, force = false) => {
	if ((!props.clickable && !force) || !canSelect(item, index)) return false;

	const value = getStepValue(item, index);
	if (value === activeValue.value) return true;

	internalValue.value = value;
	furthestIndex.value = Math.max(furthestIndex.value, index);
	emit("update:modelValue", value);
	emit("change", value, item, index);
	return true;
};

const resolveIndex = (target: StepValue) => {
	const valueIndex = props.items.findIndex(
		(item, index) => getStepValue(item, index) === target,
	);
	if (valueIndex >= 0) return valueIndex;
	return typeof target === "number" && Number.isInteger(target) ? target : -1;
};

const goTo = (target: StepValue) => {
	const index = resolveIndex(target);
	const item = props.items[index];
	return item ? selectStep(item, index, true) : false;
};

const canGoTo = (target: StepValue) => {
	const index = resolveIndex(target);
	const item = props.items[index];
	return item ? canSelect(item, index) : false;
};

const complete = (target: StepValue = activeValue.value as StepValue) => {
	const index = resolveIndex(target);
	const item = props.items[index];
	if (!item || item.disabled) return false;

	const value = getStepValue(item, index);
	if (completedValues.value.includes(value)) return true;
	completedValues.value = [...completedValues.value, value];
	emit("update:completed", [...completedValues.value]);
	emit("complete", value, item, index);
	return true;
};

const uncomplete = (target: StepValue = activeValue.value as StepValue) => {
	const index = resolveIndex(target);
	const item = props.items[index];
	if (!item) return false;

	const value = getStepValue(item, index);
	if (!completedValues.value.includes(value)) return true;
	completedValues.value = completedValues.value.filter(
		(completedValue) => completedValue !== value,
	);
	emit("update:completed", [...completedValues.value]);
	emit("uncomplete", value, item, index);
	return true;
};

const completeAndNext = () => {
	if (!complete()) return false;
	return nextTick().then(() => next());
};

const move = (direction: 1 | -1) => {
	let index = activeIndex.value + direction;
	while (index >= 0 && index < props.items.length) {
		const item = props.items[index];
		if (item && !item.disabled) return selectStep(item, index, true);
		index += direction;
	}
	return false;
};

const next = () => move(1);
const previous = () => move(-1);

const focusStep = (index: number) => {
	const item = props.items[index];
	if (!item || !canSelect(item, index)) return;
	stepButtons.value[index]?.focus();
	selectStep(item, index);
};

const moveFocus = (currentIndex: number, direction: 1 | -1) => {
	const selectable = enabledIndices.value.filter((index) => {
		const item = props.items[index];
		return item ? canSelect(item, index) : false;
	});
	const position = selectable.indexOf(currentIndex);
	if (position < 0 || !selectable.length) return;
	const nextPosition = Math.min(
		Math.max(position + direction, 0),
		selectable.length - 1,
	);
	focusStep(selectable[nextPosition] as number);
};

const onStepKeydown = (event: KeyboardEvent, index: number) => {
	if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
		event.preventDefault();
		moveFocus(index, -1);
	} else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
		event.preventDefault();
		moveFocus(index, 1);
	} else if (event.key === "Home") {
		event.preventDefault();
		focusStep(enabledIndices.value[0] as number);
	} else if (event.key === "End") {
		event.preventDefault();
		focusStep(enabledIndices.value.at(-1) as number);
	}
};

watch(
	() => props.modelValue,
	(value) => {
		if (value === undefined) return;
		const index = resolveIndex(value);
		if (index >= 0)
			furthestIndex.value = Math.max(furthestIndex.value, index);
	},
);

watch(
	() => props.completed,
	(value) => {
		if (value) completedValues.value = [...value];
	},
	{ deep: true },
);

watch(
	() =>
		props.items.map((item, index) => [
			getStepValue(item, index),
			item.disabled,
		]),
	() => {
		if (activeIndex.value >= 0 && !activeItem.value?.disabled) return;
		internalValue.value = firstEnabledValue();
	},
	{ immediate: true },
);

onBeforeUpdate(() => {
	stepButtons.value = [];
});

defineExpose({
	goTo,
	next,
	previous,
	complete,
	uncomplete,
	completeAndNext,
	isCompleted,
	canGoTo,
	activeIndex,
	activeItem,
	activeValue,
});
</script>

<template>
	<div :class="rootClasses">
		<nav
			v-if="items.length"
			:class="['ui-steps__navigation', ui.navigation]"
			:aria-label="ariaLabel"
		>
			<div v-if="variant === 'progress'" class="ui-steps__progress">
				<div class="ui-steps__progress-meta">
					<span class="ui-steps__progress-title">{{
						activeItem?.title
					}}</span>
					<span class="ui-steps__progress-count">
						{{ Math.max(activeIndex + 1, 0) }} / {{ items.length }}
					</span>
				</div>
				<div class="ui-steps__progress-track">
					<span
						class="ui-steps__progress-fill"
						:style="progressStyle"
						role="progressbar"
						:aria-valuemin="1"
						:aria-valuemax="items.length"
						:aria-valuenow="activeIndex + 1"
						:aria-valuetext="activeItem?.title"
					></span>
					<div
						class="ui-steps__progress-segments"
						:style="progressSegmentsStyle"
					>
						<button
							v-for="(item, index) in items"
							:key="getStepValue(item, index)"
							type="button"
							class="ui-steps__progress-target"
							:disabled="!clickable || !canSelect(item, index)"
							:aria-label="`${index + 1}. ${item.title}`"
							:aria-current="
								activeIndex === index ? 'step' : undefined
							"
							@click="selectStep(item, index)"
						></button>
					</div>
				</div>
			</div>

			<ol
				v-else
				:class="['ui-steps__list', `ui-steps__list--${variant}`]"
			>
				<template
					v-for="(item, index) in items"
					:key="getStepValue(item, index)"
				>
					<li
						:class="[
							'ui-steps__list-item',
							`ui-steps__list-item--${statusFor(index)}`,
							ui.item,
							activeIndex === index && ui.activeItem,
							statusFor(index) === 'completed' &&
								ui.completedItem,
						]"
					>
						<button
							:id="`${componentId}-step-${index}`"
							:ref="
								(element) =>
									(stepButtons[index] =
										element as HTMLButtonElement | null)
							"
							type="button"
							class="ui-steps__step"
							:disabled="!clickable || !canSelect(item, index)"
							:tabindex="activeIndex === index ? 0 : -1"
							:aria-current="
								activeIndex === index ? 'step' : undefined
							"
							:aria-controls="`${componentId}-panel`"
							@click="selectStep(item, index)"
							@keydown="onStepKeydown($event, index)"
						>
							<slot
								name="step"
								:item="item"
								:index="index"
								:status="statusFor(index)"
								:active="activeIndex === index"
							>
								<span
									class="ui-steps__marker"
									aria-hidden="true"
								>
									<slot
										name="icon"
										:item="item"
										:index="index"
										:status="statusFor(index)"
									>
										<UiIcon
											v-if="item.icon"
											:name="item.icon"
											class="ui-steps__icon"
										/>
										<span v-else>{{ index + 1 }}</span>
									</slot>
								</span>
								<span class="ui-steps__copy">
									<span class="ui-steps__title">{{
										item.title
									}}</span>
									<span
										v-if="item.description"
										class="ui-steps__description"
										>{{ item.description }}</span
									>
								</span>
							</slot>
						</button>
					</li>

					<li
						v-if="variant === 'steps' && index < items.length - 1"
						class="ui-steps__connector"
						:class="{
							'ui-steps__connector--completed': isCompleted(
								getStepValue(item, index),
							),
						}"
						aria-hidden="true"
					></li>
				</template>
			</ol>
		</nav>
		<slot v-else name="empty"></slot>

		<div
			v-if="activeItem && ($slots.default || activeItem.content)"
			:id="`${componentId}-panel`"
			:key="activeValue"
			:class="['ui-steps__panel', ui.panel]"
			role="region"
			:aria-labelledby="
				variant === 'progress'
					? undefined
					: `${componentId}-step-${activeIndex}`
			"
		>
			<slot
				:item="activeItem"
				:index="activeIndex"
				:value="activeValue"
				:go-to="goTo"
				:next="next"
				:previous="previous"
				:complete="complete"
				:uncomplete="uncomplete"
				:complete-and-next="completeAndNext"
				:is-completed="isCompleted"
				:can-go-to="canGoTo"
				:is-first="activeIndex === firstEnabledIndex()"
				:is-last="activeIndex === enabledIndices.at(-1)"
			>
				{{ activeItem.content }}
			</slot>
		</div>
	</div>
</template>

<style scoped>
.ui-steps {
	display: flex;
	width: 100%;
	min-width: 0;
	flex-direction: column;
	gap: 1.25rem;
	color: var(--ui-text);
	--ui-steps-accent: var(--ui-primary, #00a968);
	--ui-steps-muted: color-mix(in srgb, var(--ui-text) 46%, transparent);
	--ui-steps-border: color-mix(in srgb, var(--ui-text) 16%, transparent);
	--ui-steps-surface: color-mix(in srgb, var(--ui-bg) 92%, var(--ui-text) 8%);
}

.ui-steps--placement-bottom .ui-steps__navigation {
	order: 2;
}

.ui-steps__navigation {
	min-width: 0;
	max-width: 100%;
}

.ui-steps--align-start .ui-steps__navigation {
	align-self: flex-start;
}

.ui-steps--align-center .ui-steps__navigation {
	align-self: center;
}

.ui-steps--align-end .ui-steps__navigation {
	align-self: flex-end;
}

.ui-steps__progress {
	width: min(32rem, calc(100vw - 2rem));
}

.ui-steps__progress-meta {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 0.65rem;
}

.ui-steps__progress-title {
	min-width: 0;
	font-weight: 700;
}

.ui-steps__progress-count {
	flex: none;
	font-size: 0.8rem;
	color: var(--ui-steps-muted);
}

.ui-steps__progress-track {
	position: relative;
	height: 0.5rem;
	background: var(--ui-steps-border);
	border-radius: 999px;
}

.ui-steps__progress-fill {
	position: absolute;
	inset: 0 auto 0 0;
	background: var(--ui-steps-accent);
	border-radius: inherit;
	transition: width 220ms ease;
}

.ui-steps__progress-segments {
	position: absolute;
	inset: -0.65rem 0;
	display: grid;
}

.ui-steps__progress-target {
	min-width: 0;
	padding: 0;
	background: transparent;
	border: 0;
	cursor: pointer;
}

.ui-steps__progress-target:disabled {
	cursor: default;
}

.ui-steps__progress-target:focus-visible {
	outline: 2px solid var(--ui-steps-accent);
	outline-offset: 0.25rem;
	border-radius: 0.25rem;
}

.ui-steps__list {
	display: flex;
	max-width: 100%;
	margin: 0;
	padding: 0;
	list-style: none;
}

.ui-steps__list--steps {
	align-items: flex-start;
	padding: 0.3rem;
	overflow-x: auto;
	scrollbar-width: thin;
}

.ui-steps__list--cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
	gap: 0.75rem;
}

.ui-steps--cards .ui-steps__navigation {
	width: 100%;
}

.ui-steps--align-start .ui-steps__list {
	justify-content: flex-start;
}

.ui-steps--align-center .ui-steps__list {
	justify-content: center;
}

.ui-steps--align-end .ui-steps__list {
	justify-content: flex-end;
}

.ui-steps__list-item {
	min-width: 0;
}

.ui-steps__list--steps .ui-steps__list-item {
	width: max-content;
	max-width: 10rem;
}

.ui-steps__step {
	display: flex;
	min-width: 0;
	padding: 0;
	font: inherit;
	color: inherit;
	text-align: left;
	background: transparent;
	border: 0;
	cursor: pointer;
}

.ui-steps__step:disabled {
	cursor: not-allowed;
}

.ui-steps__step:focus-visible {
	outline: 2px solid var(--ui-steps-accent);
	outline-offset: 0.3rem;
	border-radius: 0.5rem;
}

.ui-steps__list--steps .ui-steps__step {
	flex-direction: column;
	align-items: center;
	gap: 0.55rem;
	text-align: center;
}

.ui-steps__marker {
	display: inline-flex;
	width: 2.35rem;
	height: 2.35rem;
	flex: 0 0 2.35rem;
	align-items: center;
	justify-content: center;
	font-size: 0.85rem;
	font-weight: 800;
	color: var(--ui-steps-muted);
	background: var(--ui-bg);
	border: 2px solid var(--ui-steps-border);
	border-radius: 999px;
	transition: 160ms ease;
}

.ui-steps__icon {
	width: 1.1rem;
	height: 1.1rem;
}

.ui-steps__copy {
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 0.18rem;
}

.ui-steps__title {
	font-size: 0.9rem;
	font-weight: 700;
	line-height: 1.25;
}

.ui-steps__description {
	font-size: 0.78rem;
	line-height: 1.3;
	color: var(--ui-steps-muted);
}

.ui-steps__list-item--active .ui-steps__marker {
	color: white;
	background: var(--ui-steps-accent);
	border-color: var(--ui-steps-accent);
	box-shadow: 0 0 0 0.25rem
		color-mix(in srgb, var(--ui-steps-accent) 18%, transparent);
}

.ui-steps__list-item--completed .ui-steps__marker {
	color: var(--ui-steps-accent);
	border-color: var(--ui-steps-accent);
}

.ui-steps__list-item--upcoming .ui-steps__step:disabled {
	opacity: 0.48;
}

.ui-steps__list-item--locked .ui-steps__step {
	opacity: 0.48;
}

.ui-steps__connector {
	width: clamp(1.5rem, 5vw, 5rem);
	height: 2px;
	flex: 0 1 auto;
	margin: 1.15rem 0.35rem 0;
	background: var(--ui-steps-border);
	transition: background-color 160ms ease;
}

.ui-steps__connector--completed {
	background: var(--ui-steps-accent);
}

.ui-steps__list--cards .ui-steps__list-item {
	min-width: 0;
}

.ui-steps__list--cards .ui-steps__step {
	width: 100%;
	height: 100%;
	align-items: flex-start;
	gap: 0.85rem;
	padding: 1rem;
	background: var(--ui-steps-surface);
	border: 1px solid var(--ui-steps-border);
	border-radius: 0.8rem;
	transition:
		border-color 160ms ease,
		box-shadow 160ms ease,
		transform 160ms ease;
}

.ui-steps__list--cards .ui-steps__step:not(:disabled):hover {
	transform: translateY(-1px);
	border-color: color-mix(
		in srgb,
		var(--ui-steps-accent) 55%,
		var(--ui-steps-border)
	);
}

.ui-steps__list--cards .ui-steps__marker {
	width: 2.5rem;
	height: 2.5rem;
	flex-basis: 2.5rem;
}

.ui-steps__list--cards .ui-steps__list-item--active .ui-steps__step {
	border-color: var(--ui-steps-accent);
	box-shadow: 0 0 0 2px
		color-mix(in srgb, var(--ui-steps-accent) 18%, transparent);
}

.ui-steps__list--cards .ui-steps__copy {
	padding-top: 0.1rem;
}

.ui-steps__list--cards .ui-steps__title {
	font-size: 0.95rem;
}

.ui-steps__panel {
	min-width: 0;
}

@media (max-width: 640px) {
	.ui-steps--stack-mobile .ui-steps__navigation,
	.ui-steps--stack-mobile .ui-steps__progress {
		width: 100%;
	}

	.ui-steps--stack-mobile .ui-steps__list--steps {
		width: 100%;
		flex-direction: column;
		padding: 0.3rem;
		overflow: visible;
	}

	.ui-steps--stack-mobile .ui-steps__list--steps .ui-steps__list-item {
		width: 100%;
		max-width: none;
	}

	.ui-steps--stack-mobile .ui-steps__list--steps .ui-steps__step {
		width: 100%;
		flex-direction: row;
		align-items: center;
		text-align: left;
	}

	.ui-steps--stack-mobile .ui-steps__list--steps .ui-steps__connector {
		width: 2px;
		height: 1.25rem;
		margin: 0.25rem 0 0.25rem 1.12rem;
	}

	.ui-steps--stack-mobile .ui-steps__list--cards,
	.ui-steps--stack-mobile .ui-steps__list--cards .ui-steps__list-item {
		width: 100%;
	}

	.ui-steps--stack-mobile .ui-steps__list--cards .ui-steps__list-item {
		flex-basis: auto;
	}
}

@media (prefers-reduced-motion: reduce) {
	.ui-steps__progress-fill,
	.ui-steps__marker,
	.ui-steps__connector,
	.ui-steps__step {
		transition: none;
	}
}

@media (forced-colors: active) {
	.ui-steps__list-item--active .ui-steps__marker,
	.ui-steps__list--cards .ui-steps__list-item--active .ui-steps__step {
		border-color: Highlight;
	}
}
</style>
