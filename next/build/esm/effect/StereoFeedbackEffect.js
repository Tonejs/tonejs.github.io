import { StereoEffect } from "./StereoEffect";
import { Signal } from "../signal/Signal";
import { Gain } from "../core/context/Gain";
import { readOnly } from "../core/util/Interface";
import { Split } from "../component/channel/Split";
import { Merge } from "../component/channel/Merge";
/**
 * Base class for stereo feedback effects where the effectReturn is fed back into the same channel.
 */
export class StereoFeedbackEffect extends StereoEffect {
    constructor(options) {
        super(options);
        this.feedback = new Signal({
            context: this.context,
            value: options.feedback,
            units: "normalRange"
        });
        this._feedbackL = new Gain({ context: this.context });
        this._feedbackR = new Gain({ context: this.context });
        this._feedbackSplit = new Split({ context: this.context, channels: 2 });
        this._feedbackMerge = new Merge({ context: this.context, channels: 2 });
        this._merge.connect(this._feedbackSplit);
        this._feedbackMerge.connect(this._split);
        // the left output connected to the left input
        this._feedbackSplit.connect(this._feedbackL, 0, 0);
        this._feedbackL.connect(this._feedbackMerge, 0, 0);
        // the right output connected to the right input
        this._feedbackSplit.connect(this._feedbackR, 1, 0);
        this._feedbackR.connect(this._feedbackMerge, 0, 1);
        // the feedback control
        this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain);
        readOnly(this, ["feedback"]);
    }
    static getDefaults() {
        return Object.assign(StereoEffect.getDefaults(), {
            feedback: 0.5,
        });
    }
    dispose() {
        super.dispose();
        this.feedback.dispose();
        this._feedbackL.dispose();
        this._feedbackR.dispose();
        this._feedbackSplit.dispose();
        this._feedbackMerge.dispose();
        return this;
    }
}
//# sourceMappingURL=StereoFeedbackEffect.js.map