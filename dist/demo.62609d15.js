let e;let t=[];function n(e,n){t.push(e);try{return n()}finally{t.pop()}}class i{constructor(){this.subscribers=new Set,this.__isSignal=!0}subscribe(e){return this.subscribers.add(e),()=>this.subscribers.delete(e)}track(){let e=t[t.length-1];e&&e.addDependency(this)}notify(){for(let e of[...this.subscribers])e()}}let s=new Set,a=!1,o=class extends i{constructor(e,t={}){super(),this.value=e,this.equals=t.equals??Object.is}get(){return this.track(),this.value}peek(){return this.value}set(e){return this.equals(this.value,e)||(this.value=e,this.notify()),this.value}},l=class extends i{constructor(e,t={}){super(),this.compute=e,this.equals=t.equals??Object.is,this.dependencies=new Map,this.cached=void 0,this.dirty=!0,this.recomputing=!1,this.boundInvalidate=this.invalidate.bind(this)}addDependency(e){if(this.dependencies.has(e))return;let t=e.subscribe(this.boundInvalidate);this.dependencies.set(e,t)}cleanupDependencies(){for(let e of this.dependencies.values())e();this.dependencies.clear()}invalidate(){this.dirty||(this.dirty=!0,this.notify())}evaluate(){if(!this.dirty||this.recomputing)return this.cached;this.recomputing=!0,this.cleanupDependencies();try{let e=n(this,()=>this.compute());return(this.dirty||!this.equals(this.cached,e))&&(this.cached=e),this.dirty=!1,this.cached}finally{this.recomputing=!1}}get(){return this.track(),this.evaluate()}peek(){return this.evaluate()}};function r(e){return!!(e&&"function"==typeof e.get&&e.__isSignal)}function c(e){return null!==e&&"object"==typeof e}function d(e,t=new WeakMap){let n=c(e)?e.__raw??e:e;if(!c(n))return n;if(t.has(n))return t.get(n);if(n instanceof Date)return new Date(n.getTime());if(n instanceof RegExp)return new RegExp(n.source,n.flags);if(n instanceof Map){let e=new Map;for(let[i,s]of(t.set(n,e),n.entries()))e.set(d(i,t),d(s,t));return e}if(n instanceof Set){let e=new Set;for(let i of(t.set(n,e),n.values()))e.add(d(i,t));return e}if(Array.isArray(n)){let e=[];for(let i of(t.set(n,e),n))e.push(d(i,t));return e}let i={};for(let e of(t.set(n,i),Reflect.ownKeys(n))){let s=Object.getOwnPropertyDescriptor(n,e);s?.enumerable&&(i[e]=d(n[e],t))}return i}function u(e){return Array.isArray(e)?e:null==e||""===e?[]:String(e).split(".").filter(Boolean)}class p{constructor(){this.value=void 0,this.signalCleanup=null}bindSignal(e,t){this.disposeSignal(),this.signalCleanup=e.subscribe(()=>t(e.get())),t(e.get())}disposeSignal(){this.signalCleanup&&this.signalCleanup(),this.signalCleanup=null}}function h(e,t){let n=e.nextSibling;for(;n&&n!==t;){let e=n.nextSibling;n.remove(),n=e}}function m(e){return e instanceof Node?e:document.createTextNode(null==e?"":String(e))}function g(e){return e&&"string"!=typeof e&&"function"==typeof e[Symbol.iterator]}let f=Symbol("directive");function y(e,...t){return{kind:"template-result",strings:e,values:t}}function b(e,t){return{[f]:!0,name:e,payload:t}}function v(e,t){return!!(e?.[f]&&(!t||e.name===t))}function w(e){return b("model",e)}function $(e,t,n){return b("repeat",{items:e,key:t,renderItem:n})}class S extends p{constructor(e,t){super(),this.element=e,this.name=t,this.modelCleanup=null,this._modelBinding=null}disposeModel(){this.modelCleanup&&this.modelCleanup(),this.modelCleanup=null}setValue(e){if("model"===this.name&&v(e,"model")){this.commitModel(e.payload),this.value=e;return}if(r(e)){this.disposeModel(),this.bindSignal(e,e=>this.commit(e));return}this.disposeModel(),this.disposeSignal(),this.commit(e)}commit(e){null==e||!1===e?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,!0===e?"":String(e))}commitModel(e){var t;let n=e.event??"input",i=e.prop??((t=this.element)instanceof HTMLInputElement&&"checkbox"===t.type?"checked":"value");if(this._modelBinding&&this._modelBinding.eventName===n&&this._modelBinding.property===i&&this._modelBinding.signal===e.signal){this._modelBinding.config=e,this._modelBinding.sync();return}this.disposeSignal(),this.disposeModel();let s={config:e,eventName:n,property:i,signal:e.signal},a=()=>{let e=s.config.get();if("checked"===i){let t=!!e;this.element.checked!==t&&(this.element.checked=t)}else{let t=e??"";if(this.element[i]===t)return;let n=document.activeElement===this.element,s="number"==typeof this.element.selectionStart&&"number"==typeof this.element.selectionEnd,a=s?this.element.selectionStart:null,o=s?this.element.selectionEnd:null;if(this.element[i]=t,n&&s&&null!==a&&null!==o){let e="string"==typeof t?t:String(t),n=Math.min(a,e.length),i=Math.min(o,e.length);this.element.setSelectionRange(n,i)}}},o=()=>{a(),this.element instanceof HTMLSelectElement&&queueMicrotask(()=>{this._modelBinding===s&&this.element.isConnected&&a()})};s.sync=a,this._modelBinding=s;let l=e=>{let t=e.currentTarget,n="checked"===i?t.checked:t[i];s.config.set(n)};(this.element.addEventListener(n,l),this.modelCleanup=()=>{this.element.removeEventListener(n,l),this._modelBinding=null},e.signal&&r(e.signal))?this.bindSignal(e.signal,o):o()}}class k extends p{constructor(e,t){super(),this.start=e,this.end=t,this.currentNode=null,this.currentTemplateInstance=null,this.repeatState=null}setValue(e){r(e)?this.bindSignal(e,e=>this.commit(e)):(this.disposeSignal(),this.commit(e))}commit(e){if(v(e,"repeat")){this.commitRepeat(e.payload),this.value=e;return}if(this.repeatState=null,e?.kind==="template-result"){this.commitTemplate(e),this.value=e;return}if(g(e)){this.currentTemplateInstance=null;let t=document.createDocumentFragment();for(let n of e)t.append(m(n));this.commitNode(t),this.value=e;return}this.currentTemplateInstance=null,this.commitNode(m(e)),this.value=e}commitNode(e){h(this.start,this.end),this.currentNode=e,this.start.parentNode.insertBefore(e,this.end)}commitTemplate(t){let n=t.strings;if(this.currentTemplateInstance?.strings===n)return void this.currentTemplateInstance.update(t.values);h(this.start,this.end);let i=new(function(){if(!e)throw Error("TemplateInstance class not registered.");return e}())(n);this.currentTemplateInstance=i,i.update(t.values),this.start.parentNode.insertBefore(i.fragment,this.end)}commitRepeat({items:e,key:t,renderItem:n}){let i=r(e)?e.get():e,s=Array.isArray(i)?i:g(i)?[...i]:[],a=this.repeatState??{blocks:new Map},o=new Map,l=new Set,c=this.end;for(let e=s.length-1;e>=0;e-=1){let i=s[e],r=t(i);if(l.has(r))throw Error(`repeat() keys must be unique. Duplicate key: ${String(r)}`);l.add(r);let d=a.blocks.get(r);d?(!function(e,t,n){let i=e;for(;i&&i!==n;){if(i===t)return i.nextSibling===n;i=i.nextSibling}return!1}(d.start,d.end,c)&&function(e,t,n){let i=document.createDocumentFragment(),s=e;for(;s;){let e=s.nextSibling;if(i.append(s),s===t)break;s=e}n.parentNode.insertBefore(i,n)}(d.start,d.end,c),d.item!==i&&(d.part.setValue(n(i)),d.item=i)):((d=function(e,t){let n=document.createComment(`repeat-start:${e}`),i=document.createComment(`repeat-end:${e}`);return t.parentNode.insertBefore(n,t),t.parentNode.insertBefore(i,t),{key:e,start:n,end:i,part:new k(n,i)}}(r,c)).part.setValue(n(i)),d.item=i),o.set(r,d),c=d.start}for(let[e,t]of a.blocks.entries())o.has(e)||(h(t.start,t.end),t.start.remove(),t.end.remove());a.blocks=o,this.repeatState=a,this.currentTemplateInstance=null}}class D{constructor(e,t){this.element=e,this.name=t,this.listener=null}setValue(e){this.listener&&(this.element.removeEventListener(this.name,this.listener),this.listener=null),"function"==typeof e&&(this.listener=e,this.element.addEventListener(this.name,this.listener))}}class x extends p{constructor(e,t){super(),this.element=e,this.name=t}setValue(e){r(e)?this.bindSignal(e,e=>this.commit(e)):(this.disposeSignal(),this.commit(e))}commit(e){this.element[this.name]=e}}let N=/([.@]?[-\w:]+)\s*=\s*(?:"|'|)?$/,C=/^part:(\d+)$/,_=/^__part_(\d+)__$/,M=new WeakMap;function E(e,t){let n=[],i=e;for(;i&&i!==t;){let e=i.parentNode;if(!e)break;n.unshift(function(e){let t=0,n=e;for(;n.previousSibling;)n=n.previousSibling,t+=1;return t}(i)),i=e}return n}function T(){let e=Date.now();return{todos:[{id:crypto.randomUUID(),title:"Prepare the talk intro",notes:"Open with the comparison between expensive frameworks and DOM-first",category:"Talk",priority:"high",dueDate:new Date(e+864e5).toISOString().slice(0,10),completed:!1,selected:!1,createdAt:e-8e5},{id:crypto.randomUUID(),title:"Refine the keyed repeat engine",notes:"Verify node movement and cleanup of removed blocks",category:"Engine",priority:"medium",dueDate:new Date(e+1728e5).toISOString().slice(0,10),completed:!1,selected:!0,createdAt:e-6e5},{id:crypto.randomUUID(),title:"Record demo screenshot",notes:"Show the store:change event panel",category:"Assets",priority:"low",dueDate:new Date(e+2592e5).toISOString().slice(0,10),completed:!0,selected:!1,createdAt:e-4e5}],categories:["Inbox","Talk","Engine","Assets","Research"],draft:{title:"",notes:"",category:"Inbox",priority:"medium",dueDate:new Date(e+864e5).toISOString().slice(0,10)},filters:{search:"",category:"all",status:"all",priority:"all",sortBy:"createdAt",sortDir:"desc"},debug:{paused:!1,logs:[]}}}e=class{constructor(e){this.strings=e;let t=function(e){let t=M.get(e);if(t)return t;let n="";for(let t=0;t<e.length-1;t+=1){let i=e[t];n+=i,i.match(N)?n+=`__part_${t}__`:n+=`<!--part:${t}-->`}n+=e[e.length-1];let i=document.createElement("template");i.innerHTML=n;let s=[],a=document.createTreeWalker(i.content,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_COMMENT),o=a.nextNode();for(;o;){if(o.nodeType===Node.COMMENT_NODE){let e=o.data.match(C);e&&s.push({type:"child",index:Number(e[1]),path:E(o,i.content)}),o=a.nextNode();continue}if(o.nodeType===Node.ELEMENT_NODE)for(let e of[...o.attributes]){let t=e.value.match(_);if(!t)continue;let n=e.name,a="attribute",l=n;n.startsWith(".")?(a="property",l=n.slice(1)):n.startsWith("@")&&(a="event",l=n.slice(1)),s.push({type:a,index:Number(t[1]),name:l,rawName:n,path:E(o,i.content)})}o=a.nextNode()}return t={template:i,descriptors:s},M.set(e,t),t}(e);for(let{descriptor:e,node:n}of(this.fragment=t.template.content.cloneNode(!0),this.parts=new Map,t.descriptors.map(e=>({descriptor:e,node:function(e,t){let n=e;for(let e of t)n=n.childNodes[e];return n}(this.fragment,e.path)})))){let t;if("child"===e.type){let i=document.createComment(`start:${e.index}`),s=document.createComment(`end:${e.index}`);n.replaceWith(i,s),t=new k(i,s)}else"attribute"===e.type?(n.removeAttribute(e.rawName),t=new S(n,e.name)):"property"===e.type?(n.removeAttribute(e.rawName),t=new x(n,e.name)):"event"===e.type&&(n.removeAttribute(e.rawName),t=new D(n,e.name));t&&this.parts.set(e.index,t)}}update(e){for(let t=0;t<e.length;t+=1){let n=this.parts.get(t);n&&n.setValue(e[t])}}};let I={low:0,medium:1,high:2},A=new Intl.Collator("en"),B="vanilla-signals-demo-state-v1",O=new class{constructor(e={},t={}){this.events=t.eventsTarget??window,this.target=d(e),this.proxyCache=new WeakMap,this.state=this.createProxy(this.target,[])}createProxy(e,t){if(!c(e))return e;if(this.proxyCache.has(e))return this.proxyCache.get(e);let n=new Proxy(e,{get:(e,n,i)=>{if("__raw"===n)return e;if("__path"===n)return t;let s=Reflect.get(e,n,i);return c(s)?this.createProxy(s,[...t,n]):s},set:(e,n,i,s)=>{let a=[...t,n],o=e[n],l=d(i),r=Reflect.set(e,n,l,s);return o!==l&&this.emitChange(a,o,l),r},deleteProperty:(e,n)=>{if(!(n in e))return!0;let i=[...t,n],s=e[n],a=Reflect.deleteProperty(e,n);return this.emitChange(i,s,void 0),a}});return this.proxyCache.set(e,n),n}emitChange(e,t,n){let i=new CustomEvent("store:change",{detail:{path:u(e).join("."),oldValue:d(t),newValue:d(n)}});this.events.dispatchEvent(i)}get(e){let t=u(e),n=this.state;for(let e of t)n=n?.[e];return n}set(e,t){let n=u(e);if(!n.length)throw Error("Path is required");let i=n.pop(),s=this.state;for(let e of n)c(s[e])||(s[e]={}),s=s[e];return s[i]=t,t}update(e,t){let n=this.get(e);return this.set(e,t(n))}replace(e){let t=d(this.target);this.target=d(e),this.proxyCache=new WeakMap,this.state=this.createProxy(this.target,[]),this.emitChange([],t,this.target)}snapshot(){return d(this.target)}}(function(){let e=localStorage.getItem(B);if(!e)return T();try{return JSON.parse(e)}catch{return T()}}()),P=new o(0,{equals:()=>!1}),V=!1;window.addEventListener("store:change",function(e){if(!V){let n;if(!O.state.debug.paused&&"debug.logs"!==e.detail.path){V=!0;try{var t;let n;t=e.detail,n=[{id:crypto.randomUUID(),timestamp:new Date().toLocaleTimeString("en-GB"),...t},...O.state.debug.logs].slice(0,30),O.state.debug.logs=n}finally{V=!1}}n=O.snapshot(),localStorage.setItem(B,JSON.stringify(n)),P.set(performance.now())}});let R=document.querySelector("#app");if(!(R instanceof HTMLElement))throw Error('Missing "#app" mount point.');let L="1"===new URLSearchParams(window.location.search).get("embed");function q(){let e=O.state.draft;e.title.trim()&&(O.state.todos=[{id:crypto.randomUUID(),title:e.title.trim(),notes:e.notes.trim(),category:e.category,priority:e.priority,dueDate:e.dueDate,completed:!1,selected:!1,createdAt:Date.now()},...O.state.todos],O.state.draft={...O.state.draft,title:"",notes:"",category:O.state.categories[0]??"Inbox",priority:"medium",dueDate:new Date(Date.now()+864e5).toISOString().slice(0,10)})}function U(e){O.state.todos=O.state.todos.map(t=>t.selected?{...t,completed:e}:t)}function W(){O.state.todos=O.state.todos.filter(e=>!e.completed)}function H(){O.state.todos=O.state.todos.filter(e=>!e.selected)}function j(){O.state.todos=O.state.todos.map(e=>({...e,selected:!1}))}function F(){let e=prompt("New category")?.trim();!e||O.state.categories.includes(e)||(O.state.categories=[...O.state.categories,e])}function J(){O.replace(T()),P.set(performance.now())}let z=new l(()=>{var e,t,n,i;let s,a;return P.get(),e=O.state.todos,t=O.state.filters,n=function*(e,t){if("all"===t)return void(yield*e);for(let n of e)n.priority===t&&(yield n)}(function*(e,t){if("all"===t)return void(yield*e);for(let n of e)"done"===t&&n.completed&&(yield n),"open"!==t||n.completed||(yield n)}(function*(e,t){if("all"===t)return void(yield*e);for(let n of e)n.category===t&&(yield n)}(function*(e,t){let n=t.trim().toLowerCase();if(!n)return void(yield*e);for(let t of e)`${t.title} ${t.notes} ${t.category} ${t.priority}`.toLowerCase().includes(n)&&(yield t)}(function*(e){for(let t of e)yield t}(e),t.search),t.category),t.status),t.priority),i=t.sortBy,s="asc"===t.sortDir?1:-1,(a=[...n]).sort((e,t)=>{let n=e[i],a=t[i];return("priority"===i&&(n=I[n],a=I[a]),"title"===i||"category"===i)?s*A.compare(String(n),String(a)):n===a?0:n>a?s:-s}),a}),G=new l(()=>{P.get();let e=O.state.todos,t=0,n=0,i=0;for(let s of e)t+=1,s.completed&&(n+=1),s.selected&&(i+=1);return{total:t,completed:n,open:t-n,selected:i,visible:z.get().length}}),K=new l(()=>(P.get(),["all",...O.state.categories])),Q=new l(()=>G.get().total),X=new l(()=>G.get().open),Y=new l(()=>G.get().completed),Z=new l(()=>G.get().visible),ee=new l(()=>G.get().selected),et=new l(()=>`${G.get().visible} visible item(s), sorted by ${O.state.filters.sortBy}`),en=new l(()=>(P.get(),O.state.debug.logs));function ei(e,t={}){return w({signal:P,get:()=>O.get(e),set:t=>O.set(e,t),...t})}function es(e,t,n={}){return w({signal:P,get:()=>O.state.todos.find(t=>t.id===e)?.[t]??("checked"!==n.prop&&""),set:n=>(function(e,t){let n=O.state.todos.findIndex(t=>t.id===e);if(n<0)return;let i=O.state.todos[n];O.state.todos[n]={...i,...t}})(e,{[t]:n}),...n})}function ea(){return y`
    <option value="low">low</option>
    <option value="medium">medium</option>
    <option value="high">high</option>
  `}function eo(e){return y`
    <select model=${e}>
      ${$(O.state.categories,e=>e,e=>y`<option value=${e}>${e}</option>`)}
    </select>
  `}function el(e,t){return y`
    <article class="card stat">
      <strong>${e}</strong>
      <span>${t}</span>
    </article>
  `}function er(e){return y`
    <article class="log-entry">
      <header>
        <strong>${e.path||"(root)"}</strong>
        <time>${e.timestamp}</time>
      </header>
      <pre>${JSON.stringify({oldValue:e.oldValue,newValue:e.newValue},null,2)}</pre>
    </article>
  `}function ec(e){return y`
    <article class=${e.completed?"todo-card is-done":"todo-card"}>
      <header class="todo-main">
        <label class="checkline">
          <input model=${es(e.id,"selected",{prop:"checked",event:"change"})} type="checkbox" />
          <span>select</span>
        </label>
        <label class="checkline done-toggle">
          <input model=${es(e.id,"completed",{prop:"checked",event:"change"})} type="checkbox" />
          <span>done</span>
        </label>
        <input class="todo-title" model=${es(e.id,"title")} />
      </header>

      <div class="todo-meta-grid">
        <label>
          <span>Category</span>
          ${eo(es(e.id,"category",{event:"change"}))}
        </label>
        <label>
          <span>Priority</span>
          <select model=${es(e.id,"priority",{event:"change"})}>
            ${ea()}
          </select>
        </label>
        <label>
          <span>Due date</span>
          <input type="date" model=${es(e.id,"dueDate",{event:"change"})} />
        </label>
      </div>

      <label class="notes-box">
        <span>Notes</span>
        <textarea rows="2" model=${es(e.id,"notes")}></textarea>
      </label>

      <footer class="todo-footer">
        <span class=${`priority-chip ${e.priority}`}>${e.priority}</span>
        <button @click=${()=>{var t;return t=e.id,void(O.state.todos=O.state.todos.filter(e=>e.id!==t))}} class="ghost danger">Delete</button>
      </footer>
    </article>
  `}document.documentElement.dataset.embed=String(L),new class e{constructor(e){this.callback=e,this.dependencies=new Map,this.active=!0,this.run=this.run.bind(this),this.run()}addDependency(e){if(this.dependencies.has(e))return;let t=e.subscribe(()=>{s.add(this),!a&&(a=!0,queueMicrotask(()=>{try{for(;s.size>0;){let e=[...s];for(let t of(s.clear(),e))t.run()}}finally{a=!1}}))});this.dependencies.set(e,t)}cleanup(){for(let e of this.dependencies.values())e();this.dependencies.clear()}run(){this.active&&(this.cleanup(),n(this,()=>{this.callback()}))}stop(){this.active=!1,this.cleanup()}}(()=>{P.get(),function(e,t){let n=t.__rootPart;if(!n){let e=document.createComment("root:start"),i=document.createComment("root:end");t.textContent="",t.append(e,i),t.__rootPart=n=new k(e,i)}n.setValue(e)}(y`
    <main class="demo-shell">
      ${y`
    <section class="demo-header card glass">
      <div>
        <p class="eyebrow">VanillaJS, Signals, DOM Parts</p>
        <h1>Advanced Todo, no framework</h1>
        <p class="subcopy">Two-way binding, repeat keyed, Proxy store, event log, generator pipeline.</p>
      </div>
      <div class="header-actions">
        <button @click=${J}>Reset demo</button>
        <button class="ghost" @click=${F}>New category</button>
      </div>
    </section>
  `} ${y`
    <section class="stats-row">
      ${el(Q,"Total")} ${el(X,"Open")} ${el(Y,"Done")}
      ${el(Z,"Visible")} ${el(ee,"Selected")}
    </section>
  `}

      <section class="workspace-grid">
        <aside class="left-column">
          ${y`
    <article class="card panel">
      <h2>Quick add</h2>
      <label>
        <span>Title</span>
        <input placeholder="What needs to happen?" model=${ei("draft.title")} />
      </label>
      <label>
        <span>Notes</span>
        <textarea rows="3" model=${ei("draft.notes")}></textarea>
      </label>
      <div class="form-grid">
        <label>
          <span>Category</span>
          ${eo(ei("draft.category",{event:"change"}))}
        </label>
        <label>
          <span>Priority</span>
          <select model=${ei("draft.priority",{event:"change"})}>
            ${ea()}
          </select>
        </label>
      </div>
      <label>
        <span>Due date</span>
        <input type="date" model=${ei("draft.dueDate",{event:"change"})} />
      </label>
      <button @click=${q}>Add todo</button>
    </article>
  `} ${y`
    <article class="card panel">
      <h2>Filters + sorting</h2>
      <label>
        <span>Search</span>
        <input placeholder="Search title, notes, category..." model=${ei("filters.search")} />
      </label>
      <div class="form-grid">
        <label>
          <span>Status</span>
          <select model=${ei("filters.status",{event:"change"})}>
            ${y`
    <option value="all">all</option>
    <option value="open">open</option>
    <option value="done">done</option>
  `}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select model=${ei("filters.category",{event:"change"})}>
            ${$(K,e=>e,e=>y`<option value=${e}>${e}</option>`)}
          </select>
        </label>
      </div>
      <div class="form-grid">
        <label>
          <span>Priority</span>
          <select model=${ei("filters.priority",{event:"change"})}>
            ${y`
    <option value="all">all</option>
    <option value="low">low</option>
    <option value="medium">medium</option>
    <option value="high">high</option>
  `}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select model=${ei("filters.sortBy",{event:"change"})}>
            ${y`
    <option value="createdAt">createdAt</option>
    <option value="title">title</option>
    <option value="priority">priority</option>
    <option value="dueDate">dueDate</option>
    <option value="category">category</option>
  `}
          </select>
        </label>
      </div>
      <label>
        <span>Direction</span>
        <select model=${ei("filters.sortDir",{event:"change"})}>
          ${y`
    <option value="asc">asc</option>
    <option value="desc">desc</option>
  `}
        </select>
      </label>
    </article>
  `} ${y`
    <article class="card panel">
      <h2>Bulk actions</h2>
      <div class="button-grid">
        <button @click=${()=>{let e;return e=new Set(z.peek().map(e=>e.id)),void(O.state.todos=O.state.todos.map(t=>({...t,selected:!!e.has(t.id)||t.selected})))}}>Select visible</button>
        <button class="ghost" @click=${j}>Clear selection</button>
        <button @click=${()=>U(!0)}>Complete selected</button>
        <button class="ghost" @click=${()=>U(!1)}>Reopen selected</button>
        <button class="ghost danger" @click=${H}>Delete selected</button>
        <button class="ghost danger" @click=${W}>Delete completed</button>
      </div>
    </article>
  `}
        </aside>

        ${y`
    <section class="center-column">
      <div class="list-head">
        <h2>Reactive list</h2>
        <p>${et}</p>
      </div>
      <div class="todo-list">${$(z,e=>e.id,ec)}</div>
    </section>
  `}

        <aside class="right-column">
          ${y`
    <article class="card panel debug-panel">
      <div class="debug-head">
        <h2>store:change log</h2>
        <label class="checkline compact-inline">
          <input type="checkbox" model=${ei("debug.paused",{prop:"checked",event:"change"})} />
          <span>pause log</span>
        </label>
      </div>
      <div class="log-list">${$(en,e=>e.id,er)}</div>
    </article>
  `}
        </aside>
      </section>
    </main>
  `,R)}),P.set(performance.now());
//# sourceMappingURL=demo.62609d15.js.map
