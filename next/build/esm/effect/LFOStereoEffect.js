import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import { Signal } from "../signal/Signal.js";
import { LFO } from "../source/oscillator/LFO.js";
import { StereoEffect } from "./StereoEffect.js";
/**
 * Base class for stereo effects which modulate the incoming signal with an LFO.
 *
 * @category Effect
 */
export class LFOStereoEffect extends StereoEffect {
    constructor() {
        const options = optionsFromArguments(LFOStereoEffect.getDefaults(), arguments);
        super(options);
        this.name = "LFOStereoEffect";
        this._lfoL = new LFO({
            context: this.context,
            min: 0,
            max: 1,
        });
        this._lfoR = new LFO({
            context: this.context,
            min: 0,
            max: 1,
        });
        // control the frequency with a single signal
        this.frequency = new Signal({
            context: this.context,
            value: options.frequency,
            units: "frequency",
        });
        this.frequency.fan(this._lfoL.frequency, this._lfoR.frequency);
        readOnly(this, ["frequency"]);
        if (options.autostart) {
            this._onContextRunning(() => this.start(this.immediate()));
        }
    }
    static getDefaults() {
        return Object.assign(StereoEffect.getDefaults(), {
            frequency: 10,
            autostart: false,
        });
    }
    /**
     * Start the tremolo.
     */
    start(time) {
        this._lfoL.start(time);
        this._lfoR.start(time);
        return this;
    }
    /**
     * Stop the tremolo.
     */
    stop(time) {
        this._lfoL.stop(time);
        this._lfoR.stop(time);
        return this;
    }
    /**
     * Sync the effect to the transport.
     */
    sync() {
        this._lfoL.sync();
        this._lfoR.sync();
        this.context.transport.syncSignal(this.frequency);
        return this;
    }
    /**
     * Unsync the filter from the transport
     */
    unsync() {
        this._lfoL.unsync();
        this._lfoR.unsync();
        this.context.transport.unsyncSignal(this.frequency);
        return this;
    }
    /**
     * The oscillator type.
     */
    get type() {
        return this._lfoL.type;
    }
    set type(type) {
        this._lfoL.type = type;
        this._lfoR.type = type;
    }
    dispose() {
        super.dispose();
        this._lfoL.dispose();
        this._lfoR.dispose();
        this.frequency.dispose();
        return this;
    }
}
//# sourceMappingURL=LFOStereoEffect.js.map