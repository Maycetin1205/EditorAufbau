(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},h=(e,t)=>!l(e,t),oe={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:h};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=oe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oe}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??h)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};g.elementStyles=[],g.shadowRootOptions={mode:`open`},g[p(`elementProperties`)]=new Map,g[p(`finalized`)]=new Map,ae?.({ReactiveElement:g}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var se=globalThis,ce=e=>e,_=se.trustedTypes,le=_?_.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ue=`$lit$`,v=`lit$${Math.random().toFixed(9).slice(2)}$`,de=`?`+v,fe=`<${de}>`,y=document,b=()=>y.createComment(``),x=e=>e===null||typeof e!=`object`&&typeof e!=`function`,pe=Array.isArray,me=e=>pe(e)||typeof e?.[Symbol.iterator]==`function`,S=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,he=/-->/g,ge=/>/g,w=RegExp(`>|${S}(?:([^\\s"'>=/]+)(${S}*=${S}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),_e=/'/g,ve=/"/g,ye=/^(?:script|style|textarea|title)$/i,T=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),E=Symbol.for(`lit-noChange`),D=Symbol.for(`lit-nothing`),be=new WeakMap,O=y.createTreeWalker(y,129);function xe(e,t){if(!pe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return le===void 0?t:le.createHTML(t)}var Se=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=C;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===C?c[1]===`!--`?o=he:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=w):(ye.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=w):o=ge:o===w?c[0]===`>`?(o=i??C,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?w:c[3]===`"`?ve:_e):o===ve||o===_e?o=w:o===he||o===ge?o=C:(o=w,i=void 0);let d=o===w&&e[t+1].startsWith(`/>`)?` `:``;a+=o===C?n+fe:l>=0?(r.push(s),n.slice(0,l)+ue+n.slice(l)+v+d):n+v+(l===-2?t:d)}return[xe(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},k=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Se(t,n);if(this.el=e.createElement(l,r),O.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=O.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ue)){let t=u[o++],n=i.getAttribute(e).split(v),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?we:r[1]===`?`?Te:r[1]===`@`?Ee:M}),i.removeAttribute(e)}else e.startsWith(v)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ye.test(i.tagName)){let e=i.textContent.split(v),t=e.length-1;if(t>0){i.textContent=_?_.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],b()),O.nextNode(),c.push({type:2,index:++a});i.append(e[t],b())}}}else if(i.nodeType===8)if(i.data===de)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(v,e+1))!==-1;)c.push({type:7,index:a}),e+=v.length-1}a++}}static createElement(e,t){let n=y.createElement(`template`);return n.innerHTML=e,n}};function A(e,t,n=e,r){if(t===E)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=x(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=A(e,i._$AS(e,t.values),i,r)),t}var Ce=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??y).importNode(t,!0);O.currentNode=r;let i=O.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new j(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new De(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=O.nextNode(),a++)}return O.currentNode=y,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},j=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=D,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),x(e)?e===D||e==null||e===``?(this._$AH!==D&&this._$AR(),this._$AH=D):e!==this._$AH&&e!==E&&this._(e):e._$litType$===void 0?e.nodeType===void 0?me(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==D&&x(this._$AH)?this._$AA.nextSibling.data=e:this.T(y.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=k.createElement(xe(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Ce(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=be.get(e.strings);return t===void 0&&be.set(e.strings,t=new k(e)),t}k(t){pe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(b()),this.O(b()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ce(e).nextSibling;ce(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=D,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=D}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=A(this,e,t,0),a=!x(e)||e!==this._$AH&&e!==E,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=A(this,r[n+o],t,o),s===E&&(s=this._$AH[o]),a||=!x(s)||s!==this._$AH[o],s===D?e=D:e!==D&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===D?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},we=class extends M{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===D?void 0:e}},Te=class extends M{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==D)}},Ee=class extends M{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??D)===E)return;let n=this._$AH,r=e===D&&n!==D||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==D&&(n===D||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},De=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}},Oe=se.litHtmlPolyfillSupport;Oe?.(k,j),(se.litHtmlVersions??=[]).push(`3.3.3`);var ke=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new j(t.insertBefore(b(),e),e,void 0,n??{})}return i._$AI(e),i},N=globalThis,P=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ke(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};P._$litElement$=!0,P.finalized=!0,N.litElementHydrateSupport?.({LitElement:P});var Ae=N.litElementPolyfillSupport;Ae?.({LitElement:P}),(N.litElementVersions??=[]).push(`4.2.2`);var je={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:h},Me=(e=je,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function F(e){return(t,n)=>typeof n==`object`?Me(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Ne(e){return F({...e,state:!0,attribute:!1})}var Pe=new Map;function Fe(e){Pe.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Pe.set(e.type,e)}function Ie(){return Array.from(Pe.values())}var Le={width:`auto`};function I(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var L=class extends P{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Fe({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Le,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots,bindingRoute:e.bindingRoute,blockEvents:e.blockEvents})}};I([F({type:Boolean,reflect:!0,attribute:`data-editable`})],L.prototype,`editable`,void 0);var Re=[{key:`START_TOOL`,name:`Werkzeug starten (START_TOOL)`}];function ze(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.type!=`string`||!Re.some(e=>e.key===t.type)||typeof t.resultKey!=`string`||typeof t.toolNr!=`string`||!Array.isArray(t.toolParams)||t.toolParams.some(e=>typeof e!=`string`)?null:{type:t.type,resultKey:t.resultKey,toolNr:t.toolNr,toolParams:[...t.toolParams]}}function Be(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!t||typeof t!=`object`||Array.isArray(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=ze(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}var Ve=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function He(e){return e.replace(/^IDB/,``)}function Ue(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function We(e){let t=/^(\d+)_(\d+)$/.exec(e);return t?{pos:t[1],len:t[2]}:null}function Ge(e,t){return e.params.map(e=>e.replace(/\{([A-Z_]+)\}/g,(e,n)=>String(t[n]??``)))}function Ke(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function qe(){return globalThis}function Je(e,t){if(e.trim()===``)return;let n=qe();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(Ke(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}var Ye=new WeakMap;function R(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=Be(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=Ye.get(e);if(i||(i=new Set,Ye.set(e,i)),!i.has(t)){i.add(t);try{let e={...n,NOW_DATE:Ue(new Date)};for(let t of r)t.type===`START_TOOL`&&Je(t.toolNr,Ge({params:t.toolParams},e))}finally{i.delete(t)}}}var Xe=new WeakSet;function Ze(e,t){e.hasAttribute(`data-ff-editor`)||e.hasAttribute(`data-ff-aktionen`)&&(Xe.has(e)||(Xe.add(e),e.addEventListener(`click`,()=>{R(e,t,{})})))}var Qe=class extends L{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.customProperties=[]}static{this.styles=[L.styles,o`
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
    `]}render(){return T`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),Ze(this,`onClick`)}};I([F()],Qe.prototype,`label`,void 0),L.defineAndRegister(Qe);var $e=[`info`,`success`,`warning`,`danger`];function et(e){return $e.includes(e)?e:`info`}function tt(e,t){return{attributeName:e,name:`Farbe`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var nt=o`
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
`,z=class extends L{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=`Rückruf Fr. Wagner`,this.time=`09:15`,this.meta=`Katze · EKH`,this.text=`Befund Minka besprechen`,this.chipText=`Heute`,this.headingField=``,this.timeField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.defaultProps={chipVariant:`info`,heading:`Rückruf Fr. Wagner`,time:`09:15`,meta:`Katze · EKH`,text:`Befund Minka besprechen`,chipText:`Heute`,headingField:``,timeField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`heading`,label:`Titel`},{prop:`time`,label:`Zeit`},{prop:`meta`,label:`Meta-Zeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[tt(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[L.styles,nt,o`
      .card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 5px;
        background: var(--se-card-bg);
        border: 1px solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 8px 10px 9px;
        font-family: var(--se-font);
      }
      .row {
        display: flex;
        align-items: baseline;
        gap: 7px;
        min-width: 0;
      }
      .heading {
        color: var(--se-ink);
        font-size: var(--se-fs-lg);
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .time {
        margin-left: auto;
        flex: none;
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
      }
      .meta {
        margin: -3px 0 0;
        color: var(--se-faint);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .text {
        margin: 0;
        color: var(--se-muted);
        font-size: var(--se-fs);
        line-height: 1.35;
      }
      .card .chip {
        align-self: flex-start;
      }
    `]}render(){let e=et(this.chipVariant);return T`<div class="card">
      <div class="row">
        <span
          class="heading"
          data-ff-editable
          data-ff-spot="heading"
          ?data-ff-bound=${this.headingField!==``}
          @dblclick=${e=>this.inlineEdit(e,`heading`)}
        >${this.heading}</span>
        <span
          class="time"
          data-ff-editable
          data-ff-spot="time"
          ?data-ff-bound=${this.timeField!==``}
          @dblclick=${e=>this.inlineEdit(e,`time`)}
        >${this.time}</span>
      </div>
      <p
        class="meta"
        data-ff-editable
        data-ff-spot="meta"
        ?data-ff-bound=${this.metaField!==``}
        @dblclick=${e=>this.inlineEdit(e,`meta`)}
      >${this.meta}</p>
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
    </div>`}};I([F()],z.prototype,`chipVariant`,void 0),I([F()],z.prototype,`heading`,void 0),I([F()],z.prototype,`time`,void 0),I([F()],z.prototype,`meta`,void 0),I([F()],z.prototype,`text`,void 0),I([F()],z.prototype,`chipText`,void 0),I([F()],z.prototype,`headingField`,void 0),I([F()],z.prototype,`timeField`,void 0),I([F()],z.prototype,`metaField`,void 0),I([F()],z.prototype,`textField`,void 0),I([F()],z.prototype,`chipTextField`,void 0),L.defineAndRegister(z);var rt=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`];function it(e){return rt.includes(e)?e:`text`}var at=[`text`,`number`,`textarea`,`select`],B=class extends L{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this._belegt=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,isArray:!1,maxLength:0,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}}]}static{this.styles=[L.styles,o`
      .feld { font-family: var(--se-font); }
      /* Anker fuer den im Feld sitzenden Platzhalter. */
      .huelle { position: relative; }
      /* .ctrl exakt nach Referenz-Optik: Rahmen, Panel-Flaeche, kantiger
         Radius; Fokus = Hausfarbe als Rahmen + 1px-Ring (kein weicher
         Schatten — Flaechen leben von Rahmen). */
      .ctrl {
        box-sizing: border-box;
        width: 100%;
        padding: 7px 10px;
        border: 1px solid var(--se-line);
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
      select.ctrl { padding: 6px 8px; }
      /* Der Platzhalter sitzt IM Feld (an der Textposition des .ctrl:
         1px Rahmen + 7px/10px Innenabstand), faengt keine Klicks der
         Maske ab und verschwindet, sobald das Feld Inhalt hat. */
      .ph {
        position: absolute;
        top: 8px;
        left: 11px;
        right: 11px;
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
        top: 7px;
        left: 9px;
        right: 25px;
      }
      /* Ankreuzfeld: Kaestchen + Beschriftung in EINER Zeile (Referenz
         .impf-chk) — bewusst ohne <label for>-Kopplung, sonst kollidiert
         der Beschriftungs-Klick mit dem Inline-Edit. */
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
      :host([data-ff-editor]) .ph:empty::before { content: 'Text …'; opacity: 0.6; }
    `]}onInput(e){let t=e.target;this._belegt=t.value!==``}textTpl(e){return T`<span
      class=${e}
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}controlTpl(e){switch(e){case`textarea`:return T`<textarea class="ctrl" @input=${this.onInput}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``);return T`<select class="ctrl" @change=${this.onInput}>
          <option value="" disabled selected hidden></option>
          ${e.length===0?T`<option disabled>(keine Optionen)</option>`:e.map(e=>T`<option value=${e}>${e}</option>`)}
        </select>`}default:return T`<input class="ctrl" type=${e} @input=${this.onInput} />`}}render(){let e=it(this.fieldType);return e===`checkbox`?T`<div class="feld">
        <div class="zeile">
          <input class="ctrl" type="checkbox" />
          ${this.textTpl(`text`)}
        </div>
      </div>`:T`<div class="feld">
      <div class="huelle">
        ${this.controlTpl(e)}
        ${at.includes(e)?T`<span
              class=${e===`select`?`ph ph-select`:`ph`}
              ?hidden=${this._belegt}
              data-ff-editable
              @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
            >${this.placeholder}</span>`:D}
      </div>
    </div>`}};I([F()],B.prototype,`fieldType`,void 0),I([F()],B.prototype,`placeholder`,void 0),I([F()],B.prototype,`options`,void 0),I([Ne()],B.prototype,`_belegt`,void 0),L.defineAndRegister(B);function ot(e,t,n,r){return{attributeName:e,name:t,description:n,isArray:!1,maxLength:0,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var V=class extends L{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[z.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[tt(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),ot(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte zeigt die Maske sie sichtbar in „Nicht zugeordnet“.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[L.styles,o`
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return T`<div class="col v-${et(this.variant)}">
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
    </div>`}};I([F()],V.prototype,`variant`,void 0),I([F()],V.prototype,`heading`,void 0),I([Ne()],V.prototype,`_count`,void 0),L.defineAndRegister(V);function H(e){return typeof e==`object`&&!!e}function U(){return globalThis}function st(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!H(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function W(e){return e==null?``:String(e).trim()}function G(e,t){if(!H(e)||t===``)return``;let n=t.trim(),r=W(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=W(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=W(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function ct(e,t,n){if(!H(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function K(e){if(!H(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function q(e,t){return W(e).toLowerCase()===t.trim().toLowerCase()}function lt(e,t,n){if(!H(e)||!H(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(H(e)&&(q(e.ALIAS,t)||q(e.alias,t))){let t=K(e);if(t.length>0)return t}}else if(H(i))for(let e of Object.keys(i)){let n=i[e];if(q(e,t)||H(n)&&(q(n.ALIAS,t)||q(n.alias,t))){let e=K(n);if(e.length>0)return e}}let a=r.Tabellen;if(H(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=K(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(q(e,t)){let t=K(a[e]);if(t.length>0)return t}}return[]}function ut(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!H(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Ve.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}function dt(e,t,n,r){let i=U();if(typeof i.basisHTML_SND_MSG!=`function`)return;let a=We(t);a&&i.basisHTML_SND_MSG(e.template.verb,{NR:e.template.nr,PARAMS:Ge(e.template,{FELD_POS:a.pos,FELD_LEN:a.len,PINDEX:n,DROP_PINDEX:n,RELID:e.relId,VALUE:r,NOW_DATE:Ue(new Date)})})}function J(){let e=U();return H(e.SEDATA)&&H(e.SEDATA.Daten)}function ft(){let e=U();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function pt(){let e=U();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}function mt(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!H(t)||!H(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function ht(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!H(t)||!H(t.MSG)))return t.MSG.DATA}var gt=!1;function _t(e){if(!gt){gt=!0;try{let t=typeof e==`string`?e:JSON.stringify(e),n=document.createElement(`textarea`);n.id=`ff-se-diagnose`,n.readOnly=!0,n.value=t??``,n.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(n)}catch{}}}var vt=new Set;function yt(e){return vt.add(e),()=>{vt.delete(e)}}function Y(){for(let e of[...vt])e()}function bt(e){let t=mt(e);if(!t)return;let n=U();H(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,_t(e),pt(),Y()}function xt(e=0){let t=U();if(typeof t.basisHTML_REGISTER==`function`){try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{bt(e)},document.title,`1.0`)}catch{}return}e<400&&setTimeout(()=>{xt(e+1)},25)}var St=!1;function Ct(){if(St)return;St=!0,ft();let e=U();e.Erstellen=()=>{pt(),Y()},e.initData=e.Erstellen,e.ReloadData=()=>Y(),xt(),window.addEventListener(`message`,e=>{if(typeof U().basisHTML_REGISTER==`function`)return;let t=ht(e.data);t!==void 0&&bt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,J()?(clearInterval(n),pt(),Y()):t>100&&clearInterval(n)},300)}function wt(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function Tt(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var Et=new Set,Dt=new WeakMap,Ot=V.tagName,kt=z.tagName,X=`data-ff-nicht-zugeordnet`,At=`Nicht zugeordnet`;function jt(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Ot&&!e.hasAttribute(X))}function Mt(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===kt)}function Nt(e){return Ie().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function Pt(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``||n===``)return;let r=st(U().FF_DATA_SOURCES,t);if(!r)return;let i=jt(e);if(i.length===0)return;let a=Dt.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(kt);t&&(a=t.cloneNode(!0),Dt.set(e,a))}if(!a)return;let o=lt(U().SEDATA,r.name,r.tableId),s=i.map(e=>e.getAttribute(`heading`)??``),c=Nt(a.tagName),l=Tt(i.map(e=>e.getAttribute(`auffang`)));e.querySelectorAll(`[`+X+`]`).forEach(e=>e.remove());let u=null,d=()=>(u||(u=document.createElement(Ot),u.setAttribute(`heading`,At),u.setAttribute(X,``),u.setAttribute(`style`,i[0].getAttribute(`style`)??`flex-grow:1;flex-basis:0;min-width:0`),e.appendChild(u)),u);for(let e of i)Mt(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=wt(G(e,n),s);(o>=0?i[o]:l>=0?i[l]:d()).appendChild(t);for(let n of c){let r=t.getAttribute(`${n.prop.toLowerCase()}field`)??``;r!==``&&(t[n.prop]=G(e,r))}let u=G(e,r.indexField);u!==``&&(Z.set(t,{row:e,pindex:u}),t.draggable=!0)}}var Z=new WeakMap,Q=null,Ft=new WeakSet;function It(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===Ot&&e.contains(n))return n;return null}function Lt(e){let t=U(),n=ut(t.FF_RELATIONS,e.getAttribute(`putrelation`)??``),r=st(t.FF_DATA_SOURCES,e.getAttribute(`source`)??``);if(!(!n||!r))return{template:n,relId:He(r.tableId)}}function Rt(e,t){if(!Q||Q.board!==e)return;let n=Z.get(Q.card);if(!n)return;let r=e.getAttribute(`statusfield`)??``,i=t.getAttribute(`heading`)??``;if(r===``||i.trim()===``||G(n.row,r).trim().toLowerCase()===i.trim().toLowerCase())return;let a=Lt(e);a&&(dt(a,r,n.pindex,i),ct(n.row,r,i),Pt(e),R(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:i}))}function zt(e){Ft.has(e)||(Ft.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&R(e,`onCardClick`,{PINDEX:Z.get(n)?.pindex??``})}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&(Q={card:n,board:e},t.dataTransfer?.setData(`text/plain`,Z.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{Q=null}),e.addEventListener(`dragover`,t=>{let n=It(e,t);Q?.board===e&&n&&!n.hasAttribute(X)&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=It(e,t);!n||n.hasAttribute(X)||(t.preventDefault(),Rt(e,n),Q=null)}))}function Bt(){J()&&Et.forEach(Pt)}var Vt=!1;function Ht(e){e.hasAttribute(`data-ff-editor`)||(Et.add(e),zt(e),Vt||(Vt=!0,yt(Bt)),Ct(),J()&&Pt(e))}function Ut(e){Et.delete(e)}var $=V.blockType,Wt=class extends L{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[$]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:$}}static{this.templateChild={type:z.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``,putRelation:`standard-put`}}static{this.bindingRoute={fieldProp:`statusField`}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Das Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt (z. B. Behandlungszimmer).`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0},{attributeName:`putRelation`,name:`Beim Verschieben zurückschreiben über`,description:`Relation-Vorlage, über die eine verschobene Karte den Titel ihrer neuen Spalte ins Sortier-Feld zurückschreibt.`,isArray:!1,maxLength:0,kind:`relation`,requiresDataSource:!0,hiddenInInspector:!0}]}static{this.defaultChildren=[{type:$,props:{heading:`Offen`,variant:`warning`},children:[{type:z.blockType}]},{type:$,props:{heading:`In Arbeit`,variant:`info`}},{type:$,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[L.styles,o`
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
    `]}render(){return T`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Ht(this)}disconnectedCallback(){super.disconnectedCallback(),Ut(this)}};L.defineAndRegister(Wt);var Gt=class extends L{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.customProperties=[]}static{this.styles=[L.styles,o`
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
    `]}render(){return T`<div class="zeile"><slot></slot></div>`}};L.defineAndRegister(Gt)})();