<template>
	<div v-if="$slots.trigger" class="contents">
		<slot name="trigger" :open="open" :close="close" :is-open="isOpen" />
	</div>

	<Teleport v-if="mounted" to="body">
		<Transition
			enter-active-class="transition duration-150 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition duration-100 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="isOpen"
				class="fixed inset-0 z-99999 flex items-start justify-center px-3 pt-[max(1rem,8dvh)] sm:px-4"
				role="dialog"
				aria-modal="true"
				:aria-label="ariaLabel || t('interface.siteSearch.ariaLabel')"
				@keydown.esc="close"
			>
				<div
					class="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
					@click="close"
				/>

				<div
					class="relative flex max-h-[min(42rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-(--ui-bg) text-(--ui-text) shadow-2xl ring-1 ring-(--ui-text)/20"
					:class="contentClass"
					@click.stop
				>
					<div
						class="flex min-h-14 items-center gap-3 border-b border-(--ui-text)/10 px-4"
					>
						<svg
							class="size-5 shrink-0 opacity-45"
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
							/>
						</svg>
						<input
							ref="searchInput"
							v-model="query"
							type="search"
							class="h-14 min-w-0 flex-1 border-0 bg-transparent text-base text-(--ui-text) outline-none placeholder:text-(--ui-text)/35"
							:placeholder="
								placeholder ||
								t('interface.siteSearch.placeholder')
							"
							:aria-label="
								ariaLabel || t('interface.siteSearch.ariaLabel')
							"
							autocomplete="off"
							spellcheck="false"
							@input="activateSearch"
							@keydown.down.prevent="moveSelection(1)"
							@keydown.up.prevent="moveSelection(-1)"
							@keydown.enter.prevent="onEnter"
						/>
						<button
							v-if="query"
							type="button"
							class="grid size-8 shrink-0 place-items-center rounded-md text-(--ui-text)/45 transition-colors hover:bg-(--ui-text)/8 hover:text-(--ui-text) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--ui-text)/50"
							:aria-label="t('interface.siteSearch.clear')"
							:title="t('interface.siteSearch.clear')"
							@click="clearQuery"
						>
							<svg
								class="size-4"
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-width="2"
									d="m6 6 12 12M18 6 6 18"
								/>
							</svg>
						</button>
						<select
							v-model="activeOperator"
							class="h-8 shrink-0 rounded-md border border-(--ui-text)/15 bg-(--ui-bg) px-1.5 font-mono text-[11px] font-semibold text-(--ui-text) outline-none"
							:aria-label="
								t('interface.siteSearch.operatorLabel')
							"
							@change="changeOperator"
						>
							<option value="and">AND</option>
							<option value="or">OR</option>
						</select>
						<span
							class="hidden rounded border border-(--ui-text)/15 px-1.5 py-0.5 font-mono text-[10px] opacity-45 sm:block"
							>ESC</span
						>
					</div>

					<div
						class="min-h-24 flex-1 overflow-y-auto overscroll-contain p-2"
					>
						<div
							v-if="status === 'indexing'"
							class="flex min-h-28 flex-col items-center justify-center gap-3 px-5 text-center"
						>
							<div
								class="size-5 animate-spin rounded-full border-2 border-(--ui-text)/15 border-t-(--ui-text)/70"
							/>
							<p class="text-sm opacity-60">
								{{ indexingLabel }}
							</p>
							<div
								v-if="totalPages"
								class="h-1 w-full max-w-52 overflow-hidden rounded-full bg-(--ui-text)/10"
							>
								<div
									class="h-full bg-(--ui-text)/55 transition-[width]"
									:style="{ width: `${indexProgress}%` }"
								/>
							</div>
						</div>

						<div
							v-else-if="status === 'error'"
							class="flex min-h-28 items-center justify-center px-5 text-center text-sm text-red-500"
						>
							<slot name="error" :message="errorMessage">{{
								t("interface.siteSearch.error")
							}}</slot>
						</div>

						<div
							v-else-if="query.trim().length < minQueryLength"
							class="flex min-h-28 items-center justify-center px-5 text-center text-sm opacity-45"
						>
							{{
								t("interface.siteSearch.typeMore", {
									count: minQueryLength,
								})
							}}
						</div>

						<div
							v-else-if="!searchArmed"
							class="flex min-h-28 items-center justify-center px-5 text-center text-sm opacity-45"
						>
							{{ t("interface.siteSearch.prefilled") }}
						</div>

						<div
							v-else-if="searching"
							class="flex min-h-28 items-center justify-center px-5 text-center text-sm opacity-50"
						>
							{{ t("interface.siteSearch.searching") }}
						</div>

						<ul
							v-else-if="results.length"
							role="listbox"
							:aria-label="t('interface.siteSearch.results')"
						>
							<li
								v-for="(result, index) in results"
								:key="result.id"
								role="option"
								:aria-selected="selectedIndex === index"
							>
								<NuxtLink
									:to="resultTarget(result)"
									class="group block w-full rounded-lg px-3 py-3 text-left transition-colors"
									:class="
										selectedIndex === index
											? 'bg-(--ui-text)/10'
											: 'hover:bg-(--ui-text)/5'
									"
									:data-site-search-index="index"
									@click="selectResult(result)"
									@mouseenter="selectedIndex = index"
								>
									<slot
										name="result"
										:result="result"
										:selected="selectedIndex === index"
									>
										<div
											class="flex items-start justify-between gap-3"
										>
											<span class="min-w-0 font-medium">
												<template
													v-for="(
														segment, segmentIndex
													) in highlightedSegments(
														result.title,
														result.titleMatches,
													)"
													:key="segmentIndex"
												>
													<mark
														v-if="
															segment.highlighted
														"
														class="site-search-mark"
														>{{
															segment.text
														}}</mark
													>
													<template v-else>{{
														segment.text
													}}</template>
												</template>
											</span>
											<span
												v-if="showLocaleBadge"
												class="shrink-0 rounded bg-(--ui-text)/7 px-1.5 py-0.5 font-mono text-[10px] uppercase opacity-55"
												>{{ result.locale }}</span
											>
										</div>
										<p
											v-if="
												result.snippet ||
												result.description
											"
											class="mt-1 line-clamp-2 text-sm leading-5 opacity-55"
										>
											<template
												v-for="(
													segment, segmentIndex
												) in highlightedSegments(
													result.snippet ||
														result.description,
													result.snippetMatches,
												)"
												:key="segmentIndex"
											>
												<mark
													v-if="segment.highlighted"
													class="site-search-mark"
													>{{ segment.text }}</mark
												>
												<template v-else>{{
													segment.text
												}}</template>
											</template>
										</p>
										<p
											class="mt-1.5 truncate font-mono text-[11px] opacity-35"
										>
											<template
												v-for="(
													segment, segmentIndex
												) in highlightedSegments(
													result.path,
													result.pathMatches,
												)"
												:key="segmentIndex"
											>
												<mark
													v-if="segment.highlighted"
													class="site-search-mark"
													>{{ segment.text }}</mark
												>
												<template v-else>{{
													segment.text
												}}</template>
											</template>
										</p>
									</slot>
								</NuxtLink>
							</li>
						</ul>

						<div
							v-else
							class="flex min-h-28 items-center justify-center px-5 text-center text-sm opacity-45"
						>
							<slot name="empty" :query="query">{{
								t("interface.siteSearch.noResults")
							}}</slot>
						</div>
					</div>

					<div
						v-if="status === 'ready'"
						class="flex items-center justify-between gap-3 border-t border-(--ui-text)/10 px-4 py-2 text-[11px] opacity-40"
					>
						<span v-if="resolvedStrategy === 'client'">{{
							t("interface.siteSearch.indexed", {
								count: indexedCount,
							})
						}}</span>
						<span v-else>{{
							t("interface.siteSearch.remote")
						}}</span>
						<span class="hidden sm:inline">↑↓ · Enter</span>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { UI_SITE_SEARCH_OPEN_EVENT } from "~/constants/ui-events";
