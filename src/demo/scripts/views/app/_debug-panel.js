import { html, repeat } from "../../core/index.js";
import { storeModel } from "../../helpers/index.js";
import { debugLogs } from "../../state/index.js";
import { debugLogEntry } from "./_debug-log-entry.js";

/**
 * Renders the live store:change log panel.
 * @returns {ReturnType<typeof html>}
 */
export function debugPanel() {
	return html`
    <article class="card panel debug-panel">
      <div class="debug-head">
        <h2>store:change log</h2>
        <label class="checkline compact-inline">
          <input type="checkbox" model=${storeModel("debug.paused", { prop: "checked", event: "change" })} />
          <span>pause log</span>
        </label>
      </div>
      <div class="log-list">${repeat(debugLogs, (entry) => entry.id, debugLogEntry)}</div>
    </article>
  `;
}
