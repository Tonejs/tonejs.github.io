import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const docsDir = fileURLToPath(new URL("../../docs/", import.meta.url));
const publicDir = fileURLToPath(new URL("../../public/", import.meta.url));
const cacheDir = fileURLToPath(new URL("../../.cache/", import.meta.url));

const types = {
	".html": "text/html; charset=utf-8",
	".css": "text/css",
	".js": "text/javascript",
	".json": "application/json",
	".svg": "image/svg+xml",
	".png": "image/png",
	".ts": "text/plain",
	".woff": "font/woff",
	".woff2": "font/woff2",
};

/** Whether `path` inside `dir` is a directory with an index.html */
function isIndexDir(dir, path) {
	const target = normalize(join(dir, path));
	return target.startsWith(dir) && existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, "index.html"));
}

/** Resolve a request path to a file inside `dir`, using index.html for directories and .html for extensionless URLs */
function resolveFile(dir, path) {
	let file = normalize(join(dir, path));
	if (!file.startsWith(dir)) return;
	if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
	else if (!existsSync(file) && !extname(file)) file = `${file}.html`;
	return existsSync(file) ? file : undefined;
}

/** The /docs/<version>/ folders `npm run sync` generated pages for */
function generatedVersions() {
	if (!existsSync(cacheDir)) return [];
	return readdirSync(cacheDir)
		.map((name) => join(cacheDir, name, "meta.json"))
		.filter((file) => existsSync(file))
		.map((file) => `/docs/${JSON.parse(readFileSync(file, "utf8")).version}/`);
}

/**
 * Files in docs/ are served unless the build generates the same path, which is how
 * the deploy merges them too (generated files win).
 */
function archiveFile(path) {
	if (!path.startsWith("/docs/") || resolveFile(publicDir, path)) return;
	const generated = generatedVersions().some((base) => path.startsWith(base));
	if (generated && (path.endsWith("/") || path.endsWith("/index.html"))) return;
	return resolveFile(docsDir, path.slice("/docs/".length));
}

/**
 * Makes `astro dev` serve what GitHub Pages serves in production:
 * - docs/ holds the previously published docs. They are merged into the built
 *   site at deploy time; in dev they're served straight from disk.
 * - directories in public/ (examples, /docs/latest/ redirects) resolve to their index.html.
 */
export default function archive() {
	const serve = (req, res, next) => {
		const url = new URL(req.url, "http://localhost");
		const path = decodeURIComponent(url.pathname);
		if (
			!path.endsWith("/") &&
			(isIndexDir(publicDir, path) || (path.startsWith("/docs/") && isIndexDir(docsDir, path.slice("/docs/".length))))
		) {
			res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
			res.end();
			return;
		}
		const file =
			(path !== "/" && (path.endsWith("/") || !extname(path)) ? resolveFile(publicDir, path) : undefined) ??
			archiveFile(path);
		if (!file) return next();
		res.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
		createReadStream(file).pipe(res);
	};
	return {
		name: "tone-docs-archive",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								name: "tone-docs-archive",
								// a post hook runs after Astro adds its own middleware, so this goes in front of it,
								// including the guard that refuses to serve project files like docs/ from the root
								configureServer: (server) => () => server.middlewares.stack.unshift({ route: "", handle: serve }),
							},
						],
					},
				});
			},
		},
	};
}
