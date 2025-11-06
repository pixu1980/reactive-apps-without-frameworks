import { isObject } from "./_guards.js";

/**
 * Unwraps proxy values before cloning them.
 * @template T
 * @param {T} value
 * @returns {T}
 */
function getRawValue(value) {
	if (!isObject(value)) return value;
	return value.__raw ?? value;
}

/**
 * Deeply clones plain serializable values while preserving Maps, Sets, Dates, and RegExps.
 * @template T
 * @param {T} value
 * @param {WeakMap<object, unknown>} [seen]
 * @returns {T}
 */
export function clonePlainValue(value, seen = new WeakMap()) {
	const raw = getRawValue(value);

	if (!isObject(raw)) return raw;
	if (seen.has(raw)) return seen.get(raw);

	if (raw instanceof Date) return new Date(raw.getTime());
	if (raw instanceof RegExp) return new RegExp(raw.source, raw.flags);
	if (raw instanceof Map) {
		const next = new Map();
		seen.set(raw, next);
		for (const [key, entryValue] of raw.entries()) {
			next.set(clonePlainValue(key, seen), clonePlainValue(entryValue, seen));
		}
		return next;
	}
	if (raw instanceof Set) {
		const next = new Set();
		seen.set(raw, next);
		for (const entry of raw.values()) {
			next.add(clonePlainValue(entry, seen));
		}
		return next;
	}
	if (Array.isArray(raw)) {
		const next = [];
		seen.set(raw, next);
		for (const entry of raw) {
			next.push(clonePlainValue(entry, seen));
		}
		return next;
	}

	const next = {};
	seen.set(raw, next);
	for (const key of Reflect.ownKeys(raw)) {
		const descriptor = Object.getOwnPropertyDescriptor(raw, key);
		if (!descriptor?.enumerable) continue;
		next[key] = clonePlainValue(raw[key], seen);
	}
	return next;
}

/**
 * Convenience wrapper used by the store when it needs a fresh immutable snapshot.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function deepClone(value) {
	return clonePlainValue(value);
}
