<script setup lang="ts">
interface Props {
	to: string;
	exact?: boolean;
	replace?: boolean;
}

const props = defineProps<Props>();
const pinia = useNuxtApp().$pinia;
const settingsStore = useSettingsStore(pinia);

const localizedTo = computed(() => {
	const current = settingsStore.currentLocale;
	const defaultLocale = settingsStore.defaultLocale;

	if (!current || !props.to) return props.to;

	if (current === defaultLocale) return props.to;

	const normalized = props.to.startsWith("/") ? props.to : `/${props.to}`;

	if (normalized.startsWith(`/${current}/`) || normalized === `/${current}`) {
		return normalized;
	}

	return normalized === "/" ? `/${current}` : `/${current}${normalized}`;
});
</script>

<template>
	<NuxtLink :to="localizedTo" :exact="exact" :replace="replace">
		<slot />
	</NuxtLink>
</template>
