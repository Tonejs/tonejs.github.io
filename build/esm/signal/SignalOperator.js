import { optionsFromArguments } from "../core/util/Defaults";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { connectSignal } from "./Signal";
/**
 * A signal operator has an input and output and modifies the signal.
 */
export class SignalOperator extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(SignalOperator.getDefaults(), arguments, ["context"])));
    }
    connect(destination, outputNum = 0, inputNum = 0) {
        connectSignal(this, destination, outputNum, inputNum);
        return this;
    }
}
//# sourceMappingURL=SignalOperator.js.map