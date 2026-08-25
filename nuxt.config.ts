import pkg from './package.json';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multi18n from './app/modules/multi18n/module';
import myelophoneConfig from './app/modules/myelophone-config/module';
import i18nTreeShaker from './app/modules/i18n-shaker.mjs';
import nuxtHtaccess from './app/modules/htaccess';
import fullscreenPreloader from './app/modules/fullscreen-preloader/module';
import defaultBlog from './app/modules/default-blog';
import defaultSitemap from './app/modules/default-sitemap';

import { cleanEmptyCssPlugin } from './vite/plugins/clean-css';
import postcssViewportFallback from './vite/plugins/postcss-viewport-fallback';
import noImportant from 'postcss-no-important';
import postcssAddViewportUnits from './vite/plugins/postcss-add-viewportunits';

import tailwindcss from '@tailwindcss/vite';

import { createResolver, useNuxt, extendViteConfig } from '@nuxt/kit';

const version = pkg.version;
const dateActuality = '2026-08-25';
const banner = `/* © 2025 Aliaksandr Ivanou (https://aleksivanov.me/). All rights reserved. @MyelophOne/Nuxt v${version}. This app bundle licenses: /_nuxt/licenses.md */\n`;
const defaultSeo = {
	title: 'Our Nuxt WebSite | by MyelophOne/Nuxt',
	description:
		'Welcome to our new amazing website where you can explore exciting content and features! Empowered by MyelophOne',
};

const isSSG = process.env.NUXT_STATIC === 'true';
const isPlayground = process.env.NUXT_PLAYGROUND === 'true';

const moreModules: string[] = [];
const { resolve } = createResolver(import.meta.url);
const serverScanDirs = [
	resolve('./app/server'),
	resolve('./server'),
	path.resolve(process.cwd(), 'app/server'),
	path.resolve(process.cwd(), 'server'),
].filter((dir, index, dirs) => dirs.indexOf(dir) === index);
const i18nScanDirs = [
	resolve('./app'),
	path.resolve(process.cwd(), 'app'),
	...(isPlayground ? [path.resolve(process.cwd(), 'playground')] : []),
];

