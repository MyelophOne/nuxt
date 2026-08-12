import type { CookieScriptsConfig, CookieControlConfig } from '~/types/cookie';

declare module '@nuxt/schema' {
	interface RuntimeConfig {}
	interface PublicRuntimeConfig {
		cookieScripts?: CookieScriptsConfig;
		cookieControl?: CookieControlConfig;
		bundleTranslations?: boolean;
		splitCss?: boolean;
		stores: {
			cart: boolean;
			user: boolean;
		};
		frankfurterCurrencies: string[];
		frankfurterBaseCurrency: string;
		creativeCursor: boolean;
		tally?: {
			domain?: string;
		};
	}
}

export {};
