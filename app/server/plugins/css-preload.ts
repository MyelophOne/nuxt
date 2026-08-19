export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:html', (html) => {
		const head = html.head.join('');

		const cssLinks =
			head.match(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi) ?? [];

		const mainCssLink = cssLinks[0];

		if (!mainCssLink) {
			return;
		}

		const href = mainCssLink.match(
			/\bhref=["']([^"']+\.css(?:\?[^"']*)?)["']/i,
		)?.[1];

		if (!href) {
			return;
		}

		html.head.unshift(
			`<link rel="preload" href="${href}" as="style" fetchPriority="high" crossorigin>`,
		);
	});
});
