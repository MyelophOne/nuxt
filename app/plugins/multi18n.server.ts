import { type Pinia } from 'pinia';

export default defineNuxtPlugin(() => {
	const pinia = useNuxtApp().$pinia as Pinia;
	const settingsStore = useSettingsStore(pinia);
	const route = useRoute();
	const segments = route.path.split('/').filter(Boolean);
	const maybeLang = segments[0];

	if (maybeLang && settingsStore.locales.includes(maybeLang)) {
		settingsStore.currentLocale = maybeLang;
	} else {
		settingsStore.currentLocale = settingsStore.defaultLocale;
	}
});
