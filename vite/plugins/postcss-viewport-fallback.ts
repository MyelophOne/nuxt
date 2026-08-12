import type { PluginCreator } from 'postcss';

const unitsMap: Record<string, string> = {
	dvh: 'vh',
	svh: 'vh',
	lvh: 'vh',
	vhc: 'vh',

	dvw: 'vw',
	svw: 'vw',
	lvw: 'vw',
	vwc: 'vw',
};

const creator: PluginCreator<{}> = () => {
	return {
		postcssPlugin: 'postcss-viewport-fallback',

		Declaration(decl) {
			const reg = /(\d*\.?\d+)(dvh|svh|lvh|vhc|dvw|svw|lvw|vwc)\b/gi;

			if (!reg.test(decl.value)) return;

			const fallbackVal = decl.value.replace(
				reg,
				(_, num: string, unit: string) => {
					const fallbackUnit = unitsMap[unit.toLowerCase()];
					return fallbackUnit
						? `${num}${fallbackUnit}`
						: `${num}${unit}`;
				},
			);

			if (fallbackVal === decl.value) return;

			let exists = false;
			decl.parent?.walkDecls(decl.prop, (d) => {
				if (d.value === fallbackVal) exists = true;
			});

			if (!exists) {
				decl.cloneBefore({ value: fallbackVal });
			}
		},
	};
};

creator.postcss = true;
export default creator;
