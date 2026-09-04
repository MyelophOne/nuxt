export default defineNuxtPlugin(() => {
	const head = injectHead();

	if (!head) return;
	const hooks = head.hooks;

	if (!hooks) return;

	hooks.hook('entries:normalize', ({ tags }) => {
		for (let index = tags.length - 1; index >= 0; index--) {
			const tag = tags[index];
			if (!tag) continue;

			if (
				tag.tag === 'meta' &&
				tag.props.name?.toLowerCase() === 'twitter:card'
			) {
				tags.splice(index, 1);
			}
		}
	});

	hooks.hook('tags:beforeResolve', ({ tags }) => {
		for (let index = tags.length - 1; index >= 0; index--) {
			const tag = tags[index];
			if (!tag) continue;

			if (
				tag.tag === 'meta' &&
				tag.props.name?.toLowerCase() === 'twitter:card'
			) {
				tags.splice(index, 1);
			}
		}
	});
});
