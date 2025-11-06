import { html } from "../../core/index.js";
import {
	categorySelect,
	priorityOptions,
	storeModel,
} from "../../helpers/index.js";
import { addTodo } from "../../state/index.js";

/**
 * Renders the quick add form bound to the draft store state.
 * @returns {ReturnType<typeof html>}
 */
export function quickAddPanel() {
	return html`
    <article class="card panel">
      <h2>Quick add</h2>
      <label>
        <span>Title</span>
        <input placeholder="What needs to happen?" model=${storeModel("draft.title")} />
      </label>
      <label>
        <span>Notes</span>
        <textarea rows="3" model=${storeModel("draft.notes")}></textarea>
      </label>
      <div class="form-grid">
        <label>
          <span>Category</span>
          ${categorySelect(storeModel("draft.category", { event: "change" }))}
        </label>
        <label>
          <span>Priority</span>
          <select model=${storeModel("draft.priority", { event: "change" })}>
            ${priorityOptions()}
          </select>
        </label>
      </div>
      <label>
        <span>Due date</span>
        <input type="date" model=${storeModel("draft.dueDate", { event: "change" })} />
      </label>
      <button @click=${addTodo}>Add todo</button>
    </article>
  `;
}
