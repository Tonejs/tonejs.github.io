---
title: "Events"
sidebar:
  order: 10
---

Tone.js has a few callback-generating classes which simplify the scheduling of complexly-timed events along the [Transport](/guides/basics/transport/). These events can be set to start and stop at specific moments along the Transport, as well as loop and playback at different rates. **Events will not fire unless the Transport is started.**

All of the event callbacks are passed the precise AudioContext `time` of the event as the first argument. Always pass that `time` along to whatever you are triggering (see [Callback Timing](/guides/basics/transport/#callback-timing)).

## [Tone.Loop](/docs/latest/loop/)

Tone.Loop invokes its callback at a regular `interval`, for anything that repeats at a steady pace:

```js live
const synth = new Tone.Synth().toDestination();
// play a note every 8th note, from the beginning of the Transport's timeline
const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease("C4", "16n", time);
}, "8n").start(0);
Tone.getTransport().start();
```

The callback doesn't have to do the same thing every time. This one picks a random note on every beat:

```js live
const synth = new Tone.Synth().toDestination();
const notes = ["C4", "E4", "G4", "B4"];
new Tone.Loop((time) => {
  const note = notes[Math.floor(Math.random() * notes.length)];
  synth.triggerAttackRelease(note, "16n", time);
}, "8n").start(0);
Tone.getTransport().start();
```

A loop repeats until it's stopped, or set `iterations` to only repeat a number of times:

```js live
const synth = new Tone.Synth().toDestination();
const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease("G4", "16n", time);
}, "4n");
loop.iterations = 4;
loop.start(0);
Tone.getTransport().start();
```

## [Tone.Sequence](/docs/latest/sequence/)

Tone.Sequence plays an array of values one after another, each lasting one `subdivision`, and loops back to the start when it reaches the end. It's a good fit for evenly spaced notes, like a step sequencer or a drum pattern. `null` is a rest:

```js live
const synth = new Tone.Synth().toDestination();
const seq = new Tone.Sequence(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  ["C4", "E4", "G4", null, "G4", "E4", "C4", null],
  "8n",
).start(0);
Tone.getTransport().start();
```

A nested array divides its step evenly between its values, which is an easy way to write faster notes and triplets:

```js live
const synth = new Tone.Synth().toDestination();
// a quarter note, then a rest and an 8th note, then an 8th note triplet
const seq = new Tone.Sequence(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  ["C4", [null, "Eb4"], ["F4", "Bb4", "C5"]],
  "4n",
).start(0);
Tone.getTransport().start();
```

## [Tone.Part](/docs/latest/part/)

Tone.Part plays events at whatever times you give it, so the notes don't have to be evenly spaced, like a melody with its own rhythm. Pass an array of `[time, value]` pairs:

```js live
const synth = new Tone.Synth().toDestination();
const part = new Tone.Part(
  (time, note) => {
    synth.triggerAttackRelease(note, "8n", time);
  },
  [
    [0, "C4"],
    ["0:0:3", "E4"],
    ["0:1:2", "G4"],
    ["0:3", "C5"],
  ],
).start(0);
Tone.getTransport().start();
```

To give each event more than one value, use objects with a `time` property instead. The whole object is passed to the callback:

```js live
const synth = new Tone.Synth().toDestination();
const part = new Tone.Part(
  (time, value) => {
    synth.triggerAttackRelease(
      value.note,
      value.duration,
      time,
      value.velocity,
    );
  },
  [
    { time: 0, note: "C4", duration: "8n", velocity: 0.9 },
    { time: "0:1", note: "E4", duration: "16n", velocity: 0.4 },
    { time: "0:2", note: "G4", duration: "4n", velocity: 0.7 },
  ],
).start(0);
Tone.getTransport().start();
```

Unlike Loop and Sequence, a Part plays once unless you set it to `loop`:

```js live
const synth = new Tone.Synth().toDestination();
const part = new Tone.Part(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  [
    [0, "C4"],
    ["0:0:2", "C4"],
    ["0:1:2", "G4"],
  ],
).start(0);
part.loop = true;
part.loopEnd = "0:2";
Tone.getTransport().start();
```

### Changing events

Events can be added, removed or changed after the Part is created:

```javascript
part.add("1m", "E4");
part.remove("0:1:2", "G4");
// change the note at the beginning to a D
part.at(0, "D4");
```

## [Tone.Pattern](/docs/latest/pattern/)

Tone.Pattern steps through an array of values in one of the classic arpeggiator patterns: `"up"`, `"down"`, `"upDown"`, `"downUp"`, `"alternateUp"`, `"alternateDown"`, `"random"`, `"randomOnce"` or `"randomWalk"`:

```js live
const synth = new Tone.Synth().toDestination();
// C4, E4, G4, B4, G4, E4, and repeat
const arp = new Tone.Pattern(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  ["C4", "E4", "G4", "B4"],
  "upDown",
);
arp.interval = "8n";
arp.start(0);
Tone.getTransport().start();
```

## Shared attributes

All of these classes are built on [Tone.ToneEvent](/docs/latest/toneevent/), a single event that can also be used on its own, and share a few attributes for adding variation.

### `probability`

The chance, from 0 to 1, that each event actually fires. It's a quick way to make a pattern less predictable:

```js live
const synth = new Tone.MembraneSynth().toDestination();
const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease("C2", "16n", time);
}, "16n").start(0);
// only play half of the 16th notes
loop.probability = 0.5;
Tone.getTransport().start();
```

### `humanize`

Perfectly timed notes can sound mechanical. `humanize` nudges each event's `time` slightly earlier or later. Set it to `true` for a small amount, or to a time for the most it can move:

```js live
const synth = new Tone.Synth().toDestination();
const loop = new Tone.Loop((time) => {
  synth.triggerAttackRelease("C4", "32n", time);
}, "8n").start(0);
// drift by up to a 32nd note either way
loop.humanize = "32n";
Tone.getTransport().start();
```

### `playbackRate`

Speeds the events up or slows them down, without changing the Transport's tempo, so other events keep their timing:

```js live
const synth = new Tone.Synth().toDestination();
const seq = new Tone.Sequence(
  (time, note) => {
    synth.triggerAttackRelease(note, "16n", time);
  },
  ["C4", "E4", "G4", "C5"],
  "8n",
).start(0);
// play the sequence twice as fast
seq.playbackRate = 2;
Tone.getTransport().start();
```
