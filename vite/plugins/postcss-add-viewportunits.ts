import type { PluginCreator, Rule } from 'postcss';

const dvUnitsMap: Record<string, { prop: string; value: string }> = {
	'h-screen': { prop: 'height', value: '100dvh' },
	'min-h-screen': { prop: 'min-height', value: '100dvh' },
	'w-screen': { prop: 'width', value: '100dvw' },
	'min-w-screen': { prop: 'min-width', value: '100dvw' },
};

const creator: PluginCreator<{}> = () => ({
	postcssPlugin: 'postcss-add-dv-units-inline',

	Rule(rule: Rule) {
		const selector = rule.selector.trim();
		const clsName = selector.startsWith('.') ? selector.slice(1) : '';
		const config = dvUnitsMap[clsName];
		if (!config) return;

		const { prop, value } = config;

		let exists = false;
		rule.walkDecls(prop, (decl) => {
			if (decl.value === value) exists = true;
		});

		if (!exists) {
			rule.append({ prop, value });
		}
	},
});

creator.postcss = true;
export default creator;
