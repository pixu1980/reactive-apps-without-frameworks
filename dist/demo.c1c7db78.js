/**
 * Public entry point for the demo runtime.
 */ /**
 * Collector capable of subscribing itself to the signals it reads.
 * @typedef {{ addDependency(signal: unknown): void }} DependencyCollector
 */ /** @type {DependencyCollector[]} */ const $23569fd9d29318e0$var$collectorStack = [];
function $23569fd9d29318e0$export$d4ecf726e206db54() {
    return $23569fd9d29318e0$var$collectorStack[$23569fd9d29318e0$var$collectorStack.length - 1];
}
function $23569fd9d29318e0$export$a52feeef5d8fdbc(collector) {
    $23569fd9d29318e0$var$collectorStack.push(collector);
}
function $23569fd9d29318e0$export$5566122f6bb36623() {
    return $23569fd9d29318e0$var$collectorStack.pop();
}
function $23569fd9d29318e0$export$3b949e28ff59cb59(collector, callback) {
    $23569fd9d29318e0$export$a52feeef5d8fdbc(collector);
    try {
        return callback();
    } finally{
        $23569fd9d29318e0$export$5566122f6bb36623();
    }
}
function $23569fd9d29318e0$export$ef1b64fe5014b8cd(callback) {
    const current = $23569fd9d29318e0$export$5566122f6bb36623();
    try {
        return callback();
    } finally{
        if (current) $23569fd9d29318e0$export$a52feeef5d8fdbc(current);
    }
}




class $c8b3be432955563a$export$4edcd313b705bb5e {
    /**
	 * @returns {void}
	 */ constructor(){
        /** @type {Set<SignalSubscriber>} */ this.subscribers = new Set();
        /** @type {true} */ this.__isSignal = true;
    }
    /**
	 * Subscribes a callback to invalidation notifications.
	 * @param {SignalSubscriber} subscriber
	 * @returns {() => boolean}
	 */ subscribe(subscriber) {
        this.subscribers.add(subscriber);
        return ()=>this.subscribers.delete(subscriber);
    }
    /**
	 * Registers the signal in the current collector when one is active.
	 * @returns {void}
	 */ track() {
        const current = (0, $23569fd9d29318e0$export$d4ecf726e206db54)();
        if (current) current.addDependency(this);
    }
    /**
	 * Notifies all subscribers of the latest invalidation.
	 * @returns {void}
	 */ notify() {
        for (const subscriber of [
            ...this.subscribers
        ])subscriber();
    }
}


class $2ef6b08080938dba$export$93fd99f2191c7547 extends (0, $c8b3be432955563a$export$4edcd313b705bb5e) {
    /**
	 * @param {() => T} compute
	 * @param {ComputedSignalOptions<T>} [options]
	 */ constructor(compute, options = {}){
        super();
        /** @type {() => T} */ this.compute = compute;
        /** @type {(previousValue: T | undefined, nextValue: T) => boolean} */ this.equals = options.equals ?? Object.is;
        /** @type {Map<unknown, () => unknown>} */ this.dependencies = new Map();
        /** @type {T | undefined} */ this.cached = undefined;
        this.dirty = true;
        this.recomputing = false;
        /** @type {() => void} */ this.boundInvalidate = this.invalidate.bind(this);
    }
    /**
	 * Records a dependency and subscribes once to its invalidation channel.
	 * @param {{ subscribe(subscriber: () => void): () => unknown }} signal
	 * @returns {void}
	 */ addDependency(signal) {
        if (this.dependencies.has(signal)) return;
        const unsubscribe = signal.subscribe(this.boundInvalidate);
        this.dependencies.set(signal, unsubscribe);
    }
    /**
	 * Removes subscriptions to the previous dependency graph before recomputing.
	 * @returns {void}
	 */ cleanupDependencies() {
        for (const unsubscribe of this.dependencies.values())unsubscribe();
        this.dependencies.clear();
    }
    /**
	 * Marks the computed value as stale and propagates the invalidation downstream.
	 * @returns {void}
	 */ invalidate() {
        if (this.dirty) return;
        this.dirty = true;
        this.notify();
    }
    /**
	 * Recomputes the cached value when needed.
	 * @returns {T}
	 */ evaluate() {
        if (!this.dirty) return /** @type {T} */ this.cached;
        if (this.recomputing) return /** @type {T} */ this.cached;
        this.recomputing = true;
        this.cleanupDependencies();
        try {
            const nextValue = (0, $23569fd9d29318e0$export$3b949e28ff59cb59)(this, ()=>this.compute());
            if (this.dirty || !this.equals(this.cached, nextValue)) this.cached = nextValue;
            this.dirty = false;
            return /** @type {T} */ this.cached;
        } finally{
            this.recomputing = false;
        }
    }
    /**
	 * Returns the tracked computed value.
	 * @returns {T}
	 */ get() {
        this.track();
        return this.evaluate();
    }
    /**
	 * Returns the computed value without adding the current collector as a dependency.
	 * @returns {T}
	 */ peek() {
        return this.evaluate();
    }
}



/**
 * Job contract accepted by the microtask scheduler.
 * @typedef {{ run(): void }} SchedulableJob
 */ /** @type {Set<SchedulableJob>} */ const $5b296e656d62fdd4$var$scheduled = new Set();
let $5b296e656d62fdd4$var$flushing = false;
function $5b296e656d62fdd4$export$60974f670aa8d75e(effect) {
    $5b296e656d62fdd4$var$scheduled.add(effect);
    if ($5b296e656d62fdd4$var$flushing) return;
    $5b296e656d62fdd4$var$flushing = true;
    queueMicrotask(()=>{
        try {
            while($5b296e656d62fdd4$var$scheduled.size > 0){
                const batch = [
                    ...$5b296e656d62fdd4$var$scheduled
                ];
                $5b296e656d62fdd4$var$scheduled.clear();
                for (const job of batch)job.run();
            }
        } finally{
            $5b296e656d62fdd4$var$flushing = false;
        }
    });
}


class $c6ba7300a74f1894$export$4b30c17d5771633f {
    /**
	 * @param {() => void} callback
	 */ constructor(callback){
        /** @type {() => void} */ this.callback = callback;
        /** @type {Map<TrackableSignal, () => unknown>} */ this.dependencies = new Map();
        this.active = true;
        /** @type {() => void} */ this.run = this.run.bind(this);
        this.run();
    }
    /**
	 * Records a dependency and schedules the effect when it changes.
	 * @param {TrackableSignal} signal
	 * @returns {void}
	 */ addDependency(signal) {
        if (this.dependencies.has(signal)) return;
        const unsubscribe = signal.subscribe(()=>(0, $5b296e656d62fdd4$export$60974f670aa8d75e)(this));
        this.dependencies.set(signal, unsubscribe);
    }
    /**
	 * Removes all active signal subscriptions.
	 * @returns {void}
	 */ cleanup() {
        for (const unsubscribe of this.dependencies.values())unsubscribe();
        this.dependencies.clear();
    }
    /**
	 * Re-runs the effect while collecting the fresh dependency graph.
	 * @returns {void}
	 */ run() {
        if (!this.active) return;
        this.cleanup();
        (0, $23569fd9d29318e0$export$3b949e28ff59cb59)(this, ()=>{
            this.callback();
        });
    }
    /**
	 * Permanently disables the effect and unsubscribes from all dependencies.
	 * @returns {void}
	 */ stop() {
        this.active = false;
        this.cleanup();
    }
}



class $f88f8d86c570769d$export$8f7884c9c5372e41 extends (0, $c8b3be432955563a$export$4edcd313b705bb5e) {
    /**
	 * @param {T} value
	 * @param {{ equals?: (previousValue: T, nextValue: T) => boolean }} [options]
	 */ constructor(value, options = {}){
        super();
        /** @type {T} */ this.value = value;
        /** @type {(previousValue: T, nextValue: T) => boolean} */ this.equals = options.equals ?? Object.is;
    }
    /**
	 * Returns the tracked value.
	 * @returns {T}
	 */ get() {
        this.track();
        return this.value;
    }
    /**
	 * Returns the current value without tracking.
	 * @returns {T}
	 */ peek() {
        return this.value;
    }
    /**
	 * Updates the signal when the equality guard allows it.
	 * @param {T} nextValue
	 * @returns {T}
	 */ set(nextValue) {
        if (this.equals(this.value, nextValue)) return this.value;
        this.value = nextValue;
        this.notify();
        return this.value;
    }
}


const $ddc1f6d2e8302eb4$export$8210dfe1863c478 = {
    State: (0, $f88f8d86c570769d$export$8f7884c9c5372e41),
    Computed: (0, $2ef6b08080938dba$export$93fd99f2191c7547),
    subtle: {
        untrack: (0, $23569fd9d29318e0$export$ef1b64fe5014b8cd)
    }
};
function $ddc1f6d2e8302eb4$export$3f854e0fe5c8eeab(value) {
    return Boolean(value && typeof value.get === "function" && value.__isSignal);
}
function $ddc1f6d2e8302eb4$export$dc573d8a6576cdb3(callback) {
    const runner = new (0, $c6ba7300a74f1894$export$4b30c17d5771633f)(callback);
    return ()=>runner.stop();
}


