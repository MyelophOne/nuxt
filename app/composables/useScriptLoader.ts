import type {
	CookieScriptsConfig,
	CookieScriptDef,
	CookieCategory,
	CookiePreferences,
} from '~/types/cookie';

type CookieScriptEntry = {
	category: CookieCategory;
	script: CookieScriptDef;
};

export const useScriptLoader = () => {
	const runtimeConfig = useRuntimeConfig();
	const scriptsConfig = runtimeConfig.public
		.cookieScripts as CookieScriptsConfig;
	const loadedScripts = reactive(new Set<string>());
	const initializedScripts = reactive(new Set<string>());
	const executedInitializers = reactive(new Set<string>());
	const appliedCategorySettings = reactive(new Set<string>());

	const getScriptLoadKey = (script: CookieScriptDef) =>
		script.loadKey || script.src || `inline:${script.id}`;

	const getScriptSettingsKey = (
		script: CookieScriptDef,
		category: CookieCategory,
	) =>
		`${script.id}:${category}:${script.src || script.code || script.loadKey || ''}`;

	const getAllScriptEntries = (): CookieScriptEntry[] =>
		Object.entries(scriptsConfig || {}).flatMap(([category, scripts]) =>
			(scripts || []).map((script) => ({
				category: category as CookieCategory,
				script,
			})),
		);

	const getAllowedScriptEntries = (
		allowedCategories: Set<CookieCategory>,
	) => {
		const seen = new Set<string>();

		return getAllScriptEntries().filter(({ category, script }) => {
			const settingsKey = getScriptSettingsKey(script, category);
			if (!allowedCategories.has(category) || seen.has(settingsKey)) {
				return false;
			}

			seen.add(settingsKey);
			return true;
		});
	};

	const getAllowedCategories = (prefs?: CookiePreferences) => {
		const allowed = new Set<CookieCategory>(['necessary']);

		if (prefs?.status === 'accepted' || prefs?.status === 'declined') {
			if (prefs.analytics) allowed.add('analytics');
			if (prefs.marketing) allowed.add('marketing');
			if (prefs.functional) allowed.add('functional');
		}

		return allowed;
	};

	const createExecutionContext = (
		script: CookieScriptDef,
		allowedCategories: Set<CookieCategory>,
	) => ({
		script,
		allowedCategories: Array.from(allowedCategories),
		categories: {
			necessary: allowedCategories.has('necessary'),
			analytics: allowedCategories.has('analytics'),
			marketing: allowedCategories.has('marketing'),
			functional: allowedCategories.has('functional'),
		},
		isAllowed: (category: CookieCategory) =>
			allowedCategories.has(category),
	});

	const runClientCode = (
		code: string | undefined,
		script: CookieScriptDef,
		allowedCategories: Set<CookieCategory>,
	) => {
		if (!code || !import.meta.client) return;

		try {
			Function(
				'context',
				code,
			)(createExecutionContext(script, allowedCategories));
		} catch (e) {
			console.error(`Error running cookie script hook ${script.id}:`, e);
		}
	};

	const runInitializers = (
		def: CookieScriptDef,
		allowedCategories: Set<CookieCategory>,
		initializers = def.initializers || [],
	) => {
		initializers.forEach((initializer) => {
			if (executedInitializers.has(initializer.key)) return;

			runClientCode(initializer.code, def, allowedCategories);
			executedInitializers.add(initializer.key);
		});
	};

	const applyScriptSettings = (
		def: CookieScriptDef,
		category: CookieCategory,
		allowedCategories: Set<CookieCategory>,
	) => {
		runInitializers(def, allowedCategories);

		if (!initializedScripts.has(def.id)) {
			runClientCode(def.beforeLoad, def, allowedCategories);
			initializedScripts.add(def.id);
		}

		const settings = def.categorySettings?.[category];
		const settingsKey = getScriptSettingsKey(def, category);
		if (!settings || appliedCategorySettings.has(settingsKey)) {
			runClientCode(def.onConsentChange, def, allowedCategories);
			return;
		}

		runInitializers(def, allowedCategories, settings.initializers);
		runClientCode(settings.beforeLoad, def, allowedCategories);
		runClientCode(settings.onConsentChange, def, allowedCategories);
		appliedCategorySettings.add(settingsKey);

		runClientCode(def.onConsentChange, def, allowedCategories);
	};

	const loadScriptGroup = (
		loadKey: string,
		entries: CookieScriptEntry[],
		allowedCategories: Set<CookieCategory>,
	) => {
		entries.forEach(({ category, script }) => {
			applyScriptSettings(script, category, allowedCategories);
		});

		if (loadedScripts.has(loadKey)) return;

		const def = entries.find(
			({ script }) => script.src || script.code,
		)?.script;
		if (!def) return;

		if (import.meta.dev) {
			console.log(`[DEV-MOCK] Loading script: [${def.id}] ${loadKey}`);
			loadedScripts.add(loadKey);
			return;
		}

		try {
			if (def.src) {
				useScript(def.src, {
					...def.options,
					scriptAttributes: {
						'data-cookie-script-key': loadKey,
						'data-cookie-categories':
							Array.from(allowedCategories).join(','),
						...def.options?.scriptAttributes,
					},
				});
			} else if (def.code) {
				useScript({
					innerHTML: def.code,
					...def.options,
				});
			}
			loadedScripts.add(loadKey);
		} catch (e) {
			console.error(`Error loading script ${def.id}:`, e);
		}
	};

	const loadAllowedScripts = (allowedCategories: Set<CookieCategory>) => {
		const scriptGroups = new Map<string, CookieScriptEntry[]>();

		getAllowedScriptEntries(allowedCategories).forEach((entry) => {
			const loadKey = getScriptLoadKey(entry.script);
			scriptGroups.set(loadKey, [
				...(scriptGroups.get(loadKey) || []),
				entry,
			]);
		});

		scriptGroups.forEach((entries, loadKey) => {
			loadScriptGroup(loadKey, entries, allowedCategories);
		});
	};

	const initScripts = () => {
		if (!import.meta.client) return;

		const { cookiePreferences } = useCookieControl();

		onNuxtReady(() => {
			watch(
				() => cookiePreferences.value,
				(prefs) => {
					loadAllowedScripts(getAllowedCategories(prefs));
				},
				{ deep: true, immediate: true },
			);
		});
	};

	return {
		initScripts,
		allScriptsConfig: scriptsConfig,
	};
};
