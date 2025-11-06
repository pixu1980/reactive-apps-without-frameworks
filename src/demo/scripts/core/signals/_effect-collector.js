import { withCollector } from "./_collector-context.js";
import { schedule } from "./_scheduler.js";

/**
 * Signal contract required by the effect dependency tracker.
 * @typedef {{ subscribe(subscriber: () => void): () => unknown }} TrackableSignal
 */

/**
 * Reactive effect runner that automatically tracks and resubscribes to accessed signals.
 */
export class EffectCollector {
	/**
	 * @param {() => void} callback
	 */
	constructor(callback) {
		/** @type {() => void} */
		this.callback = callback;
		/** @type {Map<TrackableSignal, () => unknown>} */
		this.dependencies = new Map();
		this.active = true;
		/** @type {() => void} */
		this.run = this.run.bind(this);
		this.run();
	}

	/**
	 * Records a dependency and schedules the effect when it changes.
	 * @param {TrackableSignal} signal
	 * @returns {void}
	 */
	addDependency(signal) {
		if (this.dependencies.has(signal)) return;

		const unsubscribe = signal.subscribe(() => schedule(this));
		this.dependencies.set(signal, unsubscribe);
	}

	/**
	 * Removes all active signal subscriptions.
	 * @returns {void}
	 */
	cleanup() {
		for (const unsubscribe of this.dependencies.values()) unsubscribe();
		this.dependencies.clear();
	}

	/**
	 * Re-runs the effect while collecting the fresh dependency graph.
	 * @returns {void}
	 */
	run() {
		if (!this.active) return;
		this.cleanup();
		withCollector(this, () => {
			this.callback();
		});
	}

	/**
	 * Permanently disables the effect and unsubscribes from all dependencies.
	 * @returns {void}
	 */
	stop() {
		this.active = false;
		this.cleanup();
	}
}
