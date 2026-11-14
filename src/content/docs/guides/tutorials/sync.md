---
title: "Syncing to the Transport"
sidebar:
  order: 3
---

By default, the times you pass to `start`, `stop` and `triggerAttackRelease` are in AudioContext time. Calling `sync()` on a source, instrument or effect makes those times positions on the [Transport](/guides/basics/transport/)'s timeline instead, so it plays along with the Transport: it plays when the Transport reaches the scheduled position, and pauses, stops, loops and seeks along with it.

## Players and sources

A synced [Player](/guides/basics/player/) is started at a position on the timeline. If the Transport starts partway through, the player starts from the matching point in the file:

```js live
const player = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/breakbeat.mp3",
).toDestination();
await Tone.loaded();
// play the file from the beginning of the Transport's timeline
player.sync().start(0);
// start the Transport 1 second into its timeline,
// so the player starts 1 second into the file
Tone.getTransport().start(Tone.now(), 1);
```

The same goes for any source, like an [oscillator](/guides/basics/oscillators/). Here an oscillator plays for the first 0.3 seconds of a 1 second loop:

```js live
const osc = new Tone.Oscillator().toDestination();
osc.sync().start(0).stop(0.3);
const transport = Tone.getTransport();
transport.loop = true;
transport.loopEnd = 1;
transport.start();
```

## Instruments

A synced [instrument](/guides/basics/instruments/) schedules its notes on the Transport's timeline, so they play when the Transport reaches them:

```js live
const synth = new Tone.FMSynth().toDestination();
synth.sync();
// play 3 notes when the Transport starts
synth.triggerAttackRelease("C4", "8n", 0);
synth.triggerAttackRelease("E4", "8n", "8n");
synth.triggerAttackRelease("G4", "8n", "4n");
Tone.getTransport().start();
```

## Effects

The [effects that need to be started](/guides/basics/effects/#starting-and-stopping-effects) (AutoFilter, AutoPanner, Chorus and Tremolo) can be synced too. Their start and stop times become positions on the timeline, and a tempo-relative rate like `"4n"` follows the Transport's tempo:

```js live
const filter = new Tone.AutoFilter("4n").toDestination();
filter.sync().start(0);
new Tone.Oscillator("C2", "sawtooth").connect(filter).start();
const transport = Tone.getTransport();
transport.start();
// the filter sweeps speed up along with the tempo
transport.bpm.rampTo(240, 8);
```

## Signals

A [signal](/guides/basics/signals/) can follow the tempo with `Tone.getTransport().syncSignal(signal)`. The ratio between the signal's value and the tempo is kept, so when the tempo doubles, so does the value. Oscillators also have a `syncFrequency()` shortcut that syncs their `frequency` signal:

```js live
const osc = new Tone.Oscillator(220).toDestination().start();
// shorthand for Tone.getTransport().syncSignal(osc.frequency)
osc.syncFrequency();
// the oscillator slows down with the tempo
Tone.getTransport().bpm.rampTo(60, 4);
```

## Unsyncing

`unsync()` (or `Tone.getTransport().unsyncSignal(signal)` and `unsyncFrequency()`) goes back to AudioContext time. Unsyncing a source also stops it and clears anything it had scheduled on the Transport.
