/**
 *
 * @returns {string[]}
 */
export function getArgs() {
    const rawArgs = process.argv;

    if (rawArgs.length < 3) {
        return [];
    }
    return rawArgs.slice(2);
}/**
 *
 * @param {number} x
 * @returns {number}
 */
export function alignOnK(x) {
    const r = x % 1024

    return r > 0 ? x + 1024 - r : x
}
/**
 *
 * @param {number} size
 * @returns
 */
export function alloc(size) {
    return Buffer.alloc(size)
}

