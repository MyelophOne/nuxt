import { defineNuxtModule, extendViteConfig, useLogger } from '@nuxt/kit';

import type {
	MyelophoneClientConfig,
	MyelophoneConfig,
	MyelophoneMulti18nConfig,
} from '~/types/myelophone';

const isSSG = process.env.NUXT_STATIC === 'true';
const isSSRStreaming = process.env.NUXT_SSR_STREAMING === 'true';

const setSSRStreaming = (
	experimental: Record<string, any>,
	enabled: boolean,
) => {
	const current = experimental.ssrStreaming;

	experimental.ssrStreaming = {
		...(current && typeof current === 'object' ? current : {}),
		enabled,
	};
};

const enableDefaultRouteStreaming = (routeRules: Record<string, any>) => {
	const current = routeRules['/**'];

	routeRules['/**'] = {
		...(current && typeof current === 'object' ? current : {}),
		streaming:
			current && typeof current === 'object' && 'streaming' in current
				? current.streaming
				: true,
	};
};

const defaultCookieScripts = {
	necessary: [],
	analytics: [],
	marketing: [],
	functional: [],
};

export const defaultMyelophoneConfig: MyelophoneConfig = {
	siteDomain: 'http://localhost:3000',
	cookieScripts: defaultCookieScripts,
	cookieControl: {
		enabled: true,
	},
	bundleTranslations: true,
	splitCss: false,
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
	tally: {
		domain: 'tally.so',
	},
	noindex: false,
	blog: {
		blogEnabled: true,
		postsLayout: 'default-blog',
	},
	ssrStream: false,
};

const resolveMyelophoneConfig = (
	config?: Partial<MyelophoneConfig>,
): MyelophoneConfig => ({
	...defaultMyelophoneConfig,
	...config,
	cookieScripts:
		config?.cookieScripts ?? defaultMyelophoneConfig.cookieScripts,
	cookieControl: {
		...defaultMyelophoneConfig.cookieControl,
		...config?.cookieControl,
		enabled:
			config?.cookieControl?.enabled ??
			defaultMyelophoneConfig.cookieControl?.enabled ??
			true,
	},
	stores: {
		...defaultMyelophoneConfig.stores,
		...config?.stores,
	},
	siteSearch: {
		...defaultMyelophoneConfig.siteSearch,
		...config?.siteSearch,
	},
	pageFullscreenPreloader:
		config?.pageFullscreenPreloader ??
		defaultMyelophoneConfig.pageFullscreenPreloader,
	tally: {
		...defaultMyelophoneConfig.tally,
		...config?.tally,
	},
	blog: {
		...defaultMyelophoneConfig.blog,
		...config?.blog,
	},
});

const resolveMulti18nConfig = (config: unknown): MyelophoneMulti18nConfig => {
	const value = (config || {}) as Partial<MyelophoneMulti18nConfig>;
	const defaultLocale = value.defaultLocale || 'en';
	const locales = [
		...new Set(value.locales?.length ? value.locales : ['en']),
	];

	return {
		defaultLocale,
		locales,
	};
};

const resolveClientConfig = (
	config: Partial<MyelophoneConfig>,
	multi18n: unknown,
): MyelophoneClientConfig => ({
	...resolveMyelophoneConfig(config),
	multi18n: resolveMulti18nConfig(multi18n),
});

export default defineNuxtModule<MyelophoneConfig>({
	meta: {
		name: '@myelophone/nuxt-config',
		configKey: 'myelophone',
		compatibility: { nuxt: '^4.0.0' },
	},

	defaults: defaultMyelophoneConfig,

	setup(options, nuxt) {
		const head = nuxt.options.app.head as Record<string, unknown>;
		const staticTitle = head.title;
		if (typeof staticTitle === 'string') {
			const appConfig = nuxt.options.appConfig as Record<string, unknown>;
			const defaultSeo =
				(appConfig.defaultSeo as Record<string, unknown> | undefined) ||
				{};
			nuxt.options.appConfig = {
				...appConfig,
				defaultSeo: {
					...defaultSeo,
					title:
						typeof defaultSeo.title === 'string'
							? defaultSeo.title
							: staticTitle,
				},
			} as typeof nuxt.options.appConfig;
			delete head.title;
		}

		const logger = useLogger('@myelophone/nuxt');
		const myelophone = resolveClientConfig(options, nuxt.options.multi18n);
		const isStreamingSSR =
			!isSSG && (isSSRStreaming || myelophone.ssrStream === true);

		nuxt.options.myelophone = myelophone;
		nuxt.options.runtimeConfig.myelophone = myelophone;

		setSSRStreaming(nuxt.options.experimental, isStreamingSSR);

		if (isStreamingSSR) {
			nuxt.options.routeRules ||= {};
			enableDefaultRouteStreaming(nuxt.options.routeRules);
		}

		nuxt.hook('build:before', () => {
			logger.info(
				'Thank You for using @MyelophOne/nuxt. With ❤️  from @aleksivanou (aleksivanov.me)',
			);
			if (isStreamingSSR) {
				logger.info('Building with Nuxt streaming SSR enabled.');
			}
		});

		nuxt.hook('nitro:config', (nitroConfig) => {
			nitroConfig.runtimeConfig ||= {};
			nitroConfig.runtimeConfig.myelophone = myelophone;

			if (isStreamingSSR) {
				nitroConfig.routeRules ||= {};
				enableDefaultRouteStreaming(nitroConfig.routeRules);
			}
		});

		nuxt.hook('modules:done', () => {
			const config = nuxt.options.runtimeConfig;
			config.myelophone = myelophone;

			const keysToRemove = ['nuxt-seo-utils-version'];

			keysToRemove.forEach((key) => {
				if (config.public && key in config.public) {
					delete config.public[key];
				}
			});

			const objectsToRemoveVersion = ['nuxt-scripts', 'nuxt-robots'];

			objectsToRemoveVersion.forEach((objKey) => {
				if (
					config.public &&
					objKey in config.public &&
					config.public[objKey]
				) {
					const target = config.public[objKey];
					delete target['version' as keyof typeof target];
				}
			});
		});

		extendViteConfig((config) => {
			config.build = config.build || {};
			config.build.cssCodeSplit = myelophone.splitCss === true;
			config.define = {
				...config.define,
				__MYELOPHONE_CONFIG__: JSON.stringify(myelophone).replace(
					/</g,
					'\\u003C',
				),
			};
		});
	},
});
