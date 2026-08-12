<template>
	<div
		class="w-full h-full flex flex-col bg-(--ui-bg) border border-(--ui-text) relative isolate overflow-hidden"
		:style="{ height: height }"
	>
		<div
			ref="scroller"
			class="flex-1 w-full overflow-auto relative"
			@scroll.passive="onScroll"
		>
			<div
				class="relative min-w-fit"
				:style="{ height: isVirtual ? `${totalHeight}px` : 'auto' }"
			>
				<div
					class="sticky top-0 z-20 flex border-b border-(--ui-text) bg-(--ui-bg) text-(--ui-text) font-bold text-xs uppercase tracking-wider select-none"
					:style="{ height: `${rowHeight}px` }"
				>
					<div
						v-for="col in columns"
						:key="col.key"
						class="flex items-center px-4 border-r border-(--ui-text) last:border-r-0 whitespace-nowrap overflow-hidden transition-colors hover:bg-(--ui-text)/5 cursor-pointer"
						:style="{
							width: col.width || '150px',
							minWidth: col.width || '150px',
							maxWidth: col.width || '150px',
						}"
						@click="col.sortable && handleSort(col.key)"
					>
						{{ col.label }}
						<span
							v-if="col.sortable"
							class="ml-2 opacity-60 text-[10px]"
						>
							<span v-if="currentSortKey === col.key">
								{{ currentSortOrder === "asc" ? "▲" : "▼" }}
							</span>
							<span v-else class="opacity-30">⇅</span>
						</span>
					</div>
				</div>

				<div
					v-if="isVirtual"
					class="absolute left-0 w-full will-change-transform"
					:style="{
						top: `${rowHeight}px`,
						transform: `translateY(${offsetY}px)`,
					}"
				>
					<div
						v-for="item in visibleItems"
						:key="item.id || item._virtualId"
						class="flex border-b border-(--ui-text)/20 hover:bg-(--ui-text)/5 transition-colors box-border group"
						:style="{ height: `${rowHeight}px` }"
					>
						<div
							v-for="col in columns"
							:key="col.key"
							class="flex items-center px-4 text-sm text-(--ui-text) border-r border-(--ui-text)/20 last:border-r-0 whitespace-nowrap overflow-hidden"
							:style="{
								width: col.width || '150px',
								minWidth: col.width || '150px',
								maxWidth: col.width || '150px',
							}"
						>
							<slot :name="`cell-${col.key}`" :item="item">
								{{ getNestedValue(item, col.key) }}
							</slot>
						</div>
					</div>
				</div>

				<div v-else class="flex flex-col">
					<div
						v-for="(item, index) in sortedItems"
						:key="item.id || index"
						class="flex border-b border-(--ui-text)/20 hover:bg-(--ui-text)/5 transition-colors box-border group"
						:style="{ height: `${rowHeight}px` }"
					>
						<div
							v-for="col in columns"
							:key="col.key"
							class="flex items-center px-4 text-sm text-(--ui-text) border-r border-(--ui-text)/20 last:border-r-0 whitespace-nowrap overflow-hidden"
							:style="{
								width: col.width || '150px',
								minWidth: col.width || '150px',
								maxWidth: col.width || '150px',
							}"
						>
							<slot :name="`cell-${col.key}`" :item="item">
								{{ getNestedValue(item, col.key) }}
							</slot>
						</div>
					</div>
				</div>
			</div>

			<div
				v-if="items.length === 0"
				class="absolute inset-0 flex items-center justify-center pointer-events-none pt-12"
			>
				<span class="opacity-50 font-mono text-sm">{{
					t("interface.nodata")
				}}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Column {
	key: string;
	label: string;
	width?: string;
	sortable?: boolean;
}

interface Props {
	items: any[];
	columns: Column[];
	height?: string;
	rowHeight?: number;
	buffer?: number;
	virtual?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	height: "100%",
	rowHeight: 45,
	buffer: 20,
	virtual: true,
});

const { t } = useMultiLang(["interface"]);

const emit = defineEmits(["sort"]);

const scroller = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const viewportHeight = ref(800);

const currentSortKey = ref("");
const currentSortOrder = ref<"asc" | "desc">("asc");

const handleSort = (key: string) => {
	if (currentSortKey.value === key) {
		currentSortOrder.value =
			currentSortOrder.value === "asc" ? "desc" : "asc";
	} else {
		currentSortKey.value = key;
		currentSortOrder.value = "asc";
	}
	emit("sort", { key: currentSortKey.value, order: currentSortOrder.value });
};

const sortedItems = computed(() => {
	if (!currentSortKey.value) return props.items;

	const data = [...props.items];

	return data.sort((a, b) => {
		const valA = getNestedValue(a, currentSortKey.value);
		const valB = getNestedValue(b, currentSortKey.value);

		if (valA < valB) return currentSortOrder.value === "asc" ? -1 : 1;
		if (valA > valB) return currentSortOrder.value === "asc" ? 1 : -1;
		return 0;
	});
});

const isVirtual = computed(() => props.virtual && props.items.length > 100);

const totalHeight = computed(
	() => sortedItems.value.length * props.rowHeight + props.rowHeight,
);

const startIndex = computed(() =>
	Math.floor(scrollTop.value / props.rowHeight),
);
const endIndex = computed(() =>
	Math.ceil((scrollTop.value + viewportHeight.value) / props.rowHeight),
);

const renderStart = computed(() =>
	Math.max(0, startIndex.value - props.buffer),
);
const renderEnd = computed(() =>
	Math.min(sortedItems.value.length, endIndex.value + props.buffer),
);

const visibleItems = computed(() => {
	if (!isVirtual.value) return [];
	return sortedItems.value
		.slice(renderStart.value, renderEnd.value)
		.map((item, idx) => ({
			...item,
			_virtualId: renderStart.value + idx,
		}));
});

const offsetY = computed(() => renderStart.value * props.rowHeight);

const onScroll = (e: Event) => {
	if (isVirtual.value) {
		requestAnimationFrame(() => {
			scrollTop.value = (e.target as HTMLElement).scrollTop;
		});
	}
};

const getNestedValue = (obj: any, path: string) => {
	return path
		.split(".")
		.reduce((o, key) => (o && o[key] !== undefined ? o[key] : ""), obj);
};

onMounted(() => {
	if (scroller.value) {
		viewportHeight.value = scroller.value.clientHeight;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				viewportHeight.value = entry.contentRect.height;
			}
		});
		ro.observe(scroller.value);
	}
});
</script>

<style scoped>
div {
	scrollbar-width: thin;
	scrollbar-color: var(--ui-text) var(--ui-bg);
}
div::-webkit-scrollbar {
	width: 10px;
	height: 10px;
}
div::-webkit-scrollbar-track {
	background: var(--ui-bg);
	border: 1px solid var(--ui-text);
}
div::-webkit-scrollbar-thumb {
	background: var(--ui-text);
	border: 2px solid var(--ui-bg);
}
div::-webkit-scrollbar-corner {
	background: var(--ui-text);
}
</style>
