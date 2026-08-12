import type {
	CookieCategory,
	CookieScriptLegalBasis,
	CookieScriptDef,
	CookieScriptsConfig,
	LocalizedCookieText,
} from '~/types/cookie';

type ScriptPreset = CookieScriptsConfig;

type BasePresetOptions = {
	id?: string;
	name?: LocalizedCookieText;
	nameKey?: string;
	description?: LocalizedCookieText;
	descriptionKey?: string;
	legalBasis?: CookieScriptLegalBasis;
	loadKey?: string;
	options?: any;
};

const I18N_SAFE_LIST_READY_KEY = '__i18nSafeListReady';
const I18N_SAFE_LIST_KEYS_KEY = '__i18nSafeListKeys';

const isTranslationKey = (value: unknown): value is string =>
	typeof value === 'string' &&
	/^[a-zA-Z0-9/_-]+(?:\.[a-zA-Z0-9/_-]+)+$/.test(value);

const collectSafeListKeys = (source: unknown, keys = new Set<string>()) => {
	if (!source) return keys;

	if (Array.isArray(source)) {
		source.forEach((item) => collectSafeListKeys(item, keys));
		return keys;
	}

	if (typeof source !== 'object') return keys;

	Object.entries(source).forEach(([key, value]) => {
		if (key !== 'loadKey' && key.endsWith('Key')) {
			if (isTranslationKey(value)) keys.add(value);
			return;
		}

		if (key.endsWith('Keys') && Array.isArray(value)) {
			value.forEach((item) => {
				if (isTranslationKey(item)) keys.add(item);
			});
			return;
		}

		collectSafeListKeys(value, keys);
	});

	return keys;
};

const registerSafeListSource = (source: CookieScriptsConfig) => {
	if (
		typeof process === 'undefined' ||
		!process.versions?.node ||
		typeof window !== 'undefined'
	) {
		return;
	}

	const globalState = globalThis as unknown as Record<
		string,
		Promise<unknown> | Set<string> | undefined
	>;
	const registry =
		(globalState[I18N_SAFE_LIST_KEYS_KEY] as Set<string> | undefined) ||
		new Set<string>();

	collectSafeListKeys(source).forEach((key) => registry.add(key));
	globalState[I18N_SAFE_LIST_KEYS_KEY] = registry;
	globalState[I18N_SAFE_LIST_READY_KEY] = Promise.resolve();
};

const addScript = (
	category: CookieCategory,
	script: CookieScriptDef,
): ScriptPreset => ({
	[category]: [script],
});

const consentStore = (vendor: string) => `
window.__cookieScriptConsent = window.__cookieScriptConsent || {};
window.__cookieScriptConsent["${vendor}"] = context.categories;
`;

const consentStoreInitializer = (vendor: string) => ({
	key: `consent-store:${vendor}`,
	code: consentStore(vendor),
});

const hubspotQueueInitializer = {
	key: 'hubspot-queue',
	code: `
window._hsq = window._hsq || [];
`,
};

const queueInit = (globalName: string, queueName = 'q') => `
window.${globalName} = window.${globalName} || function(){ (window.${globalName}.${queueName} = window.${globalName}.${queueName} || []).push(arguments); };
`;

const gtagInit = `
window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
`;

const gtagInitializer = {
	key: 'gtag',
	code: gtagInit,
};

const gtagConsentDefault = `
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted"
});
`;

const gtagConsentDefaultInitializer = {
	key: 'gtag-consent-default',
	code: gtagConsentDefault,
};

const googleConsentUpdates = {
	analytics: `
gtag("consent", "update", { analytics_storage: "granted" });
`,
	marketing: `
gtag("consent", "update", {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted"
});
`,
	functional: `
gtag("consent", "update", { functionality_storage: "granted" });
`,
};

export const mergeCookieScriptConfigs = (
	...configs: Array<CookieScriptsConfig | undefined | null | false>
): CookieScriptsConfig => {
	const merged = configs.reduce<CookieScriptsConfig>((merged, config) => {
		if (!config) return merged;

		Object.entries(config).forEach(([category, scripts]) => {
			if (category === 'notices') {
				merged.notices = [
					...(merged.notices || []),
					...(scripts || []),
				];
				return;
			}

			const cookieCategory = category as CookieCategory;
			merged[cookieCategory] = [
				...(merged[cookieCategory] || []),
				...(scripts || []),
			];
		});

		return merged;
	}, {});

	registerSafeListSource(merged);

	return merged;
};

