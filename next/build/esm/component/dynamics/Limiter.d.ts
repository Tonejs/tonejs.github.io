import { InputNode, OutputNode, ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Decibels } from "../../core/type/Units";
import { Param } from "../../core/context/Param";
export interface LimiterOptions extends ToneAudioNodeOptions {
    threshold: Decibels;
}
/**
 * Limiter will limit the loudness of an incoming signal.
 * It is composed of a [[Compressor]] with a fast attack
 * and release and max ratio. Limiters are commonly used to safeguard against
 * signal clipping. Unlike a compressor, limiters do not provide
 * smooth gain reduction and almost completely prevent
 * additional gain above the threshold.
 *
 * @example
 * const limiter = new Tone.Limiter(-20).toDestination();
 * const oscillator = new Tone.Oscillator().connect(limiter);
 * oscillator.start();
 * @category Component
 */
export declare class Limiter extends ToneAudioNode<LimiterOptions> {
    readonly name: string;
    readonly input: InputNode;
    readonly output: OutputNode;
    /**
     * The compressor which does the limiting
     */
    private _compressor;
    readonly threshold: Param<"decibels">;
    /**
     * @param threshold The threshold above which the gain reduction is applied.
     */
    constructor(threshold?: Decibels);
    constructor(options?: Partial<LimiterOptions>);
    static getDefaults(): LimiterOptions;
    /**
     * A read-only decibel value for metering purposes, representing the current amount of gain
     * reduction that the compressor is applying to the signal.
     */
    get reduction(): Decibels;
    dispose(): this;
}
