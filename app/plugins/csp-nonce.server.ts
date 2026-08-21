import {
	getResponseStatus,
	getResponseStatusText,
	setResponseHeader,
	setResponseStatus,
} from 'h3';

export default defineNuxtPlugin((nuxtApp) => {
	const nonce = useNonce();
	const ssrContext = nuxtApp.ssrContext;
	const head = ssrContext?.head;

	if (!ssrContext?.event) {
		return;
	}

	setResponseHeader(
		ssrContext.event,
		'content-type',
		'text/html;charset=utf-8',
	);
	if (!getResponseStatusText(ssrContext.event)) {
		setResponseStatus(
			ssrContext.event,
			getResponseStatus(ssrContext.event),
			'OK',
		);
	}

	if (!nonce || !head) {
		return;
	}

	head.hooks?.hook('tags:resolve', ({ tags }) => {
		const script = tags.find((tag) => tag.tag === 'script');

		if (script) {
			script.props.nonce ??= nonce;
		}
	});
});