export const resolveCookieScriptText = (
	value: LocalizedCookieText | undefined,
	locale: string,
	fallbackLocale = 'en',
) => {
	if (!value || typeof value === 'string') return value;

	return value[locale] || value[fallbackLocale] || Object.values(value)[0];
};

export const cookieScriptPresets = {
	googleTagManager: ({
		containerId,
		id = 'google-tag-manager',
		name = 'Google Tag Manager',
		nameKey = 'cookies.googleTagManager.name',
		descriptionKey = 'cookies.googleTagManager.description',
		loadKey = `gtm:${containerId}`,
		options,
	}: BasePresetOptions & { containerId: string }): ScriptPreset => {
		const script: CookieScriptDef = {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://www.googletagmanager.com/gtm.js?id=${containerId}`,
			initializers: [gtagInitializer, gtagConsentDefaultInitializer],
			beforeLoad: `
window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
`,
			categorySettings: {
				analytics: {
					beforeLoad: googleConsentUpdates.analytics,
				},
				marketing: {
					beforeLoad: `${googleConsentUpdates.marketing}
gtag("consent", "update", { personalization_storage: "granted" });
`,
				},
				functional: {
					beforeLoad: googleConsentUpdates.functional,
				},
			},
			options,
		};

		return {
			analytics: [script],
			marketing: [script],
			functional: [script],
		};
	},

	googleAnalytics4: ({
		measurementId,
		id = 'google-analytics-4',
		name = 'Google Analytics 4',
		nameKey = 'cookies.googleAnalytics4.name',
		descriptionKey = 'cookies.googleAnalytics4.description',
		loadKey = 'gtag',
		options,
	}: BasePresetOptions & { measurementId: string }): ScriptPreset =>
		addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
			initializers: [gtagInitializer, gtagConsentDefaultInitializer],
			beforeLoad: `
gtag("js", new Date());
`,
			categorySettings: {
				analytics: {
					beforeLoad: `${googleConsentUpdates.analytics}
gtag("config", "${measurementId}", { anonymize_ip: true });
`,
				},
			},
			options,
		}),

	googleAds: ({
		conversionId,
		id = 'google-ads',
		name = 'Google Ads',
		nameKey = 'cookies.googleAds.name',
		descriptionKey = 'cookies.googleAds.description',
		loadKey = 'gtag',
		options,
	}: BasePresetOptions & { conversionId: string }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://www.googletagmanager.com/gtag/js?id=${conversionId}`,
			initializers: [gtagInitializer, gtagConsentDefaultInitializer],
			categorySettings: {
				marketing: {
					beforeLoad: `${googleConsentUpdates.marketing}
gtag("config", "${conversionId}");
`,
				},
			},
			options,
		}),

	metaPixel: ({
		pixelId,
		id = 'meta-pixel',
		name = 'Meta Pixel',
		nameKey = 'cookies.metaPixel.name',
		descriptionKey = 'cookies.metaPixel.description',
		loadKey = 'meta-pixel',
		options,
	}: BasePresetOptions & { pixelId: string }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://connect.facebook.net/en_US/fbevents.js',
			beforeLoad: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];}(window, document, "script");
fbq("consent", "revoke");
`,
			categorySettings: {
				marketing: {
					beforeLoad: `
fbq("consent", "grant");
fbq("init", "${pixelId}");
fbq("track", "PageView");
`,
				},
			},
			options,
		}),

	yandexMetrica: ({
		counterId,
		id = 'yandex-metrica',
		name = 'Yandex Metrica',
		nameKey = 'cookies.yandexMetrica.name',
		descriptionKey = 'cookies.yandexMetrica.description',
		loadKey = 'yandex-metrica',
		options,
	}: BasePresetOptions & { counterId: string | number }): ScriptPreset =>
		addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://mc.yandex.ru/metrika/tag.js',
			beforeLoad: `
window.ym = window.ym || function(){ (window.ym.a = window.ym.a || []).push(arguments); };
window.ym.l = 1 * new Date();
`,
			categorySettings: {
				analytics: {
					beforeLoad: `
