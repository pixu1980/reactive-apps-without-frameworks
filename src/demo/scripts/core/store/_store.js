import { clonePlainValue, deepClone } from "./_clone.js";
import { isObject } from "./_guards.js";
import { pathToString, toPathArray } from "./_paths.js";

/**
 * Store path expressed as dot notation or as discrete path segments.
 * @typedef {string | number | symbol | Array<string | number | symbol>} StorePath
 */

/**
 * Options accepted by the proxy store.
 * @typedef {object} StoreOptions
 * @property {EventTarget} [eventsTarget]
 */

/**
 * Change detail emitted with each store mutation.
 * @typedef {object} StoreChangeDetail
 * @property {string} path
 * @property {unknown} oldValue
 * @property {unknown} newValue
 */

/**
 * Proxy based state container that emits immutable change payloads after each write.
 */
export class Store {
	/**
	 * @param {object} [initialState={}]
	 * @param {StoreOptions} [options={}]
	 */
	constructor(initialState = {}, options = {}) {
		/** @type {EventTarget} */
		this.events = options.eventsTarget ?? window;
		/** @type {object} */
		this.target = deepClone(initialState);
		/** @type {WeakMap<object, object>} */
		this.proxyCache = new WeakMap();
		/** @type {any} */
		this.state = this.createProxy(this.target, []);
	}

	/**
	 * Recursively wraps nested objects in stable proxies.
	 * @param {object} target
	 * @param {Array<string | number | symbol>} path
	 * @returns {any}
	 */
	createProxy(target, path) {
		if (!isObject(target)) return target;
		if (this.proxyCache.has(target)) return this.proxyCache.get(target);

		const proxy = new Proxy(target, {
			get: (raw, key, receiver) => {
				// Internal escape hatches are kept enumerable free and only exist for cloning helpers.
				if (key === "__raw") return raw;
				if (key === "__path") return path;
				const value = Reflect.get(raw, key, receiver);
				if (isObject(value)) return this.createProxy(value, [...path, key]);
				return value;
			},
			set: (raw, key, value, receiver) => {
				const nextPath = [...path, key];
				const oldValue = raw[key];
				const prepared = clonePlainValue(value);
				const result = Reflect.set(raw, key, prepared, receiver);
				if (oldValue !== prepared) {
					this.emitChange(nextPath, oldValue, prepared);
				}
				return result;
			},
			deleteProperty: (raw, key) => {
				if (!(key in raw)) return true;
				const nextPath = [...path, key];
				const oldValue = raw[key];
				const result = Reflect.deleteProperty(raw, key);
				this.emitChange(nextPath, oldValue, undefined);
				return result;
			},
		});

		this.proxyCache.set(target, proxy);
		return proxy;
	}

	/**
	 * Emits a store:change event with cloned payloads so listeners cannot mutate the store internals.
	 * @param {Array<string | number | symbol>} path
	 * @param {unknown} oldValue
	 * @param {unknown} newValue
	 * @returns {void}
	 */
	emitChange(path, oldValue, newValue) {
		/** @type {StoreChangeDetail} */
		const detail = {
			path: pathToString(path),
			oldValue: deepClone(oldValue),
			newValue: deepClone(newValue),
		};
		const event = new CustomEvent("store:change", { detail });
		this.events.dispatchEvent(event);
	}

	/**
	 * Reads a value by path from the proxied state tree.
	 * @param {StorePath | null | undefined} path
	 * @returns {unknown}
	 */
	get(path) {
		const parts = toPathArray(path);
		let current = this.state;
		for (const part of parts) {
			current = current?.[part];
		}
		return current;
	}

	/**
	 * Writes a value by path, creating missing intermediate objects when needed.
	 * @param {StorePath | null | undefined} path
	 * @param {unknown} value
	 * @returns {unknown}
	 */
	set(path, value) {
		const parts = toPathArray(path);
		if (!parts.length) throw new Error("Path is required");
		const last = parts.pop();
		let current = this.state;
		for (const part of parts) {
			if (!isObject(current[part])) current[part] = {};
			current = current[part];
		}
		current[last] = value;
		return value;
	}

	/**
	 * Updates a value by passing the current snapshot to an updater callback.
	 * @param {StorePath | null | undefined} path
	 * @param {(currentValue: unknown) => unknown} updater
	 * @returns {unknown}
	 */
	update(path, updater) {
		const currentValue = this.get(path);
		return this.set(path, updater(currentValue));
	}

	/**
	 * Replaces the entire state tree with a fresh proxy graph.
	 * @param {object} nextState
	 * @returns {void}
	 */
	replace(nextState) {
		const oldValue = deepClone(this.target);
		this.target = deepClone(nextState);
		this.proxyCache = new WeakMap();
		this.state = this.createProxy(this.target, []);
		this.emitChange([], oldValue, this.target);
	}

	/**
	 * Returns a deep cloned snapshot of the current store state.
	 * @returns {unknown}
	 */
	snapshot() {
		return deepClone(this.target);
	}
}
