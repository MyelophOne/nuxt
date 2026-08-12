<script setup lang="ts">
interface Logo {
	src: string;
	alt?: string;
	href?: string;
}

interface Props {
	logos: Logo[];
	speed?: number;
	grayscale?: boolean;
	containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	speed: 30,
	grayscale: true,
	containerClass: "",
});
</script>

<template>
	<div
		:class="[
			'relative w-full overflow-hidden bg-(--ui-bg) py-2 sm:py-4',
			containerClass,
		]"
	>
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 bg-linear-to-r from-(--ui-bg) to-transparent"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 bg-linear-to-l from-(--ui-bg) to-transparent"
		></div>

		<div class="flex overflow-hidden select-none group">
			<div
				v-for="loop in 2"
				:key="loop"
				class="flex min-w-full shrink-0 items-center justify-around gap-6 sm:gap-10 animate-infinite-scroll group-hover:[animation-play-state:paused]"
				:style="{ 'animation-duration': `${speed}s` }"
				:aria-hidden="loop === 2"
			>
				<component
					:is="logo.href ? 'a' : 'div'"
					v-for="(logo, index) in logos"
					:key="`${loop}-${index}`"
					:href="logo.href"
					:target="logo.href ? '_blank' : undefined"
					:rel="logo.href ? 'noopener noreferrer' : undefined"
					class="flex h-10 w-24 sm:h-14 sm:w-32 items-center justify-center p-1 transition-transform"
					:class="{ 'cursor-pointer': logo.href }"
				>
					<SafeNuxtImg
						:src="logo.src"
						:alt="logo.alt ? logo.alt : ''"
						class="max-h-full max-w-full object-contain transition-all duration-300"
						:class="[
							grayscale
								? 'filter grayscale hover:grayscale-0 opacity-70 hover:opacity-100'
								: 'opacity-90 hover:opacity-100',
							'',
						]"
					/>
				</component>
			</div>
		</div>
	</div>
</template>

<style scoped>
@keyframes scroll {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(-100%);
	}
}
.animate-infinite-scroll {
	animation: scroll linear infinite;
}
</style>
