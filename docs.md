---
title : Tone.js Docs
layout : index
permalink: /docs/
---

# Tone.js Docs

The class file begins with short description of that class followed by a list of the class' members and methods.

## Constructor

The constructor function shows the parameter names, types and a short description for each parameter. All class constructors in Tone.js accept an object in the constructor. The defaults values for that options object are shown below the constructor.

## Members

Next are the class members. If the class member has a "<span class="orange">&#8767;</span>" before the name, it is a signal rate property. [Signals](https://github.com/Tonejs/Tone.js/wiki/Signals) are properties which can be scheduled to change and smoothly ramp between values at audio-rate.

Some members have custom types like [Time]({{site.data.version}}/Type#time) or [Frequency]({{site.data.version}}/Type#frequency). Follow the link to read more about them.

## Methods

Methods are functions which belong to the class. Each has a function signature which give the parameters' names, types and short descriptions.

Both the members and methods have a link to the source code in the bottom right side of their descriptions.

<script>
	// check if there's a hash, to forward from previous doc versions
	var hash = window.location.hash
	if (hash !== ""){
		// test if it's a class and property
		var match = hash.match(/#(\w+)\.(\w+)/)
		if (match){
			window.location = match[1] + '#' + match[2].toLowerCase()
		} else {
			//just a class
			window.location = window.location.pathname + hash.substr(1)
		}
	}
</script>
