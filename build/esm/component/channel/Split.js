import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
/**
 * Split splits an incoming signal into the number of given channels.
 *
 * @example
 * const split = new Tone.Split();
 * // stereoSignal.connect(split);
 * @category Component
 */
export class Split extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Split.getDefaults(), arguments, ["channels"]));
        this.name = "Split";
        const options = optionsFromArguments(Split.getDefaults(), arguments, ["channels"]);
        this._splitter = this.input = this.output = this.context.createChannelSplitter(options.channels);
        this._internalChannels = [this._splitter];
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            channels: 2,
        });
    }
    dispose() {
        super.dispose();
        this._splitter.disconnect();
        return this;
    }
}
//# sourceMappingURL=Split.js.map