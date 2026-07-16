(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},oe=(e,t)=>!l(e,t),se={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:oe};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var h=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=se){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??se}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??oe)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};h.elementStyles=[],h.shadowRootOptions={mode:`open`},h[p(`elementProperties`)]=new Map,h[p(`finalized`)]=new Map,ae?.({ReactiveElement:h}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var ce=globalThis,le=e=>e,g=ce.trustedTypes,ue=g?g.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,de=`$lit$`,_=`lit$${Math.random().toFixed(9).slice(2)}$`,fe=`?`+_,pe=`<${fe}>`,v=document,y=()=>v.createComment(``),b=e=>e===null||typeof e!=`object`&&typeof e!=`function`,me=Array.isArray,he=e=>me(e)||typeof e?.[Symbol.iterator]==`function`,ge=`[ 	
\f\r]`,x=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_e=/-->/g,ve=/>/g,S=RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ye=/'/g,be=/"/g,xe=/^(?:script|style|textarea|title)$/i,Se=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),C=Se(1),w=Se(2),T=Symbol.for(`lit-noChange`),E=Symbol.for(`lit-nothing`),Ce=new WeakMap,D=v.createTreeWalker(v,129);function we(e,t){if(!me(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return ue===void 0?t:ue.createHTML(t)}var Te=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=x;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===x?c[1]===`!--`?o=_e:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=S):(xe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=S):o=ve:o===S?c[0]===`>`?(o=i??x,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?S:c[3]===`"`?be:ye):o===be||o===ye?o=S:o===_e||o===ve?o=x:(o=S,i=void 0);let d=o===S&&e[t+1].startsWith(`/>`)?` `:``;a+=o===x?n+pe:l>=0?(r.push(s),n.slice(0,l)+de+n.slice(l)+_+d):n+_+(l===-2?t:d)}return[we(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Ee=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Te(t,n);if(this.el=e.createElement(l,r),D.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=D.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(de)){let t=u[o++],n=i.getAttribute(e).split(_),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ke:r[1]===`?`?Ae:r[1]===`@`?je:k}),i.removeAttribute(e)}else e.startsWith(_)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(xe.test(i.tagName)){let e=i.textContent.split(_),t=e.length-1;if(t>0){i.textContent=g?g.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],y()),D.nextNode(),c.push({type:2,index:++a});i.append(e[t],y())}}}else if(i.nodeType===8)if(i.data===fe)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(_,e+1))!==-1;)c.push({type:7,index:a}),e+=_.length-1}a++}}static createElement(e,t){let n=v.createElement(`template`);return n.innerHTML=e,n}};function O(e,t,n=e,r){if(t===T)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=b(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=O(e,i._$AS(e,t.values),i,r)),t}var De=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??v).importNode(t,!0);D.currentNode=r;let i=D.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Oe(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Me(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=D.nextNode(),a++)}return D.currentNode=v,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Oe=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),b(e)?e===E||e==null||e===``?(this._$AH!==E&&this._$AR(),this._$AH=E):e!==this._$AH&&e!==T&&this._(e):e._$litType$===void 0?e.nodeType===void 0?he(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==E&&b(this._$AH)?this._$AA.nextSibling.data=e:this.T(v.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Ee.createElement(we(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new De(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Ce.get(e.strings);return t===void 0&&Ce.set(e.strings,t=new Ee(e)),t}k(t){me(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(y()),this.O(y()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=le(e).nextSibling;le(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=E,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=E}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=O(this,e,t,0),a=!b(e)||e!==this._$AH&&e!==T,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=O(this,r[n+o],t,o),s===T&&(s=this._$AH[o]),a||=!b(s)||s!==this._$AH[o],s===E?e=E:e!==E&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ke=class extends k{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===E?void 0:e}},Ae=class extends k{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==E)}},je=class extends k{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=O(this,e,t,0)??E)===T)return;let n=this._$AH,r=e===E&&n!==E||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==E&&(n===E||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Me=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}},Ne=ce.litHtmlPolyfillSupport;Ne?.(Ee,Oe),(ce.litHtmlVersions??=[]).push(`3.3.3`);var Pe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Oe(t.insertBefore(y(),e),e,void 0,n??{})}return i._$AI(e),i},Fe=globalThis,A=class extends h{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Pe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};A._$litElement$=!0,A.finalized=!0,Fe.litElementHydrateSupport?.({LitElement:A});var Ie=Fe.litElementPolyfillSupport;Ie?.({LitElement:A}),(Fe.litElementVersions??=[]).push(`4.2.2`);var Le={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:oe},Re=(e=Le,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function j(e){return(t,n)=>typeof n==`object`?Re(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function ze(e){return j({...e,state:!0,attribute:!1})}var Be=new Map;function Ve(e){Be.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Be.set(e.type,e)}function He(){return Array.from(Be.values())}var Ue={width:`auto`};function M(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var N=class extends A{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ve({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ue,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots,bindingRoute:e.bindingRoute,blockEvents:e.blockEvents})}};M([j({type:Boolean,reflect:!0,attribute:`data-editable`})],N.prototype,`editable`,void 0);var We=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Ge(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Ke(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}var qe=[{key:`fixed`,name:`Fester Wert`},{key:`context`,name:`Ereigniswert`},{key:`data_field`,name:`Feld der Datenquelle`},{key:`previous_result`,name:`Vorheriger Schritt`},{key:`se_variable`,name:`SE VAR-Array`}];function P(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function Je(e){return!P(e)||typeof e.source!=`string`||!qe.some(t=>t.key===e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{}}}function Ye(e){if(!P(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!P(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=Je(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=Je(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function Xe(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!P(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=Ye(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}function F(e){return typeof e==`object`&&!!e}function Ze(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!F(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function I(e){return e==null?``:String(e).trim()}function L(e,t){if(!F(e)||t===``)return``;let n=t.trim(),r=I(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=I(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=I(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function R(e){if(!F(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function z(e,t){return I(e).toLowerCase()===t.trim().toLowerCase()}function Qe(e,t,n){if(!F(e)||!F(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(F(e)&&(z(e.ALIAS,t)||z(e.alias,t))){let t=R(e);if(t.length>0)return t}}else if(F(i))for(let e of Object.keys(i)){let n=i[e];if(z(e,t)||F(n)&&(z(n.ALIAS,t)||z(n.alias,t))){let e=R(n);if(e.length>0)return e}}let a=r.Tabellen;if(F(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=R(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(z(e,t)){let t=R(a[e]);if(t.length>0)return t}}return[]}function $e(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!F(t)||!F(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function et(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!F(t)||!F(t.MSG)))return t.MSG.DATA}function B(){return globalThis}function V(){let e=B();return F(e.SEDATA)&&F(e.SEDATA.Daten)}function tt(){let e=B();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function nt(){let e=B();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var rt=new Set,it=new Set;function at(e){rt.add(e)}function ot(e){return it.add(e),()=>{it.delete(e)}}function H(){rt.forEach(e=>e())}function st(e){it.forEach(t=>{try{t(e)}catch{}})}var U=new Map,W=``,ct=0;function lt(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function ut(){let e=lt();e&&(e.value=Array.from(U,([e,t])=>`${e}: ${t}`).join(`
`)+(W===``?``:`\n\nERSTES PAKET\n${W}`))}function G(e,t){U.set(e,t),ut()}function K(){let e=B();U.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),U.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),U.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),U.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),U.set(`Empfangene Pakete`,String(ct)),U.set(`SEDATA.Daten`,V()?`vorhanden`:`fehlt`),ut()}function dt(e){if(W===``)try{W=typeof e==`string`?e:JSON.stringify(e)??``,ut()}catch{}}function ft(e){ct+=1,dt(e),G(`Empfangene Pakete`,String(ct));let t=$e(e);if(!t){G(`Letztes Paket`,`Antwort ohne Daten`),st(e);return}let n=B();F(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,G(`Letztes Paket`,`Daten-Push angenommen`),G(`SEDATA.Daten`,`vorhanden`),nt(),H()}function pt(e=0){let t=B();if(typeof t.basisHTML_REGISTER==`function`){K();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{ft(e)},document.title,`1.0`),G(`Registrierung`,`ausgeführt`)}catch(e){G(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&G(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{pt(e+1)},25)):(K(),G(`Registrierung`,`nach 10s kein Interface`))}var mt=!1;function ht(){if(mt)return;mt=!0,G(`Runtime`,`gestartet`),G(`Registrierung`,`noch nicht ausgeführt`),K(),tt();let e=B();e.Erstellen=()=>{nt(),H()},e.initData=e.Erstellen,e.ReloadData=()=>{H()},pt(),window.addEventListener(`message`,e=>{if(typeof B().basisHTML_REGISTER==`function`)return;let t=et(e.data);t!==void 0&&ft(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){K();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,V()?(clearInterval(n),G(`SEDATA.Daten`,`vorhanden`),nt(),H()):t>100&&(clearInterval(n),G(`Daten-Wartezeit`,`nach 30s ohne Daten`))},300)}function gt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!F(n)||n.id!==t)&&!(typeof n.verb!=`string`||!We.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var _t=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function vt(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function yt(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function bt(e,t){if(t>12)return;let n=yt(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=bt(n,t+1);if(e!==void 0)return e}return}if(F(e)){for(let n of _t){if(!(n in e))continue;let r=bt(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=bt(n,t+1);if(e!==void 0)return e}}}function xt(e){let t=vt(e);if(F(t)){for(let e of _t){if(!(e in t))continue;let n=bt(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=xt(t);if(e!==void 0)return e}else if(F(e)){let t=xt(e);if(t!==void 0)return t}}}function St(e){return F(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function Ct(e,t){if(!F(e))return;let n=St(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=xt(e[t]);if(n!==void 0)return n}}var wt=[],Tt=!1,Et=6e3,Dt=100;function Ot(){if(Tt||wt.length===0)return;Tt=!0;let e=wt.shift(),t=B(),n=new Set(St(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),Tt=!1,e.resolve(t),Ot())},a=ot(e=>{let t=xt(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=Ct(B().SEDATA,n);e!==void 0&&i(e)},Dt),s=setTimeout(()=>{i(``)},Et);if(typeof t.basisHTML_SND_MSG!=`function`){i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch{i(``)}}function kt(e,t){ht();let n=B();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG==`function`)try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch{}return Promise.resolve(``)}return new Promise(n=>{wt.push({template:e,params:[...t],resolve:n}),Ot()})}function At(e,t,n=B()){if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(!F(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!F(t)||!F(t.Daten)||!F(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=Ze(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r||r.indexField===``)return``;let i=t.context.PINDEX??``;if(i===``)return``;let a=Qe(n.SEDATA,r.name,r.tableId).find(e=>L(e,r.indexField)===i);return a?L(a,e.value):``}function jt(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function Mt(e,t){if(e.trim()===``)return;let n=B();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(jt(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}var Nt=new WeakMap;async function Pt(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=Xe(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=Nt.get(e);if(i||(i=new Set,Nt.set(e,i)),!i.has(t)){i.add(t);try{let e={...n,NOW_DATE:Ge(new Date)},t=``;for(let n of r){if(n.type===`START_TOOL`){Mt(n.toolNr,Ke({params:n.toolParams},e));continue}let r=gt(B().FF_RELATIONS,n.relationId);if(!r)continue;let i={context:e,previousResult:t};t=await kt(r,[...n.params,...n.extraParams].map(e=>At(e,i))),n.resultKey!==``&&(e[n.resultKey]=t)}}finally{i.delete(t)}}}var Ft=new WeakSet;function It(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||Ft.has(e))return;Ft.add(e);let n=Xe(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&ht(),e.addEventListener(`click`,()=>{Pt(e,t,{})})}var Lt=class extends N{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.customProperties=[]}static{this.styles=[N.styles,o`
      button {
        box-sizing: border-box;
        padding: 7px 16px;
        cursor: pointer;
        border-radius: var(--se-r-sm);
        border: 1px solid var(--se-accent);
        background: var(--se-accent);
        color: var(--se-panel);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        transition: background-color 120ms ease, border-color 120ms ease;
      }
      button:hover { background: var(--se-accent-dark); border-color: var(--se-accent-dark); }
      button:focus-visible { outline: 2px solid var(--se-accent); outline-offset: 2px; }
    `]}render(){return C`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),It(this,`onClick`)}};M([j()],Lt.prototype,`label`,void 0),N.defineAndRegister(Lt);var Rt=[`info`,`success`,`warning`,`danger`];function zt(e){return Rt.includes(e)?e:`info`}function Bt(e,t){return{attributeName:e,name:`Farbe`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Vt=o`
  .chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--se-r-sm);
    font-family: var(--se-font);
    font-size: var(--se-fs-xs);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .chip.v-info { background: var(--se-blue-soft); color: var(--se-blue); }
  .chip.v-success { background: var(--se-green-soft); color: var(--se-green); }
  .chip.v-warning { background: var(--se-amber-soft); color: var(--se-amber); }
  .chip.v-danger { background: var(--se-red-soft); color: var(--se-red); }
`,Ht={dog:w`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,cat:w`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,rabbit:w`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,hamster:w`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,bird:w`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,reptile:w`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,paw:w`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`},Ut=[[`welpe`,`dog`],[`hund`,`dog`],[`kater`,`cat`],[`katze`,`cat`],[`kaninchen`,`rabbit`],[`hase`,`rabbit`],[`meerschweinchen`,`hamster`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`bird`],[`sittich`,`bird`],[`papagei`,`bird`],[`vogel`,`bird`],[`schildkr`,`reptile`],[`echse`,`reptile`],[`schlange`,`reptile`],[`gecko`,`reptile`],[`reptil`,`reptile`]];function Wt(e){let t=e.toLowerCase(),n=`paw`;for(let[e,r]of Ut)if(t.includes(e)){n=r;break}return C`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${Ht[n]}</svg>`}var q=class extends N{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[Bt(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[N.styles,Vt,o`
      .card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        min-height: 112px;
        overflow: hidden;
        gap: 5px;
        background: var(--se-card-bg);
        border: 1px solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 8px 10px 9px;
        font-family: var(--se-font);
      }
      .main {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }
      /* Zeit + Datum oben rechts (Nutzer-Entscheidung 2026-07-16) —
         align-self:flex-start hält die Gruppe an der Oberkante, auch wenn
         der Titelblock zweizeilig ist. */
      .when {
        display: flex;
        align-items: baseline;
        gap: 7px;
        flex: none;
        margin-left: auto;
        align-self: flex-start;
      }
      .time,
      .date {
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
      }
      /* Avatar wie das Empfang-Original: 30px runde getönte Fläche,
         17px-Silhouette in der Hausfarbe. */
      .avatar {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        flex: none;
        border-radius: var(--se-r-pill);
        background: var(--se-accent-soft);
        color: var(--se-accent);
      }
      .avatar svg {
        width: 17px;
        height: 17px;
        display: block;
      }
      .titles {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.25;
      }
      .trow {
        display: flex;
        align-items: baseline;
        gap: 5px;
        min-width: 0;
      }
      .heading,
      .heading2 {
        color: var(--se-ink);
        font-size: var(--se-fs-lg);
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        display: block;
        color: var(--se-faint);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .text {
        display: block;
        color: var(--se-muted);
        font-size: var(--se-fs);
        line-height: 1.35;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .card .chip {
        align-self: flex-start;
        margin-top: auto;
      }
      /* Leere Stellen existieren nur im Editor (die Maske rendert sie gar
         nicht, siehe render): ein Strich markiert das Klick-Ziel, der leere
         Avatar wird zum gestrichelten Kreis (Regel 7: Striche statt
         Demo-Werte). Lit-Marker-Kommentare zählen für :empty nicht. Die
         Daten-Markierung (gepunktete Linie, BasicBlock) ist am Avatar
         unsichtbar — er bekommt stattdessen eine gepunktete Umrandung. */
      :host([data-ff-editor]) [data-ff-spot]:empty::before {
        content: '—';
        color: var(--se-faint);
      }
      :host([data-ff-editor]) .avatar:empty::before {
        content: none;
      }
      :host([data-ff-editor]) .avatar:empty {
        background: transparent;
        border: 1px dashed var(--se-faint);
      }
    `]}stelle(e,t){return C`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}render(){let e=zt(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.heading)||n(this.heading2),i=n(this.time)||n(this.date);return C`<div class="card">
      ${n(this.avatar)||r||n(this.meta)||i?C`<div class="main">
            ${n(this.avatar)?C`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?E:Wt(this.avatar)}</span>`:E}
            <div class="titles">
              ${r?C`<div class="trow">
                    ${n(this.heading)?this.stelle(`heading`,`heading`):E}
                    ${n(this.heading2)?this.stelle(`heading2`,`heading2`):E}
                  </div>`:E}
              ${n(this.meta)?this.stelle(`meta`,`meta`):E}
            </div>
            ${i?C`<div class="when">
                  ${n(this.date)?this.stelle(`date`,`date`):E}
                  ${n(this.time)?this.stelle(`time`,`time`):E}
                </div>`:E}
          </div>`:E}
      ${n(this.text)?this.stelle(`text`,`text`):E}
      ${n(this.chipText)?C`<span
            class="chip v-${e}"
            data-ff-editable
            data-ff-spot="chipText"
            ?data-ff-bound=${this.chipTextField!==``}
            @dblclick=${e=>this.inlineEdit(e,`chipText`)}
          >${this.chipText}</span>`:E}
    </div>`}};M([j()],q.prototype,`chipVariant`,void 0),M([j()],q.prototype,`heading`,void 0),M([j()],q.prototype,`heading2`,void 0),M([j()],q.prototype,`time`,void 0),M([j()],q.prototype,`date`,void 0),M([j()],q.prototype,`avatar`,void 0),M([j()],q.prototype,`meta`,void 0),M([j()],q.prototype,`text`,void 0),M([j()],q.prototype,`chipText`,void 0),M([j()],q.prototype,`headingField`,void 0),M([j()],q.prototype,`heading2Field`,void 0),M([j()],q.prototype,`timeField`,void 0),M([j()],q.prototype,`dateField`,void 0),M([j()],q.prototype,`avatarField`,void 0),M([j()],q.prototype,`metaField`,void 0),M([j()],q.prototype,`textField`,void 0),M([j()],q.prototype,`chipTextField`,void 0),N.defineAndRegister(q);var Gt=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`];function Kt(e){return Gt.includes(e)?e:`text`}var qt=[`text`,`number`,`textarea`,`select`],J=class extends N{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this._belegt=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,isArray:!1,maxLength:0,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}}]}static{this.styles=[N.styles,o`
      .feld {
        font-family: var(--se-font);
        /* Innenabstände EINMAL definiert — .ctrl und .ph leiten sich beide
           daraus ab, damit der Platzhalter exakt an der Textposition sitzt.
           (N1: keine Magic Numbers, die beim Padding-Ändern auseinanderlaufen.) */
        --feld-pad-y: 7px;
        --feld-pad-x: 10px;
        --feld-rand: 1px;
      }
      /* Anker für den im Feld sitzenden Platzhalter. */
      .huelle { position: relative; }
      /* .ctrl exakt nach Referenz-Optik: Rahmen, Panel-Flaeche, kantiger
         Radius; Fokus = Hausfarbe als Rahmen + 1px-Ring (kein weicher
         Schatten — Flaechen leben von Rahmen). */
      .ctrl {
        box-sizing: border-box;
        width: 100%;
        padding: var(--feld-pad-y) var(--feld-pad-x);
        border: var(--feld-rand) solid var(--se-line);
        background: var(--se-panel);
        border-radius: var(--se-r-sm);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      .ctrl:focus {
        outline: none;
        border-color: var(--se-accent);
        box-shadow: 0 0 0 1px var(--se-accent);
      }
      textarea.ctrl {
        display: block;
        resize: vertical;
        min-height: 64px;
        line-height: 1.5;
      }
      select.ctrl { padding: calc(var(--feld-pad-y) - 1px) calc(var(--feld-pad-x) - 2px); }
      /* Der Platzhalter sitzt IM Feld (an der Textposition des .ctrl:
         1px Rahmen + 7px/10px Innenabstand), faengt keine Klicks der
         Maske ab und verschwindet, sobald das Feld Inhalt hat. */
      .ph {
        position: absolute;
        top: calc(var(--feld-pad-y) + var(--feld-rand));
        left: calc(var(--feld-pad-x) + var(--feld-rand));
        right: calc(var(--feld-pad-x) + var(--feld-rand));
        color: var(--se-faint);
        font-size: var(--se-fs);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
      }
      .ph[hidden] { display: none; }
      /* Select hat 1px weniger Innenabstand als Textfelder; der eingeblendete
         Feldtext sitzt trotzdem exakt an seiner nativen Textposition. */
      .ph-select {
        top: calc(var(--feld-pad-y) - 1px + var(--feld-rand));
        left: calc(var(--feld-pad-x) - 2px + var(--feld-rand));
        right: 25px; /* Platz für den Aufklapp-Pfeil */
      }
      /* Ankreuzfeld: Kästchen + Beschriftung in EINER Zeile (Referenz
         .impf-chk) — bewusst ohne <label for>-Kopplung: im Editor ist die
         Beschriftung das Umbenennen-Ziel. Den Haken-Klick auf den Text
         übernimmt in der MASKE ein eigener Handler (N1, s. onTextClick). */
      .zeile {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      input[type='checkbox'].ctrl {
        width: 15px;
        height: 15px;
        padding: 0;
        flex: none;
        accent-color: var(--se-accent);
      }
      /* Im Editor wird gestaltet, nicht ausgefuellt: das Eingabeelement
         nimmt dort keine Bedienung an — dafuer wird der Platzhalter
         anfassbar (Doppelklick = Text im Feld aendern). Ein leerer
         Platzhalter bekommt nur im Editor einen greifbaren Hinweis. */
      :host([data-ff-editor]) .ctrl { pointer-events: none; }
      :host([data-ff-editor]) .ph { pointer-events: auto; cursor: text; }
      /* N1: der "Text …"-Griff gilt für JEDEN geleerten Inline-Edit-Text —
         auch die Ankreuzfeld-Beschriftung bleibt im Editor anfassbar. */
      :host([data-ff-editor]) [data-ff-editable]:empty::before { content: 'Text …'; opacity: 0.6; }
      /* N1: in der MASKE schaltet die Beschriftung den Haken (Windows-
         Gewohnheit) — klickbar zeigen, Textauswahl beim Klicken vermeiden. */
      :host(:not([data-ff-editor])) .zeile .text { cursor: pointer; user-select: none; }
    `]}onInput(e){let t=e.target;this._belegt=t.value!==``}textTpl(e,t=!1){return C`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){if(this.hasAttribute(`data-ff-editor`))return;let e=this.renderRoot.querySelector(`input[type="checkbox"]`);e&&(e.checked=!e.checked)}controlTpl(e){switch(e){case`textarea`:return C`<textarea class="ctrl" @input=${this.onInput}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``);return C`<select class="ctrl" @change=${this.onInput}>
          <option value="" disabled selected hidden></option>
          ${e.length===0?C`<option disabled>(keine Optionen)</option>`:e.map(e=>C`<option value=${e}>${e}</option>`)}
        </select>`}default:return C`<input class="ctrl" type=${e} @input=${this.onInput} />`}}render(){let e=Kt(this.fieldType);return e===`checkbox`?C`<div class="feld">
        <div class="zeile">
          <input class="ctrl" type="checkbox" />
          ${this.textTpl(`text`)}
        </div>
      </div>`:C`<div class="feld">
      <div class="huelle">
        ${this.controlTpl(e)}
        ${qt.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this._belegt):E}
      </div>
    </div>`}};M([j()],J.prototype,`fieldType`,void 0),M([j()],J.prototype,`placeholder`,void 0),M([j()],J.prototype,`options`,void 0),M([ze()],J.prototype,`_belegt`,void 0),N.defineAndRegister(J);function Jt(e,t,n,r){return{attributeName:e,name:t,description:n,isArray:!1,maxLength:0,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var Y=class extends N{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[q.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[Bt(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),Jt(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte zeigt die Maske sie sichtbar in „Nicht zugeordnet“.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[N.styles,o`
      /* Die Spalte fuellt die Board-Hoehe in BEIDEN Welten (P1.2-Fix eines
         P1.3-Fehlers): die Host-HOEHE bleibt auto — nur so greift im Export
         das align-items:stretch des Boards (eine Prozent-Hoehe zaehlt fuer
         stretch nicht als auto und loeste sich gegen die unbestimmte
         Board-Hoehe zur Inhaltshoehe auf -> leere Spalten blieben kurz).
         min-height:100% deckt den Editor ab (BlockHost-Wrapper = Flex-Item,
         reicht feste Hoehen per 100%-Kette durch); der Host ist selbst
         Flex-Spalte, damit .col die Host-Box IMMER fuellt (flex:1 statt
         height:100% — Prozent braeuchte eine bestimmte Elternhoehe). */
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
      /* P1.2: overflow:hidden schneidet die getoente Kopfzeile an den
         runden Spaltenecken sauber ab (Empfang-Vorbild). */
      .col {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        background: var(--col-shell);
        border: 1px solid var(--col-line);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      .col.v-info { --col-strong: var(--se-blue); --col-soft: var(--se-blue-soft); --col-shell: var(--se-blue-shell); --col-line: var(--se-blue-line); }
      .col.v-success { --col-strong: var(--se-green); --col-soft: var(--se-green-soft); --col-shell: var(--se-green-shell); --col-line: var(--se-green-line); }
      .col.v-warning { --col-strong: var(--se-amber); --col-soft: var(--se-amber-soft); --col-shell: var(--se-amber-shell); --col-line: var(--se-amber-line); }
      .col.v-danger { --col-strong: var(--se-red); --col-soft: var(--se-red-soft); --col-shell: var(--se-red-shell); --col-line: var(--se-red-line); }
      /* Neutrale Laufzeitspalte. */
      :host([data-ff-nicht-zugeordnet]) .col {
        --col-strong: var(--se-muted);
        --col-soft: var(--se-bg);
        --col-shell: var(--se-panel);
        --col-line: var(--se-line);
      }
      .head {
        flex: none;
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 10px 12px;
        background: var(--col-soft);
        border-bottom: 1px solid var(--col-line);
      }
      .dot {
        flex: none;
        width: 9px;
        height: 9px;
        border-radius: var(--se-r-pill);
        background: var(--col-strong);
      }
      .title {
        color: var(--col-strong);
        font-size: var(--se-fs);
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .count {
        margin-left: auto;
        min-width: 22px;
        padding: 1px 8px;
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        border: 1px solid var(--col-line);
        text-align: center;
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        font-weight: 600;
        color: var(--col-strong);
      }
      /* K0: der Rumpf scrollt senkrecht (Empfang-Vorbild .vspalte-karten);
         min-height:0 erlaubt ihm, bei fester Board-Höhe kleiner zu werden
         als sein Inhalt — der Leer-Hinweis hält leere Spalten offen. */
      .body {
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap-sm);
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }
      slot { display: contents; }
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return C`<div class="col v-${zt(this.variant)}">
      <div class="head">
        <span class="dot"></span>
        <span
          class="title"
          data-ff-editable
          @dblclick=${e=>this.inlineEdit(e,`heading`)}
        >${this.heading}</span>
        <span class="count">${this._count}</span>
      </div>
      <div class="body">
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`}};M([j()],Y.prototype,`variant`,void 0),M([j()],Y.prototype,`heading`,void 0),M([ze()],Y.prototype,`_count`,void 0),N.defineAndRegister(Y);function Yt(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function Xt(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var Zt=new Set,Qt=new WeakMap,$t=Y.tagName,en=q.tagName,X=`data-ff-nicht-zugeordnet`,tn=`Nicht zugeordnet`;function nn(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===$t&&!e.hasAttribute(X))}function rn(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===en)}function an(e){return He().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function on(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=Ze(B().FF_DATA_SOURCES,t);if(!r)return;let i=nn(e);if(i.length===0)return;let a=Qt.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(en);t&&(a=t.cloneNode(!0),Qt.set(e,a))}if(!a)return;let o=Qe(B().SEDATA,r.name,r.tableId),s=i.map(e=>e.getAttribute(`heading`)??``),c=an(a.tagName),l=Xt(i.map(e=>e.getAttribute(`auffang`)));e.querySelectorAll(`[`+X+`]`).forEach(e=>e.remove());let u=null,d=()=>(u||(u=document.createElement($t),u.setAttribute(`heading`,tn),u.setAttribute(X,``),u.setAttribute(`style`,i[0].getAttribute(`style`)??`flex-grow:1;flex-basis:0;min-width:0`),e.appendChild(u)),u);for(let e of i)rn(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:Yt(L(e,n),s);(o>=0?i[o]:l>=0?i[l]:d()).appendChild(t);for(let n of c){let r=t.getAttribute(`${n.prop.toLowerCase()}field`)??``;r!==``&&(t[n.prop]=L(e,r))}let u=r.indexField===``?``:L(e,r.indexField);Z.set(t,{row:e,pindex:u}),t.draggable=!0}}var Z=new WeakMap,Q=null,sn=new WeakSet;function cn(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===$t&&e.contains(n))return n;return null}function ln(e,t){if(!Q||Q.board!==e)return;let n=Z.get(Q.card);if(!n)return;let r=t.getAttribute(`heading`)??``;Pt(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r})}function un(e){sn.has(e)||(sn.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&Pt(e,`onCardClick`,{PINDEX:Z.get(n)?.pindex??``})}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&(Q={card:n,board:e},t.dataTransfer?.setData(`text/plain`,Z.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{Q=null}),e.addEventListener(`dragover`,t=>{let n=cn(e,t);Q?.board===e&&n&&!n.hasAttribute(X)&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=cn(e,t);!n||n.hasAttribute(X)||(t.preventDefault(),ln(e,n),Q=null)}))}function dn(){V()&&Zt.forEach(on)}var fn=!1;function pn(e){e.hasAttribute(`data-ff-editor`)||(Zt.add(e),un(e),fn||(fn=!0,at(dn)),ht(),V()&&on(e))}function mn(e){Zt.delete(e)}var $=Y.blockType,hn=class extends N{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[$]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:$}}static{this.templateChild={type:q.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``}}static{this.bindingRoute={fieldProp:`statusField`}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0}]}static{this.defaultChildren=[{type:$,props:{heading:`Offen`,variant:`warning`},children:[{type:q.blockType}]},{type:$,props:{heading:`In Arbeit`,variant:`info`}},{type:$,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[N.styles,o`
      /* K0/Entscheidung A: ALLE Spalten sind IMMER nebeneinander sichtbar —
         kein Umbruch in die naechste Zeile, kein horizontaler Scroll,
         keine Mindestbreite. Die Spalten teilen sich die Zeile gleichmäßig
         (lockedWidth 'fill' der Spalte: flex-basis 0 + min-width 0) und
         werden gleich hoch (stretch); Karten scrollen senkrecht IM
         Spaltenrumpf. min-width:0 am Host erlaubt dem Board, in
         Zeilen-Bereichen schmaler zu werden als sein Inhalt. */
      /* height:100% laesst das Board eine feste Hoehe (P1.3) ausfuellen —
         im Editor traegt sie der Canvas-Wrapper, im Export das Element
         selbst (Inline-Style schlaegt die 100%). Ohne feste Hoehe loest
         sich 100% zu auto auf (Elternhoehe haengt vom Inhalt ab) —
         Verhalten wie bisher. */
      :host { min-width: 0; height: 100%; }
      .board {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: var(--se-gap-lg);
        height: 100%;
        box-sizing: border-box;
      }
      .board slot { display: contents; }
    `]}render(){return C`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),pn(this)}disconnectedCallback(){super.disconnectedCallback(),mn(this)}};N.defineAndRegister(hn);var gn=class extends N{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.customProperties=[]}static{this.styles=[N.styles,o`
      /* Wie die Maskenwurzel, nur waagerecht: Kinder beginnen oben
         (flex-start) und behalten ihre natuerliche Hoehe. min-width:0
         erlaubt der Zeile, in schmalen Umgebungen zu schrumpfen. */
      .zeile {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: var(--se-gap);
        min-width: 0;
      }
      .zeile slot { display: contents; }
    `]}render(){return C`<div class="zeile"><slot></slot></div>`}};N.defineAndRegister(gn)})();