/**
 * Public exports for the proxy based store layer.
 */ /**
 * Checks whether a value can be wrapped in a proxy or traversed deeply.
 * @param {unknown} value
 * @returns {boolean}
 */ function $55b1fb749447264f$export$a6cdc56e425d0d0a(value) {
    return value !== null && typeof value === "object";
}


/**
 * Unwraps proxy values before cloning them.
 * @template T
 * @param {T} value
 * @returns {T}
 */ function $f9d8475bb08b632d$var$getRawValue(value) {
    if (!(0, $55b1fb749447264f$export$a6cdc56e425d0d0a)(value)) return value;
    return value.__raw ?? value;
}
function $f9d8475bb08b632d$export$39144574c93912(value, seen = new WeakMap()) {
    const raw = $f9d8475bb08b632d$var$getRawValue(value);
    if (!(0, $55b1fb749447264f$export$a6cdc56e425d0d0a)(raw)) return raw;
    if (seen.has(raw)) return seen.get(raw);
    if (raw instanceof Date) return new Date(raw.getTime());
    if (raw instanceof RegExp) return new RegExp(raw.source, raw.flags);
    if (raw instanceof Map) {
        const next = new Map();
        seen.set(raw, next);
        for (const [key, entryValue] of raw.entries())next.set($f9d8475bb08b632d$export$39144574c93912(key, seen), $f9d8475bb08b632d$export$39144574c93912(entryValue, seen));
        return next;
    }
    if (raw instanceof Set) {
        const next = new Set();
        seen.set(raw, next);
        for (const entry of raw.values())next.add($f9d8475bb08b632d$export$39144574c93912(entry, seen));
        return next;
    }
    if (Array.isArray(raw)) {
        const next = [];
        seen.set(raw, next);
        for (const entry of raw)next.push($f9d8475bb08b632d$export$39144574c93912(entry, seen));
        return next;
    }
    const next = {};
    seen.set(raw, next);
    for (const key of Reflect.ownKeys(raw)){
        const descriptor = Object.getOwnPropertyDescriptor(raw, key);
        if (!descriptor?.enumerable) continue;
        next[key] = $f9d8475bb08b632d$export$39144574c93912(raw[key], seen);
    }
    return next;
}
function $f9d8475bb08b632d$export$b7d58db314e0ac27(value) {
    return $f9d8475bb08b632d$export$39144574c93912(value);
}



/**
 * Converts a dot notation path into an array of path segments.
 * @param {string | number | symbol | Array<string | number | symbol> | null | undefined} path
 * @returns {Array<string | number | symbol>}
 */ function $fc682d26707a0fa5$export$7a2b75a34433eeb1(path) {
    if (Array.isArray(path)) return path;
    if (path == null || path === "") return [];
    return String(path).split(".").filter(Boolean);
}
function $fc682d26707a0fa5$export$bb82e0fcfe17f92a(path) {
    return $fc682d26707a0fa5$export$7a2b75a34433eeb1(path).join(".");
}


class $2e13bdf7d5a90895$export$390f32400eaf98c9 {
    /**
	 * @param {object} [initialState={}]
	 * @param {StoreOptions} [options={}]
	 */ constructor(initialState = {}, options = {}){
        /** @type {EventTarget} */ this.events = options.eventsTarget ?? window;
        /** @type {object} */ this.target = (0, $f9d8475bb08b632d$export$b7d58db314e0ac27)(initialState);
        /** @type {WeakMap<object, object>} */ this.proxyCache = new WeakMap();
        /** @type {any} */ this.state = this.createProxy(this.target, []);
    }
    /**
	 * Recursively wraps nested objects in stable proxies.
	 * @param {object} target
	 * @param {Array<string | number | symbol>} path
	 * @returns {any}
	 */ createProxy(target, path) {
        if (!(0, $55b1fb749447264f$export$a6cdc56e425d0d0a)(target)) return target;
        if (this.proxyCache.has(target)) return this.proxyCache.get(target);
        const proxy = new Proxy(target, {
            get: (raw, key, receiver)=>{
                // Internal escape hatches are kept enumerable free and only exist for cloning helpers.
                if (key === "__raw") return raw;
                if (key === "__path") return path;
                const value = Reflect.get(raw, key, receiver);
                if ((0, $55b1fb749447264f$export$a6cdc56e425d0d0a)(value)) return this.createProxy(value, [
                    ...path,
                    key
                ]);
                return value;
            },
            set: (raw, key, value, receiver)=>{
                const nextPath = [
                    ...path,
                    key
                ];
                const oldValue = raw[key];
                const prepared = (0, $f9d8475bb08b632d$export$39144574c93912)(value);
                const result = Reflect.set(raw, key, prepared, receiver);
                if (oldValue !== prepared) this.emitChange(nextPath, oldValue, prepared);
                return result;
            },
            deleteProperty: (raw, key)=>{
                if (!(key in raw)) return true;
                const nextPath = [
                    ...path,
                    key
                ];
                const oldValue = raw[key];
                const result = Reflect.deleteProperty(raw, key);
                this.emitChange(nextPath, oldValue, undefined);
                return result;
            }
        });
        this.proxyCache.set(target, proxy);
        return proxy;
    }
    /**
	 * Emits a store:change event with cloned payloads so listeners cannot mutate the store internals.
	 * @param {Array<string | number | symbol>} path
	 * @param {unknown} oldValue
	 * @param {unknown} newValue
	 * @returns {void}
	 */ emitChange(path, oldValue, newValue) {
        /** @type {StoreChangeDetail} */ const detail = {
            path: (0, $fc682d26707a0fa5$export$bb82e0fcfe17f92a)(path),
            oldValue: (0, $f9d8475bb08b632d$export$b7d58db314e0ac27)(oldValue),
            newValue: (0, $f9d8475bb08b632d$export$b7d58db314e0ac27)(newValue)
        };
        const event = new CustomEvent("store:change", {
            detail: detail
        });
        this.events.dispatchEvent(event);
    }
    /**
	 * Reads a value by path from the proxied state tree.
	 * @param {StorePath | null | undefined} path
	 * @returns {unknown}
	 */ get(path) {
        const parts = (0, $fc682d26707a0fa5$export$7a2b75a34433eeb1)(path);
        let current = this.state;
        for (const part of parts)current = current?.[part];
        return current;
    }
    /**
	 * Writes a value by path, creating missing intermediate objects when needed.
	 * @param {StorePath | null | undefined} path
	 * @param {unknown} value
	 * @returns {unknown}
	 */ set(path, value) {
        const parts = (0, $fc682d26707a0fa5$export$7a2b75a34433eeb1)(path);
        if (!parts.length) throw new Error("Path is required");
        const last = parts.pop();
        let current = this.state;
        for (const part of parts){
            if (!(0, $55b1fb749447264f$export$a6cdc56e425d0d0a)(current[part])) current[part] = {};
            current = current[part];
        }
        current[last] = value;
        return value;
    }
    /**
	 * Updates a value by passing the current snapshot to an updater callback.
	 * @param {StorePath | null | undefined} path
	 * @param {(currentValue: unknown) => unknown} updater
	 * @returns {unknown}
	 */ update(path, updater) {
        const currentValue = this.get(path);
        return this.set(path, updater(currentValue));
    }
    /**
	 * Replaces the entire state tree with a fresh proxy graph.
	 * @param {object} nextState
	 * @returns {void}
	 */ replace(nextState) {
        const oldValue = (0, $f9d8475bb08b632d$export$b7d58db314e0ac27)(this.target);
        this.target = (0, $f9d8475bb08b632d$export$b7d58db314e0ac27)(nextState);
        this.proxyCache = new WeakMap();
        this.state = this.createProxy(this.target, []);
        this.emitChange([], oldValue, this.target);
    }
    /**
	 * Returns a deep cloned snapshot of the current store state.
	 * @returns {unknown}
	 */ snapshot() {
        return (0, $f9d8475bb08b632d$export$b7d58db314e0ac27)(this.target);
    }
}




/**
 * Public exports for the template engine.
 */ /**
 * Public exports for the DOM part implementations used by the template engine.
 */ 
