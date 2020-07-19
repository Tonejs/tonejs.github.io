import { TicksClass } from "../type/Ticks";
import { TransportEvent } from "./TransportEvent";
/**
 * TransportRepeatEvent is an internal class used by Tone.Transport
 * to schedule repeat events. This class should not be instantiated directly.
 */
export class TransportRepeatEvent extends TransportEvent {
    /**
     * @param transport The transport object which the event belongs to
     */
    constructor(transport, opts) {
        super(transport, opts);
        /**
         * The ID of the current timeline event
         */
        this._currentId = -1;
        /**
         * The ID of the next timeline event
         */
        this._nextId = -1;
        /**
         * The time of the next event
         */
        this._nextTick = this.time;
        /**
         * a reference to the bound start method
         */
        this._boundRestart = this._restart.bind(this);
        const options = Object.assign(TransportRepeatEvent.getDefaults(), opts);
        this.duration = new TicksClass(transport.context, options.duration).valueOf();
        this._interval = new TicksClass(transport.context, options.interval).valueOf();
        this._nextTick = options.time;
        this.transport.on("start", this._boundRestart);
        this.transport.on("loopStart", this._boundRestart);
        this.context = this.transport.context;
        this._restart();
    }
    static getDefaults() {
        return Object.assign({}, TransportEvent.getDefaults(), {
            duration: Infinity,
            interval: 1,
            once: false,
        });
    }
    /**
     * Invoke the callback. Returns the tick time which
     * the next event should be scheduled at.
     * @param  time  The AudioContext time in seconds of the event
     */
    invoke(time) {
        // create more events if necessary
        this._createEvents(time);
        // call the super class
        super.invoke(time);
    }
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    _createEvents(time) {
        // schedule the next event
        const ticks = this.transport.getTicksAtTime(time);
        if (ticks >= this.time && ticks >= this._nextTick && this._nextTick + this._interval < this.time + this.duration) {
            this._nextTick += this._interval;
            this._currentId = this._nextId;
            this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
        }
    }
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    _restart(time) {
        this.transport.clear(this._currentId);
        this.transport.clear(this._nextId);
        this._nextTick = this.time;
        const ticks = this.transport.getTicksAtTime(time);
        if (ticks > this.time) {
            this._nextTick = this.time + Math.ceil((ticks - this.time) / this._interval) * this._interval;
        }
        this._currentId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
        this._nextTick += this._interval;
        this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this.transport.clear(this._currentId);
        this.transport.clear(this._nextId);
        this.transport.off("start", this._boundRestart);
        this.transport.off("loopStart", this._boundRestart);
        return this;
    }
}
//# sourceMappingURL=TransportRepeatEvent.js.map