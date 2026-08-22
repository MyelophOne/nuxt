export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:html', (html) => {
		const compact = (fragment: string) => fragment.replace(/[\r\n]+/g, ' ');
		const sections = [
			html.head,
			html.bodyPrepend,
			html.body,
			html.bodyAppend,
		];

		for (const section of sections) {
			for (let index = 0; index < section.length; index++) {
				section[index] = compact(section[index]!);
			}
		}
	});
});
