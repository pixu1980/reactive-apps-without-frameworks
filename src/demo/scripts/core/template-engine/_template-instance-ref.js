/**
 * Constructor contract used by the renderer to instantiate parsed templates.
 * @typedef {new (strings: TemplateStringsArray) => { fragment: DocumentFragment, update(values: unknown[]): void }} TemplateInstanceConstructor
 */

let TemplateInstance;

/**
 * Registers the concrete TemplateInstance class to avoid circular imports.
 * @param {TemplateInstanceConstructor} cls
 * @returns {void}
 */
export function setTemplateInstanceClass(cls) {
	TemplateInstance = cls;
}

/**
 * Returns the registered TemplateInstance class.
 * @returns {TemplateInstanceConstructor}
 */
export function getTemplateInstanceClass() {
	if (!TemplateInstance) {
		throw new Error("TemplateInstance class not registered.");
	}

	return TemplateInstance;
}
