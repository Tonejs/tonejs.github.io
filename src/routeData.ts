import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

type SidebarEntry = (typeof Astro.locals.starlightRoute.sidebar)[number];

/** API groups start with an Overview link to their version's folder, e.g. /docs/15.1.22/ */
const apiBase = (entry: SidebarEntry) => {
	const first = entry.type === "group" ? entry.entries[0] : undefined;
	if (first?.type !== "link") return undefined;
	const { href } = first;
	const isVersionRoot = href.startsWith("/docs/") && href.endsWith("/") && href.split("/").length === 4;
	return isVersionRoot ? href : undefined;
};

/** Only show the API of the version being read, the latest release everywhere else */
export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const groups = route.sidebar.filter(apiBase);
	if (groups.length < 2) return;
	const keep = groups.find((group) => context.url.pathname.startsWith(apiBase(group)!)) ?? groups[0];
	route.sidebar = route.sidebar.filter((entry) => !groups.includes(entry) || entry === keep);
});
