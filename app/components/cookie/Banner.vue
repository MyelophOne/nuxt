<script setup lang="ts">
const { isBannerVisible, acceptAll } = useCookieControl();
const emit = defineEmits(["settings"]);
const { open } = useCookieModal();

const handleSettings = () => {
	emit("settings");
	open();
};

const { t } = useMultiLang(["cookies"]);
</script>

<template>
	<Transition
		appear
		enter-active-class="transition duration-500 ease-out delay-300"
		enter-from-class="translate-y-full opacity-0"
		enter-to-class="translate-y-0 opacity-100"
		leave-active-class="transition duration-300 ease-in"
		leave-from-class="translate-y-0 opacity-100"
		leave-to-class="translate-y-full opacity-0"
	>
		<div
			v-if="isBannerVisible"
			class="fixed bottom-4 left-4 right-4 z-60 md:right-auto md:left-6 md:bottom-6 max-w-100 mx-auto md:m-0"
			data-nosnippet
		>
			<div
				class="relative flex flex-col gap-4 p-4 w-full md:w-auto md:max-w-82.5 rounded-xl border border-neutral-200/80 bg-white/90 shadow-xl backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90"
			>
				<div class="flex gap-3">
					<span class="text-xl leading-none mt-0.5 select-none"
						>🍪</span
					>
					<p
						class="text-sm font-medium leading-snug text-neutral-600 dark:text-neutral-300"
					>
						{{ t("cookies.weUseCookies") }}
					</p>
				</div>

				<div class="flex flex-col gap-2">
					<div class="grid grid-cols-2 gap-2">
						<button
							@click="handleSettings"
							class="flex items-center justify-center px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-lg transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
						>
							{{ t("cookies.decline") }}
						</button>

						<button
							@click="acceptAll"
							class="flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg shadow-sm transition-all hover:bg-neutral-800 hover:shadow dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
						>
							{{ t("cookies.acceptAll") }}
						</button>
					</div>

					<button
						@click="handleSettings"
						class="w-full text-center text-xs text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
					>
						{{ t("cookies.changePrefs") }}
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>
