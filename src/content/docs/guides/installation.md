---
title: "Installation"
---

## Install

Install the latest stable version from [npm](https://www.npmjs.com/package/tone):

```bash
npm install tone
```

Or the latest development version:

```bash
npm install tone@next
```

## Usage

### Module bundlers and ES modules

Tone.js is published as ES modules, so it works with any modern bundler (Vite, webpack, Rollup, esbuild, etc.). Import everything under the `Tone` namespace:

```javascript
import * as Tone from "tone";

const synth = new Tone.Synth().toDestination();
```

Or import just the pieces you need:

```javascript
import { Synth, getTransport } from "tone";

const synth = new Synth().toDestination();
```

Either style works with tree-shaking, so your bundle only includes the modules you use.

### Script tag

Tone.js is also hosted on [unpkg](https://unpkg.com/tone). If Tone.js is included in the page with a `<script>` tag, a global variable named `Tone` will be added to the `window`. Make sure it comes before any of your own scripts.

```html
<script src="https://unpkg.com/tone"></script>
<script>
  const synth = new Tone.Synth().toDestination();
</script>
```

For production, pin a specific version (e.g. `https://unpkg.com/tone@15.1.22/build/Tone.js`) so that your page doesn't change when a new version is released.

The `build/Tone.js` file is a UMD bundle, so it can also be loaded with CommonJS `require("tone")` in environments that need it.

### TypeScript

Tone.js is written in TypeScript and ships with its own type definitions. No additional `@types` package is needed.
