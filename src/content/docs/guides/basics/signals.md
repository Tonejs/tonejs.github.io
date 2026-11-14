---
title: "Signals"
sidebar:
  order: 7
---

[Tone.Signal](/docs/latest/signal/) plays an important role in Tone.js by allowing audio-rate control over many attributes. It is similar to the Web Audio API's native [AudioParam](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam) and allows sample-accurate control synchronization of a node's attributes.

## Setting values

Unlike other attributes, to get or set the value of a Tone.Signal, you must access it through `.value`.

For example, the frequency attribute of Tone.Oscillator is a Tone.Signal:

```javascript
oscillator.frequency.value = 100; // sets the value immediately
```

A Tone.Signal isn't an ordinary number, but an audio-rate signal that's capable of sample-accurate automation.

## Changing values over time

Setting `.value` changes a signal instantly, which can sometimes be heard as an abrupt change or even a click. Signals can instead _schedule_ changes: smooth ramps, or jumps at an exact time.

### Ramping from now

`rampTo(value, rampTime)` glides from the current value to a new one over `rampTime`.

```js live
const osc = new Tone.Oscillator(220).toDestination().start();
// glide up an octave over 2 seconds
osc.frequency.rampTo(440, 2);
osc.stop("+3");
```

Like every method that ends in `To`, it starts from the current signal value and clears anything that was scheduled after it, so you can call it even in the middle of another ramp. All of them take an optional start time as their last argument:

```javascript
// ramp the volume to -12db over a quarter note, starting one measure from now
player.volume.rampTo(-12, "4n", "+1m");
```

### Linear or exponential

A ramp can follow a straight line (`linearRampTo`) or a curve (`exponentialRampTo`). This plots both, sweeping from 110 to 880 over one second:

```js live
return Tone.Offline(
  () => {
    const merge = new Tone.Merge().toDestination();
    // top: linear
    new Tone.Signal(110).connect(merge, 0, 0).linearRampTo(880, 1);
    // bottom: exponential
    new Tone.Signal(110).connect(merge, 0, 1).exponentialRampTo(880, 1);
  },
  1,
  2,
);
```

They arrive at the same place, but sound different, because we hear pitch and loudness on a logarithmic curve. Going from 110 to 220 Hz is an octave, and so is going from 440 to 880 Hz. The linear ramp rushes through the low octaves and then slows down through the high ones, while the exponential one takes the same time for each octave, which sounds even:

```js live
const osc = new Tone.Oscillator(110).toDestination().start();
osc.frequency.linearRampTo(880, 2);
// then the same sweep, exponentially
osc.frequency.setValueAtTime(110, "+2.5");
osc.frequency.exponentialRampTo(880, 2, "+2.5");
osc.stop("+5");
```

### Target Ramps

`setTargetAtTime(value, startTime, timeConstant)` heads toward a value quickly at first, then slows as it gets closer, like a ball rolling to a stop:

```js live
return Tone.Offline(
  () => {
    const signal = new Tone.Signal(1).toDestination();
    // head towards 0, starting at 0.1 seconds
    signal.setTargetAtTime(0, 0.1, 0.1);
  },
  1,
  1,
);
```

The time constant sets the speed. Two things make it useful:

- It sounds natural. Many sounds in the real world fade away like this, so it's a good shape for a release.
- It doesn't need to know where it's going in advance. If a slider is sending a new value many times a second, set a new target each time and the signal smoothly follows it, without jumps or a ramp that has to finish first.

`targetRampTo(value, rampTime)` is the easier version: it picks the time constant so the value arrives in about `rampTime`.

### Scheduling at exact times

The methods that end in `AtTime` place changes at exact times on the timeline. Use them when you know when things should happen: in a Transport callback using its `time`, or to build up a shape from several steps. Each ramp goes _from_ the previous scheduled value, so start with `setValueAtTime`:

```js live
return Tone.Offline(
  () => {
    const signal = new Tone.Signal(0).toDestination();
    signal.setValueAtTime(0, 0);
    // rise to 1 by 0.1 seconds
    signal.linearRampToValueAtTime(1, 0.1);
    // fall to 0.3 by 0.4 seconds
    signal.exponentialRampToValueAtTime(0.3, 0.4);
    // hold there until 0.7 seconds
    signal.setValueAtTime(0.3, 0.7);
    // and fade out by 0.9 seconds
    signal.linearRampToValueAtTime(0, 0.9);
  },
  1,
  1,
);
```

That shape is an envelope: the [Envelope](/guides/basics/envelopes/) classes build exactly this kind of automation for you.

`setValueCurveAtTime(values, startTime, duration)` draws an arbitrary shape from an array of values, spread evenly over the duration:

```js live
return Tone.Offline(
  () => {
    const signal = new Tone.Signal(0).toDestination();
    signal.setValueCurveAtTime([0, 1, 0.2, 0.8, 0], 0, 1);
  },
  1,
  1,
);
```

### Canceling

`cancelScheduledValues(time)` removes everything scheduled from `time` on. Canceling in the middle of a ramp can make the value jump, so `cancelAndHoldAtTime(time)` also keeps the value where it was at that moment. The `To` methods already do this for you.

## Connecting signals

Signals can also be controlled by other signals. Connecting a signal or [LFO](/docs/latest/lfo/) to a parameter makes the incoming signal control the value of that parameter.

```javascript
const lfo = new Tone.LFO("4n", 400, 4000).start();
lfo.connect(filter.frequency);
```
