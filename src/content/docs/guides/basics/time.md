---
title: "Time"
sidebar:
  order: 9
---

All methods which take time as an argument accept a String or Number. Time encoded as a Number is assumed to be seconds and returned. Time encoded as a String can take various forms in order to synchronize it to the [Transport](/guides/basics/transport/). 


## Examples:

### Numbers

A number will be evaluated as the time (in seconds). 

* `1.2` = 1.2 seconds
* `"3"` = 3 seconds
* `"3s"` = 3 seconds

### Notation

Describes time in BPM and time signature relative values. 

* `"4n"` = quarter note
* `"8t"` = eighth note triplet
* `"2m"` = two measures
* `"8n."` = dotted-eighth note
* `"4m"` = four measures

### Transport Time

Tempo and time signature relative time in the form BARS:QUARTERS:SIXTEENTHS.

 (These are zero-indexed, so `"0:0:0"` is the very beginning.)

* `"32:0:0"` = the start of measure 32 (i.e. after 32 full measures). 
* `"4:3:2"` = 4 bars + 3 quarter notes + 2 sixteenth notes. 
* `"1:2"` =  1 bar + 2 quarter notes (sixteenth notes can be omitted)

### Frequency

Seconds can also be described in Hz. 

* `"1hz"` = 1 second
* `"5hz"` = 0.2 seconds

### Ticks

A time relative to the Transport's PPQ (Pulses Per Quarter note, 192 by default). The number before the 'i' needs to be an integer.

* `"1i"` = 1 tick
* `"192i"` = 1 quarter note at 192 PPQ

### Samples

* `"256samples"` = 256 samples (relative to the AudioContext's sample rate)

### Now-Relative 

Prefix any of the above with "+" and it will be interpreted as "the current time plus whatever expression follows"

* `"+1m"` = 1 measure from now
* `"+0.5"` = half a second from now

### No Argument

For methods which accept time, no argument (`undefined`) will be interpreted as "now" (i.e. `Tone.now()`, which is the AudioContext's `currentTime` plus the [lookAhead](/guides/tutorials/performance/#contextlookahead)). 

For example, Tone.MonoSynth's `triggerAttack` method will accept a time as the second argument, or if a value is omitted, it will default to "now".

```javascript
synth.triggerAttack("C4"); // now
synth.triggerRelease("+4n"); // a quarter-note from now
```

## Quantization

Using the `@` symbol, a Time can be quantized relative to the Transport's grid. 

* `"@1m"` = If the Transport is started, this will return the time of the next measure. If the Transport is stopped, it returns `0`.
* `"@4n"` = the next quarter note

You can also quantize a value with the `quantize` method:

```javascript
// round to the nearest 8th note (at 120bpm)
Tone.Time(1.1).quantize("8n"); // returns 1
```

## Conversion

To convert between seconds and BPM relative values, use [Tone.Time](/docs/latest/time/)

```javascript
Tone.Time("4n").toSeconds(); // 0.5 at 120bpm
Tone.Time(2).toNotation(); // "1m" at 120bpm
Tone.Time("1m").toBarsBeatsSixteenths(); // "1:0:0"
```

Frequency values can be converted with [Tone.Frequency](/docs/latest/frequency/):

```javascript
Tone.Frequency("A4").toFrequency(); // 440
Tone.Frequency(60, "midi").toNote(); // "C4"
```
