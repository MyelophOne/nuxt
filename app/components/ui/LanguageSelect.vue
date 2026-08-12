<template>
	<div
		ref="selectWrapper"
		class="ui-lang-select"
		:class="[
			containerClass,
			{
				'is-open': isOpen,
				'drop-up': isDropUp,
				'drop-right': isDropRight,
			},
		]"
		@mousedown.stop
	>
		<button
			type="button"
			class="lang-trigger"
			:class="triggerClass"
			@click.stop="toggleDropdown"
		>
			<slot name="trigger">
				<span v-if="showFull" class="lang-text">{{
					t(`common.${settingsStore.currentLocale}`)
				}}</span>
				<span v-else class="lang-text">{{
					settingsStore.currentLocale
				}}</span>
			</slot>
			<span class="lang-arrow"></span>
		</button>

		<div v-if="isOpen" class="lang-dropdown" :class="dropdownClass">
			<div class="lang-dropdown-scroll">
				<button
					v-for="lang in uniqueLocales"
					:key="lang"
					type="button"
					class="lang-option"
					:class="[
						optionClass,
						{ 'is-selected': settingsStore.currentLocale === lang },
					]"
					@click="selectLanguage(lang)"
				>
					<span v-if="showFull" class="lang-text">{{
						t(`common.${lang}`)
					}}</span>
					<span v-else class="lang-text">{{ lang }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	showFull?: boolean;
	containerClass?: string;
	triggerClass?: string;
	dropdownClass?: string;
	optionClass?: string;
}>();

const { t } = useMultiLang(["common"]);
const settingsStore = useSettingsStore(useNuxtApp().$pinia);

const isOpen = ref(false);
const isDropUp = ref(false);
const isDropRight = ref(false);
const selectWrapper = ref<HTMLElement | null>(null);

const uniqueLocales = computed(() => [...new Set(settingsStore.locales || [])]);

const toggleDropdown = () => {
	if (!isOpen.value) checkPosition();
	isOpen.value = !isOpen.value;
};

const checkPosition = () => {
	if (!selectWrapper.value) return;
	const rect = selectWrapper.value.getBoundingClientRect();
	isDropUp.value = window.innerHeight - rect.bottom < 200;
	isDropRight.value = window.innerWidth - rect.left < 150;
};

const selectLanguage = (lang: string) => {
	settingsStore.setLocale(lang);
	isOpen.value = false;
};

const close = () => {
	isOpen.value = false;
};

onMounted(() => {
	window.addEventListener("click", close);
	window.addEventListener("resize", close);
});

onBeforeUnmount(() => {
	window.removeEventListener("click", close);
	window.removeEventListener("resize", close);
});
</script>

<style scoped>
.ui-lang-select {
	position: relative;
	display: inline-block;
	--bg: var(--ui-bg);
	--brd: var(--ui-border);
	--txt: var(--ui-text);
	--ui-hover: rgba(128, 128, 128, 0.1);
}

.lang-trigger {
	cursor: pointer;
	background: var(--bg);
	border: 1px solid var(--brd);
	color: var(--txt);
	padding: 8px 14px;
	display: flex;
	align-items: center;
	gap: 10px;
	text-transform: uppercase;
	font-family: inherit;
	font-weight: 400;
	transition: background 0.2s;
}

.lang-text {
	font-size: 1rem;
	line-height: 1;
}

.lang-trigger:hover {
	background: var(--ui-hover);
}

.lang-arrow {
	width: 6px;
	height: 6px;
	border-right: 1px solid var(--txt);
	border-bottom: 1px solid var(--txt);
	transform: rotate(45deg) translateY(-2px);
	opacity: 0.6;
}

.is-open .lang-arrow {
	transform: rotate(-135deg) translateY(1px);
}

.lang-dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	z-index: 1000;
	background: var(--bg);
	border: 1px solid var(--brd);
	min-width: 100%;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.drop-right .lang-dropdown {
	left: auto;
	right: 0;
}
.drop-up .lang-dropdown {
	top: auto;
	bottom: calc(100% + 4px);
}

.lang-option {
	width: 100%;
	padding: 12px 14px;
	border: none;
	background: transparent;
	color: var(--txt);
	text-align: left;
	cursor: pointer;
	display: flex;
	align-items: center;
	text-transform: uppercase;
	font-weight: 400;
	transition: all 0.2s;
}

.lang-option:hover {
	background: var(--ui-hover);
}

.lang-option.is-selected {
	background: var(--txt);
	color: var(--bg);
}

@media (prefers-color-scheme: light) {
	.ui-lang-select {
		--ui-hover: rgba(0, 0, 0, 0.05);
	}
}
</style>
