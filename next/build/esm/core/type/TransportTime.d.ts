import { Seconds, Ticks } from "../type/Units";
import { TimeClass } from "./Time";
import { TimeBaseUnit, TimeValue } from "./TimeBase";
/**
 * TransportTime is a the time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
export declare class TransportTimeClass<Type extends Seconds | Ticks = Seconds> extends TimeClass<Type> {
    readonly name: string;
    /**
     * Return the current time in whichever context is relevant
     */
    protected _now(): Type;
}
/**
 * TransportTime is a the time along the Transport's
 * timeline. It is similar to [[Time]], but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
export declare function TransportTime(value?: TimeValue, units?: TimeBaseUnit): TransportTimeClass;
