<script setup lang="ts">
type FileUploadValue = File | File[] | null;
type FileUploadLayout = "grid" | "list";
type FileUploadRejectionReason = "type" | "size" | "count" | "duplicate";

interface FileUploadRejection {
	file: File;
	reasons: FileUploadRejectionReason[];
}

interface Props {
	modelValue?: FileUploadValue;
	id?: string;
	name?: string;
	accept?: string;
	multiple?: boolean;
	required?: boolean;
	disabled?: boolean;
	capture?: boolean | "user" | "environment";
	dropzone?: boolean;
	interactive?: boolean;
	preview?: boolean;
	append?: boolean;
	maxSize?: number;
	maxFiles?: number;
	label?: string;
	description?: string;
	selectText?: string;
	emptyText?: string;
	layout?: FileUploadLayout;
	error?: boolean | string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	multiple: false,
	required: false,
	disabled: false,
	dropzone: true,
	interactive: true,
	preview: true,
	append: true,
	label: "Upload files",
	description: "",
	selectText: "Select files",
	emptyText: "or drag and drop them here",
	layout: "list",
	error: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: FileUploadValue];
	change: [value: FileUploadValue];
	reject: [rejections: FileUploadRejection[]];
	remove: [file: File, index: number];
	clear: [];
}>();

const generatedId = useId();
const inputId = computed(() => props.id || `file-upload-${generatedId}`);
const descriptionId = computed(() => `${inputId.value}-description`);
const errorId = computed(() => `${inputId.value}-error`);
const input = useTemplateRef<HTMLInputElement>("input");
const dragDepth = ref(0);
const isDragging = computed(() => dragDepth.value > 0);
const previewUrls = shallowRef(new Map<File, string>());

const files = computed<File[]>(() => {
	if (Array.isArray(props.modelValue)) return props.modelValue;
	return typeof File !== "undefined" && props.modelValue instanceof File
		? [props.modelValue]
		: [];
});

const errorMessage = computed(() =>
	typeof props.error === "string" ? props.error : "",
);
const hasError = computed(() => Boolean(props.error));
const describedBy = computed(
	() =>
		[
			props.description ? descriptionId.value : "",
			errorMessage.value ? errorId.value : "",
		]
			.filter(Boolean)
			.join(" ") || undefined,
);

const acceptsFile = (file: File) => {
	if (!props.accept) return true;

	return props.accept
		.split(",")
		.map((value) => value.trim().toLowerCase())
		.filter(Boolean)
		.some((rule) => {
			const type = file.type.toLowerCase();
			const name = file.name.toLowerCase();

			if (rule.startsWith(".")) return name.endsWith(rule);
			if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
			return type === rule;
		});
};

const isDuplicate = (file: File, current: File[]) =>
	current.some(
		(item) =>
			item.name === file.name &&
			item.size === file.size &&
			item.type === file.type &&
			item.lastModified === file.lastModified,
	);

const normalizeValue = (nextFiles: File[]): FileUploadValue => {
	if (props.multiple) return nextFiles;
	return nextFiles[0] || null;
};

const commit = (nextFiles: File[]) => {
	const value = normalizeValue(nextFiles);
	emit("update:modelValue", value);
	emit("change", value);
};

const addFiles = (incoming: File[]) => {
	if (props.disabled || !incoming.length) return;

	const accepted = props.multiple && props.append ? [...files.value] : [];
	const rejections: FileUploadRejection[] = [];

	for (const file of incoming) {
		const reasons: FileUploadRejectionReason[] = [];

		if (!acceptsFile(file)) reasons.push("type");
		if (props.maxSize !== undefined && file.size > props.maxSize)
			reasons.push("size");
		if (!props.multiple && accepted.length >= 1) reasons.push("count");
		if (
			props.multiple &&
			props.maxFiles !== undefined &&
			accepted.length >= props.maxFiles
		) {
			reasons.push("count");
		}
		if (isDuplicate(file, accepted)) reasons.push("duplicate");

		if (reasons.length) {
			rejections.push({ file, reasons });
		} else {
			accepted.push(file);
		}
	}

	if (rejections.length) emit("reject", rejections);
	if (accepted.length || !rejections.length) commit(accepted);
	nextTick(syncNativeInput);
};

