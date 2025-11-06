import { ChildNodePart } from "./_parts.js";
import { TemplateInstance } from "./_template-instance.js";
import { setTemplateInstanceClass } from "./_template-instance-ref.js";

setTemplateInstanceClass(TemplateInstance);

/** @typedef {HTMLElement & { __rootPart?: ChildNodePart }} RenderContainer */

export {
	directive,
	html,
	isDirective,
	model,
	repeat,
} from "./_template-helpers.js";

/**
 * Renders a template result into a container using a stable root child part.
 * @param {unknown} result
 * @param {RenderContainer} container
 * @returns {void}
 */
export function render(result, container) {
	let rootPart = container.__rootPart;
	if (!rootPart) {
		const start = document.createComment("root:start");
		const end = document.createComment("root:end");
		container.textContent = "";
		container.append(start, end);
		rootPart = new ChildNodePart(start, end);
		container.__rootPart = rootPart;
	}
	rootPart.setValue(result);
}
