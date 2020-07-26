import { compile, TemplateDelegate } from "handlebars";
import { readFile, writeFile, ensureDir } from "fs-extra";
import { resolve } from "path";
import { registerPartials } from "./partials";
import { registerHelpers } from "./helpers";
const argv = require("yargs").alias("o", "output").argv;

const TEMPLATE_DIR = resolve(__dirname, "../templates");
const OUT_DIR = resolve(argv.output);
const CLASS_DIR = OUT_DIR;
const TYPE_DIR = resolve(OUT_DIR, "type");
const INTERFACE_DIR = resolve(OUT_DIR, "interface");
const FUNCTION_DIR = resolve(OUT_DIR, "fn");
const INPUT_FILE = resolve(__dirname, "../../node_modules/tone/docs/tone.json");
// const INPUT_FILE = resolve(__dirname, '../../../Tone.js/docs/tone.json')

async function getClassTemplate(): Promise<TemplateDelegate> {
	const classTemplate = await readFile(
		resolve(TEMPLATE_DIR, "class.hbs"),
		"utf-8"
	);
	return compile(classTemplate, {
		preventIndent: true,
	});
}

async function ensureDirs() {
	await ensureDir(OUT_DIR);
	await Promise.all([
		ensureDir(INTERFACE_DIR),
		ensureDir(TYPE_DIR),
		ensureDir(FUNCTION_DIR),
	]);
}

async function getInterfaceTemplate(): Promise<TemplateDelegate> {
	const iTempl = await readFile(
		resolve(TEMPLATE_DIR, "interface.hbs"),
		"utf-8"
	);
	return compile(iTempl, {
		preventIndent: true,
	});
}

async function getTypeTemplate(): Promise<TemplateDelegate> {
	const tTemplate = await readFile(
		resolve(TEMPLATE_DIR, "typeTemplate.hbs"),
		"utf-8"
	);
	return compile(tTemplate, {
		preventIndent: true,
	});
}

async function getFunctionTemplate(): Promise<TemplateDelegate> {
	const fTemplate = await readFile(
		resolve(TEMPLATE_DIR, "function.hbs"),
		"utf-8"
	);
	return compile(fTemplate, {
		preventIndent: true,
	});
}

async function getIndexTemplate(): Promise<TemplateDelegate> {
	const fTemplate = await readFile(
		resolve(TEMPLATE_DIR, "index.hbs"),
		"utf-8"
	);
	return compile(fTemplate, {
		preventIndent: true,
	});
}

async function getJSON() {
	return JSON.parse(await readFile(INPUT_FILE, "utf-8"));
}

async function main() {
	//clean the contents of the dir
	const json = await getJSON();
	await registerPartials();
	await registerHelpers(json);
	await ensureDirs();
	const classTemplate = await getClassTemplate();
	const interfaceTemplate = await getInterfaceTemplate();
	const typeTemplate = await getTypeTemplate();
	const fnTemplate = await getFunctionTemplate();
	await Promise.all(
		json.children.slice(0).map(async (docs) => {
			if (docs.name && docs.kindString === "Class") {
				await writeFile(
					resolve(CLASS_DIR, `${docs.name}.html`),
					classTemplate(docs)
				);
			} else if (docs.kindString === "Interface") {
				await writeFile(
					resolve(INTERFACE_DIR, `${docs.name}.html`),
					interfaceTemplate(docs)
				);
			} else if (docs.kindString === "Type alias") {
				await writeFile(
					resolve(TYPE_DIR, `${docs.name}.html`),
					typeTemplate(docs)
				);
			} else if (docs.kindString === "Function") {
				if (docs.name === "Offline") {
					await writeFile(
						resolve(OUT_DIR, "class.json"),
						JSON.stringify(docs, undefined, "\t")
					);
				}
				await writeFile(
					resolve(FUNCTION_DIR, `${docs.name}.html`),
					fnTemplate(docs)
				);
			}
		})
	);
	// add the index page
	const indexTemplate = await getIndexTemplate();
	await writeFile(
		resolve(CLASS_DIR, "index.html"),
		indexTemplate({
			name: "Tone.js Docs",
		})
	);
}
main();