/**
 * Minimal signal contract required by DOM parts.
 * @typedef {{ get(): unknown, subscribe(subscriber: () => void): (() => unknown) }} PartSignal
 */ /**
 * Base class shared by attribute, property, and child node parts.
 */ class $62b0c02417fac1fe$export$7b5bf7981d51054e {
    /**
	 * @returns {void}
	 */ constructor(){
        this.value = undefined;
        /** @type {(() => unknown) | null} */ this.signalCleanup = null;
    }
    /**
	 * Binds a signal to the part and keeps it in sync until disposed.
	 * @param {PartSignal} signal
	 * @param {(resolved: unknown) => void} callback
	 * @returns {void}
	 */ bindSignal(signal, callback) {
        this.disposeSignal();
        this.signalCleanup = signal.subscribe(()=>callback(signal.get()));
        callback(signal.get());
    }
    /**
	 * Removes the current signal subscription if one exists.
	 * @returns {void}
	 */ disposeSignal() {
        if (this.signalCleanup) this.signalCleanup();
        this.signalCleanup = null;
    }
}


/**
 * Removes every sibling node between the provided start and end markers.
 * @param {Comment} start
 * @param {Comment} end
 * @returns {void}
 */ function $9288b1052383715d$export$6d0e8393b4347678(start, end) {
    let current = start.nextSibling;
    while(current && current !== end){
        const next = current.nextSibling;
        current.remove();
        current = next;
    }
}
function $9288b1052383715d$export$fb90815deade15c(start, end, referenceNode) {
    const fragment = document.createDocumentFragment();
    let current = start;
    while(current){
        const next = current.nextSibling;
        fragment.append(current);
        if (current === end) break;
        current = next;
    }
    referenceNode.parentNode.insertBefore(fragment, referenceNode);
}
function $9288b1052383715d$export$da3538d07c8d6283(start, end, referenceNode) {
    let current = start;
    while(current){
        if (current === referenceNode) return false;
        if (current === end) return current.nextSibling === referenceNode;
        current = current.nextSibling;
    }
    return false;
}
function $9288b1052383715d$export$775064d9a0021ab5(value) {
    if (value instanceof Node) return value;
    return document.createTextNode(value == null ? "" : String(value));
}
function $9288b1052383715d$export$9652023d9040757(value) {
    return value && typeof value !== "string" && typeof value[Symbol.iterator] === "function";
}
function $9288b1052383715d$export$4d9d472d94825040(element) {
    return element instanceof HTMLInputElement && element.type === "checkbox" ? "checked" : "value";
}


const $0f2e482d1db633b7$var$directiveBrand = Symbol("directive");
function $0f2e482d1db633b7$export$c0bb0b647f701bb5(strings, ...values) {
    return {
        kind: "template-result",
        strings: strings,
        values: values
    };
}
function $0f2e482d1db633b7$export$99b43ad1ed32e735(name, payload) {
    return {
        [$0f2e482d1db633b7$var$directiveBrand]: true,
        name: name,
        payload: payload
    };
}
function $0f2e482d1db633b7$export$4b5d79f26e0e3ad5(value, name) {
    return Boolean(value?.[$0f2e482d1db633b7$var$directiveBrand] && (!name || value.name === name));
}
function $0f2e482d1db633b7$export$39a8f6bed6e94390(config) {
    return $0f2e482d1db633b7$export$99b43ad1ed32e735("model", config);
}
function $0f2e482d1db633b7$export$76d90c956114f2c2(items, key, renderItem) {
    return $0f2e482d1db633b7$export$99b43ad1ed32e735("repeat", {
        items: items,
        key: key,
        renderItem: renderItem
    });
}