const open = () => {
	if (!props.disabled) input.value?.click();
};

const removeFile = (index?: number) => {
	if (props.disabled) return;

	if (index === undefined) {
		if (files.value.length) emit("clear");
		commit([]);
		return;
	}

	const file = files.value[index];
	if (!file) return;

	const nextFiles = files.value.filter((_, fileIndex) => fileIndex !== index);
	emit("remove", file, index);
	commit(nextFiles);
};

const clear = () => removeFile();

const onInputChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	addFiles(Array.from(target.files || []));
};

const onDragEnter = (event: DragEvent) => {
	if (
		!props.dropzone ||
		props.disabled ||
		!event.dataTransfer?.types.includes("Files")
	)
		return;
	dragDepth.value += 1;
};

const onDragLeave = () => {
	if (!props.dropzone) return;
	dragDepth.value = Math.max(0, dragDepth.value - 1);
};

const onDrop = (event: DragEvent) => {
	dragDepth.value = 0;
	if (!props.dropzone || props.disabled) return;
	addFiles(Array.from(event.dataTransfer?.files || []));
};

const onRootClick = (event: MouseEvent) => {
	if (!props.interactive || props.disabled) return;
	if ((event.target as HTMLElement).closest("button, a")) return;
	open();
};

const onRootKeydown = (event: KeyboardEvent) => {
	if (
		!props.interactive ||
		props.disabled ||
		!["Enter", " "].includes(event.key)
	)
		return;
	event.preventDefault();
	open();
};

const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
	return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

const syncNativeInput = () => {
	if (!input.value || !import.meta.client) return;

	try {
		const transfer = new DataTransfer();
		for (const file of files.value) transfer.items.add(file);
		input.value.files = transfer.files;
	} catch {
		if (!files.value.length) input.value.value = "";
	}
};

watch(
	[files, () => props.preview],
	([currentFiles]) => {
		if (import.meta.client) {
			const nextUrls = new Map<File, string>();

			for (const file of currentFiles) {
				if (!props.preview || !file.type.startsWith("image/")) continue;
				nextUrls.set(
					file,
					previewUrls.value.get(file) || URL.createObjectURL(file),
				);
			}

			for (const [file, url] of previewUrls.value) {
				if (!nextUrls.has(file)) URL.revokeObjectURL(url);
			}

			previewUrls.value = nextUrls;
		}

		nextTick(syncNativeInput);
	},
	{ immediate: true },
);

const onFormReset = () => {
	emit("update:modelValue", props.multiple ? [] : null);
	emit("change", props.multiple ? [] : null);
};

let form: HTMLFormElement | null = null;

onMounted(() => {
	form = input.value?.form || null;
	form?.addEventListener("reset", onFormReset);
	syncNativeInput();
});

onBeforeUnmount(() => {
	form?.removeEventListener("reset", onFormReset);
	for (const url of previewUrls.value.values()) URL.revokeObjectURL(url);
});

defineExpose({ open, removeFile, clear, input });
</script>

