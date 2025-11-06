/**
 * Public entry point for the demo runtime.
 */
export { effect, isSignalLike, Signal } from "./signals/index.js";
export { Store } from "./store/index.js";
export {
	directive,
	html,
	isDirective,
	model,
	render,
	repeat,
} from "./template-engine/index.js";
