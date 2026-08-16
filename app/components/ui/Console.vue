<script setup lang="ts">
import type { CSSProperties } from "vue";

type ConsoleTone =
	"default" | "muted" | "primary" | "info" | "success" | "warning" | "error";
type ConsoleId = string | number;

interface ConsoleSegment {
	text: string;
	tone?: ConsoleTone;
	highlight?: boolean;
	class?: string;
}

interface ConsoleLine {
	id?: ConsoleId;
	text?: string;
	prefix?: string;
	segments?: ConsoleSegment[];
	tone?: ConsoleTone;
	highlight?: boolean;
	delay?: number;
	hideAfter?: number;
	class?: string;
	[key: string]: unknown;
}

interface ConsoleClasses {
	root?: string;
	header?: string;
	body?: string;
	line?: string;
	cursor?: string;
}

interface Props {
	lines: Array<ConsoleLine | string>;
	autoplay?: boolean;
	lineDelay?: number;
	startDelay?: number;
	loop?: boolean;
	loopDelay?: number;
	chrome?: boolean;
	title?: string;
	cursor?: boolean;
	autoScroll?: boolean;
	minHeight?: string;
	maxHeight?: string;
	ariaLabel?: string;
	ui?: ConsoleClasses;
}

const props = withDefaults(defineProps<Props>(), {
	autoplay: true,
	lineDelay: 400,
	startDelay: 0,
	loop: false,
	loopDelay: 1200,
	chrome: true,
	title: "",
	cursor: false,
	autoScroll: true,
	minHeight: "12rem",
	maxHeight: "32rem",
	ariaLabel: "Console output",
	ui: () => ({}),
});

const emit = defineEmits<{
	"line-show": [line: ConsoleLine, index: number];
	"line-hide": [line: ConsoleLine, index: number];
	complete: [];
}>();

const normalizedLines = computed<ConsoleLine[]>(() =>
	props.lines.map((line) =>
		typeof line === "string" ? { text: line } : line,
	),
);
const visibleIndices = ref<number[]>(
	normalizedLines.value.map((_, index) => index),
);
const body = useTemplateRef<HTMLElement>("body");
const playing = ref(false);
const pendingClientPlayback = ref(true);
const timers = new Set<ReturnType<typeof setTimeout>>();
let mounted = false;

type ConsoleStyles = CSSProperties & Record<`--ui-console-${string}`, string>;

const rootStyles = computed<ConsoleStyles>(() => ({
	"--ui-console-min-height": props.minHeight,
	"--ui-console-max-height": props.maxHeight,
}));

const visibleLines = computed(() =>
	visibleIndices.value.flatMap((index) => {
		const line = normalizedLines.value[index];
		return line ? [{ line, index }] : [];
	}),
);

const clearTimers = () => {
	for (const timer of timers) clearTimeout(timer);
	timers.clear();
};

const schedule = (callback: () => void, delay: number) => {
	const timer = setTimeout(
		() => {
			timers.delete(timer);
			callback();
		},
		Math.max(0, delay),
	);
	timers.add(timer);
};

const scrollToLatest = () => {
	if (!props.autoScroll) return;
	nextTick(() => {
		const element = body.value;
		if (element) element.scrollTop = element.scrollHeight;
	});
};

const showLine = (index: number) => {
	const line = normalizedLines.value[index];
	if (!line || visibleIndices.value.includes(index)) return;

	visibleIndices.value = [...visibleIndices.value, index].sort(
		(a, b) => a - b,
	);
	emit("line-show", line, index);
	scrollToLatest();
};

const hideLine = (index: number) => {
	const line = normalizedLines.value[index];
	if (!line || !visibleIndices.value.includes(index)) return;

	visibleIndices.value = visibleIndices.value.filter(
		(visibleIndex) => visibleIndex !== index,
	);
	emit("line-hide", line, index);
};

const showAll = () => {
	clearTimers();
	playing.value = false;
	visibleIndices.value = normalizedLines.value.map((_, index) => index);
	scrollToLatest();
};

const reset = () => {
	clearTimers();
	playing.value = false;
	visibleIndices.value = [];
};

const play = (preserveFirstLine = false) => {
	clearTimers();
	visibleIndices.value =
		preserveFirstLine && normalizedLines.value.length ? [0] : [];
	playing.value = true;

	let elapsed = Math.max(0, props.startDelay);
	normalizedLines.value.forEach((line, index) => {
		if (preserveFirstLine && index === 0) return;

		const delay = line.delay ?? (index === 0 ? 0 : props.lineDelay);
		elapsed += Math.max(0, delay);
		const showAt = elapsed;

		schedule(() => showLine(index), showAt);
		if (line.hideAfter !== undefined) {
			schedule(
				() => hideLine(index),
				showAt + Math.max(0, line.hideAfter),
			);
		}
	});

	schedule(() => {
		playing.value = false;
		emit("complete");
	}, elapsed);

	if (props.loop) schedule(play, elapsed + Math.max(0, props.loopDelay));
};

