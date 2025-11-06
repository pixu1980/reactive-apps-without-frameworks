/**
 * Converts a dot notation path into an array of path segments.
 * @param {string | number | symbol | Array<string | number | symbol> | null | undefined} path
 * @returns {Array<string | number | symbol>}
 */
export function toPathArray(path) {
	if (Array.isArray(path)) return path;
	if (path == null || path === "") return [];
	return String(path).split(".").filter(Boolean);
}

/**
 * Serializes a path back to dot notation for change events.
 * @param {string | number | symbol | Array<string | number | symbol> | null | undefined} path
 * @returns {string}
 */
export function pathToString(path) {
	return toPathArray(path).join(".");
}
