import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_SAFE_LIST_PATH = path.join(
	'.nuxt',
	'i18n-safelist.generated.json',
);

let safeListSessionStarted = false;

const isTranslationKey = (value: unknown): value is string =>
	typeof value === 'string' &&
	/^[a-zA-Z0-9/_-]+(?:\.[a-zA-Z0-9/_-]+)+$/.test(value);

const collectKeys = (
	source: unknown,
	keys = new Set<string>(),
	allowDirectString = true,
) => {
	if (!source) return keys;

	if (allowDirectString && isTranslationKey(source)) {
		keys.add(source);
		return keys;
	}

	if (Array.isArray(source)) {
		source.forEach((item) => collectKeys(item, keys, true));
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

		collectKeys(value, keys, false);
	});

	return keys;
};

export const useSafeList = (
	source: unknown,
	{
		safelistPath = DEFAULT_SAFE_LIST_PATH,
		cwd = process.cwd(),
	}: {
		safelistPath?: string;
		cwd?: string;
	} = {},
) => {
	const outputPath = path.isAbsolute(safelistPath)
		? safelistPath
		: path.resolve(cwd, safelistPath);
	const keys = new Set<string>();

	if (safeListSessionStarted && fs.existsSync(outputPath)) {
		try {
			(
				JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as unknown[]
			).forEach((key) => {
				if (isTranslationKey(key)) keys.add(key);
			});
		} catch (e) {}
	}

	safeListSessionStarted = true;
	collectKeys(source, keys);

	const sortedKeys = Array.from(keys).sort();
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(
		outputPath,
		`${JSON.stringify(sortedKeys, null, 2)}\n`,
		'utf-8',
	);

	return sortedKeys;
};
