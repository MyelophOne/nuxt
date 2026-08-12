export const transliterate = (text: string): string => {
	const customMap: Record<string, string> = {
		а: 'a',
		б: 'b',
		в: 'v',
		г: 'g',
		д: 'd',
		е: 'e',
		ё: 'yo',
		ж: 'zh',
		з: 'z',
		и: 'i',
		й: 'j',
		к: 'k',
		л: 'l',
		м: 'm',
		н: 'n',
		о: 'o',
		п: 'p',
		р: 'r',
		с: 's',
		т: 't',
		у: 'u',
		ф: 'f',
		х: 'kh',
		ц: 'ts',
		ч: 'ch',
		ш: 'sh',
		щ: 'sch',
		ъ: '',
		ы: 'y',
		ь: '',
		э: 'e',
		ю: 'yu',
		я: 'ya',
		ł: 'l',
		α: 'a',
		β: 'b',
		γ: 'g',
		δ: 'd',
		ε: 'e',
		ζ: 'z',
		η: 'h',
		θ: 'th',
		ι: 'i',
		κ: 'k',
		λ: 'l',
		μ: 'm',
		ν: 'n',
		ξ: 'x',
		ο: 'o',
		π: 'p',
		ρ: 'r',
		σ: 's',
		ς: 's',
		τ: 't',
		υ: 'y',
		φ: 'f',
		χ: 'ch',
		ψ: 'ps',
		ω: 'o',
	};

	return text
		.toLowerCase()
		.split('')
		.map((c) => customMap[c] || c)
		.join('')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-');
};
