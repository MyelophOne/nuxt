<script setup lang="ts">
interface Props {
	only?: string | string[];
	except?: string | string[];
}

const props = defineProps<Props>();

const pinia = useNuxtApp().$pinia;
const settings = useSettingsStore(pinia);

const isVisible = computed(() => {
	const locale = settings.currentLocale || settings.defaultLocale || "en";

	if (props.only) {
		const list = Array.isArray(props.only) ? props.only : [props.only];
		return list.includes(locale);
	}

	if (props.except) {
		const list = Array.isArray(props.except)
			? props.except
			: [props.except];
		return !list.includes(locale);
	}

	return true;
});
</script>

<template>
	<slot v-if="isVisible" />
</template>
