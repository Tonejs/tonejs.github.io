const { execSync } = require("child_process");
const { resolve, relative, dirname } = require("path");
const glob = require("glob-promise");
const fs = require("fs-extra");

function createRedirects(version, tag) {
	console.log(`creating redirects for ${version}`);
	const basePath = resolve(__dirname, "../docs/", version);
	const docFiles = glob.sync(resolve(basePath, "**/*.html"));
	console.log(docFiles);
	docFiles.forEach((file) => {
		console.log(file);
		const latestFile = file.replace(version, tag);
		fs.ensureDirSync(dirname(latestFile));
		fs.writeFileSync(
			latestFile,
			`
			<meta http-equiv="refresh" content="0; URL='${relative(
				dirname(latestFile),
				file
			)}'" />
		`
		);
	});
}

// create redirect for 'latest'
const latestVersion = execSync(`npm show tone@latest version`)
	.toString()
	.trim();
createRedirects(latestVersion, "latest");

// redirect from the root
createRedirects(latestVersion, "");

// do that for 'next tag
const nextVersion = execSync(`npm show tone@next version`).toString().trim();
createRedirects(nextVersion, "next");
