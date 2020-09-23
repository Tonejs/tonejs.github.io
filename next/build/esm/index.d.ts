export { getContext, setContext } from "./core/Global";
export * from "./classes";
export * from "./version";
import { ToneAudioBuffer } from "./core/context/ToneAudioBuffer";
export { start } from "./core/Global";
import { Seconds } from "./core/type/Units";
export { supported } from "./core/context/AudioContext";
/**
 * The current audio context time of the global [[Context]].
 * See [[Context.now]]
 * @category Core
 */
export declare function now(): Seconds;
/**
 * The current audio context time of the global [[Context]] without the [[Context.lookAhead]]
 * See [[Context.immediate]]
 * @category Core
 */
export declare function immediate(): Seconds;
/**
 * The Transport object belonging to the global Tone.js Context.
 * See [[Transport]]
 * @category Core
 */
export declare const Transport: import("./core/clock/Transport").Transport;
/**
 * The Transport object belonging to the global Tone.js Context.
 * See [[Transport]]
 * @category Core
 */
export declare function getTransport(): import("./core/clock/Transport").Transport;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * See [[Destination]]
 * @category Core
 */
export declare const Destination: import("./core/context/Destination").Destination;
/**
 * @deprecated Use [[Destination]]
 */
export declare const Master: import("./core/context/Destination").Destination;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * See [[Destination]]
 * @category Core
 */
export declare function getDestination(): import("./core/context/Destination").Destination;
/**
 * The [[Listener]] belonging to the global Tone.js Context.
 * @category Core
 */
export declare const Listener: import("./core/context/Listener").Listener;
/**
 * The [[Listener]] belonging to the global Tone.js Context.
 * @category Core
 */
export declare function getListener(): import("./core/context/Listener").Listener;
/**
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * See [[Draw]]
 * @category Core
 */
export declare const Draw: import("./core/util/Draw").Draw;
/**
 * Get the singleton attached to the global context.
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * See [[Draw]]
 * @category Core
 */
export declare function getDraw(): import("./core/util/Draw").Draw;
/**
 * A reference to the global context
 * See [[Context]]
 */
export declare const context: import("./classes").BaseContext;
/**
 * Promise which resolves when all of the loading promises are resolved.
 * Alias for static [[ToneAudioBuffer.loaded]] method.
 * @category Core
 */
export declare function loaded(): Promise<void>;
import { ToneAudioBuffers } from "./core/context/ToneAudioBuffers";
import { ToneBufferSource } from "./source/buffer/ToneBufferSource";
export declare const Buffer: typeof ToneAudioBuffer;
export declare const Buffers: typeof ToneAudioBuffers;
export declare const BufferSource: typeof ToneBufferSource;
