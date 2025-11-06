import { html, repeat } from "../../core/index.js";
import {
	directionOptions,
	priorityFilterOptions,
	sortByOptions,
	statusOptions,
	storeModel,
} from "../../helpers/index.js";
import { categoryOptions } from "../../state/index.js";

/**
 * Renders the filter and sorting controls that drive the visible list pipeline.
 * @returns {ReturnType<typeof html>}
 */
export function filtersPanel() {
	return html`
    <article class="card panel">
      <h2>Filters + sorting</h2>
      <label>
        <span>Search</span>
        <input placeholder="Search title, notes, category..." model=${storeModel("filters.search")} />
      </label>
      <div class="form-grid">
        <label>
          <span>Status</span>
          <select model=${storeModel("filters.status", { event: "change" })}>
            ${statusOptions()}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select model=${storeModel("filters.category", { event: "change" })}>
            ${repeat(
							categoryOptions,
							(item) => item,
							(item) => html`<option value=${item}>${item}</option>`,
						)}
          </select>
        </label>
      </div>
      <div class="form-grid">
        <label>
          <span>Priority</span>
          <select model=${storeModel("filters.priority", { event: "change" })}>
            ${priorityFilterOptions()}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select model=${storeModel("filters.sortBy", { event: "change" })}>
            ${sortByOptions()}
          </select>
        </label>
      </div>
      <label>
        <span>Direction</span>
        <select model=${storeModel("filters.sortDir", { event: "change" })}>
          ${directionOptions()}
        </select>
      </label>
    </article>
  `;
}
