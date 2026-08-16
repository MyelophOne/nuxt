import type { CookieScriptsConfig, CookieControlConfig } from '~/types/cookie';

export interface PageFullscreenPreloaderConfig {
	component: string;
	props?: Record<string, unknown>;
	transparent?: boolean;
	background?: string;
	backgroundDark?: string;
	zIndex?: number | string;
	ariaLabel?: string;
	class?: string;
	contentClass?: string;
	minimumDuration?: number;
}

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
		pageFullscreenPreloader?: PageFullscreenPreloaderConfig;
		tally?: {
			domain?: string;
		};
	}
}

export {};
