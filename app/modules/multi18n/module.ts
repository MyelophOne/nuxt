import {
	defineNuxtModule,
	createResolver,
	addComponentsDir,
	addImportsDir,
} from 'nuxt/kit';

export interface MyelophoneNuxtModuleOptions {
	defaultLocale: string;
	locales: string[];
}

export default defineNuxtModule<MyelophoneNuxtModuleOptions>({
	meta: {
		name: 'multi18n-module',
		configKey: 'multi18n',
		compatibility: { nuxt: '^4.0.0' },
	},

	defaults: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	async setup(options, nuxt) {
		const localOptions = { ...options };
		const { resolve } = createResolver(import.meta.url);

		nuxt.options.runtimeConfig.public.multi18n = {
			defaultLocale: options.defaultLocale,
			locales: [...new Set(options.locales)],
		};

		nuxt.hooks.hook('pages:extend', (pages) => {
			const { locales, defaultLocale } = localOptions;
			const otherLocales = locales.filter((l) => l !== defaultLocale);

			const newPages = [];
			const existingPaths = new Set(pages.map((p) => p.path));

			for (const page of pages) {
				if (page.meta?.i18n === false) continue;

				if (page.file?.includes('[...all]')) continue;

				for (const lang of otherLocales) {
					if (page.path === '/' && lang === defaultLocale) continue;

					const localizedPath =
						page.path === '/' ? `/${lang}` : `/${lang}${page.path}`;

					if (existingPaths.has(localizedPath)) continue;
					existingPaths.add(localizedPath);

					newPages.push({
						...page,
						path: localizedPath,
						file: page.file,
						name: `${lang}-${page.name || page.path.replace(/\W+/g, '_')}`,
						aliasOf: page.path,
					});
				}
			}

			pages.push(...newPages);
		});

		addComponentsDir({
			path: resolve('runtime/components'),
			pathPrefix: false,
		});
		addImportsDir(resolve('runtime/composables'));
		addImportsDir(resolve('runtime/utils'));
		addImportsDir(resolve('runtime/stores'));
	},
});