class $0b656303a55759eb$export$da9b3ca39c846561 extends (0, $62b0c02417fac1fe$export$7b5bf7981d51054e) {
    /**
	 * @param {ModelBoundElement} element
	 * @param {string} name
	 */ constructor(element, name){
        super();
        /** @type {ModelBoundElement} */ this.element = element;
        /** @type {string} */ this.name = name;
        /** @type {(() => void) | null} */ this.modelCleanup = null;
        /** @type {ModelBinding | null} */ this._modelBinding = null;
    }
    /**
	 * Removes the active model event listener if present.
	 * @returns {void}
	 */ disposeModel() {
        if (this.modelCleanup) this.modelCleanup();
        this.modelCleanup = null;
    }
    /**
	 * Resolves model directives and signals before committing an attribute value.
	 * @param {unknown} value
	 * @returns {void}
	 */ setValue(value) {
        if (this.name === "model" && (0, $0f2e482d1db633b7$export$4b5d79f26e0e3ad5)(value, "model")) {
            this.commitModel(/** @type {ModelDirectiveConfig} */ value.payload);
            this.value = value;
            return;
        }
        if ((0, $ddc1f6d2e8302eb4$export$3f854e0fe5c8eeab)(value)) {
            this.disposeModel();
            this.bindSignal(value, (resolved)=>this.commit(resolved));
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
	 */ commit(value) {
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
	 */ commitModel(config) {
        const eventName = config.event ?? "input";
        const property = config.prop ?? (0, $9288b1052383715d$export$4d9d472d94825040)(this.element);
        if (this._modelBinding && this._modelBinding.eventName === eventName && this._modelBinding.property === property && this._modelBinding.signal === config.signal) {
            this._modelBinding.config = config;
            this._modelBinding.sync();
            return;
        }
        this.disposeSignal();
        this.disposeModel();
        /** @type {ModelBinding} */ const binding = {
            config: config,
            eventName: eventName,
            property: property,
            signal: config.signal
        };
        /**
		 * Synchronizes the DOM control with the current model value.
		 * @returns {void}
		 */ const sync = ()=>{
            const nextValue = binding.config.get();
            if (property === "checked") {
                const normalizedValue = Boolean(nextValue);
                if (this.element.checked !== normalizedValue) this.element.checked = normalizedValue;
            } else {
                const normalizedValue = nextValue ?? "";
                if (this.element[property] === normalizedValue) return;
                const isActiveElement = document.activeElement === this.element;
                const supportsSelection = typeof this.element.selectionStart === "number" && typeof this.element.selectionEnd === "number";
                const selectionStart = supportsSelection ? this.element.selectionStart : null;
                const selectionEnd = supportsSelection ? this.element.selectionEnd : null;
                // Preserve the cursor when a controlled field re-renders while focused.
                this.element[property] = normalizedValue;
                if (isActiveElement && supportsSelection && selectionStart !== null && selectionEnd !== null) {
                    const textValue = typeof normalizedValue === "string" ? normalizedValue : String(normalizedValue);
                    const nextCursor = Math.min(selectionStart, textValue.length);
                    const nextSelectionEnd = Math.min(selectionEnd, textValue.length);
                    this.element.setSelectionRange(nextCursor, nextSelectionEnd);
                }
            }
        };
        /**
		 * Defers one extra sync for select elements so their options are in place first.
		 * @returns {void}
		 */ const syncAfterRender = ()=>{
            sync();
            if (this.element instanceof HTMLSelectElement) queueMicrotask(()=>{
                if (this._modelBinding === binding && this.element.isConnected) sync();
            });
        };
        binding.sync = sync;
        this._modelBinding = binding;
        /**
		 * Pushes user input back into the bound signal or store facade.
		 * @param {Event} event
		 * @returns {void}
		 */ const onInput = (event)=>{
            const target = /** @type {ModelBoundElement} */ event.currentTarget;
            const nextValue = property === "checked" ? target.checked : target[property];
            binding.config.set(nextValue);
        };
        this.element.addEventListener(eventName, onInput);
        this.modelCleanup = ()=>{
            this.element.removeEventListener(eventName, onInput);
            this._modelBinding = null;
        };
        if (config.signal && (0, $ddc1f6d2e8302eb4$export$3f854e0fe5c8eeab)(config.signal)) {
            this.bindSignal(config.signal, syncAfterRender);
            return;
        }
        syncAfterRender();
    }
}






/**
 * Constructor contract used by the renderer to instantiate parsed templates.
 * @typedef {new (strings: TemplateStringsArray) => { fragment: DocumentFragment, update(values: unknown[]): void }} TemplateInstanceConstructor
 */ let $af61e58368c28380$var$TemplateInstance;
function $af61e58368c28380$export$882afaa758b4a5e(cls) {
    $af61e58368c28380$var$TemplateInstance = cls;
}
function $af61e58368c28380$export$23b586f446e78e31() {
    if (!$af61e58368c28380$var$TemplateInstance) throw new Error("TemplateInstance class not registered.");
    return $af61e58368c28380$var$TemplateInstance;
}


/**
 * Rendered template result shape accepted by child parts.
 * @typedef {{ kind: "template-result", strings: TemplateStringsArray, values: unknown[] }} TemplateResult
 */ /**
 * Repeat directive payload consumed by commitRepeat.
 * @typedef {object} RepeatDirectivePayload
 * @property {Iterable<unknown> | { get(): Iterable<unknown> }} items
 * @property {(item: unknown) => string | number | symbol} key
 * @property {(item: unknown) => unknown} renderItem
 */ /**
 * DOM block tracked by the keyed repeat reconciler.
 * @typedef {object} RepeatBlock
 * @property {string | number | symbol} key
 * @property {Comment} start
 * @property {Comment} end
 * @property {ChildNodePart} part
 * @property {unknown} [item]
 */ /**
 * Internal repeat reconciliation state.
 * @typedef {{ blocks: Map<string | number | symbol, RepeatBlock> }} RepeatState
 */ /**
 * Creates the marker pair and child part used by a repeated item.
 * @param {string | number | symbol} itemKey
 * @param {Node} referenceNode
 * @returns {RepeatBlock}
 */ function $62c193ab522d398e$var$createBlock(itemKey, referenceNode) {
    const start = document.createComment(`repeat-start:${itemKey}`);
    const end = document.createComment(`repeat-end:${itemKey}`);
    referenceNode.parentNode.insertBefore(start, referenceNode);
    referenceNode.parentNode.insertBefore(end, referenceNode);
    return {
        key: itemKey,
        start: start,
        end: end,
        part: new $62c193ab522d398e$export$597ccc9503a8c0eb(start, end)
    };
}
class $62c193ab522d398e$export$597ccc9503a8c0eb extends (0, $62b0c02417fac1fe$export$7b5bf7981d51054e) {
    /**
	 * @param {Comment} start
	 * @param {Comment} end
	 */ constructor(start, end){
        super();
        /** @type {Comment} */ this.start = start;
        /** @type {Comment} */ this.end = end;
        /** @type {Node | null} */ this.currentNode = null;
        /** @type {{ strings: TemplateStringsArray, update(values: unknown[]): void, fragment: DocumentFragment } | null} */ this.currentTemplateInstance = null;
        /** @type {RepeatState | null} */ this.repeatState = null;
    }
    /**
	 * Resolves signals before committing child content.
	 * @param {unknown} value
	 * @returns {void}
	 */ setValue(value) {
        if ((0, $ddc1f6d2e8302eb4$export$3f854e0fe5c8eeab)(value)) {
            this.bindSignal(value, (resolved)=>this.commit(resolved));
            return;
        }
        this.disposeSignal();
        this.commit(value);
    }
    /**
	 * Commits arbitrary child content to the marker range.
	 * @param {unknown} value
	 * @returns {void}
	 */ commit(value) {
        if ((0, $0f2e482d1db633b7$export$4b5d79f26e0e3ad5)(value, "repeat")) {
            this.commitRepeat(/** @type {RepeatDirectivePayload} */ value.payload);
            this.value = value;
            return;
        }
        this.repeatState = null;
        if (value?.kind === "template-result") {
            this.commitTemplate(/** @type {TemplateResult} */ value);
            this.value = value;
            return;
        }
        if ((0, $9288b1052383715d$export$9652023d9040757)(value)) {
            this.currentTemplateInstance = null;
            const fragment = document.createDocumentFragment();
            for (const item of value)fragment.append((0, $9288b1052383715d$export$775064d9a0021ab5)(item));
            this.commitNode(fragment);
            this.value = value;
            return;
        }
        this.currentTemplateInstance = null;
        this.commitNode((0, $9288b1052383715d$export$775064d9a0021ab5)(value));
        this.value = value;
    }
    /**
	 * Replaces the current child range with a single node or fragment.
	 * @param {Node} node
	 * @returns {void}
	 */ commitNode(node) {
        (0, $9288b1052383715d$export$6d0e8393b4347678)(this.start, this.end);
        this.currentNode = node;
        this.start.parentNode.insertBefore(node, this.end);
    }
    /**
	 * Reuses the current template instance when the template literal identity is unchanged.
	 * @param {TemplateResult} result
	 * @returns {void}
	 */ commitTemplate(result) {
        const strings = result.strings;
        if (this.currentTemplateInstance?.strings === strings) {
            this.currentTemplateInstance.update(result.values);
            return;
        }
        (0, $9288b1052383715d$export$6d0e8393b4347678)(this.start, this.end);
        const TemplateInstance = (0, $af61e58368c28380$export$23b586f446e78e31)();
        const instance = new TemplateInstance(strings);
        this.currentTemplateInstance = instance;
        instance.update(result.values);
        this.start.parentNode.insertBefore(instance.fragment, this.end);
    }
    /**
	 * Reconciles a keyed iterable against previously rendered blocks.
	 * @param {RepeatDirectivePayload} payload
	 * @returns {void}
	 */ commitRepeat({ items: items, key: key, renderItem: renderItem }) {
        const source = (0, $ddc1f6d2e8302eb4$export$3f854e0fe5c8eeab)(items) ? items.get() : items;
        const list = Array.isArray(source) ? source : (0, $9288b1052383715d$export$9652023d9040757)(source) ? [
            ...source
        ] : [];
        /** @type {RepeatState} */ const state = this.repeatState ?? {
            blocks: new Map()
        };
        /** @type {Map<string | number | symbol, RepeatBlock>} */ const nextBlocks = new Map();
        const seenKeys = new Set();
        let referenceNode = this.end;
        // Walking backwards gives each block a stable anchor to move before.
        for(let index = list.length - 1; index >= 0; index -= 1){
            const item = list[index];
            const itemKey = key(item);
            if (seenKeys.has(itemKey)) throw new Error(`repeat() keys must be unique. Duplicate key: ${String(itemKey)}`);
            seenKeys.add(itemKey);
            let block = state.blocks.get(itemKey);
            if (!block) {
                block = $62c193ab522d398e$var$createBlock(itemKey, referenceNode);
                block.part.setValue(renderItem(item));
                block.item = item;
            } else {
                if (!(0, $9288b1052383715d$export$da3538d07c8d6283)(block.start, block.end, referenceNode)) (0, $9288b1052383715d$export$fb90815deade15c)(block.start, block.end, referenceNode);
                if (block.item !== item) {
                    block.part.setValue(renderItem(item));
                    block.item = item;
                }
            }
            nextBlocks.set(itemKey, block);
            referenceNode = block.start;
        }
        for (const [itemKey, block] of state.blocks.entries()){
            if (nextBlocks.has(itemKey)) continue;
            (0, $9288b1052383715d$export$6d0e8393b4347678)(block.start, block.end);
            block.start.remove();
            block.end.remove();
        }
        state.blocks = nextBlocks;
        this.repeatState = state;
        this.currentTemplateInstance = null;
    }
}


/**
 * Event listener part used for @event bindings inside templates.
 */ class $3af3bf1c2daf75cd$export$b28e368652651bd7 {
    /**
	 * @param {Element} element
	 * @param {string} name
	 */ constructor(element, name){
        /** @type {Element} */ this.element = element;
        /** @type {string} */ this.name = name;
        /** @type {EventListener | null} */ this.listener = null;
    }
    /**
	 * Replaces the active event listener with the provided callback.
	 * @param {unknown} value
	 * @returns {void}
	 */ setValue(value) {
        if (this.listener) {
            this.element.removeEventListener(this.name, this.listener);
            this.listener = null;
        }
        if (typeof value !== "function") return;
        this.listener = value;
        this.element.addEventListener(this.name, this.listener);
    }
}





class $ac05f82ea9e9da5f$export$b78f5e1c476c794e extends (0, $62b0c02417fac1fe$export$7b5bf7981d51054e) {
    /**
	 * @param {HTMLElement & Record<string, any>} element
	 * @param {string} name
	 */ constructor(element, name){
        super();
        /** @type {HTMLElement & Record<string, any>} */ this.element = element;
        /** @type {string} */ this.name = name;
    }
    /**
	 * Resolves signals before committing the latest property value.
	 * @param {unknown} value
	 * @returns {void}
	 */ setValue(value) {
        if ((0, $ddc1f6d2e8302eb4$export$3f854e0fe5c8eeab)(value)) {
            this.bindSignal(value, (resolved)=>this.commit(resolved));
            return;
        }
        this.disposeSignal();
        this.commit(value);
    }
    /**
	 * Writes the resolved value to the backing DOM property.
	 * @param {unknown} value
	 * @returns {void}
	 */ commit(value) {
        this.element[this.name] = value;
    }
}





const $d9ee02bb944e621f$var$ATTRIBUTE_PART_RE = /([.@]?[-\w:]+)\s*=\s*(?:"|'|)?$/;
const $d9ee02bb944e621f$var$COMMENT_PART_RE = /^part:(\d+)$/;
const $d9ee02bb944e621f$var$PLACEHOLDER_PART_RE = /^__part_(\d+)__$/;
/**
 * Parsed placeholder descriptor stored in the template cache.
 * @typedef {{ type: "child", index: number, path: number[] } | { type: "attribute" | "property" | "event", index: number, name: string, rawName: string, path: number[] }} TemplateDescriptor
 */ /**
 * Cached template record reused across template literal instances.
 * @typedef {object} TemplateRecord
 * @property {HTMLTemplateElement} template
 * @property {TemplateDescriptor[]} descriptors
 */ /**
 * Minimal part contract shared by all template part implementations.
 * @typedef {{ setValue(value: unknown): void }} TemplatePart
 */ const $d9ee02bb944e621f$var$templateCache = new WeakMap();
/**
 * Computes the index of a node within its parent without allocating an array copy.
 * @param {Node} node
 * @returns {number}
 */ function $d9ee02bb944e621f$var$getChildIndex(node) {
    let index = 0;
    let current = node;
    while(current.previousSibling){
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
 */ function $d9ee02bb944e621f$var$getNodePath(node, root) {
    const path = [];
    let current = node;
    while(current && current !== root){
        const parent = current.parentNode;
        if (!parent) break;
        path.unshift($d9ee02bb944e621f$var$getChildIndex(current));
        current = parent;
    }
    return path;
}
/**
 * Resolves a previously stored node path inside a cloned fragment.
 * @param {ParentNode} root
 * @param {number[]} path
 * @returns {Node}
 */ function $d9ee02bb944e621f$var$resolveNodePath(root, path) {
    let current = root;
    for (const index of path)current = current.childNodes[index];
    return current;
}
/**
 * Parses a template literal once and caches the placeholder descriptors by string identity.
 * @param {TemplateStringsArray} strings
 * @returns {TemplateRecord}
 */ function $d9ee02bb944e621f$var$getTemplate(strings) {
    let record = $d9ee02bb944e621f$var$templateCache.get(strings);
    if (record) return record;
    let markup = "";
    for(let index = 0; index < strings.length - 1; index += 1){
        const chunk = strings[index];
        markup += chunk;
        const attributeMatch = chunk.match($d9ee02bb944e621f$var$ATTRIBUTE_PART_RE);
        if (attributeMatch) markup += `__part_${index}__`;
        else markup += `<!--part:${index}-->`;
    }
    markup += strings[strings.length - 1];
    const template = document.createElement("template");
    template.innerHTML = markup;
    /** @type {TemplateDescriptor[]} */ const descriptors = [];
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
    let node = walker.nextNode();
    while(node){
        if (node.nodeType === Node.COMMENT_NODE) {
            const match = node.data.match($d9ee02bb944e621f$var$COMMENT_PART_RE);
            if (match) descriptors.push({
                type: "child",
                index: Number(match[1]),
                path: $d9ee02bb944e621f$var$getNodePath(node, template.content)
            });
            node = walker.nextNode();
            continue;
        }
        if (node.nodeType === Node.ELEMENT_NODE) for (const attribute of [
            ...node.attributes
        ]){
            const match = attribute.value.match($d9ee02bb944e621f$var$PLACEHOLDER_PART_RE);
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
                type: type,
                index: Number(match[1]),
                name: name,
                rawName: rawName,
                path: $d9ee02bb944e621f$var$getNodePath(node, template.content)
            });
        }
        node = walker.nextNode();
    }
    record = {
        template: template,
        descriptors: descriptors
    };
    $d9ee02bb944e621f$var$templateCache.set(strings, record);
    return record;
}
class $d9ee02bb944e621f$export$6eecef7813f38266 {
    /**
	 * @param {TemplateStringsArray} strings
	 */ constructor(strings){
        /** @type {TemplateStringsArray} */ this.strings = strings;
        const record = $d9ee02bb944e621f$var$getTemplate(strings);
        /** @type {DocumentFragment} */ this.fragment = record.template.content.cloneNode(true);
        /** @type {Map<number, TemplatePart>} */ this.parts = new Map();
        const resolved = record.descriptors.map((descriptor)=>({
                descriptor: descriptor,
                node: $d9ee02bb944e621f$var$resolveNodePath(this.fragment, descriptor.path)
            }));
        for (const { descriptor: descriptor, node: node } of resolved){
            /** @type {TemplatePart | undefined} */ let part;
            if (descriptor.type === "child") {
                const start = document.createComment(`start:${descriptor.index}`);
                const end = document.createComment(`end:${descriptor.index}`);
                node.replaceWith(start, end);
                part = new (0, $62c193ab522d398e$export$597ccc9503a8c0eb)(start, end);
            } else if (descriptor.type === "attribute") {
                node.removeAttribute(descriptor.rawName);
                part = new (0, $0b656303a55759eb$export$da9b3ca39c846561)(node, descriptor.name);
            } else if (descriptor.type === "property") {
                node.removeAttribute(descriptor.rawName);
                part = new (0, $ac05f82ea9e9da5f$export$b78f5e1c476c794e)(node, descriptor.name);
            } else if (descriptor.type === "event") {
                node.removeAttribute(descriptor.rawName);
                part = new (0, $3af3bf1c2daf75cd$export$b28e368652651bd7)(node, descriptor.name);
            }
            if (!part) continue;
            this.parts.set(descriptor.index, part);
        }
    }
    /**
	 * Pushes the latest template values into their matching DOM parts.
	 * @param {unknown[]} values
	 * @returns {void}
	 */ update(values) {
        for(let index = 0; index < values.length; index += 1){
            const part = this.parts.get(index);
            if (!part) continue;
            part.setValue(values[index]);
        }
    }
}




(0, $af61e58368c28380$export$882afaa758b4a5e)((0, $d9ee02bb944e621f$export$6eecef7813f38266));
function $7abe028e89020be7$export$b3890eb0ae9dca99(result, container) {
    let rootPart = container.__rootPart;
    if (!rootPart) {
        const start = document.createComment("root:start");
        const end = document.createComment("root:end");
        container.textContent = "";
        container.append(start, end);
        rootPart = new (0, $62c193ab522d398e$export$597ccc9503a8c0eb)(start, end);
        container.__rootPart = rootPart;
    }
    rootPart.setValue(result);
}






/**
 * Public exports for the demo state layer.
 */ /**
 * Public exports for the demo seed data and filtering helpers.
 */ /**
 * Priority level supported by the todo demo.
 * @typedef {"low" | "medium" | "high"} TodoPriority
 */ /**
 * Filter status tokens supported by the pipeline.
 * @typedef {"all" | "open" | "done"} FilterStatus
 */ /**
 * Sort direction tokens supported by the pipeline.
 * @typedef {"asc" | "desc"} SortDirection
 */ /**
 * Sort fields supported by the pipeline.
 * @typedef {"createdAt" | "title" | "priority" | "dueDate" | "category"} SortField
 */ /**
 * Single todo item rendered by the demo.
 * @typedef {object} TodoItem
 * @property {string} id
 * @property {string} title
 * @property {string} notes
 * @property {string} category
 * @property {TodoPriority} priority
 * @property {string} dueDate
 * @property {boolean} completed
 * @property {boolean} selected
 * @property {number} createdAt
 */ /**
 * Draft state used by the quick add form.
 * @typedef {object} DraftTodo
 * @property {string} title
 * @property {string} notes
 * @property {string} category
 * @property {TodoPriority} priority
 * @property {string} dueDate
 */ /**
 * Filters used by the generator based pipeline.
 * @typedef {object} FiltersState
 * @property {string} search
 * @property {string} category
 * @property {FilterStatus} status
 * @property {"all" | TodoPriority} priority
 * @property {SortField} sortBy
 * @property {SortDirection} sortDir
 */ /**
 * Single entry shown in the debug event log.
 * @typedef {object} DebugLogEntry
 * @property {string} id
 * @property {string} timestamp
 * @property {string} path
 * @property {unknown} oldValue
 * @property {unknown} newValue
 */ /**
 * Debug panel state.
 * @typedef {object} DebugState
 * @property {boolean} paused
 * @property {DebugLogEntry[]} logs
 */ /**
 * Complete application state stored in the proxy store.
 * @typedef {object} DemoState
 * @property {TodoItem[]} todos
 * @property {string[]} categories
 * @property {DraftTodo} draft
 * @property {FiltersState} filters
 * @property {DebugState} debug
 */ /**
 * Milliseconds in 24 hours.
 * @type {number}
 */ const $06b29efc0df72600$export$6528ba843dda7ec0 = 86400000;
function $06b29efc0df72600$export$9d2f78e9b50920f5() {
    const now = Date.now();
    return {
        todos: [
            {
                id: crypto.randomUUID(),
                title: "Prepare the talk intro",
                notes: "Open with the comparison between expensive frameworks and DOM-first",
                category: "Talk",
                priority: "high",
                dueDate: new Date(now + $06b29efc0df72600$export$6528ba843dda7ec0).toISOString().slice(0, 10),
                completed: false,
                selected: false,
                createdAt: now - 800000
            },
            {
                id: crypto.randomUUID(),
                title: "Refine the keyed repeat engine",
                notes: "Verify node movement and cleanup of removed blocks",
                category: "Engine",
                priority: "medium",
                dueDate: new Date(now + 2 * $06b29efc0df72600$export$6528ba843dda7ec0).toISOString().slice(0, 10),
                completed: false,
                selected: true,
                createdAt: now - 600000
            },
            {
                id: crypto.randomUUID(),
                title: "Record demo screenshot",
                notes: "Show the store:change event panel",
                category: "Assets",
                priority: "low",
                dueDate: new Date(now + 3 * $06b29efc0df72600$export$6528ba843dda7ec0).toISOString().slice(0, 10),
                completed: true,
                selected: false,
                createdAt: now - 400000
            }
        ],
        categories: [
            "Inbox",
            "Talk",
            "Engine",
            "Assets",
            "Research"
        ],
        draft: {
            title: "",
            notes: "",
            category: "Inbox",
            priority: "medium",
            dueDate: new Date(now + $06b29efc0df72600$export$6528ba843dda7ec0).toISOString().slice(0, 10)
        },
        filters: {
            search: "",
            category: "all",
            status: "all",
            priority: "all",
            sortBy: "createdAt",
            sortDir: "desc"
        },
        debug: {
            paused: false,
            logs: []
        }
    };
}


/** @typedef {import("./_data.js").FiltersState} FiltersState */ /** @typedef {import("./_data.js").SortDirection} SortDirection */ /** @typedef {import("./_data.js").SortField} SortField */ /** @typedef {import("./_data.js").TodoItem} TodoItem */ /** @typedef {import("./_data.js").TodoPriority} TodoPriority */ /**
 * Numeric ranking used when sorting by semantic priority.
 * @type {Record<TodoPriority, number>}
 */ const $a303019b69a0b006$var$priorityRank = {
    low: 0,
    medium: 1,
    high: 2
};
const $a303019b69a0b006$var$textCollator = new Intl.Collator("en");
function* $a303019b69a0b006$export$571d59b505e6bb4e(items) {
    for (const item of items)yield item;
}
function* $a303019b69a0b006$export$8b8e2e3e5a90c9ec(source, search) {
    const query = search.trim().toLowerCase();
    if (!query) {
        yield* source;
        return;
    }
    for (const item of source){
        const haystack = `${item.title} ${item.notes} ${item.category} ${item.priority}`.toLowerCase();
        if (haystack.includes(query)) yield item;
    }
}
function* $a303019b69a0b006$export$6d1731a321e8bdf4(source, category) {
    if (category === "all") {
        yield* source;
        return;
    }
    for (const item of source)if (item.category === category) yield item;
}
function* $a303019b69a0b006$export$1caf81d27b0e4d0e(source, status) {
    if (status === "all") {
        yield* source;
        return;
    }
    for (const item of source){
        if (status === "done" && item.completed) yield item;
        if (status === "open" && !item.completed) yield item;
    }
}
function* $a303019b69a0b006$export$710b0eb282166a50(source, priority) {
    if (priority === "all") {
        yield* source;
        return;
    }
    for (const item of source)if (item.priority === priority) yield item;
}
function $a303019b69a0b006$export$37d6196a3a272f63(items, sortBy, sortDir) {
    const direction = sortDir === "asc" ? 1 : -1;
    const sorted = [
        ...items
    ];
    sorted.sort((left, right)=>{
        let a = left[sortBy];
        let b = right[sortBy];
        if (sortBy === "priority") {
            a = $a303019b69a0b006$var$priorityRank[/** @type {TodoPriority} */ a];
            b = $a303019b69a0b006$var$priorityRank[/** @type {TodoPriority} */ b];
        }
        if (sortBy === "title" || sortBy === "category") return direction * $a303019b69a0b006$var$textCollator.compare(String(a), String(b));
        if (a === b) return 0;
        return a > b ? direction : -direction;
    });
    return sorted;
}
function $a303019b69a0b006$export$bf029022d7d8cf58(todos, filters) {
    const iterator = $a303019b69a0b006$export$710b0eb282166a50($a303019b69a0b006$export$1caf81d27b0e4d0e($a303019b69a0b006$export$6d1731a321e8bdf4($a303019b69a0b006$export$8b8e2e3e5a90c9ec($a303019b69a0b006$export$571d59b505e6bb4e(todos), filters.search), filters.category), filters.status), filters.priority);
    return $a303019b69a0b006$export$37d6196a3a272f63(iterator, filters.sortBy, filters.sortDir);
}






/** @typedef {import("../data/_data.js").DebugLogEntry} DebugLogEntry */ /** @typedef {import("../data/_data.js").DemoState} DemoState */ const $d4d6ce02c651568a$var$STORAGE_KEY = "vanilla-signals-demo-state-v1";
const $d4d6ce02c651568a$var$MAX_DEBUG_LOG_ENTRIES = 30;
/**
 * Shape emitted by the proxy store on every mutation.
 * @typedef {object} StoreChangeDetail
 * @property {string} path
 * @property {unknown} oldValue
 * @property {unknown} newValue
 */ /**
 * Reads the persisted state when available and falls back to the seed data on malformed payloads.
 * @returns {DemoState}
 */ function $d4d6ce02c651568a$var$readInitialState() {
    const saved = localStorage.getItem($d4d6ce02c651568a$var$STORAGE_KEY);
    if (!saved) return (0, $06b29efc0df72600$export$9d2f78e9b50920f5)();
    try {
        return /** @type {DemoState} */ JSON.parse(saved);
    } catch  {
        return (0, $06b29efc0df72600$export$9d2f78e9b50920f5)();
    }
}
const $d4d6ce02c651568a$export$6f57813fe9f31bf9 = new (0, $2e13bdf7d5a90895$export$390f32400eaf98c9)($d4d6ce02c651568a$var$readInitialState());
const $d4d6ce02c651568a$export$82ae485178b37419 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).State(0, {
    equals: ()=>false
});
let $d4d6ce02c651568a$var$isWritingDebugLog = false;
/**
 * Appends the latest store mutation to the debug panel.
 * @param {StoreChangeDetail} detail
 * @returns {void}
 */ function $d4d6ce02c651568a$var$appendDebugLog(detail) {
    /** @type {DebugLogEntry[]} */ const nextLogs = [
        {
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString("en-GB"),
            ...detail
        },
        ...$d4d6ce02c651568a$export$6f57813fe9f31bf9.state.debug.logs
    ].slice(0, $d4d6ce02c651568a$var$MAX_DEBUG_LOG_ENTRIES);
    $d4d6ce02c651568a$export$6f57813fe9f31bf9.state.debug.logs = nextLogs;
}
/**
 * Persists a serializable snapshot after each successful mutation.
 * @returns {void}
 */ function $d4d6ce02c651568a$var$persistState() {
    const snapshot = $d4d6ce02c651568a$export$6f57813fe9f31bf9.snapshot();
    localStorage.setItem($d4d6ce02c651568a$var$STORAGE_KEY, JSON.stringify(snapshot));
}
/**
 * Synchronizes persistence, debug logging, and view invalidation after store writes.
 * @param {CustomEvent<StoreChangeDetail>} event
 * @returns {void}
 */ function $d4d6ce02c651568a$var$handleStoreChange(event) {
    // The debug panel writes back into the same store, so nested debug events are ignored.
    if ($d4d6ce02c651568a$var$isWritingDebugLog) return;
    if (!$d4d6ce02c651568a$export$6f57813fe9f31bf9.state.debug.paused && event.detail.path !== "debug.logs") {
        $d4d6ce02c651568a$var$isWritingDebugLog = true;
        try {
            $d4d6ce02c651568a$var$appendDebugLog(event.detail);
        } finally{
            $d4d6ce02c651568a$var$isWritingDebugLog = false;
        }
    }
    $d4d6ce02c651568a$var$persistState();
    $d4d6ce02c651568a$export$82ae485178b37419.set(performance.now());
}
window.addEventListener("store:change", $d4d6ce02c651568a$var$handleStoreChange);
const $d4d6ce02c651568a$var$appRoot = document.querySelector("#app");
if (!($d4d6ce02c651568a$var$appRoot instanceof HTMLElement)) throw new Error('Missing "#app" mount point.');
const $d4d6ce02c651568a$export$e8e78c978b129247 = $d4d6ce02c651568a$var$appRoot;
const $d4d6ce02c651568a$export$5bc70640704fc231 = new URLSearchParams(window.location.search).get("embed") === "1";


function $e7fc6334fbdf7a34$export$47f24ad00f3dae3b(id) {
    return (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.find((todo)=>todo.id === id);
}
function $e7fc6334fbdf7a34$export$cb3f627a9987da4(id, patch) {
    const index = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.findIndex((todo)=>todo.id === id);
    if (index < 0) return;
    const current = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos[index];
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos[index] = {
        ...current,
        ...patch
    };
}
function $e7fc6334fbdf7a34$export$e28613275eaf222a(id) {
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.filter((todo)=>todo.id !== id);
}
function $e7fc6334fbdf7a34$export$61605cd041f63b9e() {
    const draft = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.draft;
    if (!draft.title.trim()) return;
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos = [
        {
            id: crypto.randomUUID(),
            title: draft.title.trim(),
            notes: draft.notes.trim(),
            category: draft.category,
            priority: draft.priority,
            dueDate: draft.dueDate,
            completed: false,
            selected: false,
            createdAt: Date.now()
        },
        ...(0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos
    ];
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.draft = {
        ...(0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.draft,
        title: "",
        notes: "",
        category: (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.categories[0] ?? "Inbox",
        priority: "medium",
        dueDate: new Date(Date.now() + (0, $06b29efc0df72600$export$6528ba843dda7ec0)).toISOString().slice(0, 10)
    };
}
function $e7fc6334fbdf7a34$export$5fc0b3244908acb1(nextCompleted) {
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.map((todo)=>todo.selected ? {
            ...todo,
            completed: nextCompleted
        } : todo);
}
function $e7fc6334fbdf7a34$export$506d15c4e9b18697() {
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.filter((todo)=>!todo.completed);
}
function $e7fc6334fbdf7a34$export$94eed54c57cc7a74() {
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.filter((todo)=>!todo.selected);
}
function $e7fc6334fbdf7a34$export$a3d02541b0ebf605() {
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.map((todo)=>({
            ...todo,
            selected: false
        }));
}
function $e7fc6334fbdf7a34$export$655a6c62e8b4fb20(visibleTodos) {
    const ids = new Set(visibleTodos.peek().map((todo)=>todo.id));
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos.map((todo)=>({
            ...todo,
            selected: ids.has(todo.id) ? true : todo.selected
        }));
}
function $e7fc6334fbdf7a34$export$33005c1ca00aaa85() {
    const value = prompt("New category")?.trim();
    if (!value) return;
    if ((0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.categories.includes(value)) return;
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.categories = [
        ...(0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.categories,
        value
    ];
}
function $e7fc6334fbdf7a34$export$da3f8d114e8c057b() {
    (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).replace((0, $06b29efc0df72600$export$9d2f78e9b50920f5)());
    (0, $d4d6ce02c651568a$export$82ae485178b37419).set(performance.now());
}





const $5cc15840d92550af$export$8b99777788497157 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>{
    (0, $d4d6ce02c651568a$export$82ae485178b37419).get();
    return (0, $a303019b69a0b006$export$bf029022d7d8cf58)((0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos, (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.filters);
});
const $5cc15840d92550af$export$9a2dbef7a17e2e58 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>{
    (0, $d4d6ce02c651568a$export$82ae485178b37419).get();
    const todos = (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.todos;
    let total = 0;
    let completed = 0;
    let selected = 0;
    for (const todo of todos){
        total += 1;
        if (todo.completed) completed += 1;
        if (todo.selected) selected += 1;
    }
    /** @type {TodoSummary} */ return {
        total: total,
        completed: completed,
        open: total - completed,
        selected: selected,
        visible: $5cc15840d92550af$export$8b99777788497157.get().length
    };
});
const $5cc15840d92550af$export$8310f1f9ac8c5e03 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>{
    (0, $d4d6ce02c651568a$export$82ae485178b37419).get();
    return [
        "all",
        ...(0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.categories
    ];
});
const $5cc15840d92550af$export$76fe83c1dfaa640 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>$5cc15840d92550af$export$9a2dbef7a17e2e58.get().total);
const $5cc15840d92550af$export$371eecdf1cc71c1 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>$5cc15840d92550af$export$9a2dbef7a17e2e58.get().open);
const $5cc15840d92550af$export$88f15c3964964328 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>$5cc15840d92550af$export$9a2dbef7a17e2e58.get().completed);
const $5cc15840d92550af$export$6d0d1f2d45527f9d = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>$5cc15840d92550af$export$9a2dbef7a17e2e58.get().visible);
const $5cc15840d92550af$export$c8b6bdf40f258866 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>$5cc15840d92550af$export$9a2dbef7a17e2e58.get().selected);
const $5cc15840d92550af$export$6551ed5df8b5b8fd = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>`${$5cc15840d92550af$export$9a2dbef7a17e2e58.get().visible} visible item(s), sorted by ${(0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.filters.sortBy}`);
const $5cc15840d92550af$export$1995e61c0a944ec3 = new (0, $ddc1f6d2e8302eb4$export$8210dfe1863c478).Computed(()=>{
    (0, $d4d6ce02c651568a$export$82ae485178b37419).get();
    return (0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.debug.logs;
});





/**
 * Public exports for the demo view layer.
 */ 
/**
 * Public exports for the dashboard panels.
 */ 

function $f92d04f67b32fc3d$export$7a3d9d3626c02784() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <section class="demo-header card glass">
      <div>
        <p class="eyebrow">VanillaJS, Signals, DOM Parts</p>
        <h1>Advanced Todo, no framework</h1>
        <p class="subcopy">Two-way binding, repeat keyed, Proxy store, event log, generator pipeline.</p>
      </div>
      <div class="header-actions">
        <button @click=${0, $e7fc6334fbdf7a34$export$da3f8d114e8c057b}>Reset demo</button>
        <button class="ghost" @click=${0, $e7fc6334fbdf7a34$export$33005c1ca00aaa85}>New category</button>
      </div>
    </section>
  `;
}




function $c9a43fbbbe7165e0$export$efd72f2a8ee930a1() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <article class="card panel">
      <h2>Bulk actions</h2>
      <div class="button-grid">
        <button @click=${()=>(0, $e7fc6334fbdf7a34$export$655a6c62e8b4fb20)((0, $5cc15840d92550af$export$8b99777788497157))}>Select visible</button>
        <button class="ghost" @click=${0, $e7fc6334fbdf7a34$export$a3d02541b0ebf605}>Clear selection</button>
        <button @click=${()=>(0, $e7fc6334fbdf7a34$export$5fc0b3244908acb1)(true)}>Complete selected</button>
        <button class="ghost" @click=${()=>(0, $e7fc6334fbdf7a34$export$5fc0b3244908acb1)(false)}>Reopen selected</button>
        <button class="ghost danger" @click=${0, $e7fc6334fbdf7a34$export$94eed54c57cc7a74}>Delete selected</button>
        <button class="ghost danger" @click=${0, $e7fc6334fbdf7a34$export$506d15c4e9b18697}>Delete completed</button>
      </div>
    </article>
  `;
}



/**
 * Public exports for reusable template helpers.
 */ 

function $f0ef8da3f865c839$export$16360a4aefd60ae4(path, options = {}) {
    return (0, $0f2e482d1db633b7$export$39a8f6bed6e94390)({
        signal: (0, $d4d6ce02c651568a$export$82ae485178b37419),
        get: ()=>(0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).get(path),
        set: (value)=>(0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).set(path, value),
        ...options
    });
}
function $f0ef8da3f865c839$export$a655c7597505e2db(todoId, field, options = {}) {
    return (0, $0f2e482d1db633b7$export$39a8f6bed6e94390)({
        signal: (0, $d4d6ce02c651568a$export$82ae485178b37419),
        get: ()=>(0, $e7fc6334fbdf7a34$export$47f24ad00f3dae3b)(todoId)?.[field] ?? (options.prop === "checked" ? false : ""),
        set: (value)=>(0, $e7fc6334fbdf7a34$export$cb3f627a9987da4)(todoId, {
                [field]: value
            }),
        ...options
    });
}
function $f0ef8da3f865c839$export$426717e7f687ece8() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <option value="low">low</option>
    <option value="medium">medium</option>
    <option value="high">high</option>
  `;
}
function $f0ef8da3f865c839$export$f1fbe602cd4f5c23() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <option value="all">all</option>
    <option value="low">low</option>
    <option value="medium">medium</option>
    <option value="high">high</option>
  `;
}
function $f0ef8da3f865c839$export$41b4ed1d609e670b() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <option value="all">all</option>
    <option value="open">open</option>
    <option value="done">done</option>
  `;
}
function $f0ef8da3f865c839$export$41e05e039486b21b() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <option value="asc">asc</option>
    <option value="desc">desc</option>
  `;
}
function $f0ef8da3f865c839$export$cbdab8a1bb13988e() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <option value="createdAt">createdAt</option>
    <option value="title">title</option>
    <option value="priority">priority</option>
    <option value="dueDate">dueDate</option>
    <option value="category">category</option>
  `;
}
function $f0ef8da3f865c839$export$160ce78ac2649d60(modelDirective) {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <select model=${modelDirective}>
      ${(0, $0f2e482d1db633b7$export$76d90c956114f2c2)((0, $d4d6ce02c651568a$export$6f57813fe9f31bf9).state.categories, (item)=>item, (item)=>(0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`<option value=${item}>${item}</option>`)}
    </select>
  `;
}
function $f0ef8da3f865c839$export$f765a644dcb18b0(signal, label) {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <article class="card stat">
      <strong>${signal}</strong>
      <span>${label}</span>
    </article>
  `;
}






function $9f9cad44546a16f5$export$8ef204697900e1a4(entry) {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <article class="log-entry">
      <header>
        <strong>${entry.path || "(root)"}</strong>
        <time>${entry.timestamp}</time>
      </header>
      <pre>${JSON.stringify({
        oldValue: entry.oldValue,
        newValue: entry.newValue
    }, null, 2)}</pre>
    </article>
  `;
}


function $1a74d1e1c885bf08$export$c47568b904cd69c7() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <article class="card panel debug-panel">
      <div class="debug-head">
        <h2>store:change log</h2>
        <label class="checkline compact-inline">
          <input type="checkbox" model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("debug.paused", {
        prop: "checked",
        event: "change"
    })} />
          <span>pause log</span>
        </label>
      </div>
      <div class="log-list">${(0, $0f2e482d1db633b7$export$76d90c956114f2c2)((0, $5cc15840d92550af$export$1995e61c0a944ec3), (entry)=>entry.id, (0, $9f9cad44546a16f5$export$8ef204697900e1a4))}</div>
    </article>
  `;
}





function $310e413dba32de6d$export$8c4122e5d06fc65e() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <article class="card panel">
      <h2>Filters + sorting</h2>
      <label>
        <span>Search</span>
        <input placeholder="Search title, notes, category..." model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("filters.search")} />
      </label>
      <div class="form-grid">
        <label>
          <span>Status</span>
          <select model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("filters.status", {
        event: "change"
    })}>
            ${(0, $f0ef8da3f865c839$export$41b4ed1d609e670b)()}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("filters.category", {
        event: "change"
    })}>
            ${(0, $0f2e482d1db633b7$export$76d90c956114f2c2)((0, $5cc15840d92550af$export$8310f1f9ac8c5e03), (item)=>item, (item)=>(0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`<option value=${item}>${item}</option>`)}
          </select>
        </label>
      </div>
      <div class="form-grid">
        <label>
          <span>Priority</span>
          <select model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("filters.priority", {
        event: "change"
    })}>
            ${(0, $f0ef8da3f865c839$export$f1fbe602cd4f5c23)()}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("filters.sortBy", {
        event: "change"
    })}>
            ${(0, $f0ef8da3f865c839$export$cbdab8a1bb13988e)()}
          </select>
        </label>
      </div>
      <label>
        <span>Direction</span>
        <select model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("filters.sortDir", {
        event: "change"
    })}>
          ${(0, $f0ef8da3f865c839$export$41e05e039486b21b)()}
        </select>
      </label>
    </article>
  `;
}





