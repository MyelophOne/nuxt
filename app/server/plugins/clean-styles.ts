export default defineNitroPlugin((nitroApp) => {
	const emptyStyleRegex = /<style\b[^>]*>\s*<\/style>/gi;

	nitroApp.hooks.hook('render:html', (html) => {
		html.head = html.head
			.map((tag) => tag.replace(emptyStyleRegex, ''))
			.filter(Boolean);
	});

	nitroApp.hooks.hook('render:html:close', (html) => {
		html.bodyAppend = html.bodyAppend
			.map((tag) => tag.replace(emptyStyleRegex, ''))
			.filter(Boolean);
	});
});
