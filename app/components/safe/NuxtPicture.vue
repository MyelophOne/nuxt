<script setup lang="ts">
const props = defineProps<{
	[key: string]: any;
}>();

const attrs = useAttrs();

const hasOnError = computed(() => {
	return (
		"onerror" in attrs ||
		"onError" in attrs ||
		"@error" in attrs ||
		Object.keys(attrs).some(
			(key) =>
				key.toLowerCase().includes("error") && key.startsWith("on"),
		)
	);
});

const finalOnError = computed(() => {
	return hasOnError.value ? undefined : null;
});
</script>

<template>
	<NuxtPicture v-bind="{ ...props, ...attrs }" :onerror="finalOnError">
		<slot />
	</NuxtPicture>
</template>
