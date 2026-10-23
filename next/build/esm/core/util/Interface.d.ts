export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/**
 * Make the property not writable using `defineProperty`. Internal use only.
 */
export declare function readOnly<T extends object>(target: T, property: keyof T | (keyof T)[]): void;
/**
 * Make an attribute writeable. Internal use only.
 */
export declare function writable<T extends object>(target: T, property: keyof T | (keyof T)[]): void;
export declare const noOp: (...args: any[]) => any;
/**
 * Recursive Partial taken from here: https://stackoverflow.com/a/51365037
 */
export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<RecursivePartial<U>> : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
