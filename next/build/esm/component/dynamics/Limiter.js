import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Compressor } from "./Compressor";
import { readOnly } from "../../core/util/Interface";
;
/**
 * Limiter will limit the loudness of an incoming signal.
 * It is composed of a [[Compressor]] with a fast attack
 * and release and max ratio. Limiters are commonly used to safeguard against
 * signal clipping. Unlike a compressor, limiters do not provide
 * smooth gain reduction and almost completely prevent
 * additional gain above the threshold.
 *
 * @example
 * const limiter = new Tone.Limiter(-20).toDestination();
 * const oscillator = new Tone.Oscillator().connect(limiter);
 * oscillator.start();
 * @category Component
 */
export class Limiter extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"])));
        this.name = "Limiter";
        const options = optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"]);
        this._compressor = this.input = this.output = new Compressor({
            context: this.context,
            ratio: 20,
            attack: 0,
            release: 0,
            threshold: options.threshold
        });
        this.threshold = this._compressor.threshold;
        readOnly(this, "threshold");
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            threshold: -12
        });
    }
    /**
     * A read-only decibel value for metering purposes, representing the current amount of gain
     * reduction that the compressor is applying to the signal.
     */
    get reduction() {
        return this._compressor.reduction;
    }
    dispose() {
        super.dispose();
        this._compressor.dispose();
        this.threshold.dispose();
        return this;
    }
}
//# sourceMappingURL=Limiter.js.map