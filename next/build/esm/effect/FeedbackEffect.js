import { Gain } from "../core/context/Gain";
import { readOnly } from "../core/util/Interface";
import { Effect } from "./Effect";
/**
 * FeedbackEffect provides a loop between an audio source and its own output.
 * This is a base-class for feedback effects.
 */
export class FeedbackEffect extends Effect {
    constructor(options) {
        super(options);
        this.name = "FeedbackEffect";
        this._feedbackGain = new Gain({
            context: this.context,
            gain: options.feedback,
            units: "normalRange",
        });
        this.feedback = this._feedbackGain.gain;
        readOnly(this, "feedback");
        // the feedback loop
        this.effectReturn.chain(this._feedbackGain, this.effectSend);
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            feedback: 0.125,
        });
    }
    dispose() {
        super.dispose();
        this._feedbackGain.dispose();
        this.feedback.dispose();
        return this;
    }
}
//# sourceMappingURL=FeedbackEffect.js.map