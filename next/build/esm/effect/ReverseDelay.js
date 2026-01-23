import { Gain } from "../core/context/Gain.js";
import { Param } from "../core/context/Param.js";
import { connectSeries } from "../core/context/ToneAudioNode.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { ToneAudioWorklet, } from "../core/worklet/ToneAudioWorklet.js";
import { Effect } from "./Effect.js";
import { workletName } from "./ReverseDelay.worklet.js";
/**
 * A feedback delay effect that plays the echos in reverse.
 * Algorithm and gain function found in [this pdf](https://ccrma.stanford.edu/~jingjiez/portfolio/echoing-harmonics/pdfs/A%20Pitch%20Shifting%20Reverse%20Echo%20Audio%20Effect.pdf)
 *
 * @example
 * const reverse = new Tone.ReverseDelay(1.5, 0.75).toDestination();
 * const synth = new Tone.Synth().connect(reverse);
 * synth.triggerAttackRelease("C4", "2n");
 * @category Effect
 */
export class ReverseDelay extends Effect {
    constructor() {
        const options = optionsFromArguments(ReverseDelay.getDefaults(), arguments, ["delayTime", "feedback"]);
        super(options);
        this.name = "ReverseDelay";
        this._reverseDelayWorklet = this._connectWorklet(options.delayTime, options.feedback);
    }
    _connectWorklet(delayTime, feedback) {
        const worklet = new ReverseDelayWorklet({
            context: this.context,
            delayTime: this.toSeconds(delayTime),
            feedback,
        });
        this.connectEffect(worklet);
        return worklet;
    }
    /**
     * The amount of time the incoming signal is delayed and reversed
     */
    get delayTime() {
        return this._reverseDelayWorklet.delayTime;
    }
    set delayTime(delayTime) {
        const prev = this._reverseDelayWorklet;
        this._reverseDelayWorklet = this._connectWorklet(delayTime, this.feedback);
        // Prevent sudden stop when disposing previous worklet
        prev.output.gain.linearRampTo(0, this.toSeconds(this.delayTime));
        this.context.setTimeout(() => prev.dispose(), this.toSeconds(this.delayTime));
    }
    /**
     * The amount of signal which is fed back through the delay.
     */
    get feedback() {
        return this._reverseDelayWorklet.feedback.value;
    }
    set feedback(feedback) {
        this._reverseDelayWorklet.set({ feedback });
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            wet: 0.5,
            delayTime: 1,
            feedback: 0.5,
        });
    }
    dispose() {
        super.dispose();
        this._reverseDelayWorklet.dispose();
        return this;
    }
}
/**
 * Internal class which creates an AudioWorklet to reverse the delay signal
 */
class ReverseDelayWorklet extends ToneAudioWorklet {
    constructor() {
        const options = optionsFromArguments(ReverseDelayWorklet.getDefaults(), arguments, ["delayTime", "feedback"]);
        super(Object.assign(Object.assign({}, options), { workletOptions: {
                processorOptions: {
                    delayTime: options.delayTime,
                },
            } }));
        this.name = "ReverseDelayWorklet";
        this.input = new Gain({ context: this.context });
        this.output = new Gain({ context: this.context });
        this.delayTime = options.delayTime;
        this.feedback = new Param({
            context: this.context,
            value: options.feedback,
            units: "normalRange",
            param: this._dummyParam,
            swappable: true,
            minValue: 0,
            maxValue: 0.9999,
        });
    }
    static getDefaults() {
        return Object.assign(ToneAudioWorklet.getDefaults(), {
            delayTime: 1,
            feedback: 0.5,
        });
    }
    _audioWorkletName() {
        return workletName;
    }
    onReady(node) {
        connectSeries(this.input, node, this.output);
        const feedback = node.parameters.get("feedback");
        this.feedback.setParam(feedback);
    }
    dispose() {
        super.dispose();
        this.input.dispose();
        this.output.dispose();
        this.feedback.dispose();
        return this;
    }
}
//# sourceMappingURL=ReverseDelay.js.map