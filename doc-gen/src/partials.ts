//register all of the partials in the 'partials' dir
import { resolve, basename } from "path";
import { promise as glob } from "glob-promise";
import { readFile } from "fs-extra";
import { registerPartial, compile } from "handlebars";

const PARTIALS_DIR = resolve(__dirname, "../partials");

export async function registerPartials(): Promise<void> {
	const files = await glob(resolve(PARTIALS_DIR, "*.hbs"));
	const templates = await Promise.all(
		files.map(async (f) => {
			return {
				name: basename(f, ".hbs"),
				template: await readFile(f, "utf-8"),
			};
		})
	);
	templates.forEach(({ name, template }) =>
		registerPartial(
			name,
			compile(template, {
				preventIndent: true,
			})
		)
	);
}
