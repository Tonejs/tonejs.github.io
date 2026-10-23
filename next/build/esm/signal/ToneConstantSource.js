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
        /**
         * Whether the native source was started, so it can be stopped
         */
        this._sourceStarted = false;
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
        const isStarted = this._startTime !== -1;
        const isStoppedBeforeStart = this._stopTime !== -1 && this._stopTime < this._startTime;
        if (isStarted && !isStoppedBeforeStart) {
            this._source.start(this._startTime);
            this._sourceStarted = true;
        }
    }
    /**
     * Start the source node at the given time
     * @param  time When to start the source
     */
    start(time) {
        const computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        this._startGain(computedTime);
        if (this._source) {
            this._source.start(computedTime);
            this._sourceStarted = true;
        }
        return this;
    }
    _stopSource(time) {
        var _a;
        // state is already "stopped" here: OneShotSource defers this call
        // until after _stopTime, so check the native node instead
        if (this._sourceStarted) {
            (_a = this._source) === null || _a === void 0 ? void 0 : _a.stop(time);
        }
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