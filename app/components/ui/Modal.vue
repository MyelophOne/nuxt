<script setup lang="ts">
interface Props {
	modelValue: boolean;
	title?: string;
	width?: string;
	preventClose?: boolean;
	bodyClass?: string;
	closeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: false,
	width: "max-w-md",
	preventClose: false,
	bodyClass: "px-6 py-5 max-h-[70vh] overflow-y-auto custom-scrollbar",
});

const emit = defineEmits(["update:modelValue", "close"]);
const uid = useId();
const { t } = useMultiLang("interface");
const panel = ref<HTMLElement | null>(null);
let opener: HTMLElement | null = null;
const focusable = () =>
	Array.from(
		panel.value?.querySelectorAll<HTMLElement>(
			"a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]",
		) || [],
	).filter(
		(element) =>
			element.tabIndex >= 0 && element.getClientRects().length > 0,
	);
const { register, unregister, isTop } = useModalState();
const isMounted = ref(false);

onMounted(() => {
	isMounted.value = true;
});
watch(
	() => props.modelValue && isMounted.value,
	async (isOpen) => {
		if (isOpen) {
			opener =
				document.activeElement instanceof HTMLElement
					? document.activeElement
					: null;
			register(uid);
			await nextTick();
			if (props.modelValue)
				(focusable()[0] || panel.value)?.focus({ preventScroll: true });
		} else {
			unregister(uid);
			if (opener?.isConnected) opener.focus({ preventScroll: true });
			opener = null;
		}
	},
);
onUnmounted(() => unregister(uid));
const close = () => {
	if (props.preventClose) return;
	emit("update:modelValue", false);
	emit("close");
};
const handleBackdropClick = () => {
	if (isTop(uid)) close();
};
const handleEsc = (e: KeyboardEvent) => {
	if (!props.modelValue || !isTop(uid)) return;
	if (e.key === "Escape") {
		e.preventDefault();
		close();
	}
	if (e.key !== "Tab") return;
	const elements = focusable();
	const first = elements[0];
	const last = elements[elements.length - 1];
	if (!first) {
		e.preventDefault();
		panel.value?.focus();
		return;
	}
	if (
		e.shiftKey &&
		(document.activeElement === first ||
			!panel.value?.contains(document.activeElement))
	) {
		e.preventDefault();
		last?.focus();
	} else if (
		!e.shiftKey &&
		(document.activeElement === last ||
			!panel.value?.contains(document.activeElement))
	) {
		e.preventDefault();
		first.focus();
	}
};

onMounted(() => {
	if (typeof window !== "undefined")
		window.addEventListener("keydown", handleEsc);
});
onUnmounted(() => {
	if (typeof window !== "undefined")
		window.removeEventListener("keydown", handleEsc);
});
</script>

<template>
	<Teleport v-if="isMounted" to="body">
		<Transition
			enter-active-class="transition duration-200 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition duration-150 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="modelValue"
				class="relative z-80"
				aria-modal="true"
				role="dialog"
				:aria-labelledby="
					title || $slots.header ? `${uid}-title` : undefined
				"
				data-nosnippet
			>
				<div
					class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
					@click="handleBackdropClick"
				></div>

				<div class="fixed inset-0 z-10 overflow-y-auto w-screen">
					<div
						class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
						@click.self="handleBackdropClick"
					>
						<Transition
							enter-active-class="transition duration-300 ease-out"
							enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enter-to-class="opacity-100 translate-y-0 sm:scale-100"
							leave-active-class="transition duration-200 ease-in"
							leave-from-class="opacity-100 translate-y-0 sm:scale-100"
							leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<div
								ref="panel"
								tabindex="-1"
								class="relative transform overflow-hidden rounded-xl text-left shadow-2xl transition-all w-full bg-(--ui-bg) text-(--ui-text) border border-neutral-200 dark:border-neutral-800"
								:class="[width]"
								@click.stop
							>
								<div
									v-if="title || $slots.header"
									:id="`${uid}-title`"
									class="flex items-center justify-between px-6 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50"
								>
									<slot name="header">
										<h3
											class="text-lg font-semibold leading-6 opacity-90"
										>
											{{ title }}
										</h3>
									</slot>

									<button
										v-if="!preventClose"
										type="button"
										:aria-label="
											closeLabel || t('interface.close')
										"
										@click="close"
										class="ml-4 -mr-1 rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
									>
										<svg
											class="h-5 w-5 opacity-50 hover:opacity-100"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<div :class="bodyClass">
									<slot />
								</div>

								<div
									v-if="$slots.footer"
									class="bg-neutral-50/50 dark:bg-neutral-900/20 px-6 py-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3"
								>
									<slot name="footer" :close="close" />
								</div>
							</div>
						</Transition>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background-color: rgba(156, 163, 175, 0.3);
	border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
	background-color: rgba(156, 163, 175, 0.5);
}
</style>
