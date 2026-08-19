import type { CookieScriptsConfig, CookieControlConfig } from '~/types/cookie';

export interface PageFullscreenPreloaderConfig {
	component?: string;
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

export interface SiteSearchConfig {
	strategy?: string;
	endpoint?: string;
	minQueryLength?: number;
	limit?: number;
	operator?: string;
	queryParam?: string;
	modeParam?: string;
	operatorParam?: string;
	urlMode?: string;
	consumeUrl?: boolean;
	enabled?: boolean;
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
		siteSearch: SiteSearchConfig;
		pageFullscreenPreloader?: PageFullscreenPreloaderConfig;
		tally?: {
			domain?: string;
		};
		noindex?: boolean;
	}
}

export {};
