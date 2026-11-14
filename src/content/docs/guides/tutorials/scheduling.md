---
title: "AudioContext time vs. Transport time"
sidebar:
  order: 2
---

Tone.js has two clocks: the AudioContext's time, which every sound is ultimately scheduled with, and the [Transport](/guides/basics/transport/)'s time, a musical timeline built on top of it. This page describes how they relate.

## AudioContext time

The AudioContext's `currentTime` starts at 0 when the AudioContext is created and counts up in seconds while it's running. It never stops, jumps or goes backwards. Sounds are scheduled at positions on this clock.

By the time anything happens, the clock has already been counting for a while, so times are usually relative to the current time, `Tone.now()`. For example, to play a sound for two seconds when a button is clicked:

```javascript
const sine = new Tone.Oscillator(440, "sine").toDestination();

document.querySelector("button").addEventListener("click", async () => {
  // start the AudioContext, which needs a click because of the autoplay policy
  await Tone.start();
  const now = Tone.now();
  sine.start(now);
  sine.stop(now + 2);
});
```

This works well for a single sound. But say we scheduled a whole song this way when the button was clicked. To pause it, jump ahead to a particular moment, or go back to the beginning, we'd have to cancel and reschedule every sound, because the AudioContext time can't be paused or moved.

## Transport time

The Transport is a second clock that can. It's a timeline that you can start, stop, pause, loop and seek, and whose tempo can change, while everything scheduled on it stays in sync. Positions on it are called [TransportTime](/docs/latest/transporttime/), and they can be written in seconds or in musical values like `"1m"` or `"4n"`.

The [event classes](/guides/basics/events/) like Tone.Loop are scheduled with TransportTime. This loop plays a short tone every 2 seconds, starting at the beginning of the Transport's timeline:

```js
const sine = new Tone.Oscillator(440, "sine").toDestination();
const loop = new Tone.Loop((time) => {
  sine.start(time);
  sine.stop(time + 0.5);
}, 2);
loop.start(0);
Tone.getTransport().start();
```

Nothing plays until the Transport is started, because the loop is waiting for the Transport to reach 0. When it does, the callback is passed `time`, which is the **AudioContext** time of the event. Under the hood all Web Audio scheduling uses the AudioContext's clock, so that's the time to pass to `start` and `stop`.

The two clocks meet at `Tone.getTransport().start()`. Its first argument is the AudioContext time to start at (now, if you leave it out), and the optional second argument is the TransportTime to start from. The event classes' `start` methods are the other way around: they take a TransportTime.

## Both clocks at once

This example starts, stops and restarts the Transport, with a loop and a single event scheduled on it. Each callback logs its time on both clocks, in seconds since the code ran:

```js
const transport = Tone.getTransport();
const now = Tone.now();
const log = (name, time) =>
  console.log(
    `${name}: context ${(time - now).toFixed(1)}s, transport ${transport.getSecondsAtTime(time).toFixed(1)}s`,
  );

// a loop every second, from 0 to 2.5 on the Transport's timeline
new Tone.Loop((time) => log("loop", time), 1).start(0).stop(2.5);
// a single event at 1.5 on the Transport's timeline
new Tone.ToneEvent((time) => log("event", time)).start(1.5);

// start the Transport after 1 second, stop it, and start it again
transport.start(now + 1).stop(now + 3.5).start(now + 4.5);
```

Here's what that looks like on the two clocks:

<figure class="svg">
<svg class="timeline" viewBox="0 0 660 215" role="img" aria-label="The Transport timeline runs from 0 to 2.5 between AudioContext times 1 and 3.5, then from 0 again starting at AudioContext time 4.5. Loop callbacks fire at Transport times 0, 1 and 2, and the event at 1.5, each time the Transport plays.">
  <g class="legend" transform="translate(110 16)">
    <circle class="loop" cx="0" cy="0" r="4.5"/><text x="10" y="4">loop</text>
    <rect class="event" x="60" y="-4.5" width="9" height="9"/><text x="76" y="4">event</text>
  </g>
  <text class="label" x="0" y="75">Transport</text>
  <text class="label" x="0" y="155">AudioContext</text>
  <!-- guides from each callback down to the AudioContext time -->
  <g class="guide">
    <line x1="180" y1="70" x2="180" y2="150"/><line x1="250" y1="70" x2="250" y2="150"/>
    <line x1="285" y1="70" x2="285" y2="150"/><line x1="320" y1="70" x2="320" y2="150"/>
    <line x1="425" y1="70" x2="425" y2="150"/><line x1="495" y1="70" x2="495" y2="150"/>
    <line x1="530" y1="70" x2="530" y2="150"/><line x1="565" y1="70" x2="565" y2="150"/>
  </g>
  <!-- the Transport's timeline while it's playing -->
  <line class="track" x1="180" y1="70" x2="355" y2="70"/>
  <line class="track" x1="425" y1="70" x2="650" y2="70"/>
  <g class="ticks" text-anchor="middle">
    <text x="180" y="56">0</text><text x="250" y="56">1</text><text x="320" y="56">2</text>
    <text x="425" y="56">0</text><text x="495" y="56">1</text><text x="565" y="56">2</text><text x="635" y="56">3</text>
  </g>
  <g>
    <circle class="loop" cx="180" cy="70" r="4.5"/><circle class="loop" cx="250" cy="70" r="4.5"/><circle class="loop" cx="320" cy="70" r="4.5"/>
    <circle class="loop" cx="425" cy="70" r="4.5"/><circle class="loop" cx="495" cy="70" r="4.5"/><circle class="loop" cx="565" cy="70" r="4.5"/>
    <rect class="event" x="280.5" y="65.5" width="9" height="9"/><rect class="event" x="525.5" y="65.5" width="9" height="9"/>
  </g>
  <!-- the AudioContext's clock -->
  <line class="axis" x1="110" y1="150" x2="650" y2="150"/>
  <g class="ticks" text-anchor="middle">
    <text x="110" y="170">0</text><text x="180" y="170">1</text><text x="250" y="170">2</text><text x="320" y="170">3</text>
    <text x="390" y="170">4</text><text x="460" y="170">5</text><text x="530" y="170">6</text><text x="600" y="170">7</text>
  </g>
  <g class="commands" text-anchor="middle">
    <text x="180" y="200">start</text><text x="355" y="200">stop</text><text x="425" y="200">start</text>
  </g>
