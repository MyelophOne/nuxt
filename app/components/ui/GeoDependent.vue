<script setup lang="ts">
interface GeoRules {
	whitelist?: string[];
	blacklist?: string[];
}

const props = defineProps<{
	rules: GeoRules;
	geoData?: { country?: string };
}>();

const { geo, resolve } = useGeoFetch();
const localVisible = ref(false);

const checkVisibility = (countryCode: string) => {
	const current = countryCode.trim().toUpperCase();
	const normalize = (list: string[]) =>
		list.map((i) => i.trim().toUpperCase());

	if (props.rules.whitelist) {
		return normalize(props.rules.whitelist).includes(current);
	}
	if (props.rules.blacklist) {
		return !normalize(props.rules.blacklist).includes(current);
	}
	return true;
};

watchEffect(async () => {
	const countrySource =
		props.geoData?.country ||
		(geo.value.resolved ? geo.value.country : null);

	if (countrySource !== null) {
		const shouldShow = checkVisibility(countrySource);
		if (shouldShow) {
			await nextTick();
			localVisible.value = true;
		} else {
			localVisible.value = false;
		}
	}
});

onMounted(() => {
	if (!props.geoData) {
		resolve();
	}
});
</script>

<template>
	<ClientOnly>
		<Transition name="fade" appear>
			<div v-if="localVisible" class="geo-wrapper" data-nosnippet>
				<slot />
			</div>
		</Transition>
	</ClientOnly>
</template>

<style scoped>
.fade-enter-active {
	transition: opacity 0.6s ease-out;
}
.fade-enter-from {
	opacity: 0;
}
.geo-wrapper {
	display: contents;
}
</style>
