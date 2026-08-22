<template>
	<Transition
		enter-active-class="transition duration-100 ease-out"
		enter-from-class="opacity-0 scale-95"
		enter-to-class="opacity-100 scale-100"
		leave-active-class="transition duration-75 ease-in"
		leave-from-class="opacity-100 scale-100"
		leave-to-class="opacity-0 scale-95"
	>
		<div
			v-if="isOpen"
			class="fixed inset-0 z-99999 flex items-start justify-center pt-[10vh] px-4"
		>
			<div
				class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
				@click="close"
			></div>

			<div
				class="relative w-full max-w-lg flex flex-col rounded-lg shadow-2xl overflow-hidden ring-1 ring-(--ui-text)/20 bg-(--ui-bg)"
				@click.stop
			>
				<div
					class="flex items-center px-3 py-2 border-b border-(--ui-text)/10 bg-(--ui-text)/5"
				>
					<span
						v-if="mode === 'commands'"
						class="mr-2 text-(--ui-text) font-mono font-bold text-sm"
						>#</span
					>
					<span
						v-else-if="mode === 'pages'"
						class="mr-2 text-(--ui-text) font-mono font-bold text-sm"
						>/</span
					>
					<svg
						v-else
						class="w-4 h-4 opacity-40 mr-2 text-(--ui-text)"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>

					<input
						ref="searchInput"
						v-model="query"
						type="text"
						placeholder="Введите / для страниц или # для команд..."
						class="w-full bg-transparent border-none outline-none text-sm placeholder-(--ui-text)/30 text-(--ui-text) h-6"
						autocomplete="off"
						spellcheck="false"
						@keydown.down.prevent="onArrowDown"
						@keydown.up.prevent="onArrowUp"
						@keydown.enter.prevent="onEnter"
						@keydown.esc="close"
					/>

					<span
						class="hidden sm:block text-[10px] font-mono opacity-30 text-(--ui-text) border border-(--ui-text)/20 rounded px-1 ml-2"
						>ESC</span
					>
				</div>

				<div class="max-h-[50vh] overflow-y-auto scrollbar-hide p-1">
					<ul v-if="displayedItems.length > 0">
						<li
							v-for="(item, index) in displayedItems"
							:key="item.id"
							:ref="(el) => (itemRefs[index] = el)"
							class="px-2 py-1.5 mx-0.5 rounded cursor-pointer flex items-center justify-between group transition-colors"
							:class="{
								'bg-(--ui-text)/10': selectedIndex === index,
								'hover:bg-(--ui-text)/5':
									selectedIndex !== index,
							}"
							@click="executeItem(item)"
							@mouseenter="selectedIndex = index"
						>
							<div
								class="flex items-center gap-2 min-w-0 overflow-hidden"
							>
								<div
									class="shrink-0 opacity-50 text-(--ui-text)"
								>
									<svg
										v-if="item.type === 'page'"
										class="w-3.5 h-3.5"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									<svg
										v-else-if="item.type === 'history'"
										class="w-3.5 h-3.5"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<svg
										v-else
										class="w-3.5 h-3.5"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
										/>
									</svg>
								</div>

								<div
									class="flex items-baseline gap-2 truncate text-(--ui-text)"
								>
									<span
										class="text-xs font-medium opacity-90 truncate"
										>{{ item.name }}</span
									>
									<span
										v-if="item.hint"
										class="text-[10px] opacity-40 font-mono truncate hidden sm:inline"
									>
										{{ item.hint }}
									</span>
								</div>
							</div>

							<svg
								v-if="selectedIndex === index"
								class="hidden sm:block w-3 h-3 text-(--ui-text) opacity-30 shrink-0"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
						</li>
					</ul>

					<div v-else class="px-4 py-4 text-center select-none">
						<div
							v-if="!query"
							class="flex justify-center gap-3 opacity-30 text-(--ui-text) text-[10px] font-mono"
						>
							<span>/ страницы</span>
							<span># команды</span>
						</div>
						<div
							v-else
							class="text-[10px] opacity-30 text-(--ui-text)"
						>
							Ничего не найдено
						</div>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { useCommandStore } from "~/stores/commands";
import type { RouteRecordNormalized } from "vue-router";
import { UI_SITE_SEARCH_OPEN_EVENT } from "~/constants/ui-events";

const router = useRouter();
const route = useRoute();
const nuxtApp = useNuxtApp();

const commandStore = useCommandStore(nuxtApp.$pinia);

interface SearchItem {
	id: string;
	type: "page" | "history" | "command";
	name: string;
	hint?: string;
	path?: string;
	action?: () => void;
}

const isOpen = ref(false);
const query = ref("");
const selectedIndex = ref(0);
const searchInput = ref<HTMLInputElement | null>(null);
const itemRefs = ref<(Element | ComponentPublicInstance | null)[]>([]);
const history = ref<SearchItem[]>([]);

