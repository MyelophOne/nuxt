<script setup lang="ts">
import { CONTAINER_MAX_WIDTH, type LayoutSize } from "~/constants/layout";

interface Props {
	imageSrc: string;
	imageAlt?: string;
	imgPosition?: "left" | "right";
	containerSize?: LayoutSize;
	imageToEdge?: boolean;
	reverseOnMobile?: boolean;
	imageClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	imageAlt: "",
	imgPosition: "left",
	containerSize: "boxed",
	imageToEdge: false,
	reverseOnMobile: false,
	imageClass: "",
});

const containerClass = computed(() => CONTAINER_MAX_WIDTH[props.containerSize]);

const rawContainerWidth = computed(() => {
	const cls = CONTAINER_MAX_WIDTH[props.containerSize];
	const match = cls.match(/max-w-\[(.*)\]/);
	return match ? match[1] : "100%";
});

const wrapperClasses = computed(() => {
	return props.imageToEdge
		? "w-full"
		: `w-full mx-auto ${containerClass.value}`;
});

const textBlockStyle = computed(() => {
	if (!props.imageToEdge) return {};
	return {
		maxWidth: `calc(${rawContainerWidth.value} / 2)`,
		width: "100%",
	};
});

const textBlockClasses = computed(() => {
	if (!props.imageToEdge) return "w-full";
	if (props.imgPosition === "right") return "ml-auto";
	return "mr-auto";
});
</script>

<template>
	<section class="relative overflow-hidden" :class="wrapperClasses">
		<div class="flex flex-col lg:grid lg:grid-cols-2 min-h-100">
			<div
				class="relative w-full h-64 lg:h-auto min-h-75"
				:class="[
					imgPosition === 'left' ? 'lg:order-1' : 'lg:order-2',
					reverseOnMobile
						? imgPosition === 'left'
							? 'order-2'
							: 'order-1'
						: imgPosition === 'left'
							? 'order-1'
							: 'order-2',
				]"
			>
				<SafeImgWithLoader
					:src="imageSrc"
					:alt="imageAlt"
					class="absolute inset-0 w-full h-full object-cover"
					:class="imageClass"
				/>
			</div>

			<div
				class="flex flex-col justify-center py-10 pt-6 lg:py-12"
				:class="[
					imgPosition === 'left' ? 'lg:order-2' : 'lg:order-1',
					reverseOnMobile
						? imgPosition === 'left'
							? 'order-1'
							: 'order-2'
						: imgPosition === 'left'
							? 'order-2'
							: 'order-1',
				]"
			>
				<div
					:style="textBlockStyle"
					class="px-6 lg:px-12"
					:class="textBlockClasses"
				>
					<slot />
				</div>
			</div>
		</div>
	</section>
</template>
