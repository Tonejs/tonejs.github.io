import { getContext } from "../Global.js";
import { isDefined } from "../util/TypeCheck.js";
import { TimeClass } from "./Time.js";
/**
 * TransportTime is a time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
export class TransportTimeClass extends TimeClass {
    constructor() {
        super(...arguments);
        this.name = "TransportTime";
    }
    /**
     * Return the current time in whichever context is relevant
     */
    _now() {
        return this.context.transport.seconds;
    }
    /**
     * Return the time in ticks.
     */
    toTicks() {
        if (isDefined(this._val)) {
            return super.toTicks();
        }
        // read the transport's actual current tick instead of re-deriving it
        // from elapsed seconds at the current bpm, which ignores tempo changes.
        // round up to the next tick since the current one may already be
        // in the middle of being processed by the clock.
        const transport = this.context.transport;
        return Math.ceil(transport.getTicksAtTime(transport.now()));
    }
    _getExpressions() {
        const expressions = super._getExpressions();
        // Override the quantize ("@") handler so that it returns Transport time
        // instead of AudioContext time.
        expressions.quantize = {
            method: (capture) => {
                const quantTo = new TimeClass(this.context, capture).valueOf();
                const nextSubdivisionAudioTime = this.context.transport.nextSubdivision(quantTo);
                return this._secondsToUnits(this.context.transport.getSecondsAtTime(nextSubdivisionAudioTime));
            },
            regexp: /^@(.+)/,
        };
        return expressions;
    }
}
/**
 * TransportTime is a time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
export function TransportTime(value, units) {
    return new TransportTimeClass(getContext(), value, units);
}
//# sourceMappingURL=TransportTime.js.map