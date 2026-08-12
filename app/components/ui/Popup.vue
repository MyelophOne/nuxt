<script setup lang="ts">
interface Props {
	id: string;
	title?: string;
	description?: string;
	image?: string;
	variant?:
		| "simple"
		| "image-left"
		| "image-right"
		| "bg-image"
		| "modern-gradient";
	frequencyDays?: number;
	triggerDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "simple",
	frequencyDays: 7,
	triggerDelay: 2000,
});

const { isOpen, open, close } = usePopupControl(props.id, props.frequencyDays);
const isMounted = ref(false);

onMounted(() => {
	isMounted.value = true;
	setTimeout(() => {
		open();
	}, props.triggerDelay);
});

const isSideLayout = computed(() =>
	["image-left", "image-right"].includes(props.variant),
);

const textColorClass = computed(() => {
	if (props.variant === "bg-image") return "text-white";
	return "text-gray-900 dark:text-white";
});

const descColorClass = computed(() => {
	if (props.variant === "bg-image") return "text-gray-200";
	return "text-gray-500 dark:text-gray-400";
});
</script>

<template>
	<div
		v-if="isMounted"
		style="
			position: fixed;
			top: 0;
			left: 0;
			width: 0;
			height: 0;
			overflow: hidden;
			pointer-events: none;
			z-index: -1;
		"
		aria-hidden="true"
	>
		<Teleport to="body">
			<Transition
				enter-active-class="transition duration-300 ease-out"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="transition duration-200 ease-in"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
			>
				<div
					v-if="isOpen"
					class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75"
					style="pointer-events: auto"
					@click.self="close(false)"
				>
					<Transition
						enter-active-class="transition duration-300 ease-out"
						enter-from-class="opacity-0 scale-95 translate-y-4"
						enter-to-class="opacity-100 scale-100 translate-y-0"
						leave-active-class="transition duration-200 ease-in"
						leave-from-class="opacity-100 scale-100 translate-y-0"
						leave-to-class="opacity-0 scale-95 translate-y-4"
					>
						<div
							data-nosnippet
							role="dialog"
							aria-modal="true"
							class="relative w-full overflow-hidden bg-white shadow-2xl rounded-2xl dark:bg-gray-800"
							:class="{
								'max-w-lg': !isSideLayout,
								'max-w-2xl': isSideLayout,
								'bg-linear-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900':
									variant === 'modern-gradient',
							}"
						>
							<div
								v-if="variant === 'bg-image' && image"
								class="absolute inset-0 z-0"
							>
								<img
									:src="image"
									class="object-cover w-full h-full"
									alt=""
									loading="lazy"
								/>
								<div class="absolute inset-0 bg-black/70"></div>
							</div>

							<button
								@click="close(true)"
								class="absolute top-4 right-4 z-20 flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
								:class="
									variant === 'bg-image'
										? 'text-white/70 hover:bg-white/20 hover:text-white'
										: 'text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700'
								"
							>
								<UiIcon
									name="heroicons:x-mark"
									class="w-6 h-6"
								/>
							</button>

							<div
								class="relative z-10 flex flex-col"
								:class="{
									'md:flex-row': variant === 'image-left',
									'md:flex-row-reverse':
										variant === 'image-right',
								}"
							>
								<div
									v-if="
										isSideLayout ||
										(image && variant === 'simple')
									"
									class="relative shrink-0"
									:class="{
										'h-48 md:h-auto md:w-2/5': isSideLayout,
										'h-48 w-full':
											variant === 'simple' && image,
									}"
								>
									<img
										v-if="image"
										:src="image"
										alt=""
										class="absolute inset-0 object-cover w-full h-full"
										loading="lazy"
									/>
									<div
										v-else
										class="flex items-center justify-center w-full h-full bg-indigo-100 dark:bg-indigo-900/30"
									>
										<slot name="icon">
											<UiIcon
												name="heroicons:photo"
												class="w-12 h-12 text-indigo-300"
											/>
										</slot>
									</div>
								</div>

								<div class="p-6 md:p-8 grow">
									<div class="mb-5">
										<h3
											class="text-2xl font-bold tracking-tight"
											:class="textColorClass"
										>
											{{ title }}
										</h3>
										<p
											class="mt-2 text-base"
											:class="descColorClass"
										>
											{{ description }}
										</p>
									</div>

									<div class="space-y-4">
										<slot :close="close" />
									</div>

									<div
										v-if="$slots.actions"
										class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end"
									>
										<slot name="actions" :close="close" />
									</div>
								</div>
							</div>
						</div>
					</Transition>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>
