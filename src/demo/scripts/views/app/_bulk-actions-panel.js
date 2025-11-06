import { html } from "../../core/index.js";
import {
	clearSelection,
	deleteCompleted,
	deleteSelected,
	selectAllVisible,
	toggleAllSelected,
	visibleTodos,
} from "../../state/index.js";

/**
 * Renders the bulk action controls operating on the current selection.
 * @returns {ReturnType<typeof html>}
 */
export function bulkActionsPanel() {
	return html`
    <article class="card panel">
      <h2>Bulk actions</h2>
      <div class="button-grid">
        <button @click=${() => selectAllVisible(visibleTodos)}>Select visible</button>
        <button class="ghost" @click=${clearSelection}>Clear selection</button>
        <button @click=${() => toggleAllSelected(true)}>Complete selected</button>
        <button class="ghost" @click=${() => toggleAllSelected(false)}>Reopen selected</button>
        <button class="ghost danger" @click=${deleteSelected}>Delete selected</button>
        <button class="ghost danger" @click=${deleteCompleted}>Delete completed</button>
      </div>
    </article>
  `;
}
