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
 * See [[TransportClass]]
 * @category Core
 * @deprecated Use {@link getTransport} instead
 */
export declare const Transport: import("./core/clock/Transport").TransportClass;
/**
 * The Transport object belonging to the global Tone.js Context.
 * See [[TransportClass]]
 * @category Core
 */
export declare function getTransport(): import("./core/clock/Transport").TransportClass;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * See [[DestinationClass]]
 * @category Core
 * @deprecated Use {@link getDestination} instead
 */
export declare const Destination: import("./core/context/Destination").DestinationClass;
/**
 * @deprecated Use {@link getDestination} instead
 */
export declare const Master: import("./core/context/Destination").DestinationClass;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * See [[DestinationClass]]
 * @category Core
 */
export declare function getDestination(): import("./core/context/Destination").DestinationClass;
/**
 * The [[ListenerClass]] belonging to the global Tone.js Context.
 * @category Core
 * @deprecated Use {@link getListener} instead
 */
export declare const Listener: import("./core/context/Listener").ListenerClass;
/**
 * The [[ListenerClass]] belonging to the global Tone.js Context.
 * @category Core
 */
export declare function getListener(): import("./core/context/Listener").ListenerClass;
/**
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * See [[DrawClass]]
 * @category Core
 * @deprecated Use {@link getDraw} instead
 */
export declare const Draw: import("./core/util/Draw").DrawClass;
/**
 * Get the singleton attached to the global context.
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * See [[DrawClass]]
 * @category Core
 */
export declare function getDraw(): import("./core/util/Draw").DrawClass;
/**
 * A reference to the global context
 * See [[Context]]
 * @deprecated Use {@link getContext} instead
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
/** @deprecated Use {@link ToneAudioBuffer} */
export declare const Buffer: typeof ToneAudioBuffer;
/** @deprecated Use {@link ToneAudioBuffers} */
export declare const Buffers: typeof ToneAudioBuffers;
/** @deprecated Use {@link ToneBufferSource} */
export declare const BufferSource: typeof ToneBufferSource;
