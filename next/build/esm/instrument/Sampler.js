import { __decorate } from "tslib";
import { ToneAudioBuffers } from "../core/context/ToneAudioBuffers.js";
import { ftomf, intervalToFrequencyRatio } from "../core/type/Conversions.js";
import { FrequencyClass } from "../core/type/Frequency.js";
import { assert, assertRange } from "../core/util/Debug.js";
import { timeRange } from "../core/util/Decorator.js";
import { defaultArg, optionsFromArguments } from "../core/util/Defaults.js";
import { noOp } from "../core/util/Interface.js";
import { isArray, isNote, isNumber } from "../core/util/TypeCheck.js";
import { Instrument } from "../instrument/Instrument.js";
import { ToneBufferSource, } from "../source/buffer/ToneBufferSource.js";
/**
 * Pass in an object which maps the note's pitch or midi value to the url,
 * then you can trigger the attack and release of that note like other instruments.
 * By automatically repitching the samples, it is possible to play pitches which
 * were not explicitly included which can save loading time.
 *
 * For sample or buffer playback where repitching is not necessary,
 * use {@link Player}.
 * @example
 * const sampler = new Tone.Sampler({
 * 	urls: {
 * 		A1: "A1.mp3",
 * 		A2: "A2.mp3",
 * 	},
 * 	baseUrl: "https://tonejs.github.io/audio/casio/",
 * 	onload: () => {
 * 		sampler.triggerAttackRelease(["C1", "E1", "G1", "B1"], 0.5);
 * 	}
 * }).toDestination();
 * @category Instrument
 */
