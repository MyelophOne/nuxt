<script setup lang="ts">
defineProps<{
	videoId: string;
}>();
</script>

<template>
	<CookieConsentWrapper category="marketing" serviceName="YouTube">
		<div class="aspect-video rounded-xl overflow-hidden shadow-lg">
			<iframe
				width="100%"
				height="100%"
				:src="`https://www.youtube.com/embed/${videoId}`"
				frameborder="0"
				allow="
					accelerometer;
					autoplay;
					clipboard-write;
					encrypted-media;
					gyroscope;
					picture-in-picture;
				"
				allowfullscreen
			></iframe>
		</div>
	</CookieConsentWrapper>
</template>
