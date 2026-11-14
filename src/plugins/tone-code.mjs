/**
 * Markdown (Sätteri mdast) plugin: code blocks marked `live`, e.g. ```js live,
 * are rendered as <tone-code> so they can be edited and run in the browser.
 * The next channel's API pages run against the next build of Tone.js.
 */
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export default {
	name: "tone-code",
	code(node, ctx) {
		const metaTokens = (node.meta ?? "").trim().split(" ");
		if (!metaTokens.includes("live")) return;
		const pathname = ctx.fileURL?.pathname ?? "";
		const next = pathname.includes("/src/content/docs/docs/next/") || pathname.includes("/src/content/docs/next/");
		const attrs = next ? ' tone="/next/build/Tone.js"' : "";
		ctx.replaceNode(node, { type: "html", value: `<tone-code${attrs}><pre>${escape(node.value)}</pre></tone-code>` });
	},
};
