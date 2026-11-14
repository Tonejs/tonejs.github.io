---
title: "A basic arpeggiator"
sidebar:
  order: 7
---

An arpeggiator plays the notes of a chord one at a time instead of all at once. In this tutorial we'll build one that arpeggiates over a chord progression, using the [Transport](/guides/basics/transport/) and a couple of [event classes](/guides/basics/events/) to keep everything in time.

## Arpeggiating a chord

[Tone.Pattern](/docs/latest/pattern/) invokes its callback with the next value from an array on every `interval`. Give it the notes of a C major chord and a [synth](/guides/tutorials/build-a-synth/) to play them:

```js live
const synth = new Tone.Synth().toDestination();
const arp = new Tone.Pattern(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  ["C4", "E4", "G4", "B4"],
  "upDown",
);
arp.interval = "16n";
arp.start(0);
Tone.getTransport().start();
```

Pass `time` along to the synth so each note plays exactly in time (see [Callback Timing](/guides/basics/transport/#callback-timing)). Try some of the other patterns in place of `"upDown"`, like `"up"`, `"down"`, `"alternateUp"` or `"random"`.

## Changing chords

One chord gets old quickly. To move through a chord progression, we need a second, slower clock that changes the pattern's notes. A [Tone.Loop](/docs/latest/loop/) that runs once a measure can do that by setting `values`, which also starts the pattern over from its first note, so each new chord begins on the downbeat:

```js live
const synth = new Tone.Synth().toDestination();
const chords = [
  ["C4", "E4", "G4", "B4"],
  ["A3", "C4", "E4", "G4"],
  ["F3", "A3", "C4", "E4"],
  ["G3", "B3", "D4", "F4"],
];
let chord = 0;

const arp = new Tone.Pattern(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  chords[0],
  "upDown",
);
arp.interval = "16n";

// move to the next chord at the start of every measure after the first
const changes = new Tone.Loop(() => {
  chord = (chord + 1) % chords.length;
  arp.values = chords[chord];
}, "1m");

arp.start(0);
changes.start("1m");
Tone.getTransport().start();
```

Both events are scheduled on the same Transport, so they stay locked together: the chord always changes exactly on the bar line, however fast or slow the arpeggio is. Try changing `arp.interval` to `"8n"` or `"8t"`, or set `Tone.getTransport().bpm.value` to speed the whole thing up.

## Changing the sound

All of Tone.js's [instruments](/guides/basics/instruments/) share the same `triggerAttackRelease` method, so the synth can be swapped for any other without changing the rest of the code. Here it's a [Tone.FMSynth](/docs/latest/fmsynth/) going through a [Tone.FeedbackDelay](/docs/latest/feedbackdelay/), with the delay time in step with the arpeggio:

```js live
const delay = new Tone.FeedbackDelay("8n.", 0.4).toDestination();
const synth = new Tone.FMSynth({
  harmonicity: 2,
  envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
}).connect(delay);

const chords = [
  ["C4", "E4", "G4", "B4"],
  ["A3", "C4", "E4", "G4"],
  ["F3", "A3", "C4", "E4"],
  ["G3", "B3", "D4", "F4"],
];
let chord = 0;

const arp = new Tone.Pattern(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  chords[0],
  "upDown",
);
arp.interval = "16n";

// move to the next chord at the start of every measure after the first
const changes = new Tone.Loop(() => {
  chord = (chord + 1) % chords.length;
  arp.values = chords[chord];
}, "1m");

arp.start(0);
changes.start("1m");
Tone.getTransport().start();
```

## On your own page

The examples here start playing when you click Run. On your own page, the Transport has to be started from a user gesture like a button click, because of the browser's [autoplay policy](/guides/starting-audio/):

```javascript
document.querySelector("button").addEventListener("click", async () => {
  await Tone.start();
  Tone.getTransport().start();
});
```
