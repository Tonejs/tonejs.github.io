---
title: "Oscillators"
sidebar:
  order: 6
---

An oscillator produces a wave that repeats over and over. How often it repeats per second is its `frequency` (in hertz, or as a note name like `"C4"`), which you hear as pitch. The shape of the wave is its `type`, which you hear as its tone, or timbre.

```js live
const osc = new Tone.Oscillator(440, "sine").toDestination().start();
// glide up an octave
osc.frequency.rampTo(880, 2);
osc.stop("+3");
```

## Wave shapes

[Tone.Oscillator](/docs/latest/oscillator/) has four basic shapes:

- `"sine"`: a pure, smooth tone with no harmonics. Soft, like a flute or a whistle.
- `"triangle"`: a little brighter than a sine, but still mellow.
- `"square"`: hollow and buzzy, like a clarinet or an old video game.
- `"sawtooth"`: the brightest and buzziest, rich in harmonics. A common starting point for synth leads and pads.

Run this to draw a few cycles of a wave, and change the `type` to see the others:

```js live
return Tone.Offline(() => {
  new Tone.Oscillator(100, "sawtooth").toDestination().start();
}, 0.03);
```

## Harmonics

Any repeating wave can be built by adding together sine waves at whole-number multiples of its frequency. The sine at the frequency itself is the _fundamental_, and the ones above it are its _harmonics_ (or _partials_): at 2×, 3×, 4× the frequency and so on. Which harmonics a wave has, and how loud they are, is what makes a square sound different from a sawtooth at the same pitch:

- A sine wave is just the fundamental.
- Square and triangle waves have only the odd harmonics (3×, 5×, 7×…). They fade out quickly in a triangle and slowly in a square, which is why the square sounds brighter.
- A sawtooth has every harmonic.

Adding a number to the type limits the wave to that many partials. `"square4"` is built from just the first 4 partials of a square wave, so it sounds softer than a full `"square"`:

```js live
const osc = new Tone.Oscillator(220, "square4").toDestination().start();
osc.stop("+2");
```

You can also make your own shape by setting the volume of each partial directly. This sets the type to `"custom"`:

```js live
const osc = new Tone.Oscillator(220).toDestination().start();
// the fundamental, then the 2nd harmonic at half volume, then the 3rd at a quarter
osc.partials = [1, 0.5, 0.25];
osc.stop("+2");
```

## Pulse width

A square wave spends half of each cycle up and half down. [Tone.PulseOscillator](/docs/latest/pulseoscillator/) lets you change that balance with `width`. A width of `0.1` is up for 10% of the cycle and down for 90%, which sounds thinner and more nasal than a square. [Tone.PWMOscillator](/docs/latest/pwmoscillator/) sweeps the width back and forth at its `modulationFrequency`, for a moving, chorus-like tone.

## FM and AM

Some oscillators are made of two oscillators: a _carrier_, which you hear, and a _modulator_, which changes it.

- In [Tone.FMOscillator](/docs/latest/fmoscillator/) (frequency modulation), the modulator wobbles the carrier's frequency.
- In [Tone.AMOscillator](/docs/latest/amoscillator/) (amplitude modulation), the modulator wobbles the carrier's volume.

When the modulator is fast enough, you don't hear the wobble as a wobble, but as new harmonics added to the sound. Two settings shape them:

- `harmonicity` is the modulator's frequency as a multiple of the carrier's. At `1` they're the same frequency, and at `2` the modulator is an octave above. Whole numbers give harmonic, musical tones, and values in between give clangy, bell-like or metallic ones.
- `modulationIndex` (FM only) is how strongly the modulator bends the carrier's frequency. Higher values add more harmonics and sound brighter and harsher.

```js live
const fm = new Tone.FMOscillator({
  frequency: 220,
  harmonicity: 3.5,
  modulationIndex: 10,
}).toDestination().start();
fm.stop("+2");
```

## Fat oscillators

[Tone.FatOscillator](/docs/latest/fatoscillator/) plays several copies of a wave at once (`count`), each slightly out of tune with the others. `spread` sets how far apart they are in cents (hundredths of a semitone). The copies drift in and out of phase with each other, which gives a thick, shimmering sound:

```js live
const fat = new Tone.FatOscillator("C3", "sawtooth", 40).toDestination().start();
fat.stop("+2");
```

## OmniOscillator

[Tone.OmniOscillator](/docs/latest/omnioscillator/) can be any of the oscillators above, picked by its `type`. Use the basic shapes, `"pulse"` or `"pwm"`, or put `"fm"`, `"am"` or `"fat"` in front of a basic shape, like `"fmsine"` or `"fatsawtooth"`.

Most of Tone.js's [instruments](/guides/basics/instruments/) use an OmniOscillator, so this is also how you change their sound:

```js live
const synth = new Tone.Synth().toDestination();
synth.oscillator.type = "fatsawtooth";
synth.triggerAttackRelease("C3", "2n");
```

Settings that only some types have, like `width` or `harmonicity`, are only available while the OmniOscillator is set to one of those types. Otherwise they're `undefined`.

## Other sources

Oscillators are one kind of _source_, something that makes sound. The others are [Tone.Noise](/docs/latest/noise/), which plays white, pink or brown noise (hear the difference in [this example](/examples/noises.html)), and the [Player](/guides/basics/player/) for audio files.
