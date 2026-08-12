<script setup lang="ts">
import type {
	CookieCategory,
	CookieScriptDef,
	CookieScriptsConfig,
} from "~/types/cookie";

type PolicyCategory = CookieCategory | "notices";

const props = withDefaults(
	defineProps<{
		title?: string;
		showSources?: boolean;
	}>(),
	{
		title: "Cookies and Similar Technologies",
		showSources: true,
	},
);

const { t } = useMultiLang(["cookies"]);
const runtimeConfig = useRuntimeConfig();

const cookieScripts = computed(
	() => (runtimeConfig.public.cookieScripts || {}) as CookieScriptsConfig,
);

const categories = computed<
	Array<{
		key: PolicyCategory;
		title: string;
		description: string;
		scripts: CookieScriptDef[];
	}>
>(() =>
	[
		{
			key: "notices" as const,
			title: t("cookies.cookielessTitle"),
			description: t("cookies.cookielessDesc"),
		},
		{
			key: "necessary" as const,
			title: t("cookies.necessaryTitle"),
			description: t("cookies.necessaryDesc"),
		},
		{
			key: "analytics" as const,
			title: t("cookies.analyticsTitle"),
			description: t("cookies.analyticsDesc"),
		},
		{
			key: "marketing" as const,
			title: t("cookies.marketingTitle"),
			description: t("cookies.marketingDesc"),
		},
		{
			key: "functional" as const,
			title: t("cookies.functionalTitle"),
			description: t("cookies.functionalDesc"),
		},
	]
		.map((category) => ({
			...category,
			scripts: cookieScripts.value[category.key] || [],
		}))
		.filter((category) => category.scripts.length),
);

const scriptName = (script: CookieScriptDef) => t(script.nameKey!);
const scriptDescription = (script: CookieScriptDef) =>
	t(script.descriptionKey!);
const legalPurpose = (script: CookieScriptDef) =>
	script.legal?.purposeKey ? t(script.legal.purposeKey) : "";
const cookiesDescription = (script: CookieScriptDef) =>
	script.legal?.cookiesDescriptionKey
		? t(script.legal.cookiesDescriptionKey)
		: "";
const legalNotes = (script: CookieScriptDef) =>
	script.legal?.notesKey ? t(script.legal.notesKey) : "";
</script>

<template>
	<section
		class="max-w-3xl text-sm leading-7 text-neutral-700 dark:text-neutral-300"
	>
		<h2
			class="text-xl font-semibold tracking-normal text-neutral-950 dark:text-white"
		>
			{{ props.title }}
		</h2>

		<p class="mt-3">
			{{ t("cookies.cookieNote") }}
		</p>

		<div class="mt-6 space-y-6">
			<section v-for="category in categories" :key="category.key">
				<h3
					class="text-base font-semibold text-neutral-950 dark:text-white"
				>
					{{ category.title }}
				</h3>

				<p class="mt-1 text-neutral-600 dark:text-neutral-400">
					{{ category.description }}
				</p>

				<ul class="mt-3 space-y-3">
					<li
						v-for="script in category.scripts"
						:key="`${category.key}-${script.id}-${script.loadKey || script.src || 'inline'}`"
						class="border-l border-neutral-200 dark:border-neutral-800"
					>
						<p class="font-medium text-neutral-900 dark:text-white">
							{{ scriptName(script) }}
						</p>

						<p
							class="mt-0.5 text-neutral-600 dark:text-neutral-400"
						>
							{{ scriptDescription(script) }}
						</p>

						<p
							v-if="legalPurpose(script)"
							class="mt-1 text-neutral-600 dark:text-neutral-400"
						>
							{{ legalPurpose(script) }}
						</p>

						<p
							v-if="cookiesDescription(script)"
							class="mt-1 text-neutral-600 dark:text-neutral-400"
						>
							{{ cookiesDescription(script) }}
						</p>

						<p
							v-if="legalNotes(script)"
							class="mt-1 text-neutral-600 dark:text-neutral-400"
						>
							{{ legalNotes(script) }}
						</p>

						<p
							v-if="
								showSources &&
								(script.legal?.privacyPolicyUrl ||
									script.legal?.officialDocsUrl)
							"
							class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs"
						>
							<a
								v-if="script.legal?.privacyPolicyUrl"
								:href="script.legal.privacyPolicyUrl"
								rel="noopener noreferrer"
								target="_blank"
								class="font-medium text-neutral-900 underline underline-offset-2 dark:text-white"
							>
								Privacy policy
							</a>
							<a
								v-if="script.legal?.officialDocsUrl"
								:href="script.legal.officialDocsUrl"
								rel="noopener noreferrer"
								target="_blank"
								class="font-medium text-neutral-900 underline underline-offset-2 dark:text-white"
							>
								Official documentation
							</a>
						</p>
					</li>
				</ul>
			</section>
		</div>
	</section>
</template>
