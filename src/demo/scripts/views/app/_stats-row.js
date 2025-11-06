import { html } from "../../core/index.js";
import { statCard } from "../../helpers/index.js";
import {
	completedCount,
	openCount,
	selectedCount,
	totalCount,
	visibleCount,
} from "../../state/index.js";

/**
 * Renders the summary stat cards above the workspace grid.
 * @returns {ReturnType<typeof html>}
 */
export function statsRow() {
	return html`
    <section class="stats-row">
      ${statCard(totalCount, "Total")} ${statCard(openCount, "Open")} ${statCard(completedCount, "Done")}
      ${statCard(visibleCount, "Visible")} ${statCard(selectedCount, "Selected")}
    </section>
  `;
}
