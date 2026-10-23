import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import { Signal } from "../signal/Signal.js";
import { LFOStereoEffect } from "./LFOStereoEffect.js";
/**
 * Phaser is a phaser effect. Phasers work by changing the phase
 * of different frequency components of an incoming signal. Read more on
 * [Wikipedia](https://en.wikipedia.org/wiki/Phaser_(effect)).
 * Inspiration for this phaser comes from [Tuna.js](https://github.com/Dinahmoe/tuna/).
 * @example
 * const phaser = new Tone.Phaser({
 * 	frequency: 15,
 * 	octaves: 5,
 * 	baseFrequency: 1000
 * }).toDestination();
 * const synth = new Tone.FMSynth().connect(phaser);
 * synth.triggerAttackRelease("E3", "2n");
 * @category Effect
 */
export class Phaser extends LFOStereoEffect {
    constructor() {
        const options = optionsFromArguments(Phaser.getDefaults(), arguments, [
            "frequency",
            "octaves",
            "baseFrequency",
        ]);
        super(options);
        this.name = "Phaser";
        this._lfoR.phase = 180;
        this._baseFrequency = this.toFrequency(options.baseFrequency);
        this._octaves = options.octaves;
        this.Q = new Signal({
            context: this.context,
            value: options.Q,
            units: "positive",
        });
        this._filtersL = this._makeFilters(options.stages, this._lfoL);
        this._filtersR = this._makeFilters(options.stages, this._lfoR);
        // connect them up
        this.connectEffectLeft(...this._filtersL);
        this.connectEffectRight(...this._filtersR);
        // set the options
        this.baseFrequency = options.baseFrequency;
        this.octaves = options.octaves;
        readOnly(this, ["Q"]);
    }
    static getDefaults() {
        return Object.assign(LFOStereoEffect.getDefaults(), {
            frequency: 0.5,
            octaves: 3,
            stages: 10,
            Q: 10,
            baseFrequency: 350,
            autostart: true,
        });
    }
    _makeFilters(stages, connectToFreq) {
        const filters = [];
        // make all the filters
        for (let i = 0; i < stages; i++) {
            const filter = this.context.createBiquadFilter();
            filter.type = "allpass";
            this.Q.connect(filter.Q);
            connectToFreq.connect(filter.frequency);
            filters.push(filter);
        }
        return filters;
    }
    /**
     * The number of octaves the phase goes above the baseFrequency
     */
    get octaves() {
        return this._octaves;
    }
    set octaves(octaves) {
        this._octaves = octaves;
        const max = this._baseFrequency * Math.pow(2, octaves);
        this._lfoL.max = max;
        this._lfoR.max = max;
    }
    /**
     * The the base frequency of the filters.
     */
    get baseFrequency() {
        return this._baseFrequency;
    }
    set baseFrequency(freq) {
        this._baseFrequency = this.toFrequency(freq);
        this._lfoL.min = this._baseFrequency;
        this._lfoR.min = this._baseFrequency;
        this.octaves = this._octaves;
    }
    dispose() {
        super.dispose();
        this.Q.dispose();
        this._filtersL.forEach((f) => f.disconnect());
        this._filtersR.forEach((f) => f.disconnect());
        return this;
    }
}
//# sourceMappingURL=Phaser.js.map