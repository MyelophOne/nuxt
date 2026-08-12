<script setup lang="ts">
import {
	COOKIE_CATEGORIES,
	type CookieCategory,
	type CookieSelection,
	type CookieScriptDef,
} from "~/types/cookie";

const { t } = useMultiLang(["cookies"]);

const { isOpen, close } = useCookieModal();
const { cookiePreferences, savePreferences, declineAll, acceptAll } =
	useCookieControl();
const { allScriptsConfig } = useScriptLoader();

const visibleCookieCategories = computed(() =>
	COOKIE_CATEGORIES.filter(
		(cat) =>
			cat === "necessary" ||
			cat === "functional" ||
			(allScriptsConfig[cat]?.length ?? 0) > 0,
	),
);

const localSelection = reactive<CookieSelection>({
	necessary: true,
	analytics: false,
	marketing: false,
	functional: false,
});

const detectedCookies = ref<{ key: string; value: string }[]>([]);

const noticeScripts = computed(() =>
	(allScriptsConfig.notices || []).filter(
		(script: CookieScriptDef) => script.legalBasis === "cookieless",
	),
);

const categoryInfo = computed<
	Record<CookieCategory, { title: string; desc: string }>
>(() => {
	return {
		necessary: {
			title: t("cookies.necessaryTitle"),
			desc: t("cookies.necessaryDesc"),
		},
		analytics: {
			title: t("cookies.analyticsTitle"),
			desc: t("cookies.analyticsDesc"),
		},
		marketing: {
			title: t("cookies.marketingTitle"),
			desc: t("cookies.marketingDesc"),
		},
		functional: {
			title: t("cookies.functionalTitle"),
			desc: t("cookies.functionalDesc"),
		},
	};
});

watch(isOpen, (val) => {
	if (val) {
		const currentPrefs = cookiePreferences.value;
		COOKIE_CATEGORIES.forEach((cat) => {
			localSelection[cat] =
				cat === "necessary"
					? true
					: currentPrefs.status === "pending"
						? false
						: currentPrefs[cat];
		});
		parseCookies();
	}
});

const parseCookies = () => {
	if (typeof document === "undefined") return;
	const cookies = document.cookie.split(";");

	detectedCookies.value = cookies
		.map((c: string) => {
			const [key, ...v] = c.trim().split("=");
			return { key: key || "", value: v.join("=") };
		})
		.filter((c) => c.key !== "");
};

const handleSave = () => {
	savePreferences(localSelection);
	close();
};
const handleRejectAll = () => {
	declineAll();
	close();
};
const handleAcceptAll = () => {
	acceptAll();
	close();
};
</script>

