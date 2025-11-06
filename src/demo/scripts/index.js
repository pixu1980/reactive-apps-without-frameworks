import { effect, render } from "./core/index.js";
import { appVersion, isEmbedded, root } from "./state/index.js";
import { appView } from "./views/index.js";

/**
 * Bootstraps the demo and keeps the root view in sync with store driven invalidations.
 */
document.documentElement.dataset.embed = String(isEmbedded);

effect(() => {
	appVersion.get();
	render(appView(), root);
});

appVersion.set(performance.now());
