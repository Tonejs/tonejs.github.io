---
title: "Using Tone.js with React or Vue"
sidebar:
  order: 6
---

Tone.js nodes are long-lived, imperative objects: once created, a node stays connected in the audio graph (and keeps using CPU) until it's disposed. Components, on the other hand, re-render often and can mount and unmount at any time. Many bugs when using Tone.js with a framework come from the mismatch between the two. A few things to keep in mind no matter which framework you're using:

- Call `Tone.start()` from a user interaction (like a click handler) before playing any sound. See [Autoplay](/guides/starting-audio/).
- Create Tone.js nodes once, not on every render, and `dispose()` of them when the component unmounts.

## React

This component loads a sample into a [Tone.Sampler](/docs/latest/sampler/) when it mounts, enables the button once it's loaded, and plays the sample when the button is clicked:

```jsx
import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";
import A1 from "./A1.mp3";

export function App() {
  const [isLoaded, setLoaded] = useState(false);
  const sampler = useRef(null);

  useEffect(() => {
    sampler.current = new Tone.Sampler(
      { A1 },
      {
        onload: () => {
          setLoaded(true);
        },
      },
    ).toDestination();

    // dispose of the sampler when the component unmounts
    return () => {
      sampler.current.dispose();
    };
  }, []);

  const handleClick = async () => {
    await Tone.start();
    sampler.current.triggerAttackRelease("A1", "4n");
  };

  return (
    <button disabled={!isLoaded} onClick={handleClick}>
      play
    </button>
  );
}
```

### Don't create nodes during render

It's tempting to write something like this:

```typescript
// 🚫 don't do this
function useFilter(options?: Partial<Tone.FilterOptions>) {
  const filter = useRef(new Tone.Filter(options).toDestination());
  return filter.current;
}
```

The argument to `useRef` is evaluated on **every** render, so this creates (and connects) a brand new Filter each time the component re-renders. Only the first one is kept in the ref; the rest are never disposed and stay connected to the speakers. Nothing ever disposes the first one either.

### Create nodes in an effect and dispose of them in its cleanup

Creating the node inside `useEffect` and disposing of it in the effect's cleanup ties the node's lifetime to the component's. It also behaves correctly under Strict Mode, which runs effects twice in development: the first node is disposed before the second is created. This small hook works for any Tone.js node:

```typescript
// useToneNode.ts
import { useEffect, useState } from "react";

export function useToneNode<T extends { dispose(): unknown }>(
  create: () => T,
): T | null {
  const [node, setNode] = useState<T | null>(null);

  useEffect(() => {
    const instance = create();
    setNode(instance);
    return () => {
      instance.dispose();
    };
  }, []);

  return node;
}
```

The node is `null` on the first render (before the effect has run), so the component needs to handle that case. `create` only runs once, when the component mounts. Changes to props after that are applied separately, as shown below.

### Sync props with effects

To respond to prop changes, update the existing node in an effect instead of creating a new one. Signals like `frequency` can be ramped so the change is smooth:

```tsx
import { useEffect } from "react";
import * as Tone from "tone";
import { useToneNode } from "./useToneNode";

type Props = {
  frequency: number;
  type: "sine" | "square" | "triangle" | "sawtooth";
};

export function OscillatorButton({ frequency, type }: Props) {
  const osc = useToneNode(() =>
    new Tone.Oscillator({ frequency, type }).toDestination(),
  );

  useEffect(() => {
    osc?.frequency.rampTo(frequency, 0.05);
  }, [osc, frequency]);

  useEffect(() => {
    if (osc) osc.type = type;
  }, [osc, type]);

  const toggle = async () => {
    if (!osc) return;
    await Tone.start();
    if (osc.state === "started") {
      osc.stop();
    } else {
      osc.start();
    }
  };

  return (
    <button disabled={!osc} onClick={toggle}>
      toggle
    </button>
  );
}
```

You can also pass a whole options object to `node.set(options)` in an effect. If you do, memoize the object (or depend on its individual values), since a new object literal on every render will re-run the effect every time.

## Vue

The same component in Vue creates the sampler in `onMounted` and disposes of it in `onUnmounted`:

```vue
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as Tone from "tone";
import A1 from "./A1.mp3";

const isLoaded = ref(false);
// a plain variable, not a ref, so Vue doesn't make the sampler reactive
let sampler;

onMounted(() => {
  sampler = new Tone.Sampler(
    { A1 },
    {
      onload: () => {
        isLoaded.value = true;
      },
    },
  ).toDestination();
});

onUnmounted(() => {
  sampler.dispose();
});

async function handleClick() {
  await Tone.start();
  sampler.triggerAttackRelease("A1", "4n");
}
</script>

<template>
  <button :disabled="!isLoaded" @click="handleClick">play</button>
</template>
```

Keep Tone.js nodes out of Vue's reactivity system (`ref`, `reactive` or `data()`). Vue wraps reactive objects in a proxy, which Tone.js nodes aren't designed to work through. If a node does need to be in a ref, use `shallowRef` or `markRaw`.

## Keep shared audio outside of components

Not everything needs to live in a component. The Transport, a master effects chain, or an instrument that several components play are often simpler to create once in a plain module and import where they're needed. Components then just call into that module (`synth.triggerAttackRelease(...)`, `Tone.getTransport().start()`, etc.) and hold UI state like "is playing". This also avoids accidentally tearing down audio when a component unmounts.

```typescript
// audio.ts
import * as Tone from "tone";

export const reverb = new Tone.Reverb(2).toDestination();
export const synth = new Tone.PolySynth(Tone.Synth).connect(reverb);
```

Event callbacks (`Tone.Loop`, `Tone.Sequence`, `Transport.schedule`, ...) are a good fit for this too. If a callback needs to update component state (for example to highlight the current step of a sequencer), schedule the update with [`Tone.getDraw()`](/guides/tutorials/performance/#syncing-visuals) so that it lines up with what's being heard.

## Typing options with TypeScript

Tone.js exports the options interfaces for its classes (such as `FilterOptions`, `SamplerOptions` and `ReverbOptions`), so you can import them directly when typing your own hooks and components. Since every option is optional when constructing a node, wrap the interface in `Partial`:

```typescript
import * as Tone from "tone";

// options is `any` (or an error with `noImplicitAny`)
function useFilter(options) {
  /* ... */
}

// options is typed
function useFilter(options?: Partial<Tone.FilterOptions>) {
  /* ... */
}
```

## References

- [React + TypeScript Cheatsheets](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet)
