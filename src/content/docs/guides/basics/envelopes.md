---
title: "Envelopes"
sidebar:
  order: 8
---

Tone has multiple types of envelopes for different purposes. Each of the envelopes implements an [ADSR](<https://en.wikipedia.org/wiki/Envelope_(music)#ADSR>). The `attack`, `decay` and `release` times accept any [Time](/guides/basics/time/) value, so they can be expressed in seconds or in tempo-relative values like `"8n"` (which are evaluated against the Transport's bpm when the envelope is triggered).

## Envelope Phases

![ADSR](https://upload.wikimedia.org/wikipedia/commons/e/ea/ADSR_parameter.svg)

### Attack

The `attack` portion of the envelope makes the output signal transition from 0 (min) to 1 (max) over the duration of the attack time.

### Decay

When the peak value is reached, the envelope will fall to the sustain value over the duration of the decay time.

### Sustain

Unlike the other attributes of an ADSR envelope, sustain is not a time, but a percentage of the maximum value of the signal. It is a number between 0 and 1. The envelope will remain at the sustain value, until the release is triggered.

### Release

The time it takes for the envelope to return from the sustain value back to the minimum value is defined by the `release` time.

## Envelope Types

### [Tone.AmplitudeEnvelope](/docs/latest/amplitudeenvelope/)

An amplitude envelope shapes the volume of whatever is passed through it. `triggerAttack` starts the attack and decay, ending at the sustain level, and `triggerRelease` starts the release. An optional velocity (0 to 1) on the attack scales how loud it gets. Try changing the values:

```js live
const ampEnv = new Tone.AmplitudeEnvelope({
  attack: 0.1,
  decay: 0.2,
  sustain: 0.5,
  release: 0.8,
}).toDestination();
const osc = new Tone.Oscillator(220).connect(ampEnv).start();
// trigger the attack now with a velocity of 0.8
ampEnv.triggerAttack(Tone.now(), 0.8);
// and the release one second later
ampEnv.triggerRelease("+1");
```

Synths like [Tone.Synth](/docs/latest/synth/), [Tone.MonoSynth](/docs/latest/monosynth/) and [Tone.FMSynth](/docs/latest/fmsynth/) each have one as their `envelope`: it's what makes a note start and stop when you call `triggerAttack` and `triggerRelease` on the [instrument](/guides/basics/instruments/).

### [Tone.FrequencyEnvelope](/docs/latest/frequencyenvelope/)

Tone.FrequencyEnvelope ramps from `baseFrequency` up by a number of `octaves` and back. It's useful for sweeping a filter's cutoff frequency, and it's what [Tone.MonoSynth](/docs/latest/monosynth/) uses for its `filterEnvelope`:

```js live
const filter = new Tone.Filter(200, "lowpass").toDestination();
const osc = new Tone.Oscillator(110, "sawtooth").connect(filter).start();
const freqEnv = new Tone.FrequencyEnvelope({
  attack: 0.2,
  decay: 0.4,
  sustain: 0.3,
  release: 1,
  baseFrequency: "C2",
  octaves: 5,
});
freqEnv.connect(filter.frequency);
// open the filter, then close it again after 1 second
freqEnv.triggerAttackRelease(1);
osc.stop("+3");
```

## Curves

The shape of the attack and release can be changed with `attackCurve` and `releaseCurve`: `"linear"`, `"exponential"`, `"sine"`, `"cosine"`, `"bounce"`, `"ripple"` or `"step"`, or an array of values to draw your own. The `decayCurve` can be `"linear"` or `"exponential"`. Run this to plot an envelope, and try the other curves:

```js live
return Tone.Offline(() => {
  const env = new Tone.Envelope({
    attack: 0.4,
    decay: 0.2,
    sustain: 0.5,
    release: 0.5,
    attackCurve: "bounce",
    releaseCurve: "ripple",
  }).toDestination();
  env.triggerAttackRelease(0.8);
}, 1.5, 1);
```