ym(${counterId}, "init", {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: false
});
`,
				},
			},
			options,
		}),

	vkPixel: ({
		pixelId,
		id = 'vk-pixel',
		name = 'VK Pixel',
		nameKey = 'cookies.vkPixel.name',
		descriptionKey = 'cookies.vkPixel.description',
		loadKey = 'vk-pixel',
		options,
	}: BasePresetOptions & { pixelId: string | number }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://vk.com/js/api/openapi.js',
			beforeLoad: `
window.VK = window.VK || {};
`,
			categorySettings: {
				marketing: {
					beforeLoad: `
if (window.VK && VK.Retargeting) {
  VK.Retargeting.Init("${pixelId}");
  VK.Retargeting.Hit();
}
`,
				},
			},
			options,
		}),

	myTargetTopMailRu: ({
		counterId,
		id = 'mytarget-topmailru',
		name = 'myTarget / Top.Mail.Ru',
		nameKey = 'cookies.myTargetTopMailRu.name',
		descriptionKey = 'cookies.myTargetTopMailRu.description',
		loadKey = 'top-mail-ru',
		options,
	}: BasePresetOptions & { counterId: string | number }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://top-fwz1.mail.ru/js/code.js',
			beforeLoad: queueInit('_tmr'),
			categorySettings: {
				marketing: {
					beforeLoad: `
