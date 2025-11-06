import { Signal, Store } from "../core/index.js";
import { createSeedData } from "../data/index.js";

/** @typedef {import("../data/_data.js").DebugLogEntry} DebugLogEntry */
/** @typedef {import("../data/_data.js").DemoState} DemoState */

const STORAGE_KEY = "vanilla-signals-demo-state-v1";
const MAX_DEBUG_LOG_ENTRIES = 30;

/**
 * Shape emitted by the proxy store on every mutation.
 * @typedef {object} StoreChangeDetail
 * @property {string} path
 * @property {unknown} oldValue
 * @property {unknown} newValue
 */

/**
 * Reads the persisted state when available and falls back to the seed data on malformed payloads.
 * @returns {DemoState}
 */
function readInitialState() {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (!saved) return createSeedData();

	try {
		return /** @type {DemoState} */ (JSON.parse(saved));
	} catch {
		return createSeedData();
	}
}

export const store = new Store(readInitialState());

/**
 * Signal bumped after each committed mutation to refresh model bindings and computed views.
 */
export const appVersion = new Signal.State(0, { equals: () => false });

let isWritingDebugLog = false;

/**
 * Appends the latest store mutation to the debug panel.
 * @param {StoreChangeDetail} detail
 * @returns {void}
 */
function appendDebugLog(detail) {
	/** @type {DebugLogEntry[]} */
	const nextLogs = [
		{
			id: crypto.randomUUID(),
			timestamp: new Date().toLocaleTimeString("en-GB"),
			...detail,
		},
		...store.state.debug.logs,
	].slice(0, MAX_DEBUG_LOG_ENTRIES);

	store.state.debug.logs = nextLogs;
}

/**
 * Persists a serializable snapshot after each successful mutation.
 * @returns {void}
 */
function persistState() {
	const snapshot = store.snapshot();
	localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

/**
 * Synchronizes persistence, debug logging, and view invalidation after store writes.
 * @param {CustomEvent<StoreChangeDetail>} event
 * @returns {void}
 */
function handleStoreChange(event) {
	// The debug panel writes back into the same store, so nested debug events are ignored.
	if (isWritingDebugLog) return;

	if (!store.state.debug.paused && event.detail.path !== "debug.logs") {
		isWritingDebugLog = true;

		try {
			appendDebugLog(event.detail);
		} finally {
			isWritingDebugLog = false;
		}
	}

	persistState();
	appVersion.set(performance.now());
}

window.addEventListener("store:change", handleStoreChange);

const appRoot = document.querySelector("#app");

if (!(appRoot instanceof HTMLElement)) {
	throw new Error('Missing "#app" mount point.');
}

/**
 * Root node used by the template renderer.
 * @type {HTMLElement}
 */
export const root = appRoot;

/**
 * Whether the demo is running inside the embedded iframe mode.
 * @type {boolean}
 */
export const isEmbedded =
	new URLSearchParams(window.location.search).get("embed") === "1";
