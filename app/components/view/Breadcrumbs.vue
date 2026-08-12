<template>
	<nav class="ui-breadcrumbs" :class="containerClass" aria-label="Breadcrumb">
		<ol class="breadcrumb-list">
			<li class="breadcrumb-item">
				<NuxtLink :to="homePath" class="breadcrumb-link">
					{{ homeLabel }}
				</NuxtLink>
				<span v-if="breadcrumbs.length > 0" class="separator">{{
					separator
				}}</span>
			</li>

			<li
				v-for="(crumb, index) in breadcrumbs"
				:key="crumb.path"
				class="breadcrumb-item"
			>
				<span
					v-if="index === breadcrumbs.length - 1"
					class="current-page"
				>
					{{ truncate(crumb.title, maxChars) }}
				</span>

				<template v-else>
					<NuxtLink :to="crumb.path" class="breadcrumb-link">
						{{ truncate(crumb.title, maxChars) }}
					</NuxtLink>
					<span class="separator">{{ separator }}</span>
				</template>
			</li>
		</ol>
	</nav>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		maxChars?: number;
		separator?: string;
		containerClass?: string;
	}>(),
	{
		maxChars: 30,
		separator: "/",
		containerClass: "",
	},
);

const { breadcrumbs, homePath, homeLabel, truncate } = useBreadcrumbs();
</script>

<style scoped>
.ui-breadcrumbs {
	padding: 0.75rem 0;
	font-size: 0.875rem;
}
.breadcrumb-list {
	display: flex;
	flex-wrap: wrap;
	list-style: none;
	padding: 0;
	margin: 0;
	align-items: center;
}
.breadcrumb-item {
	display: flex;
	align-items: center;
	color: var(--ui-text);
	line-height: 1.2;
}
.breadcrumb-link {
	color: var(--ui-text);
	opacity: 0.6;
	text-decoration: none;
	transition: opacity 0.2s;
}
.breadcrumb-link:hover {
	opacity: 1;
}
.separator {
	margin: 0 0.5rem;
	opacity: 0.3;
	user-select: none;
	font-size: 0.9em;
}
.current-page {
	font-weight: 500;
	opacity: 0.9;
	text-transform: capitalize;
}
@media (max-width: 640px) {
	.ui-breadcrumbs {
		font-size: 0.8rem;
	}
}
</style>
