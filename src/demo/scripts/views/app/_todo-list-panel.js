import { html, repeat } from "../../core/index.js";
import { visibleLabel, visibleTodos } from "../../state/index.js";
import { todoItem } from "../_todo-item.js";

/**
 * Renders the central todo list and its live visibility label.
 * @returns {ReturnType<typeof html>}
 */
export function todoListPanel() {
	return html`
    <section class="center-column">
      <div class="list-head">
        <h2>Reactive list</h2>
        <p>${visibleLabel}</p>
      </div>
      <div class="todo-list">${repeat(visibleTodos, (todo) => todo.id, todoItem)}</div>
    </section>
  `;
}
