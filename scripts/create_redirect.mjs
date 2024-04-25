#!/usr/bin/env zx

const { execSync } = require("child_process");
import { resolve, relative, dirname } from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function createRedirects(version, tag) {
  console.log(`creating redirects for ${version}`);
  const basePath = resolve(__dirname, "../docs/", version);
  const docFiles = await glob(resolve(basePath, "**/*.html"));
  console.log(`Doc files ${docFiles.length}`);

  await fs.remove(basePath.replace(version, tag));

  await Promise.all(
    docFiles.map(async (file) => {
      const latestFile = file.replace(version, tag);
      await fs.ensureDir(dirname(latestFile));
      await fs.writeFile(
        latestFile,
        `
			  <meta http-equiv="refresh" content="0; URL='${relative(
          dirname(latestFile),
          file
        )}'" />
		  `
      );
    })
  );
}

// create redirect for 'latest'
const { stdout: lastestStdout } = await $`npm show tone@latest version`;
const latestVersion = lastestStdout.trim();

await createRedirects(latestVersion, "latest");

// do it for 'next tag
const { stdout: nextStdout } = await $`npm show tone@next version`;
const nextVersion = nextStdout.trim();
createRedirects(nextVersion, "next");
