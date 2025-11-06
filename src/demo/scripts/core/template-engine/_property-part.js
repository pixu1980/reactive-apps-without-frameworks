import { isSignalLike } from "../signals/index.js";
import { Part } from "./_part.js";

/**
 * Property binding part used for .property syntax inside templates.
 * @extends {Part}
 */
export class PropertyPart extends Part {
	/**
	 * @param {HTMLElement & Record<string, any>} element
	 * @param {string} name
	 */
	constructor(element, name) {
		super();
		/** @type {HTMLElement & Record<string, any>} */
		this.element = element;
		/** @type {string} */
		this.name = name;
	}

	/**
	 * Resolves signals before committing the latest property value.
	 * @param {unknown} value
	 * @returns {void}
	 */
	setValue(value) {
		if (isSignalLike(value)) {
			this.bindSignal(value, (resolved) => this.commit(resolved));
			return;
		}
		this.disposeSignal();
		this.commit(value);
	}

	/**
	 * Writes the resolved value to the backing DOM property.
	 * @param {unknown} value
	 * @returns {void}
	 */
	commit(value) {
		this.element[this.name] = value;
	}
}
