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
			pageFullscreenPreloader: {
				component: 'DemoPreloaderLogo',
				props: {
					label: 'MyelophOne',
				},
				background: '#f7f7f7',
				backgroundDark: '#121212',
				minimumDuration: 250,
				ariaLabel: 'Loading MyelophOne site',
			},
		},
	},
});
