import { isSignalLike } from "../signals/index.js";
import { Part } from "./_part.js";
import {
	clearRange,
	isIterable,
	isRangeBeforeReference,
	moveRangeBefore,
	normalizeNode,
} from "./_range.js";
import { isDirective } from "./_template-helpers.js";
import { getTemplateInstanceClass } from "./_template-instance-ref.js";

/**
 * Rendered template result shape accepted by child parts.
 * @typedef {{ kind: "template-result", strings: TemplateStringsArray, values: unknown[] }} TemplateResult
 */

/**
 * Repeat directive payload consumed by commitRepeat.
 * @typedef {object} RepeatDirectivePayload
 * @property {Iterable<unknown> | { get(): Iterable<unknown> }} items
 * @property {(item: unknown) => string | number | symbol} key
 * @property {(item: unknown) => unknown} renderItem
 */

/**
 * DOM block tracked by the keyed repeat reconciler.
 * @typedef {object} RepeatBlock
 * @property {string | number | symbol} key
 * @property {Comment} start
 * @property {Comment} end
 * @property {ChildNodePart} part
 * @property {unknown} [item]
 */

/**
 * Internal repeat reconciliation state.
 * @typedef {{ blocks: Map<string | number | symbol, RepeatBlock> }} RepeatState
 */

/**
 * Creates the marker pair and child part used by a repeated item.
 * @param {string | number | symbol} itemKey
 * @param {Node} referenceNode
 * @returns {RepeatBlock}
 */
function createBlock(itemKey, referenceNode) {
	const start = document.createComment(`repeat-start:${itemKey}`);
	const end = document.createComment(`repeat-end:${itemKey}`);
	referenceNode.parentNode.insertBefore(start, referenceNode);
	referenceNode.parentNode.insertBefore(end, referenceNode);

	return {
		key: itemKey,
		start,
		end,
		part: new ChildNodePart(start, end),
	};
}

/**
 * Child node part responsible for text, templates, iterables, and repeat directives.
 * @extends {Part}
 */
export class ChildNodePart extends Part {
	/**
	 * @param {Comment} start
	 * @param {Comment} end
	 */
	constructor(start, end) {
		super();
		/** @type {Comment} */
		this.start = start;
		/** @type {Comment} */
		this.end = end;
		/** @type {Node | null} */
		this.currentNode = null;
		/** @type {{ strings: TemplateStringsArray, update(values: unknown[]): void, fragment: DocumentFragment } | null} */
		this.currentTemplateInstance = null;
		/** @type {RepeatState | null} */
		this.repeatState = null;
	}

	/**
	 * Resolves signals before committing child content.
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
	 * Commits arbitrary child content to the marker range.
	 * @param {unknown} value
	 * @returns {void}
	 */
	commit(value) {
		if (isDirective(value, "repeat")) {
			this.commitRepeat(/** @type {RepeatDirectivePayload} */ (value.payload));
			this.value = value;
			return;
		}

		this.repeatState = null;

		if (value?.kind === "template-result") {
			this.commitTemplate(/** @type {TemplateResult} */ (value));
			this.value = value;
			return;
		}

		if (isIterable(value)) {
			this.currentTemplateInstance = null;
			const fragment = document.createDocumentFragment();
			for (const item of value) fragment.append(normalizeNode(item));
			this.commitNode(fragment);
			this.value = value;
			return;
		}

		this.currentTemplateInstance = null;
		this.commitNode(normalizeNode(value));
		this.value = value;
	}

	/**
	 * Replaces the current child range with a single node or fragment.
	 * @param {Node} node
	 * @returns {void}
	 */
	commitNode(node) {
		clearRange(this.start, this.end);
		this.currentNode = node;
		this.start.parentNode.insertBefore(node, this.end);
	}

	/**
	 * Reuses the current template instance when the template literal identity is unchanged.
	 * @param {TemplateResult} result
	 * @returns {void}
	 */
	commitTemplate(result) {
		const strings = result.strings;
		if (this.currentTemplateInstance?.strings === strings) {
			this.currentTemplateInstance.update(result.values);
			return;
		}

		clearRange(this.start, this.end);

		const TemplateInstance = getTemplateInstanceClass();
		const instance = new TemplateInstance(strings);
		this.currentTemplateInstance = instance;
		instance.update(result.values);
		this.start.parentNode.insertBefore(instance.fragment, this.end);
	}

	/**
	 * Reconciles a keyed iterable against previously rendered blocks.
	 * @param {RepeatDirectivePayload} payload
	 * @returns {void}
	 */
	commitRepeat({ items, key, renderItem }) {
		const source = isSignalLike(items) ? items.get() : items;
		const list = Array.isArray(source)
			? source
			: isIterable(source)
				? [...source]
				: [];
		/** @type {RepeatState} */
		const state = this.repeatState ?? { blocks: new Map() };
		/** @type {Map<string | number | symbol, RepeatBlock>} */
		const nextBlocks = new Map();
		const seenKeys = new Set();
		let referenceNode = this.end;

		// Walking backwards gives each block a stable anchor to move before.
		for (let index = list.length - 1; index >= 0; index -= 1) {
			const item = list[index];
			const itemKey = key(item);

			if (seenKeys.has(itemKey)) {
				throw new Error(
					`repeat() keys must be unique. Duplicate key: ${String(itemKey)}`,
				);
			}

			seenKeys.add(itemKey);
			let block = state.blocks.get(itemKey);

			if (!block) {
				block = createBlock(itemKey, referenceNode);
				block.part.setValue(renderItem(item));
				block.item = item;
			} else {
				if (!isRangeBeforeReference(block.start, block.end, referenceNode)) {
					moveRangeBefore(block.start, block.end, referenceNode);
				}
				if (block.item !== item) {
					block.part.setValue(renderItem(item));
					block.item = item;
				}
			}

			nextBlocks.set(itemKey, block);
			referenceNode = block.start;
		}

		for (const [itemKey, block] of state.blocks.entries()) {
			if (nextBlocks.has(itemKey)) continue;
			clearRange(block.start, block.end);
			block.start.remove();
			block.end.remove();
		}

		state.blocks = nextBlocks;
		this.repeatState = state;
		this.currentTemplateInstance = null;
	}
}