import type {
	SiteSearchOperator,
	SiteSearchRange,
	SiteSearchRemoteResponse,
	SiteSearchResult,
	SiteSearchStrategy,
	SiteSearchWorkerRequest,
	SiteSearchWorkerResponse,
} from "~/types/site-search";

type UrlMode = "search" | "prefill";
type SearchStatus = "idle" | "indexing" | "ready" | "error";

interface Props {
	modelValue?: boolean;
	minQueryLength?: number;
	debounce?: number;
	limit?: number;
	maxPages?: number;
	maxContentLength?: number;
	concurrency?: number;
	cacheTtl?: number;
	respectNoIndex?: boolean;
	discoverSitemaps?: boolean;
	strategy?: SiteSearchStrategy;
	endpoint?: string;
	searchAllLocales?: boolean;
	locale?: string;
	shortcut?: boolean;
	shortcutKey?: string;
	shortcutShift?: boolean;
	queryParam?: string;
	modeParam?: string;
	operatorParam?: string;
	operator?: SiteSearchOperator;
	urlMode?: UrlMode;
	consumeUrl?: boolean;
	placeholder?: string;
	ariaLabel?: string;
	contentClass?: string;
	disableUrlHandling?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: undefined,
	minQueryLength: 2,
	debounce: 100,
	limit: 10,
	maxPages: 500,
	maxContentLength: 30_000,
	concurrency: 4,
	cacheTtl: 30 * 60 * 1000,
	respectNoIndex: true,
	discoverSitemaps: true,
	strategy: "client",
	endpoint: "",
	searchAllLocales: false,
	locale: "",
	shortcut: true,
	shortcutKey: "k",
	shortcutShift: true,
	queryParam: "search",
	modeParam: "searchMode",
	operatorParam: "searchOperator",
	operator: "and",
	urlMode: "search",
	consumeUrl: false,
	placeholder: "",
	ariaLabel: "",
	contentClass: "",
	disableUrlHandling: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	"update:operator": [value: SiteSearchOperator];
	open: [];
	close: [];
	select: [result: SiteSearchResult];
	ready: [count: number];
	error: [message: string];
}>();

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const settings = useSettingsStore(useNuxtApp().$pinia);
const { t } = useMultiLang("interface");

