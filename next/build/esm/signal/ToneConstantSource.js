import { Param } from "../core/context/Param.js";
import { connect } from "../core/context/ToneAudioNode.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { OneShotSource, } from "../source/OneShotSource.js";
/**
 * Wrapper around the native fire-and-forget ConstantSource.
 * Adds the ability to reschedule the stop method.
 * @category Signal
 */
export class ToneConstantSource extends OneShotSource {
    constructor() {
        var _a;
        const options = optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]);
        super(options);
        this.name = "ToneConstantSource";
        /**
         * Once the context is started, kick off source.
         */
        this._contextStarted = (state) => {
            if (state !== "running") {
                return;
            }
            this._source = this.context.createConstantSource();
            connect(this._source, this._gainNode);
            this.offset.setParam(this._source.offset);
            if (this.state === "started") {
                this._source.start(0);
            }
        };
        const isSuspended = !this.context.isOffline && this.context.state !== "running";
        if (!isSuspended) {
            this._source = this.context.createConstantSource();
            connect(this._source, this._gainNode);
        }
        else {
            this.context.on("statechange", this._contextStarted);
        }
        this.offset = new Param({
            context: this.context,
            convert: options.convert,
            param: isSuspended
                ? // placeholder param until the context is started
                    this.context.createGain().gain
                : (_a = this._source) === null || _a === void 0 ? void 0 : _a.offset,
            swappable: isSuspended,
            units: options.units,
            value: options.offset,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
    }
    static getDefaults() {
        return Object.assign(OneShotSource.getDefaults(), {
            convert: true,
            offset: 1,
            units: "number",
        });
    }
    /**
     * Start the source node at the given time
     * @param  time When to start the source
     */
    start(time) {
        var _a;
        const computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        this._startGain(computedTime);
        (_a = this._source) === null || _a === void 0 ? void 0 : _a.start(computedTime);
        return this;
    }
    _stopSource(time) {
        var _a;
        if (this.state === "stopped") {
            return;
        }
        (_a = this._source) === null || _a === void 0 ? void 0 : _a.stop(time);
    }
    dispose() {
        var _a;
        super.dispose();
        if (this.state === "started") {
            this.stop();
        }
        (_a = this._source) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.offset.dispose();
        this.context.off("statechange", this._contextStarted);
        return this;
    }
}
//# sourceMappingURL=ToneConstantSource.js.map