// get the latest version from npm
const { execSync } = require("child_process");
const { copySync, ensureDirSync } = require("fs-extra");
const { resolve } = require("path");

const DOCS_DIR = resolve(__dirname, "../docs/");

// get the latest
const versions = execSync("npm view tone@'>=14.3.29' version")
	.toString()
	.trim()
	.split("\n");
// the last one is the most recent one
const latest = versions[versions.length - 1].split(" ")[1].replace(/'/g, "");
// add that npm module
console.log(`fetching tone@${latest}`);
execSync(`npm i tone@${latest} --no-save`);
//build the version
console.log("building docs");
execSync(`npm run build:docs --output=${resolve(DOCS_DIR, latest)}`);

// add the d.ts bundle
console.log("adding tone.d.ts");
require("dts-bundle").bundle({
	name: "tone",
	main: resolve(__dirname, "../node_modules/tone/build/esm/index.d.ts"),
	out: resolve(DOCS_DIR, latest, "assets/tone.d.ts"),
});

console.log("copying script assets");
// copy the latest tone build into the assets folder
ensureDirSync(resolve(DOCS_DIR, latest, "assets/js/"));
copySync(
	resolve(__dirname, "../node_modules/tone/build/Tone.js"),
	resolve(DOCS_DIR, latest, "assets/js/Tone.js")
);
copySync(
	resolve(__dirname, "../node_modules/@tonejs/plot/dist/index.js"),
	resolve(DOCS_DIR, latest, "assets/js/Plot.js")
);
