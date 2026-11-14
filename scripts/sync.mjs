/**
 * Pulls everything the site needs from Tone.js, for each channel (main → latest, dev → next):
 *
 * - clones/updates the branch into .cache/tone/<branch>
 * - runs TypeDoc to produce tone.json, then renders the API pages into /docs/<version>/ (scripts/api.mjs)
 * - copies the examples and the published npm build into public/
 * - turns the main branch README into the homepage
 *
 * Options:
 *   --offline       reuse the existing clones instead of fetching
 *   --local=<path>  use a local Tone.js checkout for the "next" channel
 *   --channel=<name> only sync one channel (latest or next)
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { generateAll } from "./api.mjs";
import { channelPaths, channels, paths, repo, root } from "./config.mjs";

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], ...opts }).trim();

/** Shallow clone of a branch (the default branch when omitted), or bring an existing clone up to date */
function clone(url, branch, dir, offline) {
	if (!existsSync(join(dir, ".git"))) {
		mkdirSync(dirname(dir), { recursive: true });
		run("git", ["clone", "--quiet", "--depth", "1", ...(branch ? ["--branch", branch] : []), url, dir]);
	} else if (!offline) {
		run("git", ["-C", dir, "fetch", "--quiet", "--depth", "1", "origin", branch ?? "HEAD"]);
		run("git", ["-C", dir, "reset", "--quiet", "--hard", "FETCH_HEAD"]);
		run("git", ["-C", dir, "clean", "-fdxq", "-e", "node_modules"]);
	}
}

function checkout(branch, dir, offline) {
	clone(`${repo}.git`, branch, dir, offline);
	const hasExamplesUi = existsSync(join(dir, "examples/ui/package.json"));
	const needsInstall =
		!offline ||
		!existsSync(join(dir, "node_modules")) ||
		(hasExamplesUi && !existsSync(join(dir, "node_modules/.bin/tsx")));
	if (needsInstall) {
		// only runtime dependencies are needed unless examples/ui also needs to be built
		const args = ["ci", ...(hasExamplesUi ? [] : ["--omit=dev"]), "--ignore-scripts", "--no-audit", "--no-fund", "--silent"];
		run("npm", args, { cwd: dir });
	}
}

