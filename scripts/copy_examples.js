console.log("creating tmp directory");
const tmp = require("tmp");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const tmpDir = tmp.dirSync({ unsafeCleanup: true });
try {
	console.log("cloning Tone.js into tmp dir");
	execSync(`git clone git://github.com/Tonejs/Tone.js ${tmpDir.name}`);
	execSync(`git checkout origin/master`, {
		cwd: tmpDir.name,
	});

	const examplesDir = path.resolve(__dirname, "../examples");
	const nextDir = path.resolve(__dirname, "../next");
	const nextExamples = path.resolve(nextDir, "examples");
	const nextBuild = path.resolve(nextDir, "build");
	const buildPath = path.resolve(__dirname, "../build");
	console.log("removing previous examples");
	fs.removeSync(examplesDir);
	fs.removeSync(nextDir);
	fs.removeSync(buildPath);

	console.log("installing tone@latest");
	execSync("npm i tone@latest");
	fs.copySync(
		path.resolve(__dirname, "../node_modules/tone/build"),
		buildPath
	);

	console.log("copying latest examples from master branch");
	fs.copySync(path.resolve(tmpDir.name, "examples"), examplesDir);

	// copy the README, rename to index.md
	const indexmd = path.resolve(__dirname, "../index.md");
	fs.moveSync(path.resolve(tmpDir.name, "README.md"), indexmd, {
		overwrite: true,
	});
	// prepend the front-matter
	fs.writeFileSync(
		indexmd,
		`---\nlayout: default\ntitle: Tone.js\n---\n\n${fs
			.readFileSync(indexmd)
			.toString()}`
	);

	console.log("copying 'next' examples from 'dev' branch");
	fs.ensureDirSync(nextExamples);
	execSync(`git checkout origin/dev`, {
		cwd: tmpDir.name,
	});
	fs.copySync(path.resolve(tmpDir.name, "examples"), nextExamples);

	console.log("installing tone@next");
	execSync("npm i tone@next");
	fs.copySync(
		path.resolve(__dirname, "../node_modules/tone/build"),
		nextBuild
	);
} finally {
	console.log("cleaning up");
	tmpDir.removeCallback();
}
