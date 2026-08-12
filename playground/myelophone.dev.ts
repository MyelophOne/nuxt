export default defineNuxtConfig({
	app: {
		head: {
			title: 'Myelophone Nuxt Playground',
		},
	},
	runtimeConfig: {
		public: {
			cookieControl: {
				enabled: true,
			},
			bundleTranslations: true,
			splitCss: true,
			stores: {
				cart: false,
				user: false,
			},
			frankfurterCurrencies: [],
			frankfurterBaseCurrency: 'USD',
			creativeCursor: false,
		},
	},
});
