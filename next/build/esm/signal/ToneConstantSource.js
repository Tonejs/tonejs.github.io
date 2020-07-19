import { connect } from "../core/context/ToneAudioNode";
import { Param } from "../core/context/Param";
import { optionsFromArguments } from "../core/util/Defaults";
import { OneShotSource } from "../source/OneShotSource";
/**
 * Wrapper around the native fire-and-forget ConstantSource.
 * Adds the ability to reschedule the stop method.
 * @category Signal
 */
export class ToneConstantSource extends OneShotSource {
    constructor() {
        super(optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]));
        this.name = "ToneConstantSource";
        /**
         * The signal generator
         */
        this._source = this.context.createConstantSource();
        const options = optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]);
        connect(this._source, this._gainNode);
        this.offset = new Param({
            context: this.context,
            convert: options.convert,
            param: this._source.offset,
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
        const computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        this._startGain(computedTime);
        this._source.start(computedTime);
        return this;
    }
    _stopSource(time) {
        this._source.stop(time);
    }
    dispose() {
        super.dispose();
        if (this.state === "started") {
            this.stop();
        }
        this._source.disconnect();
        this.offset.dispose();
        return this;
    }
}
//# sourceMappingURL=ToneConstantSource.js.map