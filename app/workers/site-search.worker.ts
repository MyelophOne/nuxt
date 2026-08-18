/// <reference lib="webworker" />

import Fuse from 'fuse.js';
import type {
	SiteSearchDocument,
	SiteSearchResult,
	SiteSearchOperator,
	SiteSearchWorkerOptions,
	SiteSearchWorkerRequest,
	SiteSearchWorkerResponse,
} from '../types/site-search';

interface CachedIndex {
	key: string;
	updatedAt: number;
	signature: string;
	documents: SiteSearchDocument[];
}

const workerScope = self as DedicatedWorkerGlobalScope;
const databaseName = 'myelophone-site-search';
const databaseVersion = 1;
const storeName = 'indexes';
const excludedExtensions =
	/\.(?:avif|bmp|css|csv|docx?|gif|ico|jpe?g|js|json|map|mp3|mp4|ogg|pdf|png|pptx?|svg|txt|webm|webp|woff2?|xlsx?|xml|zip)$/i;

let documents: SiteSearchDocument[] = [];
const fuseByLocale = new Map<string, Fuse<SiteSearchDocument>>();

const post = (message: SiteSearchWorkerResponse) =>
	workerScope.postMessage(message);

const normalizeLocale = (locale: string) =>
	locale.trim().toLowerCase().replace('_', '-').split('-')[0] || 'en';

const decodeEntities = (value: string) => {
	const named: Record<string, string> = {
		amp: '&',
		apos: "'",
		gt: '>',
		lt: '<',
		nbsp: ' ',
		quot: '"',
	};

	return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (entity, code: string) => {
		if (code[0] !== '#') return named[code.toLowerCase()] ?? entity;
		const isHex = code[1]?.toLowerCase() === 'x';
		const point = Number.parseInt(
			code.slice(isHex ? 2 : 1),
			isHex ? 16 : 10,
		);
		return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
	});
};

const textFromHtml = (value: string) =>
	decodeEntities(
		value
			.replace(/<!--[\s\S]*?-->/g, ' ')
			.replace(
				/<(script|style|noscript|template|svg|header|footer|nav|form|dialog)\b[^>]*>[\s\S]*?<\/\1>/gi,
				' ',
			)
			.replace(
				/<([a-z][\w-]*)\b[^>]*(?:data-nosnippet|aria-hidden=["']?true)[^>]*>[\s\S]*?<\/\1>/gi,
				' ',
			)
			.replace(/<br\s*\/?\s*>/gi, ' ')
			.replace(/<[^>]+>/g, ' '),
	)
		.replace(/\s+/g, ' ')
		.trim();

const getAttribute = (tag: string, name: string) => {
	const match = tag.match(
		new RegExp(`\\b${name}\\s*=\\s*(?:["']([^"']*)["']|([^\\s>]+))`, 'i'),
	);
	return match?.[1] ?? match?.[2] ?? '';
};

const getMetaContent = (html: string, name: string) => {
	for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
		const tag = match[0];
		const key = getAttribute(tag, 'name') || getAttribute(tag, 'property');
		if (key.toLowerCase() === name.toLowerCase())
			return decodeEntities(getAttribute(tag, 'content')).trim();
	}
	return '';
};

const inferLocale = (url: URL, options: SiteSearchWorkerOptions) => {
	const firstSegment =
		url.pathname.split('/').filter(Boolean)[0]?.toLowerCase() ?? '';
	const matched = options.locales.find(
		(locale) => normalizeLocale(locale) === normalizeLocale(firstSegment),
	);
	return normalizeLocale(matched ?? options.defaultLocale);
};

const extractDocument = (
	html: string,
	sourceUrl: string,
	options: SiteSearchWorkerOptions,
) => {
	const robots = getMetaContent(html, 'robots').toLowerCase();
	if (options.respectNoIndex && /\bnoindex\b/.test(robots)) return null;

	const url = new URL(sourceUrl);
	const titleHtml =
		html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
	const h1Html = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
	const title =
		textFromHtml(titleHtml) || textFromHtml(h1Html) || url.pathname;
	const description = getMetaContent(html, 'description');
	const mainHtml =
		html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
		html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ??
		html;
	const headings = [
		...mainHtml.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi),
	]
		.map((match) => textFromHtml(match[1] ?? ''))
		.filter(Boolean)
		.join(' ');
	const content = textFromHtml(mainHtml).slice(0, options.maxContentLength);
	if (!content && !title && !description) return null;

	url.hash = '';
	return {
		id: url.href,
		url: url.href,
		path: `${url.pathname}${url.search}`,
		title,
		description,
		headings,
		content,
		locale: inferLocale(url, options),
	} satisfies SiteSearchDocument;
};

