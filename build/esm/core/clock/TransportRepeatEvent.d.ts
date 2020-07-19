import { BaseContext } from "../context/BaseContext";
import { Seconds, Ticks } from "../type/Units";
import { TransportEvent, TransportEventOptions } from "./TransportEvent";
declare type Transport = import("../clock/Transport").Transport;
interface TransportRepeatEventOptions extends TransportEventOptions {
    interval: Ticks;
    duration: Ticks;
}
/**
 * TransportRepeatEvent is an internal class used by Tone.Transport
 * to schedule repeat events. This class should not be instantiated directly.
 */
export declare class TransportRepeatEvent extends TransportEvent {
    /**
     * When the event should stop repeating
     */
    private duration;
    /**
     * The interval of the repeated event
     */
    private _interval;
    /**
     * The ID of the current timeline event
     */
    private _currentId;
    /**
     * The ID of the next timeline event
     */
    private _nextId;
    /**
     * The time of the next event
     */
    private _nextTick;
    /**
     * a reference to the bound start method
     */
    private _boundRestart;
    /**
     * The audio context belonging to this event
     */
    protected context: BaseContext;
    /**
     * @param transport The transport object which the event belongs to
     */
    constructor(transport: Transport, opts: Partial<TransportRepeatEventOptions>);
    static getDefaults(): TransportRepeatEventOptions;
    /**
     * Invoke the callback. Returns the tick time which
     * the next event should be scheduled at.
     * @param  time  The AudioContext time in seconds of the event
     */
    invoke(time: Seconds): void;
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    private _createEvents;
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    private _restart;
    /**
     * Clean up
     */
    dispose(): this;
}
export {};
