import { AudioRange, Cents, Degrees, Frequency, Positive } from "../../core/type/Units";
import { Omit } from "../../core/util/Interface";
import { Signal } from "../../signal/Signal";
import { SourceOptions } from "../Source";
/**
 * The common interface of all Oscillators
 */
export interface ToneOscillatorInterface {
    /**
     * The oscillator type without the partialsCount appended to the end
     * @example
     * const osc = new Tone.Oscillator();
     * osc.type = "sine2";
     * console.log(osc.baseType); // "sine"
     */
    baseType: OscillatorType | "pulse" | "pwm";
    /**
     * The oscillator's type. Also capable of setting the first x number of partials of the oscillator.
     * For example: "sine4" would set be the first 4 partials of the sine wave and "triangle8" would
     * set the first 8 partials of the triangle wave.
     * @example
     * return Tone.Offline(() => {
     * 	const osc = new Tone.Oscillator().toDestination().start();
     * 	osc.type = "sine2";
     * }, 0.1, 1);
     */
    type: ExtendedToneOscillatorType;
    /**
     * The frequency value of the oscillator
     * @example
     * const osc = new Tone.FMOscillator("Bb4").toDestination().start();
     * osc.frequency.rampTo("D2", 3);
     */
    readonly frequency: Signal<"frequency">;
    /**
     * The detune value in cents (100th of a semitone).
     * @example
     * const osc = new Tone.PulseOscillator("F3").toDestination().start();
     * // pitch it 1 octave = 12 semitones = 1200 cents
     * osc.detune.setValueAtTime(-1200, Tone.now());
     * osc.detune.setValueAtTime(1200, Tone.now() + 0.5);
     * osc.detune.linearRampToValueAtTime(0, Tone.now() + 1);
     * osc.stop(Tone.now() + 1.5);
     */
    readonly detune: Signal<"cents">;
    /**
     * The phase is the starting position within the oscillator's cycle. For example
     * a phase of 180 would start halfway through the oscillator's cycle.
     * @example
     * return Tone.Offline(() => {
     * 	const osc = new Tone.Oscillator({
     * 		frequency: 20,
     * 		phase: 90
     * 	}).toDestination().start();
     * }, 0.1, 1);
     */
    phase: Degrees;
    /**
     * The partials describes the relative amplitude of each of the harmonics of the oscillator.
     * The first value in the array is the first harmonic (i.e. the fundamental frequency), the
     * second harmonic is an octave up, the third harmonic is an octave and a fifth, etc. The resulting
     * oscillator output is composed of a sine tone at the relative amplitude at each of the harmonic intervals.
     *
     * Setting this value will automatically set the type to "custom".
     * The value is an empty array when the type is not "custom".
     * @example
     * const osc = new Tone.Oscillator("F3").toDestination().start();
     * setInterval(() => {
     * 	// generate 8 random partials
     * 	osc.partials = new Array(8).fill(0).map(() => Math.random());
     * }, 1000);
     */
    partials: number[];
    /**
     * 'partialCount' offers an alternative way to set the number of used partials.
     * When partialCount is 0, the maximum number of partials are used when representing
     * the waveform using the periodicWave. When 'partials' is set, this value is
     * not settable, but equals the length of the partials array. A square wave wave
     * is composed of only odd harmonics up through the harmonic series. Partial count
     * can limit the number of harmonics which are used to generate the waveform.
     * @example
     * const osc = new Tone.Oscillator("C3", "square").toDestination().start();
     * osc.partialCount = 1;
     * setInterval(() => {
     * 	osc.partialCount++;
     * 	console.log(osc.partialCount);
     * }, 500);
     */
    partialCount?: number;
    /**
     * Returns an array of values which represents the waveform.
     * @param length The length of the waveform to return
     */
    asArray(length: number): Promise<Float32Array>;
}
/**
 * Render a segment of the oscillator to an offline context and return the results as an array
 */
export declare function generateWaveform(instance: any, length: number): Promise<Float32Array>;
/**
 * The supported number of partials
 */
declare type PartialsRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
/**
 * Oscillators with partials
 */
declare type SineWithPartials = `sine${PartialsRange}`;
declare type SquareWithPartials = `square${PartialsRange}`;
declare type SawtoothWithPartials = `sawtooth${PartialsRange}`;
declare type TriangleWithPartials = `triangle${PartialsRange}`;
declare type TypeWithPartials = SineWithPartials | SquareWithPartials | TriangleWithPartials | SawtoothWithPartials;
interface BaseOscillatorOptions extends SourceOptions {
    frequency: Frequency;
    detune: Cents;
    phase: Degrees;
}
export declare type NonCustomOscillatorType = Exclude<OscillatorType, "custom">;
declare type AllNonCustomOscillatorType = NonCustomOscillatorType | TypeWithPartials;
export declare type ToneOscillatorType = AllNonCustomOscillatorType | "custom";
export declare type ExtendedToneOscillatorType = ToneOscillatorType | "pwm" | "pulse";
/**
 * Oscillator Interfaces
 */