const mounted = ref(false);
const internalOpen = ref(false);
const query = ref("");
const activeOperator = ref<SiteSearchOperator>(props.operator);
const results = ref<SiteSearchResult[]>([]);
const selectedIndex = ref(0);
const searchInput = ref<HTMLInputElement | null>(null);
const status = ref<SearchStatus>("idle");
const searching = ref(false);
const searchArmed = ref(true);
const indexedPages = ref(0);
const totalPages = ref(0);
const indexedCount = ref(0);
const errorMessage = ref("");

let worker: Worker | undefined;
let remoteController: AbortController | undefined;
let requestId = 0;
let initRequestId = 0;
let latestSearchRequestId = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;
let lastUrlSignature = "";
let internalCloseHandled = false;

const isControlled = computed(() => props.modelValue !== undefined);
const isOpen = computed(() =>
	isControlled.value ? Boolean(props.modelValue) : internalOpen.value,
);
const resolvedStrategy = computed<SiteSearchStrategy>(() =>
	props.strategy === "remote" && props.endpoint.trim() ? "remote" : "client",
);
const activeLocale = computed(
	() =>
		props.locale ||
		settings.currentLocale ||
		settings.defaultLocale ||
		documentLocale() ||
		"en",
);
const showLocaleBadge = computed(
	() => props.searchAllLocales || settings.locales.length > 1,
);
const indexProgress = computed(() =>
	totalPages.value
		? Math.min(
				100,
				Math.round((indexedPages.value / totalPages.value) * 100),
			)
		: 0,
);
const indexingLabel = computed(() =>
	totalPages.value
		? t("interface.siteSearch.indexingProgress", {
				indexed: indexedPages.value,
				total: totalPages.value,
			})
		: t("interface.siteSearch.indexing"),
);

