<script setup lang="ts">
const props = defineProps<{
	[key: string]: any;
}>();

const attrs = useAttrs();
const hasOnError = computed(
	() => "onerror" in attrs || "onError" in attrs || "@error" in attrs,
);
const finalOnError = computed(() => {
	return hasOnError.value ? undefined : null;
});

const isStatic = useStatic();
</script>

<template>
	<template v-if="isStatic">
		<img v-bind="{ ...props, ...attrs }" :onerror="finalOnError" />
	</template>

	<template v-else>
		<NuxtImg v-bind="{ ...props, ...attrs }" :onerror="finalOnError" />
	</template>
</template>
