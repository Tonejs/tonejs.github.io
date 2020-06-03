---
layout: default
title: Tone.js
---

<link rel="stylesheet" type="text/css" href="assets/css/index.css">

<div id="basicLinks">
	<span class="introSegment">
		<a href="https://github.com/Tonejs/Tone.js">Github</a>
	</span>
	<span class="introSegment">
		<a href="https://tonejs.github.io/docs/">API</a>
	</span>
	<span class="introSegment">
		<a href="https://tonejs.github.io/examples/">Examples</a>
	</span>
	<span class="introSegment">
		<a href="https://tonejs.github.io/demos">Demos</a>
	</span>
</div>

# Tone.js

Tone.js is a framework for creating interactive music in the browser. It provides advanced scheduling capabilities, synths and effects, and intuitive musical abstractions built on top of the [Web Audio API](https://webaudio.github.io/web-audio-api/). 


# Hello Tone

<script async src="//jsfiddle.net/yotammann/uLkcsrxn/embed/js,result/"></script>

[Tone.Synth](https://tonejs.github.io/docs/#Synth) is a basic synthesizer with a single envelope and single [oscillator](https://tonejs.github.io/docs/#OmniOscillator).

`triggerAttackRelease` is a combination of two methods: `triggerAttack` when the amplitude is rising (for example from a 'key down' or 'note on' event), and `triggerRelease` is when the amplitude is going back to 0 ('key up' / 'note off').

<script async src="//jsfiddle.net/yotammann/spzgucvw/embed/js,result/"></script>

### triggerAttackRelease

The first argument to `triggerAttackRelease` is the frequency which can either be a number (like `440`) or as "pitch-octave" notation (like `"D#2"`). 

The second argument is the duration that the note is held. This value can either be in seconds, or as a [tempo-relative value](https://github.com/Tonejs/Tone.js/wiki/Time).

The third (optional) argument is when the note should be scheduled to play. With no argument, the note plays immediately, but it can also be scheduled to play anytime in the future. 

# Time

Web Audio has advanced, sample accurate scheduling capabilities. The AudioContext time, which is the reference clock that Web Audio uses to schedule events, starts at 0 when the page (or iframe) loads and counts up in seconds. 

<script async src="//jsfiddle.net/yotammann/uekh0v5f/embed/js,result/"></script>

The third argument of `triggerAttackRelease` is _when_ along the AudioContext time the note should play. It can be used to schedule events in the future.

<script async src="//jsfiddle.net/yotammann/zxsthhmq/embed/js,result/"></script>

### Tempo-Relative

Tone.js abstracts away the AudioContext time. Instead of defining all values in seconds, any method which takes time as an argument can accept a number or a string. For example `"4n"` is a quarter-note, `"8t"` is an eighth-note triplet, and `"1m"` is one measure. These values can even be composed into expressions.

Read more about [Time encodings](https://github.com/Tonejs/Tone.js/wiki/Time).

<script async src="//jsfiddle.net/yotammann/y9jewrdf/embed/js,result/"></script>

# Scheduling

Instead of scheduling relative when the page load (AudioContext time = 0) like the examples above, Tone.js provides the [Tone.Transport](https://tonejs.github.io/docs/#Transport) which allows events to be scheduled along a seekable, restartable and editable timeline.

<script async src="//jsfiddle.net/yotammann/sw8wy7rb/embed/js,result/"></script>

One-time and repeated events can be scheduled relative to the Transport's position (instead of just the AudioContext time) using `schedule` and `scheduleRepeat`. The Transport will invoke the scheduled callback and return the precise AudioContext time of the scheduled event. 

Since Javascript callbacks are **not** precisely timed, the sample-accurate time of the event is passed into the callback function. **Use this time value to schedule the events**.

Unlike the AudioContext, the Transport can be looped, stopped and restarted.

<script async src="//jsfiddle.net/yotammann/4z1nkdyb/embed/js,result/"></script>

### Tempo

The Transport is the master timekeeper, allowing for application-wide synchronization of sources, signals and events along a shared timeline. Time expressions (like `"4n"` and `"2:0"`) are evaluated against the Transport's BPM which can be set like this: `Tone.Transport.bpm.value = 120`.

<script async src="//jsfiddle.net/yotammann/1xrk4eto/embed/js,result/"></script>

### Loops

Tone.js provides even higher-level abstractions for scheduling events. [Tone.Loop](https://tonejs.github.io/docs/#Loop) is a simple way to create a looped callback that can be scheduled to start, stop and repeat along the Tone.Transport.

<script async src="//jsfiddle.net/yotammann/cve19w8r/embed/js,result/"></script>

[Read about Tone.js' Event classes](https://github.com/Tonejs/Tone.js/wiki/Events).

### Parts

Tone.Part allows you to schedule an array of events which can be started, stopped, and looped along the Transport.

<script async src="//jsfiddle.net/yotammann/w39e6450/embed/js,result/"></script>

All of the Tone.Event classes also allow you to adjust the playbackRate separate from the Transport's bpm. This can create some interesting [phasing](https://tonejs.github.io/examples/pianoPhase.html). 

# Instruments

Pass in JSON settings for any of the Tone.js instruments, effects and components to set their values. The synths and effects are capable of a diverse range of sounds. 

<script async src="//jsfiddle.net/yotammann/47cnLxn6/embed/js,result/"></script>

All instruments are monophonic (one voice) but can be made polyphonic when the constructor is passed in as the second argument to [Tone.PolySynth](https://tonejs.github.io/docs/#PolySynth). Tone.PolySynth creates multiple instances of an instrument and manages the voice allocations.

<script async src="//jsfiddle.net/yotammann/xthqjv1w/embed/js,result/"></script>

[Read more about Instruments](https://github.com/Tonejs/Tone.js/wiki/Instruments).

# Effects

In the above examples, the synthesizer was always connected directly to the [master output](https://tonejs.github.io/docs/#Master), but the output of the synth could also be routed through one (or more) effects before going to the speakers. 

<script async src="//jsfiddle.net/yotammann/o6cfwp2k/embed/js,result/"></script>

[Read more about Effects](https://github.com/Tonejs/Tone.js/wiki/Effects).

# Sources

Tone has a few basic audio sources like [Tone.Oscillator](https://tonejs.github.io/docs/#Oscillator) which has sine, square, triangle, and sawtooth waveforms, a buffer player ([Tone.Player](https://tonejs.github.io/docs/#Player)), a noise generator ([Tone.Noise](https://tonejs.github.io/docs/#Noise)), a few additional oscillator types ([pwm](https://tonejs.github.io/docs/#PWMOscillator), [pulse](https://tonejs.github.io/docs/#PulseOscillator), [fat](https://tonejs.github.io/docs/#FatOscillator), [fm](https://tonejs.github.io/docs/#FMOscillator)) and [external audio input](https://tonejs.github.io/docs/#Microphone) (when [WebRTC is supported](http://caniuse.com/#feat=stream)).

<script async src="//jsfiddle.net/yotammann/vt4d1aob/embed/js,result/"></script>

[Read more about Sources](https://github.com/Tonejs/Tone.js/wiki/Sources).

# Signals

Like the underlying Web Audio API, Tone.js is built with audio-rate signal control over nearly everything. This is a powerful feature which allows for sample-accurate synchronization and scheduling of parameters. 

<script async src="//jsfiddle.net/yotammann/x3kehc9x/embed/js,result/"></script>

[Read more about Signals](https://github.com/Tonejs/Tone.js/wiki/Signals).

# Additional Resources

More resources can be found on the [github page](https://github.com/Tonejs/Tone.js), [forum](https://groups.google.com/forum/#!forum/tonejs), [wiki](https://github.com/Tonejs/Tone.js/wiki), and [demos](https://tonejs.github.io/demos)



<script type="text/javascript">

	// jsfiddle creates too many AudioContexts, 
	// need to insure that the offscreen fiddles are closed
	// to remove the unused AudioContexts

	function isOffScreen (el) {
		var rect = el.getBoundingClientRect();
		return ((rect.left + rect.width) < 0 
			|| (rect.top + rect.height) < 0
			|| (rect.left > window.innerWidth || rect.top > window.innerHeight))
	}

	function reloadIframe(iframe){
		var url = iframe.src
		iframe.src = 'about:blank'
		setTimeout(function() {
			iframe.src = url
		}, 10)
	}

	//test the active elements to see if they are out of the viewport
	setInterval(function(){
		document.querySelectorAll('.active-iframe').forEach(function(el){
			if (isOffScreen(el)){
				reloadIframe(el)
				el.classList.remove('active-iframe')
			}
		})
	}, 1000)

	window.addEventListener('message', function(e){
		// if the results tab was selected
		var resultsTab = e.data[0] === 'resultsFrame'
		var slug = e.data[1].slug
		// get the iframe element using the slug
		document.querySelectorAll('iframe').forEach(function(iframe){
			if (iframe.src.indexOf(slug) !== -1){
				// mark the iframe as active if it's on the results tab
				if (resultsTab){
					iframe.classList.add('active-iframe')
				}
			}
		})
	})
</script>