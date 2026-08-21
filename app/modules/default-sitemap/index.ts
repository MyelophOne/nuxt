import type { NuxtPage } from '@nuxt/schema';

import {
	addPrerenderRoutes,
	addServerHandler,
	addServerTemplate,
	createResolver,
	defineNuxtModule,
} from '@nuxt/kit';

import { getBlogPostUrls } from '../default-blog/posts';

export default defineNuxtModule({
	meta: {
		name: 'default-sitemap',
	},

	async setup(_options, nuxt) {
		const { resolve } = createResolver(import.meta.url);

		const pageUrls = new Set<string>();
		const postUrls = new Set<string>();

		const blogEnabled =
			nuxt.options.runtimeConfig.public.blog?.blogEnabled ?? false;

		if (blogEnabled) {
			const urls = await getBlogPostUrls(nuxt);

			for (const url of urls) {
				postUrls.add(url);
			}

			addPrerenderRoutes(urls);
		}

		nuxt.hook('pages:resolved', (pages) => {
			collectStaticPages(pages, pageUrls);
		});

		addServerTemplate({
			filename: '#default-sitemap/urls.mjs',

			getContents() {
				const finalUrls = new Set<string>();

				for (const url of pageUrls) {
					finalUrls.add(url);
				}

				for (const url of postUrls) {
					finalUrls.add(url);
				}

				const urls = [...finalUrls].sort();

				return `export default ${JSON.stringify(urls)};`;
			},
		});

		addServerHandler({
			route: '/sitemap.xml',
			method: 'get',
			handler: resolve('./runtime/sitemap.get'),
		});

		addPrerenderRoutes('/sitemap.xml');
	},
});

function collectStaticPages(
	pages: NuxtPage[],
	urls: Set<string>,
	parentPath = '',
) {
	for (const page of pages) {
		const path = resolvePagePath(parentPath, page.path);

		if (isStaticPage(path)) {
			urls.add(path);
		}

		if (page.children?.length) {
			collectStaticPages(page.children, urls, path);
		}
	}
}

function isStaticPage(path: string): boolean {
	if (!path) {
		return false;
	}

	if (path.includes(':') || path.includes('*')) {
		return false;
	}

	return true;
}

function resolvePagePath(parent: string, child: string): string {
	if (child.startsWith('/')) {
		return normalizePath(child);
	}

	if (!parent) {
		return normalizePath(`/${child}`);
	}

	return normalizePath(`${parent}/${child}`);
}

function normalizePath(path: string): string {
	const normalized = path.replace(/\/+/g, '/').replace(/\/$/, '');

	return normalized || '/';
}
