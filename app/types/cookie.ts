export const COOKIE_CATEGORIES = [
	'necessary',
	'analytics',
	'marketing',
	'functional',
] as const;

export type CookieCategory = (typeof COOKIE_CATEGORIES)[number];

export type CookieSelection = {
	[K in CookieCategory]: boolean;
};

export type LocalizedCookieText = string | Record<string, string>;

export type CookieScriptLegalBasis =
	| 'consent'
	| 'cookieless'
	| 'legitimateInterest'
	| 'contract'
	| 'legalObligation'
	| 'essential';

export interface CookiePreferences extends CookieSelection {
	timestamp: number;
	status: 'accepted' | 'declined' | 'pending';
}

export interface CookieScriptDef {
	id: string;
	name: LocalizedCookieText;
	nameKey?: string;
	description?: LocalizedCookieText;
	descriptionKey?: string;
	provider?: string;
	legalBasis?: CookieScriptLegalBasis;
	legal?: CookieScriptLegalInfo;
	loadKey?: string;
	src?: string;
	code?: string;
	initializers?: CookieScriptInitializer[];
	beforeLoad?: string;
	onConsentChange?: string;
	categorySettings?: Partial<
		Record<CookieCategory, CookieScriptCategorySettings>
	>;
	options?: any;
}

export interface CookieScriptInitializer {
	key: string;
	code: string;
}

export interface CookieScriptLegalInfo {
	purpose?: LocalizedCookieText;
	purposeKey?: string;
	dataCollected?: LocalizedCookieText[];
	dataCollectedKeys?: string[];
	cookiesUsed?: boolean;
	cookiesDescription?: LocalizedCookieText;
	cookiesDescriptionKey?: string;
	retention?: LocalizedCookieText;
	retentionKey?: string;
	privacyPolicyUrl?: string;
	officialDocsUrl?: string;
	internationalTransfer?: boolean;
	notes?: LocalizedCookieText;
	notesKey?: string;
}

export interface CookieScriptCategorySettings {
	description?: LocalizedCookieText;
	descriptionKey?: string;
	initializers?: CookieScriptInitializer[];
	beforeLoad?: string;
	onConsentChange?: string;
	options?: any;
}

export type CookieScriptsConfig = Partial<
	Record<CookieCategory, CookieScriptDef[]>
> & {
	notices?: CookieScriptDef[];
};

export type CookieControlConfig = {
	enabled: boolean;
};
