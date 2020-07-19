import { Volume } from "../../component/channel/Volume";
import { Decibels } from "../type/Units";
import { Gain } from "./Gain";
import { Param } from "./Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";
interface DestinationOptions extends ToneAudioNodeOptions {
    volume: Decibels;
    mute: boolean;
}
/**
 * A single master output which is connected to the
 * AudioDestinationNode (aka your speakers).
 * It provides useful conveniences such as the ability
 * to set the volume and mute the entire application.
 * It also gives you the ability to apply master effects to your application.
 *
 * @example
 * const oscillator = new Tone.Oscillator().start();
 * // the audio will go from the oscillator to the speakers
 * oscillator.connect(Tone.Destination);
 * // a convenience for connecting to the master output is also provided:
 * oscillator.toDestination();
 * @category Core
 */
export declare class Destination extends ToneAudioNode<DestinationOptions> {
    readonly name: string;
    input: Volume;
    output: Gain;
    /**
     * The volume of the master output.
     */
    volume: Param<"decibels">;
    constructor(options: Partial<DestinationOptions>);
    static getDefaults(): DestinationOptions;
    /**
     * Mute the output.
     * @example
     * const oscillator = new Tone.Oscillator().start().toDestination();
     * setTimeout(() => {
     * 	// mute the output
     * 	Tone.Destination.mute = true;
     * }, 1000);
     */
    get mute(): boolean;
    set mute(mute: boolean);
    /**
     * Add a master effects chain. NOTE: this will disconnect any nodes which were previously
     * chained in the master effects chain.
     * @param args All arguments will be connected in a row and the Master will be routed through it.
     * @example
     * // route all audio through a filter and compressor
     * const lowpass = new Tone.Filter(800, "lowpass");
     * const compressor = new Tone.Compressor(-18);
     * Tone.Destination.chain(lowpass, compressor);
     */
    chain(...args: Array<AudioNode | ToneAudioNode>): this;
    /**
     * The maximum number of channels the system can output
     * @example
     * console.log(Tone.Destination.maxChannelCount);
     */
    get maxChannelCount(): number;
    /**
     * Clean up
     */
    dispose(): this;
}
export {};
