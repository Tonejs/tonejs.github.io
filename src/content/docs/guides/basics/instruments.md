---
title: "Instruments"
sidebar:
  order: 1
---

Tone.js has a number of pre-built synthesizers, including [Synth](/docs/latest/synth/), [MonoSynth](/docs/latest/monosynth/), [FMSynth](/docs/latest/fmsynth/), [AMSynth](/docs/latest/amsynth/), [DuoSynth](/docs/latest/duosynth/), [MembraneSynth](/docs/latest/membranesynth/), [MetalSynth](/docs/latest/metalsynth/), [NoiseSynth](/docs/latest/noisesynth/) and [PluckSynth](/docs/latest/plucksynth/), as well as the sample-based [Sampler](/docs/latest/sampler/).

## Methods

All instruments have the same basic methods for triggering the start and end of the notes.

### triggerAttack

A note starts with an "attack". `triggerAttack` takes the note name or frequency as the first argument.

```js live
const synth = new Tone.Synth().toDestination();
//trigger the start of a note
// it will sustain forever
synth.triggerAttack("C4");
```

### triggerRelease

After the attack, the note will stay at the `sustain` level until `triggerRelease` is called.

```js live
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
synth.triggerAttack("C4");
synth.triggerRelease(now + 1);
```

### triggerAttackRelease

To schedule an attack and release together, use `triggerAttackRelease`.

```js live
const synth = new Tone.Synth().toDestination();
// trigger "C4" and then 1 second later trigger the release
synth.triggerAttackRelease("C4", 1);
```

## Additional Arguments

Both `triggerAttack` and `triggerAttackRelease` accept optional `time` and `velocity` arguments after the note (and duration, for `triggerAttackRelease`):

- `triggerAttack(note, time?, velocity?)`
- `triggerAttackRelease(note, duration, time?, velocity?)`

If `time` is omitted, the note triggers immediately. `velocity` is a value between 0 and 1 that scales the envelope's attack and sustain levels. (Note that [NoiseSynth](/docs/latest/noisesynth/) has no pitch, so its methods omit the `note` argument.)

```js live
const synth = new Tone.Synth().toDestination();
const now = Tone.now();
// trigger "C4" for an 8th note, starting at `now` with a velocity of 50%
synth.triggerAttackRelease("C4", "8n", now, 0.5);
```

## Polyphony

Most of the synthesizers are monophonic, meaning they can only produce a single note at a time. [Tone.PolySynth](/docs/latest/polysynth/) will turn any of the synthesizers into a polyphonic synthesizer by producing multiple copies of a synth and then handling the triggering of attacks and releases of those synth voices. Tone.PolySynth is not a synth by itself, but just a wrapper for constructing multiple voices of any of the other synthesizer types.

```js live
// a polyphonic MonoSynth
const synth = new Tone.PolySynth(Tone.MonoSynth).toDestination();
// play a chord
synth.triggerAttackRelease(["C4", "E4", "G4"], "4n");
```

To set attributes of all the voices, use the `set` method.

```javascript
synth.set({
  envelope: {
    attack: 0.1,
  },
});
```

Unlike the rest of the synthesizers, PolySynth's `triggerRelease` method needs to be called with the note (or notes) you want to release. Use `releaseAll` to release every active voice.

```javascript
synth.triggerAttack(["C4", "E4"]);
synth.triggerRelease("C4", "+1");
synth.releaseAll("+2");
```

Note that [Sampler](/docs/latest/sampler/) is already polyphonic and doesn't need to be wrapped in a PolySynth.
