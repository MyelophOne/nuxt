<script setup lang="ts">
type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";
type TooltipPlacement =
	"auto" | TooltipSide | `${TooltipSide}-start` | `${TooltipSide}-end`;

interface Props {
	modelValue?: boolean;
	as?: "span" | "div";
	trigger?: "hover" | "click";
	triggerTabindex?: number;
	placement?: TooltipPlacement;
	offset?: number;
	viewportPadding?: number;
	openDelay?: number;
	closeDelay?: number;
	disabled?: boolean;
	interactive?: boolean;
	maxWidth?: string;
	role?: "tooltip" | "dialog";
	triggerClass?: string;
	contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: undefined,
	as: "span",
	trigger: "hover",
	triggerTabindex: 0,
	placement: "auto",
	offset: 10,
	viewportPadding: 8,
	openDelay: 100,
	closeDelay: 120,
	disabled: false,
	interactive: true,
	maxWidth: "24rem",
	role: "tooltip",
});

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	open: [];
	close: [];
}>();

const uid = useId();
const tooltipId = `tooltip-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;
const triggerElement = ref<HTMLElement>();
const tooltipElement = ref<HTMLElement>();
const internalOpen = ref(false);
const isMounted = ref(false);
const isPositioned = ref(false);
const side = ref<TooltipSide>("top");
const coordinates = reactive({ x: 0, y: 0 });
const arrowCoordinates = reactive({ x: 0, y: 0 });
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let animationFrame: number | undefined;
let resizeObserver: ResizeObserver | undefined;

const isControlled = computed(() => props.modelValue !== undefined);
const isOpen = computed(() =>
	isControlled.value ? Boolean(props.modelValue) : internalOpen.value,
);
const resolvedTriggerTabindex = computed(() =>
	props.disabled ? -1 : props.triggerTabindex,
);

const tooltipStyle = computed(() => ({
	left: `${coordinates.x}px`,
	top: `${coordinates.y}px`,
	maxWidth: `min(${props.maxWidth}, calc(100vw - ${props.viewportPadding * 2}px))`,
	maxHeight: `calc(100dvh - ${props.viewportPadding * 2}px)`,
	visibility: isPositioned.value ? ("visible" as const) : ("hidden" as const),
}));

const arrowStyle = computed(() => {
	if (side.value === "top" || side.value === "bottom") {
		return { left: `${arrowCoordinates.x}px` };
	}

	return { top: `${arrowCoordinates.y}px` };
});

const clearTimers = () => {
	if (openTimer) clearTimeout(openTimer);
	if (closeTimer) clearTimeout(closeTimer);
	openTimer = undefined;
	closeTimer = undefined;
};

const setOpen = (value: boolean) => {
	if (value && props.disabled) return;
	if (isOpen.value === value) return;

	if (!isControlled.value) internalOpen.value = value;
	emit("update:modelValue", value);
	if (value) emit("open");
	else emit("close");
};

const open = (delay = props.openDelay) => {
	if (props.disabled) return;
	if (closeTimer) clearTimeout(closeTimer);
	if (isOpen.value || openTimer) return;

	openTimer = setTimeout(() => {
		openTimer = undefined;
		setOpen(true);
	}, delay);
};

const close = (delay = props.closeDelay) => {
	if (openTimer) clearTimeout(openTimer);
	openTimer = undefined;
	if (!isOpen.value || closeTimer) return;

	closeTimer = setTimeout(() => {
		closeTimer = undefined;
		setOpen(false);
	}, delay);
};

const toggle = () => {
	clearTimers();
	setOpen(!isOpen.value);
};

const parsePlacement = (): { preferred?: TooltipSide; align: TooltipAlign } => {
	if (props.placement === "auto") return { align: "center" };

	const [preferred, requestedAlign] = props.placement.split("-") as [
		TooltipSide,
		TooltipAlign | undefined,
	];
	return { preferred, align: requestedAlign ?? "center" };
};

const oppositeSides: Record<TooltipSide, TooltipSide> = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right",
};

const updatePosition = () => {
	if (!isOpen.value || !triggerElement.value || !tooltipElement.value) return;

	const triggerRect = triggerElement.value.getBoundingClientRect();
	const tooltipRect = tooltipElement.value.getBoundingClientRect();
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const padding = props.viewportPadding;
	const gap = props.offset;
	const available: Record<TooltipSide, number> = {
		top: triggerRect.top - padding - gap,
		right: viewportWidth - triggerRect.right - padding - gap,
		bottom: viewportHeight - triggerRect.bottom - padding - gap,
		left: triggerRect.left - padding - gap,
	};
	const required: Record<TooltipSide, number> = {
		top: tooltipRect.height,
		right: tooltipRect.width,
		bottom: tooltipRect.height,
		left: tooltipRect.width,
	};
	const { preferred, align } = parsePlacement();
	const allSides: TooltipSide[] = ["top", "bottom", "right", "left"];
	const candidates = preferred
		? [
				preferred,
				oppositeSides[preferred],
				...allSides.filter(
					(candidate) =>
						candidate !== preferred &&
						candidate !== oppositeSides[preferred],
				),
			]
		: allSides;
	const fittingSide = candidates.find(
		(candidate) => available[candidate] >= required[candidate],
	);
	const resolvedSide =
		fittingSide ??
		candidates.reduce((best, candidate) =>
			available[candidate] > available[best] ? candidate : best,
		);

	let x = 0;
	let y = 0;
	if (resolvedSide === "top" || resolvedSide === "bottom") {
		x =
			align === "start"
				? triggerRect.left
				: align === "end"
					? triggerRect.right - tooltipRect.width
					: triggerRect.left +
						(triggerRect.width - tooltipRect.width) / 2;
		y =
			resolvedSide === "top"
				? triggerRect.top - tooltipRect.height - gap
				: triggerRect.bottom + gap;
	} else {
		x =
			resolvedSide === "left"
				? triggerRect.left - tooltipRect.width - gap
				: triggerRect.right + gap;
		y =
			align === "start"
				? triggerRect.top
				: align === "end"
					? triggerRect.bottom - tooltipRect.height
					: triggerRect.top +
						(triggerRect.height - tooltipRect.height) / 2;
	}

	const maxX = Math.max(padding, viewportWidth - tooltipRect.width - padding);
	const maxY = Math.max(
		padding,
		viewportHeight - tooltipRect.height - padding,
	);
	coordinates.x = Math.round(Math.min(Math.max(x, padding), maxX));
	coordinates.y = Math.round(Math.min(Math.max(y, padding), maxY));
	side.value = resolvedSide;

	const arrowPadding = 10;
	arrowCoordinates.x = Math.round(
		Math.min(
			Math.max(
				triggerRect.left + triggerRect.width / 2 - coordinates.x,
				arrowPadding,
			),
			Math.max(arrowPadding, tooltipRect.width - arrowPadding),
		),
	);
	arrowCoordinates.y = Math.round(
		Math.min(
			Math.max(
				triggerRect.top + triggerRect.height / 2 - coordinates.y,
				arrowPadding,
			),
			Math.max(arrowPadding, tooltipRect.height - arrowPadding),
		),
	);
	isPositioned.value = true;
};

const schedulePositionUpdate = () => {
	if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
	animationFrame = requestAnimationFrame(() => {
		animationFrame = undefined;
		updatePosition();
	});
};

const handleTriggerPointerEnter = (event: PointerEvent) => {
	if (props.trigger === "hover" && event.pointerType === "mouse") open();
};

const handleTriggerPointerLeave = (event: PointerEvent) => {
	if (props.trigger === "hover" && event.pointerType === "mouse") close();
};

const handleTriggerPointerUp = (event: PointerEvent) => {
	if (props.trigger === "hover" && event.pointerType !== "mouse") toggle();
};

const handleTriggerClick = () => {
	if (props.trigger === "click") toggle();
};

const handleFocusIn = () => {
	if (closeTimer) clearTimeout(closeTimer);
	closeTimer = undefined;
	if (props.trigger === "hover") open(0);
};

const handleTooltipFocusIn = () => {
	if (closeTimer) clearTimeout(closeTimer);
	closeTimer = undefined;
};

const handleFocusOut = (event: FocusEvent) => {
	const nextTarget = event.relatedTarget;
	if (
		nextTarget instanceof Node &&
		(triggerElement.value?.contains(nextTarget) ||
			tooltipElement.value?.contains(nextTarget))
	) {
		return;
	}
	close();
};

const handleDocumentPointerDown = (event: PointerEvent) => {
	const target = event.target;
	if (!(target instanceof Node)) return;
	if (
		triggerElement.value?.contains(target) ||
		tooltipElement.value?.contains(target)
	) {
		return;
	}
	close(0);
};

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === "Escape" && isOpen.value) {
		clearTimers();
		setOpen(false);
		triggerElement.value?.focus();
	}

	if (
		props.trigger === "click" &&
		event.target === triggerElement.value &&
		(event.key === "Enter" || event.key === " ")
	) {
		event.preventDefault();
		toggle();
	}
};

watch(isOpen, async (value) => {
	if (!value) {
		isPositioned.value = false;
		return;
	}

	await nextTick();
	updatePosition();
});

watch(
	() => props.disabled,
	(value) => {
		if (value) {
			clearTimers();
			setOpen(false);
		}
	},
);

onMounted(() => {
	isMounted.value = true;
	window.addEventListener("resize", schedulePositionUpdate, {
		passive: true,
	});
	window.addEventListener("scroll", schedulePositionUpdate, {
		passive: true,
		capture: true,
	});
	document.addEventListener("pointerdown", handleDocumentPointerDown);
	document.addEventListener("keydown", handleKeydown);
	resizeObserver = new ResizeObserver(schedulePositionUpdate);
	if (triggerElement.value) resizeObserver.observe(triggerElement.value);
});

onBeforeUnmount(() => {
	clearTimers();
	if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
	window.removeEventListener("resize", schedulePositionUpdate);
	window.removeEventListener("scroll", schedulePositionUpdate, true);
	document.removeEventListener("pointerdown", handleDocumentPointerDown);
	document.removeEventListener("keydown", handleKeydown);
	resizeObserver?.disconnect();
});

watch(tooltipElement, (element) => {
	if (element) resizeObserver?.observe(element);
});

defineExpose({
	open: () => open(0),
	close: () => close(0),
	toggle,
	updatePosition,
});
</script>

<template>
	<component
		:is="as"
		ref="triggerElement"
		class="ui-tooltip-trigger"
		:class="triggerClass"
		:tabindex="resolvedTriggerTabindex"
		:aria-disabled="disabled || undefined"
		:aria-describedby="isOpen && role === 'tooltip' ? tooltipId : undefined"
		:aria-expanded="role === 'dialog' ? isOpen : undefined"
		:aria-controls="role === 'dialog' ? tooltipId : undefined"
		:aria-haspopup="role === 'dialog' ? 'dialog' : undefined"
		@pointerenter="handleTriggerPointerEnter"
		@pointerleave="handleTriggerPointerLeave"
		@pointerup="handleTriggerPointerUp"
		@click="handleTriggerClick"
		@focusin="handleFocusIn"
		@focusout="handleFocusOut"
	>
		<slot :open="isOpen" />
	</component>

	<Teleport v-if="isMounted" to="body">
		<Transition name="ui-tooltip">
			<div
				v-if="isOpen"
				:id="tooltipId"
				ref="tooltipElement"
				data-nosnippet
				:role="role"
				:data-side="side"
				class="ui-tooltip-content"
				:class="contentClass"
				:style="tooltipStyle"
				@pointerenter="interactive && clearTimers()"
				@pointerleave="interactive && close()"
				@focusin="interactive && handleTooltipFocusIn()"
				@focusout="interactive && handleFocusOut($event)"
			>
				<div class="ui-tooltip-body">
					<slot name="content" :close="() => close(0)" />
				</div>
				<span
					class="ui-tooltip-arrow"
					:style="arrowStyle"
					aria-hidden="true"
				></span>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.ui-tooltip-trigger {
	display: inline-flex;
	max-width: 100%;
}

.ui-tooltip-content {
	position: fixed;
	z-index: 100;
	box-sizing: border-box;
	overflow: visible;
	color: var(--tooltip-color, white);
	font-size: 0.875rem;
	line-height: 1.35;
	text-align: left;
	overflow-wrap: anywhere;
	background: var(--tooltip-background, rgb(23 23 23));
	border: 1px solid var(--tooltip-border, rgb(255 255 255 / 0.12));
	border-radius: var(--tooltip-radius, 0.5rem);
	box-shadow: var(--tooltip-shadow, 0 10px 30px rgb(0 0 0 / 0.22));
}

.ui-tooltip-body {
	position: relative;
	z-index: 1;
	box-sizing: border-box;
	max-height: inherit;
	padding: 0.5rem 0.75rem;
	overflow: auto;
	background: inherit;
	border-radius: inherit;
	overscroll-behavior: contain;
}

.ui-tooltip-content:not([role="dialog"]) {
	pointer-events: v-bind("interactive ? 'auto' : 'none'");
}

.ui-tooltip-arrow {
	position: absolute;
	width: 0.625rem;
	height: 0.625rem;
	background: inherit;
	border: inherit;
	transform: translate(-50%, -50%) rotate(45deg);
}

.ui-tooltip-content[data-side="top"] .ui-tooltip-arrow {
	top: 100%;
	border-top: 0;
	border-left: 0;
}

.ui-tooltip-content[data-side="bottom"] .ui-tooltip-arrow {
	top: 0;
	border-right: 0;
	border-bottom: 0;
}

.ui-tooltip-content[data-side="left"] .ui-tooltip-arrow {
	left: 100%;
	border-bottom: 0;
	border-left: 0;
}

.ui-tooltip-content[data-side="right"] .ui-tooltip-arrow {
	left: 0;
	border-top: 0;
	border-right: 0;
}

.ui-tooltip-enter-active,
.ui-tooltip-leave-active {
	transition:
		opacity 120ms ease,
		transform 120ms ease;
}

.ui-tooltip-enter-from,
.ui-tooltip-leave-to {
	opacity: 0;
	transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
	.ui-tooltip-enter-active,
	.ui-tooltip-leave-active {
		transition: none;
	}
}
</style>
