var n={globalThis};n.globalThis.HTMLElement||(n.globalThis={...n.globalThis,HTMLElement:class{}});function b(s,t){let e=!1,r;return(...a)=>{e||(clearTimeout(r),r=setTimeout(()=>{e=!0,Promise.resolve().then(()=>s(...a)).catch(o=>{console.error(o)}).finally(()=>{e=!1})},t))}}var c=class extends n.globalThis.HTMLElement{#e;#t;static get observedAttributes(){return[]}static define(t,e){n.globalThis.customElements.define(t,this,e)}constructor(){super(),this.#e=0,this.#t=b(this.updateSync.bind(this),50)}get updateCounter(){return this.#e}attributeChangedCallback(t,e,r,a){this.#e&&e!==r&&this.update()}connectedCallback(){this.#e?this.update():this.updateSync()}disconnectedCallback(){}adoptedCallback(t,e){}update(){this.#t()}updateSync(){try{this.render(),this.#e++,this.updatedCallback()}catch(t){this.errorCallback(t)}}render(){}updatedCallback(){}errorCallback(t){console.error(t)}};var d=class{constructor(t){let e=new WeakRef(t),r=()=>{if(e){let a=e.deref();if(a)return a;e=null}throw new Error("The target element is not available.")};return new Proxy({},{set:(a,o,i)=>{let u=r();return typeof o=="string"&&typeof i=="string"?(u.setAttribute(o,i),!0):!1},get:(a,o)=>{let i=r();if(typeof o=="string"&&i.hasAttribute(o))return i.getAttribute(o)},deleteProperty:(a,o)=>{let i=r();return typeof o=="string"&&i.hasAttribute(o)?(i.removeAttribute(o),!0):!1},has:(a,o)=>{let i=r();return!!(typeof o=="string"&&i.hasAttribute(o))},ownKeys:()=>{let a=r(),o=[];if(a.hasAttributes())for(let i of Array.from(a.attributes))o.push(i.name);return o},getOwnPropertyDescriptor:(a,o)=>{let i=r();if(typeof o=="string"&&i.hasAttribute(o))return{configurable:!0,enumerable:!0,value:i.getAttribute(o)}}})}};var p=new WeakSet,f=class{#e;#t;#r;constructor(t,e){p.add(t),this.#e=new WeakRef(t),this.#t=e?new WeakRef(e):null,this.#r=new Set}get host(){return this.#n()}adoptStyles(t){let e=this.#n();if(e instanceof n.globalThis.Document||e instanceof n.globalThis.ShadowRoot){let r=[],a=Array.isArray(t)?t:[t];for(let o of a)if(o instanceof n.globalThis.CSSStyleSheet)r.push(o);else if(typeof o=="string"){let i=new n.globalThis.CSSStyleSheet;i.replaceSync(o),r.push(i)}r.length&&(e.adoptedStyleSheets=r)}else console.warn('The styles cannot be adopted because the host node is not a "Document" or "ShadowRoot".')}update(t){let e=this.#n();this.#a(),t instanceof n.globalThis.Document||t instanceof n.globalThis.DocumentFragment?this.#s(e,t):this.#s(e,this.#i(t)),this.#h(e)}clone(){let t=this.#n();return this.#i(t.childNodes)}#n(){if(this.#e){let t=this.#e.deref();if(t)return t;this.#e=null}throw new Error("The host node is not available.")}#o(){if(this.#t){let t=this.#t.deref();if(t)return t;this.#t=null}}#i(t){if(typeof t=="string"){let r=n.globalThis.document.createElement("template");return r.innerHTML=t,r.content}let e=n.globalThis.document.createDocumentFragment();if(t instanceof n.globalThis.Node)e.appendChild(t.cloneNode(!0));else if(t instanceof n.globalThis.NodeList&&t.length)for(let r of Array.from(t))e.appendChild(r.cloneNode(!0));return e}#s(t,e){if(t.hasChildNodes()||e.hasChildNodes()){let r=Array.from(t.childNodes),a=Array.from(e.childNodes),o=Math.max(r.length,a.length);for(let i=0;i<o;i++)this.#l(t,r[i]??null,a[i]??null)}}#l(t,e,r){e&&!r?t.removeChild(e):!e&&r?t.appendChild(r.cloneNode(!0)):e&&r&&(e.nodeType===r.nodeType&&e.nodeName===r.nodeName?e instanceof n.globalThis.Element&&r instanceof n.globalThis.Element?(this.#u(e,r),p.has(e)||this.#s(e,r)):e instanceof n.globalThis.CharacterData&&r instanceof n.globalThis.CharacterData?e.nodeValue!==r.nodeValue&&(e.nodeValue=r.nodeValue):t.replaceChild(r.cloneNode(!0),e):t.replaceChild(r.cloneNode(!0),e))}#u(t,e){if(t.hasAttributes())for(let r of Array.from(t.attributes))e.hasAttribute(r.name)||t.removeAttribute(r.name);if(e.hasAttributes())for(let r of Array.from(e.attributes))(!t.hasAttribute(r.name)||t.getAttribute(r.name)!==r.value)&&t.setAttribute(r.name,r.value)}#h(t){if(t.hasChildNodes())for(let e of Array.from(t.childNodes))e instanceof n.globalThis.Element&&this.#c(e)}#c(t){if(t.hasAttributes()){for(let e of Array.from(t.attributes))if(e.name.search(/^on\w+/i)!==-1){let r=e.name.toLowerCase(),a=t;if(r in t&&typeof a[r]=="function"){let o=new Function("event",e.value),i=this.#o();t.removeAttribute(e.name),a[r]=o.bind(i??t),this.#r.add([t,r])}}}p.has(t)||this.#h(t)}#a(){for(let[t,e]of this.#r){let r=t;r[e]=null}this.#r.clear()}};var m=class extends c{#e;#t;constructor(){super(),this.update=this.update.bind(this),this.#e=new d(this),this.#t=new f(this.createContentContainer(),this)}get attr(){return this.#e}get structure(){return this.#t}get content(){return this.#t.host}observe(...t){for(let e of t)e.subscribe&&typeof e.subscribe=="function"&&e.subscribe(this.update)}unobserve(...t){for(let e of t)e.unsubscribe&&typeof e.unsubscribe=="function"&&e.unsubscribe(this.update)}dispatch(t,e){return this.#t.host.dispatchEvent(new n.globalThis.CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}createContentContainer(){return this.attachShadow({mode:"open"})}render(){!this.updateCounter&&this.#t.host instanceof n.globalThis.ShadowRoot&&this.#t.adoptStyles(this.styles()),this.#t.update(this.template())}styles(){return[]}template(){return""}};var h=class{#e;constructor(){this.#e=new Set}subscribe(t){this.#e.add(t)}unsubscribe(t){this.#e.delete(t)}notify(t){for(let e of this.#e)e(t)}};var y=class{#e;#t;#r;#n;#o;#i;#s;constructor(t,e=""){if(t!=="hash"&&t!=="history")throw new Error('The routing mode must be set to "hash" or "history".');this.#e=t,this.#t=e&&!e.endsWith("/")?e+"/":e,this.#r=()=>{},this.#n=r=>{console.error(r)},this.#o=new Map,this.#i=this.#h.bind(this),this.#s=this.#c.bind(this)}get mode(){return this.#e}get base(){return this.#t}set onchange(t){this.#r=t}get onchange(){return this.#r}set onerror(t){this.#n=t}get onerror(){return this.#n}set(t,e){this.#o.size||(this.#e==="hash"?n.globalThis.addEventListener("hashchange",this.#i):this.#e==="history"&&n.globalThis.addEventListener("popstate",this.#s)),this.#o.set(this.#f(t),e)}delete(t){this.#o.delete(this.#f(t)),this.#o.size||(this.#e==="hash"?n.globalThis.removeEventListener("hashchange",this.#i):this.#e==="history"&&n.globalThis.removeEventListener("popstate",this.#s))}navigate(t){this.#e==="hash"?this.#l(t):this.#e==="history"&&this.#u(t)}#l(t){let e="";if(t.search(/^[A-Za-z0-9\+\-\.]+:\/\/|\?|#/)!==-1){let i=new URL(t,n.globalThis.location.href),u=i.href.split("#"),w=n.globalThis.location.href.split("#");if(u[0]!==w[0]){n.globalThis.location.href=i.href;return}e=u[1]??""}else e=t;let r=n.globalThis.location.hash.substring(1),a=new URL(r,n.globalThis.location.origin),o=new URL(this.#d(e),a.href);if(o.pathname!==r){n.globalThis.location.hash=o.pathname;return}this.#a(o.pathname)}#u(t){let e=new URL(this.#d(t),n.globalThis.location.href);if(e.origin!==n.globalThis.location.origin){n.globalThis.location.href=e.href;return}e.href!==n.globalThis.location.href&&(n.globalThis.history.pushState({},"",e.href),this.#r(new n.globalThis.CustomEvent("pushstate"))),this.#a(e.pathname)}#h(t){this.#r(t),this.#a(n.globalThis.location.hash.substring(1))}#c(t){this.#r(t),this.#a(n.globalThis.location.pathname)}#a(t){try{for(let[e,r]of this.#o){let a=t.match(new RegExp(e));if(a){r(a.groups??{});break}}}catch(e){this.#n(e)}}#d(t){return this.#t&&t.search(/^([A-Za-z0-9\+\-\.]+:\/\/|\/)/)===-1?this.#t+t:t}#f(t){return`/${t}`.replace(/([^?]):(\w+)/g,"$1(?<$2>[^/?#]+)").substring(1)}};function l(s,t){return g(s,t,new WeakSet)}function g(s,t,e){if(typeof s!=typeof t)return!1;if(s!==null&&typeof s=="object"&&t!==null&&typeof t=="object"){if(e.has(s)||e.has(t))return e.has(s)&&e.has(t);if(e.add(s),e.add(t),Array.isArray(s)&&Array.isArray(t)){if(s.length!==t.length)return!1;for(let r=0;r<s.length;r++)if(!g(s[r],t[r],e))return!1;return!0}if(s.constructor===Object&&t.constructor===Object){let r=Object.keys(s),a=Object.keys(t);if(r.length!==a.length)return!1;for(let o of r)if(!g(s[o],t[o],e))return!1;return!0}}return s===t}var T=class extends h{#e;#t;constructor(t){super(),this.#e=n.globalThis.structuredClone(t),this.#t=n.globalThis.structuredClone(t)}reset(){let t=l(this.#t,this.#e);this.#t=n.globalThis.structuredClone(this.#e),t||this.notify()}set(t){let e=l(this.#t,t);this.#t=n.globalThis.structuredClone(t),e||this.notify()}get(){return this.#t}notify(){super.notify(this.#t)}};var v=class extends h{#e;#t;constructor(t){super(),this.#e=n.globalThis.structuredClone(t),this.#t=n.globalThis.structuredClone(t)}get state(){return this.#t}reset(){let t=l(this.#t,this.#e);this.#t=n.globalThis.structuredClone(this.#e),t||this.notify()}update(t){let e={...this.#t,...t},r=l(this.#t,e);this.#t=n.globalThis.structuredClone(e),r||this.notify()}notify(){super.notify(this.#t)}};var C=class{#e;#t;#r;constructor(t,e=""){switch(this.#e=t,this.#t=e,this.#e){case"local":{this.#r=n.globalThis.localStorage;break}case"session":{this.#r=n.globalThis.sessionStorage;break}default:throw new Error('The storage mode must be set to "local" or "session".')}}get mode(){return this.#e}get prefix(){return this.#t}get size(){return this.#r.length}keys(){let t=[];if(this.#r.length)for(let e=0;e<this.#r.length;e++)t.push(this.#r.key(e));return t}set(t,e){this.#r.setItem(this.#t+t,JSON.stringify({_v:e}))}get(t){let e=this.#r.getItem(this.#t+t);if(typeof e=="string"){if(e)try{let r=JSON.parse(e);return typeof r=="object"&&r!==null?r._v:e}catch{return e}return e}}delete(t){this.#r.removeItem(this.#t+t)}clear(){this.#r.clear()}};function Y(s,t){let e=t?.base??m,r=class extends e{static get observedAttributes(){return t?.observedAttributes&&Array.isArray(t.observedAttributes)?t.observedAttributes:super.observedAttributes}constructor(){super(),t?.init&&typeof t.init=="function"&&t.init(this)}connectedCallback(){super.connectedCallback(),t?.connected&&typeof t.connected=="function"&&t.connected(this)}disconnectedCallback(){t?.disconnected&&typeof t.disconnected=="function"&&t.disconnected(this),super.disconnectedCallback()}styles(){return t?.styles&&typeof t.styles=="function"?t.styles(this):super.styles()}template(){return t?.template&&typeof t.template=="function"?t.template(this):super.template()}};return r.define(s),r}function rt(s,...t){let e=s.reduce((a,o,i)=>a+o+(i<t.length?t[i]:""),""),r=new n.globalThis.CSSStyleSheet;return r.replaceSync(e),r}function st(s,...t){let e=s.reduce((a,o,i)=>a+o+(i<t.length?t[i]:""),""),r=n.globalThis.document.createElement("template");return r.innerHTML=e,r.content}export{m as Component,c as CustomElement,d as ElementAttributesProxy,f as NodeStructure,h as Observable,y as Router,T as State,v as Store,C as WebStorage,Y as createComponent,rt as css,n as dom,st as html};
