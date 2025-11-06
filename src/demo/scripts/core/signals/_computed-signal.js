import { withCollector } from "./_collector-context.js";
import { BaseSignal } from "./_base-signal.js";

/**
 * Options controlling computed signal invalidation.
 * @template T
 * @typedef {object} ComputedSignalOptions
 * @property {(previousValue: T | undefined, nextValue: T) => boolean} [equals]
 */

/**
 * Derived signal that lazily recomputes its value when one of its dependencies changes.
 * @template T
 * @extends {BaseSignal<T>}
 */
export class ComputedSignal extends BaseSignal {
	/**
	 * @param {() => T} compute
	 * @param {ComputedSignalOptions<T>} [options]
	 */
	constructor(compute, options = {}) {
		super();
		/** @type {() => T} */
		this.compute = compute;
		/** @type {(previousValue: T | undefined, nextValue: T) => boolean} */
		this.equals = options.equals ?? Object.is;
		/** @type {Map<unknown, () => unknown>} */
		this.dependencies = new Map();
		/** @type {T | undefined} */
		this.cached = undefined;
		this.dirty = true;
		this.recomputing = false;
		/** @type {() => void} */
		this.boundInvalidate = this.invalidate.bind(this);
	}

	/**
	 * Records a dependency and subscribes once to its invalidation channel.
	 * @param {{ subscribe(subscriber: () => void): () => unknown }} signal
	 * @returns {void}
	 */
	addDependency(signal) {
		if (this.dependencies.has(signal)) return;

		const unsubscribe = signal.subscribe(this.boundInvalidate);
		this.dependencies.set(signal, unsubscribe);
	}

	/**
	 * Removes subscriptions to the previous dependency graph before recomputing.
	 * @returns {void}
	 */
	cleanupDependencies() {
		for (const unsubscribe of this.dependencies.values()) unsubscribe();
		this.dependencies.clear();
	}

	/**
	 * Marks the computed value as stale and propagates the invalidation downstream.
	 * @returns {void}
	 */
	invalidate() {
		if (this.dirty) return;

		this.dirty = true;
		this.notify();
	}

	/**
	 * Recomputes the cached value when needed.
	 * @returns {T}
	 */
	evaluate() {
		if (!this.dirty) return /** @type {T} */ (this.cached);
		if (this.recomputing) return /** @type {T} */ (this.cached);

		this.recomputing = true;
		this.cleanupDependencies();

		try {
			const nextValue = withCollector(this, () => this.compute());

			if (this.dirty || !this.equals(this.cached, nextValue)) {
				this.cached = nextValue;
			}

			this.dirty = false;

			return /** @type {T} */ (this.cached);
		} finally {
			this.recomputing = false;
		}
	}

	/**
	 * Returns the tracked computed value.
	 * @returns {T}
	 */
	get() {
		this.track();
		return this.evaluate();
	}

	/**
	 * Returns the computed value without adding the current collector as a dependency.
	 * @returns {T}
	 */
	peek() {
		return this.evaluate();
	}
}
