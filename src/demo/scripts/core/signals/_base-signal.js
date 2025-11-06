import { getCurrentCollector } from "./_collector-context.js";

/**
 * Subscriber invoked when a signal changes.
 * @callback SignalSubscriber
 * @returns {void}
 */

/**
 * Base class for trackable reactive primitives.
 * @template T
 */
export class BaseSignal {
	/**
	 * @returns {void}
	 */
	constructor() {
		/** @type {Set<SignalSubscriber>} */
		this.subscribers = new Set();
		/** @type {true} */
		this.__isSignal = true;
	}

	/**
	 * Subscribes a callback to invalidation notifications.
	 * @param {SignalSubscriber} subscriber
	 * @returns {() => boolean}
	 */
	subscribe(subscriber) {
		this.subscribers.add(subscriber);

		return () => this.subscribers.delete(subscriber);
	}

	/**
	 * Registers the signal in the current collector when one is active.
	 * @returns {void}
	 */
	track() {
		const current = getCurrentCollector();

		if (current) current.addDependency(this);
	}

	/**
	 * Notifies all subscribers of the latest invalidation.
	 * @returns {void}
	 */
	notify() {
		for (const subscriber of [...this.subscribers]) subscriber();
	}
}
