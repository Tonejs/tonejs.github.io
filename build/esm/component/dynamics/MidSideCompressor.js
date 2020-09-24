import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { Compressor } from "./Compressor";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MidSideSplit } from "../channel/MidSideSplit";
import { MidSideMerge } from "../channel/MidSideMerge";
import { readOnly } from "../../core/util/Interface";
/**
 * MidSideCompressor applies two different compressors to the [[mid]]
 * and [[side]] signal components of the input. See [[MidSideSplit]] and [[MidSideMerge]].
 * @category Component
 */
export class MidSideCompressor extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(MidSideCompressor.getDefaults(), arguments)));
        this.name = "MidSideCompressor";
        const options = optionsFromArguments(MidSideCompressor.getDefaults(), arguments);
        this._midSideSplit = this.input = new MidSideSplit({ context: this.context });
        this._midSideMerge = this.output = new MidSideMerge({ context: this.context });
        this.mid = new Compressor(Object.assign(options.mid, { context: this.context }));
        this.side = new Compressor(Object.assign(options.side, { context: this.context }));
        this._midSideSplit.mid.chain(this.mid, this._midSideMerge.mid);
        this._midSideSplit.side.chain(this.side, this._midSideMerge.side);
        readOnly(this, ["mid", "side"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mid: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
            side: {
                ratio: 6,
                threshold: -30,
                release: 0.25,
                attack: 0.03,
                knee: 10
            }
        });
    }
    dispose() {
        super.dispose();
        this.mid.dispose();
        this.side.dispose();
        this._midSideSplit.dispose();
        this._midSideMerge.dispose();
        return this;
    }
}
//# sourceMappingURL=MidSideCompressor.js.map