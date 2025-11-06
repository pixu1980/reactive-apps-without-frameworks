import { Signal } from "../core/index.js";
import { pipelineTodos } from "../data/index.js";
import { appVersion, store } from "./_store-setup.js";

/** @typedef {import("../data/_data.js").DebugLogEntry} DebugLogEntry */
/** @typedef {import("../data/_data.js").TodoItem} TodoItem */

/**
 * Aggregated counters used across the dashboard cards and labels.
 * @typedef {object} TodoSummary
 * @property {number} total
 * @property {number} completed
 * @property {number} open
 * @property {number} selected
 * @property {number} visible
 */

/**
 * Visible todo list after filters and sorting are applied.
 */
export const visibleTodos = new Signal.Computed(() => {
	appVersion.get();
	return pipelineTodos(store.state.todos, store.state.filters);
});

/**
 * Shared summary signal used by the stat cards and list labels.
 */
export const summary = new Signal.Computed(() => {
	appVersion.get();
	const todos = store.state.todos;
	let total = 0;
	let completed = 0;
	let selected = 0;
	for (const todo of todos) {
		total += 1;
		if (todo.completed) completed += 1;
		if (todo.selected) selected += 1;
	}

	/** @type {TodoSummary} */
	return {
		total,
		completed,
		open: total - completed,
		selected,
		visible: visibleTodos.get().length,
	};
});

/**
 * Category choices exposed to filters and editors.
 */
export const categoryOptions = new Signal.Computed(() => {
	appVersion.get();
	return ["all", ...store.state.categories];
});

/** Total number of todos in the store. */
export const totalCount = new Signal.Computed(() => summary.get().total);
/** Number of open todos. */
export const openCount = new Signal.Computed(() => summary.get().open);
/** Number of completed todos. */
export const completedCount = new Signal.Computed(
	() => summary.get().completed,
);
/** Number of todos visible after filtering. */
export const visibleCount = new Signal.Computed(() => summary.get().visible);
/** Number of selected todos. */
export const selectedCount = new Signal.Computed(() => summary.get().selected);

/**
 * Human readable label shown above the filtered list.
 */
export const visibleLabel = new Signal.Computed(
	() =>
		`${summary.get().visible} visible item(s), sorted by ${store.state.filters.sortBy}`,
);

/**
 * Debug log entries currently shown in the right side panel.
 */
export const debugLogs = new Signal.Computed(() => {
	appVersion.get();
	return store.state.debug.logs;
});
