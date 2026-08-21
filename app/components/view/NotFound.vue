<template>
	<div class="min-h-screen flex items-center justify-center px-4">
		<div class="max-w-xl text-center">
			<h1
				class="text-7xl sm:text-9xl font-extrabold tracking-widest text-red-500 dark:text-red-400"
			>
				404
			</h1>
			<p class="text-2xl md:text-3xl mt-6 text-center">
				{{ t("interface.pageNotFound") }}
			</p>

			<p
				class="mt-4 text-gray-600 dark:text-gray-400 text-center max-w-md"
			>
				{{ t("interface.pageNotFoundText") }}
			</p>

			<NuxtLink
				to="/"
				class="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 pb-3 px-6 rounded-lg transition"
			>
				{{ t("interface.goHomeFull") }}
			</NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		setResponseStatus?: boolean;
	}>(),
	{
		setResponseStatus: true,
	},
);

if (import.meta.server && props.setResponseStatus) {
	const event = useRequestEvent();
	if (event) {
		setResponseStatus(event, 404, "Not Found");
	}
}

const isNotFound = useState<boolean>("is_404", () => false);
const activateNotFound = () => {
	isNotFound.value = true;
};
const deactivateNotFound = () => {
	isNotFound.value = false;
};

activateNotFound();
onActivated(activateNotFound);
onDeactivated(deactivateNotFound);
onUnmounted(deactivateNotFound);

const { t } = useMultiLang(["interface"]);

useAppSeo({
	title: () => `404 — ${t("interface.pageNotFound")}`,
	description: () => `404 — ${t("interface.pageNotFoundDescription")}`,
	noIndex: true,
});
</script>

<style scoped>
h1 {
	animation: bounce 3s ease infinite;
}
@keyframes bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-15px);
	}
}
</style>
