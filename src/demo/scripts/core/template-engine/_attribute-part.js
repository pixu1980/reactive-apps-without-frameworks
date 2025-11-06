import { isSignalLike } from "../signals/index.js";
import { Part } from "./_part.js";
import { inferModelProperty } from "./_range.js";
import { isDirective } from "./_template-helpers.js";

/**
 * DOM element supported by the model binding directive.
 * @typedef {HTMLElement & Record<string, any>} ModelBoundElement
 */

/**
 * Signal contract accepted by the model directive.
 * @typedef {{ get(): unknown, subscribe(subscriber: () => void): (() => unknown) }} ModelSignal
 */

/**
 * Configuration object consumed by the model directive.
 * @typedef {object} ModelDirectiveConfig
 * @property {ModelSignal} [signal]
 * @property {string} [event]
 * @property {string} [prop]
 * @property {() => unknown} get
 * @property {(value: unknown) => unknown} set
 */

/**
 * Cached model binding instance reused while the directive shape stays stable.
 * @typedef {object} ModelBinding
 * @property {ModelDirectiveConfig} config
 * @property {string} eventName
 * @property {string} property
 * @property {ModelSignal | undefined} signal
 * @property {() => void} sync
 */

/**
 * Attribute binding part used for plain attributes and for the model directive.
 * @extends {Part}
 */
export class AttributePart extends Part {
	/**
	 * @param {ModelBoundElement} element
	 * @param {string} name
	 */
	constructor(element, name) {
		super();
		/** @type {ModelBoundElement} */
		this.element = element;
		/** @type {string} */
		this.name = name;
		/** @type {(() => void) | null} */
		this.modelCleanup = null;
		/** @type {ModelBinding | null} */
		this._modelBinding = null;
	}

	/**
	 * Removes the active model event listener if present.
	 * @returns {void}
	 */
	disposeModel() {
		if (this.modelCleanup) this.modelCleanup();
		this.modelCleanup = null;
	}

	/**
	 * Resolves model directives and signals before committing an attribute value.
	 * @param {unknown} value
	 * @returns {void}
	 */
	setValue(value) {
		if (this.name === "model" && isDirective(value, "model")) {
			this.commitModel(/** @type {ModelDirectiveConfig} */ (value.payload));
			this.value = value;
			return;
		}

		if (isSignalLike(value)) {
			this.disposeModel();
			this.bindSignal(value, (resolved) => this.commit(resolved));
			return;
		}

		this.disposeModel();
		this.disposeSignal();
		this.commit(value);
	}

	/**
	 * Writes a normalized attribute value to the DOM element.
	 * @param {unknown} value
	 * @returns {void}
	 */
	commit(value) {
		if (value == null || value === false) {
			this.element.removeAttribute(this.name);
			return;
		}
		this.element.setAttribute(this.name, value === true ? "" : String(value));
	}

	/**
	 * Wires a two way model binding between a signal or store facade and a form control.
	 * @param {ModelDirectiveConfig} config
	 * @returns {void}
	 */
	commitModel(config) {
		const eventName = config.event ?? "input";
		const property = config.prop ?? inferModelProperty(this.element);

		if (
			this._modelBinding &&
			this._modelBinding.eventName === eventName &&
			this._modelBinding.property === property &&
			this._modelBinding.signal === config.signal
		) {
			this._modelBinding.config = config;
			this._modelBinding.sync();
			return;
		}

		this.disposeSignal();
		this.disposeModel();

		/** @type {ModelBinding} */
		const binding = { config, eventName, property, signal: config.signal };

		/**
		 * Synchronizes the DOM control with the current model value.
		 * @returns {void}
		 */
		const sync = () => {
			const nextValue = binding.config.get();
			if (property === "checked") {
				const normalizedValue = Boolean(nextValue);
				if (this.element.checked !== normalizedValue) {
					this.element.checked = normalizedValue;
				}
			} else {
				const normalizedValue = nextValue ?? "";
				if (this.element[property] === normalizedValue) return;

				const isActiveElement = document.activeElement === this.element;
				const supportsSelection =
					typeof this.element.selectionStart === "number" &&
					typeof this.element.selectionEnd === "number";
				const selectionStart = supportsSelection
					? this.element.selectionStart
					: null;
				const selectionEnd = supportsSelection
					? this.element.selectionEnd
					: null;

				// Preserve the cursor when a controlled field re-renders while focused.
				this.element[property] = normalizedValue;

				if (
					isActiveElement &&
					supportsSelection &&
					selectionStart !== null &&
					selectionEnd !== null
				) {
					const textValue =
						typeof normalizedValue === "string"
							? normalizedValue
							: String(normalizedValue);
					const nextCursor = Math.min(selectionStart, textValue.length);
					const nextSelectionEnd = Math.min(selectionEnd, textValue.length);
					this.element.setSelectionRange(nextCursor, nextSelectionEnd);
				}
			}
		};

		/**
		 * Defers one extra sync for select elements so their options are in place first.
		 * @returns {void}
		 */
		const syncAfterRender = () => {
			sync();
			if (this.element instanceof HTMLSelectElement) {
				queueMicrotask(() => {
					if (this._modelBinding === binding && this.element.isConnected)
						sync();
				});
			}
		};

		binding.sync = sync;
		this._modelBinding = binding;

		/**
		 * Pushes user input back into the bound signal or store facade.
		 * @param {Event} event
		 * @returns {void}
		 */
		const onInput = (event) => {
			const target = /** @type {ModelBoundElement} */ (event.currentTarget);
			const nextValue =
				property === "checked" ? target.checked : target[property];
			binding.config.set(nextValue);
		};

		this.element.addEventListener(eventName, onInput);
		this.modelCleanup = () => {
			this.element.removeEventListener(eventName, onInput);
			this._modelBinding = null;
		};

		if (config.signal && isSignalLike(config.signal)) {
			this.bindSignal(config.signal, syncAfterRender);
			return;
		}

		syncAfterRender();
	}
}
