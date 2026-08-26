<template>
	<img
		class="inline-block"
		:src="iconUrl"
		:alt="icon"
		:width="size"
		:height="size"
		v-bind="$attrs"
	/>
</template>

<script setup>
const props = defineProps({
	icon: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		default: "ios-filled",
	},
	size: {
		type: [String, Number],
		default: 28,
	},
	color: {
		type: String,
		default: "000000",
	},
});

const formattedColor = computed(() => {
	return props.color.startsWith("#") ? props.color.substring(1) : props.color;
});

const iconUrl = computed(() => {
	return `https://img.icons8.com/${props.type}/${props.size}/${formattedColor.value}/${props.icon}.png`;
});
</script>
