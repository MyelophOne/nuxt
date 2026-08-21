export default defineNitroPlugin((nitroApp) => {
	const emptyStyleRegex = /<style\b[^>]*>\s*<\/style>/gi;
	const deferredBody = new WeakMap<
		object,
		{ body: string[]; bodyAppend: string[] }
	>();
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	const normalizeScriptNonces = (source: string) =>
		source.replace(/<script\b[^>]*>/gi, (tag) => {
			let hasNonce = false;
			return tag.replace(/\snonce="[^"]*"/gi, (attribute) => {
				if (hasNonce) {
					return '';
				}
				hasNonce = true;
				return attribute;
			});
		});

	nitroApp.hooks.hook('render:html', (html) => {
		html.head = html.head
			.map((tag) => tag.replace(emptyStyleRegex, ''))
			.filter(Boolean);
	});

	nitroApp.hooks.afterEach(({ name, args }) => {
		if (name !== 'render:html') {
			return;
		}

		const html = args[0] as {
			head: string[];
			bodyPrepend: string[];
			body: string[];
			bodyAppend: string[];
		};
		const context = args[1] as { event: object; streaming?: boolean };

		for (const field of [
			'head',
			'bodyPrepend',
			'body',
			'bodyAppend',
		] as const) {
			html[field] = html[field].map(normalizeScriptNonces);
		}

		if (context.streaming && (html.body.length || html.bodyAppend.length)) {
			deferredBody.set(context.event, {
				body: [...html.body],
				bodyAppend: [...html.bodyAppend],
			});
			html.body.length = 0;
			html.bodyAppend.length = 0;
		}
	});

	nitroApp.hooks.hook('render:html:close', (html, { event }) => {
		const deferred = deferredBody.get(event);
		html.bodyAppend = [
			...(deferred?.body ?? []),
			...(deferred?.bodyAppend ?? []),
			...html.bodyAppend,
		]
			.map((tag) => tag.replace(emptyStyleRegex, ''))
			.filter(Boolean);
		deferredBody.delete(event);
	});

	nitroApp.hooks.hook('render:html:chunk', (chunk, { event }) => {
		const source = decoder.decode(chunk.chunk);
		let normalized = normalizeScriptNonces(source);

		if (chunk.index === 0) {
			const headEnd = normalized.indexOf('</head>');
			if (headEnd !== -1) {
				const head = normalized
					.slice(0, headEnd + '</head>'.length)
					.replace(/>\s+</g, '><');
				normalized =
					head + normalized.slice(headEnd + '</head>'.length);
			}
		}

		if (normalized !== source) {
			chunk.chunk = encoder.encode(normalized);
		}

		if (chunk.index === 0 && event.context.security?.rules?.hidePoweredBy) {
			removeResponseHeader(event, 'x-powered-by');
		}
	});
});
