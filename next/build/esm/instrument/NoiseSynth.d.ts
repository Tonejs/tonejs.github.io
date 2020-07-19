import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { NormalRange, Time } from "../core/type/Units";
import { RecursivePartial } from "../core/util/Interface";
import { Noise, NoiseOptions } from "../source/Noise";
import { Instrument, InstrumentOptions } from "./Instrument";
import { ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { EnvelopeOptions } from "../component/envelope/Envelope";
export interface NoiseSynthOptions extends InstrumentOptions {
    envelope: Omit<EnvelopeOptions, keyof ToneAudioNodeOptions>;
    noise: Omit<NoiseOptions, keyof ToneAudioNodeOptions>;
}
/**
 * Tone.NoiseSynth is composed of [[Noise]] through an [[AmplitudeEnvelope]].
 * ```
 * +-------+   +-------------------+
 * | Noise +>--> AmplitudeEnvelope +>--> Output
 * +-------+   +-------------------+
 * ```
 * @example
 * const noiseSynth = new Tone.NoiseSynth().toDestination();
 * noiseSynth.triggerAttackRelease("8n", 0.05);
 * @category Instrument
 */
export declare class NoiseSynth extends Instrument<NoiseSynthOptions> {
    readonly name = "NoiseSynth";
    /**
     * The noise source.
     */
    readonly noise: Noise;
    /**
     * The amplitude envelope.
     */
    readonly envelope: AmplitudeEnvelope;
    constructor(options?: RecursivePartial<NoiseSynthOptions>);
    static getDefaults(): NoiseSynthOptions;
    /**
     * Start the attack portion of the envelopes. Unlike other
     * instruments, Tone.NoiseSynth doesn't have a note.
     * @example
     * const noiseSynth = new Tone.NoiseSynth().toDestination();
     * noiseSynth.triggerAttack();
     */
    triggerAttack(time?: Time, velocity?: NormalRange): this;
    /**
     * Start the release portion of the envelopes.
     */
    triggerRelease(time?: Time): this;
    sync(): this;
    triggerAttackRelease(duration: Time, time?: Time, velocity?: NormalRange): this;
    dispose(): this;
}
