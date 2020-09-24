import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { Compressor } from "./Compressor";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { MultibandSplit } from "../channel/MultibandSplit";
import { Gain } from "../../core/context/Gain";
/**
 * A compressor with separate controls over low/mid/high dynamics. See [[Compressor]] and [[MultibandSplit]]
 *
 * @example
 * const multiband = new Tone.MultibandCompressor({
 * 	lowFrequency: 200,
 * 	highFrequency: 1300,
 * 	low: {
 * 		threshold: -12
 * 	}
 * });
 * @category Component
 */
export class MultibandCompressor extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(MultibandCompressor.getDefaults(), arguments)));
        this.name = "MultibandCompressor";
        const options = optionsFromArguments(MultibandCompressor.getDefaults(), arguments);
        this._splitter = this.input = new MultibandSplit({
            context: this.context,
            lowFrequency: options.lowFrequency,
            highFrequency: options.highFrequency
        });
        this.lowFrequency = this._splitter.lowFrequency;
        this.highFrequency = this._splitter.highFrequency;
        this.output = new Gain({ context: this.context });
        this.low = new Compressor(Object.assign(options.low, { context: this.context }));
        this.mid = new Compressor(Object.assign(options.mid, { context: this.context }));
        this.high = new Compressor(Object.assign(options.high, { context: this.context }));
        // connect the compressor
        this._splitter.low.chain(this.low, this.output);
        this._splitter.mid.chain(this.mid, this.output);
        this._splitter.high.chain(this.high, this.output);
        readOnly(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            lowFrequency: 250,
            highFrequency: 2000,
            low: {
                ratio: 6,
                threshold: -30,
                release: 0.25,
                attack: 0.03,
                knee: 10
            },
            mid: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
            high: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
        });
    }
    dispose() {
        super.dispose();
        this._splitter.dispose();
        this.low.dispose();
        this.mid.dispose();
        this.high.dispose();
        this.output.dispose();
        return this;
    }
}
//# sourceMappingURL=MultibandCompressor.js.map