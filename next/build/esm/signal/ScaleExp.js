import { Scale } from "./Scale";
import { optionsFromArguments } from "../core/util/Defaults";
import { Pow } from "./Pow";
/**
 * Performs an exponential scaling on an input signal.
 * Scales a NormalRange value [0,1] exponentially
 * to the output range of outputMin to outputMax.
 * @example
 * const scaleExp = new Tone.ScaleExp(0, 100, 2);
 * const signal = new Tone.Signal(0.5).connect(scaleExp);
 * @category Signal
 */
export class ScaleExp extends Scale {
    constructor() {
        super(Object.assign(optionsFromArguments(ScaleExp.getDefaults(), arguments, ["min", "max", "exponent"])));
        this.name = "ScaleExp";
        const options = optionsFromArguments(ScaleExp.getDefaults(), arguments, ["min", "max", "exponent"]);
        this.input = this._exp = new Pow({
            context: this.context,
            value: options.exponent,
        });
        this._exp.connect(this._mult);
    }
    static getDefaults() {
        return Object.assign(Scale.getDefaults(), {
            exponent: 1,
        });
    }
    /**
     * Instead of interpolating linearly between the {@link min} and
     * {@link max} values, setting the exponent will interpolate between
     * the two values with an exponential curve.
     */
    get exponent() {
        return this._exp.value;
    }
    set exponent(exp) {
        this._exp.value = exp;
    }
    dispose() {
        super.dispose();
        this._exp.dispose();
        return this;
    }
}
//# sourceMappingURL=ScaleExp.js.map