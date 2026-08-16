<script setup lang="ts" generic="T">
defineProps<{
	contentByLocale: Record<string, T>;
}>();

defineSlots<{
	default(props: { content: T; locale: string }): unknown;
}>();
</script>

<template>
	<UiLangVisible
		v-for="(content, locale) in contentByLocale"
		:key="locale"
		:only="locale"
	>
		<slot :content="content" :locale="locale" />
	</UiLangVisible>
</template>
