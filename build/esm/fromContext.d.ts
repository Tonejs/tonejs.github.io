import * as Classes from "./classes";
import { Transport } from "./core/clock/Transport";
import { Context } from "./core/context/Context";
import { Listener } from "./core/context/Listener";
import { Destination } from "./core/context/Destination";
import { Draw } from "./core/util/Draw";
declare type ClassesWithoutSingletons = Omit<typeof Classes, "Transport" | "Destination" | "Draw">;
/**
 * The exported Tone object. Contains all of the classes that default
 * to the same context and contains a singleton Transport and Destination node.
 */
declare type Tone = {
    Transport: Transport;
    Destination: Destination;
    Listener: Listener;
    Draw: Draw;
    context: Context;
    now: () => number;
    immediate: () => number;
} & ClassesWithoutSingletons;
/**
 * Return an object with all of the classes bound to the passed in context
 * @param context The context to bind all of the nodes to
 */
export declare function fromContext(context: Context): Tone;
export {};
