<script setup lang="ts">
interface Link {
	text: string;
	url: string;
	icon?: string;
}

interface FeatureItem {
	title: string;
	description: string;
	image?: string;
	link?: Link;
}

interface Props {
	items: FeatureItem[];
	defaultImage?: string;
	imagePosition?: "left" | "right";
	hideImageOnMobile?: boolean;
	mobileOrder?: "image-first" | "text-first";
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	imagePosition: "right",
	hideImageOnMobile: false,
	mobileOrder: "image-first",
	defaultImage: "",
	class: "",
});

const activeIndex = ref(0);

const activeItem = computed(() => {
	return props.items[activeIndex.value] || props.items[0];
});

const currentImage = computed(() => {
	return activeItem.value?.image || props.defaultImage;
});

function setActive(index: number) {
	activeIndex.value = index;
}

const imageOrderClass = computed(() => {
	const mobile = props.mobileOrder === "image-first" ? "order-1" : "order-2";
	const desktop =
		props.imagePosition === "left" ? "lg:order-1" : "lg:order-2";
	return `${mobile} ${desktop}`;
});

const textOrderClass = computed(() => {
	const mobile = props.mobileOrder === "image-first" ? "order-2" : "order-1";
	const desktop =
		props.imagePosition === "left" ? "lg:order-2" : "lg:order-1";
	return `${mobile} ${desktop}`;
});
</script>

<template>
	<div
		:class="[
			'flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-start',
			props.class,
		]"
	>
		<div
			:class="[
				'relative w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 aspect-4/3 lg:aspect-square',
				imageOrderClass,
				props.hideImageOnMobile ? 'hidden lg:block' : 'block',
			]"
		>
			<Transition name="fade" mode="out-in">
				<ImgWithLoader
					v-if="currentImage"
					:key="currentImage"
					:src="currentImage"
					:alt="activeItem?.title"
					class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
				/>
				<div
					v-else
					class="absolute inset-0 flex items-center justify-center text-gray-400"
				></div>
			</Transition>
		</div>

		<div :class="['w-full flex flex-col', textOrderClass]">
			<div
				v-for="(item, index) in items"
				:key="index"
				class="border-b border-gray-200 dark:border-gray-700 last:border-0"
			>
				<button
					@click="setActive(index)"
					class="w-full flex items-center justify-between py-6 text-left group focus:outline-none"
				>
					<span
						class="text-xl md:text-2xl font-semibold transition-colors duration-300 pr-4"
						:class="
							activeIndex === index
								? 'text-gray-900 dark:text-white'
								: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
						"
					>
						{{ item.title }}
					</span>

					<div
						class="flex items-center justify-center transition-transform duration-300 ease-in-out text-gray-400"
						:class="
							activeIndex === index ? 'rotate-180' : 'rotate-0'
						"
					>
						<UiIcon name="heroicons:chevron-down" class="w-6 h-6" />
					</div>
				</button>

				<div
					class="grid transition-[grid-template-rows] duration-500 ease-out"
					:class="
						activeIndex === index
							? 'grid-rows-[1fr]'
							: 'grid-rows-[0fr]'
					"
				>
					<div class="overflow-hidden">
						<div
							class="pb-8 text-gray-600 dark:text-gray-300 leading-relaxed"
						>
							<p class="mb-6">{{ item.description }}</p>

							<NuxtLink
								v-if="item.link"
								:to="item.link.url"
								class="inline-flex items-center font-semibold text-orange-600 hover:text-orange-500 transition-colors"
							>
								{{ item.link.text }}
								<UiIcon
									v-if="item.link.icon"
									:name="item.link.icon"
									class="ml-2 w-5 h-5"
								/>
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
