<script lang="ts">
import { cloneVNode, Fragment } from "vue";
import { transliterate } from "~/utils/transliterate";

function getTextFromNodes(nodes: VNode[] | VNode | string): string {
	if (typeof nodes === "string") return nodes;
	if (Array.isArray(nodes)) return nodes.map(getTextFromNodes).join("");
	if (!nodes) return "";
	if (nodes.type === Text) return (nodes.children as string) || "";
	if (nodes.type === Fragment && Array.isArray(nodes.children))
		return getTextFromNodes(nodes.children as VNode[]);
	if (typeof nodes.children === "string") return nodes.children;
	if (Array.isArray(nodes.children))
		return getTextFromNodes(nodes.children as VNode[]);
	if (typeof nodes.children === "object" && (nodes.children as any).default) {
		try {
			return getTextFromNodes((nodes.children as any).default());
		} catch (e) {
			return "";
		}
	}
	return "";
}

function flattenFragments(nodes: VNode[]): VNode[] {
	let result: VNode[] = [];
	for (const node of nodes) {
		if (node.type === Fragment && Array.isArray(node.children)) {
			result = result.concat(flattenFragments(node.children as VNode[]));
		} else {
			result.push(node);
		}
	}
	return result;
}

export default defineComponent({
	name: "ContentWithToc",
	setup(_, { slots }) {
		const route = useRoute();

		const scrollToId = (id: string, smooth = true) => {
			const element = document.getElementById(id);
			if (element) {
				const headerOffset = 60;
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition =
					elementPosition + window.pageYOffset - headerOffset;

				window.scrollTo({
					top: offsetPosition,
					behavior: smooth ? "smooth" : "auto",
				});
			}
		};

		const handleNavClick = (id: string) => {
			if (history.pushState) {
				history.pushState(null, "", `#${id}`);
			} else {
				window.location.hash = id;
			}

			scrollToId(id, true);
		};

		onMounted(async () => {
			await nextTick();

			if (route.hash) {
				const id = route.hash.replace("#", "");
				setTimeout(() => {
					scrollToId(id, true);
				}, 300);
			}
		});

		return () => {
			const rawChildren = slots.default ? slots.default() : [];
			const children = flattenFragments(rawChildren);
			const tocItems: { id: string; text: string }[] = [];

			const modifiedChildren = children.map((node, index) => {
				const type = node.type as any;
				const tag =
					typeof type === "string"
						? type
						: type.name || type.__name || "";

				const isHeading =
					["h2", "h3", "h4"].includes(tag) ||
					tag.includes("Heading") ||
					(node.props && node.props.level);

				if (isHeading) {
					const text = getTextFromNodes(node);
					if (text && text.trim().length > 0) {
						let id = node.props?.id;
						if (!id) {
							id = transliterate(text);
							if (tocItems.find((t) => t.id === id))
								id = `${id}-${index}`;
						}
						tocItems.push({ id, text });
						return cloneVNode(node, {
							id,
							style: "scroll-margin-top: 1rem;",
						});
					}
				}
				return node;
			});

			const nav =
				tocItems.length > 0
					? h("nav", { class: "w-full mb-2" }, [
							h(
								"div",
								{ class: "flex flex-wrap gap-2" },
								tocItems.map((item) =>
									h(
										"a",
										{
											href: `#${item.id}`,
											class: `
                                    inline-flex items-center px-3 py-1.5 rounded-md
                                    text-xs font-medium uppercase tracking-wide
                                    transition-all duration-200

                                    bg-gray-100 text-gray-700
                                    dark:bg-white/5 dark:text-gray-200

                                    hover:bg-gray-200 dark:hover:bg-white/10
                                    hover:shadow-sm
                                `,
											onClick: (e: Event) => {
												e.preventDefault();
												handleNavClick(item.id);
											},
										},
										item.text,
									),
								),
							),
						])
					: null;

			return h("div", { class: "relative" }, [nav, modifiedChildren]);
		};
	},
});
</script>
