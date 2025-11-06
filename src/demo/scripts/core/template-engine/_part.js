/**
 * Minimal signal contract required by DOM parts.
 * @typedef {{ get(): unknown, subscribe(subscriber: () => void): (() => unknown) }} PartSignal
 */

/**
 * Base class shared by attribute, property, and child node parts.
 */
export class Part {
	/**
	 * @returns {void}
	 */
	constructor() {
		this.value = undefined;
		/** @type {(() => unknown) | null} */
		this.signalCleanup = null;
	}

	/**
	 * Binds a signal to the part and keeps it in sync until disposed.
	 * @param {PartSignal} signal
	 * @param {(resolved: unknown) => void} callback
	 * @returns {void}
	 */
	bindSignal(signal, callback) {
		this.disposeSignal();
		this.signalCleanup = signal.subscribe(() => callback(signal.get()));
		callback(signal.get());
	}

	/**
	 * Removes the current signal subscription if one exists.
	 * @returns {void}
	 */
	disposeSignal() {
		if (this.signalCleanup) this.signalCleanup();
		this.signalCleanup = null;
	}
}
