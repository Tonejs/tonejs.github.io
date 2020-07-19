import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Analyser } from "./Analyser";
/**
 * The base class for Metering classes.
 */
export class MeterBase extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(MeterBase.getDefaults(), arguments));
        this.name = "MeterBase";
        this.input = this.output = this._analyser = new Analyser({
            context: this.context,
            size: 256,
            type: "waveform",
        });
    }
    dispose() {
        super.dispose();
        this._analyser.dispose();
        return this;
    }
}
//# sourceMappingURL=MeterBase.js.map