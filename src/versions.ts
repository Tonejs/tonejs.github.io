import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export type Version = { name: string; href: string };

const docs = resolve("docs");

const key = (name: string) => (name.startsWith("r") ? [0, Number(name.slice(1)), 0] : name.split(".").map(Number));
const newestFirst = (a: Version, b: Version) => {
	const [x, y] = [key(a.name), key(b.name)];
	return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
};

const isDigits = (s: string) => s.length > 0 && [...s].every((c) => c >= "0" && c <= "9");

const isVersionName = (name: string) => {
	if (name.startsWith("r")) return isDigits(name.slice(1));
	const parts = name.split(".");
	return parts.length === 3 && parts.every(isDigits);
};

let archived: Version[] | undefined;

/** Every version whose docs are kept as-is in docs/<version>, newest first */
export function archivedVersions(): Version[] {
	archived ??= readdirSync(docs)
		.filter(isVersionName)
		.flatMap((name) => {
			const entry = ["index.html", "Synth.html", "Tone.html"].find((file) => existsSync(join(docs, name, file)));
			// some folders only hold assets from an incomplete publish
			return entry ? [{ name, href: `/docs/${name}/${entry}` }] : [];
		})
		.sort(newestFirst);
	return archived;
}

/** "15.5" for 15.5.x, one group for r6 – r13 */
export const versionGroup = ({ name }: Version) => (name.startsWith("r") ? "r6 – r13" : name.split(".").slice(0, 2).join("."));

/** The latest and next releases `npm run sync` generated docs for */
export function currentVersions(): (Version & { version: string })[] {
	return ["latest", "next"].flatMap((name) => {
		const meta = resolve(".cache", name, "meta.json");
		if (!existsSync(meta)) return [];
		const { version } = JSON.parse(readFileSync(meta, "utf8"));
		return [{ name, version, href: `/docs/${version}/` }];
	});
}
