import type { NuxtSecurityRouteRules } from 'nuxt-security';

type SecurityHeaders = NonNullable<NuxtSecurityRouteRules['headers']>;
type SecurityHeaderKey = keyof SecurityHeaders;

const headerNames: Partial<Record<SecurityHeaderKey, string>> = {
	contentSecurityPolicy: 'Content-Security-Policy',
	crossOriginEmbedderPolicy: 'Cross-Origin-Embedder-Policy',
	crossOriginOpenerPolicy: 'Cross-Origin-Opener-Policy',
	crossOriginResourcePolicy: 'Cross-Origin-Resource-Policy',
	originAgentCluster: 'Origin-Agent-Cluster',
	referrerPolicy: 'Referrer-Policy',
	strictTransportSecurity: 'Strict-Transport-Security',
	xContentTypeOptions: 'X-Content-Type-Options',
	xDNSPrefetchControl: 'X-DNS-Prefetch-Control',
	xDownloadOptions: 'X-Download-Options',
	xFrameOptions: 'X-Frame-Options',
	xPermittedCrossDomainPolicies: 'X-Permitted-Cross-Domain-Policies',
	xXSSProtection: 'X-XSS-Protection',
	permissionsPolicy: 'Permissions-Policy',
};

const resolveCsp = (
	value: Exclude<SecurityHeaders['contentSecurityPolicy'], false | undefined>,
	nonce?: string,
) =>
	Object.fromEntries(
		Object.entries(value).map(([directive, sources]) => {
			const sourceValue = sources as boolean | string | string[];

			if (typeof sourceValue === 'boolean') {
				return [directive, sourceValue];
			}

			const tokens = (
				typeof sourceValue === 'string'
					? sourceValue.split(' ')
					: sourceValue
			)
				.map((source) => source.trim())
				.filter(Boolean)
				.map((source) =>
					source === "'nonce-{{nonce}}'" && nonce
						? `'nonce-${nonce}'`
						: source,
				)
				.filter((source) => source !== "'nonce-{{nonce}}'");

			return [directive, tokens];
		}),
	);

const stringifyHeader = (key: SecurityHeaderKey, value: unknown): string => {
	if (key === 'contentSecurityPolicy') {
		return Object.entries(value as Record<string, boolean | string[]>)
			.filter(([, sources]) => sources !== false)
			.map(([directive, sources]) =>
				directive === 'upgrade-insecure-requests'
					? 'upgrade-insecure-requests;'
					: `${directive} ${Array.isArray(sources) ? sources.join(' ') : sources};`,
			)
			.join(' ');
	}

	if (key === 'strictTransportSecurity') {
		const policies = value as {
			maxAge: number;
			includeSubdomains?: boolean;
			preload?: boolean;
		};

		return [
			`max-age=${policies.maxAge}`,
			policies.includeSubdomains && 'includeSubDomains',
			policies.preload && 'preload',
		]
			.filter(Boolean)
			.join('; ');
	}

	if (key === 'permissionsPolicy') {
		return Object.entries(
			value as Record<string, string | string[] | false>,
		)
			.filter(([, sources]) => sources !== false)
			.map(([directive, sources]) =>
				typeof sources === 'string'
					? `${directive}=${sources}`
					: `${directive}=(${(sources as string[]).join(' ')})`,
			)
			.join(', ');
	}

	return String(value);
};

export default defineEventHandler((event) => {
	const rules = event.context.security?.rules as
		NuxtSecurityRouteRules | undefined;

	if (!rules?.enabled) {
		return;
	}

	if (rules.hidePoweredBy) {
		removeResponseHeader(event, 'x-powered-by');
	}

	if (!rules.headers) {
		return;
	}

	for (const [rawKey, rawValue] of Object.entries(rules.headers)) {
		const key = rawKey as SecurityHeaderKey;

		if (key === 'contentSecurityPolicy') {
			continue;
		}

		const headerName =
			key === 'contentSecurityPolicy' &&
			rules.contentSecurityPolicyReportOnly
				? 'Content-Security-Policy-Report-Only'
				: headerNames[key];

		if (!headerName) {
			continue;
		}

		if (rawValue === false) {
			const routeHeader = getRouteRules(event).headers?.[headerName];

			if (getResponseHeader(event, headerName) === routeHeader) {
				removeResponseHeader(event, headerName);
			}
			continue;
		}

		const value =
			key === 'contentSecurityPolicy'
				? resolveCsp(
						rawValue as Exclude<
							SecurityHeaders['contentSecurityPolicy'],
							false | undefined
						>,
						event.context.security?.nonce,
					)
				: rawValue;

		setResponseHeader(event, headerName, stringifyHeader(key, value));
	}
});
