/**
 * Markdown (Sätteri mdast) plugin: ```dot code blocks are drawn with Graphviz at build time
 * and inlined as SVG, so they need no JavaScript and take their colors from the page's CSS:
 *
 *   ```dot
 *   digraph { source -> sink }
 *   ```
 */
import { Graphviz } from "@hpcc-js/wasm-graphviz";

const graphviz = await Graphviz.load();

/** The house style, which a diagram can still override after its opening brace */
const defaults = `
	rankdir=LR; bgcolor=transparent; pad=0.1; nodesep=0.25; ranksep=0.4;
	style=rounded; fontname="Courier"; fontsize=12;
	node [shape=box, style=rounded, fontname="Courier", fontsize=12, height=0.32, margin="0.15,0.04"];
	edge [arrowsize=0.6];
`;

export default {
	name: "diagram",
	code(node, ctx) {
		if (node.lang !== "dot") return;
		const raw = graphviz.dot(node.value.replace("{", `{${defaults}`));
		// keep just the <svg>, without the XML prolog, comments or hover titles
		const svg = raw
			.slice(raw.indexOf("<svg"))
			.replace(/<!--[\s\S]*?-->\n?|<title>[\s\S]*?<\/title>\n?/g, "");
		ctx.replaceNode(node, { type: "html", value: `<figure class="diagram">${svg}</figure>` });
	},
};
