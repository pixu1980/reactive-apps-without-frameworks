/**
 * Collector capable of subscribing itself to the signals it reads.
 * @typedef {{ addDependency(signal: unknown): void }} DependencyCollector
 */

/** @type {DependencyCollector[]} */
const collectorStack = [];

/**
 * Returns the collector currently tracking signal reads, if any.
 * @returns {DependencyCollector | undefined}
 */
export function getCurrentCollector() {
	return collectorStack[collectorStack.length - 1];
}

/**
 * Pushes a collector on the active tracking stack.
 * @param {DependencyCollector} collector
 * @returns {void}
 */
export function pushCollector(collector) {
	collectorStack.push(collector);
}

/**
 * Removes and returns the current collector.
 * @returns {DependencyCollector | undefined}
 */
export function popCollector() {
	return collectorStack.pop();
}

/**
 * Runs a callback while a collector is active.
 * @template T
 * @param {DependencyCollector} collector
 * @param {() => T} callback
 * @returns {T}
 */
export function withCollector(collector, callback) {
	pushCollector(collector);
	try {
		return callback();
	} finally {
		popCollector();
	}
}

/**
 * Runs a callback without tracking the reads performed inside it.
 * @template T
 * @param {() => T} callback
 * @returns {T}
 */
export function withoutCollector(callback) {
	const current = popCollector();
	try {
		return callback();
	} finally {
		if (current) pushCollector(current);
	}
}
