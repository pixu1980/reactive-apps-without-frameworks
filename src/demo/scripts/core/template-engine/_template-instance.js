import {
	AttributePart,
	ChildNodePart,
	EventPart,
	PropertyPart,
} from "./_parts.js";

const ATTRIBUTE_PART_RE = /([.@]?[-\w:]+)\s*=\s*(?:"|'|)?$/;
const COMMENT_PART_RE = /^part:(\d+)$/;
const PLACEHOLDER_PART_RE = /^__part_(\d+)__$/;

/**
 * Parsed placeholder descriptor stored in the template cache.
 * @typedef {{ type: "child", index: number, path: number[] } | { type: "attribute" | "property" | "event", index: number, name: string, rawName: string, path: number[] }} TemplateDescriptor
 */

/**
 * Cached template record reused across template literal instances.
 * @typedef {object} TemplateRecord
 * @property {HTMLTemplateElement} template
 * @property {TemplateDescriptor[]} descriptors
 */

/**
 * Minimal part contract shared by all template part implementations.
 * @typedef {{ setValue(value: unknown): void }} TemplatePart
 */

const templateCache = new WeakMap();

/**
 * Computes the index of a node within its parent without allocating an array copy.
 * @param {Node} node
 * @returns {number}
 */
function getChildIndex(node) {
	let index = 0;
	let current = node;
	while (current.previousSibling) {
		current = current.previousSibling;
		index += 1;
	}
	return index;
}

/**
 * Resolves a node path from the template root to a concrete node.
 * @param {Node} node
 * @param {ParentNode} root
 * @returns {number[]}
 */
function getNodePath(node, root) {
	const path = [];
	let current = node;
	while (current && current !== root) {
		const parent = current.parentNode;
		if (!parent) break;
		path.unshift(getChildIndex(current));
		current = parent;
	}
	return path;
}

/**
 * Resolves a previously stored node path inside a cloned fragment.
 * @param {ParentNode} root
 * @param {number[]} path
 * @returns {Node}
 */
function resolveNodePath(root, path) {
	let current = root;
	for (const index of path) current = current.childNodes[index];
	return current;
}

/**
 * Parses a template literal once and caches the placeholder descriptors by string identity.
 * @param {TemplateStringsArray} strings
 * @returns {TemplateRecord}
 */
function getTemplate(strings) {
	let record = templateCache.get(strings);
	if (record) return record;

	let markup = "";
	for (let index = 0; index < strings.length - 1; index += 1) {
		const chunk = strings[index];
		markup += chunk;
		const attributeMatch = chunk.match(ATTRIBUTE_PART_RE);
		if (attributeMatch) {
			markup += `__part_${index}__`;
		} else {
			markup += `<!--part:${index}-->`;
		}
	}
	markup += strings[strings.length - 1];

	const template = document.createElement("template");
	template.innerHTML = markup;
	/** @type {TemplateDescriptor[]} */
	const descriptors = [];
	const walker = document.createTreeWalker(
		template.content,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT,
	);
	let node = walker.nextNode();
	while (node) {
		if (node.nodeType === Node.COMMENT_NODE) {
			const match = node.data.match(COMMENT_PART_RE);
			if (match) {
				descriptors.push({
					type: "child",
					index: Number(match[1]),
					path: getNodePath(node, template.content),
				});
			}
			node = walker.nextNode();
			continue;
		}

		if (node.nodeType === Node.ELEMENT_NODE) {
			for (const attribute of [...node.attributes]) {
				const match = attribute.value.match(PLACEHOLDER_PART_RE);
				if (!match) continue;
				const rawName = attribute.name;
				let type = "attribute";
				let name = rawName;
				if (rawName.startsWith(".")) {
					type = "property";
					name = rawName.slice(1);
				} else if (rawName.startsWith("@")) {
					type = "event";
					name = rawName.slice(1);
				}
				descriptors.push({
					type,
					index: Number(match[1]),
					name,
					rawName,
					path: getNodePath(node, template.content),
				});
			}
		}
		node = walker.nextNode();
	}

	record = { template, descriptors };
	templateCache.set(strings, record);
	return record;
}

/**
 * Instantiated template that maps placeholder descriptors to concrete DOM parts.
 */
export class TemplateInstance {
	/**
	 * @param {TemplateStringsArray} strings
	 */
	constructor(strings) {
		/** @type {TemplateStringsArray} */
		this.strings = strings;
		const record = getTemplate(strings);
		/** @type {DocumentFragment} */
		this.fragment = record.template.content.cloneNode(true);
		/** @type {Map<number, TemplatePart>} */
		this.parts = new Map();

		const resolved = record.descriptors.map((descriptor) => ({
			descriptor,
			node: resolveNodePath(this.fragment, descriptor.path),
		}));

		for (const { descriptor, node } of resolved) {
			/** @type {TemplatePart | undefined} */
			let part;
			if (descriptor.type === "child") {
				const start = document.createComment(`start:${descriptor.index}`);
				const end = document.createComment(`end:${descriptor.index}`);
				node.replaceWith(start, end);
				part = new ChildNodePart(start, end);
			} else if (descriptor.type === "attribute") {
				node.removeAttribute(descriptor.rawName);
				part = new AttributePart(node, descriptor.name);
			} else if (descriptor.type === "property") {
				node.removeAttribute(descriptor.rawName);
				part = new PropertyPart(node, descriptor.name);
			} else if (descriptor.type === "event") {
				node.removeAttribute(descriptor.rawName);
				part = new EventPart(node, descriptor.name);
			}

			if (!part) continue;
			this.parts.set(descriptor.index, part);
		}
	}

	/**
	 * Pushes the latest template values into their matching DOM parts.
	 * @param {unknown[]} values
	 * @returns {void}
	 */
	update(values) {
		for (let index = 0; index < values.length; index += 1) {
			const part = this.parts.get(index);
			if (!part) continue;
			part.setValue(values[index]);
		}
	}
}
