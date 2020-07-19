import { AudioContext as stdAudioContext, AudioWorkletNode as stdAudioWorkletNode, OfflineAudioContext as stdOfflineAudioContext } from "standardized-audio-context";
import { assert } from "../util/Debug";
import { isDefined } from "../util/TypeCheck";
/**
 * Create a new AudioContext
 */
export function createAudioContext(options) {
    return new stdAudioContext(options);
}
/**
 * Create a new OfflineAudioContext
 */
export function createOfflineAudioContext(channels, length, sampleRate) {
    return new stdOfflineAudioContext(channels, length, sampleRate);
}
/**
 * A reference to the window object
 * @hidden
 */
export const theWindow = typeof self === "object" ? self : null;
/**
 * If the browser has a window object which has an AudioContext
 * @hidden
 */
export const hasAudioContext = theWindow &&
    (theWindow.hasOwnProperty("AudioContext") || theWindow.hasOwnProperty("webkitAudioContext"));
export function createAudioWorkletNode(context, name, options) {
    assert(isDefined(stdAudioWorkletNode), "This node only works in a secure context (https or localhost)");
    // @ts-ignore
    return new stdAudioWorkletNode(context, name, options);
}
/**
 * This promise resolves to a boolean which indicates if the
 * functionality is supported within the currently used browse.
 * Taken from [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context#issupported)
 */
export { isSupported as supported } from "standardized-audio-context";
//# sourceMappingURL=AudioContext.js.map