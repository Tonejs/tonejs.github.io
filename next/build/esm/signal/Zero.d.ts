import { ToneAudioNode, ToneAudioNodeOptions } from "../core/context/ToneAudioNode.js";
import { SignalOperator } from "./SignalOperator.js";
/**
 * Tone.Zero outputs 0's at audio-rate. The reason this has to be
 * its own class is that many browsers optimize out Tone.Signal
 * with a value of 0 and will not process nodes further down the graph.
 * @category Signal
 */
export declare class Zero extends SignalOperator<ToneAudioNodeOptions> {
    readonly name: string;
    /**
     * A constant source which outputs 0
     */
    private _constant;
    /**
     * Only outputs 0
     */
    output: ToneAudioNode;
    /**
     * no input node
     */
    input: undefined;
    constructor(options?: Partial<ToneAudioNodeOptions>);
    /**
     * clean up
     */
    dispose(): this;
}