/** Copy the build/ folder of a published tone version, skipping the download when it's already there */
function copyBuild(version, dest) {
	const stamp = join(dest, ".version");
	if (existsSync(stamp) && readFileSync(stamp, "utf8") === version) return;
	const tmp = mkdtempSync(join(tmpdir(), "tone-"));
	try {
		const [{ filename }] = JSON.parse(run("npm", ["pack", `tone@${version}`, "--json", "--pack-destination", tmp]));
		run("tar", ["-xzf", join(tmp, filename), "-C", tmp]);
		rmSync(dest, { recursive: true, force: true });
		cpSync(join(tmp, "package/build"), dest, { recursive: true });
		writeFileSync(stamp, version);
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
}

function copyDir(from, to, filter) {
	rmSync(to, { recursive: true, force: true });
	cpSync(from, to, { recursive: true, filter });
}

/** Build examples/tone-ui.js if the branch uses the examples/ui workspace, then copy runtime files */
function syncExamples(source, dest) {
	const examplesDir = join(source, "examples");
	if (existsSync(join(examplesDir, "ui/package.json"))) {
		console.log(`building examples/ui in ${source}`);
		run("npm", ["run", "build", "-w", "examples/ui"], { cwd: source });
	}
	copyDir(examplesDir, dest, (src) => {
		if (src === examplesDir) return true;
		const name = basename(src);
		return name !== "ui" && !name.startsWith("scratch.");
	});
}

/**
 * Each channel's README becomes a splash page (/ for latest, /next/ for next):
 * the title becomes the hero, headings shift down a level, and ```javascript blocks become runnable.
 */
function writeHomepage(readme, channel) {
	const docsUrl = `/docs/${channel.name}/`;
	const examplesUrl = `/${channel.base}examples/`;
	const lines = readme.replaceAll("\r\n", "\n").split("\n");
	let inFence = false;
	const body = [];
	for (const line of lines) {
		const trimmed = line.trim();
		if (line.startsWith("```")) inFence = !inFence;
		if (inFence) {
			body.push(line.trimEnd() === "```javascript" ? "```js live" : line);
			continue;
		}
		// the page title and badges are replaced by the hero
		if (trimmed === "# Tone.js" || trimmed.startsWith("[![")) continue;
		body.push(line.startsWith("#") ? `#${line}` : line);
	}
	const text = body
		.join("\n")
		.trim()
		.replaceAll("https://tonejs.github.io/docs/", docsUrl)
		.replaceAll("https://tonejs.github.io/examples/", examplesUrl)
		.replaceAll("https://tonejs.github.io/guides/", "/guides/");
	const taglinePrefix = "Tone.js is ";
	const taglineStart = text.indexOf(taglinePrefix);
	const taglineEnd = taglineStart === -1 ? -1 : text.indexOf(".", taglineStart + taglinePrefix.length);
	const tagline =
		taglineStart !== -1 && taglineEnd !== -1
			? text.slice(taglineStart + taglinePrefix.length, taglineEnd + 1)
			: "";
	const heroWaveformHtml =
		'<tone-hero-waveform aria-hidden="true"><svg viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d="M-2 500L0 500L500 200L500 800L1000 500L1002 500L1002 1002L-2 1002Z"/></svg></tone-hero-waveform>';
	const frontmatter = {
		title: channel.name === "latest" ? "Tone.js" : "Tone.js (next)",
		template: "splash",
		editUrl: `${repo}/edit/${channel.branch}/README.md`,
		...(channel.name !== "latest" ? { pagefind: false } : {}),
		hero: {
			tagline: tagline.charAt(0).toUpperCase() + tagline.slice(1),
			...(channel.name === "latest" ? { image: { html: heroWaveformHtml } } : {}),
			actions: [
				{ text: "Get started", link: "#installation", icon: "right-arrow" },
				{ text: "API reference", link: docsUrl, variant: "minimal" },
				{ text: "Examples", link: examplesUrl, variant: "minimal" },
			],
		},
	};
	const outFile = join(paths.content, channel.base, "index.md");
	mkdirSync(dirname(outFile), { recursive: true });
	// JSON is valid YAML
	writeFileSync(outFile, `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${text}\n`);
}

async function main() {
	const { values } = parseArgs({ options: { offline: { type: "boolean" }, local: { type: "string" }, channel: { type: "string" } } });
	mkdirSync(paths.content, { recursive: true });

	for (const channel of channels.filter((c) => !values.channel || c.name === values.channel)) {
		const out = channelPaths(channel);
		const local = channel.name === "next" && values.local ? resolve(values.local) : undefined;
		const source = local ?? out.source;
		console.log(`[${channel.name}] ${local ?? `${repo}#${channel.branch}`}`);
		if (!local) checkout(channel.branch, source, values.offline);

		const pkg = JSON.parse(readFileSync(join(source, "package.json"), "utf8"));
		const version = local ? pkg.version : run("npm", ["view", `tone@${channel.distTag}`, "version"]);
		const meta = { version, branch: channel.branch, commit: run("git", ["-C", source, "rev-parse", "HEAD"]) };
		mkdirSync(dirname(out.json), { recursive: true });
		writeFileSync(out.meta, JSON.stringify(meta, null, "\t"));

		console.log(`[${channel.name}] typedoc (${version})`);
		// in its own process, as TypeDoc plugins can only be loaded once per process
		execFileSync(process.execPath, [join(root, "scripts/typedoc.mjs"), source, out.json], { stdio: "inherit" });

		mkdirSync(out.public, { recursive: true });
		syncExamples(source, join(out.public, "examples"));
		if (local && existsSync(join(local, "build/Tone.js"))) {
			copyDir(join(local, "build"), join(out.public, "build"));
		} else {
			copyBuild(version, join(out.public, "build"));
		}

		writeHomepage(readFileSync(join(source, "README.md"), "utf8"), channel);
	}

	generateAll();
}

await main();
