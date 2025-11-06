import { createSeedData, ONE_DAY_MS } from "../data/index.js";
import { appVersion, store } from "./_store-setup.js";

/** @typedef {import("../data/_data.js").TodoItem} TodoItem */

/**
 * Returns the todo matching the provided identifier.
 * @param {string} id
 * @returns {TodoItem | undefined}
 */
export function getTodoById(id) {
	return store.state.todos.find((todo) => todo.id === id);
}

/**
 * Merges a partial patch into an existing todo item.
 * @param {string} id
 * @param {Partial<TodoItem>} patch
 * @returns {void}
 */
export function updateTodo(id, patch) {
	const index = store.state.todos.findIndex((todo) => todo.id === id);
	if (index < 0) return;
	const current = store.state.todos[index];
	store.state.todos[index] = { ...current, ...patch };
}

/**
 * Removes a todo by identifier.
 * @param {string} id
 * @returns {void}
 */
export function removeTodo(id) {
	store.state.todos = store.state.todos.filter((todo) => todo.id !== id);
}

/**
 * Creates a new todo from the draft form when the title is not empty.
 * @returns {void}
 */
export function addTodo() {
	const draft = store.state.draft;
	if (!draft.title.trim()) return;
	store.state.todos = [
		{
			id: crypto.randomUUID(),
			title: draft.title.trim(),
			notes: draft.notes.trim(),
			category: draft.category,
			priority: draft.priority,
			dueDate: draft.dueDate,
			completed: false,
			selected: false,
			createdAt: Date.now(),
		},
		...store.state.todos,
	];
	store.state.draft = {
		...store.state.draft,
		title: "",
		notes: "",
		category: store.state.categories[0] ?? "Inbox",
		priority: "medium",
		dueDate: new Date(Date.now() + ONE_DAY_MS).toISOString().slice(0, 10),
	};
}

/**
 * Marks every selected todo with the provided completion state.
 * @param {boolean} nextCompleted
 * @returns {void}
 */
export function toggleAllSelected(nextCompleted) {
	store.state.todos = store.state.todos.map((todo) =>
		todo.selected ? { ...todo, completed: nextCompleted } : todo,
	);
}

/**
 * Removes every completed todo.
 * @returns {void}
 */
export function deleteCompleted() {
	store.state.todos = store.state.todos.filter((todo) => !todo.completed);
}

/**
 * Removes every selected todo.
 * @returns {void}
 */
export function deleteSelected() {
	store.state.todos = store.state.todos.filter((todo) => !todo.selected);
}

/**
 * Clears the selection state of all todos.
 * @returns {void}
 */
export function clearSelection() {
	store.state.todos = store.state.todos.map((todo) => ({
		...todo,
		selected: false,
	}));
}

/**
 * Selects the todos currently visible in the filtered list.
 * @param {{ peek(): TodoItem[] }} visibleTodos
 * @returns {void}
 */
export function selectAllVisible(visibleTodos) {
	const ids = new Set(visibleTodos.peek().map((todo) => todo.id));
	store.state.todos = store.state.todos.map((todo) => ({
		...todo,
		selected: ids.has(todo.id) ? true : todo.selected,
	}));
}

/**
 * Adds a new category entered by the user if it does not already exist.
 * @returns {void}
 */
export function addCategory() {
	const value = prompt("New category")?.trim();
	if (!value) return;
	if (store.state.categories.includes(value)) return;
	store.state.categories = [...store.state.categories, value];
}

/**
 * Restores the demo to its seed state and bumps the render version.
 * @returns {void}
 */
export function resetDemo() {
	store.replace(createSeedData());
	appVersion.set(performance.now());
}
