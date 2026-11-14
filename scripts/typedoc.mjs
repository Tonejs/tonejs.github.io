import { join } from "node:path";
import { Application, LogLevel } from "typedoc";

/**
 * Run TypeDoc over a Tone.js checkout and write the reflection tree (tone.json).
 * TypeDoc is used purely as a parser here; the pages are rendered by scripts/api.mjs.
 */
export async function runTypedoc(toneDir, outFile) {
	const app = await Application.bootstrapWithPlugins({
		name: "Tone.js",
		// also convert the base classes Tone.js doesn't export (Monophonic, Effect, Source, …), into an
		// "<internal>" namespace, so inherited members and their comments can be traced to where they're declared
		plugin: ["typedoc-plugin-missing-exports"],
		entryPoints: [join(toneDir, "Tone/index.ts")],
		tsconfig: join(toneDir, "tsconfig.json"),
		// Tone's tsconfig asks for the mocha/node typings, which only come with its devDependencies
		compilerOptions: { types: [] },
		skipErrorChecking: true,
		excludePrivate: true,
		excludeProtected: true,
		excludeInternal: true,
		excludeExternals: true,
		externalPattern: ["**/node_modules/**"],
		defaultCategory: "Global",
		logLevel: LogLevel.Error,
		validation: { notExported: false, invalidLink: false, invalidPath: false },
	});
	const project = await app.convert();
	if (!project) {
		throw new Error(`TypeDoc failed to convert ${toneDir}`);
	}
	await app.generateJson(project, outFile);
}

// `node scripts/typedoc.mjs <tone dir> <out file>`: plugins can only be loaded once per process,
// so the sync runs each version's TypeDoc in a process of its own
if (import.meta.url === `file://${process.argv[1]}`) {
	await runTypedoc(process.argv[2], process.argv[3]);
}
