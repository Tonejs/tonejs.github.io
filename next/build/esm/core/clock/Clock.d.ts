import { ToneWithContext, ToneWithContextOptions } from "../context/ToneWithContext.js";
import { Frequency, Hertz, Seconds, Ticks, Time } from "../type/Units.js";
import { Emitter } from "../util/Emitter.js";
import { PlaybackState } from "../util/StateTimeline.js";
import { TickSignal } from "./TickSignal.js";
type ClockCallback = (time: Seconds, ticks?: Ticks) => void;
interface ClockOptions extends ToneWithContextOptions {
    frequency: Hertz;
    callback: ClockCallback;
    units: "hertz" | "bpm";
}
type ClockEvent = "start" | "stop" | "pause";
/**
 * A sample-accurate clock that provides a callback at a given rate.
 *
 * While the callback is not sample-accurate (it is susceptible to
 * loose JavaScript timing), the time passed to the callback is precise.
 *
 * For most applications, it is better to use {@link Transport} instead of the
 * Clock by itself, since you can synchronize multiple callbacks.
 *
 * @example
 * // The callback will be invoked approximately once a second,
 * // and it will print the time exactly one second apart.
 * const clock = new Tone.Clock(time => {
 * 	console.log(time);
 * }, 1);
 * clock.start();
 * @category Core
 */
export declare class Clock<TypeName extends "bpm" | "hertz" = "hertz"> extends ToneWithContext<ClockOptions> implements Emitter<ClockEvent> {
    readonly name: string;
    /**
     * The callback function to invoke at the scheduled tick.
     */
    callback: ClockCallback;
    /**
     * The tick counter
     */
    private _tickSource;
    /**
     * The last time the loop callback was invoked
     */
    private _lastUpdate;
    /**
     * Keep track of the playback state
     */
    private _state;
    /**
     * Context bound reference to the _loop method
     * This is necessary to remove the event in the end.
     */
    private _boundLoop;
    /**
     * The rate the callback function should be invoked.
     */
    frequency: TickSignal<TypeName>;
    /**
     * @param callback The callback to be invoked with the time of the audio event
     * @param frequency The rate of the callback
     */
    constructor(callback?: ClockCallback, frequency?: Frequency);
    constructor(options: Partial<ClockOptions>);
    static getDefaults(): ClockOptions;
    /**
     * The playback state of the clock, either "started", "stopped", or "paused".
     */
    get state(): PlaybackState;
    /**
     * Start the clock at the given time.
     * @param time The time the clock should start.
     * @param offset The number of ticks to start the clock from.
     */
    start(time?: Time, offset?: Ticks): this;
    /**
     * Stop the clock. Stopping the clock resets the tick counter to 0.
     * @param time The time when the clock should stop.
     * @example
     * const clock = new Tone.Clock(time => {
     * 	console.log(time);
     * }, 1);
     * clock.start();
     * // Stop the clock after 10 seconds.
     * clock.stop("+10");
     */
    stop(time?: Time): this;
    /**
     * Pause the clock. Pausing does not reset the tick counter.
     * @param time The time when the clock should pause.
     */
    pause(time?: Time): this;
    /**
     * The number of times the callback has been invoked.
     *
     * Starts counting at 0 and increments after the callback is invoked.
     */
    get ticks(): Ticks;
    set ticks(t: Ticks);
    /**
     * The time since ticks=0 that the clock has been running.
     *
     * Accounts for tempo curves.
     */
    get seconds(): Seconds;
    set seconds(s: Seconds);
    /**
     * Return the elapsed seconds at the given time.
     * @param time When to get the elapsed seconds.
     * @return The number of elapsed seconds.
     */
    getSecondsAtTime(time: Time): Seconds;
    /**
     * Set the clock's ticks at the given time.
     * @param ticks The tick value to set.
     * @param time When to set the tick value.
     */
    setTicksAtTime(ticks: Ticks, time: Time): this;
    /**
     * Get the time of the given tick.
     *
     * The second argument is when to test before. Since ticks can be set
     * (with {@link setTicksAtTime}), there may be multiple times for a given
     * tick value.
     *
     * @param tick The tick number.
     * @param before When to measure the tick value from.
     * @return The time of the tick
     */
    getTimeOfTick(tick: Ticks, before?: number): Seconds;
    /**
     * Get the clock's ticks at the given time.
     * @param time When to get the tick value.
     * @return The tick value at the given time.
     */
    getTicksAtTime(time?: Time): Ticks;
    /**
     * Get the time of the next tick.
     * @param offset The tick number.
     */
    nextTickTime(offset: Ticks, when: Time): Seconds;
    /**
     * The scheduling loop.
     */
    private _loop;
    /**
     * Returns the scheduled state at the given time.
     * @param  time  The time to query.
     * @return  The name of the state input in setStateAtTime.
     * @example
     * const clock = new Tone.Clock();
     * clock.start("+0.1");
     * clock.getStateAtTime("+0.1"); // returns "started"
     */
    getStateAtTime(time: Time): PlaybackState;
    /**
     * Clean up
     */
    dispose(): this;
    on: (event: ClockEvent, callback: (...args: any[]) => void) => this;
    once: (event: ClockEvent, callback: (...args: any[]) => void) => this;
    off: (event: ClockEvent, callback?: ((...args: any[]) => void) | undefined) => this;
    emit: (event: any, ...args: any[]) => this;
}
export {};
