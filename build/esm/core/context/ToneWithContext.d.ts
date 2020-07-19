import { Tone } from "../Tone";
import { TimeClass } from "../type/Time";
import { Frequency, Hertz, Seconds, Ticks, Time } from "../type/Units";
import { RecursivePartial } from "../util/Interface";
import { BaseContext } from "./BaseContext";
/**
 * A unit which process audio
 */
export interface ToneWithContextOptions {
    context: BaseContext;
}
/**
 * The Base class for all nodes that have an AudioContext.
 */
export declare abstract class ToneWithContext<Options extends ToneWithContextOptions> extends Tone {
    /**
     * The context belonging to the node.
     */
    readonly context: BaseContext;
    /**
     * The default context to use if no AudioContext is passed in to the constructor.
     * Probably should not be set manually. Used internally.
     * @hidden
     */
    readonly defaultContext?: BaseContext;
    /**
     * Pass in a constructor as the first argument
     */
    constructor(context?: BaseContext);
    constructor(options?: Partial<ToneWithContextOptions>);
    static getDefaults(): ToneWithContextOptions;
    /**
     * Return the current time of the Context clock plus the lookAhead.
     * @example
     * setInterval(() => {
     * 	console.log(Tone.now());
     * }, 100);
     */
    now(): Seconds;
    /**
     * Return the current time of the Context clock without any lookAhead.
     * @example
     * setInterval(() => {
     * 	console.log(Tone.immediate());
     * }, 100);
     */
    immediate(): Seconds;
    /**
     * The duration in seconds of one sample.
     * @example
     * console.log(Tone.Transport.sampleTime);
     */
    get sampleTime(): Seconds;
    /**
     * The number of seconds of 1 processing block (128 samples)
     * @example
     * console.log(Tone.Destination.blockTime);
     */
    get blockTime(): Seconds;
    /**
     * Convert the incoming time to seconds
     * @example
     * const gain = new Tone.Gain();
     * console.log(gain.toSeconds("4n"));
     */
    toSeconds(time?: Time): Seconds;
    /**
     * Convert the input to a frequency number
     * @example
     * const gain = new Tone.Gain();
     * console.log(gain.toFrequency("4n"));
     */
    toFrequency(freq: Frequency): Hertz;
    /**
     * Convert the input time into ticks
     * @example
     * const gain = new Tone.Gain();
     * console.log(gain.toTicks("4n"));
     */
    toTicks(time?: Time | TimeClass): Ticks;
    /**
     * Get a subset of the properties which are in the partial props
     */
    protected _getPartialProperties(props: Options): Partial<Options>;
    /**
     * Get the object's attributes.
     * @example
     * const osc = new Tone.Oscillator();
     * console.log(osc.get());
     */
    get(): Options;
    /**
     * Set multiple properties at once with an object.
     * @example
     * const filter = new Tone.Filter();
     * // set values using an object
     * filter.set({
     * 	frequency: 300,
     * 	type: "highpass"
     * });
     */
    set(props: RecursivePartial<Options>): this;
}
