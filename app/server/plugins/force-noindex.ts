export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:html', (html, { event }) => {
		const config = useRuntimeConfig(event).myelophone;

		if (!config.noindex) {
			return;
		}

		const robotsMetaRegex = /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi;

		let robotsFound = false;

		html.head = html.head.map((chunk) => {
			if (!robotsMetaRegex.test(chunk)) {
				robotsMetaRegex.lastIndex = 0;
				return chunk;
			}

			robotsMetaRegex.lastIndex = 0;
			robotsFound = true;

			return chunk.replace(
				robotsMetaRegex,
				'<meta name="robots" content="noindex, nofollow">',
			);
		});

		if (!robotsFound) {
			html.head.push('<meta name="robots" content="noindex, nofollow">');
		}
	});

	nitroApp.hooks.hook('render:response', (response, { event }) => {
		const config = useRuntimeConfig(event).myelophone;

		if (!config.noindex) {
			return;
		}

		response.headers ??= {};
		response.headers['X-Robots-Tag'] = 'noindex, nofollow';
	});
});
