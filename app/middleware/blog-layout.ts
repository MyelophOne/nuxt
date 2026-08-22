import { useMyelophoneConfig } from '~/utils/myelophoneConfig';

export default defineNuxtRouteMiddleware(async (to) => {
	const config = useMyelophoneConfig();

	type LayoutName = Parameters<typeof setPageLayout>[0];

	const layout = (config.blog?.postsLayout || 'default') as LayoutName;

	setPageLayout(layout);

	if (!import.meta.server) {
		return;
	}

	const param = 'slug' in to.params ? to.params.slug : undefined;
	const slug = Array.isArray(param) ? param.join('/') : (param ?? '');
	const { getPost } = await import('#myelophone/app/utils/blog.server');
	const post = await getPost(String(slug));

	if (!post) {
		const event = useRequestEvent();

		if (event) {
			setResponseStatus(event, 404, 'Not Found');
		}
	}
});
