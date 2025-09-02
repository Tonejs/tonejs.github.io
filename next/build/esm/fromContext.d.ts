import * as Classes from "./classes.js";
import { TransportInstance } from "./core/clock/Transport.js";
import { Context } from "./core/context/Context.js";
import { DestinationInstance } from "./core/context/Destination.js";
import { ListenerInstance } from "./core/context/Listener.js";
import { DrawInstance } from "./core/util/Draw.js";
type ClassesWithoutSingletons = Omit<typeof Classes, "Transport" | "Destination" | "Draw">;
/**
 * The exported Tone object. Contains all of the classes that default
 * to the same context and contains a singleton Transport and Destination node.
 */
type ToneObject = {
    Transport: TransportInstance;
    Destination: DestinationInstance;
    Listener: ListenerInstance;
    Draw: DrawInstance;
    context: Context;
    now: () => number;
    immediate: () => number;
} & ClassesWithoutSingletons;
/**
 * Return an object with all of the classes bound to the passed in context
 * @param context The context to bind all of the nodes to
 */
export declare function fromContext(context: Context): ToneObject;
export {};
