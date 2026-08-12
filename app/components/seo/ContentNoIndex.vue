<template>
	<div data-nosnippet>
		<ClientOnly>
			<slot />
			<template #placeholder>
				<div
					:style="{ height: fallbackHeight }"
					:class="['no-index-placeholder', placeholderClass]"
				>
					<slot name="placeholder" />
				</div>
			</template>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
interface Props {
	fallbackHeight?: string;
	placeholderClass?: string;
}

withDefaults(defineProps<Props>(), {
	fallbackHeight: "auto",
	placeholderClass: "",
});
</script>

<style scoped>
.no-index-placeholder {
	opacity: 0;
	pointer-events: none;
	user-select: none;
}
</style>
