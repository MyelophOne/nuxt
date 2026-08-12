<template>
	<div v-show="isLoading" id="preloader" class="preloader" />
</template>

<script setup lang="ts">
const pinia = useNuxtApp().$pinia;
const settingsStore = useSettingsStore(pinia);
const isLoading = computed(() => settingsStore.isLoading);
</script>

<style scoped>
#preloader {
	position: fixed;
	top: 7px;
	right: 10px;
	margin: 0 auto;
}
</style>
