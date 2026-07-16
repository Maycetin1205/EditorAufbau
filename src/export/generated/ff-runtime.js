(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,oe={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},se=(e,t)=>!l(e,t),ce={attribute:!0,type:String,converter:oe,reflect:!1,useDefault:!1,hasChanged:se};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var m=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ce){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ce}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?oe:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?oe:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??se)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};m.elementStyles=[],m.shadowRootOptions={mode:`open`},m[p(`elementProperties`)]=new Map,m[p(`finalized`)]=new Map,ae?.({ReactiveElement:m}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var le=globalThis,ue=e=>e,h=le.trustedTypes,de=h?h.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,fe=`$lit$`,g=`lit$${Math.random().toFixed(9).slice(2)}$`,pe=`?`+g,me=`<${pe}>`,_=document,v=()=>_.createComment(``),y=e=>e===null||typeof e!=`object`&&typeof e!=`function`,he=Array.isArray,ge=e=>he(e)||typeof e?.[Symbol.iterator]==`function`,_e=`[ 	
\f\r]`,b=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ve=/-->/g,ye=/>/g,x=RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),be=/'/g,xe=/"/g,Se=/^(?:script|style|textarea|title)$/i,Ce=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),S=Ce(1),C=Ce(2),w=Symbol.for(`lit-noChange`),T=Symbol.for(`lit-nothing`),we=new WeakMap,E=_.createTreeWalker(_,129);function Te(e,t){if(!he(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return de===void 0?t:de.createHTML(t)}var Ee=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=b;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===b?c[1]===`!--`?o=ve:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=x):(Se.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=x):o=ye:o===x?c[0]===`>`?(o=i??b,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?x:c[3]===`"`?xe:be):o===xe||o===be?o=x:o===ve||o===ye?o=b:(o=x,i=void 0);let d=o===x&&e[t+1].startsWith(`/>`)?` `:``;a+=o===b?n+me:l>=0?(r.push(s),n.slice(0,l)+fe+n.slice(l)+g+d):n+g+(l===-2?t:d)}return[Te(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},De=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ee(t,n);if(this.el=e.createElement(l,r),E.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=E.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(fe)){let t=u[o++],n=i.getAttribute(e).split(g),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?je:r[1]===`?`?Me:r[1]===`@`?Ne:Ae}),i.removeAttribute(e)}else e.startsWith(g)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(Se.test(i.tagName)){let e=i.textContent.split(g),t=e.length-1;if(t>0){i.textContent=h?h.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],v()),E.nextNode(),c.push({type:2,index:++a});i.append(e[t],v())}}}else if(i.nodeType===8)if(i.data===pe)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(g,e+1))!==-1;)c.push({type:7,index:a}),e+=g.length-1}a++}}static createElement(e,t){let n=_.createElement(`template`);return n.innerHTML=e,n}};function D(e,t,n=e,r){if(t===w)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=y(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=D(e,i._$AS(e,t.values),i,r)),t}var Oe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??_).importNode(t,!0);E.currentNode=r;let i=E.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new ke(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Pe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=E.nextNode(),a++)}return E.currentNode=_,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},ke=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=D(this,e,t),y(e)?e===T||e==null||e===``?(this._$AH!==T&&this._$AR(),this._$AH=T):e!==this._$AH&&e!==w&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ge(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==T&&y(this._$AH)?this._$AA.nextSibling.data=e:this.T(_.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=De.createElement(Te(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Oe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=we.get(e.strings);return t===void 0&&we.set(e.strings,t=new De(e)),t}k(t){he(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(v()),this.O(v()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ue(e).nextSibling;ue(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ae=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=T,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=T}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=D(this,e,t,0),a=!y(e)||e!==this._$AH&&e!==w,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=D(this,r[n+o],t,o),s===w&&(s=this._$AH[o]),a||=!y(s)||s!==this._$AH[o],s===T?e=T:e!==T&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},je=class extends Ae{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===T?void 0:e}},Me=class extends Ae{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==T)}},Ne=class extends Ae{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=D(this,e,t,0)??T)===w)return;let n=this._$AH,r=e===T&&n!==T||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==T&&(n===T||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){D(this,e)}},Fe=le.litHtmlPolyfillSupport;Fe?.(De,ke),(le.litHtmlVersions??=[]).push(`3.3.3`);var Ie=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new ke(t.insertBefore(v(),e),e,void 0,n??{})}return i._$AI(e),i},Le=globalThis,O=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ie(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};O._$litElement$=!0,O.finalized=!0,Le.litElementHydrateSupport?.({LitElement:O});var Re=Le.litElementPolyfillSupport;Re?.({LitElement:O}),(Le.litElementVersions??=[]).push(`4.2.2`);var ze={attribute:!0,type:String,converter:oe,reflect:!1,hasChanged:se},Be=(e=ze,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function k(e){return(t,n)=>typeof n==`object`?Be(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Ve(e){return k({...e,state:!0,attribute:!1})}var He=new Map;function Ue(e){He.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),He.set(e.type,e)}function We(){return Array.from(He.values())}var Ge={width:`auto`};function A(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var j=class extends O{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ue({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ge,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots,bindingRoute:e.bindingRoute,blockEvents:e.blockEvents,pageBlock:e.pageBlock})}};A([k({type:Boolean,reflect:!0,attribute:`data-editable`})],j.prototype,`editable`,void 0);var Ke=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function qe(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Je(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}var Ye=[{key:`fixed`,name:`Fester Wert`},{key:`context`,name:`Ereigniswert`},{key:`data_field`,name:`Feld der Datenquelle`},{key:`previous_result`,name:`Vorheriger Schritt`},{key:`se_variable`,name:`SE VAR-Array`}];function M(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function Xe(e){return!M(e)||typeof e.source!=`string`||!Ye.some(t=>t.key===e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{}}}function Ze(e){if(!M(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!M(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=Xe(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=Xe(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function Qe(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!M(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=Ze(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}var $e=`root`;function et(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var N=class extends j{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[$e]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[j.styles,o`
      /* Geschlossen = restlos unsichtbar (Export-Zustand bis P-B öffnet).
         Der Editor-Seitenreiter erzwingt die Sicht über data-ff-editor. */
      :host { display: none; }
      :host([offen]),
      :host([data-ff-editor]) {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 10;
        font-family: var(--se-font);
      }
      /* Klick auf die Abdunklung tut NICHTS (Nutzer-Entscheidung) —
         deshalb bewusst kein Handler. */
      .abdunklung {
        position: absolute;
        inset: 0;
        background: var(--se-scrim);
      }
      .buehne {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
      }
      .fenster {
        position: relative;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        max-width: calc(100% - 24px);
        max-height: calc(100% - 24px);
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-lg);
        overflow: hidden;
      }
      .kopf {
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 6px 6px 12px;
        background: var(--se-panel-2);
        border-bottom: 1px solid var(--se-line-soft);
      }
      .titel {
        font-weight: 600;
        font-size: var(--se-fs);
        color: var(--se-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .x {
        margin-left: auto;
        flex: none;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border: none;
        border-radius: var(--se-r-sm);
        background: none;
        color: var(--se-muted);
        font-size: 15px;
        line-height: 1;
        cursor: pointer;
      }
      .x:hover {
        background: var(--se-line-soft);
        color: var(--se-ink);
      }
      /* Der Rumpf fließt wie die Hauptseite: Spalte, linksbündig. */
      .rumpf {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .rumpf slot { display: contents; }
    `]}onClose(){this.hasAttribute(`data-ff-editor`)||this.removeAttribute(`offen`)}render(){return S`<div class="abdunklung"></div>
      <div class="buehne">
        <div class="fenster" style="width:${et(this.breite,520)}px;height:${et(this.hoehe,380)}px">
          <div class="kopf">
            <span
              class="titel"
              data-ff-editable
              @dblclick=${e=>this.inlineEdit(e,`name`)}
            >${this.name}</span>
            <button class="x" type="button" aria-label="Schließen" title="Schließen" @click=${this.onClose}>✕</button>
          </div>
          <div class="rumpf"><slot></slot></div>
        </div>
      </div>`}};A([k()],N.prototype,`name`,void 0),A([k()],N.prototype,`breite`,void 0),A([k()],N.prototype,`hoehe`,void 0),j.defineAndRegister(N);function P(e){return typeof e==`object`&&!!e}function tt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!P(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function F(e){return e==null?``:String(e).trim()}function I(e,t){if(!P(e)||t===``)return``;let n=t.trim(),r=F(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=F(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=F(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function nt(e,t,n){if(!P(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function L(e){if(!P(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function R(e,t){return F(e).toLowerCase()===t.trim().toLowerCase()}function rt(e,t,n){if(!P(e)||!P(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(P(e)&&(R(e.ALIAS,t)||R(e.alias,t))){let t=L(e);if(t.length>0)return t}}else if(P(i))for(let e of Object.keys(i)){let n=i[e];if(R(e,t)||P(n)&&(R(n.ALIAS,t)||R(n.alias,t))){let e=L(n);if(e.length>0)return e}}let a=r.Tabellen;if(P(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=L(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(R(e,t)){let t=L(a[e]);if(t.length>0)return t}}return[]}function it(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!P(t)||!P(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function at(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!P(t)||!P(t.MSG)))return t.MSG.DATA}function z(){return globalThis}function B(){let e=z();return P(e.SEDATA)&&P(e.SEDATA.Daten)}function ot(){let e=z();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function st(){let e=z();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var ct=new Set,lt=new Set;function ut(e){ct.add(e)}function dt(e){return lt.add(e),()=>{lt.delete(e)}}function V(){ct.forEach(e=>e())}function ft(e){lt.forEach(t=>{try{t(e)}catch{}})}var H=new Map,U=``,pt=0;function mt(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function ht(){let e=mt();e&&(e.value=Array.from(H,([e,t])=>`${e}: ${t}`).join(`
`)+(U===``?``:`\n\nERSTES PAKET\n${U}`))}function W(e,t){H.set(e,t),ht()}function gt(){let e=z();H.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),H.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),H.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),H.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),H.set(`Empfangene Pakete`,String(pt)),H.set(`SEDATA.Daten`,B()?`vorhanden`:`fehlt`),ht()}function _t(e){if(U===``)try{U=typeof e==`string`?e:JSON.stringify(e)??``,ht()}catch{}}function vt(e){pt+=1,_t(e),W(`Empfangene Pakete`,String(pt));let t=it(e);if(!t){W(`Letztes Paket`,`Antwort ohne Daten`),ft(e);return}let n=z();P(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,W(`Letztes Paket`,`Daten-Push angenommen`),W(`SEDATA.Daten`,`vorhanden`),st(),V()}function yt(e=0){let t=z();if(typeof t.basisHTML_REGISTER==`function`){gt();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{vt(e)},document.title,`1.0`),W(`Registrierung`,`ausgeführt`)}catch(e){W(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&W(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{yt(e+1)},25)):(gt(),W(`Registrierung`,`nach 10s kein Interface`))}var bt=!1;function xt(){if(bt)return;bt=!0,W(`Runtime`,`gestartet`),W(`Registrierung`,`noch nicht ausgeführt`),gt(),ot();let e=z();e.Erstellen=()=>{st(),V()},e.initData=e.Erstellen,e.ReloadData=()=>{V()},yt(),window.addEventListener(`message`,e=>{if(typeof z().basisHTML_REGISTER==`function`)return;let t=at(e.data);t!==void 0&&vt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){gt();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,B()?(clearInterval(n),W(`SEDATA.Daten`,`vorhanden`),st(),V()):t>100&&(clearInterval(n),W(`Daten-Wartezeit`,`nach 30s ohne Daten`))},300)}function St(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!P(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Ke.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var Ct=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function wt(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function Tt(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function Et(e,t){if(t>12)return;let n=Tt(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=Et(n,t+1);if(e!==void 0)return e}return}if(P(e)){for(let n of Ct){if(!(n in e))continue;let r=Et(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=Et(n,t+1);if(e!==void 0)return e}}}function Dt(e){let t=wt(e);if(P(t)){for(let e of Ct){if(!(e in t))continue;let n=Et(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=Dt(t);if(e!==void 0)return e}else if(P(e)){let t=Dt(e);if(t!==void 0)return t}}}function Ot(e){return P(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function kt(e,t){if(!P(e))return;let n=Ot(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=Dt(e[t]);if(n!==void 0)return n}}var At=[],jt=!1,Mt=6e3,Nt=100;function Pt(){if(jt||At.length===0)return;jt=!0;let e=At.shift(),t=z(),n=new Set(Ot(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),jt=!1,e.resolve(t),Pt())},a=dt(e=>{let t=Dt(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=kt(z().SEDATA,n);e!==void 0&&i(e)},Nt),s=setTimeout(()=>{i(``)},Mt);if(typeof t.basisHTML_SND_MSG!=`function`){i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch{i(``)}}function Ft(e,t){xt();let n=z();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG==`function`)try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch{}return Promise.resolve(``)}return new Promise(n=>{At.push({template:e,params:[...t],resolve:n}),Pt()})}function It(e,t,n=z()){if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(!P(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!P(t)||!P(t.Daten)||!P(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=tt(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r||r.indexField===``)return``;let i=t.context.PINDEX??``;if(i===``)return``;let a=rt(n.SEDATA,r.name,r.tableId).find(e=>I(e,r.indexField)===i);return a?I(a,e.value):``}function Lt(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function Rt(e,t){if(e.trim()===``)return;let n=z();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(Lt(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function zt(e,t,n){if(t.trim()!==``)for(let r of Array.from(e.querySelectorAll(N.tagName)))(r.getAttribute(`name`)??``)===t&&(n?r.setAttribute(`offen`,``):r.removeAttribute(`offen`))}var Bt=new WeakMap;async function Vt(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=Qe(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=Bt.get(e);if(i||(i=new Set,Bt.set(e,i)),!i.has(t)){i.add(t);try{let t={...n,NOW_DATE:qe(new Date)},i=``;for(let n of r){if(n.type===`START_TOOL`){Rt(n.toolNr,Je({params:n.toolParams},t));continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){zt(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`);continue}let r=St(z().FF_RELATIONS,n.relationId);if(!r)continue;let a={context:t,previousResult:i};i=await Ft(r,[...n.params,...n.extraParams].map(e=>It(e,a))),n.resultKey!==``&&(t[n.resultKey]=i)}}finally{i.delete(t)}}}var Ht=new WeakSet;function Ut(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||Ht.has(e))return;Ht.add(e);let n=Qe(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&xt(),e.addEventListener(`click`,()=>{Vt(e,t,{})})}var Wt=class extends j{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
    `]}render(){return S`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),Ut(this,`onClick`)}};A([k()],Wt.prototype,`label`,void 0),j.defineAndRegister(Wt);var Gt=[`info`,`success`,`warning`,`danger`];function Kt(e){return Gt.includes(e)?e:`info`}function qt(e,t){return{attributeName:e,name:`Farbe`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Jt=o`
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
`,Yt={dog:C`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,cat:C`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,rabbit:C`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,hamster:C`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,bird:C`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,reptile:C`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,paw:C`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`},Xt=[[`welpe`,`dog`],[`hund`,`dog`],[`kater`,`cat`],[`katze`,`cat`],[`kaninchen`,`rabbit`],[`hase`,`rabbit`],[`meerschweinchen`,`hamster`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`bird`],[`sittich`,`bird`],[`papagei`,`bird`],[`vogel`,`bird`],[`schildkr`,`reptile`],[`echse`,`reptile`],[`schlange`,`reptile`],[`gecko`,`reptile`],[`reptil`,`reptile`]];function Zt(e){let t=e.toLowerCase(),n=`paw`;for(let[e,r]of Xt)if(t.includes(e)){n=r;break}return S`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${Yt[n]}</svg>`}var G=class extends j{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[qt(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[j.styles,Jt,o`
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
    `]}stelle(e,t){return S`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}render(){let e=Kt(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.heading)||n(this.heading2),i=n(this.time)||n(this.date);return S`<div class="card">
      ${n(this.avatar)||r||n(this.meta)||i?S`<div class="main">
            ${n(this.avatar)?S`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?T:Zt(this.avatar)}</span>`:T}
            <div class="titles">
              ${r?S`<div class="trow">
                    ${n(this.heading)?this.stelle(`heading`,`heading`):T}
                    ${n(this.heading2)?this.stelle(`heading2`,`heading2`):T}
                  </div>`:T}
              ${n(this.meta)?this.stelle(`meta`,`meta`):T}
            </div>
            ${i?S`<div class="when">
                  ${n(this.date)?this.stelle(`date`,`date`):T}
                  ${n(this.time)?this.stelle(`time`,`time`):T}
                </div>`:T}
          </div>`:T}
      ${n(this.text)?this.stelle(`text`,`text`):T}
      ${n(this.chipText)?S`<span
            class="chip v-${e}"
            data-ff-editable
            data-ff-spot="chipText"
            ?data-ff-bound=${this.chipTextField!==``}
            @dblclick=${e=>this.inlineEdit(e,`chipText`)}
          >${this.chipText}</span>`:T}
    </div>`}};A([k()],G.prototype,`chipVariant`,void 0),A([k()],G.prototype,`heading`,void 0),A([k()],G.prototype,`heading2`,void 0),A([k()],G.prototype,`time`,void 0),A([k()],G.prototype,`date`,void 0),A([k()],G.prototype,`avatar`,void 0),A([k()],G.prototype,`meta`,void 0),A([k()],G.prototype,`text`,void 0),A([k()],G.prototype,`chipText`,void 0),A([k()],G.prototype,`headingField`,void 0),A([k()],G.prototype,`heading2Field`,void 0),A([k()],G.prototype,`timeField`,void 0),A([k()],G.prototype,`dateField`,void 0),A([k()],G.prototype,`avatarField`,void 0),A([k()],G.prototype,`metaField`,void 0),A([k()],G.prototype,`textField`,void 0),A([k()],G.prototype,`chipTextField`,void 0),j.defineAndRegister(G);var Qt=new Set,K=new WeakMap,$t=new WeakSet;function en(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function tn(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function nn(e){return typeof e.value==`string`?e.value:``}function rn(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`valuefield`)??``;if(t===``||n===``){K.delete(e);return}let r=tt(z().FF_DATA_SOURCES,t);if(!r){K.delete(e);return}let i=rt(z().SEDATA,r.name,r.tableId)[0];if(i===void 0){K.delete(e),e.value=``;return}let a=r.indexField===``?``:I(i,r.indexField);K.set(e,{row:i,code:n,pindex:a}),e.value=I(i,n)}function an(e){let t=K.get(e);return t&&nt(t.row,t.code,nn(e)),t}function on(e){$t.has(e)||($t.add(e),e.addEventListener(`input`,()=>{an(e)}),e.addEventListener(`change`,()=>{let t=an(e);Vt(e,`onChange`,{VALUE:nn(e),PINDEX:t?.pindex??``})}))}function sn(){B()&&Qt.forEach(rn)}var cn=!1;function ln(e){e.hasAttribute(`data-ff-editor`)||(Qt.add(e),on(e),cn||(cn=!0,ut(sn)),xt(),B()&&rn(e))}function un(e){Qt.delete(e)}var dn=[`date`,`time`,`datetime`];function fn(e){return dn.includes(e)?e:`date`}function pn(e){return`${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`}function mn(e,t){let n=fn(e);if(n===`time`)return pn(t);let r=qe(t);return n===`datetime`?`${r} ${pn(t)}`:r}var q=class extends j{constructor(...e){super(...e),this.zeigt=`date`,this.source=``,this.value=``,this.valueField=``}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.bindingRoute={fieldProp:`valueField`}}static{this.bindableSpots=[{prop:`value`,label:`Wert`}]}static{this.defaultProps={zeigt:`date`,source:``,value:``,valueField:``}}static{this.customProperties=[{attributeName:`zeigt`,name:`Zeigt`,description:`Welche Zeitangabe ohne Datenbindung angezeigt wird.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`date`,label:`Datum`},{value:`time`,label:`Zeit`},{value:`datetime`,label:`Datum + Zeit`}]},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt wird.`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0}]}static{this.styles=[j.styles,o`
      .datum {
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
      }
    `]}render(){let e=this.valueField===``?mn(this.zeigt,new Date):this.value;return S`<span
      class="datum"
      data-ff-spot="value"
      ?data-ff-bound=${this.valueField!==``}
    >${e}</span>`}connectedCallback(){super.connectedCallback(),ln(this)}disconnectedCallback(){super.disconnectedCallback(),un(this)}};A([k()],q.prototype,`zeigt`,void 0),A([k()],q.prototype,`source`,void 0),A([k()],q.prototype,`value`,void 0),A([k()],q.prototype,`valueField`,void 0),j.defineAndRegister(q);var hn=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`];function gn(e){return hn.includes(e)?e:`text`}var _n=[`text`,`number`,`textarea`,`select`],J=class extends j{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource=!0}static{this.bindingRoute={fieldProp:`valueField`}}static{this.bindableSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,isArray:!1,maxLength:0,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0}]}static{this.styles=[j.styles,o`
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
      :host([data-ff-editor]) .huelle[data-ff-bound] .ctrl {
        border-style: dotted;
        border-color: var(--se-accent);
      }
      /* N1: der "Text …"-Griff gilt für JEDEN geleerten Inline-Edit-Text —
         auch die Ankreuzfeld-Beschriftung bleibt im Editor anfassbar. */
      :host([data-ff-editor]) [data-ff-editable]:empty::before { content: 'Text …'; opacity: 0.6; }
      /* N1: in der MASKE schaltet die Beschriftung den Haken (Windows-
         Gewohnheit) — klickbar zeigen, Textauswahl beim Klicken vermeiden. */
      :host(:not([data-ff-editor])) .zeile .text { cursor: pointer; user-select: none; }
    `]}onInput(e){let t=e.target;this.value=gn(this.fieldType)===`date`?tn(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return S`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){if(this.hasAttribute(`data-ff-editor`))return;let e=this.renderRoot.querySelector(`input[type="checkbox"]`);e&&(e.checked=!e.checked)}controlTpl(e){switch(e){case`textarea`:return S`<textarea class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``),t=this.value!==``&&!e.includes(this.value);return S`<select class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}>
          <option value="" disabled hidden></option>
          ${t?S`<option value=${this.value} hidden>${this.value}</option>`:T}
          ${e.length===0?S`<option disabled>(keine Optionen)</option>`:e.map(e=>S`<option value=${e}>${e}</option>`)}
        </select>`}default:return S`<input
          class="ctrl"
          type=${e}
          .value=${e===`date`?en(this.value):this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`}}render(){let e=gn(this.fieldType);return e===`checkbox`?S`<div class="feld">
        <div class="zeile">
          <input class="ctrl" type="checkbox" />
          ${this.textTpl(`text`)}
        </div>
      </div>`:S`<div class="feld">
      <div
        class="huelle"
        data-ff-spot="value"
        ?data-ff-bound=${this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${_n.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this.value!==``):T}
      </div>
    </div>`}connectedCallback(){super.connectedCallback(),ln(this)}disconnectedCallback(){super.disconnectedCallback(),un(this)}};A([k()],J.prototype,`fieldType`,void 0),A([k()],J.prototype,`placeholder`,void 0),A([k()],J.prototype,`options`,void 0),A([k()],J.prototype,`source`,void 0),A([k()],J.prototype,`value`,void 0),A([k()],J.prototype,`valueField`,void 0),j.defineAndRegister(J);function vn(e,t,n,r){return{attributeName:e,name:t,description:n,isArray:!1,maxLength:0,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var Y=class extends j{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[G.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[qt(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),vn(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte zeigt die Maske sie sichtbar in „Nicht zugeordnet“.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[j.styles,o`
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return S`<div class="col v-${Kt(this.variant)}">
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
    </div>`}};A([k()],Y.prototype,`variant`,void 0),A([k()],Y.prototype,`heading`,void 0),A([Ve()],Y.prototype,`_count`,void 0),j.defineAndRegister(Y);function yn(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function bn(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var xn=new Set,Sn=new WeakMap,Cn=Y.tagName,wn=G.tagName,X=`data-ff-nicht-zugeordnet`,Tn=`Nicht zugeordnet`;function En(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Cn&&!e.hasAttribute(X))}function Dn(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===wn)}function On(e){return We().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function kn(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=tt(z().FF_DATA_SOURCES,t);if(!r)return;let i=En(e);if(i.length===0)return;let a=Sn.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(wn);t&&(a=t.cloneNode(!0),Sn.set(e,a))}if(!a)return;let o=rt(z().SEDATA,r.name,r.tableId),s=i.map(e=>e.getAttribute(`heading`)??``),c=On(a.tagName),l=bn(i.map(e=>e.getAttribute(`auffang`)));e.querySelectorAll(`[`+X+`]`).forEach(e=>e.remove());let u=null,d=()=>(u||(u=document.createElement(Cn),u.setAttribute(`heading`,Tn),u.setAttribute(X,``),u.setAttribute(`style`,i[0].getAttribute(`style`)??`flex-grow:1;flex-basis:0;min-width:0`),e.appendChild(u)),u);for(let e of i)Dn(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:yn(I(e,n),s);(o>=0?i[o]:l>=0?i[l]:d()).appendChild(t);for(let n of c){let r=t.getAttribute(`${n.prop.toLowerCase()}field`)??``;r!==``&&(t[n.prop]=I(e,r))}let u=r.indexField===``?``:I(e,r.indexField);Z.set(t,{row:e,pindex:u}),t.draggable=!0}}var Z=new WeakMap,Q=null,An=new WeakSet;function jn(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===Cn&&e.contains(n))return n;return null}function Mn(e,t){if(!Q||Q.board!==e)return;let n=Z.get(Q.card);if(!n)return;let r=t.getAttribute(`heading`)??``;Vt(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r})}function Nn(e){An.has(e)||(An.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&Vt(e,`onCardClick`,{PINDEX:Z.get(n)?.pindex??``})}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&(Q={card:n,board:e},t.dataTransfer?.setData(`text/plain`,Z.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{Q=null}),e.addEventListener(`dragover`,t=>{let n=jn(e,t);Q?.board===e&&n&&!n.hasAttribute(X)&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=jn(e,t);!n||n.hasAttribute(X)||(t.preventDefault(),Mn(e,n),Q=null)}))}function Pn(){B()&&xn.forEach(kn)}var Fn=!1;function In(e){e.hasAttribute(`data-ff-editor`)||(xn.add(e),Nn(e),Fn||(Fn=!0,ut(Pn)),xt(),B()&&kn(e))}function Ln(e){xn.delete(e)}var $=Y.blockType,Rn=class extends j{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[$]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:$}}static{this.templateChild={type:G.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``}}static{this.bindingRoute={fieldProp:`statusField`}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0}]}static{this.defaultChildren=[{type:$,props:{heading:`Offen`,variant:`warning`},children:[{type:G.blockType}]},{type:$,props:{heading:`In Arbeit`,variant:`info`}},{type:$,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[j.styles,o`
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
    `]}render(){return S`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),In(this)}disconnectedCallback(){super.disconnectedCallback(),Ln(this)}};j.defineAndRegister(Rn);var zn=class extends j{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
    `]}render(){return S`<div class="zeile"><slot></slot></div>`}};j.defineAndRegister(zn)})();