<script setup lang="ts">
interface MenuItem {
	label: string;
	to: string;
	[key: string]: any;
}

interface MenuClasses {
	wrapper?: string;
	link?: string;
	linkActive?: string;
	moreButton?: string;
	dropdown?: string;
	dropdownLink?: string;
}

const props = withDefaults(
	defineProps<{
		items: MenuItem[];
		ui?: MenuClasses;
	}>(),
	{
		ui: () => ({}),
	},
);

const route = useRoute();

const containerRef = ref<HTMLElement | null>(null);
const dummyRef = ref<HTMLElement | null>(null);
const moreContainerRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);
const availableWidth = ref(0);
const itemWidths = ref<number[]>([]);

const GAP = 16;
const MORE_BTN_WIDTH = 90;

const isActive = (to: string) => {
	if (!to) return false;
	const currentPath = route.path.replace(/[?#].*$/, "").replace(/\/$/, "");
	const targetPath = to.replace(/[?#].*$/, "").replace(/\/$/, "");
	return currentPath === targetPath;
};

const visibleCount = computed(() => {
	if (!availableWidth.value || itemWidths.value.length === 0)
		return props.items.length;
	let currentWidth = 0;
	let count = 0;
	for (let i = 0; i < props.items.length; i++) {
		const itemW = itemWidths.value[i];
		if (itemW === undefined) break;
		const widthAfterAdding = currentWidth + itemW + (i > 0 ? GAP : 0);
		const isLast = i === props.items.length - 1;
		const requiredSpace = isLast
			? widthAfterAdding
			: widthAfterAdding + GAP + MORE_BTN_WIDTH;
		if (requiredSpace <= availableWidth.value) {
			currentWidth = widthAfterAdding;
			count++;
		} else {
			break;
		}
	}
	return count;
});

const visibleItems = computed(() => props.items.slice(0, visibleCount.value));
const hiddenItems = computed(() => props.items.slice(visibleCount.value));

const measure = () => {
	if (!containerRef.value || !dummyRef.value) return;
	availableWidth.value = containerRef.value.offsetWidth;
	const children = Array.from(dummyRef.value.children) as HTMLElement[];
	itemWidths.value = children.map((el) => el.getBoundingClientRect().width);
};

const handleClickOutside = (event: MouseEvent) => {
	if (isDropdownOpen.value && moreContainerRef.value) {
		if (!moreContainerRef.value.contains(event.target as Node)) {
			isDropdownOpen.value = false;
		}
	}
};

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
	measure();
	if (containerRef.value) {
		resizeObserver = new ResizeObserver(() =>
			requestAnimationFrame(measure),
		);
		resizeObserver.observe(containerRef.value);
	}
	document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
	if (resizeObserver) resizeObserver.disconnect();
	document.removeEventListener("click", handleClickOutside);
});
watch(
	() => props.items,
	async () => {
		await nextTick();
		measure();
	},
	{ deep: true },
);
watch(
	() => route.path,
	() => {
		isDropdownOpen.value = false;
	},
);

const layoutClass =
	"flex items-center whitespace-nowrap transition-colors duration-200";

const defaultLink =
	"h-10 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 font-medium text-sm";
const defaultActive = "bg-neutral-100 dark:bg-white/10 text-primary";
const defaultMore =
	"h-10 px-3 rounded-md gap-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300";
const defaultDropdown =
	"absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1";
</script>

<template>
	<div class="relative w-full" :class="ui.wrapper">
		<nav
			ref="containerRef"
			class="flex items-center w-full gap-4 flex-nowrap"
		>
			<div class="flex items-center gap-4 overflow-hidden flex-1">
				<NuxtLink
					v-for="item in visibleItems"
					:key="item.to"
					:to="item.to"
					:class="[
						layoutClass,
						ui.link || defaultLink,
						isActive(item.to) ? ui.linkActive || defaultActive : '',
					]"
				>
					{{ item.label }}
				</NuxtLink>
			</div>

			<div
				v-if="hiddenItems.length > 0"
				ref="moreContainerRef"
				class="relative shrink-0 ml-auto"
			>
				<button
					@click="isDropdownOpen = !isDropdownOpen"
					:class="[
						layoutClass,
						ui.moreButton || defaultMore,
						isDropdownOpen && !ui.moreButton
							? 'bg-neutral-100 dark:bg-white/10'
							: '',
					]"
				>
					Ещё
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-4 h-4 transition-transform duration-200"
						:class="{ 'rotate-180': isDropdownOpen }"
					>
						<path
							fill-rule="evenodd"
							d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>

				<div
					v-if="isDropdownOpen"
					class="z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
					:class="ui.dropdown || defaultDropdown"
				>
					<NuxtLink
						v-for="item in hiddenItems"
						:key="item.to"
						:to="item.to"
						class="block px-4 py-2.5 text-sm text-left transition-colors"
						:class="[
							ui.dropdownLink ||
								'hover:bg-neutral-50 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300',
							isActive(item.to)
								? 'text-primary font-medium bg-neutral-50 dark:bg-white/5'
								: '',
						]"
					>
						{{ item.label }}
					</NuxtLink>
				</div>
			</div>
		</nav>

		<div
			ref="dummyRef"
			class="absolute top-0 left-0 invisible -z-50 flex gap-4 pointer-events-none w-max"
			aria-hidden="true"
		>
			<div
				v-for="item in props.items"
				:key="`dummy-${item.to}`"
				:class="[layoutClass, ui.link || defaultLink]"
			>
				{{ item.label }}
			</div>
		</div>
	</div>
</template>
