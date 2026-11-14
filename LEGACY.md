# Legacy Documentation History

The output of the first three generations of the Tone.js documentation site is preserved in `docs/` so old URLs continue to work (e.g. `/docs/15.1.22/classes/Synth.html`, `/docs/r10/Synth.html`, and old-style redirects like `/docs/latest/classes/Synth.html`). Their source lives in the git history prior to the Astro Starlight rewrite.

## Generation 1: Jekyll & Liquid templates (2014–2019)

- **Releases**: `docs/r6` through `docs/r13`, `13.4.9`, `13.8.25`.
- Documentation pages were rendered by Jekyll using Liquid templates (`_layouts/index.html`, `_includes/util/`), with Travis CI building and deploying.

## Generation 2: Custom Handlebars generator, `doc-gen` (2019–2024)

- **Releases**: `docs/14.3.30` through `docs/14.8.38` (over 100 version folders).
- A TypeScript/Handlebars app in `doc-gen/` parsed `tone.json` from the published npm package and rendered HTML from templates (`class.hbs`, `interface.hbs`, `function.hbs`).
- Styles were compiled with `node-sass`. Live, editable code blocks used the Monaco editor and `@tonejs/plot`, bundled with webpack 4.

## Generation 3: TypeDoc HTML from Tone.js (2024–2026)

- **Releases**: `docs/14.9.5+` and `docs/15.x` releases through `15.5.62`.
- Tone.js's own `npm run docs:json` rendered the TypeDoc HTML site and `tone.json`. A daily workflow cloned Tone.js, copied the output into `docs/<version>/`, wrote `docs/latest/` and `docs/next/` meta-refresh redirects, and committed the result to `master`.
- The landing page was the Tone.js README rendered by Jekyll on GitHub Pages, with `<tone-code>` loaded from `@tonejs/ui` on unpkg.