interface ToneCustomOscillatorOptions extends BaseOscillatorOptions {
    type: "custom";
    partials: number[];
}
interface ToneTypeOscillatorOptions extends BaseOscillatorOptions {
    type: NonCustomOscillatorType;
    partialCount?: number;
}
interface TonePartialOscillatorOptions extends BaseOscillatorOptions {
    type: TypeWithPartials;
}
export declare type ToneOscillatorConstructorOptions = ToneCustomOscillatorOptions | ToneTypeOscillatorOptions | TonePartialOscillatorOptions;
export interface ToneOscillatorOptions extends BaseOscillatorOptions {
    type: ToneOscillatorType;
    partialCount: number;
    partials: number[];
}
/**
 * FMOscillator Interface
 */
interface FMBaseOscillatorOptions extends BaseOscillatorOptions {
    harmonicity: Positive;
    modulationIndex: Positive;
    modulationType: AllNonCustomOscillatorType;
}
interface FMCustomOscillatorOptions extends FMBaseOscillatorOptions {
    type: "custom";
    partials: number[];
}
interface FMTypeOscillatorOptions extends FMBaseOscillatorOptions {
    type: NonCustomOscillatorType;
    partialsCount?: number;
}
interface FMPartialsOscillatorOptions extends FMBaseOscillatorOptions {
    type: TypeWithPartials;
}
export declare type FMConstructorOptions = FMTypeOscillatorOptions | FMCustomOscillatorOptions | FMPartialsOscillatorOptions;
export interface FMOscillatorOptions extends ToneOscillatorOptions {
    harmonicity: Positive;
    modulationIndex: Positive;
    modulationType: AllNonCustomOscillatorType;
}
/**
 * AMOscillator Interface
 */
interface AMBaseOscillatorOptions extends BaseOscillatorOptions {
    harmonicity: Positive;
    modulationType: AllNonCustomOscillatorType;
}
interface AMCustomOscillatorOptions extends AMBaseOscillatorOptions {
    type: "custom";
    partials: number[];
}
interface AMTypeOscillatorOptions extends AMBaseOscillatorOptions {
    type: NonCustomOscillatorType;
    partialsCount?: number;
}
interface AMPartialsOscillatorOptions extends AMBaseOscillatorOptions {
    type: TypeWithPartials;
}
export declare type AMConstructorOptions = AMCustomOscillatorOptions | AMTypeOscillatorOptions | AMPartialsOscillatorOptions;
export interface AMOscillatorOptions extends ToneOscillatorOptions {
    harmonicity: Positive;
    modulationType: AllNonCustomOscillatorType;
}
/**
 * FatOscillator
 */
interface FatBaseOscillatorOptions extends BaseOscillatorOptions {
    spread: Cents;
    count: Positive;
}
interface FatCustomOscillatorOptions extends FatBaseOscillatorOptions {
    type: "custom";
    partials: number[];
}
interface FatTypeOscillatorOptions extends FatBaseOscillatorOptions {
    type: NonCustomOscillatorType;
    partialCount?: number;
}
interface FatPartialsOscillatorOptions extends FatBaseOscillatorOptions {
    type: TypeWithPartials;
}
export declare type FatConstructorOptions = FatCustomOscillatorOptions | FatTypeOscillatorOptions | FatPartialsOscillatorOptions;
export interface FatOscillatorOptions extends ToneOscillatorOptions {
    spread: Cents;
    count: Positive;
}
/**
 * Pulse Oscillator
 */
export interface PulseOscillatorOptions extends BaseOscillatorOptions {
    type: "pulse";
    width: AudioRange;
}
/**
 * PWM Oscillator
 */
export interface PWMOscillatorOptions extends BaseOscillatorOptions {
    type: "pwm";
    modulationFrequency: Frequency;
}
/**
 * OMNI OSCILLATOR
 */
/**
 * FM Oscillators with partials
 */
declare type FMSineWithPartials = `fmsine${PartialsRange}`;
declare type FMSquareWithPartials = `fmsquare${PartialsRange}`;
declare type FMSawtoothWithPartials = `fmsawtooth${PartialsRange}`;
declare type FMTriangleWithPartials = `fmtriangle${PartialsRange}`;
declare type FMTypeWithPartials = FMSineWithPartials | FMSquareWithPartials | FMSawtoothWithPartials | FMTriangleWithPartials;
/**
 * AM Oscillators with partials
 */
