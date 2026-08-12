import { type Pinia } from 'pinia';

export default defineNuxtPlugin(() => {
	const pinia = useNuxtApp().$pinia as Pinia;
	const settingsStore = useSettingsStore(pinia);
	const route = useRoute();

	watch(
		() => route.path,
		(path) => {
			const seg = path.split('/').filter(Boolean)[0];

			if (seg && settingsStore.locales.includes(seg)) {
				settingsStore.currentLocale = seg;
			} else {
				settingsStore.currentLocale = settingsStore.defaultLocale;
			}
		},
		{ immediate: true },
	);
});
