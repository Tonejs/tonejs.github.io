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
        const options = optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]);
        super(options);
        this.name = "ToneConstantSource";
        this._onContextRunning(() => this._contextStarted());
        this.offset = new Param({
            context: this.context,
            convert: options.convert,
            param: !this._source
                ? // placeholder param until the context is started
                    this.context.createGain().gain
                : this._source.offset,
            swappable: !this._source,
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
     * Once the context is started, kick off source.
     */
    _contextStarted() {
        var _a;
        this._source = this.context.createConstantSource();
        connect(this._source, this._gainNode);
        (_a = this.offset) === null || _a === void 0 ? void 0 : _a.setParam(this._source.offset);
        if (this.state === "started") {
            this._source.start(0);
        }
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
        return this;
    }
}
//# sourceMappingURL=ToneConstantSource.js.map