import { noOp } from "../util/Interface";
/**
 * TransportEvent is an internal class used by [[Transport]]
 * to schedule events. Do no invoke this class directly, it is
 * handled from within Tone.Transport.
 */
export class TransportEvent {
    /**
     * @param transport The transport object which the event belongs to
     */
    constructor(transport, opts) {
        /**
         * The unique id of the event
         */
        this.id = TransportEvent._eventId++;
        const options = Object.assign(TransportEvent.getDefaults(), opts);
        this.transport = transport;
        this.callback = options.callback;
        this._once = options.once;
        this.time = options.time;
    }
    static getDefaults() {
        return {
            callback: noOp,
            once: false,
            time: 0,
        };
    }
    /**
     * Invoke the event callback.
     * @param  time  The AudioContext time in seconds of the event
     */
    invoke(time) {
        if (this.callback) {
            this.callback(time);
            if (this._once) {
                this.transport.clear(this.id);
            }
        }
    }
    /**
     * Clean up
     */
    dispose() {
        this.callback = undefined;
        return this;
    }
}
/**
 * Current ID counter
 */
TransportEvent._eventId = 0;
//# sourceMappingURL=TransportEvent.js.map