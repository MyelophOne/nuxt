import { type Pinia } from 'pinia';

export default defineNuxtPlugin((nuxtApp) => {
	const router = useRouter();

	const pinia = useNuxtApp().$pinia as Pinia;
	const settingsStore = useSettingsStore(pinia);

	nuxtApp.hook('app:beforeMount', () => {
		settingsStore.loadTheme();
	});

	nuxtApp.hook('page:start', () => {
		settingsStore.setIsLoading(true);
	});

	nuxtApp.hook('page:finish', () => {
		settingsStore.setIsLoading(false);
	});

	router.beforeEach((to) => {
		let path = to.path;

		path = path
			.replace(/[<>{}|\\^`]/g, '')
			.replace(/\/+/g, '/')
			.replace(/\.\.\//g, '')
			.replace(/\.\./g, '');

		try {
			path = encodeURI(decodeURI(path));
		} catch (_) {}

		if (path.length > 1 && path.endsWith('/')) {
			path = path.replace(/\/+$/, '');
		}

		path = path.toLowerCase();

		if (path !== to.path) {
			return router.replace({
				path,
				query: to.query,
				hash: to.hash,
			});
		}

		if (location.hostname.startsWith('www.')) {
			const nonWwwHost = location.hostname.replace(/^www\./, '');
			const newUrl = `${location.protocol}//${nonWwwHost}${location.pathname}${location.search}${location.hash}`;
			return location.replace(newUrl);
		}

		const isLocalhost =
			location.hostname === 'localhost' ||
			location.hostname.startsWith('127.') ||
			location.hostname.startsWith('192.168.') ||
			location.hostname === '[::1]' ||
			/^\d+\.\d+\.\d+\.\d+$/.test(location.hostname);

		if (location.protocol === 'http:' && !isLocalhost) {
			const httpsUrl = `https://${location.host}${location.pathname}${location.search}${location.hash}`;
			return location.replace(httpsUrl);
		}
	});
});
