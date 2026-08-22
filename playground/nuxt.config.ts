import { defineNuxtConfig, type NuxtConfig } from 'nuxt/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const myelophonePath = path.resolve(dirname, 'myelophone.ts');

const baseConfig = defineNuxtConfig({
	extends: ['../'],
});

let extendedConfig: NuxtConfig = {};

function isNuxtConfig(value: unknown): value is NuxtConfig {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

type DefaultSeo = {
	title?: string;
	description?: string;
};

function getStringDefaultSeo(value: unknown): DefaultSeo {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return {};
	}

	const seo = value as Record<string, unknown>;

	return {
		...(typeof seo.title === 'string' ? { title: seo.title } : {}),
		...(typeof seo.description === 'string'
			? { description: seo.description }
			: {}),
	};
}

if (fs.existsSync(myelophonePath)) {
	try {
		const mod = await import(pathToFileURL(myelophonePath).href);
		const config = mod.default || mod;

		if (isNuxtConfig(config)) {
			extendedConfig = config as NuxtConfig;
			const title = extendedConfig.app?.head?.title;
			const appConfig = extendedConfig.appConfig as
				| {
						defaultSeo?: unknown;
				  }
				| undefined;
			const defaultSeo = getStringDefaultSeo(appConfig?.defaultSeo);

			if (typeof title === 'string' && !defaultSeo.title) {
				extendedConfig.appConfig = {
					...(extendedConfig.appConfig || {}),
					defaultSeo: {
						...defaultSeo,
						title,
					},
				};
			}
		} else {
			console.warn(
				'[myelophone-nuxt] ignored: myelophone.ts export is not a valid NuxtConfig object.',
			);
		}
	} catch (err) {
		console.warn(
			'[myelophone-nuxt] failed to load configuration:',
			(err as Error).message,
		);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: we do not know type of records
function isObject(value: unknown): value is Record<string, any> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// biome-ignore lint/suspicious/noExplicitAny: we do not know type of records
function deepMerge<T extends Record<string, any>>(target: T, source: T): T {
	// biome-ignore lint/suspicious/noExplicitAny: we do not know type of records
	const result: Record<string, any> = { ...target };

	for (const key of Object.keys(source)) {
		const a = target[key as keyof T];
		const b = source[key as keyof T];

		if (Array.isArray(a) && Array.isArray(b)) {
			result[key] = [...a, ...b.filter((x: unknown) => !a.includes(x))];
		} else if (isObject(a) && isObject(b)) {
			result[key] = deepMerge(a, b);
		} else if (b !== undefined) {
			result[key] = b;
		}
	}

	return result as T;
}

const mergedConfig = deepMerge(baseConfig, extendedConfig);
mergedConfig.extends = baseConfig.extends;

export default defineNuxtConfig(mergedConfig);
