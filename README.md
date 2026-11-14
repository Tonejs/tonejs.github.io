# tonejs.github.io

Website, guides, and API documentation for [Tone.js](https://tonejs.github.io), built with [Astro Starlight](https://starlight.astro.build) and deployed as static HTML to GitHub Pages.

## Development

```bash
npm install
npm run watch
```

`npm run watch` syncs from Tone.js on first run, starts `astro dev` at `http://localhost:4321`, and rebuilds API pages when `scripts/` changes.

| Script            | Description                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npm run watch`   | Start dev server (`--sync` to re-fetch Tone.js, `--local=../Tone.js` to watch a local Tone.js checkout)                 |
| `npm run sync`    | Fetch Tone.js `main` and `dev` and generate API pages, READMEs, examples, and builds (`--offline` reuses cached clones) |
| `npm run api`     | Regenerate API Markdown pages and sidebar from cached `tone.json` files                                                 |
| `npm run build`   | Build static site into `dist/`                                                                                          |
| `npm run preview` | Preview `dist/` locally                                                                                                 |
| `npm run check`   | Run Astro type-checking                                                                                                 |

## How It Works

1. **Sync (`scripts/sync.mjs`)**: Clones Tone.js `main` (`latest`) and `dev` (`next`) into `.cache/tone/`, runs TypeDoc (`scripts/typedoc.mjs`) to generate `tone.json`, renders Markdown API pages (`scripts/api.mjs`) into `src/content/docs/docs/<version>/` and `.cache/sidebar.json`, writes `/docs/latest/` and `/docs/next/` redirects, converts each branch's `README.md` into the landing pages (`/` and `/next/`), and copies `examples/` and the npm `build/` bundle into `public/`.
2. **Build (`astro build`)**: Renders all guides and generated API pages into static HTML in `dist/`.
   - **Sidebar filtering (`src/routeData.ts`)**: Runs at build time for each route so pages only include the API sidebar for the version being viewed (`latest` or `next`).
   - **Live code (`src/plugins/tone-code.mjs`, `src/tone-code/`)**: Turns ` ```js live ` blocks and API `@example` blocks into interactive `<tone-code>` editors running in sandboxed iframes.
   - **Diagrams (`src/plugins/diagram.mjs`)**: Renders ` ```dot ` Graphviz blocks to inline SVGs at build time.
3. **Archive & Deploy (`.github/workflows/deploy.yml`)**: Merges pre-built historical documentation from `docs/` into `dist/docs/` (`rsync -a --ignore-existing docs/ dist/docs/`) and deploys `dist/` to GitHub Pages. During `astro dev`, `src/integrations/archive.mjs` serves `docs/` directly from disk.

## Structure

- `src/content/docs/guides/` — Hand-written guides (`basics/` and `tutorials/` are ordered via `sidebar.order` frontmatter)
- `src/tone-code/` — `<tone-code>` Lit + CodeMirror 6 live editor component
- `src/plugins/` — Markdown plugins (`tone-code.mjs`, `diagram.mjs`)
- `src/components/` — Custom Starlight overrides (`VersionSelect.astro`, `SiteTitle.astro`, `ThemeSelect.astro`, `Head.astro`)
- `scripts/` — `sync.mjs`, `typedoc.mjs`, `api.mjs`, `watch.mjs`
- `docs/` — Archived documentation from earlier Tone.js releases (see [LEGACY.md](LEGACY.md))
