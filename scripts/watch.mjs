/**
 * Local development: syncs Tone.js once if needed, starts `astro dev`, and
 * regenerates the API pages whenever the generator changes.
 *
 * Options:
 *   --local=<path>  render the "next" docs from a local Tone.js checkout and
 *                   re-run TypeDoc whenever its sources change
 *   --sync          fetch the latest from Tone.js before starting
 *   Any other flags (e.g. --host, --port) are passed through to `astro dev`.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, utimesSync, watch } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { paths, root } from "./config.mjs";

const { values, tokens } = parseArgs({
	options: { local: { type: "string" }, sync: { type: "boolean" } },
	strict: false,
	tokens: true,
});
const local = typeof values.local === "string" ? resolve(values.local) : undefined;
const astroArgs = tokens.flatMap((t) => {
	if (t.kind === "option" && (t.name === "local" || t.name === "sync")) return [];
	if (t.kind === "option") return t.inlineValue ? [`${t.rawName}=${t.value}`] : t.value !== undefined ? [t.rawName, t.value] : [t.rawName];
	return t.kind === "positional" ? [t.value] : [];
});

function node(script, args = []) {
	return new Promise((done, fail) => {
		spawn(process.execPath, [join(root, script), ...args], { stdio: "inherit" }).on("exit", (code) =>
			code === 0 ? done() : fail(new Error(`${script} exited with code ${code}`)),
		);
	});
}

const readSidebar = () => (existsSync(paths.sidebar) ? readFileSync(paths.sidebar, "utf8") : "");

/** Run one regeneration at a time, coalescing changes that arrive while it runs */
function debounced(task) {
	let timer;
	let running = Promise.resolve();
	return () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			running = running.then(async () => {
				const before = readSidebar();
				try {
					await task();
				} catch (e) {
					console.error(e.message);
				}
				// the sidebar is read by astro.config.mjs, touch it so astro dev restarts with the new one
				if (readSidebar() !== before) {
					const now = new Date();
					utimesSync(join(root, "astro.config.mjs"), now, now);
				}
			});
		}, 300);
	};
}

if (values.sync || !existsSync(paths.sidebar)) {
	await node("scripts/sync.mjs", local ? [`--local=${local}`] : []);
} else if (local) {
	await node("scripts/sync.mjs", ["--offline", "--channel=next", `--local=${local}`]);
}

const regenerate = debounced(() => node("scripts/api.mjs"));
watch(join(root, "scripts"), { recursive: true }, regenerate);

if (local) {
	const resync = debounced(() => node("scripts/sync.mjs", ["--offline", "--channel=next", `--local=${local}`]));
	watch(join(local, "Tone"), { recursive: true }, (_, file) => {
		if (file?.endsWith(".ts") && !file.endsWith(".test.ts")) resync();
	});
	watch(join(local, "examples"), { recursive: true }, (_, file) => {
		if (file && !file.includes("node_modules") && file !== "tone-ui.js") resync();
	});
	watch(join(local, "README.md"), resync);
	console.log(`watching ${join(local, "Tone")}, ${join(local, "examples")}, and README.md for changes`);
}

const astro = spawn(join(root, "node_modules/.bin/astro"), ["dev", ...astroArgs], { stdio: "inherit", cwd: root });
// astro dev may hand off to a background server (e.g. when run by an agent), keep watching in that case
astro.on("exit", (code) => code && process.exit(code));
for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, () => {
		astro.kill(signal);
		process.exit(0);
	});
}
