import { assert } from "../core/util/Debug";
import { clamp } from "../core/util/Math";
/**
 * Start at the first value and go up to the last
 */
function* upPatternGen(values) {
    let index = 0;
    while (index < values.length) {
        index = clampToArraySize(index, values);
        yield values[index];
        index++;
    }
}
/**
 * Start at the last value and go down to 0
 */
function* downPatternGen(values) {
    let index = values.length - 1;
    while (index >= 0) {
        index = clampToArraySize(index, values);
        yield values[index];
        index--;
    }
}
/**
 * Infinitely yield the generator
 */
function* infiniteGen(values, gen) {
    while (true) {
        yield* gen(values);
    }
}
/**
 * Make sure that the index is in the given range
 */
function clampToArraySize(index, values) {
    return clamp(index, 0, values.length - 1);
}
/**
 * Alternate between two generators
 */
function* alternatingGenerator(values, directionUp) {
    let index = directionUp ? 0 : values.length - 1;
    while (true) {
        index = clampToArraySize(index, values);
        yield values[index];
        if (directionUp) {
            index++;
            if (index >= values.length - 1) {
                directionUp = false;
            }
        }
        else {
            index--;
            if (index <= 0) {
                directionUp = true;
            }
        }
    }
}
/**
 * Starting from the bottom move up 2, down 1
 */
function* jumpUp(values) {
    let index = 0;
    let stepIndex = 0;
    while (index < values.length) {
        index = clampToArraySize(index, values);
        yield values[index];
        stepIndex++;
        index += (stepIndex % 2 ? 2 : -1);
    }
}
/**
 * Starting from the top move down 2, up 1
 */
function* jumpDown(values) {
    let index = values.length - 1;
    let stepIndex = 0;
    while (index >= 0) {
        index = clampToArraySize(index, values);
        yield values[index];
        stepIndex++;
        index += (stepIndex % 2 ? -2 : 1);
    }
}
/**
 * Choose a random index each time
 */
function* randomGen(values) {
    while (true) {
        const randomIndex = Math.floor(Math.random() * values.length);
        yield values[randomIndex];
    }
}
/**
 * Randomly go through all of the values once before choosing a new random order
 */
function* randomOnce(values) {
    // create an array of indices
    const copy = [];
    for (let i = 0; i < values.length; i++) {
        copy.push(i);
    }
    while (copy.length > 0) {
        // random choose an index, and then remove it so it's not chosen again
        const randVal = copy.splice(Math.floor(copy.length * Math.random()), 1);
        const index = clampToArraySize(randVal[0], values);
        yield values[index];
    }
}
/**
 * Randomly choose to walk up or down 1 index in the values array
 */
function* randomWalk(values) {
    // randomly choose a starting index in the values array
    let index = Math.floor(Math.random() * values.length);
    while (true) {
        if (index === 0) {
            index++; // at bottom of array, so force upward step
        }
        else if (index === values.length - 1) {
            index--; // at top of array, so force downward step
        }
        else if (Math.random() < 0.5) { // else choose random downward or upward step
            index--;
        }
        else {
            index++;
        }
        yield values[index];
    }
}
/**
 * PatternGenerator returns a generator which will iterate over the given array
 * of values and yield the items according to the passed in pattern
 * @param values An array of values to iterate over
 * @param pattern The name of the pattern use when iterating over
 * @param index Where to start in the offset of the values array
 */
export function* PatternGenerator(values, pattern = "up", index = 0) {
    // safeguards
    assert(values.length > 0, "The array must have more than one value in it");
    switch (pattern) {
        case "up":
            yield* infiniteGen(values, upPatternGen);
        case "down":
            yield* infiniteGen(values, downPatternGen);
        case "upDown":
            yield* alternatingGenerator(values, true);
        case "downUp":
            yield* alternatingGenerator(values, false);
        case "alternateUp":
            yield* infiniteGen(values, jumpUp);
        case "alternateDown":
            yield* infiniteGen(values, jumpDown);
        case "random":
            yield* randomGen(values);
        case "randomOnce":
            yield* infiniteGen(values, randomOnce);
        case "randomWalk":
            yield* randomWalk(values);
    }
}
//# sourceMappingURL=PatternGenerator.js.map