<script setup lang="ts" generic="T">
const props = withDefaults(
	defineProps<{
		status: "idle" | "pending" | "success" | "error";
		data?: T;
		error?: unknown;
		empty?: boolean;
		retainData?: boolean;
		loadingLabel?: string;
		errorLabel?: string;
		emptyLabel?: string;
		retryLabel?: string;
		retryable?: boolean;
	}>(),
	{ retryable: true },
);
const emit = defineEmits<{ retry: [] }>();
const { t } = useMultiLang("reusable-ui");
const retry = () => emit("retry");
const showPending = computed(
	() =>
		(props.status === "pending" || props.status === "idle") &&
		!(props.retainData && props.data != null),
);
</script>

<template>
	<div class="view-async-state" :aria-busy="status === 'pending'">
		<slot v-if="showPending" name="pending"
			><p role="status">
				{{ loadingLabel || t("reusable-ui.loading") }}
			</p></slot
		>
		<slot
			v-else-if="error || status === 'error'"
			name="error"
			:error="error"
			:retry="retry"
		>
			<div role="alert">
				<p>{{ errorLabel || t("reusable-ui.error") }}</p>
				<UiButton
					v-if="retryable"
					type="button"
					:label="retryLabel || t('reusable-ui.retry')"
					@click="retry"
				/>
			</div>
		</slot>
		<slot v-else-if="empty" name="empty" :data="data" :retry="retry"
			><p role="status">
				{{ emptyLabel || t("reusable-ui.empty") }}
			</p></slot
		>
		<slot v-else :data="data" :status="status" :retry="retry" />
	</div>
</template>

<style scoped>
.view-async-state {
	min-width: 0;
}
</style>
