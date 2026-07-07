(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},oe=(e,t)=>!l(e,t),se={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:oe};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var h=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=se){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??se}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??oe)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};h.elementStyles=[],h.shadowRootOptions={mode:`open`},h[p(`elementProperties`)]=new Map,h[p(`finalized`)]=new Map,ae?.({ReactiveElement:h}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var g=globalThis,ce=e=>e,_=g.trustedTypes,le=_?_.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ue=`$lit$`,v=`lit$${Math.random().toFixed(9).slice(2)}$`,de=`?`+v,fe=`<${de}>`,y=document,b=()=>y.createComment(``),x=e=>e===null||typeof e!=`object`&&typeof e!=`function`,S=Array.isArray,pe=e=>S(e)||typeof e?.[Symbol.iterator]==`function`,C=`[ 	
\f\r]`,w=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,me=/-->/g,he=/>/g,T=RegExp(`>|${C}(?:([^\\s"'>=/]+)(${C}*=${C}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ge=/'/g,_e=/"/g,ve=/^(?:script|style|textarea|title)$/i,E=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),D=Symbol.for(`lit-noChange`),O=Symbol.for(`lit-nothing`),ye=new WeakMap,k=y.createTreeWalker(y,129);function be(e,t){if(!S(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return le===void 0?t:le.createHTML(t)}var xe=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=w;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===w?c[1]===`!--`?o=me:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=T):(ve.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=T):o=he:o===T?c[0]===`>`?(o=i??w,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?T:c[3]===`"`?_e:ge):o===_e||o===ge?o=T:o===me||o===he?o=w:(o=T,i=void 0);let d=o===T&&e[t+1].startsWith(`/>`)?` `:``;a+=o===w?n+fe:l>=0?(r.push(s),n.slice(0,l)+ue+n.slice(l)+v+d):n+v+(l===-2?t:d)}return[be(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},A=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=xe(t,n);if(this.el=e.createElement(l,r),k.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=k.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ue)){let t=u[o++],n=i.getAttribute(e).split(v),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ce:r[1]===`?`?we:r[1]===`@`?Te:N}),i.removeAttribute(e)}else e.startsWith(v)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ve.test(i.tagName)){let e=i.textContent.split(v),t=e.length-1;if(t>0){i.textContent=_?_.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],b()),k.nextNode(),c.push({type:2,index:++a});i.append(e[t],b())}}}else if(i.nodeType===8)if(i.data===de)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(v,e+1))!==-1;)c.push({type:7,index:a}),e+=v.length-1}a++}}static createElement(e,t){let n=y.createElement(`template`);return n.innerHTML=e,n}};function j(e,t,n=e,r){if(t===D)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=x(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=j(e,i._$AS(e,t.values),i,r)),t}var Se=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??y).importNode(t,!0);k.currentNode=r;let i=k.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new M(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ee(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=k.nextNode(),a++)}return k.currentNode=y,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},M=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=O,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=j(this,e,t),x(e)?e===O||e==null||e===``?(this._$AH!==O&&this._$AR(),this._$AH=O):e!==this._$AH&&e!==D&&this._(e):e._$litType$===void 0?e.nodeType===void 0?pe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==O&&x(this._$AH)?this._$AA.nextSibling.data=e:this.T(y.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=A.createElement(be(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Se(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=ye.get(e.strings);return t===void 0&&ye.set(e.strings,t=new A(e)),t}k(t){S(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(b()),this.O(b()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ce(e).nextSibling;ce(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},N=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=O,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=O}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=j(this,e,t,0),a=!x(e)||e!==this._$AH&&e!==D,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=j(this,r[n+o],t,o),s===D&&(s=this._$AH[o]),a||=!x(s)||s!==this._$AH[o],s===O?e=O:e!==O&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===O?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ce=class extends N{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===O?void 0:e}},we=class extends N{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==O)}},Te=class extends N{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=j(this,e,t,0)??O)===D)return;let n=this._$AH,r=e===O&&n!==O||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==O&&(n===O||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ee=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){j(this,e)}},De=g.litHtmlPolyfillSupport;De?.(A,M),(g.litHtmlVersions??=[]).push(`3.3.3`);var Oe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new M(t.insertBefore(b(),e),e,void 0,n??{})}return i._$AI(e),i},P=globalThis,F=class extends h{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Oe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return D}};F._$litElement$=!0,F.finalized=!0,P.litElementHydrateSupport?.({LitElement:F});var ke=P.litElementPolyfillSupport;ke?.({LitElement:F}),(P.litElementVersions??=[]).push(`4.2.2`);var Ae={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:oe},je=(e=Ae,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function I(e){return(t,n)=>typeof n==`object`?je(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Me(e){return I({...e,state:!0,attribute:!1})}var L=new Map;function Ne(e){L.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),L.set(e.type,e)}function Pe(){return Array.from(L.values())}var Fe={width:`auto`};function R(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var z=class extends F{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ne({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Fe,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,allowedChildTypes:e.allowedChildTypes,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots})}};R([I({type:Boolean,reflect:!0,attribute:`data-editable`})],z.prototype,`editable`,void 0);var Ie=[`info`,`success`,`warning`,`danger`];function B(e){return Ie.includes(e)?e:`info`}function V(e,t){return{attributeName:e,name:`Art`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Le=o`
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
`,H=class extends z{constructor(...e){super(...e),this.variant=`info`,this.text=`Hinweis`}static{this.blockType=`badge`}static{this.tagName=`ff-badge`}static{this.displayName=`Status-Chip`}static{this.category=`anzeige`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,text:`Hinweis`}}static{this.customProperties=[V(`variant`,`Bedeutung des Chips — bestimmt die Farbe.`)]}static{this.styles=[z.styles,Le]}render(){return E`<span
      class="chip v-${B(this.variant)}"
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};R([I()],H.prototype,`variant`,void 0),R([I()],H.prototype,`text`,void 0),z.defineAndRegister(H);var Re=class extends z{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.customProperties=[]}static{this.styles=[z.styles,o`
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
    `]}render(){return E`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}};R([I()],Re.prototype,`label`,void 0),z.defineAndRegister(Re);var U=class extends z{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=`Rückruf Fr. Wagner`,this.text=`Befund Minka besprechen`,this.chipText=`Heute`,this.headingField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.defaultProps={chipVariant:`info`,heading:`Rückruf Fr. Wagner`,text:`Befund Minka besprechen`,chipText:`Heute`,headingField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`heading`,label:`Titel`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[V(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[z.styles,Le,o`
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
    `]}render(){let e=B(this.chipVariant);return E`<div class="card">
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
    </div>`}};R([I()],U.prototype,`chipVariant`,void 0),R([I()],U.prototype,`heading`,void 0),R([I()],U.prototype,`text`,void 0),R([I()],U.prototype,`chipText`,void 0),R([I()],U.prototype,`headingField`,void 0),R([I()],U.prototype,`textField`,void 0),R([I()],U.prototype,`chipTextField`,void 0),z.defineAndRegister(U);var W=class extends z{constructor(...e){super(...e),this.direction=`column`,this.gap=`md`,this.padding=`none`}static{this.blockType=`container`}static{this.tagName=`ff-container`}static{this.displayName=`Bereich`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.defaultProps={direction:`column`,gap:`md`,padding:`none`,width:`fill`}}static{this.customProperties=[]}static{this.styles=[z.styles,o`
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
    `]}render(){return E`<div class="wrap ${this.direction===`row`?`row`:`column`} gap-${[`sm`,`md`,`lg`].includes(this.gap)?this.gap:`md`} pad-${[`none`,`sm`,`md`,`lg`].includes(this.padding)?this.padding:`none`}"><slot></slot></div>`}};R([I()],W.prototype,`direction`,void 0),R([I()],W.prototype,`gap`,void 0),R([I()],W.prototype,`padding`,void 0),z.defineAndRegister(W);var G=class extends z{constructor(...e){super(...e),this.variant=`info`,this.heading=`Hinweis`,this.message=`Das ist ein Hinweistext.`}static{this.blockType=`infobox`}static{this.tagName=`ff-infobox`}static{this.displayName=`Infobox`}static{this.category=`anzeige`}static{this.defaultProps={variant:`info`,heading:`Hinweis`,message:`Das ist ein Hinweistext.`}}static{this.customProperties=[V(`variant`,`Bedeutung der Box — bestimmt die Farbe.`)]}static{this.styles=[z.styles,o`
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
    `]}render(){return E`<div class="box v-${B(this.variant)}">
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
    </div>`}};R([I()],G.prototype,`variant`,void 0),R([I()],G.prototype,`heading`,void 0),R([I()],G.prototype,`message`,void 0),z.defineAndRegister(G);var K=class extends z{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[U.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Karte`,childType:U.blockType}}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,statusValue:``,width:290}}static{this.customProperties=[V(`variant`,`Bedeutung der Spalte — bestimmt die Farbe der Oberlinie.`),{attributeName:`statusValue`,name:`Datenwert dieser Spalte`,description:`Zeilen, deren Spalten-Feld genau diesen Wert hat, landen hier. Kein Treffer irgendwo → erste Spalte. Der sichtbare Titel bleibt unabhängig davon.`,isArray:!1,maxLength:60,kind:`text`,requiresDataSource:!0}]}static{this.styles=[z.styles,o`
      .col {
        box-sizing: border-box;
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
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap);
        min-height: 150px;
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)).length}render(){return E`<div class="col v-${B(this.variant)}">
      <div class="head">
        <span
          class="title"
          data-ff-editable
          @dblclick=${e=>this.inlineEdit(e,`heading`)}
        >${this.heading}</span>
        <span class="count">${this._count}</span>
      </div>
      <div class="body">
        ${this._count===0?E`<div class="drop">Karte hierher ziehen</div>`:null}
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`}};R([I()],K.prototype,`variant`,void 0),R([I()],K.prototype,`heading`,void 0),R([Me()],K.prototype,`_count`,void 0),z.defineAndRegister(K);var ze=[{id:`terminplaner`,name:`Terminplaner`,idbId:`IDBID0001`,indexField:`0_10`,fields:[{code:`10_8`,label:`Adressnummer`,sample:`K2`},{code:`18_30`,label:`Tierart`,sample:`Katze`},{code:`48_30`,label:`Rasse`,sample:`Hauskatze`},{code:`78_30`,label:`Tiername`,sample:`Minka`},{code:`108_10`,label:`Geburtsdatum`,sample:`12.03.2021`},{code:`118_60`,label:`Behandlung`,sample:`Erbrechen seit heute Morgen`},{code:`178_5`,label:`Uhrzeit`,sample:`10:30`},{code:`183_10`,label:`Datum`,sample:`07.07.2026`},{code:`193_30`,label:`Vorname`,sample:`Lisa`},{code:`223_30`,label:`Nachname`,sample:`Wagner`},{code:`253_30`,label:`Zimmer`,sample:`Zimmer 2`},{code:`319_12`,label:`Priorität`,sample:`Notfall`},{code:`331_12`,label:`Belegnummer`,sample:`B-5012`}]},{id:`kundenhaustiere`,name:`Kundenhaustiere`,idbId:`IDBID0004`,fields:[{code:`10_8`,label:`Adressnummer`,sample:`K2`},{code:`18_30`,label:`Tiername`,sample:`Minka`},{code:`48_30`,label:`Tierart`,sample:`Katze`},{code:`78_30`,label:`Rasse`,sample:`Hauskatze`},{code:`108_10`,label:`Geburtsdatum`,sample:`12.03.2021`},{code:`118_10`,label:`Termindatum`,sample:`07.07.2026`},{code:`128_350`,label:`Notiz`,sample:`Frisst schlecht seit gestern`},{code:`524_60`,label:`Behandlung`,sample:`Erbrechen seit heute Morgen`}]}];function Be(e){return ze.find(t=>t.id===e)}function q(e){return typeof e==`object`&&!!e}function Ve(e){return e==null?``:String(e).trim()}function He(e,t){if(!q(e)||t===``)return``;let n=Ve(e[t]);if(n!==``)return n;let r=/^(\d+)_(\d+)$/.exec(t);if(!r)return``;let i=Ve(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(i===``)return``;let a=Number(r[1]),o=Number(r[2]);return o<=0?``:i.substring(a,a+o).trim()}function J(e){if(!q(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function Y(e,t){return Ve(e).toLowerCase()===t.trim().toLowerCase()}function Ue(e,t,n){if(!q(e)||!q(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(q(e)&&(Y(e.ALIAS,t)||Y(e.alias,t))){let t=J(e);if(t.length>0)return t}}else if(q(i))for(let e of Object.keys(i)){let n=i[e];if(Y(e,t)||q(n)&&(Y(n.ALIAS,t)||Y(n.alias,t))){let e=J(n);if(e.length>0)return e}}let a=r.Tabellen;if(q(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=J(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(Y(e,t)){let t=J(a[e]);if(t.length>0)return t}}return[]}function We(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return 0}function X(){return globalThis}function Ge(){let e=X();return q(e.SEDATA)&&q(e.SEDATA.Daten)}function Ke(){let e=X();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function qe(){let e=X();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var Je=new Set,Ye=new WeakMap,Xe=!1,Ze=K.tagName,Qe=U.tagName;function $e(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Ze)}function et(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Qe)}function tt(e){return Pe().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function nt(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``||n===``)return;let r=Be(t);if(!r)return;let i=$e(e);if(i.length===0)return;let a=Ye.get(e);if(!a)for(let t of i){let n=et(t)[0];if(n){a=n.cloneNode(!0),Ye.set(e,a);break}}if(!a)return;let o=Ue(X().SEDATA,r.name,r.idbId),s=i.map(e=>e.getAttribute(`statusvalue`)??``),c=tt(a.tagName);for(let e of i)et(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0);i[We(He(e,n),s)].appendChild(t);for(let n of c){let r=t.getAttribute(`${n.prop.toLowerCase()}field`)??``;r!==``&&(t[n.prop]=He(e,r))}}}function Z(){Ge()&&Je.forEach(nt)}function rt(){if(Xe)return;Xe=!0,Ke();let e=X();e.Erstellen=()=>{qe(),Z()},e.initData=e.Erstellen,e.ReloadData=()=>Z();let t=0,n=setInterval(()=>{t+=1,Ge()?(clearInterval(n),qe(),Z()):t>100&&clearInterval(n)},300)}function it(e){e.hasAttribute(`data-ff-editor`)||(Je.add(e),rt(),Ge()&&nt(e))}function at(e){Je.delete(e)}var Q=K.blockType,$=U.blockType,ot=class extends z{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[Q]}static{this.childDirection=`row`}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:Q}}static{this.acceptsDataSource=!0}static{this.defaultProps={width:`fill`,source:``,statusField:``}}static{this.customProperties=[{attributeName:`statusField`,name:`Spalten aus Feld`,description:`Feld der Datenquelle, dessen Wert bestimmt, in welcher Spalte eine Zeile landet.`,isArray:!1,maxLength:0,kind:`field`}]}static{this.defaultChildren=[{type:Q,props:{heading:`Offen`,variant:`warning`},children:[{type:$,props:{heading:`Rückruf Fr. Wagner`,text:`Befund Minka besprechen`,chipVariant:`warning`,chipText:`Wartet seit 2 Tagen`}},{type:$,props:{heading:`Rechnung Nr. 5012 prüfen`,text:`Position Narkose fehlt`,chipVariant:`danger`,chipText:`Überfällig`}},{type:$,props:{heading:`Impfpass nachtragen`,text:`Buddy · Golden Retriever`,chipVariant:`info`,chipText:`Heute`}}]},{type:Q,props:{heading:`In Arbeit`,variant:`info`},children:[{type:$,props:{heading:`Röntgenbilder anfordern`,text:`Klinik Dr. Steiner, Fall Rocky`,chipVariant:`info`,chipText:`Angefragt`}}]},{type:Q,props:{heading:`Fertig`,variant:`success`},children:[{type:$,props:{heading:`Laborprobe versendet`,text:`Nala · Blutbild groß`,chipVariant:`success`,chipText:`Erledigt`}},{type:$,props:{heading:`Bestellung Verbandsmaterial`,text:`Lieferung bestätigt für Montag`,chipVariant:`success`,chipText:`Erledigt`}}]}]}static{this.styles=[z.styles,o`
      /* Mehr Spalten als Platz: das Board scrollt IN SICH (Editor und
         Export identisch, Block-CSS = die eine Render-Quelle), statt die
         Maske horizontal zu sprengen. min-width:0 erlaubt dem Host, in
         Zeilen-Bereichen schmaler zu werden als seine Spaltensumme. */
      :host { min-width: 0; }
      .board {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: var(--se-gap-lg);
        overflow-x: auto;
      }
      slot { display: contents; }
    `]}render(){return E`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),it(this)}disconnectedCallback(){super.disconnectedCallback(),at(this)}};z.defineAndRegister(ot);var st=class extends z{constructor(...e){super(...e),this.text=`Neuer Text`}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Textblock`}static{this.category=`anzeige`}static{this.defaultProps={text:`Neuer Text`}}static{this.customProperties=[]}static{this.styles=[z.styles,o`
      span {
        display: block;
        min-width: 1ch;
        color: var(--se-ink);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        line-height: 1.45;
      }
    `]}render(){return E`<span
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};R([I()],st.prototype,`text`,void 0),z.defineAndRegister(st)})();