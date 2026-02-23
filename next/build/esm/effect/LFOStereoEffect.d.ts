import { Frequency, Time } from "../core/type/Units.js";
import { Signal } from "../signal/Signal.js";
import { LFO } from "../source/oscillator/LFO.js";
import { ToneOscillatorType } from "../source/oscillator/OscillatorInterface.js";
import { StereoEffect, StereoEffectOptions } from "./StereoEffect.js";
export interface LFOStereoEffectOptions extends StereoEffectOptions {
    frequency: Frequency;
    autostart: boolean;
}
/**
 * Base class for stereo effects which modulate the incoming signal with an LFO.
 *
 * @category Effect
 */
export declare abstract class LFOStereoEffect<Options extends LFOStereoEffectOptions> extends StereoEffect<Options> {
    readonly name: string;
    /**
     * The LFO in the left channel
     */
    protected _lfoL: LFO;
    /**
     * The LFO in the right channel
     */
    protected _lfoR: LFO;
    /**
     * The frequency of the tremolo.
     */
    readonly frequency: Signal<"frequency">;
    constructor(options?: Partial<LFOStereoEffectOptions>);
    static getDefaults(): LFOStereoEffectOptions;
    /**
     * Start the tremolo.
     */
    start(time?: Time): this;
    /**
     * Stop the tremolo.
     */
    stop(time?: Time): this;
    /**
     * Sync the effect to the transport.
     */
    sync(): this;
    /**
     * Unsync the filter from the transport
     */
    unsync(): this;
    /**
     * The oscillator type.
     */
    get type(): ToneOscillatorType;
    set type(type: ToneOscillatorType);
    dispose(): this;
}