const isIndexableUrl = (value: string, origin: string) => {
	try {
		const url = new URL(value, origin);
		return (
			url.origin === origin &&
			(url.protocol === 'http:' || url.protocol === 'https:') &&
			!excludedExtensions.test(url.pathname) &&
			!url.pathname.startsWith('/api/') &&
			!url.pathname.startsWith('/_')
		);
	} catch {
		return false;
	}
};

const extractPageLinks = (html: string, sourceUrl: string, origin: string) => {
	const links: string[] = [];
	for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
		const tag = match[0];
		if (/\brel\s*=\s*["'][^"']*\bnofollow\b/i.test(tag)) continue;
		const href = getAttribute(tag, 'href');
		if (!href) continue;

		try {
			const url = new URL(href, sourceUrl);
			url.hash = '';
			if (!url.search && isIndexableUrl(url.href, origin))
				links.push(url.href);
		} catch {}
	}
	return links;
};

const fetchText = async (url: string, accept: string) => {
	const response = await fetch(url, {
		headers: { Accept: accept },
		credentials: 'same-origin',
	});
	if (!response.ok) throw new Error(`${response.status} ${url}`);
	return {
		text: await response.text(),
		contentType: response.headers.get('content-type') ?? '',
	};
};

const extractLocations = (xml: string) =>
	[...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
		.map((match) => decodeEntities(match[1] ?? '').trim())
		.filter(Boolean);

const discoverUrls = async (options: SiteSearchWorkerOptions) => {
	const pageUrls = new Set<string>();
	const sitemapUrls = new Set<string>();
	const visitedSitemaps = new Set<string>();
	const baseUrl = new URL(options.basePath || '/', options.origin);

	for (const seed of options.seedUrls) {
		const absolute = new URL(seed, baseUrl);
		absolute.hash = '';
		if (isIndexableUrl(absolute.href, options.origin))
			pageUrls.add(absolute.href);
	}

	if (!options.discoverSitemaps)
		return [...pageUrls].slice(0, options.maxPages);

	try {
		const robots = await fetchText(
			new URL('robots.txt', baseUrl).href,
			'text/plain',
		);
		for (const match of robots.text.matchAll(
			/^\s*Sitemap:\s*(\S+)\s*$/gim,
		)) {
			if (match[1]) sitemapUrls.add(new URL(match[1], baseUrl).href);
		}
	} catch {}

	sitemapUrls.add(new URL('sitemap.xml', baseUrl).href);
	sitemapUrls.add(new URL('sitemap_index.xml', baseUrl).href);

	const crawlSitemap = async (
		sitemapUrl: string,
		depth = 0,
	): Promise<void> => {
		if (depth > 3 || visitedSitemaps.has(sitemapUrl)) return;
		visitedSitemaps.add(sitemapUrl);

		try {
			const response = await fetchText(
				sitemapUrl,
				'application/xml,text/xml;q=0.9',
			);
			const xml = response.text;
			if (
				!response.contentType.includes('xml') &&
				!/^\s*<\?xml|<urlset|<sitemapindex/i.test(xml)
			)
				return;

			const locations = extractLocations(xml);
			if (/<sitemapindex\b/i.test(xml)) {
				await Promise.all(
					locations.map((location) =>
						crawlSitemap(
							new URL(location, sitemapUrl).href,
							depth + 1,
						),
					),
				);
				return;
			}

			for (const location of locations) {
				const url = new URL(location, sitemapUrl);
				url.hash = '';
				if (isIndexableUrl(url.href, options.origin))
					pageUrls.add(url.href);
			}
		} catch {}
	};

	await Promise.all([...sitemapUrls].map((url) => crawlSitemap(url)));
	return [...pageUrls].slice(0, options.maxPages);
};

const openDatabase = () =>
	new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open(databaseName, databaseVersion);
		request.onupgradeneeded = () => {
			const database = request.result;
			if (!database.objectStoreNames.contains(storeName))
				database.createObjectStore(storeName, { keyPath: 'key' });
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

const readCache = async (key: string) => {
	try {
		const database = await openDatabase();
		return await new Promise<CachedIndex | undefined>((resolve, reject) => {
			const request = database
				.transaction(storeName, 'readonly')
				.objectStore(storeName)
				.get(key);
			request.onsuccess = () =>
				resolve(request.result as CachedIndex | undefined);
			request.onerror = () => reject(request.error);
		});
	} catch {
		return undefined;
	}
};

const writeCache = async (record: CachedIndex) => {
	try {
		const database = await openDatabase();
		await new Promise<void>((resolve, reject) => {
			const request = database
				.transaction(storeName, 'readwrite')
				.objectStore(storeName)
				.put(record);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch {}
};

const clearCache = async () => {
	try {
		const database = await openDatabase();
		await new Promise<void>((resolve, reject) => {
			const request = database
				.transaction(storeName, 'readwrite')
				.objectStore(storeName)
				.clear();
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch {}
};

const signatureFor = (urls: string[]) => urls.slice().sort().join('\n');

const fetchDocuments = async (
	urls: string[],
	options: SiteSearchWorkerOptions,
) => {
	const result: SiteSearchDocument[] = [];
	const queue = [...urls];
	const queued = new Set(queue);
	let cursor = 0;
	let processed = 0;

	const consume = async () => {
		while (cursor < queue.length) {
			const index = cursor++;
			const url = queue[index];
			if (!url) continue;

			try {
				const response = await fetchText(
					url,
					'text/html,application/xhtml+xml;q=0.9',
				);
				if (
					response.contentType &&
					!response.contentType.includes('html')
				)
					continue;
				const document = extractDocument(response.text, url, options);
				if (document) result.push(document);

				for (const link of extractPageLinks(
					response.text,
					url,
					options.origin,
				)) {
					if (queue.length >= options.maxPages) break;
					if (queued.has(link)) continue;
					queued.add(link);
					queue.push(link);
				}
			} catch {
			} finally {
				processed++;
				if (processed === queue.length || processed % 4 === 0) {
					post({
						type: 'progress',
						indexed: processed,
						total: queue.length,
					});
				}
			}
		}
	};

	await Promise.all(
		Array.from(
			{ length: Math.min(options.concurrency, queue.length) },
			consume,
		),
	);
	return result;
};

const createFuse = (
	items: SiteSearchDocument[],
	operator: SiteSearchOperator,
) =>
	new Fuse(items, {
		keys: [
			{ name: 'title', weight: 4 },
			{ name: 'headings', weight: 2.5 },
			{ name: 'description', weight: 2 },
			{ name: 'content', weight: 1 },
			{ name: 'path', weight: 0.35 },
		],
		includeMatches: true,
		includeScore: true,
		ignoreDiacritics: true,
		ignoreLocation: true,
		minMatchCharLength: 2,
		threshold: 0.34,
		useTokenSearch: true,
		tokenMatch: operator === 'and' ? 'all' : 'any',
	});

const getFuse = (
	locale: string,
	allLocales: boolean,
	operator: SiteSearchOperator,
) => {
	const localeKey = allLocales ? '*' : normalizeLocale(locale);
	const key = `${localeKey}:${operator}`;
	const existing = fuseByLocale.get(key);
	if (existing) return existing;
	const source =
		localeKey === '*'
			? documents
			: documents.filter(
					(document) =>
						normalizeLocale(document.locale) === localeKey,
				);
	const fuse = createFuse(source, operator);
	fuseByLocale.set(key, fuse);
	return fuse;
};

interface FuseMatchData {
	key?: string;
	value?: string;
	indices: readonly (readonly [number, number])[];
}

const normalizeRanges = (
	ranges: readonly (readonly [number, number])[],
	length: number,
) =>
	ranges
		.map(
			([start, end]) =>
				[Math.max(0, start), Math.min(length - 1, end)] as [
					number,
					number,
				],
		)
		.filter(([start, end]) => start <= end)
		.sort(([left], [right]) => left - right);

const rangesFor = (
	matches: readonly FuseMatchData[] | undefined,
	key: string,
) =>
	normalizeRanges(
		(matches ?? [])
			.filter((match) => match.key === key)
			.flatMap((match) => match.indices),
		(matches ?? []).find((match) => match.key === key)?.value?.length ?? 0,
	);

const snippetFor = (
	document: SiteSearchDocument,
	query: string,
	matches: readonly FuseMatchData[] | undefined,
) => {
	const matchedField = (['content', 'description', 'headings'] as const)
		.map((key) => ({
			key,
			match: matches?.find((item) => item.key === key),
		}))
		.find((item) => item.match);

	if (matchedField?.match) {
		const source = document[matchedField.key];
		const sourceRanges = normalizeRanges(
			matchedField.match.indices,
			source.length,
		);
		const firstStart = sourceRanges[0]?.[0] ?? 0;
		const contextStart = Math.max(0, firstStart - 80);
		const contextEnd = Math.min(source.length, firstStart + 180);
		const prefix = contextStart > 0 ? '…' : '';
		const suffix = contextEnd < source.length ? '…' : '';
		const text = `${prefix}${source.slice(contextStart, contextEnd)}${suffix}`;
		const snippetMatches = sourceRanges
			.filter(([start, end]) => end >= contextStart && start < contextEnd)
			.map(
				([start, end]) =>
					[
						Math.max(start, contextStart) -
							contextStart +
							prefix.length,
						Math.min(end, contextEnd - 1) -
							contextStart +
							prefix.length,
					] as [number, number],
			);
		return { text, matches: snippetMatches };
	}

	const normalizedQuery = query.trim().toLocaleLowerCase();
	const contentLower = document.content.toLocaleLowerCase();
	const words = normalizedQuery
		.split(/\s+/)
		.filter((word) => word.length > 1);
	const positions = words
		.map((word) => contentLower.indexOf(word))
		.filter((position) => position >= 0);
	const position = positions.length ? Math.min(...positions) : 0;
	const start = Math.max(0, position - 80);
	const end = Math.min(
		document.content.length,
		position + Math.max(normalizedQuery.length, 24) + 130,
	);
	return {
		text: `${start > 0 ? '…' : ''}${document.content.slice(start, end).trim()}${end < document.content.length ? '…' : ''}`,
		matches: [] as [number, number][],
	};
};

const initialize = async (
	requestId: number,
	options: SiteSearchWorkerOptions,
) => {
	const urls = await discoverUrls(options);
	const signature = signatureFor(urls);
	const cacheKey = `${options.origin}${options.basePath}`;
	const cached = options.cacheTtl > 0 ? await readCache(cacheKey) : undefined;
	const cacheIsFresh =
		cached &&
		cached.documents.length > 0 &&
		cached.signature === signature &&
		Date.now() - cached.updatedAt < options.cacheTtl;

	documents = cacheIsFresh
		? cached.documents
		: await fetchDocuments(urls, options);
	fuseByLocale.clear();

	if (!cacheIsFresh && options.cacheTtl > 0 && documents.length > 0) {
		await writeCache({
			key: cacheKey,
			updatedAt: Date.now(),
			signature,
			documents,
		});
	}

	post({
		type: 'ready',
		requestId,
		count: documents.length,
		cached: Boolean(cacheIsFresh),
	});
};

const search = (
	requestId: number,
	query: string,
	locale: string,
	allLocales: boolean,
	operator: SiteSearchOperator,
	limit: number,
) => {
	const fuse = getFuse(locale, allLocales, operator);
	const knownLocales = new Set(
		documents.map((document) => normalizeLocale(document.locale)),
	);
	const candidateLimit = allLocales
		? Math.min(documents.length, limit * Math.max(2, knownLocales.size))
		: limit;
	const candidates: SiteSearchResult[] = fuse
		.search(query, { limit: candidateLimit })
		.map((result) => {
			const matches = result.matches as
				readonly FuseMatchData[] | undefined;
			const snippet = snippetFor(result.item, query, matches);
			return {
				id: result.item.id,
				url: result.item.url,
				path: result.item.path,
				title: result.item.title,
				description: result.item.description,
				snippet: snippet.text,
				titleMatches: rangesFor(matches, 'title'),
				snippetMatches: snippet.matches,
				pathMatches: rangesFor(matches, 'path'),
				locale: result.item.locale,
				score: result.score ?? 1,
			};
		});
	const currentLocale = normalizeLocale(locale);
	candidates.sort((left, right) => {
		const localeDifference =
			Number(normalizeLocale(right.locale) === currentLocale) -
			Number(normalizeLocale(left.locale) === currentLocale);
		return localeDifference || left.score - right.score;
	});

	const seenPages = new Set<string>();
	const results = candidates
		.filter((result) => {
			const url = new URL(result.path, 'https://site-search.invalid');
			const segments = url.pathname.split('/').filter(Boolean);
			if (segments[0] && knownLocales.has(normalizeLocale(segments[0])))
				segments.shift();
			const pageKey = `/${segments.join('/')}`.replace(/\/$/, '') || '/';
			if (seenPages.has(pageKey)) return false;
			seenPages.add(pageKey);
			return true;
		})
		.slice(0, limit);
	post({ type: 'results', requestId, results });
};

workerScope.addEventListener(
	'message',
	(event: MessageEvent<SiteSearchWorkerRequest>) => {
		const request = event.data;
		if (request.type === 'init') {
			initialize(request.requestId, request.options).catch((error) => {
				post({
					type: 'error',
					requestId: request.requestId,
					message:
						error instanceof Error ? error.message : String(error),
				});
			});
			return;
		}

		if (request.type === 'search') {
			try {
				search(
					request.requestId,
					request.query,
					request.locale,
					request.allLocales,
					request.operator,
					request.limit,
				);
			} catch (error) {
				post({
					type: 'error',
					requestId: request.requestId,
					message:
						error instanceof Error ? error.message : String(error),
				});
			}
			return;
		}

		clearCache().then(() =>
			post({ type: 'cache-cleared', requestId: request.requestId }),
		);
	},
);