</svg>
</figure>

While the Transport is stopped, its clock doesn't move. Stopping also returns it to 0, so when it's started again, the loop and the event play again from the beginning, at new AudioContext times. Pausing (`transport.pause()`) would keep its position instead.

## Why callbacks are passed a time

Callbacks don't run exactly at the time they're scheduled for. JavaScript timers like `setTimeout` are only roughly on time, and can be delayed by whatever else the page is doing, which isn't precise enough for music. The AudioContext, on the other hand, can start and stop sounds at an exact time, down to the sample.

So Tone.js checks for upcoming events every 50 milliseconds or so, and runs each callback a little _ahead_ of its time, passing in the exact AudioContext time it's for. The callback then schedules its sounds at that time, and the AudioContext plays them precisely when they're due. How far ahead is called the [`lookAhead`](/guides/tutorials/performance/#contextlookahead), and it's 0.1 seconds by default:

<figure class="svg">
<svg class="timeline" viewBox="0 0 660 200" role="img" aria-label="Tone.js checks for events every 50 milliseconds. The check at 1.9 seconds finds the event at 2 seconds, runs its callback with time equal to 2, and the AudioContext plays the note at exactly 2 seconds.">
  <text class="label" x="0" y="65">JavaScript</text>
  <text class="label" x="0" y="145">AudioContext</text>
  <!-- the timer's checks, every 50ms -->
  <line class="axis" x1="110" y1="60" x2="650" y2="60"/>
  <g class="check">
    <line x1="160" y1="52" x2="160" y2="68"/><line x1="210" y1="52" x2="210" y2="68"/>
    <line x1="260" y1="52" x2="260" y2="68"/><line x1="360" y1="52" x2="360" y2="68"/>
    <line x1="410" y1="52" x2="410" y2="68"/><line x1="460" y1="52" x2="460" y2="68"/>
    <line x1="510" y1="52" x2="510" y2="68"/><line x1="560" y1="52" x2="560" y2="68"/>
    <line x1="610" y1="52" x2="610" y2="68"/>
  </g>
  <text class="note" x="160" y="38" text-anchor="middle">checks</text>
  <circle class="loop" cx="310" cy="60" r="5"/>
  <text class="note" x="310" y="38" text-anchor="middle">callback(time = 2)</text>
  <!-- the callback schedules the note on the AudioContext -->
  <path class="schedule" d="M 314 66 C 340 100, 380 110, 404 133"/>
  <path class="schedule-head" d="M 398 131 L 409 139 L 407 126 Z"/>
  <line class="axis" x1="110" y1="140" x2="650" y2="140"/>
  <circle class="event-dot" cx="410" cy="140" r="5"/>
  <text class="note" x="425" y="125">note plays</text>
  <g class="ticks" text-anchor="middle">
    <text x="210" y="160">1.8</text><text x="310" y="160">1.9</text>
    <text x="410" y="160">2.0</text><text x="510" y="160">2.1</text><text x="610" y="160">2.2</text>
  </g>
  <!-- the lookAhead -->
  <line class="bracket" x1="310" y1="174" x2="410" y2="174"/>
  <line class="bracket" x1="310" y1="169" x2="310" y2="179"/><line class="bracket" x1="410" y1="169" x2="410" y2="179"/>
  <text class="note" x="360" y="195" text-anchor="middle">lookAhead</text>
</svg>
</figure>

That's why it's so important to pass `time` along to whatever you trigger in a callback (see [Callback Timing](/guides/basics/transport/#callback-timing)). If you used `Tone.now()` instead, or nothing, the sound would play when the callback happened to run, up to 0.1 seconds early, and the timing would wobble.

## References

[Chris Wilson's great explanation of Web Audio scheduling.](https://web.dev/articles/audio-scheduling)
