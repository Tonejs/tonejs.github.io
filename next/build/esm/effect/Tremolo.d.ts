import { Degrees, Frequency, NormalRange } from "../core/type/Units.js";
import { Signal } from "../signal/Signal.js";
import { ToneOscillatorType } from "../source/oscillator/OscillatorInterface.js";
import { LFOStereoEffect, LFOStereoEffectOptions } from "./LFOStereoEffect.js";
export interface TremoloOptions extends LFOStereoEffectOptions {
    frequency: Frequency;
    type: ToneOscillatorType;
    depth: NormalRange;
    spread: Degrees;
}
/**
 * Tremolo modulates the amplitude of an incoming signal using an {@link LFO}.
 * The effect is a stereo effect where the modulation phase is inverted in each channel.
 *
 * @example
 * // create a tremolo and start its LFO
 * const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();
 * // route an oscillator through the tremolo and start it
 * const oscillator = new Tone.Oscillator().connect(tremolo).start();
 *
 * @category Effect
 */
export declare class Tremolo extends LFOStereoEffect<TremoloOptions> {
    readonly name: string;
    /**
     * Where the gain is multiplied
     */
    private _amplitudeL;
    /**
     * Where the gain is multiplied
     */
    private _amplitudeR;
    /**
     * The depth of the effect. A depth of 0, has no effect
     * on the amplitude, and a depth of 1 makes the amplitude
     * modulate fully between 0 and 1.
     */
    readonly depth: Signal<"normalRange">;
    /**
     * @param frequency The rate of the effect.
     * @param depth The depth of the effect.
     */
    constructor(frequency?: Frequency, depth?: NormalRange);
    constructor(options?: Partial<TremoloOptions>);
    static getDefaults(): TremoloOptions;
    /**
     * The oscillator type.
     */
    get type(): ToneOscillatorType;
    set type(type: ToneOscillatorType);
    /**
     * Amount of stereo spread. When set to 0, both LFO's will be panned centrally.
     * When set to 180, LFO's will be panned hard left and right respectively.
     */
    get spread(): Degrees;
    set spread(spread: Degrees);
    dispose(): this;
}
