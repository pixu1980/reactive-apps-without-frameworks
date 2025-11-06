/**
 * Removes every sibling node between the provided start and end markers.
 * @param {Comment} start
 * @param {Comment} end
 * @returns {void}
 */
export function clearRange(start, end) {
	let current = start.nextSibling;
	while (current && current !== end) {
		const next = current.nextSibling;
		current.remove();
		current = next;
	}
}

/**
 * Moves the marker range before a given reference node without recreating DOM nodes.
 * @param {Comment} start
 * @param {Comment} end
 * @param {Node} referenceNode
 * @returns {void}
 */
export function moveRangeBefore(start, end, referenceNode) {
	const fragment = document.createDocumentFragment();
	let current = start;
	while (current) {
		const next = current.nextSibling;
		fragment.append(current);
		if (current === end) break;
		current = next;
	}
	referenceNode.parentNode.insertBefore(fragment, referenceNode);
}

/**
 * Checks whether the marker range is already positioned directly before a reference node.
 * @param {Comment} start
 * @param {Comment} end
 * @param {Node} referenceNode
 * @returns {boolean}
 */
export function isRangeBeforeReference(start, end, referenceNode) {
	let current = start;
	while (current) {
		if (current === referenceNode) return false;
		if (current === end) return current.nextSibling === referenceNode;
		current = current.nextSibling;
	}
	return false;
}

/**
 * Normalizes arbitrary template values into DOM nodes.
 * @param {unknown} value
 * @returns {Node}
 */
export function normalizeNode(value) {
	if (value instanceof Node) return value;
	return document.createTextNode(value == null ? "" : String(value));
}

/**
 * Checks whether a value can be iterated by the repeat renderer.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isIterable(value) {
	return (
		value &&
		typeof value !== "string" &&
		typeof value[Symbol.iterator] === "function"
	);
}

/**
 * Infers the default form control property used by the model directive.
 * @param {HTMLElement & { type?: string }} element
 * @returns {"checked" | "value"}
 */
export function inferModelProperty(element) {
	return element instanceof HTMLInputElement && element.type === "checkbox"
		? "checked"
		: "value";
}
