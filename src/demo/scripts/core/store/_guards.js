/**
 * Checks whether a value can be wrapped in a proxy or traversed deeply.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isObject(value) {
	return value !== null && typeof value === "object";
}
