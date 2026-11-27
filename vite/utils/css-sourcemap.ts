import type { UserConfig } from 'vite';

export function migrateCssSourcemap(config: UserConfig) {
	const legacySourcemap = config.css?.devSourcemap;
	if (legacySourcemap === undefined) return;

	config.dev ||= {};
	if (typeof config.dev.sourcemap !== 'boolean') {
		config.dev.sourcemap = {
			...config.dev.sourcemap,
			css: config.dev.sourcemap?.css ?? legacySourcemap,
		};
	}

	delete config.css?.devSourcemap;
}
