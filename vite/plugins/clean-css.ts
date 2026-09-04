import type { Plugin } from 'vite';
import postcss, { type AcceptedPlugin } from 'postcss';
import { PurgeCSS } from 'purgecss';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { useLogger } from '@nuxt/kit';

interface CleanCssPluginOptions {
	postcssPlugins?: AcceptedPlugin[];
	purgeTailwindUtilities?: boolean;
}

function formatBytes(bytes: number): string {
	if (bytes === 0) {
		return '0 B';
	}

	const units = ['B', 'KB', 'MB', 'GB'];
	const unitIndex = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		units.length - 1,
	);
	const value = bytes / 1024 ** unitIndex;

	return `${parseFloat(value.toFixed(2))} ${units[unitIndex]}`;
}

export function cleanEmptyCssPlugin(
	options: CleanCssPluginOptions = {},
): Plugin {
	const EMPTY_VAR_REGEX = /--[a-zA-Z0-9-_]+\s*:\s*;/g;
	const sourceFiles = new Set<string>();
	const reports: string[] = [];
	const SOURCE_FILE_RE = /\.(?:[cm]?[jt]sx?|vue|json)$/i;
	const extractTailwindCandidates = (content: string) =>
		content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
	const logger = useLogger('@myelophone/nuxt');

	function removeUnresolved(css: string) {
		const root = postcss.parse(css);
		root.walkRules((rule) => {
			if (/\\\$/.test(rule.selector)) {
				rule.remove();
			}
		});
		return root.toString();
	}

	async function purgeTailwindUtilities(css: string, content: string) {
		const root = postcss.parse(css);
		const utilityLayers: postcss.AtRule[] = [];

		root.walkAtRules('layer', (rule) => {
			if (rule.params.trim() === 'utilities') {
				utilityLayers.push(rule);
			}
		});

		if (utilityLayers.length === 0) {
			return { css, before: 0, after: 0 };
		}

		const before = utilityLayers.reduce(
			(size, layer) => size + Buffer.byteLength(layer.toString(), 'utf8'),
			0,
		);

		const result = await new PurgeCSS().purge({
			content: [{ raw: content, extension: 'js' }],
			css: utilityLayers.map((layer) => ({ raw: layer.toString() })),
			defaultExtractor: extractTailwindCandidates,
		});

		for (const [index, layer] of utilityLayers.entries()) {
			const purgedLayer = postcss.parse(result[index]?.css || '');
			let replacement: postcss.AtRule | undefined;

			purgedLayer.walkAtRules('layer', (rule) => {
				if (!replacement && rule.params.trim() === 'utilities') {
					replacement = rule;
				}
			});

			if (replacement) {
				layer.replaceWith(replacement);
			} else {
				layer.remove();
			}
		}

		const output = root.toString();
		const outputRoot = postcss.parse(output);
		let after = 0;
		outputRoot.walkAtRules('layer', (rule) => {
			if (rule.params.trim() === 'utilities') {
				after += Buffer.byteLength(rule.toString(), 'utf8');
			}
		});

		return {
			css: output,
			before,
			after,
		};
	}

	async function collectFiles(directory: string): Promise<string[]> {
		const entries = await readdir(directory, { withFileTypes: true });
		const files = await Promise.all(
			entries.map(async (entry) => {
				const file = join(directory, entry.name);
				return entry.isDirectory() ? collectFiles(file) : [file];
			}),
		);

		return files.flat();
	}

	return {
		name: 'myelophone-vite-clean-css',
		apply: 'build',
		generateBundle(_, bundle) {
			sourceFiles.clear();

			for (const output of Object.values(bundle)) {
				if (output.type !== 'chunk') {
					continue;
				}

				for (const id of Object.keys(output.modules)) {
					const sourceFile = id.split('?', 1)[0];
					if (sourceFile && SOURCE_FILE_RE.test(sourceFile)) {
						sourceFiles.add(sourceFile);
					}
				}
			}
		},
		async writeBundle(outputOptions) {
			reports.length = 0;

			if (!outputOptions.dir) {
				return;
			}

			const files = await collectFiles(outputOptions.dir);
			const sourceContent = (
				await Promise.all(
					[...sourceFiles].map(async (file) => {
						try {
							return await readFile(file, 'utf8');
						} catch {
							return '';
						}
					}),
				)
			).filter(Boolean);

			for (const file of files.filter((file) => file.endsWith('.css'))) {
				let css = await readFile(file, 'utf8');
				const sizeBefore = Buffer.byteLength(css, 'utf8');
				let utilitiesBefore = 0;
				let utilitiesAfter = 0;

				css = css.replace(EMPTY_VAR_REGEX, '');
				css = removeUnresolved(css);

				if (
					options.purgeTailwindUtilities &&
					sourceContent.length > 0
				) {
					const purgeResult = await purgeTailwindUtilities(
						css,
						sourceContent.join('\n'),
					);
					css = purgeResult.css;
					utilitiesBefore = purgeResult.before;
					utilitiesAfter = purgeResult.after;
				}

				if (
					options.postcssPlugins &&
					options.postcssPlugins.length > 0
				) {
					const result = await postcss(
						options.postcssPlugins,
					).process(css, {
						from: undefined,
					});
					css = result.css;
				}

				await writeFile(file, css);
				const sizeAfter = Buffer.byteLength(css, 'utf8');
				reports.push(
					`.../${basename(file)} (${formatBytes(sizeBefore)} → ${formatBytes(sizeAfter)})`,
				);
			}
		},
		closeBundle() {
			if (this.environment?.name !== 'client') {
				return;
			}
			logger.info('Purging css...');
			for (const report of reports) {
				logger.info(report);
			}
		},
	};
}
