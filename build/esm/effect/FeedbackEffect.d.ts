import { Param } from "../core/context/Param";
import { NormalRange } from "../core/type/Units";
import { Effect, EffectOptions } from "./Effect";
export interface FeedbackEffectOptions extends EffectOptions {
    /**
     * The feedback from the output back to the input
     * ```
     * +---<--------<---+
     * |                |
     * |  +----------+  |
     * +--> feedback +>-+
     *    +----------+
     * ```
     */
    feedback: NormalRange;
}
/**
 * FeedbackEffect provides a loop between an audio source and its own output.
 * This is a base-class for feedback effects.
 */
export declare abstract class FeedbackEffect<Options extends FeedbackEffectOptions> extends Effect<Options> {
    readonly name: string;
    /**
     * the gain which controls the feedback
     */
    private _feedbackGain;
    /**
     * The amount of signal which is fed back into the effect input.
     */
    feedback: Param<"normalRange">;
    constructor(options: FeedbackEffectOptions);
    static getDefaults(): FeedbackEffectOptions;
    dispose(): this;
}
