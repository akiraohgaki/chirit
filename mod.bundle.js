var p={globalThis};p.globalThis.HTMLElement||(p.globalThis={...p.globalThis,HTMLElement:class{}});var s=p;var u=class extends s.globalThis.HTMLElement{#e;#t;#r;#s;static get observedAttributes(){return[]}static define(t,e){s.globalThis.customElements.define(t,this,e)}constructor(){super(),this.#e=0,this.#t=50,this.#r=void 0,this.#s=[]}get updateCounter(){return this.#e}attributeChangedCallback(t,e,r,a){this.#e&&e!==r&&this.update()}connectedCallback(){this.#e?this.update():this.updateSync()}disconnectedCallback(){}adoptedCallback(t,e){}update(){return this.#r!==void 0&&(s.globalThis.clearTimeout(this.#r),this.#r=void 0),this.#r=s.globalThis.setTimeout(()=>{s.globalThis.clearTimeout(this.#r),this.#r=void 0;let t=this.#s.splice(0);this.updateSync();for(let e of t)e()},this.#t),new Promise(t=>{this.#s.push(t)})}updateSync(){try{this.render(),this.#e++,this.updatedCallback()}catch(t){this.errorCallback(t)}}render(){}updatedCallback(){}errorCallback(t){console.error(t)}};var d=class{constructor(t){let e=new WeakRef(t),r=()=>{if(e){let a=e.deref();if(a)return a;e=null}throw new Error("The target element is not available.")};return new Proxy({},{set:(a,o,n)=>{let m=r();return typeof o=="string"&&typeof n=="string"?(m.setAttribute(o,n),!0):!1},get:(a,o)=>{let n=r();if(typeof o=="string"&&n.hasAttribute(o))return n.getAttribute(o)},deleteProperty:(a,o)=>{let n=r();return typeof o=="string"&&n.hasAttribute(o)?(n.removeAttribute(o),!0):!1},has:(a,o)=>{let n=r();return!!(typeof o=="string"&&n.hasAttribute(o))},ownKeys:()=>{let a=r(),o=[];if(a.hasAttributes())for(let n of Array.from(a.attributes))o.push(n.name);return o},getOwnPropertyDescriptor:(a,o)=>{let n=r();if(typeof o=="string"&&n.hasAttribute(o))return{configurable:!0,enumerable:!0,value:n.getAttribute(o)}}})}};var v=new WeakSet,c=class{#e;#t;#r;constructor(t,e){v.add(t),this.#e=new WeakRef(t),this.#t=e?new WeakRef(e):null,this.#r=new Set}get host(){return this.#s()}adoptStyles(t){let e=this.#s();if(e instanceof s.globalThis.Document||e instanceof s.globalThis.ShadowRoot){let r=[],a=Array.isArray(t)?t:[t];for(let o of a)if(o instanceof s.globalThis.CSSStyleSheet)r.push(o);else if(typeof o=="string"){let n=new s.globalThis.CSSStyleSheet;n.replaceSync(o),r.push(n)}r.length&&(e.adoptedStyleSheets=r)}else console.warn('The styles cannot be adopted because the host node is not a "Document" or "ShadowRoot".')}update(t){let e=this.#s();this.#a(),t instanceof s.globalThis.Document||t instanceof s.globalThis.DocumentFragment?this.#n(e,t):this.#n(e,this.#i(t)),this.#l(e)}clone(){let t=this.#s();return this.#i(t.childNodes)}#s(){if(this.#e){let t=this.#e.deref();if(t)return t;this.#e=null}throw new Error("The host node is not available.")}#o(){if(this.#t){let t=this.#t.deref();if(t)return t;this.#t=null}}#i(t){if(typeof t=="string"){let r=s.globalThis.document.createElement("template");return r.innerHTML=t,r.content}let e=s.globalThis.document.createDocumentFragment();if(t instanceof s.globalThis.Node)e.appendChild(t.cloneNode(!0));else if(t instanceof s.globalThis.NodeList&&t.length)for(let r of Array.from(t))e.appendChild(r.cloneNode(!0));return e}#n(t,e){if(t.hasChildNodes()||e.hasChildNodes()){let r=Array.from(t.childNodes),a=Array.from(e.childNodes),o=Math.max(r.length,a.length);for(let n=0;n<o;n++)this.#h(t,r[n]??null,a[n]??null)}}#h(t,e,r){e&&!r?t.removeChild(e):!e&&r?t.appendChild(r.cloneNode(!0)):e&&r&&(e.nodeType===r.nodeType&&e.nodeName===r.nodeName?e instanceof s.globalThis.Element&&r instanceof s.globalThis.Element?(this.#u(e,r),v.has(e)||this.#n(e,r)):e instanceof s.globalThis.CharacterData&&r instanceof s.globalThis.CharacterData?e.nodeValue!==r.nodeValue&&(e.nodeValue=r.nodeValue):t.replaceChild(r.cloneNode(!0),e):t.replaceChild(r.cloneNode(!0),e))}#u(t,e){if(t.hasAttributes())for(let r of Array.from(t.attributes))e.hasAttribute(r.name)||t.removeAttribute(r.name);if(e.hasAttributes())for(let r of Array.from(e.attributes))(!t.hasAttribute(r.name)||t.getAttribute(r.name)!==r.value)&&t.setAttribute(r.name,r.value)}#l(t){if(t.hasChildNodes())for(let e of Array.from(t.childNodes))e instanceof s.globalThis.Element&&this.#d(e)}#d(t){if(t.hasAttributes()){for(let e of Array.from(t.attributes))if(e.name.search(/^on\w+/i)!==-1){let r=e.name.toLowerCase(),a=t;if(r in t&&typeof a[r]=="function"){let o=new Function("event",e.value),n=this.#o();t.removeAttribute(e.name),a[r]=o.bind(n??t),this.#r.add([t,r])}}}v.has(t)||this.#l(t)}#a(){for(let[t,e]of this.#r){let r=t;r[e]=null}this.#r.clear()}};var f=class extends u{#e;#t;constructor(){super(),this.update=this.update.bind(this),this.#e=new d(this),this.#t=new c(this.createContentContainer(),this)}get attr(){return this.#e}get structure(){return this.#t}get content(){return this.#t.host}observe(...t){for(let e of t)e.subscribe&&typeof e.subscribe=="function"&&e.subscribe(this.update)}unobserve(...t){for(let e of t)e.unsubscribe&&typeof e.unsubscribe=="function"&&e.unsubscribe(this.update)}dispatch(t,e){return this.#t.host.dispatchEvent(new s.globalThis.CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}createContentContainer(){return this.attachShadow({mode:"open"})}render(){!this.updateCounter&&this.#t.host instanceof s.globalThis.ShadowRoot&&this.#t.adoptStyles(this.styles()),this.#t.update(this.template())}styles(){return[]}template(){return""}};var l=class{#e;constructor(){this.#e=new Set}subscribe(t){this.#e.add(t)}unsubscribe(t){this.#e.delete(t)}notify(t){for(let e of this.#e)e(t)}};var b=class{#e;#t;#r;#s;#o;#i;#n;constructor(t,e=""){if(t!=="hash"&&t!=="history")throw new Error('The routing mode must be set to "hash" or "history".');this.#e=t,this.#t=e&&!e.endsWith("/")?e+"/":e,this.#r=()=>{},this.#s=r=>{console.error(r)},this.#o=new Map,this.#i=this.#l.bind(this),this.#n=this.#d.bind(this)}get mode(){return this.#e}get base(){return this.#t}set onchange(t){this.#r=t}get onchange(){return this.#r}set onerror(t){this.#s=t}get onerror(){return this.#s}set(t,e){this.#o.size||(this.#e==="hash"?s.globalThis.addEventListener("hashchange",this.#i):this.#e==="history"&&s.globalThis.addEventListener("popstate",this.#n)),this.#o.set(this.#f(t),e)}delete(t){this.#o.delete(this.#f(t)),this.#o.size||(this.#e==="hash"?s.globalThis.removeEventListener("hashchange",this.#i):this.#e==="history"&&s.globalThis.removeEventListener("popstate",this.#n))}navigate(t){this.#e==="hash"?this.#h(t):this.#e==="history"&&this.#u(t)}#h(t){let e="";if(t.search(/^[A-Za-z0-9\+\-\.]+:\/\/|\?|#/)!==-1){let n=new URL(t,s.globalThis.location.href),m=n.href.split("#"),E=s.globalThis.location.href.split("#");if(m[0]!==E[0]){s.globalThis.location.href=n.href;return}e=m[1]??""}else e=t;let r=s.globalThis.location.hash.substring(1),a=new URL(r,s.globalThis.location.origin),o=new URL(this.#c(e),a.href);if(o.pathname!==r){s.globalThis.location.hash=o.pathname;return}this.#a(o.pathname)}#u(t){let e=new URL(this.#c(t),s.globalThis.location.href);if(e.origin!==s.globalThis.location.origin){s.globalThis.location.href=e.href;return}e.href!==s.globalThis.location.href&&(s.globalThis.history.pushState({},"",e.href),this.#r(new s.globalThis.CustomEvent("pushstate"))),this.#a(e.pathname)}#l(t){this.#r(t),this.#a(s.globalThis.location.hash.substring(1))}#d(t){this.#r(t),this.#a(s.globalThis.location.pathname)}#a(t){try{for(let[e,r]of this.#o){let a=t.match(new RegExp(e));if(a){r(a.groups??{});break}}}catch(e){this.#s(e)}}#c(t){return this.#t&&t.search(/^([A-Za-z0-9\+\-\.]+:\/\/|\/)/)===-1?this.#t+t:t}#f(t){return`/${t}`.replace(/([^?]):(\w+)/g,"$1(?<$2>[^/?#]+)").substring(1)}};function h(i,t){return C(i,t,new WeakSet)}function C(i,t,e){if(typeof i!=typeof t)return!1;if(i!==null&&typeof i=="object"&&t!==null&&typeof t=="object"){if(e.has(i)||e.has(t))return e.has(i)&&e.has(t);if(e.add(i),e.add(t),Array.isArray(i)&&Array.isArray(t)){if(i.length!==t.length)return!1;for(let r=0;r<i.length;r++)if(!C(i[r],t[r],e))return!1;return!0}if(i.constructor===Object&&t.constructor===Object){let r=Object.keys(i),a=Object.keys(t);if(r.length!==a.length)return!1;for(let o of r)if(!C(i[o],t[o],e))return!1;return!0}}return i===t}var g=class extends l{#e;#t;constructor(t){super(),this.#e=s.globalThis.structuredClone(t),this.#t=s.globalThis.structuredClone(t)}reset(){let t=h(this.#t,this.#e);this.#t=s.globalThis.structuredClone(this.#e),t||this.notify()}set(t){let e=h(this.#t,t);this.#t=s.globalThis.structuredClone(t),e||this.notify()}get(){return this.#t}notify(){super.notify(this.#t)}};var y=class extends l{#e;#t;constructor(t){super(),this.#e=s.globalThis.structuredClone(t),this.#t=s.globalThis.structuredClone(t)}get state(){return this.#t}reset(){let t=h(this.#t,this.#e);this.#t=s.globalThis.structuredClone(this.#e),t||this.notify()}update(t){let e={...this.#t,...t},r=h(this.#t,e);this.#t=s.globalThis.structuredClone(e),r||this.notify()}notify(){super.notify(this.#t)}};var T=class{#e;#t;#r;constructor(t,e=""){switch(this.#e=t,this.#t=e,this.#e){case"local":{this.#r=s.globalThis.localStorage;break}case"session":{this.#r=s.globalThis.sessionStorage;break}default:throw new Error('The storage mode must be set to "local" or "session".')}}get mode(){return this.#e}get prefix(){return this.#t}get size(){return this.#r.length}keys(){let t=[];if(this.#r.length)for(let e=0;e<this.#r.length;e++)t.push(this.#r.key(e));return t}set(t,e){this.#r.setItem(this.#t+t,JSON.stringify({_v:e}))}get(t){let e=this.#r.getItem(this.#t+t);if(typeof e=="string"){if(e)try{let r=JSON.parse(e);return typeof r=="object"&&r!==null?r._v:e}catch{return e}return e}}delete(t){this.#r.removeItem(this.#t+t)}clear(){this.#r.clear()}};function S(i,t){let e=t?.base??f,r=class extends e{static get observedAttributes(){return t?.observedAttributes&&Array.isArray(t.observedAttributes)?t.observedAttributes:super.observedAttributes}constructor(){super(),t?.init&&typeof t.init=="function"&&t.init(this)}connectedCallback(){super.connectedCallback(),t?.connected&&typeof t.connected=="function"&&t.connected(this)}disconnectedCallback(){t?.disconnected&&typeof t.disconnected=="function"&&t.disconnected(this),super.disconnectedCallback()}styles(){return t?.styles&&typeof t.styles=="function"?t.styles(this):super.styles()}template(){return t?.template&&typeof t.template=="function"?t.template(this):super.template()}};return r.define(i),r}function w(i,...t){let e=i.reduce((a,o,n)=>a+o+(n<t.length?t[n]:""),""),r=new s.globalThis.CSSStyleSheet;return r.replaceSync(e),r}function k(i,...t){let e=i.reduce((a,o,n)=>a+o+(n<t.length?t[n]:""),""),r=s.globalThis.document.createElement("template");return r.innerHTML=e,r.content}export{f as Component,u as CustomElement,d as ElementAttributesProxy,c as NodeStructure,l as Observable,b as Router,g as State,y as Store,T as WebStorage,S as createComponent,w as css,s as dom,k as html,h as isEqual};