function $81b1ab6150b44718$export$cede3ac296c7b46e() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <article class="card panel">
      <h2>Quick add</h2>
      <label>
        <span>Title</span>
        <input placeholder="What needs to happen?" model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("draft.title")} />
      </label>
      <label>
        <span>Notes</span>
        <textarea rows="3" model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("draft.notes")}></textarea>
      </label>
      <div class="form-grid">
        <label>
          <span>Category</span>
          ${(0, $f0ef8da3f865c839$export$160ce78ac2649d60)((0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("draft.category", {
        event: "change"
    }))}
        </label>
        <label>
          <span>Priority</span>
          <select model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("draft.priority", {
        event: "change"
    })}>
            ${(0, $f0ef8da3f865c839$export$426717e7f687ece8)()}
          </select>
        </label>
      </div>
      <label>
        <span>Due date</span>
        <input type="date" model=${(0, $f0ef8da3f865c839$export$16360a4aefd60ae4)("draft.dueDate", {
        event: "change"
    })} />
      </label>
      <button @click=${0, $e7fc6334fbdf7a34$export$61605cd041f63b9e}>Add todo</button>
    </article>
  `;
}





function $f2823a4890c1c2ec$export$e6046b8439a66919() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <section class="stats-row">
      ${(0, $f0ef8da3f865c839$export$f765a644dcb18b0)((0, $5cc15840d92550af$export$76fe83c1dfaa640), "Total")} ${(0, $f0ef8da3f865c839$export$f765a644dcb18b0)((0, $5cc15840d92550af$export$371eecdf1cc71c1), "Open")} ${(0, $f0ef8da3f865c839$export$f765a644dcb18b0)((0, $5cc15840d92550af$export$88f15c3964964328), "Done")}
      ${(0, $f0ef8da3f865c839$export$f765a644dcb18b0)((0, $5cc15840d92550af$export$6d0d1f2d45527f9d), "Visible")} ${(0, $f0ef8da3f865c839$export$f765a644dcb18b0)((0, $5cc15840d92550af$export$c8b6bdf40f258866), "Selected")}
    </section>
  `;
}







