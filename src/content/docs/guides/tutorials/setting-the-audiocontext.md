---
title: "Setting the AudioContext"
sidebar:
  order: 5
---

The Web Audio [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) is the interface which represents the underlying audio-processing graph built from audio modules linked together. 

In Tone.js, a [Context](/docs/latest/context/) (a wrapper around the native AudioContext) is created for you as soon as Tone.js is loaded. It is accessible with [`Tone.getContext()`](/docs/latest/getcontext/) or by accessing `.context` from any Tone.js class instance. 

```javascript
const filter = new Tone.Filter();
filter.context; // the shared Tone.js Context
filter.context === Tone.getContext(); // true
```

All Tone.js classes share the same context by default. Nodes created from different AudioContexts cannot be interconnected. 

The native AudioContext that Tone.js wraps is available as `rawContext`:

```javascript
Tone.getContext().rawContext; // the native AudioContext
```

## Setting your own AudioContext

In some cases, you might need to explicitly set the AudioContext. [`Tone.setContext`](/docs/latest/setcontext/) accepts either a native AudioContext or a `Tone.Context`.

```javascript
// set another audio context
Tone.setContext(audioContext);
```

You should set the context before creating any nodes since nodes created before the context was set cannot be connected to the nodes created after. 

## Using other Web Audio libraries

Tone.js plays nice with most other Web Audio libraries. 

If the library creates its own instance of the AudioContext, just set Tone's to that one using `Tone.setContext`. If you can pass an AudioContext to the library, give it Tone's native context with `rawContext`. 

```javascript
// using Tone.js with Tuna.js
const tuna = new Tuna(Tone.getContext().rawContext);
```

Native Web Audio nodes can be connected to and from Tone.js nodes using `Tone.connect`:

```javascript
const nativeGain = Tone.getContext().rawContext.createGain();
const synth = new Tone.Synth();
Tone.connect(synth, nativeGain);
```
