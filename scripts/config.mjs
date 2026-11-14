import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const root = fileURLToPath(new URL("..", import.meta.url));

export const paths = {
	cache: join(root, ".cache"),
	content: join(root, "src/content/docs"),
	public: join(root, "public"),
	sidebar: join(root, ".cache/sidebar.json"),
};

export const repo = "https://github.com/Tonejs/Tone.js";

/**
 * Each channel pairs a Tone.js branch with an npm dist-tag.
 * Its docs are published at /docs/<version>/ with redirects from /docs/<name>/,
 * and its examples and build files under `base`.
 */
export const channels = [
	{ name: "latest", branch: "main", distTag: "latest", base: "" },
	{ name: "next", branch: "dev", distTag: "next", base: "next/" },
];

/** Everything generated for a channel lives in these locations */
export function channelPaths(channel) {
	return {
		source: join(paths.cache, "tone", channel.branch),
		json: join(paths.cache, channel.name, "tone.json"),
		meta: join(paths.cache, channel.name, "meta.json"),
		pages: join(paths.content, "docs", channel.name),
		redirects: join(paths.public, "docs", channel.name),
		public: join(paths.public, channel.base),
	};
}
