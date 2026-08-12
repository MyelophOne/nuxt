import { defineNuxtConfig, type NuxtConfig } from 'nuxt/config';
import fs from 'node:fs';
import path from 'node:path';

const myelophonePath = path.resolve(__dirname, 'myelophone.ts');

const baseConfig = defineNuxtConfig({
	extends: ['../'],
});

let extendedConfig: NuxtConfig = {};

function isNuxtConfig(value: unknown): value is NuxtConfig {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

if (fs.existsSync(myelophonePath)) {
	try {
		const mod = await import(myelophonePath);
		const config = mod.default || mod;

		if (isNuxtConfig(config)) {
			extendedConfig = config as NuxtConfig;
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
