interface TimingState {
	requestStart: number;
	renderStart?: number;
	renderEnd?: number;
}

export default defineNitroPlugin((nitroApp) => {
	const timings = new WeakMap<object, TimingState>();

	const getTiming = (event: { context: object }) =>
		timings.get(event.context);

	const writeTiming = (event: any) => {
		const timing = getTiming(event);
		if (!timing) {
			return;
		}

		const now = performance.now();
		const serverTiming: string[] = [];

		if (timing.renderStart) {
			serverTiming.push(
				`nuxt-pre-render;dur=${(timing.renderStart - timing.requestStart).toFixed(2)}`,
			);
		}

		if (timing.renderStart && timing.renderEnd) {
			serverTiming.push(
				`nuxt-render;dur=${(timing.renderEnd - timing.renderStart).toFixed(2)}`,
			);
		}

		if (timing.renderEnd) {
			serverTiming.push(
				`nuxt-post-render;dur=${(now - timing.renderEnd).toFixed(2)}`,
			);
		}

		const cache = event.context.cache;
		if (cache) {
			serverTiming.push(
				`nuxt-cache;desc="${timing.renderStart ? 'miss' : 'hit'}"`,
			);
		}

		serverTiming.push(
			`nuxt-total;dur=${(now - timing.requestStart).toFixed(2)}`,
		);

		setResponseHeader(event, 'Server-Timing', serverTiming.join(', '));
	};

	nitroApp.hooks.hook('request', (event) => {
		timings.set(event.context, { requestStart: performance.now() });

		const response = event.node?.res;
		if (!response) {
			return;
		}

		const end = response.end.bind(response);
		response.end = ((...args: Parameters<typeof response.end>) => {
			writeTiming(event);
			return end(...args);
		}) as typeof response.end;
	});

	nitroApp.hooks.hook('render:before', ({ event }) => {
		const timing = getTiming(event);
		if (timing) {
			timing.renderStart = performance.now();
		}
	});

	nitroApp.hooks.hook('render:html', (_html, { event }) => {
		const timing = getTiming(event);
		if (timing) {
			timing.renderEnd = performance.now();
		}
	});

	nitroApp.hooks.hook('beforeResponse', (event) => {
		writeTiming(event);
	});
});
