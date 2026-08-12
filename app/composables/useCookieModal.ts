export const useCookieModal = () => {
	const isOpen = useState('cookie-settings-modal-open', () => false);

	const open = () => (isOpen.value = true);
	const close = () => (isOpen.value = false);
	const toggle = () => (isOpen.value = !isOpen.value);

	return { isOpen, open, close, toggle };
};
