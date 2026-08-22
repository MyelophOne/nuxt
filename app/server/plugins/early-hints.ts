import { writeEarlyHints } from 'h3';

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:html', (htmlContext, { event }) => {
		const links: string[] = [];

		for (const tag of htmlContext.head) {
			if (typeof tag !== 'string') continue;

			if (tag.includes('rel="stylesheet"')) {
				const match = tag.match(/href="([^"]+\.css[^"]*)"/);
				if (match && match[1]) {
					links.push(`<${match[1]}>; rel=preload; as=style`);
				}
			}

			if (tag.includes('rel="modulepreload"')) {
				const match = tag.match(/href="([^"]+\.js[^"]*)"/);
				if (match && match[1]) {
					links.push(
						`<${match[1]}>; rel=modulepreload; as=script; crossorigin`,
					);
				}
			}
		}

		if (links.length > 0) {
			writeEarlyHints(event, links);
		}
	});
});
