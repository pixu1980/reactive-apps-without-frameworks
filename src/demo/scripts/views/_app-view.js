import { html } from "../core/index.js";
import {
	appHeader,
	bulkActionsPanel,
	debugPanel,
	filtersPanel,
	quickAddPanel,
	statsRow,
	todoListPanel,
} from "./app/index.js";

/**
 * Renders the full application shell used by the demo.
 * @returns {ReturnType<typeof html>}
 */
export function appView() {
	return html`
    <main class="demo-shell">
      ${appHeader()} ${statsRow()}

      <section class="workspace-grid">
        <aside class="left-column">
          ${quickAddPanel()} ${filtersPanel()} ${bulkActionsPanel()}
        </aside>

        ${todoListPanel()}

        <aside class="right-column">
          ${debugPanel()}
        </aside>
      </section>
    </main>
  `;
}
