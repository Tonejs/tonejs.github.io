---
title: "Effects"
sidebar:
  order: 5
---

Tone.js also has a bunch of stereo and mono effects.

To add an effect to your audio signal, simply connect the effect in between your source and destination. Here is an example which routes a [Tone.Synth](/docs/latest/synth/) through a [Tone.BitCrusher](/docs/latest/bitcrusher/).

```js live
// create an effect and connect it to the destination (the speakers)
const bitCrusher = new Tone.BitCrusher(4).toDestination();
// create a synth and connect it to the effect
const synth = new Tone.Synth().connect(bitCrusher);
// and play a note to hear the effect
synth.triggerAttackRelease("C4", "8n");
```

## dry/wet

All effects have a dry/wet control called `wet` which controls how much of the effected ("wet") signal is output compared to the unaffected ("dry") signal. The default value for most effects is 100% wet (`1`).

```javascript
// 50/50 mix
effect.wet.value = 0.5;
```

## Async effects

Some effects ([Tone.Reverb](/docs/latest/reverb/), for example) need to generate an impulse response before they produce sound. `Reverb` exposes a `ready` promise which resolves once it's done:

```js live
const reverb = new Tone.Reverb(2).toDestination();
await reverb.ready;
```

## Starting and stopping effects

Effects that are modulated by an LFO, [Tone.AutoFilter](/docs/latest/autofilter/), [Tone.AutoPanner](/docs/latest/autopanner/), [Tone.Chorus](/docs/latest/chorus/) and [Tone.Tremolo](/docs/latest/tremolo/), need to be started with `.start()` before you will hear the modulation:

```js live
const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();
const synth = new Tone.Synth().connect(tremolo);
synth.triggerAttackRelease("C4", "2n");
```

`stop()` stops the modulation, and both take an optional time, like sources. To keep the modulation in time with the [Transport](/guides/basics/transport/), see [Syncing to the Transport](/guides/tutorials/sync/#effects).
