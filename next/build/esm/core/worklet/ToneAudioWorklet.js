import { ToneAudioNode, } from "../context/ToneAudioNode.js";
import { noOp } from "../util/Interface.js";
import { getWorkletGlobalScope } from "./WorkletGlobalScope.js";
export class ToneAudioWorklet extends ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = "ToneAudioWorklet";
        /**
         * The constructor options for the node
         */
        this.workletOptions = {};
        /**
         * Callback which is invoked when there is an error in the processing
         */
        this.onprocessorerror = noOp;
        const blobUrl = URL.createObjectURL(new Blob([getWorkletGlobalScope()], { type: "text/javascript" }));
        const name = this._audioWorkletName();
        this._dummyGain = this.context.createGain();
        this._dummyParam = this._dummyGain.gain;
        // Register the processor
        let workletPromise = ToneAudioWorklet._workletPromises.get(this.context);
        if (options.workletOptions) {
            this.workletOptions = Object.assign({}, this.workletOptions, options.workletOptions);
        }
        if (workletPromise === undefined) {
            workletPromise = this.context.addAudioWorkletModule(blobUrl);
            ToneAudioWorklet._workletPromises.set(this.context, workletPromise);
        }
        workletPromise.then(() => {
            // create the worklet when it's read
            if (!this.disposed) {
                this._worklet = this.context.createAudioWorkletNode(name, this.workletOptions);
                this._worklet.onprocessorerror = (e) => this.onprocessorerror(e.message);
                this.onReady(this._worklet);
            }
        });
    }
    dispose() {
        var _a, _b;
        super.dispose();
        this._dummyGain.disconnect();
        (_a = this._worklet) === null || _a === void 0 ? void 0 : _a.port.postMessage("dispose");
        (_b = this._worklet) === null || _b === void 0 ? void 0 : _b.disconnect();
        return this;
    }
}
ToneAudioWorklet._workletPromises = new WeakMap();
//# sourceMappingURL=ToneAudioWorklet.js.map