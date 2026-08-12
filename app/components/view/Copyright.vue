<template>
	<div class="ui-copyright" :class="containerClass">
		<span class="copyright-text">
			{{ symbol }} {{ yearRange }} {{ owner }}.
		</span>
		<span v-if="allRightsReserved" class="rights-text">
			{{ t("common.all_rights_reserved") }}
		</span>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		owner: string;
		startYear?: number | string;
		allRightsReserved?: boolean;
		containerClass?: string;
	}>(),
	{
		allRightsReserved: true,
	},
);

const { t } = useMultiLang(["common"]);

const symbol = "©";

const yearRange = computed(() => {
	const currentYear = new Date().getFullYear();
	const start =
		typeof props.startYear === "string"
			? parseInt(props.startYear, 10)
			: props.startYear;

	if (!start || isNaN(start) || start >= currentYear) {
		return currentYear.toString();
	}

	return `${start}-${currentYear}`;
});
</script>

<style scoped>
.ui-copyright {
	color: var(--ui-text);
	opacity: 0.7;
	font-size: 0.875rem;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.5ch;
}

.copyright-text {
	white-space: nowrap;
}

.rights-text {
	text-transform: capitalize;
}

@media (max-width: 640px) {
	.ui-copyright {
		font-size: 0.8rem;
	}
}
</style>
