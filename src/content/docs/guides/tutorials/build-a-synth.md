---
title: "Build a synth"
sidebar:
  order: 1
---

[Tone.Synth](/docs/latest/synth/) is the simplest instrument in Tone.js, and it's built from just two parts: an oscillator, which makes the sound, and an envelope, which shapes it. In this tutorial we'll build one ourselves, one piece at a time, to see why each part is there.

## An oscillator on its own

An [oscillator](/guides/basics/oscillators/) makes a tone at a given frequency. Start it, and stop it half a second later:

```js live
const osc = new Tone.Oscillator(440, "triangle").toDestination();
osc.start().stop("+0.5");
```

Listen closely to the beginning and end of the note: there's a small click. To see where it comes from, here's what the wave looks like when it's stopped partway through a cycle:

```js live
return Tone.Offline(() => {
  const osc = new Tone.Oscillator(100).toDestination();
  osc.start(0).stop(0.0125);
}, 0.03, 1);
```

The wave is cut off at its peak and drops straight to 0. Speakers can't make that kind of instant jump smoothly, and we hear it as a click. The same can happen when it starts.

## Playing a melody

To play different notes, change the oscillator's `frequency`. Since `frequency` is a [signal](/guides/basics/signals/), we can schedule each change at an exact time with `setValueAtTime`, and play a little melody:

```js live
const osc = new Tone.Oscillator(440, "triangle").toDestination();
const now = Tone.now();
osc.frequency.setValueAtTime("C4", now);
osc.frequency.setValueAtTime("E4", now + 0.25);
osc.frequency.setValueAtTime("G4", now + 0.5);
osc.frequency.setValueAtTime("C5", now + 0.75);
osc.start(now).stop(now + 1);
```

That's the right pitches at the right times, but it doesn't sound much like separate notes: the oscillator never stops between them, so they run together into one long, wavering tone. We could start and stop the oscillator for every note, but then we'd hear a click on every note instead.

## Shaping the sound with an envelope

An [envelope](/guides/basics/envelopes/) fixes both problems. Instead of starting and stopping the oscillator, we leave it running and pass it through a [Tone.AmplitudeEnvelope](/docs/latest/amplitudeenvelope/), which controls its volume. When the envelope is triggered, the volume rises over the `attack` time, falls to the `sustain` level over the `decay`, and fades out over the `release`. Because the volume never jumps, there's no click:

```js live
const env = new Tone.AmplitudeEnvelope({
  attack: 0.02,
  decay: 0.1,
  sustain: 0.5,
  release: 0.3,
}).toDestination();
const osc = new Tone.Oscillator("C4", "triangle").connect(env).start();
// open the envelope for half a second
env.triggerAttackRelease(0.5);
```

Here's the same stop as before, but faded out by an envelope's release instead of cut off:

```js live
return Tone.Offline(() => {
  const env = new Tone.AmplitudeEnvelope({ release: 0.015 }).toDestination();
  const osc = new Tone.Oscillator(100).connect(env).start(0);
  env.triggerAttack(0);
  env.triggerRelease(0.0125);
}, 0.03, 1);
```

## Putting it together

Now we have both pieces: setting the frequency picks the note, and triggering the envelope plays it. Doing both at the same time gives us a note we can play whenever we like:

```js live
const env = new Tone.AmplitudeEnvelope({
  attack: 0.02,
  decay: 0.1,
  sustain: 0.5,
  release: 0.3,
}).toDestination();
const osc = new Tone.Oscillator(440, "triangle").connect(env).start();

function playNote(note, duration, time) {
  osc.frequency.setValueAtTime(note, time);
  env.triggerAttackRelease(duration, time);
}

const now = Tone.now();
playNote("C4", 0.2, now);
playNote("E4", 0.2, now + 0.25);
playNote("G4", 0.2, now + 0.5);
playNote("C5", 0.4, now + 0.75);
```

Each note is now separate, and none of them click. That's a synthesizer!

## Tone.Synth

That's exactly what [Tone.Synth](/docs/latest/synth/) does. It has an oscillator and an amplitude envelope connected just like ours, and its `triggerAttackRelease` sets the frequency and triggers the envelope, like our `playNote`:

```js live
const synth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3 },
}).toDestination();
const now = Tone.now();
synth.triggerAttackRelease("C4", 0.2, now);
synth.triggerAttackRelease("E4", 0.2, now + 0.25);
synth.triggerAttackRelease("G4", 0.2, now + 0.5);
synth.triggerAttackRelease("C5", 0.4, now + 0.75);
```

The two parts are available as `synth.oscillator` and `synth.envelope`, so you can change them just like you would on their own. Tone.Synth also does one thing ours doesn't: it starts the oscillator when a note begins and stops it once the release has finished, so it isn't using any processing power while it's silent.

### Portamento

Because it controls the frequency, Synth can also glide from one note to the next instead of jumping. `portamento` is how long the glide takes, in seconds:

```js live
const synth = new Tone.Synth().toDestination();
synth.portamento = 0.1;
const now = Tone.now();
synth.triggerAttackRelease("C4", 0.2, now);
synth.triggerAttackRelease("E4", 0.2, now + 0.25);
synth.triggerAttackRelease("G4", 0.2, now + 0.5);
synth.triggerAttackRelease("C5", 0.4, now + 0.75);
```

Play around with all of Synth's attributes [here](/examples/simpleSynth.html).
