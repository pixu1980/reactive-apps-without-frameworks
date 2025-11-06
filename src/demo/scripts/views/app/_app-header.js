import { html } from "../../core/index.js";
import { addCategory, resetDemo } from "../../state/index.js";

/**
 * Renders the hero header and top level demo actions.
 * @returns {ReturnType<typeof html>}
 */
export function appHeader() {
	return html`
    <section class="demo-header card glass">
      <div>
        <p class="eyebrow">VanillaJS, Signals, DOM Parts</p>
        <h1>Advanced Todo, no framework</h1>
        <p class="subcopy">Two-way binding, repeat keyed, Proxy store, event log, generator pipeline.</p>
      </div>
      <div class="header-actions">
        <button @click=${resetDemo}>Reset demo</button>
        <button class="ghost" @click=${addCategory}>New category</button>
      </div>
    </section>
  `;
}
