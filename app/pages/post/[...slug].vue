<script setup lang="ts">
const route = useRoute();

const param = "slug" in route.params ? route.params.slug : undefined;

const slug = Array.isArray(param) ? param.join("/") : (param ?? "");

if (import.meta.server) {
	const { getPost } = await import("#myelophone/app/utils/blog.server");
	const post = await getPost(slug);

	if (!post) {
		const event = useRequestEvent();

		if (event) {
			setResponseStatus(event, 404);
		}
	} else {
		useAppSeo({
			title: post.meta.title,
			description: post.meta.description,
			image: post.meta.image,
		});
	}
}
</script>

<template>
	<UiPostContent :slug="slug" />
</template>
