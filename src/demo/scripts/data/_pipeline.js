/** @typedef {import("./_data.js").FiltersState} FiltersState */
/** @typedef {import("./_data.js").SortDirection} SortDirection */
/** @typedef {import("./_data.js").SortField} SortField */
/** @typedef {import("./_data.js").TodoItem} TodoItem */
/** @typedef {import("./_data.js").TodoPriority} TodoPriority */

/**
 * Numeric ranking used when sorting by semantic priority.
 * @type {Record<TodoPriority, number>}
 */
const priorityRank = {
	low: 0,
	medium: 1,
	high: 2,
};

const textCollator = new Intl.Collator("en");

/**
 * Wraps an array into a lazy iterable so the filtering stages can stay generator based.
 * @template T
 * @param {T[]} items
 * @returns {Generator<T, void, unknown>}
 */
export function* fromArray(items) {
	for (const item of items) yield item;
}

/**
 * Filters todos by free text across the user facing fields.
 * @param {Iterable<TodoItem>} source
 * @param {string} search
 * @returns {Generator<TodoItem, void, unknown>}
 */
export function* filterBySearch(source, search) {
	const query = search.trim().toLowerCase();
	if (!query) {
		yield* source;
		return;
	}
	for (const item of source) {
		const haystack =
			`${item.title} ${item.notes} ${item.category} ${item.priority}`.toLowerCase();
		if (haystack.includes(query)) yield item;
	}
}

/**
 * Filters todos by category while preserving lazy iteration.
 * @param {Iterable<TodoItem>} source
 * @param {string} category
 * @returns {Generator<TodoItem, void, unknown>}
 */
export function* filterByCategory(source, category) {
	if (category === "all") {
		yield* source;
		return;
	}
	for (const item of source) {
		if (item.category === category) yield item;
	}
}

/**
 * Filters todos by completion status.
 * @param {Iterable<TodoItem>} source
 * @param {FiltersState["status"]} status
 * @returns {Generator<TodoItem, void, unknown>}
 */
export function* filterByStatus(source, status) {
	if (status === "all") {
		yield* source;
		return;
	}
	for (const item of source) {
		if (status === "done" && item.completed) yield item;
		if (status === "open" && !item.completed) yield item;
	}
}

/**
 * Filters todos by priority.
 * @param {Iterable<TodoItem>} source
 * @param {FiltersState["priority"]} priority
 * @returns {Generator<TodoItem, void, unknown>}
 */
export function* filterByPriority(source, priority) {
	if (priority === "all") {
		yield* source;
		return;
	}
	for (const item of source) {
		if (item.priority === priority) yield item;
	}
}

/**
 * Sorts a materialized todo collection using the user selected sort field.
 * A cached collator avoids rebuilding locale rules for every comparison.
 * @param {Iterable<TodoItem>} items
 * @param {SortField} sortBy
 * @param {SortDirection} sortDir
 * @returns {TodoItem[]}
 */
export function sortTodos(items, sortBy, sortDir) {
	const direction = sortDir === "asc" ? 1 : -1;
	const sorted = [...items];
	sorted.sort((left, right) => {
		let a = left[sortBy];
		let b = right[sortBy];
		if (sortBy === "priority") {
			a = priorityRank[/** @type {TodoPriority} */ (a)];
			b = priorityRank[/** @type {TodoPriority} */ (b)];
		}
		if (sortBy === "title" || sortBy === "category") {
			return direction * textCollator.compare(String(a), String(b));
		}
		if (a === b) return 0;
		return a > b ? direction : -direction;
	});
	return sorted;
}

/**
 * Runs the complete filtering pipeline and returns the visible todos ready for rendering.
 * @param {TodoItem[]} todos
 * @param {FiltersState} filters
 * @returns {TodoItem[]}
 */
export function pipelineTodos(todos, filters) {
	const iterator = filterByPriority(
		filterByStatus(
			filterByCategory(
				filterBySearch(fromArray(todos), filters.search),
				filters.category,
			),
			filters.status,
		),
		filters.priority,
	);
	return sortTodos(iterator, filters.sortBy, filters.sortDir);
}
