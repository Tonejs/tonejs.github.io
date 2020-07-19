export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/**
 * Make the property not writable using `defineProperty`. Internal use only.
 */
export declare function readOnly(target: object, property: string | string[]): void;
/**
 * Make an attribute writeable. Internal use only.
 */
export declare function writable(target: object, property: string | string[]): void;
export declare const noOp: (...args: any[]) => any;
/**
 * Recursive Partial taken from here: https://stackoverflow.com/a/51365037
 */
export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<RecursivePartial<U>> : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
/**
 * Recursive Omit modified from here: https://stackoverflow.com/a/54487392/1146428
 */
declare type OmitDistributive<T, K extends string | number> = T extends any ? (T extends object ? Id<RecursiveOmit<T, K>> : T) : never;
declare type Id<T> = {} & {
    [P in keyof T]: T[P];
};
export declare type RecursiveOmit<T extends any, K extends string | number> = Omit<{
    [P in keyof T]: OmitDistributive<T[P], K>;
}, K>;
export {};
