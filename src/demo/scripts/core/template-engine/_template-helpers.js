const directiveBrand = Symbol("directive");

/**
 * Result produced by the html tagged template helper.
 * @typedef {object} TemplateResult
 * @property {"template-result"} kind
 * @property {TemplateStringsArray} strings
 * @property {unknown[]} values
 */

/**
 * Generic directive payload consumed by template parts.
 * @template TPayload
 * @typedef {object} DirectiveResult
 * @property {string} name
 * @property {TPayload} payload
 */

/**
 * Signal contract accepted by the model directive.
 * @typedef {{ get(): unknown, subscribe(subscriber: () => void): (() => unknown) }} DirectiveSignal
 */

/**
 * Two way binding contract used by the model directive.
 * @typedef {object} ModelDirectiveConfig
 * @property {DirectiveSignal} [signal]
 * @property {string} [event]
 * @property {string} [prop]
 * @property {() => unknown} get
 * @property {(value: unknown) => unknown} set
 */

/**
 * Configuration used by the repeat directive.
 * @template TItem
 * @typedef {object} RepeatDirectiveConfig
 * @property {Iterable<TItem> | DirectiveSignal} items
 * @property {(item: TItem) => string | number | symbol} key
 * @property {(item: TItem) => unknown} renderItem
 */

/**
 * Tagged template helper used by every view and DOM part.
 * @param {TemplateStringsArray} strings
 * @param {...unknown} values
 * @returns {TemplateResult}
 */
export function html(strings, ...values) {
	return {
		kind: "template-result",
		strings,
		values,
	};
}

/**
 * Creates a branded directive payload recognized by the template engine.
 * @template TPayload
 * @param {string} name
 * @param {TPayload} payload
 * @returns {DirectiveResult<TPayload>}
 */
export function directive(name, payload) {
	return {
		[directiveBrand]: true,
		name,
		payload,
	};
}

/**
 * Checks whether a value is a branded directive and optionally matches its name.
 * @param {unknown} value
 * @param {string} [name]
 * @returns {boolean}
 */
export function isDirective(value, name) {
	return Boolean(value?.[directiveBrand] && (!name || value.name === name));
}

/**
 * Creates a two way model binding directive.
 * @param {ModelDirectiveConfig} config
 * @returns {DirectiveResult<ModelDirectiveConfig>}
 */
export function model(config) {
	return directive("model", config);
}

/**
 * Creates a keyed repeat directive for efficient list reconciliation.
 * @template TItem
 * @param {Iterable<TItem> | DirectiveSignal} items
 * @param {(item: TItem) => string | number | symbol} key
 * @param {(item: TItem) => unknown} renderItem
 * @returns {DirectiveResult<RepeatDirectiveConfig<TItem>>}
 */
export function repeat(items, key, renderItem) {
	return directive("repeat", {
		items,
		key,
		renderItem,
	});
}
