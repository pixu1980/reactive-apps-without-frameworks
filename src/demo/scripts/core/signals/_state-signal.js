import { BaseSignal } from "./_base-signal.js";

/**
 * Mutable signal that stores a concrete value.
 * @template T
 * @extends {BaseSignal<T>}
 */
export class StateSignal extends BaseSignal {
	/**
	 * @param {T} value
	 * @param {{ equals?: (previousValue: T, nextValue: T) => boolean }} [options]
	 */
	constructor(value, options = {}) {
		super();
		/** @type {T} */
		this.value = value;
		/** @type {(previousValue: T, nextValue: T) => boolean} */
		this.equals = options.equals ?? Object.is;
	}

	/**
	 * Returns the tracked value.
	 * @returns {T}
	 */
	get() {
		this.track();
		return this.value;
	}

	/**
	 * Returns the current value without tracking.
	 * @returns {T}
	 */
	peek() {
		return this.value;
	}

	/**
	 * Updates the signal when the equality guard allows it.
	 * @param {T} nextValue
	 * @returns {T}
	 */
	set(nextValue) {
		if (this.equals(this.value, nextValue)) return this.value;
		this.value = nextValue;
		this.notify();

		return this.value;
	}
}
