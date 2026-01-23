import { Frequency, NormalRange } from "../core/type/Units.js";
import { LFOEffect, LFOEffectOptions } from "./LFOEffect.js";
export interface AutoPannerOptions extends LFOEffectOptions {
    channelCount: number;
    width: NormalRange;
}
/**
 * AutoPanner is a {@link Panner} with an {@link LFO} connected to the pan amount.
 * [Related Reading](https://www.ableton.com/en/blog/autopan-chopper-effect-and-more-liveschool/).
 *
 * @example
 * // create an autopanner and start it
 * const autoPanner = new Tone.AutoPanner("4n").toDestination().start();
 * // route an oscillator through the panner and start it
 * const oscillator = new Tone.Oscillator().connect(autoPanner).start();
 * @category Effect
 */
export declare class AutoPanner extends LFOEffect<AutoPannerOptions> {
    readonly name: string;
    /**
     * The filter node
     */
    private readonly _panner;
    private _width;
    /**
     * @param frequency Rate of left-right oscillation.
     */
    constructor(frequency?: Frequency);
    constructor(options?: Partial<AutoPannerOptions>);
    static getDefaults(): AutoPannerOptions;
    /**
     * Updates the LFO min/max based on width
     */
    private _updateLFORange;
    /**
     * The width of the panning effect. 0 = no panning, 1 = full left-right panning.
     */
    get width(): NormalRange;
    set width(width: NormalRange);
    dispose(): this;
}
