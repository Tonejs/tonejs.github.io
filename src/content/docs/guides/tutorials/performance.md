---
title: "Performance and best practices"
sidebar:
  order: 4
---

This article provides some resources and best practices for working with Web Audio and Tone.js

## Audio Node Performance

Audio failures result in pops, crackles, silence and other unwanted artifacts. Paul Adenot (the author of Firefox's Web Audio implementation) has [a great article](https://padenot.github.io/web-audio-perf/) on the CPU, memory usage and incurred latency of most of the Web Audio nodes. It can be a helpful resource for pinpointing performance bottlenecks. The most processor intensive nodes are the ConvolverNode (Tone.Convolver and Tone.Reverb) and PannerNode using HRTF (Tone.Panner3D). Other than the amount and types of nodes used, Web Audio does not currently offer much in the way of performance configuration and tuning.

## Disposing nodes

Dropping your reference to a Tone.js node doesn't free it: it stays connected in the audio graph, and many classes are also registered with the context or the Transport. When you're done with a node (for example when a component unmounts), call `dispose()` on it to disconnect it and release its resources. 

```javascript
synth.dispose();
```

## context.latencyHint

If you're using the Transport to schedule events, the amount of time in advance events are scheduled is adjustable. Scheduling events farther in advance is easier for the audio thread to process and may improve performance.

The `latencyHint` of Tone.js's AudioContext can be adjusted by instantiating a new context to replace Tone.js's default context. `latencyHint` can have a value of `"interactive"` (_default_, prioritizes low latency), `"playback"` (prioritizes sustained playback), or `"balanced"` (balances latency and performance). Or set it to the number of seconds of latency to request. 

```javascript
Tone.setContext(new Tone.Context({ latencyHint: "playback" }));
```

## context.lookAhead

By default a short lookAhead is used for scheduling everything in Tone.js. The native Web Audio's `context.currentTime` is summed with the value stored in `context.lookAhead` which defaults to `0.1 seconds`. This gives the scheduler time to schedule events before they are heard, at the expense of latency. For lower latency you can either set the lookAhead to a smaller value or 0, or use `Tone.immediate()`, which returns the current AudioContext time without the lookAhead. 

```javascript
Tone.getContext().lookAhead = 0.05;
```

## Scheduling in advance

As mentioned, it's best to schedule audio events as far in advance as possible. For this reason, it's good to invoke `Tone.getTransport().start` a little bit in the future. `Tone.getTransport().start("+0.1")` will start the Transport 100 milliseconds in the future which is not very perceptible, but can help avoid scheduling errors.

Scheduling further in advance works for triggering playback of sources and synths as well. For example, if you are hearing performance issues when triggering a synth from a `mousedown` callback, try scheduling the sound a little in advance. Values under 0.1 seconds won't be very noticeable, but could help reduce pops. 

```javascript
element.addEventListener("mousedown", () => {
	// instead of scheduling the synth immediately,
	// try scheduling 50ms in the future to avoid performance-related pops
	synth.triggerAttack("C4", "+0.05");
});
```

## Syncing Visuals

If you're using the Transport, it is important that you **do not** make draw calls or DOM manipulations inside of the callback provided by the Transport or any of the event classes (ToneEvent, Part, Sequence, Pattern, Loop). The Transport's callbacks are driven by a timer running in a Web Worker, so they are not synced to the animation frame. Also, Transport callbacks can occur many more times a second than animation frame callbacks and can be invoked in a background tab. Additionally, Transport events are invoked in advance of when the event is heard (by the `lookAhead`), so visuals triggered inside of one of these callbacks might not align with the audio event they are triggered with. 

A solution to synchronizing visuals and audio is to use [Draw](/docs/latest/getdraw/). You can schedule a draw callback from within a Transport callback using the AudioContext time that the event is supposed to occur. Draw will invoke the callback on the nearest animation frame to the given time. 

```javascript
const loop = new Tone.Loop((time) => {
	// instead of scheduling visuals inside of here
	// schedule a deferred callback with Draw
	Tone.getDraw().schedule(() => {
		// this callback is invoked from a requestAnimationFrame
		// and will be invoked close to AudioContext time
	}, time); // use AudioContext time of the event
}, "8n");
```


## Loading and Decoding AudioBuffers

On memory constrained devices like mobile phones, loading many and/or large audio files can cause the browser to crash during the buffer decoding.
