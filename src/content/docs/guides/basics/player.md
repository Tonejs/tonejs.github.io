---
title: "Player"
sidebar:
  order: 3
---

[Tone.Player](/docs/latest/player/) plays an audio file.

```javascript
const player = new Tone.Player("./sound.mp3").toDestination();
```

## Starting and stopping

`start` takes the time to start at, plus an optional offset into the file and duration to play for. `stop` stops it, and `seek` jumps to a different point in the file while it's playing:

```js live
const player = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/breakbeat.mp3",
).toDestination();
await Tone.loaded();
// start now, 1 second into the file, and play for 2 seconds
player.start(Tone.now(), 1, 2);
```

## Looping

Set `loop` to repeat the file, and optionally `loopStart` and `loopEnd` to loop just part of it:

```js live
const player = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/breakbeat.mp3",
).toDestination();
player.loop = true;
player.loopStart = 0.5;
player.loopEnd = 1;
await Tone.loaded();
player.start();
```

## Fading in and out

Starting or stopping a file in the middle of a sound can make a click. `fadeIn` and `fadeOut` smooth that out by ramping the volume up over the given time after each start, and down over the given time after each stop:

```js live
const player = new Tone.Player({
  url: "https://tonejs.github.io/audio/drum-samples/breakbeat.mp3",
  fadeIn: 0.5,
  fadeOut: 1,
}).toDestination();
await Tone.loaded();
player.start().stop("+3");
```

## Playback rate

`playbackRate` speeds the file up or slows it down. Like a tape or record, this changes the pitch too: a rate of 2 plays twice as fast and an octave higher, 0.5 half as fast and an octave lower. To change the speed without changing the pitch, use [Tone.GrainPlayer](/docs/latest/grainplayer/) instead. Set `reverse` to play the file backwards.

```js live
const player = new Tone.Player(
  "https://tonejs.github.io/audio/drum-samples/breakbeat.mp3",
).toDestination();
player.playbackRate = 0.5;
await Tone.loaded();
player.start();
```

## Players

[Tone.Players](/docs/latest/players/) holds a named set of players which share an output, which is handy for something like a drum kit. Get each one by name with `player(name)`:

```js live
const drums = new Tone.Players({
  kick: "https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3",
  snare: "https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3",
}).toDestination();
await Tone.loaded();
drums.player("kick").start();
drums.player("snare").start("+0.5");
```

## References

- See [Loading audio files](/guides/loading-buffers/) for more on loading.
