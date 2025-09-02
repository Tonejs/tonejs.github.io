export * from "./classes.js";
export { getContext, setContext } from "./core/Global.js";
export * from "./version.js";
import { ToneAudioBuffer } from "./core/context/ToneAudioBuffer.js";
export { start } from "./core/Global.js";
import { Seconds } from "./core/type/Units.js";
export { supported } from "./core/context/AudioContext.js";
import type { TransportInstance } from "./core/clock/Transport.js";
export type { TransportInstance } from "./core/clock/Transport.js";
import type { DestinationInstance } from "./core/context/Destination.js";
export type { DestinationInstance } from "./core/context/Destination.js";
import type { ListenerInstance } from "./core/context/Listener.js";
export type { ListenerInstance } from "./core/context/Listener.js";
import type { DrawInstance } from "./core/util/Draw.js";
export type { DrawInstance } from "./core/util/Draw.js";
/**
 * The current audio context time of the global {@link BaseContext}.
 * @see {@link Context.now}
 * @category Core
 */
export declare function now(): Seconds;
/**
 * The current audio context time of the global {@link Context} without the {@link Context.lookAhead}
 * @see {@link Context.immediate}
 * @category Core
 */
export declare function immediate(): Seconds;
/**
 * The Transport object belonging to the global Tone.js Context.
 * @see {@link TransportInstance}
 * @category Core
 * @deprecated Use {@link getTransport} instead
 */
export declare const Transport: TransportInstance;
/**
 * The Transport object belonging to the global Tone.js Context.
 * @see {@link TransportInstance}
 * @category Core
 */
export declare function getTransport(): TransportInstance;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * @see {@link DestinationInstance}
 * @category Core
 * @deprecated Use {@link getDestination} instead
 */
export declare const Destination: DestinationInstance;
/**
 * @deprecated Use {@link getDestination} instead
 */
export declare const Master: DestinationInstance;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * @see {@link DestinationInstance}
 * @category Core
 */
export declare function getDestination(): DestinationInstance;
/**
 * The {@link ListenerInstance} belonging to the global Tone.js Context.
 * @category Core
 * @deprecated Use {@link getListener} instead
 */
export declare const Listener: ListenerInstance;
/**
 * The {@link ListenerInstance} belonging to the global Tone.js Context.
 * @category Core
 */
export declare function getListener(): ListenerInstance;
/**
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * @see {@link DrawInstance}
 * @category Core
 * @deprecated Use {@link getDraw} instead
 */
export declare const Draw: DrawInstance;
/**
 * Get the singleton attached to the global context.
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * @see {@link DrawInstance}
 * @category Core
 */
export declare function getDraw(): DrawInstance;
/**
 * A reference to the global context
 * @see {@link Context}
 * @deprecated Use {@link getContext} instead
 */
export declare const context: import("./classes.js").BaseContext;
/**
 * Promise which resolves when all of the loading promises are resolved.
 * Alias for static {@link ToneAudioBuffer.loaded} method.
 * @category Core
 */
export declare function loaded(): Promise<void>;
import { ToneAudioBuffers } from "./core/context/ToneAudioBuffers.js";
import { ToneBufferSource } from "./source/buffer/ToneBufferSource.js";
/** @deprecated Use {@link ToneAudioBuffer} */
export declare const Buffer: typeof ToneAudioBuffer;
/** @deprecated Use {@link ToneAudioBuffers} */
export declare const Buffers: typeof ToneAudioBuffers;
/** @deprecated Use {@link ToneBufferSource} */
export declare const BufferSource: typeof ToneBufferSource;