_tmr("init", { id: "${counterId}", type: "pageView", start: new Date().getTime() });
`,
				},
			},
			options,
		}),

	baiduTongji: ({
		siteId,
		id = 'baidu-tongji',
		name = 'Baidu Tongji',
		nameKey = 'cookies.baiduTongji.name',
		descriptionKey = 'cookies.baiduTongji.description',
		loadKey = 'baidu-tongji',
		options,
	}: BasePresetOptions & { siteId: string }): ScriptPreset =>
		addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://hm.baidu.com/hm.js?${siteId}`,
			beforeLoad: `
window._hmt = window._hmt || [];
`,
			options,
		}),

	matomo: ({
		trackerUrl,
		siteId,
		id = 'matomo',
		name = 'Matomo',
		nameKey = 'cookies.matomo.name',
		descriptionKey = 'cookies.matomo.description',
		loadKey,
		options,
	}: BasePresetOptions & {
		trackerUrl: string;
		siteId: string | number;
	}): ScriptPreset => {
		const baseUrl = trackerUrl.replace(/\/$/, '');

		return addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey: loadKey || `matomo:${baseUrl}`,
			src: `${baseUrl}/matomo.js`,
			beforeLoad: `
window._paq = window._paq || [];
_paq.push(["setTrackerUrl", "${baseUrl}/matomo.php"]);
_paq.push(["setSiteId", "${siteId}"]);
`,
			categorySettings: {
				analytics: {
					beforeLoad: `
_paq.push(["trackPageView"]);
_paq.push(["enableLinkTracking"]);
`,
				},
			},
			options,
		});
	},

	plausible: ({
		domain,
		src = 'https://plausible.io/js/script.js',
		id = 'plausible',
		name = 'Plausible Analytics',
		nameKey = 'cookies.plausible.name',
		descriptionKey = 'cookies.plausible.description',
		loadKey = `plausible:${domain}`,
		options,
	}: BasePresetOptions & { domain: string; src?: string }): ScriptPreset =>
		addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src,
			beforeLoad: `
window.plausible = window.plausible || function(){ (window.plausible.q = window.plausible.q || []).push(arguments); };
`,
			options: {
				...options,
				scriptAttributes: {
					defer: true,
					'data-domain': domain,
					...options?.scriptAttributes,
				},
			},
		}),

	umami: ({
		websiteId,
		src,
		hostUrl,
		domains,
		autoTrack = true,
		doNotTrack = true,
		excludeSearch = true,
		excludeHash = true,
		legalBasis,
		id = 'umami',
		name = 'Umami',
		nameKey = 'cookies.umami.name',
		descriptionKey = 'cookies.umami.description',
		loadKey = `umami:${websiteId}`,
		options,
	}: BasePresetOptions & {
		websiteId: string;
		src: string;
		hostUrl?: string;
		domains?: string | string[];
		autoTrack?: boolean;
		doNotTrack?: boolean;
		excludeSearch?: boolean;
		excludeHash?: boolean;
	}): ScriptPreset =>
		legalBasis === 'cookieless'
			? {
					notices: [
						{
							id,
							name,
							nameKey,
							descriptionKey,
							provider: 'Umami',
							legalBasis,
							loadKey,
							src,
							legal: {
								purposeKey: 'cookies.umami.legal.purpose',
								dataCollectedKeys: [
									'cookies.umami.legal.data.pageViews',
									'cookies.umami.legal.data.referrer',
									'cookies.umami.legal.data.browser',
									'cookies.umami.legal.data.device',
								],
								cookiesUsed: false,
								cookiesDescriptionKey:
									'cookies.umami.legal.cookiesDescription',
								privacyPolicyUrl: 'https://umami.is/privacy',
								officialDocsUrl:
									'https://docs.umami.is/docs/tracker-configuration',
								notesKey: 'cookies.umami.legal.notes',
							},
							options: {
								...options,
								scriptAttributes: {
									defer: true,
									'data-website-id': websiteId,
									...(hostUrl
										? { 'data-host-url': hostUrl }
										: {}),
									...(domains
										? {
												'data-domains': Array.isArray(
													domains,
												)
													? domains.join(',')
													: domains,
											}
										: {}),
									...(autoTrack === false
										? { 'data-auto-track': 'false' }
										: {}),
									...(doNotTrack
										? { 'data-do-not-track': 'true' }
										: {}),
									...(excludeSearch
										? { 'data-exclude-search': 'true' }
										: {}),
									...(excludeHash
										? { 'data-exclude-hash': 'true' }
										: {}),
									...options?.scriptAttributes,
								},
							},
						},
					],
				}
			: addScript('analytics', {
					id,
					name,
					nameKey,
					descriptionKey,
					provider: 'Umami',
					legalBasis: legalBasis || 'consent',
					loadKey,
					src,
					legal: {
						purposeKey: 'cookies.umami.legal.purpose',
						dataCollectedKeys: [
							'cookies.umami.legal.data.pageViews',
							'cookies.umami.legal.data.referrer',
							'cookies.umami.legal.data.browser',
							'cookies.umami.legal.data.device',
						],
						cookiesUsed: false,
						cookiesDescriptionKey:
							'cookies.umami.legal.cookiesDescription',
						privacyPolicyUrl: 'https://umami.is/privacy',
						officialDocsUrl:
							'https://docs.umami.is/docs/tracker-configuration',
						notesKey: 'cookies.umami.legal.notes',
					},
					options: {
						...options,
						scriptAttributes: {
							defer: true,
							'data-website-id': websiteId,
							...(hostUrl ? { 'data-host-url': hostUrl } : {}),
							...(domains
								? {
										'data-domains': Array.isArray(domains)
											? domains.join(',')
											: domains,
									}
								: {}),
							...(autoTrack === false
								? { 'data-auto-track': 'false' }
								: {}),
							...(doNotTrack
								? { 'data-do-not-track': 'true' }
								: {}),
							...(excludeSearch
								? { 'data-exclude-search': 'true' }
								: {}),
							...(excludeHash
								? { 'data-exclude-hash': 'true' }
								: {}),
							...options?.scriptAttributes,
						},
					},
				}),

	hotjar: ({
		siteId,
		version = 6,
		id = 'hotjar',
		name = 'Hotjar',
		nameKey = 'cookies.hotjar.name',
		descriptionKey = 'cookies.hotjar.description',
		loadKey = `hotjar:${siteId}`,
		options,
	}: BasePresetOptions & {
		siteId: string | number;
		version?: number;
	}): ScriptPreset =>
		addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=${version}`,
			beforeLoad: `
