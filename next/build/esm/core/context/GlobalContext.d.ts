import { BaseContext } from "./BaseContext.js";
/**
 * This dummy context is used to avoid throwing immediate errors when importing in Node.js
 */
export declare const dummyContext: BaseContext;
/**
 * Returns the default system-wide {@link Context}.
 * Auto-initializes a real Context in browser environments.
 */
export declare function getContext(): BaseContext;
/**
 * Set the global context directly. Unlike the richer `setContext` in Global.ts,
 * this only accepts a {@link BaseContext} — no native AudioContext wrapping.
 */
export declare function setContext(context: BaseContext): void;
