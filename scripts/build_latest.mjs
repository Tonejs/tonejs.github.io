#!/usr/bin/env zx

import { dir } from "tmp-promise";
import { within } from "zx/core";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";
import fs from "fs-extra";
import bundle from "dts-bundle";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const tmp = await dir({ unsafeCleanup: true });
const DOCS_DIR = resolve(__dirname, "../docs");

await $`git clone https://github.com/Tonejs/Tone.js ${tmp.path}`;

async function generateDocs(branch, npmTag) {
  const { stdout } = await $`npm show tone@${npmTag} version`;
  const version = stdout.trim();
  // add the d.ts bundle
  console.log("adding tone.d.ts");
  await $`npm i tone@${version}`;
  bundle.bundle({
    name: "tone",
    main: resolve(__dirname, "../node_modules/tone/build/esm/index.d.ts"),
    out: resolve(DOCS_DIR, version, "assets/tone.d.ts"),
  });
  if (existsSync(resolve(DOCS_DIR, version))) {
    return;
  }
  await fs.ensureDir(resolve(DOCS_DIR, version));
  await within(async () => {
    cd(tmp.path);
    await $`git checkout origin/${branch}`;
    await $`npm i`;
    await $`npm run docs:json`;
    await fs.copy(resolve(tmp.path, "docs"), resolve(DOCS_DIR, version));

    // index.html should be modules.html
    await fs.copy(
      resolve(DOCS_DIR, version, "modules.html"),
      resolve(DOCS_DIR, version, "index.html")
    );
  });
}

await generateDocs("main", "latest");
await generateDocs("dev", "next");

await tmp.cleanup();