window.hj = window.hj || function(){ (window.hj.q = window.hj.q || []).push(arguments); };
window._hjSettings = { hjid: ${siteId}, hjsv: ${version} };
`,
			options,
		}),

	microsoftClarity: ({
		projectId,
		id = 'microsoft-clarity',
		name = 'Microsoft Clarity',
		nameKey = 'cookies.microsoftClarity.name',
		descriptionKey = 'cookies.microsoftClarity.description',
		loadKey = `clarity:${projectId}`,
		options,
	}: BasePresetOptions & { projectId: string }): ScriptPreset =>
		addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://www.clarity.ms/tag/${projectId}`,
			beforeLoad: queueInit('clarity'),
			options,
		}),

	adobeAnalytics: ({
		src,
		id = 'adobe-analytics',
		name = 'Adobe Analytics',
		nameKey = 'cookies.adobeAnalytics.name',
		descriptionKey = 'cookies.adobeAnalytics.description',
		loadKey = 'adobe-analytics',
		options,
	}: BasePresetOptions & { src: string }): ScriptPreset =>
		addScript('analytics', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src,
			options,
		}),

	hubspot: ({
		portalId,
		id = 'hubspot',
		name = 'HubSpot',
		nameKey = 'cookies.hubspot.name',
		descriptionKey = 'cookies.hubspot.description',
		loadKey = `hubspot:${portalId}`,
		options,
	}: BasePresetOptions & { portalId: string | number }): ScriptPreset => {
		const script: CookieScriptDef = {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://js.hs-scripts.com/${portalId}.js`,
			initializers: [
				hubspotQueueInitializer,
				consentStoreInitializer('hubspot'),
			],
			onConsentChange: consentStore('hubspot'),
			categorySettings: {
				analytics: {
					beforeLoad: `
window._hsq.push(["setPath", window.location.pathname]);
`,
				},
				marketing: {},
				functional: {},
			},
			options,
		};

		return {
			analytics: [script],
			marketing: [script],
			functional: [script],
		};
	},

	bitrix24: ({
		widgetId,
		host = 'cdn-ru.bitrix24.ru',
		id = 'bitrix24',
		name = 'Bitrix24',
		nameKey = 'cookies.bitrix24.name',
		descriptionKey = 'cookies.bitrix24.description',
		loadKey = `bitrix24:${widgetId}`,
		options,
	}: BasePresetOptions & {
		widgetId: string;
		host?: string;
	}): ScriptPreset => {
		const script: CookieScriptDef = {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://${host}/b${widgetId}/crm/site_button/loader_1_${widgetId}.js`,
			initializers: [consentStoreInitializer('bitrix24')],
			onConsentChange: consentStore('bitrix24'),
			categorySettings: {
				marketing: {},
				functional: {},
			},
			options,
		};

		return {
			marketing: [script],
			functional: [script],
		};
	},

	amoCrm: ({
		widgetHash,
		id = 'amo-crm',
		name = 'amoCRM',
		nameKey = 'cookies.amoCrm.name',
		descriptionKey = 'cookies.amoCrm.description',
		loadKey = `amo-crm:${widgetHash}`,
		options,
	}: BasePresetOptions & { widgetHash: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://widget.amocrm.ru/chat/chats-loader.js?hash=${widgetHash}`,
			beforeLoad: consentStore('amoCrm'),
			options,
		}),

	salesforcePardot: ({
		src,
		id = 'salesforce-pardot',
		name = 'Salesforce Account Engagement',
		nameKey = 'cookies.salesforcePardot.name',
		descriptionKey = 'cookies.salesforcePardot.description',
		loadKey = 'salesforce-pardot',
		options,
	}: BasePresetOptions & { src: string }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src,
			options,
		}),

	mailchimp: ({
		src,
		id = 'mailchimp',
		name = 'Mailchimp',
		nameKey = 'cookies.mailchimp.name',
		descriptionKey = 'cookies.mailchimp.description',
		loadKey = 'mailchimp',
		options,
	}: BasePresetOptions & { src: string }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src,
			options,
		}),

	linkedInInsight: ({
		partnerId,
		id = 'linkedin-insight',
		name = 'LinkedIn Insight Tag',
		nameKey = 'cookies.linkedInInsight.name',
		descriptionKey = 'cookies.linkedInInsight.description',
		loadKey = 'linkedin-insight',
		options,
	}: BasePresetOptions & { partnerId: string | number }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
			beforeLoad: `
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push("${partnerId}");
`,
			options,
		}),

	tiktokPixel: ({
		pixelId,
		id = 'tiktok-pixel',
		name = 'TikTok Pixel',
		nameKey = 'cookies.tiktokPixel.name',
		descriptionKey = 'cookies.tiktokPixel.description',
		loadKey = 'tiktok-pixel',
		options,
	}: BasePresetOptions & { pixelId: string }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://analytics.tiktok.com/i18n/pixel/events.js',
			beforeLoad: `
window.ttq = window.ttq || [];
window.ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
window.ttq.setAndDefer = function(t,e){ t[e]=function(){ t.push([e].concat(Array.prototype.slice.call(arguments,0))); }; };
for (var i = 0; i < window.ttq.methods.length; i++) window.ttq.setAndDefer(window.ttq, window.ttq.methods[i]);
window.ttq.instance = function(t){ var e = window.ttq._i[t] || []; for (var n = 0; n < window.ttq.methods.length; n++) window.ttq.setAndDefer(e, window.ttq.methods[n]); return e; };
window.ttq._i = window.ttq._i || {};
window.ttq._i["${pixelId}"] = [];
`,
			categorySettings: {
				marketing: {
					beforeLoad: `
ttq.load("${pixelId}");
ttq.page();
`,
				},
			},
			options,
		}),

	pinterestTag: ({
		tagId,
		id = 'pinterest-tag',
		name = 'Pinterest Tag',
		nameKey = 'cookies.pinterestTag.name',
		descriptionKey = 'cookies.pinterestTag.description',
		loadKey = 'pinterest-tag',
		options,
	}: BasePresetOptions & { tagId: string }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://s.pinimg.com/ct/core.js',
			beforeLoad: `
window.pintrk = window.pintrk || function(){ (window.pintrk.queue = window.pintrk.queue || []).push(Array.prototype.slice.call(arguments)); };
window.pintrk.version = "3.0";
`,
			categorySettings: {
				marketing: {
					beforeLoad: `
pintrk("load", "${tagId}");
pintrk("page");
`,
				},
			},
			options,
		}),

	xPixel: ({
		pixelId,
		id = 'x-pixel',
		name = 'X Pixel',
		nameKey = 'cookies.xPixel.name',
		descriptionKey = 'cookies.xPixel.description',
		loadKey = 'x-pixel',
		options,
	}: BasePresetOptions & { pixelId: string }): ScriptPreset =>
		addScript('marketing', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://static.ads-twitter.com/uwt.js',
			beforeLoad: `
window.twq = window.twq || function(){ (window.twq.exe ? window.twq.exe.apply(window.twq, arguments) : window.twq.queue.push(arguments)); };
window.twq.version = "1.1";
window.twq.queue = window.twq.queue || [];
`,
			categorySettings: {
				marketing: {
					beforeLoad: `
twq("config", "${pixelId}");
`,
				},
			},
			options,
		}),

	intercom: ({
		appId,
		id = 'intercom',
		name = 'Intercom',
		nameKey = 'cookies.intercom.name',
		descriptionKey = 'cookies.intercom.description',
		loadKey = `intercom:${appId}`,
		options,
	}: BasePresetOptions & { appId: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://widget.intercom.io/widget/${appId}`,
			beforeLoad: `
window.intercomSettings = window.intercomSettings || { app_id: "${appId}" };
window.Intercom = window.Intercom || function(){ (window.Intercom.q = window.Intercom.q || []).push(arguments); };
`,
			categorySettings: {
				functional: {
					beforeLoad: `
Intercom("boot", window.intercomSettings);
`,
				},
			},
			options,
		}),

	zendeskChat: ({
		key,
		id = 'zendesk-chat',
		name = 'Zendesk Chat',
		nameKey = 'cookies.zendeskChat.name',
		descriptionKey = 'cookies.zendeskChat.description',
		loadKey = `zendesk:${key}`,
		options,
	}: BasePresetOptions & { key: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://static.zdassets.com/ekr/snippet.js?key=${key}`,
			options: {
				...options,
				scriptAttributes: {
					id: 'ze-snippet',
					...options?.scriptAttributes,
				},
			},
		}),

	crispChat: ({
		websiteId,
		id = 'crisp-chat',
		name = 'Crisp Chat',
		nameKey = 'cookies.crispChat.name',
		descriptionKey = 'cookies.crispChat.description',
		loadKey = 'crisp-chat',
		options,
	}: BasePresetOptions & { websiteId: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://client.crisp.chat/l.js',
			beforeLoad: `
window.$crisp = window.$crisp || [];
window.CRISP_WEBSITE_ID = "${websiteId}";
`,
			options,
		}),

	tawkTo: ({
		propertyId,
		widgetId,
		id = 'tawk-to',
		name = 'Tawk.to',
		nameKey = 'cookies.tawkTo.name',
		descriptionKey = 'cookies.tawkTo.description',
		loadKey = `tawk-to:${propertyId}:${widgetId}`,
		options,
	}: BasePresetOptions & {
		propertyId: string;
		widgetId: string;
	}): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://embed.tawk.to/${propertyId}/${widgetId}`,
			beforeLoad: `
window.Tawk_API = window.Tawk_API || {};
window.Tawk_LoadStart = new Date();
`,
			options,
		}),

	jivoSite: ({
		widgetId,
		id = 'jivosite',
		name = 'JivoSite',
		nameKey = 'cookies.jivoSite.name',
		descriptionKey = 'cookies.jivoSite.description',
		loadKey = `jivosite:${widgetId}`,
		options,
	}: BasePresetOptions & { widgetId: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://code.jivosite.com/widget/${widgetId}`,
			options,
		}),

	liveChat: ({
		license,
		id = 'livechat',
		name = 'LiveChat',
		nameKey = 'cookies.liveChat.name',
		descriptionKey = 'cookies.liveChat.description',
		loadKey = 'livechat',
		options,
	}: BasePresetOptions & { license: string | number }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://cdn.livechatinc.com/tracking.js',
			beforeLoad: `
window.__lc = window.__lc || {};
window.__lc.license = ${license};
`,
			options,
		}),

	tidio: ({
		publicKey,
		id = 'tidio',
		name = 'Tidio',
		nameKey = 'cookies.tidio.name',
		descriptionKey = 'cookies.tidio.description',
		loadKey = `tidio:${publicKey}`,
		options,
	}: BasePresetOptions & { publicKey: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://code.tidio.co/${publicKey}.js`,
			options,
		}),

	chatwoot: ({
		websiteToken,
		baseUrl = 'https://app.chatwoot.com',
		id = 'chatwoot',
		name = 'Chatwoot',
		nameKey = 'cookies.chatwoot.name',
		descriptionKey = 'cookies.chatwoot.description',
		loadKey = `chatwoot:${baseUrl}:${websiteToken}`,
		options,
	}: BasePresetOptions & {
		websiteToken: string;
		baseUrl?: string;
	}): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			code: `
window.chatwootSettings = window.chatwootSettings || {};
(function(d,t) {
  var BASE_URL = "${baseUrl.replace(/\/$/, '')}";
  var g = d.createElement(t);
  var s = d.getElementsByTagName(t)[0];
  g.src = BASE_URL + "/packs/js/sdk.js";
  g.defer = true;
  g.async = true;
  s.parentNode.insertBefore(g,s);
  g.onload = function() {
    window.chatwootSDK.run({
      websiteToken: "${websiteToken}",
      baseUrl: BASE_URL
    });
  };
})(document, "script");
`,
			options,
		}),

	chatra: ({
		chatraId,
		id = 'chatra',
		name = 'Chatra',
		nameKey = 'cookies.chatra.name',
		descriptionKey = 'cookies.chatra.description',
		loadKey = 'chatra',
		options,
	}: BasePresetOptions & { chatraId: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: 'https://call.chatra.io/chatra.js',
			beforeLoad: `
window.ChatraID = "${chatraId}";
window.Chatra = window.Chatra || function(){ (window.Chatra.q = window.Chatra.q || []).push(arguments); };
`,
			options,
		}),

	recaptcha: ({
		siteKey,
		id = 'google-recaptcha',
		name = 'Google reCAPTCHA',
		nameKey = 'cookies.recaptcha.name',
		descriptionKey = 'cookies.recaptcha.description',
		loadKey = `recaptcha:${siteKey}`,
		options,
	}: BasePresetOptions & { siteKey: string }): ScriptPreset =>
		addScript('functional', {
			id,
			name,
			nameKey,
			descriptionKey,
			loadKey,
			src: `https://www.google.com/recaptcha/api.js?render=${siteKey}`,
			options,
		}),
};