const formatRouteName = (r: any): string => {
	if (r.path === "/" || r.name === "index") return "Главная";
	if (r.meta?.title) return r.meta.title as string;
	const name = (r.name || r.path).toString().replace(/^\//, "");
	return name
		.split(/[-_]/)
		.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(" ");
};

const allRoutes = router
	.getRoutes()
	.filter(
		(r: RouteRecordNormalized) =>
			!r.redirect &&
			!r.children.length &&
			!r.path.includes(":") &&
			!r.path.includes("["),
	)
	.map((r: RouteRecordNormalized) => ({
		id: "page-" + r.path,
		type: "page" as const,
		path: r.path,
		name: formatRouteName(r),
		hint: r.path,
	}))
	.sort((a, b) => a.path.length - b.path.length);

const mode = computed<"pages" | "commands" | "idle">(() => {
	if (query.value.startsWith("/")) return "pages";
	if (query.value.startsWith("#")) return "commands";
	return "idle";
});

const displayedItems = computed<SearchItem[]>(() => {
	const q = query.value.substring(1).toLowerCase();

	if (mode.value === "pages") {
		const histItems = history.value.filter(
			(h) =>
				(h.name.toLowerCase().includes(q) ||
					(h.path && h.path.includes(q))) &&
				h.path !== route.path,
		);

		const pageItems = allRoutes.filter(
			(p) =>
				(p.name.toLowerCase().includes(q) || p.path.includes(q)) &&
				p.path !== route.path &&
				!histItems.some((h) => h.path === p.path),
		);

		return [...histItems, ...pageItems];
	}

	if (mode.value === "commands") {
		return commandStore.commands.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.id.includes(q) ||
				(c.keywords && c.keywords.some((k) => k.includes(q))),
		);
	}

	return [];
});

watch(displayedItems, (items) => {
	if (mode.value === "pages" && items.length > 0) {
		items.slice(0, 5).forEach((item) => {
			if (
				(item.type === "page" || item.type === "history") &&
				item.path
			) {
				preloadRouteComponents(item.path);
			}
		});
	}
	selectedIndex.value = 0;
});

const executeItem = (item: SearchItem) => {
	isOpen.value = false;

	if (item.type === "page" || item.type === "history") {
		if (item.path) router.push(item.path);
	} else if (item.type === "command") {
		if (item.action) {
			item.action();
		}
	}
};

const safeSessionStorage = {
	getItem: (key: string) => {
		try {
			return window.sessionStorage.getItem(key);
		} catch (e) {
			return null;
		}
	},
	setItem: (key: string, val: string) => {
		try {
			window.sessionStorage.setItem(key, val);
		} catch (e) {}
	},
};

const addToHistory = (r: any) => {
	if (r.path.includes("[") || r.path === "/") return;

	const item: SearchItem = {
		id: "hist-" + r.path,
		type: "history",
		path: r.path,
		name: formatRouteName(r),
		hint: "Недавно",
	};

	const existing = history.value.findIndex((h) => h.path === item.path);
	if (existing > -1) history.value.splice(existing, 1);

	history.value.unshift(item);
	if (history.value.length > 5) history.value.pop();

	safeSessionStorage.setItem("cmd_history", JSON.stringify(history.value));
};

const close = () => (isOpen.value = false);

const onArrowDown = () => {
	if (!displayedItems.value.length) return;
	selectedIndex.value =
		(selectedIndex.value + 1) % displayedItems.value.length;
	scrollToItem();
};

const onArrowUp = () => {
	if (!displayedItems.value.length) return;
	selectedIndex.value =
		(selectedIndex.value - 1 + displayedItems.value.length) %
		displayedItems.value.length;
	scrollToItem();
};

const onEnter = () => {
	const item = displayedItems.value[selectedIndex.value];
	if (item) executeItem(item);
};

const scrollToItem = () => {
	nextTick(() => {
		const el = itemRefs.value[selectedIndex.value];
		if (el instanceof Element)
			el.scrollIntoView({ block: "nearest", behavior: "smooth" });
	});
};

const onKeydown = (e: KeyboardEvent) => {
	if (
		(e.ctrlKey || e.metaKey) &&
		!e.shiftKey &&
		e.key.toLowerCase() === "k"
	) {
		e.preventDefault();
		if (!isOpen.value) {
			isOpen.value = true;
			query.value = "";
			nextTick(() => searchInput.value?.focus());
		} else {
			close();
		}
	}
};

const onSiteSearchOpen = () => {
	if (isOpen.value) close();
};

onMounted(() => {
	if (typeof window !== "undefined") {
		window.addEventListener("keydown", onKeydown);
		window.addEventListener(UI_SITE_SEARCH_OPEN_EVENT, onSiteSearchOpen);
		const saved = safeSessionStorage.getItem("cmd_history");
		if (saved)
			try {
				history.value = JSON.parse(saved);
			} catch (e) {}
	}
});

onUnmounted(() => {
	if (typeof window !== "undefined") {
		window.removeEventListener("keydown", onKeydown);
		window.removeEventListener(UI_SITE_SEARCH_OPEN_EVENT, onSiteSearchOpen);
	}
});

watch(
	() => route.path,
	() => addToHistory(route),
);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
	display: none;
}
.scrollbar-hide {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
