<script setup lang="ts">
type Alignment = "left" | "center" | "right";

const props = withDefaults(
	defineProps<{
		text: string;
		authorName?: string;
		authorRole?: string;
		avatarSrc?: string;
		avatarChipColor?: string;
		textSizeClass?: string;
		quoteAlign?: Alignment;
		footerAlign?: Alignment;
	}>(),
	{
		textSizeClass: "text-xl sm:text-2xl md:text-3xl leading-relaxed",
		quoteAlign: "center",
		footerAlign: "center",
	},
);

const quoteContainerClass = computed(() => {
	switch (props.quoteAlign) {
		case "left":
			return "text-left";
		case "right":
			return "text-right";
		default:
			return "text-center";
	}
});

const footerContainerClass = computed(() => {
	switch (props.footerAlign) {
		case "left":
			return "justify-start text-left";
		case "right":
			return "justify-start text-right flex-row-reverse";
		default:
			return "justify-center text-center flex-col sm:flex-row";
	}
});

const authorTextWrapperClass = computed(() => {
	switch (props.footerAlign) {
		case "left":
			return "items-start";
		case "right":
			return "items-end";
		default:
			return "items-center";
	}
});
</script>

<template>
	<figure class="flex flex-col max-w-4xl mx-auto px-4 py-8 sm:py-10">
		<div
			class="mb-4 sm:mb-6 self-start text-primary-500/30 dark:text-primary-400/30 select-none"
			aria-hidden="true"
		>
			<UiIcon
				name="ri:double-quotes-l"
				class="w-16! h-16! sm:w-20! sm:h-20! mask-size-[100%_100%]"
			/>
		</div>

		<blockquote
			class="font-medium text-gray-900 dark:text-white relative z-10 w-full mb-8 sm:mb-10"
			:class="quoteContainerClass"
		>
			<p :class="textSizeClass">
				{{ text }}
			</p>
		</blockquote>

		<figcaption
			v-if="authorName || authorRole || avatarSrc"
			class="flex items-center gap-4 w-full"
			:class="footerContainerClass"
		>
			<div v-if="avatarSrc" class="shrink-0">
				<AppAvatar
					:src="avatarSrc"
					:chip-color="avatarChipColor"
					class="w-12 h-12 sm:w-14 sm:h-14 shadow-sm"
				/>
			</div>

			<div
				v-if="authorName || authorRole"
				class="flex flex-col"
				:class="authorTextWrapperClass"
			>
				<cite
					v-if="authorName"
					class="not-italic font-bold text-gray-900 dark:text-white text-base sm:text-lg"
				>
					{{ authorName }}
				</cite>

				<span
					v-if="authorRole"
					class="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-0.5"
				>
					{{ authorRole }}
				</span>
			</div>
		</figcaption>
	</figure>
</template>
