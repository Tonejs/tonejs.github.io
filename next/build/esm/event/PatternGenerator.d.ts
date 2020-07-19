/**
 * The name of the patterns
 */
export declare type PatternName = "up" | "down" | "upDown" | "downUp" | "alternateUp" | "alternateDown" | "random" | "randomOnce" | "randomWalk";
/**
 * PatternGenerator returns a generator which will iterate over the given array
 * of values and yield the items according to the passed in pattern
 * @param values An array of values to iterate over
 * @param pattern The name of the pattern use when iterating over
 * @param index Where to start in the offset of the values array
 */
export declare function PatternGenerator<T>(values: T[], pattern?: PatternName, index?: number): Iterator<T>;
