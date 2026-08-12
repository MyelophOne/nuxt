export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:html', (htmlContext) => {
		const allAvailableTags = [
			...htmlContext.head,
			...htmlContext.bodyPrepend,
		];

		const entryCssTag = allAvailableTags.find((tag) => {
			return (
				tag.includes('.css') &&
				tag.includes('entry') &&
				tag.includes('rel="stylesheet"')
			);
		});

		if (!entryCssTag) {
			return;
		}

		const hrefMatch = entryCssTag.match(
			/\bhref\s*=\s*(?:"([^"]+)"|'([^']+)')/i,
		);

		const cssUrl = hrefMatch?.[1] ?? hrefMatch?.[2];

		if (!cssUrl) {
			return;
		}

		const preloadExists = htmlContext.head.some((tag) => {
			return (
				tag.includes('rel="preload"') &&
				(tag.includes(`href="${cssUrl}"`) ||
					tag.includes(`href='${cssUrl}'`))
			);
		});

		if (preloadExists) {
			return;
		}

		htmlContext.head.unshift(
			`<link rel="preload" href="${cssUrl}" as="style" fetchpriority="high" crossorigin>`,
		);
	});
});
