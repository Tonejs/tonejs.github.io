// get the latest version from npm
const { execSync } = require("child_process");
const { copySync, ensureDirSync, existsSync } = require("fs-extra");
const { resolve } = require("path");

function addVersion(version) {
	if (existsSync(resolve(DOCS_DIR, version))) {
		return;
	}
	// add that npm module
	console.log(`fetching tone@${version}`);
	execSync(`npm i tone@${version} --no-save`);
	//build the version
	console.log("building docs");
	execSync(`npm run build:docs --output=${resolve(DOCS_DIR, version)}`);

	// add the d.ts bundle
	console.log("adding tone.d.ts");
	require("dts-bundle").bundle({
		name: "tone",
		main: resolve(__dirname, "../node_modules/tone/build/esm/index.d.ts"),
		out: resolve(DOCS_DIR, version, "assets/tone.d.ts"),
	});

	console.log("copying script assets");
	// copy the version tone build into the assets folder
	ensureDirSync(resolve(DOCS_DIR, version, "assets/js/"));
	copySync(
		resolve(__dirname, "../node_modules/tone/build/Tone.js"),
		resolve(DOCS_DIR, version, "assets/js/Tone.js")
	);
	copySync(
		resolve(__dirname, "../node_modules/@tonejs/plot/dist/index.js"),
		resolve(DOCS_DIR, version, "assets/js/Plot.js")
	);
}

const DOCS_DIR = resolve(__dirname, "../docs/");

// get the latest
const versions = execSync("npm view tone@'>=14.3.29' version")
	.toString()
	.trim()
	.split("\n");
// the last one is the most recent one
const latest = versions[versions.length - 1].split(" ")[1].replace(/'/g, "");

addVersion(latest);

const current = execSync(`npm show tone@latest version`).toString().trim();

addVersion(current);