const restart = () => {
	if (!mounted) return;
	if (props.autoplay) play();
	else showAll();
};

watch(
	() => props.lines,
	() => restart(),
	{ deep: true },
);

watch(
	() => [
		props.autoplay,
		props.lineDelay,
		props.startDelay,
		props.loop,
		props.loopDelay,
	],
	() => restart(),
);

onMounted(() => {
	mounted = true;
	if (props.autoplay) play(true);
	else showAll();
	pendingClientPlayback.value = false;
});

onBeforeUnmount(() => {
	mounted = false;
	clearTimers();
});

defineExpose({ play: () => play(), reset, showAll, scrollToLatest });
</script>

<template>
	<div
		:class="['ui-console', ui.root]"
		:style="rootStyles"
		:data-console-pending="pendingClientPlayback || undefined"
	>
		<div
			v-if="chrome || title || $slots.header"
			:class="['ui-console__header', ui.header]"
		>
			<slot name="header">
				<div
					v-if="chrome"
					class="ui-console__traffic"
					aria-hidden="true"
				>
					<span />
					<span />
					<span />
				</div>
				<span v-if="title" class="ui-console__title">{{ title }}</span>
			</slot>
		</div>

		<div
			ref="body"
			:class="['ui-console__body', ui.body]"
			role="log"
			:aria-label="ariaLabel"
			:aria-live="autoplay ? 'polite' : 'off'"
			:aria-busy="playing"
			aria-relevant="additions removals"
		>
			<TransitionGroup
				name="ui-console-line"
				tag="div"
				class="ui-console__lines"
			>
				<div
					v-for="entry in visibleLines"
					:key="entry.line.id ?? entry.index"
					:class="[
						'ui-console__line',
						`ui-console__line--${entry.line.tone ?? 'default'}`,
						{ 'ui-console__line--highlight': entry.line.highlight },
						entry.line.class,
						ui.line,
					]"
				>
					<slot name="line" :line="entry.line" :index="entry.index">
						<slot
							name="prefix"
							:line="entry.line"
							:index="entry.index"
						>
							<span
								v-if="entry.line.prefix"
								class="ui-console__prefix"
								>{{ entry.line.prefix }}</span
							>
						</slot>
						<template v-if="entry.line.segments?.length">
							<span
								v-for="(segment, segmentIndex) in entry.line
									.segments"
								:key="segmentIndex"
								:class="[
									'ui-console__segment',
									`ui-console__segment--${segment.tone ?? 'default'}`,
									{
										'ui-console__segment--highlight':
											segment.highlight,
									},
									segment.class,
								]"
							>
								{{ segment.text }}
							</span>
						</template>
						<template v-else>{{ entry.line.text }}</template>
					</slot>
				</div>
			</TransitionGroup>

			<span
				v-if="cursor && !playing"
				:class="['ui-console__cursor', ui.cursor]"
				aria-hidden="true"
			/>
		</div>
	</div>
</template>

<style scoped>
.ui-console {
	--ui-console-github-bg: #f6f8fa;
	--ui-console-github-header: #f6f8fa;
	--ui-console-github-text: #1f2328;
	--ui-console-github-muted: #656d76;
	--ui-console-github-border: #d0d7de;
	--ui-console-github-primary: #8250df;
	--ui-console-github-info: #0969da;
	--ui-console-github-success: #1a7f37;
	--ui-console-github-warning: #9a6700;
	--ui-console-github-error: #d1242f;

	width: 100%;
	min-width: 0;
	overflow: hidden;
	color: var(--ui-console-text, var(--ui-console-github-text));
	background: var(--ui-console-bg, var(--ui-console-github-bg));
	border: 1px solid var(--ui-console-border, var(--ui-console-github-border));
	border-radius: var(--ui-console-radius, 0.9rem);
	box-shadow: var(--ui-console-shadow, 0 1.25rem 4rem rgb(31 35 40 / 8%));
}

.ui-console__header {
	position: relative;
	display: flex;
	align-items: center;
	min-height: 3.25rem;
	padding: 0 1.25rem;
	background: var(--ui-console-header-bg, var(--ui-console-github-header));
	border-bottom: 1px solid
		var(--ui-console-border, var(--ui-console-github-border));
}

.ui-console__traffic {
	display: flex;
	gap: 0.5rem;
}

.ui-console__traffic span {
	width: 0.75rem;
	height: 0.75rem;
	background: color-mix(
		in srgb,
		var(--ui-console-github-muted) 24%,
		var(--ui-console-github-bg)
	);
	border: 1px solid
		color-mix(in srgb, var(--ui-console-github-muted) 12%, transparent);
	border-radius: 50%;
}

.ui-console__title {
	position: absolute;
	left: 50%;
	max-width: 55%;
	overflow: hidden;
	font-size: 0.75rem;
	font-weight: 600;
	text-overflow: ellipsis;
	white-space: nowrap;
	transform: translateX(-50%);
	opacity: 0.5;
}

