import { NormalRange, Seconds, Time } from "../core/type/Units.js";
import { ToneAudioWorkletOptions } from "../core/worklet/ToneAudioWorklet.js";
import { EffectOptions } from "./Effect.js";
import { Effect } from "./Effect.js";
export interface ReverseDelayOptions extends EffectOptions {
    delayTime: Time;
    feedback: NormalRange;
}
/**
 * A feedback delay effect that plays the echos in reverse.
 * Algorithm and gain function found in [this pdf](https://ccrma.stanford.edu/~jingjiez/portfolio/echoing-harmonics/pdfs/A%20Pitch%20Shifting%20Reverse%20Echo%20Audio%20Effect.pdf)
 *
 * @example
 * const reverse = new Tone.ReverseDelay(1.5, 0.75).toDestination();
 * const synth = new Tone.Synth().connect(reverse);
 * synth.triggerAttackRelease("C4", "2n");
 * @category Effect
 */
export declare class ReverseDelay extends Effect<ReverseDelayOptions> {
    readonly name: string;
    /**
     * The node that does the reverse delay effect.
     */
    private _reverseDelayWorklet;
    /**
     * @param delayTime The amount of time the incoming signal will be delayed and reversed.
     * @param feedback The amount of signal which is fed back through the delay.
     */
    constructor(delayTime?: Time, feedback?: NormalRange);
    constructor(options?: Partial<ReverseDelayOptions>);
    private _connectWorklet;
    /**
     * The amount of time the incoming signal is delayed and reversed
     */
    get delayTime(): Time;
    set delayTime(delayTime: Time);
    /**
     * The amount of signal which is fed back through the delay.
     */
    get feedback(): NormalRange;
    set feedback(feedback: NormalRange);
    static getDefaults(): ReverseDelayOptions;
    dispose(): this;
}
export interface ReverseDelayWorkletOptions extends ToneAudioWorkletOptions {
    delayTime: Seconds;
    feedback: NormalRange;
}