function $63d22660e2ecc5d6$export$6a7d7e4871a2122f(todo) {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <article class=${todo.completed ? "todo-card is-done" : "todo-card"}>
      <header class="todo-main">
        <label class="checkline">
          <input model=${(0, $f0ef8da3f865c839$export$a655c7597505e2db)(todo.id, "selected", {
        prop: "checked",
        event: "change"
    })} type="checkbox" />
          <span>select</span>
        </label>
        <label class="checkline done-toggle">
          <input model=${(0, $f0ef8da3f865c839$export$a655c7597505e2db)(todo.id, "completed", {
        prop: "checked",
        event: "change"
    })} type="checkbox" />
          <span>done</span>
        </label>
        <input class="todo-title" model=${(0, $f0ef8da3f865c839$export$a655c7597505e2db)(todo.id, "title")} />
      </header>

      <div class="todo-meta-grid">
        <label>
          <span>Category</span>
          ${(0, $f0ef8da3f865c839$export$160ce78ac2649d60)((0, $f0ef8da3f865c839$export$a655c7597505e2db)(todo.id, "category", {
        event: "change"
    }))}
        </label>
        <label>
          <span>Priority</span>
          <select model=${(0, $f0ef8da3f865c839$export$a655c7597505e2db)(todo.id, "priority", {
        event: "change"
    })}>
            ${(0, $f0ef8da3f865c839$export$426717e7f687ece8)()}
          </select>
        </label>
        <label>
          <span>Due date</span>
          <input type="date" model=${(0, $f0ef8da3f865c839$export$a655c7597505e2db)(todo.id, "dueDate", {
        event: "change"
    })} />
        </label>
      </div>

      <label class="notes-box">
        <span>Notes</span>
        <textarea rows="2" model=${(0, $f0ef8da3f865c839$export$a655c7597505e2db)(todo.id, "notes")}></textarea>
      </label>

      <footer class="todo-footer">
        <span class=${`priority-chip ${todo.priority}`}>${todo.priority}</span>
        <button @click=${()=>(0, $e7fc6334fbdf7a34$export$e28613275eaf222a)(todo.id)} class="ghost danger">Delete</button>
      </footer>
    </article>
  `;
}


function $57fc808db91bc92b$export$cc94726d9c15849e() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <section class="center-column">
      <div class="list-head">
        <h2>Reactive list</h2>
        <p>${0, $5cc15840d92550af$export$6551ed5df8b5b8fd}</p>
      </div>
      <div class="todo-list">${(0, $0f2e482d1db633b7$export$76d90c956114f2c2)((0, $5cc15840d92550af$export$8b99777788497157), (todo)=>todo.id, (0, $63d22660e2ecc5d6$export$6a7d7e4871a2122f))}</div>
    </section>
  `;
}




