export interface SiteSearchDocument {
	id: string;
	url: string;
	path: string;
	title: string;
	description: string;
	headings: string;
	content: string;
	locale: string;
}

export type SiteSearchOperator = 'and' | 'or';
export type SiteSearchStrategy = 'client' | 'remote';
export type SiteSearchRange = [number, number];

export interface SiteSearchRemoteResult {
	id?: string;
	url?: string;
	path: string;
	title: string;
	description?: string;
	snippet?: string;
	locale?: string;
	score?: number;
	highlights?: {
		title?: SiteSearchRange[];
		snippet?: SiteSearchRange[];
		path?: SiteSearchRange[];
	};
}

export interface SiteSearchRemoteResponse {
	results: SiteSearchRemoteResult[];
	total?: number;
}

export interface SiteSearchResult {
	id: string;
	url: string;
	path: string;
	title: string;
	description: string;
	snippet: string;
	titleMatches: SiteSearchRange[];
	snippetMatches: SiteSearchRange[];
	pathMatches: SiteSearchRange[];
	locale: string;
	score: number;
}

export interface SiteSearchWorkerOptions {
	origin: string;
	basePath: string;
	seedUrls: string[];
	locales: string[];
	defaultLocale: string;
	maxPages: number;
	maxContentLength: number;
	concurrency: number;
	cacheTtl: number;
	respectNoIndex: boolean;
	discoverSitemaps: boolean;
}

export type SiteSearchWorkerRequest =
	| {
			type: 'init';
			requestId: number;
			options: SiteSearchWorkerOptions;
	  }
	| {
			type: 'search';
			requestId: number;
			query: string;
			locale: string;
			allLocales: boolean;
			operator: SiteSearchOperator;
			limit: number;
	  }
	| {
			type: 'clear-cache';
			requestId: number;
	  };

export type SiteSearchWorkerResponse =
	| {
			type: 'progress';
			indexed: number;
			total: number;
	  }
	| {
			type: 'ready';
			requestId: number;
			count: number;
			cached: boolean;
	  }
	| {
			type: 'results';
			requestId: number;
			results: SiteSearchResult[];
	  }
	| {
			type: 'cache-cleared';
			requestId: number;
	  }
	| {
			type: 'error';
			requestId: number;
			message: string;
	  };
