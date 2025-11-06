import { html } from "../core/index.js";
import {
	categorySelect,
	priorityOptions,
	todoModel,
} from "../helpers/index.js";
import { removeTodo } from "../state/index.js";

/** @typedef {import("../data/_data.js").TodoItem} TodoItem */

/**
 * Renders a single todo card with inline editors and bulk selection controls.
 * @param {TodoItem} todo
 * @returns {ReturnType<typeof html>}
 */
export function todoItem(todo) {
	return html`
    <article class=${todo.completed ? "todo-card is-done" : "todo-card"}>
      <header class="todo-main">
        <label class="checkline">
          <input model=${todoModel(todo.id, "selected", { prop: "checked", event: "change" })} type="checkbox" />
          <span>select</span>
        </label>
        <label class="checkline done-toggle">
          <input model=${todoModel(todo.id, "completed", { prop: "checked", event: "change" })} type="checkbox" />
          <span>done</span>
        </label>
        <input class="todo-title" model=${todoModel(todo.id, "title")} />
      </header>

      <div class="todo-meta-grid">
        <label>
          <span>Category</span>
          ${categorySelect(todoModel(todo.id, "category", { event: "change" }))}
        </label>
        <label>
          <span>Priority</span>
          <select model=${todoModel(todo.id, "priority", { event: "change" })}>
            ${priorityOptions()}
          </select>
        </label>
        <label>
          <span>Due date</span>
          <input type="date" model=${todoModel(todo.id, "dueDate", { event: "change" })} />
        </label>
      </div>

      <label class="notes-box">
        <span>Notes</span>
        <textarea rows="2" model=${todoModel(todo.id, "notes")}></textarea>
      </label>

      <footer class="todo-footer">
        <span class=${`priority-chip ${todo.priority}`}>${todo.priority}</span>
        <button @click=${() => removeTodo(todo.id)} class="ghost danger">Delete</button>
      </footer>
    </article>
  `;
}
