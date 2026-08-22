export default defineNuxtConfig({
	app: {
		head: {
			title: 'Myelophone Nuxt Playground',
		},
	},
	myelophone: {
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
		siteSearch: {
			strategy: 'client',
			endpoint: '',
			minQueryLength: 2,
			limit: 10,
			operator: 'and',
			queryParam: 'search',
			modeParam: 'searchMode',
			operatorParam: 'searchOperator',
			urlMode: 'search',
			consumeUrl: false,
			enabled: true,
		},
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
		ssrStream: false,
	},
});