function documentLocale() {
	return import.meta.client
		? document.documentElement.lang.split("-")[0]
		: "";
}

function setOpen(value: boolean) {
	if (!isControlled.value) internalOpen.value = value;
	emit("update:modelValue", value);
	if (value) emit("open");
	else emit("close");
}

function getSeedUrls() {
	const paths = router
		.getRoutes()
		.map((record) => record.path)
		.filter((path) => path && !/[:*]/.test(path));
	paths.push(route.path || "/");
	return [...new Set(paths)];
}

function post(message: SiteSearchWorkerRequest) {
	try {
		worker?.postMessage(message);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}

function createSearchWorker() {
	if (worker) return;

	status.value = "indexing";
	try {
		worker = new Worker(
			new URL("../../workers/site-search.worker.ts", import.meta.url),
			{ type: "module" },
		);
		worker.addEventListener("message", onWorkerMessage);
		worker.addEventListener("error", (event) =>
			fail(event.message || "Site search worker failed"),
		);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
		return;
	}

	initRequestId = ++requestId;
	post({
		type: "init",
		requestId: initRequestId,
		options: {
			origin: window.location.origin,
			basePath: runtimeConfig.app.baseURL || "/",
			seedUrls: getSeedUrls(),
			locales: settings.locales.length
				? [...settings.locales]
				: [activeLocale.value],
			defaultLocale: settings.defaultLocale || activeLocale.value,
			maxPages: props.maxPages,
			maxContentLength: props.maxContentLength,
			concurrency: Math.max(1, props.concurrency),
			cacheTtl: import.meta.dev ? 0 : props.cacheTtl,
			respectNoIndex: import.meta.dev ? false : props.respectNoIndex,
			discoverSitemaps: import.meta.dev ? false : props.discoverSitemaps,
		},
	});
}

function initializeSearch() {
	if (resolvedStrategy.value === "remote") {
		if (!props.endpoint.trim()) {
			fail("Remote search endpoint is not configured");
			return;
		}

		const testUrl = new URL(props.endpoint, window.location.origin);
		testUrl.searchParams.set("q", "test");
		testUrl.searchParams.set("locale", activeLocale.value);
		testUrl.searchParams.set("operator", "and");
		testUrl.searchParams.set("limit", "1");
		testUrl.searchParams.set("allLocales", "false");

		status.value = "indexing";
		errorMessage.value = "";

		const timeoutController = new AbortController();
		const timeoutId = setTimeout(() => timeoutController.abort(), 5000);

		fetch(testUrl, {
			headers: { Accept: "application/json" },
			credentials: "same-origin",
			signal: timeoutController.signal,
		})
			.then((response) => {
				clearTimeout(timeoutId);
				if (!response.ok) {
					throw new Error(
						`Search endpoint returned ${response.status}`,
					);
				}
				return response.json();
			})
			.then((data) => {
				if (!data || typeof data !== "object") {
					throw new Error("Invalid search endpoint response");
				}
				status.value = "ready";
				emit("ready", 0);
			})
			.catch((error) => {
				clearTimeout(timeoutId);
				if (error.name === "AbortError") {
					fail(
						"Search endpoint timeout. Please check the endpoint URL and try again.",
					);
				} else {
					fail(
						error instanceof Error ? error.message : String(error),
					);
				}
			});
		return;
	}
	createSearchWorker();
}

function onWorkerMessage(event: MessageEvent<SiteSearchWorkerResponse>) {
	const message = event.data;
	if (message.type === "progress") {
		indexedPages.value = message.indexed;
		totalPages.value = message.total;
		return;
	}
	if (message.type === "ready" && message.requestId === initRequestId) {
		status.value = "ready";
		indexedCount.value = message.count;
		emit("ready", message.count);
		queueSearch(0);
		return;
	}
	if (
		message.type === "results" &&
		message.requestId === latestSearchRequestId
	) {
		results.value = message.results;
		selectedIndex.value = 0;
		searching.value = false;
		return;
	}
	if (message.type === "error") fail(message.message);
}

function fail(message: string) {
	status.value = "error";
	searching.value = false;
	errorMessage.value = message;
	emit("error", message);
}

function runSearch() {
	const normalized = query.value.trim();
	if (
		!searchArmed.value ||
		status.value !== "ready" ||
		normalized.length < props.minQueryLength
	)
		return;
	searching.value = true;
	latestSearchRequestId = ++requestId;
	if (resolvedStrategy.value === "remote") {
		void runRemoteSearch(latestSearchRequestId, normalized);
		return;
	}
	post({
		type: "search",
		requestId: latestSearchRequestId,
		query: normalized,
		locale: activeLocale.value,
		allLocales: props.searchAllLocales,
		operator: activeOperator.value,
		limit: props.limit,
	});
}

function normalizedLocale(value: string) {
	return value.trim().toLowerCase().replace("_", "-").split("-")[0] || "en";
}

function localeFromPath(path: string) {
	const pathname = new URL(path, window.location.origin).pathname;
	const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
	const matched = settings.locales.find(
		(locale) => normalizedLocale(locale) === normalizedLocale(firstSegment),
	);
	return normalizedLocale(
		matched || settings.defaultLocale || activeLocale.value,
	);
}

function translationKey(path: string) {
	const pathname = new URL(path, window.location.origin).pathname;
	const segments = pathname.split("/").filter(Boolean);
	const knownLocales = new Set(settings.locales.map(normalizedLocale));
	if (segments[0] && knownLocales.has(normalizedLocale(segments[0])))
		segments.shift();
	return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

function safeRanges(value: string, ranges: SiteSearchRange[] | undefined) {
	return (ranges ?? [])
		.map(
			([start, end]) =>
				[
					Math.max(0, start),
					Math.min(value.length - 1, end),
				] as SiteSearchRange,
		)
		.filter(([start, end]) => start <= end)
		.sort(([left], [right]) => left - right);
}

function directMatches(value: string, searchQuery: string) {
	const source = value.toLocaleLowerCase();
	const words = [
		...new Set(
			searchQuery.toLocaleLowerCase().split(/\s+/).filter(Boolean),
		),
	];
	const ranges: SiteSearchRange[] = [];
	for (const word of words) {
		let offset = 0;
		while (offset < source.length) {
			const start = source.indexOf(word, offset);
			if (start < 0) break;
			ranges.push([start, start + word.length - 1]);
			offset = start + word.length;
		}
	}
	return safeRanges(value, ranges);
}

async function runRemoteSearch(searchRequestId: number, searchQuery: string) {
	remoteController?.abort();
	remoteController = new AbortController();

	try {
		const requestUrl = new URL(props.endpoint, window.location.origin);
		requestUrl.searchParams.set("q", searchQuery);
		requestUrl.searchParams.set("locale", activeLocale.value);
		requestUrl.searchParams.set("operator", activeOperator.value);
		requestUrl.searchParams.set("limit", String(props.limit));
		requestUrl.searchParams.set(
			"allLocales",
			String(props.searchAllLocales),
		);

		const response = await fetch(requestUrl, {
			headers: { Accept: "application/json" },
			credentials: "same-origin",
			signal: remoteController.signal,
		});
		if (!response.ok) {
			if (response.status === 404) {
				throw new Error(
					"Search endpoint not found (404). Please check the endpoint URL.",
				);
			} else if (response.status === 500) {
				throw new Error(
					"Search endpoint server error (500). Please try again later.",
				);
			} else {
				throw new Error(`Search endpoint returned ${response.status}`);
			}
		}
		const payload = (await response.json()) as SiteSearchRemoteResponse;
		if (!payload || !Array.isArray(payload.results))
			throw new Error("Invalid search endpoint response");
		if (searchRequestId !== latestSearchRequestId) return;

		const currentLocale = normalizedLocale(activeLocale.value);
		const normalizedResults = payload.results.map(
			(item, index): SiteSearchResult => {
				const locale = normalizedLocale(
					item.locale || localeFromPath(item.path),
				);
				const description = item.description ?? "";
				const snippet = item.snippet ?? description;
				return {
					id: item.id || item.url || item.path || String(index),
					url:
						item.url ||
						new URL(item.path, window.location.origin).href,
					path: item.path,
					title: item.title,
					description,
					snippet,
					titleMatches: safeRanges(item.title, item.highlights?.title)
						.length
						? safeRanges(item.title, item.highlights?.title)
						: directMatches(item.title, searchQuery),
					snippetMatches: safeRanges(
						snippet,
						item.highlights?.snippet,
					).length
						? safeRanges(snippet, item.highlights?.snippet)
						: directMatches(snippet, searchQuery),
					pathMatches: safeRanges(item.path, item.highlights?.path)
						.length
						? safeRanges(item.path, item.highlights?.path)
						: directMatches(item.path, searchQuery),
					locale,
					score: item.score ?? 1,
				};
			},
		);

		normalizedResults.sort((left, right) => {
			const localeDifference =
				Number(normalizedLocale(right.locale) === currentLocale) -
				Number(normalizedLocale(left.locale) === currentLocale);
			return localeDifference || left.score - right.score;
		});
		const seenPages = new Set<string>();
		results.value = normalizedResults
			.filter((result) => {
				const key = translationKey(result.path);
				if (seenPages.has(key)) return false;
				seenPages.add(key);
				return true;
			})
			.slice(0, props.limit);
		selectedIndex.value = 0;
		searching.value = false;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError")
			return;
		if (searchRequestId !== latestSearchRequestId) return;

		let errorMessage = "Search could not be prepared. Please try again.";
		if (error instanceof Error) {
			if (error.message.includes("404")) {
				errorMessage =
					"Search endpoint not found. Please check the endpoint URL.";
			} else if (error.message.includes("Failed to fetch")) {
				errorMessage =
					"Network error. Please check your connection and try again.";
			} else {
				errorMessage = error.message;
			}
		}
		fail(errorMessage);
	}
}

function queueSearch(delay = props.debounce) {
	if (searchTimer) clearTimeout(searchTimer);
	if (
		!searchArmed.value ||
		query.value.trim().length < props.minQueryLength
	) {
		results.value = [];
		searching.value = false;
		return;
	}

	if (status.value !== "ready") return;
	searchTimer = setTimeout(runSearch, Math.max(0, delay));
}

function activateSearch() {
	searchArmed.value = true;
}

function changeOperator() {
	emit("update:operator", activeOperator.value);
	searchArmed.value = true;
	queueSearch(0);
}

function highlightedSegments(value: string, ranges: [number, number][]) {
	if (!ranges.length) return [{ text: value, highlighted: false }];
	const segments: { text: string; highlighted: boolean }[] = [];
	let cursor = 0;
	for (const [rawStart, rawEnd] of ranges) {
		const start = Math.max(cursor, rawStart);
		const end = Math.min(value.length - 1, rawEnd);
		if (start > end) continue;
		if (start > cursor)
			segments.push({
				text: value.slice(cursor, start),
				highlighted: false,
			});
		segments.push({ text: value.slice(start, end + 1), highlighted: true });
		cursor = end + 1;
	}
	if (cursor < value.length)
		segments.push({ text: value.slice(cursor), highlighted: false });
	return segments;
}

function resultTarget(result: SiteSearchResult) {
	if (!result.url) return result.path;
	const url = new URL(result.url, window.location.origin);
	return url.origin === window.location.origin ? result.path : url.href;
}

async function open(preset = query.value, immediate = true) {
	query.value = preset.trim();
	searchArmed.value = immediate;
	results.value = [];
	setOpen(true);
	initializeSearch();
	await nextTick();
	searchInput.value?.focus();
	if (immediate) {
		if (status.value !== "ready") {
			const unwatch = watch(status, (newStatus) => {
				if (newStatus === "ready") {
					unwatch();
					queueSearch(0);
				} else if (newStatus === "error") {
					unwatch();
				}
			});
		} else {
			queueSearch(0);
		}
	}
}

function close() {
	closeSearch(true);
}

function resetSearch() {
	if (searchTimer) clearTimeout(searchTimer);
	remoteController?.abort();
	latestSearchRequestId = ++requestId;
	query.value = "";
	results.value = [];
	selectedIndex.value = 0;
	searching.value = false;
	searchArmed.value = true;
	activeOperator.value = props.operator;
}

function clearSearchUrl() {
	if (
		route.query[props.queryParam] === undefined &&
		route.query[props.modeParam] === undefined &&
		route.query[props.operatorParam] === undefined
	)
		return;

	const nextQuery = { ...route.query };
	delete nextQuery[props.queryParam];
	delete nextQuery[props.modeParam];
	delete nextQuery[props.operatorParam];
	void router.replace({
		path: route.path,
		query: nextQuery,
		hash: route.hash,
	});
}

function closeSearch(clearUrl: boolean) {
	internalCloseHandled = true;
	setOpen(false);
	resetSearch();
	if (clearUrl) clearSearchUrl();
	queueMicrotask(() => {
		if (isOpen.value) internalCloseHandled = false;
	});
}

async function clearQuery() {
	query.value = "";
	results.value = [];
	selectedIndex.value = 0;
	searching.value = false;
	searchArmed.value = true;
	await nextTick();
	searchInput.value?.focus();
}

function search(value = query.value) {
	query.value = value.trim();
	searchArmed.value = true;
	queueSearch(0);
}

function clearCache() {
	if (resolvedStrategy.value === "remote") return;
	createSearchWorker();
	post({ type: "clear-cache", requestId: ++requestId });
}

function moveSelection(direction: number) {
	if (!results.value.length) return;
	selectedIndex.value =
		(selectedIndex.value + direction + results.value.length) %
		results.value.length;
	nextTick(() => {
		document
			.querySelector<HTMLElement>(
				`[data-site-search-index="${selectedIndex.value}"]`,
			)
			?.scrollIntoView({ block: "nearest" });
	});
}

function onEnter() {
	if (!searchArmed.value) {
		searchArmed.value = true;
		queueSearch(0);
		return;
	}
	const result = results.value[selectedIndex.value];
	if (result) {
		selectResult(result);
		const target = result.url || result.path;
		const targetUrl = new URL(target, window.location.origin);
		if (targetUrl.origin === window.location.origin)
			void router.push(
				`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
			);
		else window.location.assign(targetUrl.href);
	} else queueSearch(0);
}

function selectResult(result: SiteSearchResult) {
	emit("select", result);
	closeSearch(false);
}

function queryValue(value: unknown) {
	return Array.isArray(value)
		? String(value[0] ?? "")
		: typeof value === "string"
			? value
			: "";
}

async function handleUrlQuery() {
	if (props.disableUrlHandling) return;

	const preset = queryValue(route.query[props.queryParam]).trim();
	if (!preset) {
		lastUrlSignature = "";
		return;
	}
	const rawMode = queryValue(route.query[props.modeParam]);
	const mode: UrlMode =
		rawMode === "prefill" || rawMode === "search" ? rawMode : props.urlMode;
	const rawOperator = queryValue(
		route.query[props.operatorParam],
	).toLowerCase();
	activeOperator.value =
		rawOperator === "and" || rawOperator === "or"
			? rawOperator
			: props.operator;
	const signature = `${route.fullPath}\u0000${mode}\u0000${activeOperator.value}\u0000${preset}`;
	if (signature === lastUrlSignature) return;
	lastUrlSignature = signature;
	await open(preset, mode === "search");

	if (props.consumeUrl) {
		const nextQuery = { ...route.query };
		delete nextQuery[props.queryParam];
		delete nextQuery[props.modeParam];
		delete nextQuery[props.operatorParam];
		await router.replace({
			path: route.path,
			query: nextQuery,
			hash: route.hash,
		});
	}
}

function onGlobalKeydown(event: KeyboardEvent) {
	if (event.key === "Escape" && isOpen.value) {
		close();
		return;
	}
	if (!props.shortcut || !(event.ctrlKey || event.metaKey)) return;
	if (
		event.shiftKey !== props.shortcutShift ||
		event.key.toLowerCase() !== props.shortcutKey.toLowerCase()
	)
		return;
	event.preventDefault();
	isOpen.value ? close() : open("", true);
}

watch(query, () => queueSearch());
watch(
	() => props.operator,
	(value) => {
		activeOperator.value = value;
		queueSearch(0);
	},
);
watch(resolvedStrategy, () => {
	remoteController?.abort();
	worker?.terminate();
	worker = undefined;
	status.value = "idle";
	indexedCount.value = 0;
	if (isOpen.value) {
		initializeSearch();
		queueSearch(0);
	}
});
watch(
	() => [
		route.query[props.queryParam],
		route.query[props.modeParam],
		route.query[props.operatorParam],
	],
	() => {
		if (!props.disableUrlHandling) {
			handleUrlQuery();
		}
	},
);
watch(isOpen, async (value, previousValue) => {
	if (!value) {
		if (!previousValue) return;
		if (internalCloseHandled) {
			internalCloseHandled = false;
			return;
		}
		resetSearch();
		clearSearchUrl();
		return;
	}

	if (previousValue === false && !internalCloseHandled) {
		window.dispatchEvent(new CustomEvent(UI_SITE_SEARCH_OPEN_EVENT));
		initializeSearch();
		await nextTick();
		searchInput.value?.focus();
	}
});

function onSiteSearchOpen(event: Event) {
	if (isOpen.value) return;
	const customEvent = event as CustomEvent;
	const { preset = "", immediate = true } = customEvent.detail || {};
	open(preset, immediate);
}

function onSiteSearchClose() {
	close();
}

onMounted(() => {
	mounted.value = true;
	window.addEventListener("keydown", onGlobalKeydown);
	window.addEventListener(
		UI_SITE_SEARCH_OPEN_EVENT,
		onSiteSearchOpen as EventListener,
	);
	window.addEventListener("myelophone:site-search-close", onSiteSearchClose);

	if (!props.disableUrlHandling) {
		handleUrlQuery();
	}
});

onBeforeUnmount(() => {
	window.removeEventListener("keydown", onGlobalKeydown);
	window.removeEventListener(
		UI_SITE_SEARCH_OPEN_EVENT,
		onSiteSearchOpen as EventListener,
	);
	window.removeEventListener(
		"myelophone:site-search-close",
		onSiteSearchClose,
	);
	if (searchTimer) clearTimeout(searchTimer);
	remoteController?.abort();
	worker?.terminate();
});

defineExpose({ open, close, search, clearCache });
</script>

<style scoped>
.site-search-mark {
	border-radius: 0.2em;
	padding-inline: 0.08em;
	background: color-mix(in srgb, var(--ui-primary, #f59e0b) 32%, transparent);
	color: inherit;
}
</style>
