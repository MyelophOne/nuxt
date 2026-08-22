import type { CookieScriptsConfig, CookieControlConfig } from '~/types/cookie';

export interface MyelophoneMulti18nConfig {
	defaultLocale: string;
	locales: string[];
}

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

export interface MyelophoneStoresConfig {
	cart: boolean;
	user: boolean;
}

export interface MyelophoneBlogConfig {
	blogEnabled?: boolean;
	postsLayout?: string;
}

export interface MyelophoneTallyConfig {
	domain?: string;
}

export interface MyelophoneConfig {
	siteDomain?: string;
	cookieScripts?: CookieScriptsConfig;
	cookieControl?: CookieControlConfig;
	bundleTranslations?: boolean;
	splitCss?: boolean;
	stores: MyelophoneStoresConfig;
	frankfurterCurrencies: string[];
	frankfurterBaseCurrency: string;
	creativeCursor: boolean;
	siteSearch: SiteSearchConfig;
	pageFullscreenPreloader?: PageFullscreenPreloaderConfig;
	tally?: MyelophoneTallyConfig;
	noindex?: boolean;
	blog?: MyelophoneBlogConfig;
	ssrStream?: boolean;
}

export interface MyelophoneClientConfig extends MyelophoneConfig {
	multi18n: MyelophoneMulti18nConfig;
}

declare global {
	const __MYELOPHONE_CONFIG__: MyelophoneClientConfig;
}

declare module '@nuxt/schema' {
	interface RuntimeConfig {
		myelophone: MyelophoneClientConfig;
	}
	interface NuxtConfig {
		myelophone?: Partial<MyelophoneConfig>;
	}
	interface NuxtOptions {
		myelophone?: MyelophoneConfig;
	}
}

export {};
