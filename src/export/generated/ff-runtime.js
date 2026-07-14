(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},h=(e,t)=>!l(e,t),oe={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:h};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=oe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oe}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??h)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};g.elementStyles=[],g.shadowRootOptions={mode:`open`},g[p(`elementProperties`)]=new Map,g[p(`finalized`)]=new Map,ae?.({ReactiveElement:g}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var se=globalThis,ce=e=>e,_=se.trustedTypes,le=_?_.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ue=`$lit$`,v=`lit$${Math.random().toFixed(9).slice(2)}$`,de=`?`+v,fe=`<${de}>`,y=document,b=()=>y.createComment(``),x=e=>e===null||typeof e!=`object`&&typeof e!=`function`,pe=Array.isArray,me=e=>pe(e)||typeof e?.[Symbol.iterator]==`function`,he=`[ 	
\f\r]`,S=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,_e=/>/g,C=RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ve=/'/g,ye=/"/g,be=/^(?:script|style|textarea|title)$/i,w=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),T=Symbol.for(`lit-noChange`),E=Symbol.for(`lit-nothing`),xe=new WeakMap,D=y.createTreeWalker(y,129);function Se(e,t){if(!pe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return le===void 0?t:le.createHTML(t)}var Ce=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=S;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===S?c[1]===`!--`?o=ge:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=C):(be.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=C):o=_e:o===C?c[0]===`>`?(o=i??S,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?C:c[3]===`"`?ye:ve):o===ye||o===ve?o=C:o===ge||o===_e?o=S:(o=C,i=void 0);let d=o===C&&e[t+1].startsWith(`/>`)?` `:``;a+=o===S?n+fe:l>=0?(r.push(s),n.slice(0,l)+ue+n.slice(l)+v+d):n+v+(l===-2?t:d)}return[Se(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},we=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ce(t,n);if(this.el=e.createElement(l,r),D.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=D.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ue)){let t=u[o++],n=i.getAttribute(e).split(v),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?De:r[1]===`?`?Oe:r[1]===`@`?ke:k}),i.removeAttribute(e)}else e.startsWith(v)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(be.test(i.tagName)){let e=i.textContent.split(v),t=e.length-1;if(t>0){i.textContent=_?_.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],b()),D.nextNode(),c.push({type:2,index:++a});i.append(e[t],b())}}}else if(i.nodeType===8)if(i.data===de)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(v,e+1))!==-1;)c.push({type:7,index:a}),e+=v.length-1}a++}}static createElement(e,t){let n=y.createElement(`template`);return n.innerHTML=e,n}};function O(e,t,n=e,r){if(t===T)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=x(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=O(e,i._$AS(e,t.values),i,r)),t}var Te=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??y).importNode(t,!0);D.currentNode=r;let i=D.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Ee(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ae(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=D.nextNode(),a++)}return D.currentNode=y,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Ee=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),x(e)?e===E||e==null||e===``?(this._$AH!==E&&this._$AR(),this._$AH=E):e!==this._$AH&&e!==T&&this._(e):e._$litType$===void 0?e.nodeType===void 0?me(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==E&&x(this._$AH)?this._$AA.nextSibling.data=e:this.T(y.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=we.createElement(Se(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Te(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=xe.get(e.strings);return t===void 0&&xe.set(e.strings,t=new we(e)),t}k(t){pe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(b()),this.O(b()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ce(e).nextSibling;ce(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=E,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=E}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=O(this,e,t,0),a=!x(e)||e!==this._$AH&&e!==T,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=O(this,r[n+o],t,o),s===T&&(s=this._$AH[o]),a||=!x(s)||s!==this._$AH[o],s===E?e=E:e!==E&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},De=class extends k{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===E?void 0:e}},Oe=class extends k{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==E)}},ke=class extends k{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=O(this,e,t,0)??E)===T)return;let n=this._$AH,r=e===E&&n!==E||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==E&&(n===E||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ae=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}},je=se.litHtmlPolyfillSupport;je?.(we,Ee),(se.litHtmlVersions??=[]).push(`3.3.3`);var Me=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Ee(t.insertBefore(b(),e),e,void 0,n??{})}return i._$AI(e),i},A=globalThis,j=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Me(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};j._$litElement$=!0,j.finalized=!0,A.litElementHydrateSupport?.({LitElement:j});var Ne=A.litElementPolyfillSupport;Ne?.({LitElement:j}),(A.litElementVersions??=[]).push(`4.2.2`);var Pe={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:h},Fe=(e=Pe,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function M(e){return(t,n)=>typeof n==`object`?Fe(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Ie(e){return M({...e,state:!0,attribute:!1})}var N=new Map;function Le(e){N.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),N.set(e.type,e)}function Re(){return Array.from(N.values())}var ze={width:`auto`};function P(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var F=class extends j{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Le({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...ze,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots,bindingRoute:e.bindingRoute,blockEvents:e.blockEvents})}};P([M({type:Boolean,reflect:!0,attribute:`data-editable`})],F.prototype,`editable`,void 0);var Be=[`info`,`success`,`warning`,`danger`];function I(e){return Be.includes(e)?e:`info`}function L(e,t){return{attributeName:e,name:`Farbe`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Ve=o`
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
`,He=class extends F{constructor(...e){super(...e),this.variant=`info`,this.text=`Hinweis`}static{this.blockType=`badge`}static{this.tagName=`ff-badge`}static{this.displayName=`Status-Chip`}static{this.category=`anzeige`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,text:`Hinweis`}}static{this.customProperties=[L(`variant`,`Bedeutung des Chips — bestimmt die Farbe.`)]}static{this.styles=[F.styles,Ve]}render(){return w`<span
      class="chip v-${I(this.variant)}"
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};P([M()],He.prototype,`variant`,void 0),P([M()],He.prototype,`text`,void 0),F.defineAndRegister(He);var Ue=[{key:`START_TOOL`,name:`Werkzeug starten (START_TOOL)`}];function We(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.type!=`string`||!Ue.some(e=>e.key===t.type)||typeof t.resultKey!=`string`||typeof t.toolNr!=`string`||!Array.isArray(t.toolParams)||t.toolParams.some(e=>typeof e!=`string`)?null:{type:t.type,resultKey:t.resultKey,toolNr:t.toolNr,toolParams:[...t.toolParams]}}function Ge(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!t||typeof t!=`object`||Array.isArray(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=We(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}var Ke=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function qe(e){return e.replace(/^IDB/,``)}function Je(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Ye(e){let t=/^(\d+)_(\d+)$/.exec(e);return t?{pos:t[1],len:t[2]}:null}function Xe(e,t){return e.params.map(e=>e.replace(/\{([A-Z_]+)\}/g,(e,n)=>String(t[n]??``)))}function Ze(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function Qe(){return globalThis}function $e(e,t){if(e.trim()===``)return;let n=Qe();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(Ze(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}var et=new WeakMap;function tt(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=Ge(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=et.get(e);if(i||(i=new Set,et.set(e,i)),!i.has(t)){i.add(t);try{let e={...n,NOW_DATE:Je(new Date)};for(let t of r)t.type===`START_TOOL`&&$e(t.toolNr,Xe({params:t.toolParams},e))}finally{i.delete(t)}}}var nt=new WeakSet;function rt(e,t){e.hasAttribute(`data-ff-editor`)||e.hasAttribute(`data-ff-aktionen`)&&(nt.has(e)||(nt.add(e),e.addEventListener(`click`,()=>{tt(e,t,{})})))}var it=class extends F{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.customProperties=[]}static{this.styles=[F.styles,o`
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
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),rt(this,`onClick`)}};P([M()],it.prototype,`label`,void 0),F.defineAndRegister(it);var R=class extends F{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=`Rückruf Fr. Wagner`,this.time=`09:15`,this.meta=`Katze · EKH`,this.text=`Befund Minka besprechen`,this.chipText=`Heute`,this.headingField=``,this.timeField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.defaultProps={chipVariant:`info`,heading:`Rückruf Fr. Wagner`,time:`09:15`,meta:`Katze · EKH`,text:`Befund Minka besprechen`,chipText:`Heute`,headingField:``,timeField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`heading`,label:`Titel`},{prop:`time`,label:`Zeit`},{prop:`meta`,label:`Meta-Zeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[L(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[F.styles,Ve,o`
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
    `]}render(){let e=I(this.chipVariant);return w`<div class="card">
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
    </div>`}};P([M()],R.prototype,`chipVariant`,void 0),P([M()],R.prototype,`heading`,void 0),P([M()],R.prototype,`time`,void 0),P([M()],R.prototype,`meta`,void 0),P([M()],R.prototype,`text`,void 0),P([M()],R.prototype,`chipText`,void 0),P([M()],R.prototype,`headingField`,void 0),P([M()],R.prototype,`timeField`,void 0),P([M()],R.prototype,`metaField`,void 0),P([M()],R.prototype,`textField`,void 0),P([M()],R.prototype,`chipTextField`,void 0),F.defineAndRegister(R);var z=class extends F{constructor(...e){super(...e),this.direction=`column`,this.gap=`md`,this.padding=`none`}static{this.blockType=`container`}static{this.tagName=`ff-container`}static{this.displayName=`Bereich`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.defaultProps={direction:`column`,gap:`md`,padding:`none`,width:`fill`}}static{this.customProperties=[]}static{this.styles=[F.styles,o`
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
    `]}render(){return w`<div class="wrap ${this.direction===`row`?`row`:`column`} gap-${[`sm`,`md`,`lg`].includes(this.gap)?this.gap:`md`} pad-${[`none`,`sm`,`md`,`lg`].includes(this.padding)?this.padding:`none`}"><slot></slot></div>`}};P([M()],z.prototype,`direction`,void 0),P([M()],z.prototype,`gap`,void 0),P([M()],z.prototype,`padding`,void 0),F.defineAndRegister(z);function at(e,t,n,r){return{attributeName:e,name:t,description:n,isArray:!1,maxLength:0,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var ot=[`text`,`number`,`email`,`password`,`textarea`,`select`,`checkbox`,`date`];function st(e){return ot.includes(e)?e:`text`}var B=class extends F{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Text eingeben`,this.required=`nein`,this.readonly=`nein`,this.options=`Untersuchung, Impfung, Operation`}static{this.blockType=`formfield`}static{this.tagName=`ff-formfield`}static{this.displayName=`Eingabefeld`}static{this.category=`eingabe`}static{this.defaultProps={fieldType:`text`,placeholder:`Text eingeben`,required:`nein`,readonly:`nein`,options:`Untersuchung, Impfung, Operation`,width:240}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Art des Eingabefeldes.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`email`,label:`E-Mail`},{value:`password`,label:`Passwort`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`checkbox`,label:`Checkbox`},{value:`date`,label:`Datum`}]},{attributeName:`placeholder`,name:`Platzhalter`,description:`Grauer Hinweistext im leeren Feld.`,isArray:!1,maxLength:120,kind:`text`},{attributeName:`options`,name:`Optionen`,description:`Nur bei "Auswahl": Einträge mit Komma getrennt.`,isArray:!1,maxLength:500,kind:`text`},at(`required`,`Pflichtfeld`,`Muss ausgefüllt werden.`),at(`readonly`,`Nur lesen`,`Wert wird angezeigt, aber nicht bearbeitbar.`)]}static{this.styles=[F.styles,o`
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
    `]}get optionList(){return this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``)}render(){let e=st(this.fieldType),t=this.required===`ja`,n=this.readonly===`ja`;switch(e){case`textarea`:return w`<textarea
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
        />`}}};P([M()],B.prototype,`fieldType`,void 0),P([M()],B.prototype,`placeholder`,void 0),P([M()],B.prototype,`required`,void 0),P([M()],B.prototype,`readonly`,void 0),P([M()],B.prototype,`options`,void 0),F.defineAndRegister(B);var V=class extends F{constructor(...e){super(...e),this.variant=`info`,this.heading=`Hinweis`,this.message=`Das ist ein Hinweistext.`}static{this.blockType=`infobox`}static{this.tagName=`ff-infobox`}static{this.displayName=`Infobox`}static{this.category=`anzeige`}static{this.defaultProps={variant:`info`,heading:`Hinweis`,message:`Das ist ein Hinweistext.`}}static{this.customProperties=[L(`variant`,`Bedeutung der Box — bestimmt die Farbe.`)]}static{this.styles=[F.styles,o`
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
    `]}render(){return w`<div class="box v-${I(this.variant)}">
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
    </div>`}};P([M()],V.prototype,`variant`,void 0),P([M()],V.prototype,`heading`,void 0),P([M()],V.prototype,`message`,void 0),F.defineAndRegister(V);var H=class extends F{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[R.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,statusValues:[],auffang:`nein`}}static{this.customProperties=[L(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),{attributeName:`statusValues`,name:`Werte dieser Spalte`,description:`Einträge, bei denen einer dieser Werte im Sortier-Feld steht, landen hier; beim Ablegen einer Karte wird der erste Wert zurückgeschrieben. Ohne eigene Werte zählt der Spaltentitel.`,isArray:!0,maxLength:60,kind:`text`,requiresDataSource:!0,hiddenInInspector:!0},at(`auffang`,`Auffangspalte`,`Einträge, die in keine Spalte passen, landen hier. Ohne Auffangspalte zeigt die Maske sie in einer eigenen Spalte "Nicht zugeordnet". Höchstens eine Spalte je Board.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0,hiddenInInspector:!0})]}static{this.styles=[F.styles,o`
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
      /* B2: die Laufzeit-Spalte "Nicht zugeordnet" (seRuntime setzt das
         Attribut data-ff-nicht-zugeordnet) ist bewusst NEUTRAL grau — sie
         traegt keine Bedeutung aus dem Status-Vokabular, sondern ist der
         sichtbare Reparaturweg fuer Zeilen ohne Treffer. Nur vorhandene
         Grund-Tokens, keine neue Farbwelt; schlaegt die v-Klasse
         (drei einfache Selektoren gegen zwei). */
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return w`<div class="col v-${I(this.variant)}">
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
    </div>`}};P([M()],H.prototype,`variant`,void 0),P([M()],H.prototype,`heading`,void 0),P([Ie()],H.prototype,`_count`,void 0),F.defineAndRegister(H);function U(e){return typeof e==`object`&&!!e}function ct(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!U(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function lt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!U(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Ke.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}function W(e){return e==null?``:String(e).trim()}function G(e,t){if(!U(e)||t===``)return``;let n=t.trim(),r=W(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=W(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=W(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function ut(e,t,n){if(!U(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function K(e){if(!U(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function q(e,t){return W(e).toLowerCase()===t.trim().toLowerCase()}function dt(e,t,n){if(!U(e)||!U(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(U(e)&&(q(e.ALIAS,t)||q(e.alias,t))){let t=K(e);if(t.length>0)return t}}else if(U(i))for(let e of Object.keys(i)){let n=i[e];if(q(e,t)||U(n)&&(q(n.ALIAS,t)||q(n.alias,t))){let e=K(n);if(e.length>0)return e}}let a=r.Tabellen;if(U(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=K(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(q(e,t)){let t=K(a[e]);if(t.length>0)return t}}return[]}function ft(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!U(t)||!U(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function pt(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!U(t)||!U(t.MSG)))return t.MSG.DATA}function mt(e){if(typeof e!=`string`||e===``)return[];try{let t=JSON.parse(e);return Array.isArray(t)?t.filter(e=>typeof e==`string`):[]}catch{return[]}}function ht(e,t){let n=mt(e).filter(e=>e.trim()!==``);if(n.length>0)return n;let r=(t??``).trim();return r===``?[]:[r]}function gt(e,t){let n=e.trim().toLowerCase();if(n!==``){for(let e=0;e<t.length;e++)if(t[e].some(e=>e.trim().toLowerCase()===n))return e}return-1}function _t(e){return e.findIndex(e=>(e??``).trim()===`ja`)}function J(){return globalThis}function vt(){let e=J();return U(e.SEDATA)&&U(e.SEDATA.Daten)}function yt(){let e=J();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function bt(){let e=J();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var xt=new Set,St=new WeakMap,Ct=!1,wt=H.tagName,Tt=R.tagName,Y=`data-ff-nicht-zugeordnet`,Et=`Nicht zugeordnet`;function Dt(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===wt&&!e.hasAttribute(Y))}function Ot(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Tt)}function kt(e){return Re().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function At(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``||n===``)return;let r=ct(J().FF_DATA_SOURCES,t);if(!r)return;let i=Dt(e);if(i.length===0)return;let a=St.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(Tt);t&&(a=t.cloneNode(!0),St.set(e,a))}if(!a)return;let o=dt(J().SEDATA,r.name,r.tableId),s=i.map(e=>ht(e.getAttribute(`statusvalues`),e.getAttribute(`heading`))),c=_t(i.map(e=>e.getAttribute(`auffang`))),l=kt(a.tagName);e.querySelectorAll(`[${Y}]`).forEach(e=>e.remove());for(let e of i)Ot(e).forEach(e=>e.remove());let u=null,d=()=>(u||(u=document.createElement(wt),u.setAttribute(`heading`,Et),u.setAttribute(Y,``),u.setAttribute(`style`,i[0].getAttribute(`style`)??`flex-grow:1;flex-basis:0;min-width:0`),e.appendChild(u)),u);for(let e of o){let t=a.cloneNode(!0),o=gt(G(e,n),s);(o>=0?i[o]:c>=0?i[c]:d()).appendChild(t);for(let n of l){let r=t.getAttribute(`${n.prop.toLowerCase()}field`)??``;r!==``&&(t[n.prop]=G(e,r))}let u=G(e,r.indexField);u!==``&&(X.set(t,{row:e,pindex:u}),t.draggable=!0)}}var X=new WeakMap,Z=null,jt=new WeakSet;function Mt(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===wt&&e.contains(n))return n;return null}function Nt(e){let t=J(),n=lt(t.FF_RELATIONS,e.getAttribute(`putrelation`)??``),r=ct(t.FF_DATA_SOURCES,e.getAttribute(`source`)??``);if(!(!n||!r))return{template:n,relId:qe(r.tableId)}}function Pt(e,t,n,r){let i=J();if(typeof i.basisHTML_SND_MSG!=`function`)return;let a=Ye(t);a&&i.basisHTML_SND_MSG(e.template.verb,{NR:e.template.nr,PARAMS:Xe(e.template,{FELD_POS:a.pos,FELD_LEN:a.len,PINDEX:n,DROP_PINDEX:n,RELID:e.relId,VALUE:r,NOW_DATE:Je(new Date)})})}function Ft(e,t){if(!Z||Z.board!==e)return;let n=X.get(Z.card);if(!n)return;let r=e.getAttribute(`statusfield`)??``,i=ht(t.getAttribute(`statusvalues`),t.getAttribute(`heading`)),a=i[0]??``;if(r===``||a.trim()===``)return;let o=G(n.row,r).trim().toLowerCase();if(i.some(e=>e.trim().toLowerCase()===o))return;let s=Nt(e);s&&(Pt(s,r,n.pindex,a),ut(n.row,r,a),At(e),tt(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:a}))}function It(e){jt.has(e)||(jt.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&X.has(e))??null;n&&tt(e,`onCardClick`,{PINDEX:X.get(n)?.pindex??``})}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&X.has(e))??null;n&&(Z={card:n,board:e},t.dataTransfer?.setData(`text/plain`,X.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{Z=null}),e.addEventListener(`dragover`,t=>{let n=Mt(e,t);Z?.board===e&&n&&!n.hasAttribute(Y)&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=Mt(e,t);!n||n.hasAttribute(Y)||(t.preventDefault(),Ft(e,n),Z=null)}))}function Q(){vt()&&xt.forEach(At)}var Lt=!1;function Rt(e){if(!Lt){Lt=!0;try{let t=typeof e==`string`?e:JSON.stringify(e),n=document.createElement(`textarea`);n.id=`ff-se-diagnose`,n.readOnly=!0,n.value=t??``,n.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(n)}catch{}}}function zt(e){let t=ft(e);if(!t)return;let n=J();U(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,Rt(e),bt(),Q()}function Bt(e=0){let t=J();if(typeof t.basisHTML_REGISTER==`function`){try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{zt(e)},document.title,`1.0`)}catch{}return}e<400&&setTimeout(()=>{Bt(e+1)},25)}function Vt(){if(Ct)return;Ct=!0,yt();let e=J();e.Erstellen=()=>{bt(),Q()},e.initData=e.Erstellen,e.ReloadData=()=>Q(),Bt(),window.addEventListener(`message`,e=>{if(typeof J().basisHTML_REGISTER==`function`)return;let t=pt(e.data);t!==void 0&&zt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,vt()?(clearInterval(n),bt(),Q()):t>100&&clearInterval(n)},300)}function Ht(e){e.hasAttribute(`data-ff-editor`)||(xt.add(e),It(e),Vt(),vt()&&At(e))}function Ut(e){xt.delete(e)}var $=H.blockType,Wt=class extends F{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[$]}static{this.childDirection=`row`}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:$}}static{this.templateChild={type:R.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`auto`,source:``,statusField:``,putRelation:`standard-put`}}static{this.bindingRoute={fieldProp:`statusField`,column:{type:$,titleProp:`heading`,valuesProp:`statusValues`,catchProp:`auffang`}}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Das Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt (z. B. Behandlungszimmer).`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0},{attributeName:`putRelation`,name:`Beim Verschieben zurückschreiben über`,description:`Relation-Vorlage, über die eine verschobene Karte den Wert ihrer neuen Spalte ins Sortier-Feld zurückschreibt.`,isArray:!1,maxLength:0,kind:`relation`,requiresDataSource:!0}]}static{this.defaultChildren=[{type:$,props:{heading:`Offen`,variant:`warning`},children:[{type:R.blockType}]},{type:$,props:{heading:`In Arbeit`,variant:`info`}},{type:$,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[F.styles,o`
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
    `]}render(){return w`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Ht(this)}disconnectedCallback(){super.disconnectedCallback(),Ut(this)}};F.defineAndRegister(Wt);var Gt=class extends F{constructor(...e){super(...e),this.text=`Neuer Text`}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Textblock`}static{this.category=`anzeige`}static{this.defaultProps={text:`Neuer Text`}}static{this.customProperties=[]}static{this.styles=[F.styles,o`
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
    >${this.text}</span>`}};P([M()],Gt.prototype,`text`,void 0),F.defineAndRegister(Gt)})();