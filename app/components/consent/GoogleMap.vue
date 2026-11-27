<script setup lang="ts">
type Props = {
	address?: string;
	embedUrl?: string;
	placeId?: string;
	language?: string;
	region?: string;
	title?: string;
};

const props = withDefaults(defineProps<Props>(), {
	address: "",
	placeId: "",
	language: "eb",
	region: "pl",
	title: "Google Maps",
});

const mapSrc = computed(() => {
	if (props.embedUrl !== undefined) return googleMapsEmbedUrl(props.embedUrl);
	const query = props.placeId ? `place_id:${props.placeId}` : props.address;

	if (!query) {
		return "";
	}

	const params = new URLSearchParams({
		q: query,
		output: "embed",
		hl: props.language,
		gl: props.region,
	});

	return `https://www.google.com/maps?${params.toString()}`;
});

const { t } = useMultiLang(["interface"]);
</script>

<template>
	<div class="h-100 w-full">
		<CookieConsentWrapper category="functional" service-name="Google Maps">
			<iframe
				v-if="mapSrc"
				:src="mapSrc"
				:title="title"
				class="h-full w-full rounded-xl border-0"
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
				allowfullscreen
			/>

			<div
				v-else
				class="flex h-full w-full items-center justify-center rounded-xl bg-gray-100"
			>
				<slot name="empty">{{
					t("interface.noGoogleMapAddress")
				}}</slot>
			</div>
		</CookieConsentWrapper>
	</div>
</template>
