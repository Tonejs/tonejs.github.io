import { Tone } from "../Tone.js";
import { Timeline } from "./Timeline.js";
/**
 * Represents a single value which is gettable and settable in a timed way
 */
export class TimelineValue extends Tone {
    /**
     * @param initialValue The value to return if there is no scheduled values
     */
    constructor(initialValue) {
        super();
        this.name = "TimelineValue";
        /**
         * The timeline which stores the values
         */
        this._timeline = new Timeline({
            memory: 10,
        });
        this._initialValue = initialValue;
    }
    /**
     * Set the value at the given time
     */
    set(value, time) {
        this._timeline.add({
            value,
            time,
        });
        return this;
    }
    /**
     * Get the value at the given time
     */
    get(time) {
        var _a;
        const event = this._timeline.get(time);
        return (_a = event === null || event === void 0 ? void 0 : event.value) !== null && _a !== void 0 ? _a : this._initialValue;
    }
}
//# sourceMappingURL=TimelineValue.js.map