function $1a81540251e2c9a6$export$5ca3231658ee16f() {
    return (0, $0f2e482d1db633b7$export$c0bb0b647f701bb5)`
    <main class="demo-shell">
      ${(0, $f92d04f67b32fc3d$export$7a3d9d3626c02784)()} ${(0, $f2823a4890c1c2ec$export$e6046b8439a66919)()}

      <section class="workspace-grid">
        <aside class="left-column">
          ${(0, $81b1ab6150b44718$export$cede3ac296c7b46e)()} ${(0, $310e413dba32de6d$export$8c4122e5d06fc65e)()} ${(0, $c9a43fbbbe7165e0$export$efd72f2a8ee930a1)()}
        </aside>

        ${(0, $57fc808db91bc92b$export$cc94726d9c15849e)()}

        <aside class="right-column">
          ${(0, $1a74d1e1c885bf08$export$c47568b904cd69c7)()}
        </aside>
      </section>
    </main>
  `;
}





/**
 * Bootstraps the demo and keeps the root view in sync with store driven invalidations.
 */ document.documentElement.dataset.embed = String((0, $d4d6ce02c651568a$export$5bc70640704fc231));
(0, $ddc1f6d2e8302eb4$export$dc573d8a6576cdb3)(()=>{
    (0, $d4d6ce02c651568a$export$82ae485178b37419).get();
    (0, $7abe028e89020be7$export$b3890eb0ae9dca99)((0, $1a81540251e2c9a6$export$5ca3231658ee16f)(), (0, $d4d6ce02c651568a$export$e8e78c978b129247));
});
(0, $d4d6ce02c651568a$export$82ae485178b37419).set(performance.now());


//# sourceMappingURL=demo.c1c7db78.js.map
