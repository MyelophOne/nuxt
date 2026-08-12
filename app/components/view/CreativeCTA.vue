<template>
	<section
		class="relative w-full overflow-hidden rounded-2xl isolate shadow-2xl group"
		:class="[
			backgroundImage
				? 'bg-gray-900'
				: 'bg-(--ui-bg) ring-1 ring-(--ui-text)/10',
		]"
	>
		<div v-if="backgroundImage" class="absolute inset-0 z-0">
			<img
				:src="backgroundImage"
				alt=""
				class="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
			/>
			<div
				class="absolute inset-0 transition-opacity duration-500"
				:class="{
					'bg-linear-to-r from-black/90 via-black/50 to-transparent':
						align === 'left',
					'bg-linear-to-l from-black/90 via-black/50 to-transparent':
						align === 'right',
					'bg-linear-to-t from-black/90 via-black/50 to-black/20':
						align === 'center',
				}"
			></div>
		</div>

		<div v-else class="absolute inset-0 z-0 overflow-hidden">
			<div
				class="absolute inset-0 opacity-[0.05]"
				style="
					background-image: radial-gradient(
						var(--ui-text) 1px,
						transparent 1px
					);
					background-size: 24px 24px;
				"
			></div>

			<div
				class="absolute -top-24 -right-24 w-96 h-96 bg-(--ui-text)/5 rounded-full blur-3xl"
			></div>
			<div
				class="absolute -bottom-24 -left-24 w-96 h-96 bg-(--ui-text)/5 rounded-full blur-3xl"
			></div>
		</div>

		<div
			class="relative z-10 flex flex-col px-6 py-12 md:px-12 md:py-20"
			:class="{
				'items-start text-left': align === 'left',
				'items-center text-center': align === 'center',
				'items-end text-right': align === 'right',
				'text-white': backgroundImage,
				'text-(--ui-text)': !backgroundImage,
			}"
		>
			<div class="max-w-4xl space-y-4">
				<slot name="title">
					<h2
						class="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.2]"
						:class="{ 'drop-shadow-md': backgroundImage }"
					>
						{{ title }}
					</h2>
				</slot>

				<slot name="description">
					<p
						v-if="description"
						class="text-base md:text-lg opacity-90 leading-relaxed max-w-2xl"
						:class="{
							'mr-auto': align === 'left',
							'mx-auto': align === 'center',
							'ml-auto': align === 'right',
						}"
					>
						{{ description }}
					</p>
				</slot>
			</div>

			<div
				class="flex flex-col w-full gap-4 mt-8 sm:flex-row sm:w-auto"
				:class="{
					'sm:self-start': align === 'left',
					'sm:self-center': align === 'center',
					'sm:self-end': align === 'right',
				}"
			>
				<slot name="actions">
					<NuxtLink
						v-if="primaryText"
						:to="primaryLink"
						class="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-lg"
						:class="[
							backgroundImage
								? 'bg-white text-black hover:bg-gray-100'
								: 'bg-(--ui-text) text-(--ui-bg) hover:opacity-90',
						]"
					>
						{{ primaryText }}
					</NuxtLink>

					<NuxtLink
						v-if="secondaryText"
						:to="secondaryLink"
						class="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all duration-200 border-2 hover:bg-white/10"
						:class="[
							backgroundImage
								? 'border-white/30 text-white'
								: 'border-(--ui-text)/20 text-(--ui-text)',
						]"
					>
						{{ secondaryText }}
					</NuxtLink>
				</slot>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
interface Props {
	title?: string;
	description?: string;
	primaryText?: string;
	primaryLink?: string;
	secondaryText?: string;
	secondaryLink?: string;
	backgroundImage?: string;
	align?: "left" | "center" | "right";
}

const props = withDefaults(defineProps<Props>(), {
	title: "Ready to start?",
	description: "",
	primaryLink: "/",
	secondaryLink: "/",
	align: "left",
});
</script>
