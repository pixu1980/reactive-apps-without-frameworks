import { withoutCollector } from "./_collector-context.js";
import { ComputedSignal } from "./_computed-signal.js";
import { EffectCollector } from "./_effect-collector.js";
import { StateSignal } from "./_state-signal.js";

/**
 * Trackable reactive value exposed by the signal layer.
 * @template T
 * @typedef {object} SignalLike
 * @property {true} __isSignal
 * @property {() => T} get
 * @property {(() => T) | undefined} [peek]
 * @property {(subscriber: () => void) => (() => unknown)} subscribe
 */

/**
 * Public signal constructors and low level helpers.
 */
export const Signal = {
	State: StateSignal,
	Computed: ComputedSignal,
	subtle: {
		untrack: withoutCollector,
	},
};

/**
 * Checks whether a value implements the signal contract expected by the renderer.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isSignalLike(value) {
	return Boolean(value && typeof value.get === "function" && value.__isSignal);
}

/**
 * Creates a tracked side effect and returns a disposer.
 * @param {() => void} callback
 * @returns {() => void}
 */
export function effect(callback) {
	const runner = new EffectCollector(callback);
	return () => runner.stop();
}
