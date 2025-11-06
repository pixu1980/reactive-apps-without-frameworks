import { html } from "../../core/index.js";

/** @typedef {import("../../data/_data.js").DebugLogEntry} DebugLogEntry */

/**
 * Renders a single immutable store change entry.
 * @param {DebugLogEntry} entry
 * @returns {ReturnType<typeof html>}
 */
export function debugLogEntry(entry) {
	return html`
    <article class="log-entry">
      <header>
        <strong>${entry.path || "(root)"}</strong>
        <time>${entry.timestamp}</time>
      </header>
      <pre>${JSON.stringify({ oldValue: entry.oldValue, newValue: entry.newValue }, null, 2)}</pre>
    </article>
  `;
}
