/**
 * Event listener part used for @event bindings inside templates.
 */
export class EventPart {
	/**
	 * @param {Element} element
	 * @param {string} name
	 */
	constructor(element, name) {
		/** @type {Element} */
		this.element = element;
		/** @type {string} */
		this.name = name;
		/** @type {EventListener | null} */
		this.listener = null;
	}

	/**
	 * Replaces the active event listener with the provided callback.
	 * @param {unknown} value
	 * @returns {void}
	 */
	setValue(value) {
		if (this.listener) {
			this.element.removeEventListener(this.name, this.listener);
			this.listener = null;
		}
		if (typeof value !== "function") return;
		this.listener = value;
		this.element.addEventListener(this.name, this.listener);
	}
}
