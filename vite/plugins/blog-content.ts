import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { parse } from 'yaml';
import MarkdownIt, { type MarkdownIt as MarkdownItInstance } from 'markdown-it';

const VIRTUAL_MODULE_ID = 'virtual:myelophone-blog-content';
const RESOLVED_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;
const blockTagPattern =
	/(<\/?(?:address|article|aside|blockquote|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>)\s+(?=<\/?(?:address|article|aside|blockquote|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|section|table|tbody|td|tfoot|th|thead|tr|ul)\b)/gi;

interface GeneratedPost {
	meta: Record<string, string>;
	html: string;
}

function collectMarkdownFiles(directory: string): string[] {
	try {
		return readdirSync(directory, { withFileTypes: true }).flatMap(
			(entry) => {
				const file = join(directory, entry.name);
				return entry.isDirectory()
					? collectMarkdownFiles(file)
					: extname(file).toLowerCase() === '.md'
						? [file]
						: [];
			},
		);
	} catch {
		return [];
	}
}

function renderMarkdown(source: string, markdown: MarkdownItInstance): string {
	return markdown
		.render(source)
		.split(/(<pre\b[\s\S]*?<\/pre>)/gi)
		.map((fragment: string, index: number) => {
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

function parsePost(
	source: string,
	markdown: MarkdownItInstance,
): GeneratedPost {
	let meta: Record<string, string> = {};
	let content = source;

	if (source.startsWith('---')) {
		const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

		if (match) {
			const parsed = parse(match[1] ?? '');
			if (
				parsed &&
				typeof parsed === 'object' &&
				!Array.isArray(parsed)
			) {
				for (const key of ['title', 'description', 'image']) {
					const value = (parsed as Record<string, unknown>)[key];
					if (typeof value === 'string') {
						meta[key] = value;
					}
				}
			}
			content = source.slice(match[0].length);
		}
	}

	return { meta, html: renderMarkdown(content, markdown) };
}

function generatePosts(directories: string[]): Record<string, GeneratedPost> {
	const markdown = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: true,
	});
	const posts: Record<string, GeneratedPost> = {};

	for (const directory of directories) {
		for (const file of collectMarkdownFiles(directory)) {
			const slug = relative(directory, file)
				.replace(/\\/g, '/')
				.replace(/\.md$/i, '');
			posts[slug] = parsePost(readFileSync(file, 'utf8'), markdown);
		}
	}

	return posts;
}

export function blogContentPlugin(directories: string[]): Plugin {
	return {
		name: 'myelophone-blog-content',
		resolveId(id) {
			return id === VIRTUAL_MODULE_ID ? RESOLVED_MODULE_ID : undefined;
		},
		load(id) {
			if (id !== RESOLVED_MODULE_ID) {
				return undefined;
			}

			return `export const posts = ${JSON.stringify(generatePosts(directories))};`;
		},
	};
}

export const defaultBlogContentDirectories = (
	projectRoot: string,
	packageRoot = projectRoot,
) => [
	resolve(packageRoot, 'app/content'),
	resolve(projectRoot, 'app/content'),
	resolve(projectRoot, 'content'),
	resolve(projectRoot, 'playground/content'),
];
