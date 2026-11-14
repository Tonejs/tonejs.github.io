import { existsSync, readFileSync } from "node:fs";
import { satteri } from "@astrojs/markdown-satteri";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import archive from "./src/integrations/archive.mjs";
import diagram from "./src/plugins/diagram.mjs";
import toneCode from "./src/plugins/tone-code.mjs";

// written by `npm run sync`, which also generates the pages it links to
const sidebarFile = new URL("./.cache/sidebar.json", import.meta.url);
const apiSidebar = existsSync(sidebarFile) ? JSON.parse(readFileSync(sidebarFile, "utf8")) : [];

export default defineConfig({
	site: "https://tonejs.github.io",
	markdown: {
		processor: satteri({ mdastPlugins: [toneCode, diagram] }),
	},
	vite: {
		// the lazily loaded <tone-code> chunk (CodeMirror + Lit) is ~525kB before gzip
		build: { chunkSizeWarningLimit: 600 },
	},
	integrations: [
		starlight({
			title: "Tone.js",
			description: "A Web Audio framework for creating interactive music in the browser.",
			favicon: "/favicon.png",
			// for the guides; generated pages set their own editUrl
			editLink: { baseUrl: "https://github.com/Tonejs/tonejs.github.io/edit/master/" },
			// no "Previous / Next page" links at the bottom of pages
			pagination: false,
			social: [{ icon: "github", label: "GitHub", href: "https://github.com/Tonejs/Tone.js" }],
			customCss: ["@fontsource-variable/hanken-grotesk", "@fontsource-variable/geist-mono", "./src/styles/custom.css"],
			components: {
				Head: "./src/components/Head.astro",
				SiteTitle: "./src/components/SiteTitle.astro",
				ThemeSelect: "./src/components/ThemeSelect.astro",
			},
			// shows only the API of the version being read
			routeMiddleware: "./src/routeData.ts",
			sidebar: [
				{
					label: "Start here",
					items: [
						{ label: "Introduction", link: "/" },
						{ label: "Examples", link: "/examples/" },
					],
				},
				...apiSidebar,
				{
					label: "Guides",
					items: [
						"guides/installation",
						"guides/starting-audio",
						"guides/loading-buffers",
						{ label: "Basics", collapsed: true, items: [{ autogenerate: { directory: "guides/basics" } }] },
						{ label: "Tutorials", collapsed: true, items: [{ autogenerate: { directory: "guides/tutorials" } }] },
					],
				},
			],
		}),
		archive(),
	],
});
