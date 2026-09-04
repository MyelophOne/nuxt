<script setup lang="ts">
import { getPost } from "#myelophone/app/utils/blog.server";

const route = useRoute();
const param = "slug" in route.params ? route.params.slug : undefined;
const slug = Array.isArray(param) ? param.join("/") : (param ?? "");
const post = await getPost(slug);

if (!post) {
	const event = useRequestEvent();
	const isIslandRequest = Boolean(useNuxtApp().ssrContext?.islandContext);

	if (event && !isIslandRequest) {
		setResponseStatus(event, 404, "Not Found");
	}
} else {
	useAppSeo({
		title: post.meta.title,
		description: post.meta.description,
		image: post.meta.image,
	});
}

const html = post?.html ?? "";
</script>

<template>
	<div class="post-content-page">
		<ViewNotFound v-if="!post" :set-response-status="false" />
		<article v-else class="post-content" v-html="html" />
	</div>
</template>