.ui-console__body {
	min-height: var(--ui-console-min-height);
	max-height: var(--ui-console-max-height);
	padding: clamp(1.25rem, 4vw, 2rem);
	overflow: auto;
	font-family: var(
		--ui-font-mono,
		ui-monospace,
		SFMono-Regular,
		Menlo,
		Monaco,
		Consolas,
		"Liberation Mono",
		monospace
	);
	font-size: clamp(0.78rem, 1.8vw, 0.95rem);
	line-height: 1.7;
	scrollbar-color: color-mix(
			in srgb,
			var(--ui-console-github-muted) 45%,
			transparent
		)
		transparent;
}

.ui-console__lines {
	display: grid;
	gap: 0.2rem;
}

.ui-console__line {
	min-width: 0;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}

.ui-console__prefix {
	margin-right: 0.65em;
	opacity: 0.55;
}

.ui-console__line--highlight,
.ui-console__segment--highlight {
	padding: 0.08em 0.28em;
	background: color-mix(in srgb, currentColor 14%, transparent);
	border-radius: 0.2em;
}

.ui-console__line--muted,
.ui-console__segment--muted {
	color: var(--ui-console-muted, var(--ui-console-github-muted));
}

.ui-console__segment--default {
	color: var(--ui-console-text, var(--ui-console-github-text));
}

.ui-console__line--primary,
.ui-console__segment--primary {
	color: var(--ui-console-primary, var(--ui-console-github-primary));
}

.ui-console__line--info,
.ui-console__segment--info {
	color: var(--ui-console-info, var(--ui-console-github-info));
}

.ui-console__line--success,
.ui-console__segment--success {
	color: var(--ui-console-success, var(--ui-console-github-success));
}

.ui-console__line--warning,
.ui-console__segment--warning {
	color: var(--ui-console-warning, var(--ui-console-github-warning));
}

.ui-console__line--error,
.ui-console__segment--error {
	color: var(
		--ui-console-error,
		var(--ui-error, var(--ui-console-github-error))
	);
}

.ui-console__cursor {
	display: block;
	width: 0.58em;
	height: 1.05em;
	margin-top: 0.35rem;
	background: currentColor;
	animation: ui-console-cursor 900ms steps(1, end) infinite;
}

.ui-console-line-enter-active {
	transition:
		opacity 180ms ease,
		transform 180ms ease;
}

.ui-console-line-move {
	transition: transform 180ms ease;
}

.ui-console-line-enter-from {
	opacity: 0;
	transform: translateY(0.35rem);
}

.ui-console-line-leave-active {
	display: none;
	transition: none;
}

@keyframes ui-console-cursor {
	50% {
		opacity: 0;
	}
}

@media (max-width: 479px) {
	.ui-console__header {
		min-height: 2.8rem;
		padding-inline: 1rem;
	}

	.ui-console__body {
		padding: 1rem;
		font-size: 0.76rem;
	}
}

@media (prefers-reduced-motion: reduce) {
	.ui-console__cursor {
		animation: none;
	}

	.ui-console-line-enter-active,
	.ui-console-line-move {
		transition: none;
	}

	.ui-console-line-enter-from {
		transform: none;
	}
}

@media (forced-colors: active) {
	.ui-console,
	.ui-console__header {
		border-color: CanvasText;
	}
}
</style>

<style>
html.js .ui-console[data-console-pending] .ui-console__line:not(:first-child) {
	display: none;
}

html.js .ui-console[data-console-pending] .ui-console__cursor {
	display: none;
}

html[data-theme="dark"] .ui-console {
	--ui-console-github-bg: #0d1117;
	--ui-console-github-header: #161b22;
	--ui-console-github-text: #e6edf3;
	--ui-console-github-muted: #8b949e;
	--ui-console-github-border: #30363d;
	--ui-console-github-primary: #d2a8ff;
	--ui-console-github-info: #58a6ff;
	--ui-console-github-success: #3fb950;
	--ui-console-github-warning: #d29922;
	--ui-console-github-error: #f85149;

	box-shadow: var(--ui-console-shadow, 0 1.25rem 4rem rgb(1 4 9 / 38%));
}

@media (prefers-color-scheme: dark) {
	html:not([data-theme="light"]) .ui-console {
		--ui-console-github-bg: #0d1117;
		--ui-console-github-header: #161b22;
		--ui-console-github-text: #e6edf3;
		--ui-console-github-muted: #8b949e;
		--ui-console-github-border: #30363d;
		--ui-console-github-primary: #d2a8ff;
		--ui-console-github-info: #58a6ff;
		--ui-console-github-success: #3fb950;
		--ui-console-github-warning: #d29922;
		--ui-console-github-error: #f85149;

		box-shadow: var(--ui-console-shadow, 0 1.25rem 4rem rgb(1 4 9 / 38%));
	}
}
</style>
