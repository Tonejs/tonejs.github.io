---
title: "Loading audio files"
---

Tone.js classes that play audio files, like [Player](/docs/latest/player/) and [Sampler](/docs/latest/sampler/) take a URL and start loading it right away. Loading is asynchronous: the file has to be downloaded and decoded before it can be played.

Loading doesn't need a user gesture, so you can load everything as soon as the page opens and [start playing audio](/guides/starting-audio/) after a user clicks.

## Tone.loaded()

The easiest way to wait for all the buffers in your app to load is with `Tone.loaded()`. `Tone.loaded()` returns a Promise which resolves once every file that has been requested so far has finished loading:

```js live
const player = new Tone.Player(
  "https://tonejs.github.io/audio/berklee/gong_1.mp3",
).toDestination();
await Tone.loaded();
player.start();
```

## Individual Callbacks

To know when one particular file is ready, pass an `onload` callback. It's the second argument of [Player](/docs/latest/player/), or the `onload` option:

```js live
const player = new Tone.Player({
  url: "https://tonejs.github.io/audio/berklee/gong_1.mp3",
  onload: () => player.start(),
  onerror: (error) => console.error(error),
}).toDestination();
```

## Multiple files

[Sampler](/docs/latest/sampler/) maps files to notes and repitches them to fill in the notes in between. `baseUrl` is prepended to each file name:

```js live
const piano = new Tone.Sampler({
  urls: { A1: "A1.mp3", A2: "A2.mp3" },
  baseUrl: "https://tonejs.github.io/audio/casio/",
}).toDestination();
await Tone.loaded();
piano.triggerAttackRelease(["C2", "E2", "G2"], 1);
```

## ToneAudioBuffer

[ToneAudioBuffer](/docs/latest/toneaudiobuffer/) wraps the raw loaded audio. You can use it to share a buffer between several players, or to read an audio file's samples:

```js live
const buffer = await Tone.ToneAudioBuffer.fromUrl(
  "https://tonejs.github.io/audio/berklee/gong_1.mp3",
);
console.log(
  `${buffer.duration.toFixed(2)}s, ${buffer.numberOfChannels} channels`,
);
const player = new Tone.Player(buffer).toDestination().start();
```

## Large files

Every decoded file is held in memory, uncompressed. On phones in particular, loading a lot of long files can use up the memory available to the page. See [Performance](/guides/tutorials/performance/#loading-and-decoding-audiobuffers) for tips.
