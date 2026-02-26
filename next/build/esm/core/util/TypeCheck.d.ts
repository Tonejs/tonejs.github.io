import { Note } from "../type/Units.js";
/**
 * Test if the arg is undefined
 */
export declare function isUndef(arg: unknown): arg is undefined;
/**
 * Test if the arg is not undefined
 */
export declare function isDefined<T>(arg: T | undefined): arg is T;
/**
 * Test if the arg is a function
 */
export declare function isFunction(arg: unknown): arg is (a: any) => any;
/**
 * Test if the argument is a number.
 */
export declare function isNumber(arg: unknown): arg is number;
/**
 * Test if the given argument is an object literal (i.e. `{}`);
 */
export declare function isObject(arg: unknown): arg is object;
/**
 * Test if the argument is a boolean.
 */
export declare function isBoolean(arg: unknown): arg is boolean;
/**
 * Test if the argument is an Array
 */
export declare function isArray(arg: unknown): arg is any[];
/**
 * Test if the argument is a string.
 */
export declare function isString(arg: unknown): arg is string;
/**
 * Test if the argument is in the form of a note in scientific pitch notation.
 * e.g. "C4"
 */
export declare function isNote(arg: unknown): arg is Note;