<template>
	<div
		class="ui-file-upload"
		:class="[
			`ui-file-upload--${layout}`,
			{ 'ui-file-upload--disabled': disabled },
		]"
	>
		<input
			:id="inputId"
			ref="input"
			class="ui-file-upload__input"
			type="file"
			:name="name"
			:accept="accept"
			:multiple="multiple"
			:required="required"
			:disabled="disabled"
			:capture="capture"
			:aria-describedby="describedBy"
			:aria-invalid="hasError || undefined"
			@change="onInputChange"
		/>

		<div
			class="ui-file-upload__dropzone"
			:class="{
				'ui-file-upload__dropzone--dragging': isDragging,
				'ui-file-upload__dropzone--error': hasError,
				'ui-file-upload__dropzone--interactive':
					interactive && !disabled,
				'ui-file-upload__dropzone--compact': !dropzone,
			}"
			:role="interactive ? 'button' : undefined"
			:tabindex="interactive && !disabled ? 0 : undefined"
			:aria-controls="inputId"
			:aria-disabled="disabled || undefined"
			@dragenter.prevent="onDragEnter"
			@dragover.prevent
			@dragleave.prevent="onDragLeave"
			@drop.prevent="onDrop"
			@click="onRootClick"
			@keydown="onRootKeydown"
		>
			<slot
				:files="files"
				:open="open"
				:remove-file="removeFile"
				:clear="clear"
				:dragging="isDragging"
			>
				<slot name="leading">
					<svg
						class="ui-file-upload__icon"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</slot>

				<div class="ui-file-upload__copy">
					<slot name="label">
						<span class="ui-file-upload__label">{{ label }}</span>
					</slot>
					<slot name="description">
						<span
							v-if="description"
							:id="descriptionId"
							class="ui-file-upload__description"
							>{{ description }}</span
						>
						<span
							v-else-if="dropzone"
							class="ui-file-upload__description"
							>{{ emptyText }}</span
						>
					</slot>
				</div>

				<slot
					name="actions"
					:files="files"
					:open="open"
					:remove-file="removeFile"
				>
					<span
						v-if="interactive"
						class="ui-file-upload__select"
						aria-hidden="true"
					>
						{{ selectText }}
					</span>
					<button
						v-else
						type="button"
						class="ui-file-upload__select"
						:disabled="disabled"
						@click.stop="open"
					>
						{{ selectText }}
					</button>
				</slot>
			</slot>
		</div>

		<p
			v-if="errorMessage"
			:id="errorId"
			class="ui-file-upload__error"
			role="alert"
		>
			{{ errorMessage }}
		</p>

		<slot
			name="files-top"
			:files="files"
			:remove-file="removeFile"
			:clear="clear"
		/>
		<slot
			v-if="preview && files.length"
			name="files"
			:files="files"
			:remove-file="removeFile"
			:clear="clear"
		>
			<ul
				class="ui-file-upload__files"
				:class="`ui-file-upload__files--${layout}`"
			>
				<li
					v-for="(file, index) in files"
					:key="`${file.name}-${file.size}-${file.lastModified}`"
					class="ui-file-upload__file"
				>
					<slot
						name="file"
						:file="file"
						:index="index"
						:remove-file="removeFile"
						:preview-url="previewUrls.get(file)"
					>
						<img
							v-if="previewUrls.get(file)"
							:src="previewUrls.get(file)"
							alt=""
							class="ui-file-upload__preview"
						/>
						<div
							v-else
							class="ui-file-upload__file-icon"
							aria-hidden="true"
						>
							{{
								file.name
									.split(".")
									.pop()
									?.slice(0, 4)
									.toUpperCase() || "FILE"
							}}
						</div>
						<div class="ui-file-upload__file-copy">
							<span
								class="ui-file-upload__file-name"
								:title="file.name"
								>{{ file.name }}</span
							>
							<span class="ui-file-upload__file-size">{{
								formatFileSize(file.size)
							}}</span>
						</div>
						<button
							type="button"
							class="ui-file-upload__remove"
							:aria-label="`Remove ${file.name}`"
							:disabled="disabled"
							@click="removeFile(index)"
						>
							<span aria-hidden="true">×</span>
						</button>
					</slot>
				</li>
			</ul>
		</slot>
		<slot
			name="files-bottom"
			:files="files"
			:remove-file="removeFile"
			:clear="clear"
		/>
	</div>
</template>

<style scoped>
.ui-file-upload {
	width: 100%;
	color: var(--ui-text);
}

