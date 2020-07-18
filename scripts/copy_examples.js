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
	const nextExamples = path.resolve(__dirname, "../examples/next");
	console.log("removing previous examples");
	fs.removeSync(examplesDir);

	console.log("copying latest examples from master branch");
	fs.copySync(path.resolve(tmpDir.name, "examples"), examplesDir);

	console.log("copying 'next' examples from 'dev' branch");
	fs.ensureDirSync(nextExamples);
	execSync(`git checkout origin/dev`, {
		cwd: tmpDir.name,
	});
	fs.copySync(path.resolve(tmpDir.name, "examples"), nextExamples);
} finally {
	console.log("cleaning up");
	tmpDir.removeCallback();
}
