(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},oe=(e,t)=>!l(e,t),se={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:oe};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var h=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=se){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??se}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??oe)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};h.elementStyles=[],h.shadowRootOptions={mode:`open`},h[p(`elementProperties`)]=new Map,h[p(`finalized`)]=new Map,ae?.({ReactiveElement:h}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var g=globalThis,ce=e=>e,_=g.trustedTypes,le=_?_.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ue=`$lit$`,v=`lit$${Math.random().toFixed(9).slice(2)}$`,de=`?`+v,fe=`<${de}>`,y=document,b=()=>y.createComment(``),x=e=>e===null||typeof e!=`object`&&typeof e!=`function`,pe=Array.isArray,me=e=>pe(e)||typeof e?.[Symbol.iterator]==`function`,he=`[ 	
\f\r]`,S=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,_e=/>/g,C=RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ve=/'/g,ye=/"/g,be=/^(?:script|style|textarea|title)$/i,w=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),T=Symbol.for(`lit-noChange`),E=Symbol.for(`lit-nothing`),xe=new WeakMap,D=y.createTreeWalker(y,129);function Se(e,t){if(!pe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return le===void 0?t:le.createHTML(t)}var Ce=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=S;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===S?c[1]===`!--`?o=ge:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=C):(be.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=C):o=_e:o===C?c[0]===`>`?(o=i??S,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?C:c[3]===`"`?ye:ve):o===ye||o===ve?o=C:o===ge||o===_e?o=S:(o=C,i=void 0);let d=o===C&&e[t+1].startsWith(`/>`)?` `:``;a+=o===S?n+fe:l>=0?(r.push(s),n.slice(0,l)+ue+n.slice(l)+v+d):n+v+(l===-2?t:d)}return[Se(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},O=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ce(t,n);if(this.el=e.createElement(l,r),D.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=D.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ue)){let t=u[o++],n=i.getAttribute(e).split(v),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Te:r[1]===`?`?Ee:r[1]===`@`?De:j}),i.removeAttribute(e)}else e.startsWith(v)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(be.test(i.tagName)){let e=i.textContent.split(v),t=e.length-1;if(t>0){i.textContent=_?_.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],b()),D.nextNode(),c.push({type:2,index:++a});i.append(e[t],b())}}}else if(i.nodeType===8)if(i.data===de)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(v,e+1))!==-1;)c.push({type:7,index:a}),e+=v.length-1}a++}}static createElement(e,t){let n=y.createElement(`template`);return n.innerHTML=e,n}};function k(e,t,n=e,r){if(t===T)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=x(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=k(e,i._$AS(e,t.values),i,r)),t}var we=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??y).importNode(t,!0);D.currentNode=r;let i=D.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new A(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Oe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=D.nextNode(),a++)}return D.currentNode=y,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},A=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=k(this,e,t),x(e)?e===E||e==null||e===``?(this._$AH!==E&&this._$AR(),this._$AH=E):e!==this._$AH&&e!==T&&this._(e):e._$litType$===void 0?e.nodeType===void 0?me(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==E&&x(this._$AH)?this._$AA.nextSibling.data=e:this.T(y.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=O.createElement(Se(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new we(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=xe.get(e.strings);return t===void 0&&xe.set(e.strings,t=new O(e)),t}k(t){pe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(b()),this.O(b()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ce(e).nextSibling;ce(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},j=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=E,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=E}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=k(this,e,t,0),a=!x(e)||e!==this._$AH&&e!==T,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=k(this,r[n+o],t,o),s===T&&(s=this._$AH[o]),a||=!x(s)||s!==this._$AH[o],s===E?e=E:e!==E&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Te=class extends j{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===E?void 0:e}},Ee=class extends j{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==E)}},De=class extends j{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=k(this,e,t,0)??E)===T)return;let n=this._$AH,r=e===E&&n!==E||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==E&&(n===E||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Oe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}},ke=g.litHtmlPolyfillSupport;ke?.(O,A),(g.litHtmlVersions??=[]).push(`3.3.3`);var Ae=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new A(t.insertBefore(b(),e),e,void 0,n??{})}return i._$AI(e),i},M=globalThis,N=class extends h{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ae(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};N._$litElement$=!0,N.finalized=!0,M.litElementHydrateSupport?.({LitElement:N});var je=M.litElementPolyfillSupport;je?.({LitElement:N}),(M.litElementVersions??=[]).push(`4.2.2`);var Me={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:oe},Ne=(e=Me,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function P(e){return(t,n)=>typeof n==`object`?Ne(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Pe(e){return P({...e,state:!0,attribute:!1})}var Fe=new Map;function Ie(e){Fe.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Fe.set(e.type,e)}function Le(){return Array.from(Fe.values())}var Re={width:`auto`};function F(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var I=class extends N{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ie({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Re,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,slotName:e.slotName,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,removable:e.removable,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots})}};F([P({type:Boolean,reflect:!0,attribute:`data-editable`})],I.prototype,`editable`,void 0);var ze=[`info`,`success`,`warning`,`danger`];function L(e){return ze.includes(e)?e:`info`}function R(e,t){return{attributeName:e,name:`Art`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Be=o`
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
`,Ve=class extends I{constructor(...e){super(...e),this.variant=`info`,this.text=`Hinweis`}static{this.blockType=`badge`}static{this.tagName=`ff-badge`}static{this.displayName=`Status-Chip`}static{this.category=`anzeige`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,text:`Hinweis`}}static{this.customProperties=[R(`variant`,`Bedeutung des Chips — bestimmt die Farbe.`)]}static{this.styles=[I.styles,Be]}render(){return w`<span
      class="chip v-${L(this.variant)}"
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};F([P()],Ve.prototype,`variant`,void 0),F([P()],Ve.prototype,`text`,void 0),I.defineAndRegister(Ve);var He=class extends I{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.customProperties=[]}static{this.styles=[I.styles,o`
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
    `]}render(){return w`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}};F([P()],He.prototype,`label`,void 0),I.defineAndRegister(He);var z=class extends I{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=`Rückruf Fr. Wagner`,this.text=`Befund Minka besprechen`,this.chipText=`Heute`,this.headingField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-vorlage`]}static{this.showInPalette=!1}static{this.defaultProps={chipVariant:`info`,heading:`Rückruf Fr. Wagner`,text:`Befund Minka besprechen`,chipText:`Heute`,headingField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`heading`,label:`Titel`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[R(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[I.styles,Be,o`
      .card {
        box-sizing: border-box;
        background: var(--se-card-bg);
        border: 1px solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 9px 11px 10px;
        font-family: var(--se-font);
      }
      .heading {
        margin: 0 0 2px;
        color: var(--se-ink);
        font-size: var(--se-fs);
        font-weight: 600;
        line-height: 1.3;
      }
      .text {
        margin: 0 0 8px;
        color: var(--se-muted);
        font-size: var(--se-fs-sm);
      }
    `]}render(){let e=L(this.chipVariant);return w`<div class="card">
      <p
        class="heading"
        data-ff-editable
        data-ff-spot="heading"
        ?data-ff-bound=${this.headingField!==``}
        @dblclick=${e=>this.inlineEdit(e,`heading`)}
      >${this.heading}</p>
      <p
        class="text"
        data-ff-editable
        data-ff-spot="text"
        ?data-ff-bound=${this.textField!==``}
        @dblclick=${e=>this.inlineEdit(e,`text`)}
      >${this.text}</p>
      <span
        class="chip v-${e}"
        data-ff-editable
        data-ff-spot="chipText"
        ?data-ff-bound=${this.chipTextField!==``}
        @dblclick=${e=>this.inlineEdit(e,`chipText`)}
      >${this.chipText}</span>
    </div>`}};F([P()],z.prototype,`chipVariant`,void 0),F([P()],z.prototype,`heading`,void 0),F([P()],z.prototype,`text`,void 0),F([P()],z.prototype,`chipText`,void 0),F([P()],z.prototype,`headingField`,void 0),F([P()],z.prototype,`textField`,void 0),F([P()],z.prototype,`chipTextField`,void 0),I.defineAndRegister(z);var B=class extends I{constructor(...e){super(...e),this.direction=`column`,this.gap=`md`,this.padding=`none`}static{this.blockType=`container`}static{this.tagName=`ff-container`}static{this.displayName=`Bereich`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.defaultProps={direction:`column`,gap:`md`,padding:`none`,width:`fill`}}static{this.customProperties=[]}static{this.styles=[I.styles,o`
      .wrap {
        display: flex;
        align-items: flex-start;
      }
      .wrap.column { flex-direction: column; }
      .wrap.row { flex-direction: row; flex-wrap: wrap; }
      .wrap.gap-sm { gap: var(--se-gap-sm); }
      .wrap.gap-md { gap: var(--se-gap); }
      .wrap.gap-lg { gap: var(--se-gap-lg); }
      .wrap.pad-none { padding: 0; }
      .wrap.pad-sm { padding: var(--se-gap-sm); }
      .wrap.pad-md { padding: var(--se-gap); }
      .wrap.pad-lg { padding: var(--se-gap-lg); }
      slot { display: contents; }
    `]}render(){return w`<div class="wrap ${this.direction===`row`?`row`:`column`} gap-${[`sm`,`md`,`lg`].includes(this.gap)?this.gap:`md`} pad-${[`none`,`sm`,`md`,`lg`].includes(this.padding)?this.padding:`none`}"><slot></slot></div>`}};F([P()],B.prototype,`direction`,void 0),F([P()],B.prototype,`gap`,void 0),F([P()],B.prototype,`padding`,void 0),I.defineAndRegister(B);var Ue=[`text`,`number`,`email`,`password`,`textarea`,`select`,`checkbox`,`date`];function We(e){return Ue.includes(e)?e:`text`}function Ge(e,t,n){return{attributeName:e,name:t,description:n,isArray:!1,maxLength:0,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}]}}var V=class extends I{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Text eingeben`,this.required=`nein`,this.readonly=`nein`,this.options=`Untersuchung, Impfung, Operation`}static{this.blockType=`formfield`}static{this.tagName=`ff-formfield`}static{this.displayName=`Eingabefeld`}static{this.category=`eingabe`}static{this.defaultProps={fieldType:`text`,placeholder:`Text eingeben`,required:`nein`,readonly:`nein`,options:`Untersuchung, Impfung, Operation`,width:240}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Art des Eingabefeldes.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`email`,label:`E-Mail`},{value:`password`,label:`Passwort`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`checkbox`,label:`Checkbox`},{value:`date`,label:`Datum`}]},{attributeName:`placeholder`,name:`Platzhalter`,description:`Grauer Hinweistext im leeren Feld.`,isArray:!1,maxLength:120,kind:`text`},{attributeName:`options`,name:`Optionen`,description:`Nur bei "Auswahl": Einträge mit Komma getrennt.`,isArray:!1,maxLength:500,kind:`text`},Ge(`required`,`Pflichtfeld`,`Muss ausgefüllt werden.`),Ge(`readonly`,`Nur lesen`,`Wert wird angezeigt, aber nicht bearbeitbar.`)]}static{this.styles=[I.styles,o`
      .control {
        box-sizing: border-box;
        width: 100%;
        height: 34px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel-2);
        padding: 0 10px;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      .control::placeholder { color: var(--se-faint); }
      .control:focus { outline: none; border-color: var(--se-accent); }
      textarea.control {
        height: auto;
        min-height: 74px;
        padding: 7px 10px;
        line-height: 1.4;
        resize: vertical;
      }
      input.control:read-only,
      textarea.control:read-only,
      .control:disabled {
        background: var(--se-line-soft);
        color: var(--se-muted);
      }
      .check {
        width: 18px;
        height: 18px;
        margin: 0;
        accent-color: var(--se-accent);
      }
    `]}get optionList(){return this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``)}render(){let e=We(this.fieldType),t=this.required===`ja`,n=this.readonly===`ja`;switch(e){case`textarea`:return w`<textarea
          class="control"
          placeholder=${this.placeholder}
          ?required=${t}
          ?readonly=${n}
        ></textarea>`;case`select`:return w`<select class="control" ?required=${t} ?disabled=${n}>
          ${this.optionList.map(e=>w`<option>${e}</option>`)}
        </select>`;case`checkbox`:return w`<input
          class="check"
          type="checkbox"
          ?required=${t}
          ?disabled=${n}
        />`;default:return w`<input
          class="control"
          type=${e}
          placeholder=${this.placeholder}
          ?required=${t}
          ?readonly=${n}
        />`}}};F([P()],V.prototype,`fieldType`,void 0),F([P()],V.prototype,`placeholder`,void 0),F([P()],V.prototype,`required`,void 0),F([P()],V.prototype,`readonly`,void 0),F([P()],V.prototype,`options`,void 0),I.defineAndRegister(V);var H=class extends I{constructor(...e){super(...e),this.variant=`info`,this.heading=`Hinweis`,this.message=`Das ist ein Hinweistext.`}static{this.blockType=`infobox`}static{this.tagName=`ff-infobox`}static{this.displayName=`Infobox`}static{this.category=`anzeige`}static{this.defaultProps={variant:`info`,heading:`Hinweis`,message:`Das ist ein Hinweistext.`}}static{this.customProperties=[R(`variant`,`Bedeutung der Box — bestimmt die Farbe.`)]}static{this.styles=[I.styles,o`
      .box {
        box-sizing: border-box;
        border: 1px solid var(--se-line);
        border-left-width: 4px;
        border-radius: var(--se-r-md);
        padding: var(--se-gap);
        font-family: var(--se-font);
        font-size: var(--se-fs);
      }
      .box.v-info { border-left-color: var(--se-blue); background: var(--se-blue-soft); }
      .box.v-success { border-left-color: var(--se-green); background: var(--se-green-soft); }
      .box.v-warning { border-left-color: var(--se-amber); background: var(--se-amber-soft); }
      .box.v-danger { border-left-color: var(--se-red); background: var(--se-red-soft); }
      .heading {
        margin: 0 0 var(--se-gap-sm);
        color: var(--se-ink);
        font-weight: 600;
      }
      .message {
        margin: 0;
        color: var(--se-muted);
        line-height: 1.45;
      }
    `]}render(){return w`<div class="box v-${L(this.variant)}">
      <p
        class="heading"
        data-ff-editable
        @dblclick=${e=>this.inlineEdit(e,`heading`)}
      >${this.heading}</p>
      <p
        class="message"
        data-ff-editable
        @dblclick=${e=>this.inlineEdit(e,`message`)}
      >${this.message}</p>
    </div>`}};F([P()],H.prototype,`variant`,void 0),F([P()],H.prototype,`heading`,void 0),F([P()],H.prototype,`message`,void 0),I.defineAndRegister(H);var U=class extends I{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,statusValue:``}}static{this.customProperties=[R(`variant`,`Bedeutung der Spalte — bestimmt die Farbe der Oberlinie.`),{attributeName:`statusValue`,name:`Datenwert dieser Spalte`,description:`Zeilen, deren Spalten-Feld genau diesen Wert hat, landen hier. Kein Treffer irgendwo → erste Spalte. Der sichtbare Titel bleibt unabhängig davon.`,isArray:!1,maxLength:60,kind:`text`,requiresDataSource:!0}]}static{this.styles=[I.styles,o`
      .col {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-top: 3px solid var(--se-faint);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      .col.v-info { border-top-color: var(--se-blue); }
      .col.v-success { border-top-color: var(--se-green); }
      .col.v-warning { border-top-color: var(--se-amber); }
      .col.v-danger { border-top-color: var(--se-red); }
      .head {
        flex: none;
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 9px 11px;
        border-bottom: 1px solid var(--se-line-soft);
      }
      .title {
        color: var(--se-ink);
        font-size: var(--se-fs-sm);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .count {
        margin-left: auto;
        min-width: 22px;
        height: 20px;
        padding: 0 6px;
        border-radius: var(--se-r-sm);
        background: var(--se-panel-2);
        border: 1px solid var(--se-line-soft);
        display: grid;
        place-items: center;
        font-family: var(--se-mono);
        font-size: 11.5px;
        font-weight: 600;
        color: var(--se-muted);
      }
      /* K0: der Rumpf scrollt senkrecht (Empfang-Vorbild .vspalte-karten);
         min-height:0 erlaubt ihm, bei fester Board-Höhe kleiner zu werden
         als sein Inhalt — der Leer-Hinweis hält leere Spalten offen. */
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap);
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }
      .drop {
        border: 1.5px dashed var(--se-line);
        border-radius: var(--se-r-md);
        color: var(--se-faint);
        font-size: var(--se-fs-sm);
        text-align: center;
        padding: 16px 8px;
      }
      slot { display: contents; }
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)).length}render(){return w`<div class="col v-${L(this.variant)}">
      <div class="head">
        <span
          class="title"
          data-ff-editable
          @dblclick=${e=>this.inlineEdit(e,`heading`)}
        >${this.heading}</span>
        <span class="count">${this._count}</span>
      </div>
      <div class="body">
        ${this._count===0?w`<div class="drop">Karten entstehen aus der Datenquelle</div>`:null}
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`}};F([P()],U.prototype,`variant`,void 0),F([P()],U.prototype,`heading`,void 0),F([Pe()],U.prototype,`_count`,void 0),I.defineAndRegister(U);var Ke=class extends I{static{this.blockType=`kanban-vorlage`}static{this.tagName=`ff-kanban-vorlage`}static{this.displayName=`Kartenvorlage`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[z.blockType]}static{this.allowedParentTypes=[`kanban`]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.removable=!1}static{this.addChildButton={label:`Karte`,childType:z.blockType}}static{this.resizableWidth=!1}static{this.slotName=`vorlage`}static{this.lockedWidth=`auto`}static{this.defaultProps={}}static{this.defaultChildren=[{type:z.blockType}]}static{this.styles=[I.styles,o`
      .vorlage {
        box-sizing: border-box;
        background: var(--se-panel);
        border: 1.5px dashed var(--se-line);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      .head {
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 9px 11px;
        border-bottom: 1px solid var(--se-line-soft);
        color: var(--se-faint);
        font-size: var(--se-fs-xs);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap);
      }
      slot { display: contents; }
    `]}render(){return w`<div class="vorlage">
      <div class="head">Kartenvorlage</div>
      <div class="body"><slot></slot></div>
    </div>`}};I.defineAndRegister(Ke);var qe=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Je(e){return e.replace(/^IDB/,``)}function Ye(e){let t=/^(\d+)_(\d+)$/.exec(e);return t?{pos:t[1],len:t[2]}:null}function Xe(e,t){return e.params.map(e=>e.replace(/\{([A-Z_]+)\}/g,(e,n)=>String(t[n]??``)))}function W(e){return typeof e==`object`&&!!e}function Ze(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!W(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function Qe(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!W(n)||n.id!==t)&&!(typeof n.verb!=`string`||!qe.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}function $e(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function et(e){return e==null?``:String(e).trim()}function G(e,t){if(!W(e)||t===``)return``;let n=et(e[t]);if(n!==``)return n;let r=/^(\d+)_(\d+)$/.exec(t);if(!r)return``;let i=et(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(i===``)return``;let a=Number(r[1]),o=Number(r[2]);return o<=0?``:i.substring(a,a+o).trim()}function tt(e,t,n){if(!W(e)||t===``)return!1;let r=!1;Object.prototype.hasOwnProperty.call(e,t)&&(e[t]=n,r=!0);let i=/^(\d+)_(\d+)$/.exec(t);if(i){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let a=e[t],o=Number(i[1]),s=Number(i[2]);if(s>0){let i=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=a.length<o?a.padEnd(o,` `):a;e[t]=c.slice(0,o)+i+c.slice(o+s),r=!0}}}return r}function K(e){if(!W(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function q(e,t){return et(e).toLowerCase()===t.trim().toLowerCase()}function nt(e,t,n){if(!W(e)||!W(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(W(e)&&(q(e.ALIAS,t)||q(e.alias,t))){let t=K(e);if(t.length>0)return t}}else if(W(i))for(let e of Object.keys(i)){let n=i[e];if(q(e,t)||W(n)&&(q(n.ALIAS,t)||q(n.alias,t))){let e=K(n);if(e.length>0)return e}}let a=r.Tabellen;if(W(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=K(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(q(e,t)){let t=K(a[e]);if(t.length>0)return t}}return[]}function rt(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return 0}function J(){return globalThis}function it(){let e=J();return W(e.SEDATA)&&W(e.SEDATA.Daten)}function at(){let e=J();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function ot(){let e=J();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var st=new Set,ct=new WeakMap,lt=!1,ut=U.tagName,dt=z.tagName,ft=Ke.tagName;function pt(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===ut)}function mt(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===dt)}function ht(e){return Le().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function Y(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``||n===``)return;let r=Ze(J().FF_DATA_SOURCES,t);if(!r)return;let i=pt(e);if(i.length===0)return;let a=Array.from(e.children).find(e=>e.tagName.toLowerCase()===ft),o=ct.get(e);if(!o){let t=a?.querySelector(dt);if(t)o=t.cloneNode(!0),ct.set(e,o);else for(let t of i){let n=mt(t)[0];if(n){o=n.cloneNode(!0),ct.set(e,o);break}}}if(!o)return;a&&(a.style.display=`none`);let s=nt(J().SEDATA,r.name,r.tableId),c=i.map(e=>e.getAttribute(`statusvalue`)??``),l=ht(o.tagName);for(let e of i)mt(e).forEach(e=>e.remove());for(let e of s){let t=o.cloneNode(!0);i[rt(G(e,n),c)].appendChild(t);for(let n of l){let r=t.getAttribute(`${n.prop.toLowerCase()}field`)??``;r!==``&&(t[n.prop]=G(e,r))}let a=G(e,r.indexField);a!==``&&(X.set(t,{row:e,pindex:a}),t.draggable=!0)}}var X=new WeakMap,Z=null,gt=new WeakSet;function _t(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===ut&&e.contains(n))return n;return null}function vt(e){let t=J(),n=Qe(t.FF_RELATIONS,e.getAttribute(`putrelation`)??``),r=Ze(t.FF_DATA_SOURCES,e.getAttribute(`source`)??``);if(!(!n||!r))return{template:n,relId:Je(r.tableId)}}function yt(e,t,n,r){let i=J();if(typeof i.basisHTML_SND_MSG!=`function`)return;let a=Ye(t);a&&i.basisHTML_SND_MSG(e.template.verb,{NR:e.template.nr,PARAMS:Xe(e.template,{FELD_POS:a.pos,FELD_LEN:a.len,PINDEX:n,DROP_PINDEX:n,RELID:e.relId,VALUE:r,NOW_DATE:$e(new Date)})})}function bt(e,t){if(!Z||Z.board!==e)return;let n=X.get(Z.card);if(!n)return;let r=e.getAttribute(`statusfield`)??``,i=t.getAttribute(`statusvalue`)??``;if(r===``||i.trim()===``||G(n.row,r).trim().toLowerCase()===i.trim().toLowerCase())return;let a=vt(e);a&&(yt(a,r,n.pindex,i),tt(n.row,r,i),Y(e))}function xt(e){gt.has(e)||(gt.add(e),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&X.has(e))??null;n&&(Z={card:n,board:e},t.dataTransfer?.setData(`text/plain`,X.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{Z=null}),e.addEventListener(`dragover`,t=>{Z?.board===e&&_t(e,t)&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=_t(e,t);n&&(t.preventDefault(),bt(e,n),Z=null)}))}function Q(){it()&&st.forEach(Y)}function St(){if(lt)return;lt=!0,at();let e=J();e.Erstellen=()=>{ot(),Q()},e.initData=e.Erstellen,e.ReloadData=()=>Q();let t=0,n=setInterval(()=>{t+=1,it()?(clearInterval(n),ot(),Q()):t>100&&clearInterval(n)},300)}function Ct(e){e.hasAttribute(`data-ff-editor`)||(st.add(e),xt(e),St(),it()&&Y(e))}function wt(e){st.delete(e)}var $=U.blockType,Tt=Ke.blockType,Et=class extends I{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[$,Tt]}static{this.childDirection=`row`}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:$}}static{this.acceptsDataSource=!0}static{this.defaultProps={width:`fill`,source:``,statusField:``,putRelation:`standard-put`}}static{this.customProperties=[{attributeName:`statusField`,name:`Spalten aus Feld`,description:`Feld der Datenquelle, dessen Wert bestimmt, in welcher Spalte eine Zeile landet.`,isArray:!1,maxLength:0,kind:`field`},{attributeName:`putRelation`,name:`Schreiben über`,description:`Relation-Vorlage, mit der eine gezogene Karte ihren neuen Spaltenwert zurückschreibt.`,isArray:!1,maxLength:0,kind:`relation`,requiresDataSource:!0}]}static{this.defaultChildren=[{type:Tt},{type:$,props:{heading:`Offen`,variant:`warning`}},{type:$,props:{heading:`In Arbeit`,variant:`info`}},{type:$,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[I.styles,o`
      /* K0/Entscheidung A: ALLE Spalten sind IMMER nebeneinander sichtbar —
         kein Umbruch in die naechste Zeile, kein horizontaler Scroll,
         keine Mindestbreite. Die Spalten teilen sich die Zeile gleichmäßig
         (lockedWidth 'fill' der Spalte: flex-basis 0 + min-width 0) und
         werden gleich hoch (stretch); Karten scrollen senkrecht IM
         Spaltenrumpf. min-width:0 am Host erlaubt dem Board, in
         Zeilen-Bereichen schmaler zu werden als sein Inhalt. */
      :host { min-width: 0; }
      .wrap { display: flex; flex-direction: column; }
      /* Vorlagen-Kasten: eigene volle Zeile ÜBER den Spalten (benannter
         Slot aus der Registry, slotName='vorlage') — stiehlt ihnen nie
         Breite. Der Abstand hängt als Margin am geslotteten Kasten:
         blendet die Laufzeit ihn aus (display:none), verschwindet der
         Abstand mit. */
      slot[name='vorlage'] { display: block; }
      slot[name='vorlage']::slotted(*) { margin-bottom: var(--se-gap-lg); }
      .board {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: var(--se-gap-lg);
      }
      .board slot { display: contents; }
    `]}render(){return w`<div class="wrap">
      <slot name="vorlage"></slot>
      <div class="board"><slot></slot></div>
    </div>`}connectedCallback(){super.connectedCallback(),Ct(this)}disconnectedCallback(){super.disconnectedCallback(),wt(this)}};I.defineAndRegister(Et);var Dt=class extends I{constructor(...e){super(...e),this.text=`Neuer Text`}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Textblock`}static{this.category=`anzeige`}static{this.defaultProps={text:`Neuer Text`}}static{this.customProperties=[]}static{this.styles=[I.styles,o`
      span {
        display: block;
        min-width: 1ch;
        color: var(--se-ink);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        line-height: 1.45;
      }
    `]}render(){return w`<span
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};F([P()],Dt.prototype,`text`,void 0),I.defineAndRegister(Dt)})();