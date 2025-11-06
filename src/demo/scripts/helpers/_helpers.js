import { html, model, repeat } from "../core/index.js";
import { appVersion, getTodoById, store, updateTodo } from "../state/index.js";

/** @typedef {import("../data/_data.js").TodoItem} TodoItem */
/** @typedef {Parameters<typeof model>[0]} ModelConfig */

/**
 * Creates a model directive backed by a store path.
 * @param {string} path
 * @param {Partial<ModelConfig>} [options={}]
 * @returns {ReturnType<typeof model>}
 */
export function storeModel(path, options = {}) {
	return model({
		signal: appVersion,
		get: () => store.get(path),
		set: (value) => store.set(path, value),
		...options,
	});
}

/**
 * Creates a model directive bound to a specific todo field.
 * @param {string} todoId
 * @param {keyof TodoItem} field
 * @param {Partial<ModelConfig>} [options={}]
 * @returns {ReturnType<typeof model>}
 */
export function todoModel(todoId, field, options = {}) {
	return model({
		signal: appVersion,
		get: () =>
			getTodoById(todoId)?.[field] ?? (options.prop === "checked" ? false : ""),
		set: (value) => updateTodo(todoId, { [field]: value }),
		...options,
	});
}

/**
 * Renders the static priority options used by editors.
 * @returns {ReturnType<typeof html>}
 */
export function priorityOptions() {
	return html`
    <option value="low">low</option>
    <option value="medium">medium</option>
    <option value="high">high</option>
  `;
}

/**
 * Renders the priority filter options including the all sentinel.
 * @returns {ReturnType<typeof html>}
 */
export function priorityFilterOptions() {
	return html`
    <option value="all">all</option>
    <option value="low">low</option>
    <option value="medium">medium</option>
    <option value="high">high</option>
  `;
}

/**
 * Renders the status filter options.
 * @returns {ReturnType<typeof html>}
 */
export function statusOptions() {
	return html`
    <option value="all">all</option>
    <option value="open">open</option>
    <option value="done">done</option>
  `;
}

/**
 * Renders the sorting direction options.
 * @returns {ReturnType<typeof html>}
 */
export function directionOptions() {
	return html`
    <option value="asc">asc</option>
    <option value="desc">desc</option>
  `;
}

/**
 * Renders the supported sort field options.
 * @returns {ReturnType<typeof html>}
 */
export function sortByOptions() {
	return html`
    <option value="createdAt">createdAt</option>
    <option value="title">title</option>
    <option value="priority">priority</option>
    <option value="dueDate">dueDate</option>
    <option value="category">category</option>
  `;
}

/**
 * Renders a category select bound to a model directive.
 * @param {ReturnType<typeof model>} modelDirective
 * @returns {ReturnType<typeof html>}
 */
export function categorySelect(modelDirective) {
	return html`
    <select model=${modelDirective}>
      ${repeat(
				store.state.categories,
				(item) => item,
				(item) => html`<option value=${item}>${item}</option>`,
			)}
    </select>
  `;
}

/**
 * Renders a single stat card that accepts a raw value or a signal.
 * @param {unknown} signal
 * @param {string} label
 * @returns {ReturnType<typeof html>}
 */
export function statCard(signal, label) {
	return html`
    <article class="card stat">
      <strong>${signal}</strong>
      <span>${label}</span>
    </article>
  `;
}
