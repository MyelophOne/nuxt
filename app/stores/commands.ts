export interface Command {
	id: string;
	name: string;
	type: 'command';
	hint?: string;
	keywords?: string[];
	action: () => void;
}

export interface CommandInput {
	id?: string;
	name: string;
	hint?: string;
	keywords?: string[];
	action: () => void;
}

export const useCommandStore = defineStore('commands', () => {
	const commands = ref<Command[]>([]);

	const register = (input: CommandInput): string => {
		const id = input.id || `cmd-${Math.random().toString(36).slice(2, 11)}`;

		const newCommand: Command = {
			...input,
			id,
			type: 'command',
		};

		commands.value.unshift(newCommand);
		return id;
	};

	const unregister = (id: string) => {
		commands.value = commands.value.filter((c) => c.id !== id);
	};

	return {
		commands,
		register,
		unregister,
	};
});
