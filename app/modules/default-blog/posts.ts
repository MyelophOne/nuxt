import { readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

import type { Nuxt } from '@nuxt/schema';

const defaultContentDir = fileURLToPath(
	new URL('../../content', import.meta.url),
);
const postUrlsCache = new WeakMap<Nuxt, Promise<string[]>>();

async function collectMarkdownFiles(dir: string): Promise<string[]> {
	let entries: Dirent[];

	try {
		entries = await readdir(dir, {
			withFileTypes: true,
		});
	} catch {
		return [];
	}

	const files = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = join(dir, entry.name);

			if (entry.isDirectory()) {
				return collectMarkdownFiles(fullPath);
			}

			if (entry.isFile() && entry.name.endsWith('.md')) {
				return [fullPath];
			}

			return [];
		}),
	);

	return files.flat();
}

async function addContentDir(urls: Set<string>, contentDir: string) {
	const files = await collectMarkdownFiles(contentDir);

	for (const file of files) {
		const slug = relative(contentDir, file)
			.split(sep)
			.map(encodeURIComponent)
			.join('/')
			.replace(/\.md$/, '');

		urls.add(`/post/${slug}`);
	}
}

export async function getBlogPostUrls(nuxt: Nuxt): Promise<string[]> {
	const cached = postUrlsCache.get(nuxt);

	if (cached) {
		return cached;
	}

	const promise = collectBlogPostUrls(nuxt);
	postUrlsCache.set(nuxt, promise);

	return promise;
}

async function collectBlogPostUrls(nuxt: Nuxt): Promise<string[]> {
	const urls = new Set<string>();
	const contentDirs = new Set([
		defaultContentDir,
		join(nuxt.options.rootDir, 'content'),
	]);

	await Promise.all([...contentDirs].map((dir) => addContentDir(urls, dir)));

	return [...urls].sort();
}
