<template>
	<div class="min-h-screen flex items-center justify-center px-4">
		<div class="max-w-xl text-center">
			<h1
				class="text-9xl font-extrabold tracking-widest text-red-500 dark:text-red-400"
			>
				{{ error?.statusCode || "500" }}
			</h1>

			<p class="text-2xl md:text-3xl mt-6 text-center">
				{{ safeT("interface.serverError", texts.serverError) }}
			</p>

			<p
				class="mt-4 text-gray-600 dark:text-gray-400 text-center max-w-md mx-auto"
			>
				{{
					error?.statusMessage ||
					safeT(
						"interface.somethingWentWrong",
						texts.somethingWentWrong,
					)
				}}
			</p>

			<pre
				v-if="devMode && error?.stack"
				class="mt-4 text-[10px] leading-tight text-gray-500 overflow-x-auto border-t border-gray-300 dark:border-gray-700 pt-2"
			>
    {{ error.stack }}
  </pre>

			<div
				class="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
			>
				<button
					@click="refreshPage"
					class="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 pb-3 px-6 rounded-lg transition"
				>
					{{ safeT("interface.updatePage", texts.updatePage) }}
				</button>

				<button
					@click="handleError"
					class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 pb-3 px-6 rounded-lg transition"
				>
					{{ safeT("interface.goHomeFull", texts.goHome) }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	error: Object,
});

const getLanguage = () => {
	try {
		if (import.meta.server) {
			const headers = useRequestHeaders(["accept-language"]);
			const acceptLang = headers["accept-language"];
			if (acceptLang) {
				return acceptLang.split(",")[0].split("-")[0].toLowerCase();
			}
		} else if (typeof navigator !== "undefined" && navigator.language) {
			return navigator.language.split("-")[0].toLowerCase();
		}
	} catch (e) {
		console.error("Language detection failed", e);
	}
	return "en";
};

const userLang = getLanguage();

const dictionary = {
	ru: {
		serverError: "Упс! Ошибка сервера.",
		somethingWentWrong:
			"На сервере произошла непредвиденная ошибка. Мы уже работаем над исправлением этой проблемы. Пожалуйста, попробуйте еще раз позже.",
		goHome: "Вернуться на главную",
		updatePage: "Обновить страницу",
	},
	en: {
		serverError: "Oops! Server Error.",
		somethingWentWrong:
			"An unexpected error occurred on the server. We are already working on fixing this issue. Please try again later.",
		goHome: "Back to Homepage",
		updatePage: "Refresh Page",
	},
	pl: {
		serverError: "Ups! Błąd serwera.",
		somethingWentWrong:
			"Wystąpił nieoczekiwany błąd na serwerze. Pracujemy już nad rozwiązaniem tego problemu. Spróbuj ponownie później.",
		goHome: "Powrót do strony głównej",
		updatePage: "Odśwież stronę",
	},
	de: {
		serverError: "Hoppla! Serverfehler.",
		somethingWentWrong:
			"Auf dem Server ist ein unerwarteter Fehler aufgetreten. Wir arbeiten bereits an der Behebung des Problems. Bitte versuchen Sie es später noch einmal.",
		goHome: "Zur Startseite",
		updatePage: "Seite neu laden",
	},
	es: {
		serverError: "¡Ups! Error del servidor.",
		somethingWentWrong:
			"Ocurrió un error inesperado en el servidor. Ya estamos trabajando para solucionar este problema. Por favor, inténtelo de nuevo más tarde.",
		goHome: "Volver al inicio",
		updatePage: "Actualizar página",
	},
	it: {
		serverError: "Ops! Errore del server.",
		somethingWentWrong:
			"Si è verificato un errore imprevisto sul server. Stiamo già lavorando per risolvere il problema. Riprova più tardi.",
		goHome: "Torna alla home",
		updatePage: "Aggiorna la pagina",
	},
	fr: {
		serverError: "Oups ! Erreur de serveur.",
		somethingWentWrong:
			"Une erreur inattendue est survenue sur le serveur. Nous travaillons déjà à la résolution de ce problème. Veuillez réessayer plus tard.",
		goHome: "Retour à l'accueil",
		updatePage: "Rafraîchir la page",
	},
	pt: {
		serverError: "Ups! Erro de servidor.",
		somethingWentWrong:
			"Ocorreu um erro inesperado no servidor. Já estamos a trabalhar para resolver este problema. Por favor, tente novamente mais tarde.",
		goHome: "Voltar ao início",
		updatePage: "Atualizar página",
	},
};

const texts = dictionary[userLang] || dictionary.en;

const multiLang = (() => {
	try {
		return useMultiLang(["interface"]);
	} catch (e) {
		return null;
	}
})();

const safeT = (key, fallbackText) => {
	if (multiLang && typeof multiLang.t === "function") {
		const translated = multiLang.t(key);
		if (translated && translated !== key) return translated;
	}
	return fallbackText;
};

const devMode = import.meta.dev;

const refreshPage = () => {
	if (typeof window !== "undefined") {
		window.location.reload();
	}
};

const handleError = () => clearError({ redirect: "/" });

useHead({
	title: `Error ${props.error?.statusCode || "500"}`,
	meta: [{ name: "robots", content: "noindex" }],
});
</script>
