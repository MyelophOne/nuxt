import { parse } from 'yaml';
import MarkdownIt from 'markdown-it';

export interface PostMeta {
	title?: string;
	description?: string;
	image?: string;
}

export interface Post {
	content: string;
	meta: PostMeta;
}

type PostLoader = () => Promise<string>;

const postCache = new Map<string, Promise<Post>>();
const markdown = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
});
const blockTagPattern =
	/(<\/?(?:address|article|aside|blockquote|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>)\s+(?=<\/?(?:address|article|aside|blockquote|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|section|table|tbody|td|tfoot|th|thead|tr|ul)\b)/gi;

function normalizePosts(
	items: Record<string, PostLoader>,
): Record<string, PostLoader> {
	return Object.fromEntries(
		Object.entries(items).flatMap(([path, loader]) => {
			const normalized = path.replace(/\\/g, '/');

			const marker = '/content/';
			const index = normalized.lastIndexOf(marker);
			if (index === -1) {
				return [];
			}

			const slug = normalized
				.slice(index + marker.length)
				.replace(/\.md$/, '');

			return [[slug, loader]];
		}),
	);
}

const postsAlias = import.meta.glob<string>('#myelophone/app/content/**/*.md', {
	query: '?raw',
	import: 'default',
});

const postsApp = import.meta.glob<string>('~/content/**/*.md', {
	query: '?raw',
	import: 'default',
});

const posts = {
	...normalizePosts(postsAlias),
	...normalizePosts(postsApp),
};

function parseMarkdown(source: string): Post {
	if (!source.startsWith('---')) {
		return {
			meta: {},
			content: source,
		};
	}

	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

	if (!match) {
		return {
			meta: {},
			content: source,
		};
	}

	return {
		meta: parsePostMeta(parse(match[1] ?? '')),
		content: source.slice(match[0].length),
	};
}

function parsePostMeta(value: unknown): PostMeta {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return {};
	}

	const source = value as Record<string, unknown>;
	const meta: PostMeta = {};

	for (const key of ['title', 'description', 'image'] as const) {
		if (typeof source[key] === 'string') {
			meta[key] = source[key];
		}
	}

	return meta;
}

export function renderMarkdown(source: string): string {
	return markdown
		.render(source)
		.split(/(<pre\b[\s\S]*?<\/pre>)/gi)
		.map((fragment, index) => {
			if (index % 2 === 1) {
				return fragment;
			}

			return fragment
				.replace(/\s*\r?\n\s*/g, ' ')
				.replace(blockTagPattern, '$1')
				.trim();
		})
		.join('');
}

export async function getPost(slug: string): Promise<Post | null> {
	const loader = posts[slug];

	if (!loader) {
		return null;
	}

	const cached = postCache.get(slug);

	if (cached) {
		return cached;
	}

	const promise = loader().then(parseMarkdown);
	postCache.set(slug, promise);

	try {
		return await promise;
	} catch (error) {
		postCache.delete(slug);
		throw error;
	}
}
