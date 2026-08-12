export const useCommand = (commandData: CommandInput) => {
	const { $pinia } = useNuxtApp();
	const store = useCommandStore($pinia);

	let registeredId: string | null = null;

	const register = () => {
		if (!registeredId) {
			registeredId = store.register(commandData);
		}
	};

	const unregister = () => {
		if (registeredId) {
			store.unregister(registeredId);
			registeredId = null;
		}
	};

	if (getCurrentInstance()) {
		onMounted(register);
		onUnmounted(unregister);
	} else {
		register();
	}

	return { register, unregister };
};