declare type AMSineWithPartials = `amsine${PartialsRange}`;
declare type AMSquareWithPartials = `amsquare${PartialsRange}`;
declare type AMSawtoothWithPartials = `amsawtooth${PartialsRange}`;
declare type AMTriangleWithPartials = `amtriangle${PartialsRange}`;
declare type AMTypeWithPartials = AMSineWithPartials | AMSquareWithPartials | AMSawtoothWithPartials | AMTriangleWithPartials;
/**
 * Fat Oscillators with partials
 */
declare type FatSineWithPartials = `fatsine${PartialsRange}`;
declare type FatSquareWithPartials = `fatsquare${PartialsRange}`;
declare type FatSawtoothWithPartials = `fatsawtooth${PartialsRange}`;
declare type FatTriangleWithPartials = `fattriangle${PartialsRange}`;
declare type FatTypeWithPartials = FatSineWithPartials | FatSquareWithPartials | FatSawtoothWithPartials | FatTriangleWithPartials;
/**
 * Omni FM
 */
interface OmniFMCustomOscillatorOptions extends FMBaseOscillatorOptions {
    type: "fmcustom";
    partials: number[];
}
interface OmniFMTypeOscillatorOptions extends FMBaseOscillatorOptions {
    type: "fmsine" | "fmsquare" | "fmsawtooth" | "fmtriangle";
    partialsCount?: number;
}
interface OmniFMPartialsOscillatorOptions extends FMBaseOscillatorOptions {
    type: FMTypeWithPartials;
}
/**
 * Omni AM
 */
interface OmniAMCustomOscillatorOptions extends AMBaseOscillatorOptions {
    type: "amcustom";
    partials: number[];
}
interface OmniAMTypeOscillatorOptions extends AMBaseOscillatorOptions {
    type: "amsine" | "amsquare" | "amsawtooth" | "amtriangle";
    partialsCount?: number;
}
interface OmniAMPartialsOscillatorOptions extends AMBaseOscillatorOptions {
    type: AMTypeWithPartials;
}
/**
 * Omni Fat
 */
interface OmniFatCustomOscillatorOptions extends FatBaseOscillatorOptions {
    type: "fatcustom";
    partials: number[];
}
interface OmniFatTypeOscillatorOptions extends FatBaseOscillatorOptions {
    type: "fatsine" | "fatsquare" | "fatsawtooth" | "fattriangle";
    partialsCount?: number;
}
interface OmniFatPartialsOscillatorOptions extends FatBaseOscillatorOptions {
    type: FatTypeWithPartials;
}
export declare type OmniOscillatorType = "fatsine" | "fatsquare" | "fatsawtooth" | "fattriangle" | "fatcustom" | FatTypeWithPartials | "fmsine" | "fmsquare" | "fmsawtooth" | "fmtriangle" | "fmcustom" | FMTypeWithPartials | "amsine" | "amsquare" | "amsawtooth" | "amtriangle" | "amcustom" | AMTypeWithPartials | TypeWithPartials | OscillatorType | "pulse" | "pwm";
export declare type OmniOscillatorOptions = PulseOscillatorOptions | PWMOscillatorOptions | OmniFatCustomOscillatorOptions | OmniFatTypeOscillatorOptions | OmniFatPartialsOscillatorOptions | OmniFMCustomOscillatorOptions | OmniFMTypeOscillatorOptions | OmniFMPartialsOscillatorOptions | OmniAMCustomOscillatorOptions | OmniAMTypeOscillatorOptions | OmniAMPartialsOscillatorOptions | ToneOscillatorConstructorOptions;
declare type OmitSourceOptions<T extends BaseOscillatorOptions> = Omit<T, "frequency" | "detune" | "context">;
/**
 * The settable options for the omni oscillator inside of the source which excludes certain attributes that are defined by the parent class
 */
export declare type OmniOscillatorSynthOptions = OmitSourceOptions<PulseOscillatorOptions> | OmitSourceOptions<PWMOscillatorOptions> | OmitSourceOptions<OmniFatCustomOscillatorOptions> | OmitSourceOptions<OmniFatTypeOscillatorOptions> | OmitSourceOptions<OmniFatPartialsOscillatorOptions> | OmitSourceOptions<OmniFMCustomOscillatorOptions> | OmitSourceOptions<OmniFMTypeOscillatorOptions> | OmitSourceOptions<OmniFMPartialsOscillatorOptions> | OmitSourceOptions<OmniAMCustomOscillatorOptions> | OmitSourceOptions<OmniAMTypeOscillatorOptions> | OmitSourceOptions<OmniAMPartialsOscillatorOptions> | OmitSourceOptions<ToneCustomOscillatorOptions> | OmitSourceOptions<ToneTypeOscillatorOptions> | OmitSourceOptions<TonePartialOscillatorOptions>;
export {};
