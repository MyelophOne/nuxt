<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(defineProps<{ label?: string; showLabel?: boolean }>(), {
	showLabel: false,
});

const settings = useSettingsStore();
const { t } = useMultiLang(["myelophone"]);
</script>

<template>
	<UiButton
		v-bind="$attrs"
		type="button"
		variant="ghost"
		:square="!showLabel"
		:aria-label="label || t('myelophone.toggleTheme')"
		:aria-pressed="settings.theme === 'dark'"
		class="ui-theme-toggle"
		:class="{ 'ui-theme-toggle--label': showLabel }"
		@click="settings.toggleTheme()"
	>
		<span class="dark:hidden" aria-hidden="true">
			<UiIcon name="solar:moon-stars-line-duotone" size="20" />
		</span>
		<span class="hidden dark:inline" aria-hidden="true">
			<UiIcon name="solar:sun-broken" size="20" />
		</span>
		<span v-if="showLabel" class="ui-theme-toggle__label">{{
			label || t("myelophone.toggleTheme")
		}}</span>
	</UiButton>
</template>

<style scoped>
.ui-theme-toggle {
	min-width: 44px;
	min-height: 44px;
	padding: 0;
}

.ui-theme-toggle--label {
	padding-inline: 0.75rem;
}

.ui-theme-toggle :deep(> span) {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}
</style>