export default defineNuxtConfig({
	compatibilityDate: dateActuality,
	alias: {
		'#myelophone-nuxt-locales': resolve('./app/locales'),
		'#myelophone': resolve('./'),
	},
	modules: [
		'@pinia/nuxt',
		'@pinia/colada-nuxt',
		'@nuxtjs/robots',
		'nuxt-link-checker',
		'nuxt-seo-utils',
		'nuxt-og-image',
		'@nuxtjs/fontaine',
		'@nuxt/scripts',
		'@nuxt/image',
		'@nuxt/fonts',
		'nuxt-security',
		'nuxt-api-party',
		'vue-sonner/nuxt',
		'nuxt-vitalizer',
		...moreModules,
		myelophoneConfig,
		multi18n,
		nuxtHtaccess,
		fullscreenPreloader,
		defaultBlog,
		defaultSitemap,
	],
	features: {
		inlineStyles: false,
	},
	future: {
		compatibilityVersion: 5,
	},
	experimental: {
		writeEarlyHints: true,
		entryImportMap: false,
		restoreState: true,
		viewTransition: true,
		componentIslands: true,
		clientFallback: true,
		typedPages: true,
		payloadExtraction: isSSG ? false : 'client',
		nitroAutoImports: true,
		prefetchPreloadTags: true,
		watcher: 'builder',
		viteEnvironmentApi: false,
	},
	devtools: { enabled: process.env.NODE_ENV === 'development' },
	app: {
		head: {
			meta: [
				{
					name: 'viewport',
					content:
						'width=device-width, initial-scale=1, viewport-fit=cover',
				},
			],
			htmlAttrs: {
				class: 'nojs',
				dir: 'ltr',
			},
			script: [
				{
					innerHTML: `!function(){try{let e={light:"light",dark:"dark"},t=window?.localStorage?.getItem("theme")||"",a=window.matchMedia("(prefers-color-scheme: dark)"),c=Object.values(e).includes(t)?t:a.matches?e.dark:e.light;document.documentElement.setAttribute("data-theme",c)}catch(l){}}();document.documentElement.classList.replace('nojs', 'js')`,
					tagPosition: 'head',
				},
			],
		},
	},
	appConfig: {
		defaultSeo,
	},
	ogImage: {
		enabled: process.env.NODE_ENV !== 'test',
		zeroRuntime: true,
	},
	nitro: {
		scanDirs: serverScanDirs,
		preset: isSSG ? 'static' : process.env.NITRO_PRESET || 'node-cluster',
		compressPublicAssets: true,
		externals: {
			inline: ['h3', '@vue/shared'],
		},
		experimental: {
			tasks: true,
			database: true,
		},
		storage: {},
		devStorage: {},
		database: {},
		prerender: isSSG
			? {
					failOnError: false,
					crawlLinks: true,
					ignore: [
						(path: string) => path.match(/\.(js|css|map|json)$/),
					],
				}
			: undefined,
	},
	vite: {
		clearScreen: false,
		build: {
			cssMinify: 'esbuild',
			sourcemap: process.env.NODE_ENV === 'development',
			assetsInlineLimit: 4096,
			license: {
				fileName: '_nuxt/licenses.md',
			},
			rolldownOptions: {
				treeshake: {
					manualPureFunctions: [
						'console.log',
						'console.error',
						'console.debug',
						'console.trace',
					],
				},
			},
		},
		css: {
			devSourcemap: true,
		},
		plugins: [
			tailwindcss(),
			{
				name: 'suppress-plugin-timings-warning',
				configResolved(config) {
					const originalLogger = config.logger.warn;

					config.logger.warn = (msg, options) => {
						if (
							typeof msg === 'string' &&
							msg.includes('[PLUGIN_TIMINGS]')
						) {
							return;
						}

						originalLogger(msg, options);
					};
				},
			},
			{
				apply: 'build',
				name: 'vite-plugin-ignore-sourcemap-warnings',
				configResolved(config) {
					const options = config.build.rolldownOptions;
					if (!options) return;

					const originalOnLog = options.onLog;

					options.onLog = (level, log, defaultHandler) => {
						if (log.code === 'SOURCEMAP_BROKEN') {
							return;
						}

						if (originalOnLog) {
							originalOnLog(level, log, defaultHandler);
						} else {
							defaultHandler(level, log);
						}
					};
				},
			},
			{
				name: 'nuxt-add-banner',
				generateBundle(_, bundle) {
					for (const file of Object.values(bundle)) {
						if (file.type === 'chunk') {
							if (
								file.fileName.endsWith('.js') &&
								'code' in file
							) {
								file.code = banner + file.code;
							}
						} else if (file.type === 'asset') {
							if (
								file.fileName.endsWith('.css') &&
								'source' in file
							) {
								file.source = banner + file.source;
							}
						}
					}
				},
			},
			(i18nTreeShaker as any)({
				localesDir: 'locales',
				safelistPath: './i18n-safelist.json',
				scanDirs: i18nScanDirs,
			}),
			cleanEmptyCssPlugin({
				purgeTailwindUtilities: true,
				postcssPlugins: [
					postcssViewportFallback(),
					noImportant(),
					postcssAddViewportUnits(),
				],
			}),
		],
		server: {
			fs: {
				strict: false,
			},
		},
		optimizeDeps: {
			exclude: ['vue'],
			include: ['@vue/devtools-core', '@vue/devtools-kit'],
		},
	},
	security: {
		strict: true,
		removeLoggers: false,
		sri: false,
		hidePoweredBy: true,
		headers: {
			contentSecurityPolicy: {
				'default-src': ["'self'"],
				'base-uri': ["'none'"],
				'connect-src': ["'self'", 'https:'],
				'font-src': ["'self'", 'https:', 'data:'],
				'form-action': ["'self'"],
				'frame-ancestors': ["'self'"],
				'img-src': ["'self'", 'data:', 'blob:', 'https:'],
				'media-src': ["'self'", 'https:', 'blob:'],
				'object-src': ["'none'"],
				'worker-src': ["'self'", 'blob:'],
				'style-src': ["'self'", 'https:', "'unsafe-inline'"],
				'script-src': ["'nonce-{{nonce}}'", "'strict-dynamic'"],
				'script-src-attr': ["'none'"],
				'frame-src': ["'self'", 'https:'],
				'upgrade-insecure-requests': true,
			},
			originAgentCluster: '?1',
			referrerPolicy: 'strict-origin-when-cross-origin',
			xXSSProtection: '1',
			strictTransportSecurity: {
				maxAge: 31536000,
				includeSubdomains: true,
				preload: true,
			},
			crossOriginResourcePolicy: 'same-origin',
			crossOriginOpenerPolicy: 'same-origin',
			crossOriginEmbedderPolicy: 'unsafe-none',
			xContentTypeOptions: 'nosniff',
			xDNSPrefetchControl: 'on',
			xDownloadOptions: 'noopen',
			xFrameOptions: 'SAMEORIGIN',
			xPermittedCrossDomainPolicies: 'none',
			permissionsPolicy: {
				'picture-in-picture': ['self', '*'],
				fullscreen: ['self', '*'],
				autoplay: ['self', '*'],
				geolocation: ['self'],
				camera: ['self'],
				microphone: ['self'],
				payment: ['self'],
			},
		},
		requestSizeLimiter: {
			maxRequestSizeInBytes: 2000000,
			maxUploadFileRequestInBytes: 10485760,
			throwError: true,
		},
		rateLimiter: {
			tokensPerInterval: 150,
			interval: 300000,
			headers: true,
			driver: {
				name: 'lruCache',
			},
			throwError: true,
		},
		corsHandler: {
			origin: '*',
			methods: [
				'GET',
				'HEAD',
				'PUT',
				'PATCH',
				'POST',
				'DELETE',
				'OPTIONS',
			],
			preflight: {
				statusCode: 204,
			},
		},
		allowedMethodsRestricter: {
			methods: [
				'GET',
				'POST',
				'PUT',
				'DELETE',
				'PATCH',
				'HEAD',
				'OPTIONS',
			],
			throwError: true,
		},
		basicAuth: false,
		enabled: true,
		csrf: false,
		nonce: true,
		ssg: {
			meta: false,
			hashScripts: false,
			hashStyles: false,
			nitroHeaders: false,
			exportToPresets: true,
		},
	},
	image: {
		domains: ['img.youtube.com', 'i.vimeocdn.com'],
		alias: {
			youtube: 'https://img.youtube.com',
			vimeo: 'https://i.vimeocdn.com',
		},
		provider: isSSG ? 'none' : 'ipx',
		ipx: {
			maxAge: 31536000,
		},
	},
	robots: {
		blockNonSeoBots: true,
	},
	apiParty: {
		endpoints: {
			jsonPlaceholder: {
				url:
					process.env.JSON_PLACEHOLDER_API_BASE_URL! ||
					'https://jsonplaceholder.typicode.com',
			},
		},
	},
	imports: {
		dirs: ['stores', 'constants'],
	},
	serverDir: 'app/server',
	routeRules: {
		'/_nuxt/**': {
			headers: {
				'cache-control': 'public, max-age=31536000, immutable',
			},
		},
		'/_ipx/**': { swr: false },
	},
	seo: {
		automaticDefaults: false,
	},
	multi18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
	sourcemap: {
		server: true,
		client: process.env.NODE_ENV === 'development',
	},
	vueSonner: {
		css: false,
	},
	hooks: {
		'nitro:config'(nitroConfig) {
			if (process.platform !== 'win32') {
				return;
			}

			nitroConfig.rollupConfig ||= {};
			const resolver = {
				name: 'resolve-nuxt-cache-driver-file-url',
				resolveId(source: string) {
					if (
						source.startsWith('file:') &&
						source.endsWith('/runtime/utils/cache-driver.mjs')
					) {
						return fileURLToPath(source);
					}
				},
			};
			const plugins = nitroConfig.rollupConfig.plugins;

			nitroConfig.rollupConfig.plugins = plugins
				? Array.isArray(plugins)
					? [...plugins, resolver]
					: [plugins, resolver]
				: [resolver];
		},
		'build:manifest': (manifest) => {
			for (const key in manifest) {
				const item = manifest[key];
				if (item) {
					if (key.includes('entry')) {
						item.preload = true;
					} else {
						item.preload = false;
					}
				}
			}
		},
		'modules:done'() {
			const nuxt = useNuxt();
			const bundleTranslations =
				nuxt.options.myelophone?.bundleTranslations ?? true;

			extendViteConfig((config) => {
				const output = config.build?.rolldownOptions?.output;

				if (
					output &&
					typeof output === 'object' &&
					!Array.isArray(output)
				) {
					output.codeSplitting = {
						groups: [
							{
								name(id: string): string | null {
									if (id.includes('vue-sonner')) {
										return 'sonner';
									}

									if (bundleTranslations) return null;

									const cleanId =
										id.split('?')[0]?.replace(/\\/g, '/') ||
										'';

									if (
										cleanId.includes('/locales/') &&
										cleanId.endsWith('.json')
									) {
										const shouldSkip =
											cleanId.includes('/playground/') ||
											cleanId.includes('/admin/') ||
											cleanId.includes('/split/') ||
											cleanId.endsWith('admin.json') ||
											cleanId.endsWith('split.json');

										if (shouldSkip) return null;

										const parts =
											cleanId.split('/locales/');
										const afterLocales = parts[1];

										if (afterLocales) {
											const lang =
												afterLocales.split('/')[0];
											if (lang) {
												return `i18n-${lang}`;
											}
										}
									}

									return null;
								},
							},
						],
					};

					output.assetFileNames = (assetInfo) => {
						const isCss = assetInfo.names?.some((name) =>
							name.endsWith('.css'),
						);

						if (isCss) {
							return '_nuxt/[hash][extname]';
						}
						return '_nuxt/[name].[hash][extname]';
					};
				}
			});
		},
	},
});
