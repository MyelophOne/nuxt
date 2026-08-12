<script setup lang="ts">
const props = defineProps<{
	mobileLimit?: number;
	desktopLimit?: number;
}>();

const slots = useSlots();
const isExpanded = ref(false);
const isMounted = ref(false);
const windowWidth = ref(0);

const rawText = computed(() => {
	const content = slots.default?.() || [];
	return content.map((node) => node.children).join("") || "";
});

const getTruncated = (text: string, limit: number | undefined) => {
	if (!limit || text.length <= limit) return text;

	const safeLimit = limit - 12;
	const subString = text.substring(0, safeLimit > 0 ? safeLimit : limit);

	const lastSpace = subString.lastIndexOf(" ");
	return lastSpace > 0 ? subString.substring(0, lastSpace) : subString;
};

const effectiveMobileLimit = computed(
	() => props.mobileLimit || props.desktopLimit,
);
const effectiveDesktopLimit = computed(
	() => props.desktopLimit || props.mobileLimit,
);

const mobileText = computed(() =>
	getTruncated(rawText.value, effectiveMobileLimit.value),
);
const desktopText = computed(() =>
	getTruncated(rawText.value, effectiveDesktopLimit.value),
);

const canExpand = computed(() => {
	const currentLimit =
		windowWidth.value < 768
			? effectiveMobileLimit.value
			: effectiveDesktopLimit.value;

	return currentLimit ? rawText.value.length > currentLimit : false;
});

const updateWidth = () => {
	windowWidth.value = window.innerWidth;
};

onMounted(() => {
	isMounted.value = true;
	updateWidth();
	window.addEventListener("resize", updateWidth);
});

onUnmounted(() => {
	window.removeEventListener("resize", updateWidth);
});

const { t } = useMultiLang(["interface"]);
</script>

<template>
	<div class="inline">
		<template v-if="!isMounted">
			<span v-if="mobileLimit" class="md:hidden">
				{{ mobileText }}...
			</span>
			<span v-if="desktopLimit" class="hidden md:inline">
				{{ desktopText }}...
			</span>
		</template>

		<template v-else>
			<span>
				{{
					isExpanded
						? rawText
						: windowWidth < 768
							? mobileText
							: desktopText
				}}
				<span v-if="!isExpanded && canExpand">...</span>
			</span>

			<button
				v-if="canExpand"
				@click="isExpanded = !isExpanded"
				class="ml-1 text-blue-600 hover:text-blue-800 underline decoration-dotted"
			>
				{{
					isExpanded ? t("interface.collapse") : t("interface.expand")
				}}
			</button>
		</template>

		<span class="sr-only" aria-hidden="false">
			{{ rawText }}
		</span>
	</div>
</template>
