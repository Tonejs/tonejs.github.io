import { optionsFromArguments } from "../core/util/Defaults.js";
import { SignalOperator } from "./SignalOperator.js";
import { ToneConstantSource } from "./ToneConstantSource.js";
/**
 * Tone.Zero outputs 0's at audio-rate. The reason this has to be
 * its own class is that many browsers optimize out Tone.Signal
 * with a value of 0 and will not process nodes further down the graph.
 * @category Signal
 */
export class Zero extends SignalOperator {
    constructor() {
        super(optionsFromArguments(Zero.getDefaults(), arguments));
        this.name = "Zero";
        /**
         * no input node
         */
        this.input = undefined;
        this._constant = this.output = new ToneConstantSource({
            context: this.context,
            offset: 0,
        }).start();
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        this._constant.dispose();
        return this;
    }
}
//# sourceMappingURL=Zero.js.map