<template>
	<UiModal
		v-model="isOpen"
		:title="t('cookies.privacyTitle')"
		width="max-w-3xl"
	>
		<div class="space-y-6">
			<p
				class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed"
			>
				{{ t("cookies.cookieNote") }}
			</p>

			<div class="space-y-3">
				<div
					v-for="cat in visibleCookieCategories"
					:key="cat"
					class="group rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
				>
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1 min-w-0">
							<div
								class="flex items-center flex-wrap gap-2 min-h-6"
							>
								<p
									class="text-base font-semibold text-neutral-900 dark:text-white leading-none"
								>
									{{ categoryInfo[cat].title }}
								</p>
								<span
									v-if="cat === 'necessary'"
									class="text-base text-neutral-400 dark:text-neutral-500 font-normal leading-none"
								>
									{{ t("cookies.alwaysOn") }}
								</span>
							</div>

							<p
								class="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 leading-snug"
							>
								{{ categoryInfo[cat].desc }}
							</p>

							<div class="mt-3">
								<details
									v-if="
										(allScriptsConfig[cat]?.length ?? 0) > 0
									"
								>
									<summary
										class="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-(--ui-text) opacity-70 hover:opacity-100 transition-opacity select-none"
									>
										<span
											>{{ t("cookies.usedServices") }} ({{
												allScriptsConfig[cat]!.length
											}})</span
										>
										<svg
											class="h-3 w-3 transition-transform group-open:rotate-180"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</summary>

									<div
										class="mt-2 pl-3 border-l-2 border-neutral-100 dark:border-neutral-800 space-y-2"
									>
										<div
											v-for="script in allScriptsConfig[
												cat
											]"
											:key="script.id"
											class="text-xs"
										>
											<p
												class="font-medium text-neutral-700 dark:text-neutral-300 text-xs"
											>
												{{ t(script.nameKey!) }}
											</p>
											<p
												v-if="script.descriptionKey"
												class="text-neutral-500 dark:text-neutral-500 text-xs"
											>
												{{ t(script.descriptionKey!) }}
											</p>
										</div>
									</div>
								</details>

								<p
									v-else-if="cat !== 'necessary'"
									class="text-xs text-neutral-400 dark:text-neutral-600 italic select-none"
								>
									{{ t("cookies.usedNotServices") }}
								</p>
							</div>
						</div>

						<div class="shrink-0">
							<UiToggler
								v-model="localSelection[cat]"
								:disabled="cat === 'necessary'"
							/>
						</div>
					</div>
				</div>
			</div>

			<details
				class="rounded-lg border border-neutral-200 dark:border-neutral-800 open:bg-neutral-50 dark:open:bg-white/5"
			>
				<summary
					class="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 outline-none select-none"
				>
					<span
						>🍪 {{ t("cookies.cookiesList") }} ({{
							detectedCookies.length
						}})</span
					>
					<svg
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</summary>
				<div
					class="px-4 pb-4 pt-2 border-t border-neutral-200 dark:border-neutral-800"
				>
					<div
						v-if="detectedCookies.length > 0"
						class="overflow-x-auto max-h-40 overflow-y-auto custom-scrollbar"
					>
						<table class="w-full text-left text-xs">
							<tbody
								class="divide-y divide-neutral-200/50 dark:divide-neutral-700/50"
							>
								<tr v-for="c in detectedCookies" :key="c.key">
									<td
										class="py-1.5 pr-4 font-mono font-medium text-neutral-700 dark:text-neutral-300"
									>
										{{ c.key }}
									</td>
									<td
										class="py-1.5 font-mono text-neutral-500 truncate max-w-50"
										:title="c.value"
									>
										{{ c.value }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<p v-else class="text-xs text-neutral-400 italic">
						{{ t("cookies.emptyList") }}
					</p>
				</div>
			</details>
		</div>

		<div
			v-if="noticeScripts.length"
			class="group rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 mt-6"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0 flex-1">
					<div class="flex min-h-6 flex-wrap items-center gap-2">
						<p
							class="text-base font-semibold leading-none text-neutral-900 dark:text-white"
						>
							{{ t("cookies.cookielessTitle") }}
						</p>
					</div>

					<p
						class="mt-1.5 text-sm leading-snug text-neutral-500 dark:text-neutral-400"
					>
						{{ t("cookies.cookielessDesc") }}
					</p>

					<div class="mt-3">
						<details>
							<summary
								class="inline-flex cursor-pointer select-none items-center gap-1 text-xs font-medium text-(--ui-text) opacity-70 transition-opacity hover:opacity-100"
							>
								<span
									>Services used ({{
										noticeScripts.length
									}})</span
								>
								<svg
									class="h-3 w-3 transition-transform group-open:rotate-180"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</summary>

							<div
								class="mt-2 space-y-2 border-l-2 border-neutral-100 pl-3 dark:border-neutral-800"
							>
								<div
									v-for="script in noticeScripts"
									:key="script.id"
									class="text-xs"
								>
									<p
										class="text-xs font-medium text-neutral-700 dark:text-neutral-300"
									>
										{{ t(script.nameKey!) }}
									</p>
									<p
										class="text-xs text-neutral-500 dark:text-neutral-500"
									>
										{{ t(script.descriptionKey!) }}
									</p>
								</div>
							</div>
						</details>
					</div>
				</div>

				<div class="shrink-0">
					<span
						class="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
					>
						Notice
					</span>
				</div>
			</div>
		</div>

		<template #footer>
			<div
				class="flex flex-col-reverse sm:flex-row w-full gap-3 sm:items-center sm:justify-between"
			>
				<button
					@click="handleRejectAll"
					class="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/10"
				>
					{{ t("cookies.declineAll") }}
				</button>

				<div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
					<button
						@click="handleSave"
						class="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border shadow-sm bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 dark:bg-transparent dark:text-white dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:text-black"
					>
						{{ t("cookies.savePrefs") }}
					</button>

					<button
						@click="handleAcceptAll"
						class="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-transform active:scale-95 bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
					>
						{{ t("cookies.acceptAll") }}
					</button>
				</div>
			</div>
		</template>
	</UiModal>
</template>