.ui-file-upload__input {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

.ui-file-upload__dropzone {
	display: flex;
	min-height: 11rem;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 1.5rem;
	text-align: center;
	background: color-mix(in srgb, var(--ui-text) 2%, var(--ui-bg));
	border: 1px dashed color-mix(in srgb, var(--ui-text) 32%, transparent);
	border-radius: 0.5rem;
	transition:
		border-color 140ms ease,
		background-color 140ms ease,
		box-shadow 140ms ease;
}

.ui-file-upload__dropzone--interactive {
	cursor: pointer;
}

.ui-file-upload__dropzone--interactive:hover,
.ui-file-upload__dropzone--dragging {
	background: color-mix(in srgb, var(--ui-text) 6%, var(--ui-bg));
	border-color: color-mix(in srgb, var(--ui-text) 65%, transparent);
}

.ui-file-upload__dropzone:focus-visible {
	outline: 2px solid color-mix(in srgb, var(--ui-text) 70%, transparent);
	outline-offset: 2px;
}

.ui-file-upload__dropzone--error {
	border-color: var(--ui-error, #ef4444);
}

.ui-file-upload__dropzone--compact {
	min-height: auto;
	flex-direction: row;
	justify-content: flex-start;
	padding: 0.75rem;
	text-align: start;
	border-style: solid;
}

.ui-file-upload__icon {
	width: 2rem;
	height: 2rem;
	opacity: 0.65;
}

.ui-file-upload__copy,
.ui-file-upload__file-copy {
	display: flex;
	min-width: 0;
	flex-direction: column;
	gap: 0.2rem;
}

.ui-file-upload__label,
.ui-file-upload__file-name {
	font-size: 0.9rem;
	font-weight: 600;
}

.ui-file-upload__description,
.ui-file-upload__file-size {
	font-size: 0.78rem;
	opacity: 0.62;
}

.ui-file-upload__select,
.ui-file-upload__remove {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--ui-text);
	background: var(--ui-bg);
	border: 1px solid color-mix(in srgb, var(--ui-text) 24%, transparent);
	border-radius: 0.4rem;
	cursor: pointer;
}

.ui-file-upload__select {
	min-height: 2.25rem;
	padding: 0.45rem 0.8rem;
	font-size: 0.82rem;
	font-weight: 600;
}

.ui-file-upload__select:disabled,
.ui-file-upload__remove:disabled,
.ui-file-upload--disabled {
	cursor: not-allowed;
	opacity: 0.55;
}

.ui-file-upload__error {
	margin: 0.45rem 0 0;
	font-size: 0.78rem;
	color: var(--ui-error, #ef4444);
}

.ui-file-upload__files {
	display: grid;
	gap: 0.6rem;
	padding: 0;
	margin: 0.75rem 0 0;
	list-style: none;
}

.ui-file-upload__files--grid {
	grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
}

.ui-file-upload__file {
	display: flex;
	min-width: 0;
	align-items: center;
	gap: 0.7rem;
	padding: 0.6rem;
	background: color-mix(in srgb, var(--ui-text) 3%, var(--ui-bg));
	border: 1px solid color-mix(in srgb, var(--ui-text) 14%, transparent);
	border-radius: 0.45rem;
}

.ui-file-upload__files--grid .ui-file-upload__file {
	position: relative;
	align-items: stretch;
	flex-direction: column;
}

.ui-file-upload__preview,
.ui-file-upload__file-icon {
	width: 2.6rem;
	height: 2.6rem;
	flex: 0 0 auto;
	border-radius: 0.35rem;
}

.ui-file-upload__preview {
	object-fit: cover;
}

.ui-file-upload__file-icon {
	display: grid;
	place-items: center;
	font-size: 0.58rem;
	font-weight: 700;
	background: color-mix(in srgb, var(--ui-text) 10%, var(--ui-bg));
}

.ui-file-upload__files--grid .ui-file-upload__preview,
.ui-file-upload__files--grid .ui-file-upload__file-icon {
	width: 100%;
	height: 7rem;
}

.ui-file-upload__file-name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.ui-file-upload__remove {
	width: 1.8rem;
	height: 1.8rem;
	margin-inline-start: auto;
	font-size: 1.2rem;
	line-height: 1;
}

.ui-file-upload__files--grid .ui-file-upload__remove {
	position: absolute;
	top: 0.85rem;
	right: 0.85rem;
}

@media (prefers-reduced-motion: reduce) {
	.ui-file-upload__dropzone {
		transition: none;
	}
}

@media (forced-colors: active) {
	.ui-file-upload__dropzone,
	.ui-file-upload__file,
	.ui-file-upload__select,
	.ui-file-upload__remove {
		border-color: CanvasText;
	}
}
</style>
