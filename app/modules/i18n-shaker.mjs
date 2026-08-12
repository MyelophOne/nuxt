import fs from 'node:fs';
import path from 'node:path';

const I18N_SAFE_LIST_READY_KEY = '__i18nSafeListReady';
const I18N_SAFE_LIST_KEYS_KEY = '__i18nSafeListKeys';

function getDefaultSafelistPath() {
	return path.join('.nuxt', 'i18n-safelist.generated.json');
}

export default function i18nTreeShaker(options = {}) {
	const {
		localesDir = 'locales',
		safelistPath,
		generatedSafelistPath = getDefaultSafelistPath(),
		scanDirs,
	} = options;
	const usedKeys = new Set();

	function getFiles(dir) {
		if (!fs.existsSync(dir)) return [];
		const dirents = fs.readdirSync(dir, { withFileTypes: true });
		const files = dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name);
			return dirent.isDirectory() ? getFiles(res) : res;
		});
		return files.flat();
	}

	function setDeep(obj, pathStr, value) {
		const keys = pathStr.split('.');
		let current = obj;
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!current[key]) current[key] = {};
			current = current[key];
		}
		current[keys[keys.length - 1]] = value;
	}

	function getDeep(obj, pathStr) {
		if (!pathStr) return obj;
		return pathStr.split('.').reduce((acc, key) => acc && acc[key], obj);
	}

	function readSafelistFile(filePath) {
		if (!filePath || !fs.existsSync(filePath)) return [];

		try {
			const content = fs.readFileSync(filePath, 'utf-8');
			const parsed = JSON.parse(content);
			return Array.isArray(parsed) ? parsed : [];
		} catch (e) {
			return [];
		}
	}

	function writeSafelistFile(filePath, keys) {
		if (!filePath) return;

		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(
			filePath,
			`${JSON.stringify(Array.from(keys).sort(), null, 2)}\n`,
			'utf-8',
		);
	}

	return {
		name: 'vite-plugin-i18n-shaker',
		enforce: 'pre',
		apply: 'build',

		async buildStart() {
			usedKeys.clear();

			const safeListReady = globalThis[I18N_SAFE_LIST_READY_KEY];
			if (safeListReady && typeof safeListReady.then === 'function') {
				await safeListReady;
			}

			const resolvedGeneratedSafelistPath = path.isAbsolute(
				generatedSafelistPath,
			)
				? generatedSafelistPath
				: path.resolve(process.cwd(), generatedSafelistPath);
			const resolvedManualSafelistPath = safelistPath
				? path.isAbsolute(safelistPath)
					? safelistPath
					: path.resolve(process.cwd(), safelistPath)
				: null;
			const registeredKeys = globalThis[I18N_SAFE_LIST_KEYS_KEY];
			const generatedKeys = new Set(
				registeredKeys instanceof Set
					? Array.from(registeredKeys)
					: Array.isArray(registeredKeys)
						? registeredKeys
						: [],
			);

			readSafelistFile(resolvedManualSafelistPath).forEach((key) => {
				if (typeof key === 'string') usedKeys.add(key);
			});

			if (generatedKeys.size) {
				writeSafelistFile(resolvedGeneratedSafelistPath, generatedKeys);
				generatedKeys.forEach((key) => usedKeys.add(key));
			}

			const rootDir = process.cwd();
			const defaultScanDirs = [
				path.resolve(rootDir, 'app'),
				...(process.env.NUXT_PLAYGROUND === 'true'
					? [path.resolve(rootDir, 'playground')]
					: []),
			];
			const projectLayers = scanDirs || defaultScanDirs;

			projectLayers.forEach((layerPath) => {
				if (fs.existsSync(layerPath)) {
					getFiles(layerPath).forEach((file) => {
						if (/\.(vue|ts|js|mjs)$/.test(file)) {
							const content = fs.readFileSync(file, 'utf-8');

							const regex =
								/(?:(?:\$t|t|tn)\s*\(\s*['"`])([a-zA-Z0-9/_.-]+)(?=['"`]\s*[,)])/g;

							const matches = content.matchAll(regex);
							for (const match of matches) {
								if (match[1]) usedKeys.add(match[1]);
							}

							const keepRegex =
								/@i18n-keep\s+([a-zA-Z0-9/_.-]+)/g;
							const keepMatches = content.matchAll(keepRegex);
							for (const match of keepMatches) {
								if (match[1]) usedKeys.add(match[1]);
							}
						}
					});
				}
			});
		},

		transform(code, id) {
			const cleanId = id.split('?')[0].replace(/\\/g, '/');

			if (
				cleanId.includes(`/${localesDir}/`) &&
				cleanId.endsWith('.json')
			) {
				try {
					const rawJson = JSON.parse(code);
					const filteredJson = {};
					let keptCount = 0;

					const parts = cleanId
						.split(`/${localesDir}/`)[1]
						.split('/');
					const namespace = parts
						.slice(1)
						.join('/')
						.replace('.json', '');

					usedKeys.forEach((fullKey) => {
						if (
							fullKey.startsWith(`${namespace}.`) ||
							fullKey === namespace
						) {
							const internalKey =
								fullKey === namespace
									? ''
									: fullKey.slice(namespace.length + 1);

							const value = getDeep(rawJson, internalKey);
							if (value !== undefined) {
								if (typeof value === 'string') {
									setDeep(filteredJson, internalKey, value);
									keptCount++;
								} else if (typeof value === 'object') {
									setDeep(filteredJson, internalKey, value);
									keptCount += Object.keys(value).length;
								}
							}

							const pathParts = internalKey.split('.');
							const lastPart = pathParts.pop();
							const parentPath = pathParts.join('.');
							const parentObj = getDeep(rawJson, parentPath);

							if (parentObj && typeof parentObj === 'object') {
								Object.keys(parentObj).forEach((k) => {
									if (k.startsWith(`${lastPart}_`)) {
										const pluralPath = parentPath
											? `${parentPath}.${k}`
											: k;
										setDeep(
											filteredJson,
											pluralPath,
											parentObj[k],
										);
										keptCount++;
									}
								});
							}
						}
					});

					return {
						code: JSON.stringify(filteredJson),
						map: null,
					};
				} catch (e) {
					console.error(`[i18n-shaker] Error in ${id}:`, e);
					return null;
				}
			}
			return null;
		},
	};
}