export class Sampler extends Instrument {
    constructor() {
        const options = optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
        super(options);
        this.name = "Sampler";
        /**
         * The object of all currently playing BufferSources
         */
        this._activeSources = new Map();
        /**
         * The list of all provided midi notes
         */
        this._providedMidiNotes = [];
        const urlMap = {};
        Object.keys(options.urls).forEach((note) => {
            const noteNumber = parseInt(note, 10);
            assert(isNote(note) || (isNumber(noteNumber) && isFinite(noteNumber)), `url key is neither a note or midi pitch: ${note}`);
            if (isNote(note)) {
                // convert the note name to MIDI
                const mid = new FrequencyClass(this.context, note).toMidi();
                urlMap[mid] = options.urls[note];
            }
            else if (isNumber(noteNumber) && isFinite(noteNumber)) {
                // otherwise if it's numbers assume it's midi
                urlMap[noteNumber] = options.urls[noteNumber];
            }
        });
        this._buffers = new ToneAudioBuffers({
            urls: urlMap,
            onload: options.onload,
            baseUrl: options.baseUrl,
            onerror: options.onerror,
        });
        this.attack = options.attack;
        this.release = options.release;
        this.curve = options.curve;
        this._loop = options.loop;
        this._loopStart = options.loopStart;
        this._loopEnd = options.loopEnd;
        // invoke the callback if it's already loaded
        if (this._buffers.loaded) {
            // invoke onload deferred
            Promise.resolve().then(options.onload);
        }
    }
    static getDefaults() {
        return Object.assign(Instrument.getDefaults(), {
            attack: 0,
            baseUrl: "",
            curve: "exponential",
            onload: noOp,
            onerror: noOp,
            release: 0.1,
            urls: {},
            loop: false,
            loopEnd: 0,
            loopStart: 0,
        });
    }
    /**
     * Returns the difference in steps between the given midi note at the closets sample.
     */
    _findClosest(midi) {
        // searches within 8 octaves of the given midi note
        const MAX_INTERVAL = 96;
        let interval = 0;
        while (interval < MAX_INTERVAL) {
            // check above and below
            if (this._buffers.has(midi + interval)) {
                return -interval;
            }
            else if (this._buffers.has(midi - interval)) {
                return interval;
            }
            interval++;
        }
        throw new Error(`No available buffers for note: ${midi}`);
    }
    /**
     * @param  notes	The note to play, or an array of notes.
     * @param  time     When to play the note
     * @param  velocity The velocity to play the sample back.
     */
    triggerAttack(notes, time, velocity = 1) {
        this.log("triggerAttack", notes, time, velocity);
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        const offset = defaultArg(this._loopStart, 0);
        notes.forEach((note) => {
            const midiFloat = ftomf(new FrequencyClass(this.context, note).toFrequency());
            const midi = Math.round(midiFloat);
            const remainder = midiFloat - midi;
            // find the closest note pitch
            const difference = this._findClosest(midi);
            const closestNote = midi - difference;
            const buffer = this._buffers.get(closestNote);
            const playbackRate = intervalToFrequencyRatio(difference + remainder);
            const duration = this._loop
                ? undefined
                : buffer.duration / playbackRate;
            // play that note
            const source = new ToneBufferSource({
                url: buffer,
                context: this.context,
                curve: this.curve,
                fadeIn: this.attack,
                fadeOut: this.release,
                loop: this._loop,
                loopStart: this._loopStart,
                loopEnd: this._loopEnd,
                playbackRate,
            }).connect(this.output);
            source.start(time, offset, duration, velocity);
            // add it to the active sources
            if (!isArray(this._activeSources.get(midi))) {
                this._activeSources.set(midi, []);
            }
            this._activeSources.get(midi).push(source);
            // remove it when it's done
            source.onended = () => {
                if (this._activeSources && this._activeSources.has(midi)) {
                    const sources = this._activeSources.get(midi);
                    const index = sources.indexOf(source);
                    if (index !== -1) {
                        sources.splice(index, 1);
                    }
                }
            };
        });
        return this;
    }
    /**
     * @param  notes	The note to release, or an array of notes.
     * @param  time     	When to release the note.
     */
    triggerRelease(notes, time) {
        this.log("triggerRelease", notes, time);
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        notes.forEach((note) => {
            const midi = new FrequencyClass(this.context, note).toMidi();
            // find the note
            if (this._activeSources.has(midi) &&
                this._activeSources.get(midi).length) {
                const sources = this._activeSources.get(midi);
                time = this.toSeconds(time);
                sources.forEach((source) => {
                    source.stop(time);
                });
                this._activeSources.set(midi, []);
            }
        });
        return this;
    }
    /**
     * Release all currently active notes.
     * @param  time     	When to release the notes.
     */
    releaseAll(time) {
        const computedTime = this.toSeconds(time);
        this._activeSources.forEach((sources) => {
            while (sources.length) {
                const source = sources.shift();
                source.stop(computedTime);
            }
        });
        return this;
    }
    sync() {
        if (this._syncState()) {
            this._syncMethod("triggerAttack", 1);
            this._syncMethod("triggerRelease", 1);
        }
        return this;
    }
    /**
     * Invoke the attack phase, then after the duration, invoke the release.
     * @param  notes	The note to play and release, or an array of notes.
     * @param  duration The time the note should be held
     * @param  time     When to start the attack
     * @param  velocity The velocity of the attack
     */
    triggerAttackRelease(notes, duration, time, velocity = 1) {
        const computedTime = this.toSeconds(time);
        this.triggerAttack(notes, computedTime, velocity);
        if (isArray(duration)) {
            assert(isArray(notes), "notes must be an array when duration is array");
            notes.forEach((note, index) => {
                const d = duration[Math.min(index, duration.length - 1)];
                this.triggerRelease(note, computedTime + this.toSeconds(d));
            });
        }
        else {
            this.triggerRelease(notes, computedTime + this.toSeconds(duration));
        }
        return this;
    }
    /**
     * Add a note to the sampler.
     * @param  note      The buffer's pitch.
     * @param  url  Either the url of the buffer, or a buffer which will be added with the given name.
     * @param  callback  The callback to invoke when the url is loaded.
     */
    add(note, url, callback) {
        assert(isNote(note) || isFinite(note), `note must be a pitch or midi: ${note}`);
        if (isNote(note)) {
            // convert the note name to MIDI
            const mid = new FrequencyClass(this.context, note).toMidi();
            this._buffers.add(mid, url, callback);
        }
        else {
            // otherwise if it's numbers assume it's midi
            this._buffers.add(note, url, callback);
        }
        return this;
    }
    /**
     * If the buffers are loaded or not
     */
    get loaded() {
        return this._buffers.loaded;
    }
    /**
     * Set the loop start and end. Will only loop if loop is set to true.
     * @param loopStart The loop start time
     * @param loopEnd The loop end time
     * @example
     * const sampler = new Tone.Sampler({
     *      urls: {
     *           A1: "https://tonejs.github.io/audio/berklee/guitar_chord4.mp3",
     *      },
     * }).toDestination();
     * // loop between the given points
     * sampler.setLoopPoints(0.2, 0.3);
     * sampler.loop = true;
     */
    setLoopPoints(loopStart, loopEnd) {
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        return this;
    }
    /**
     * If loop is true, the loop will start at this position.
     */
    get loopStart() {
        return this._loopStart;
    }
    set loopStart(loopStart) {
        this._loopStart = loopStart;
        this._providedMidiNotes.forEach((midiNote) => {
            const buffer = this._buffers.get(midiNote);
            if (buffer.loaded) {
                assertRange(this.toSeconds(loopStart), 0, buffer.duration);
            }
        });
        // get the current sources
        this._activeSources.forEach((sourceList) => {
            sourceList.forEach((source) => {
                source.loopStart = loopStart;
            });
        });
    }
    /**
     * If loop is true, the loop will end at this position.
     */
    get loopEnd() {
        return this._loopEnd;
    }
    set loopEnd(loopEnd) {
        this._loopEnd = loopEnd;
        this._providedMidiNotes.forEach((midiNote) => {
            const buffer = this._buffers.get(midiNote);
            if (buffer.loaded) {
                assertRange(this.toSeconds(loopEnd), 0, buffer.duration);
            }
        });
        // get the current sources
        this._activeSources.forEach((sourceList) => {
            sourceList.forEach((source) => {
                source.loopEnd = loopEnd;
            });
        });
    }
    /**
     * If the buffers should loop once they are over.
     * @example
     * const sampler = new Tone.Sampler({
     *      urls: {
     *           A4: "https://tonejs.github.io/audio/berklee/femalevoice_aa_A4.mp3",
     *      },
     * }).toDestination();
     * sampler.loop = true;
     */
    get loop() {
        return this._loop;
    }
    set loop(loop) {
        // if no change, do nothing
        if (this._loop === loop) {
            return;
        }
        this._loop = loop;
        // set the loop of all of the sources
        this._activeSources.forEach((sourceList) => {
            sourceList.forEach((source) => {
                source.loop = loop;
            });
        });
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this._buffers.dispose();
        this._activeSources.forEach((sources) => {
            sources.forEach((source) => source.dispose());
        });
        this._activeSources.clear();
        return this;
    }
}
__decorate([
    timeRange(0)
], Sampler.prototype, "attack", void 0);
__decorate([
    timeRange(0)
], Sampler.prototype, "release", void 0);
//# sourceMappingURL=Sampler.js.map