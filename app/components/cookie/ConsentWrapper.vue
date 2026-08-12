<script setup lang="ts">
import { toast } from "vue-sonner";
import type { CookieCategory } from "~/types/cookie";

interface Props {
	category: CookieCategory;
	serviceName?: string;
}

const props = defineProps<Props>();

const { t } = useMultiLang(["cookies"]);

const { checkConsent, isBannerVisible } = useCookieControl();

const hasConsent = computed(() => checkConsent(props.category));

const categoryNames = computed<Record<CookieCategory, string>>(() => ({
	necessary: t("cookies.necessary"),
	analytics: t("cookies.analytics"),
	marketing: t("cookies.marketing"),
	functional: t("cookies.functional"),
}));

const messageText = computed(() => {
	const catName = categoryNames.value[props.category] || props.category;
	if (props.serviceName) {
		return `${t("cookies.toUse")} ${props.serviceName} ${t("cookies.needToAccept")} ${catName} ${t("cookies.cookies")}.`;
	}
	return `${t("cookies.toSee")} ${catName} ${t("cookies.cookies")}.`;
});

const handleRequestConsent = () => {
	isBannerVisible.value = true;
	toast.message(t("cookies.actionRequired"), {
		description: t("cookies.selectCategories"),
	});
};
</script>

<template>
	<div class="w-full h-full relative isolate">
		<slot v-if="hasConsent" />

		<div
			v-else
			class="flex flex-col items-center justify-center w-full h-full min-h-50 p-6 text-center bg-neutral-50 border border-neutral-200 rounded-xl dark:bg-neutral-900 dark:border-neutral-800"
		>
			<div class="text-4xl mb-3 opacity-80 select-none">🍪</div>

			<h3
				class="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
			>
				{{ t("cookies.contentHidden") }}
			</h3>

			<p
				class="text-sm text-neutral-500 dark:text-neutral-400 mb-5 max-w-xs mx-auto leading-relaxed"
			>
				{{ messageText }}
			</p>

			<button
				@click="handleRequestConsent"
				class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg shadow-sm hover:bg-neutral-800 transition-all dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
			>
				{{ t("cookies.setPrefs") }}
			</button>
		</div>
	</div>
</template>
