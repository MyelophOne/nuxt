import type { Plugin } from 'vite';
import postcss, { type AcceptedPlugin } from 'postcss';

interface CleanCssPluginOptions {
	postcssPlugins?: AcceptedPlugin[];
}

export function cleanEmptyCssPlugin(
	options: CleanCssPluginOptions = {},
): Plugin {
	const EMPTY_VAR_REGEX = /--[a-zA-Z0-9-_]+\s*:\s*;/g;

	function removeUnresolved(css: string) {
		const root = postcss.parse(css);
		root.walkRules((rule) => {
			if (/\\\$/.test(rule.selector)) {
				rule.remove();
			}
		});
		return root.toString();
	}

	return {
		name: 'myelophone-vite-clean-css',
		apply: 'build',
		async generateBundle(_, bundle) {
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (
					fileName.endsWith('.css') &&
					'source' in chunk &&
					typeof chunk.source === 'string'
				) {
					let css = chunk.source;

					css = css.replace(EMPTY_VAR_REGEX, '');

					css = removeUnresolved(css);

					if (
						options.postcssPlugins &&
						options.postcssPlugins.length > 0
					) {
						const result = await postcss(
							options.postcssPlugins,
						).process(css, { from: undefined });
						css = result.css;
					}

					if (css !== chunk.source) {
						const sizeBefore = Buffer.byteLength(
							chunk.source,
							'utf8',
						);
						const sizeAfter = Buffer.byteLength(css, 'utf8');
						const removed = sizeBefore - sizeAfter;

						chunk.source = css;
					}
				}
			}
		},
	};
}
