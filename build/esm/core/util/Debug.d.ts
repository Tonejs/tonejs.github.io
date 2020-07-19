/**
 * Assert that the statement is true, otherwise invoke the error.
 * @param statement
 * @param error The message which is passed into an Error
 */
export declare function assert(statement: boolean, error: string): void;
/**
 * Make sure that the given value is within the range
 */
export declare function assertRange(value: number, gte: number, lte?: number): void;
/**
 * Make sure that the given value is within the range
 */
export declare function assertContextRunning(context: import("../context/BaseContext").BaseContext): void;
/**
 * A basic logging interface
 */
interface Logger {
    log: (args?: any[]) => void;
    warn: (args?: any[]) => void;
}
/**
 * Set the logging interface
 */
export declare function setLogger(logger: Logger): void;
/**
 * Log anything
 */
export declare function log(...args: any[]): void;
/**
 * Warn anything
 */
export declare function warn(...args: any[]): void;
export {};
