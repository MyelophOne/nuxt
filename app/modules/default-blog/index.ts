import type { NuxtPage } from '@nuxt/schema';
import { defineNuxtModule, extendPages } from '@nuxt/kit';

export default defineNuxtModule({
	meta: {
		name: 'default-blog',
	},

	setup(_options, nuxt) {
		extendPages((pages) => {
			const blogEnabled =
				nuxt.options.myelophone?.blog?.blogEnabled ?? true;

			processPages(pages, blogEnabled);
		});
	},
});

function processPages(pages: NuxtPage[], blogEnabled: boolean) {
	for (let i = pages.length - 1; i >= 0; i--) {
		const page = pages[i]!;

		if (page.file?.endsWith('/post/[...slug].vue')) {
			if (!blogEnabled) {
				pages.splice(i, 1);
				continue;
			}

			page.meta ||= {};
			page.meta.middleware = ['blog-layout'];

			continue;
		}

		if (page.children?.length) {
			processPages(page.children, blogEnabled);
		}
	}
}
