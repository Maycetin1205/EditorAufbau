(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,re=globalThis,ie=re.trustedTypes,ae=ie?ie.emptyScript:``,oe=re.reactiveElementPolyfillSupport,f=(e,t)=>e,se={toAttribute(e,t){switch(t){case Boolean:e=e?ae:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ce=(e,t)=>!l(e,t),le={attribute:!0,type:String,converter:se,reflect:!1,useDefault:!1,hasChanged:ce};Symbol.metadata??=Symbol(`metadata`),re.litPropertyMetadata??=new WeakMap;var p=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=le){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??le}static _$Ei(){if(this.hasOwnProperty(f(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?se:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?se:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ce)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};p.elementStyles=[],p.shadowRootOptions={mode:`open`},p[f(`elementProperties`)]=new Map,p[f(`finalized`)]=new Map,oe?.({ReactiveElement:p}),(re.reactiveElementVersions??=[]).push(`2.1.2`);var ue=globalThis,de=e=>e,m=ue.trustedTypes,fe=m?m.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,pe=`$lit$`,h=`lit$${Math.random().toFixed(9).slice(2)}$`,me=`?`+h,he=`<${me}>`,g=document,_=()=>g.createComment(``),v=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ge=Array.isArray,_e=e=>ge(e)||typeof e?.[Symbol.iterator]==`function`,ve=`[ 	
\f\r]`,y=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ye=/-->/g,be=/>/g,b=RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),xe=/'/g,Se=/"/g,Ce=/^(?:script|style|textarea|title)$/i,we=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),x=we(1),S=we(2),C=Symbol.for(`lit-noChange`),w=Symbol.for(`lit-nothing`),Te=new WeakMap,T=g.createTreeWalker(g,129);function Ee(e,t){if(!ge(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return fe===void 0?t:fe.createHTML(t)}var De=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=y;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===y?c[1]===`!--`?o=ye:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=b):(Ce.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=b):o=be:o===b?c[0]===`>`?(o=i??y,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?b:c[3]===`"`?Se:xe):o===Se||o===xe?o=b:o===ye||o===be?o=y:(o=b,i=void 0);let d=o===b&&e[t+1].startsWith(`/>`)?` `:``;a+=o===y?n+he:l>=0?(r.push(s),n.slice(0,l)+pe+n.slice(l)+h+d):n+h+(l===-2?t:d)}return[Ee(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Oe=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=De(t,n);if(this.el=e.createElement(l,r),T.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=T.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(pe)){let t=u[o++],n=i.getAttribute(e).split(h),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?je:r[1]===`?`?Me:r[1]===`@`?Ne:D}),i.removeAttribute(e)}else e.startsWith(h)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(Ce.test(i.tagName)){let e=i.textContent.split(h),t=e.length-1;if(t>0){i.textContent=m?m.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],_()),T.nextNode(),c.push({type:2,index:++a});i.append(e[t],_())}}}else if(i.nodeType===8)if(i.data===me)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(h,e+1))!==-1;)c.push({type:7,index:a}),e+=h.length-1}a++}}static createElement(e,t){let n=g.createElement(`template`);return n.innerHTML=e,n}};function E(e,t,n=e,r){if(t===C)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=v(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=E(e,i._$AS(e,t.values),i,r)),t}var ke=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??g).importNode(t,!0);T.currentNode=r;let i=T.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Ae(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Pe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=T.nextNode(),a++)}return T.currentNode=g,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Ae=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),v(e)?e===w||e==null||e===``?(this._$AH!==w&&this._$AR(),this._$AH=w):e!==this._$AH&&e!==C&&this._(e):e._$litType$===void 0?e.nodeType===void 0?_e(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==w&&v(this._$AH)?this._$AA.nextSibling.data=e:this.T(g.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Oe.createElement(Ee(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new ke(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Te.get(e.strings);return t===void 0&&Te.set(e.strings,t=new Oe(e)),t}k(t){ge(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(_()),this.O(_()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=de(e).nextSibling;de(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},D=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=w,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=w}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=E(this,e,t,0),a=!v(e)||e!==this._$AH&&e!==C,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=E(this,r[n+o],t,o),s===C&&(s=this._$AH[o]),a||=!v(s)||s!==this._$AH[o],s===w?e=w:e!==w&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},je=class extends D{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===w?void 0:e}},Me=class extends D{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==w)}},Ne=class extends D{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??w)===C)return;let n=this._$AH,r=e===w&&n!==w||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==w&&(n===w||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}},Fe=ue.litHtmlPolyfillSupport;Fe?.(Oe,Ae),(ue.litHtmlVersions??=[]).push(`3.3.3`);var Ie=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Ae(t.insertBefore(_(),e),e,void 0,n??{})}return i._$AI(e),i},Le=globalThis,O=class extends p{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ie(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};O._$litElement$=!0,O.finalized=!0,Le.litElementHydrateSupport?.({LitElement:O});var Re=Le.litElementPolyfillSupport;Re?.({LitElement:O}),(Le.litElementVersions??=[]).push(`4.2.2`);var ze={attribute:!0,type:String,converter:se,reflect:!1,hasChanged:ce},Be=(e=ze,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function k(e){return(t,n)=>typeof n==`object`?Be(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Ve(e){return k({...e,state:!0,attribute:!1})}var He=new Map;function Ue(e){He.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),He.set(e.type,e)}function We(){return Array.from(He.values())}var Ge={width:`auto`};function A(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var j=class extends O{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ue({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ge,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots,bindingRoute:e.bindingRoute,blockEvents:e.blockEvents,pageBlock:e.pageBlock})}};A([k({type:Boolean,reflect:!0,attribute:`data-editable`})],j.prototype,`editable`,void 0);var Ke=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function qe(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Je(e){let t=/^(\d+)_(\d+)$/.exec(e);return t?{pos:t[1],len:t[2]}:null}function Ye(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}var Xe=[{key:`fixed`,name:`Fester Wert`},{key:`context`,name:`Ereigniswert`},{key:`data_field`,name:`Feld der Datenquelle`},{key:`previous_result`,name:`Vorheriger Schritt`},{key:`step_result`,name:`Ergebnis von Schritt`},{key:`se_variable`,name:`SE VAR-Array`}];function M(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function Ze(e){return!M(e)||typeof e.source!=`string`||!Xe.some(t=>t.key===e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{}}}function Qe(e){if(!M(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`QUELLE_SPEICHERN`){if(typeof e.dataSourceId!=`string`||typeof e.relationId!=`string`)return null;let t=Ze(e.pindex);return t?{type:`QUELLE_SPEICHERN`,resultKey:e.resultKey,dataSourceId:e.dataSourceId,relationId:e.relationId,pindex:t}:null}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!M(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=Ze(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=Ze(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function $e(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!M(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=Qe(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}var et=`root`;function tt(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var N=class extends j{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[et]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[j.styles,o`
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
      /* Flex statt Grid (Fix 2026-07-16): bei Grid wächst die auto-Spur mit
         dem Fenster, und max-width: calc(100% - 24px) rechnet gegen die
         GEWACHSENE Spur — auf zu kleiner Fläche ragte das Fenster hinaus
         und wirkte zugleich um genau 24px verkleinert (Editor vs. Export).
         Im Flex-Container rechnet die Grenze gegen die echte Fläche. */
      .buehne {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fenster {
        position: relative;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        max-width: calc(100% - ${24}px);
        max-height: calc(100% - ${24}px);
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
    `]}onClose(){this.hasAttribute(`data-ff-editor`)||this.removeAttribute(`offen`)}render(){return x`<div class="abdunklung"></div>
      <div class="buehne">
        <div class="fenster" style="width:${tt(this.breite,520)}px;height:${tt(this.hoehe,380)}px">
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
      </div>`}};A([k()],N.prototype,`name`,void 0),A([k()],N.prototype,`breite`,void 0),A([k()],N.prototype,`hoehe`,void 0),j.defineAndRegister(N);function P(e){return typeof e==`object`&&!!e}function nt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!P(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function rt(e){return e==null?``:String(e).trim()}function F(e,t){if(!P(e)||t===``)return``;let n=t.trim(),r=rt(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=rt(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=rt(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}var it=new WeakMap;function at(e){return P(e)?[...it.get(e)??[]]:[]}function ot(e,t,n){if(!P(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}if(i){let t=it.get(e);t||(t=new Set,it.set(e,t)),t.add(r)}return i}function I(e){if(!P(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function L(e,t){return rt(e).toLowerCase()===t.trim().toLowerCase()}function R(e,t,n){if(!P(e)||!P(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(P(e)&&(L(e.ALIAS,t)||L(e.alias,t))){let t=I(e);if(t.length>0)return t}}else if(P(i))for(let e of Object.keys(i)){let n=i[e];if(L(e,t)||P(n)&&(L(n.ALIAS,t)||L(n.alias,t))){let e=I(n);if(e.length>0)return e}}let a=r.Tabellen;if(P(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=I(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(L(e,t)){let t=I(a[e]);if(t.length>0)return t}}return[]}function st(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!P(t)||!P(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function ct(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!P(t)||!P(t.MSG)))return t.MSG.DATA}function z(){return globalThis}function B(){let e=z();return P(e.SEDATA)&&P(e.SEDATA.Daten)}function lt(){let e=z();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function ut(){let e=z();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var dt=new Set,ft=new Set;function pt(e){dt.add(e)}function mt(e){return ft.add(e),()=>{ft.delete(e)}}function V(){dt.forEach(e=>e())}function ht(e){ft.forEach(t=>{try{t(e)}catch{}})}var H=new Map,U=``,gt=0;function _t(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function vt(){let e=_t();e&&(e.value=Array.from(H,([e,t])=>`${e}: ${t}`).join(`
`)+(U===``?``:`\n\nERSTES PAKET\n${U}`))}function W(e,t){H.set(e,t),vt()}function yt(){let e=z();H.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),H.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),H.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),H.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),H.set(`Empfangene Pakete`,String(gt)),H.set(`SEDATA.Daten`,B()?`vorhanden`:`fehlt`),vt()}function bt(e){if(U===``)try{U=typeof e==`string`?e:JSON.stringify(e)??``,vt()}catch{}}function xt(e){gt+=1,bt(e),W(`Empfangene Pakete`,String(gt));let t=st(e);if(!t){W(`Letztes Paket`,`Antwort ohne Daten`),ht(e);return}let n=z();P(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,W(`Letztes Paket`,`Daten-Push angenommen`),W(`SEDATA.Daten`,`vorhanden`),ut(),V()}function St(e=0){let t=z();if(typeof t.basisHTML_REGISTER==`function`){yt();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{xt(e)},document.title,`1.0`),W(`Registrierung`,`ausgeführt`)}catch(e){W(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&W(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{St(e+1)},25)):(yt(),W(`Registrierung`,`nach 10s kein Interface`))}var Ct=!1;function wt(){if(Ct)return;Ct=!0,W(`Runtime`,`gestartet`),W(`Registrierung`,`noch nicht ausgeführt`),yt(),lt();let e=z();e.Erstellen=()=>{ut(),V()},e.initData=e.Erstellen,e.ReloadData=()=>{V()},St(),window.addEventListener(`message`,e=>{if(typeof z().basisHTML_REGISTER==`function`)return;let t=ct(e.data);t!==void 0&&xt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){yt();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,B()?(clearInterval(n),W(`SEDATA.Daten`,`vorhanden`),ut(),V()):t>100&&(clearInterval(n),W(`Daten-Wartezeit`,`nach 30s ohne Daten`))},300)}function Tt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!P(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Ke.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}function Et(e){return e.replace(/^IDB/,``)}function Dt(e,t,n,r,i){let a=z();if(typeof a.basisHTML_SND_MSG!=`function`)return;let o=Je(n);o&&a.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:Ye(e,{FELD_POS:o.pos,FELD_LEN:o.len,PINDEX:r,DROP_PINDEX:r,RELID:t,VALUE:i,NOW_DATE:qe(new Date)})})}var Ot=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function kt(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function At(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function jt(e,t){if(t>12)return;let n=At(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=jt(n,t+1);if(e!==void 0)return e}return}if(P(e)){for(let n of Ot){if(!(n in e))continue;let r=jt(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=jt(n,t+1);if(e!==void 0)return e}}}function Mt(e){let t=kt(e);if(P(t)){for(let e of Ot){if(!(e in t))continue;let n=jt(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=Mt(t);if(e!==void 0)return e}else if(P(e)){let t=Mt(e);if(t!==void 0)return t}}}function Nt(e){return P(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function Pt(e,t){if(!P(e))return;let n=Nt(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=Mt(e[t]);if(n!==void 0)return n}}var Ft=[],It=!1,Lt=6e3,Rt=100;function zt(){if(It||Ft.length===0)return;It=!0;let e=Ft.shift(),t=z(),n=new Set(Nt(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),It=!1,e.resolve(t),zt())},a=mt(e=>{let t=Mt(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=Pt(z().SEDATA,n);e!==void 0&&i(e)},Rt),s=setTimeout(()=>{i(``)},Lt);if(typeof t.basisHTML_SND_MSG!=`function`){i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch{i(``)}}function Bt(e,t){wt();let n=z();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG==`function`)try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch{}return Promise.resolve(``)}return new Promise(n=>{Ft.push({template:e,params:[...t],resolve:n}),zt()})}function Vt(e,t,n=z()){if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);return Number.isInteger(n)&&n>=0?t.stepResults?.[n]??``:``}if(!P(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!P(t)||!P(t.Daten)||!P(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=nt(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=R(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>F(e,r.indexField)===a):i[0];return o?F(o,e.value):``}function Ht(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function Ut(e,t){if(e.trim()===``)return;let n=z();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(Ht(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function Wt(e,t,n){if(t.trim()!==``)for(let r of Array.from(e.querySelectorAll(N.tagName)))(r.getAttribute(`name`)??``)===t&&(n?r.setAttribute(`offen`,``):r.removeAttribute(`offen`))}function Gt(e,t){let n=z(),r=Tt(n.FF_RELATIONS,e.relationId),i=nt(n.FF_DATA_SOURCES,e.dataSourceId);if(!r||!i)return;let a=Vt(e.pindex,t),o=R(n.SEDATA,i.name,i.tableId)[0];for(let e of at(o))Dt(r,Et(i.tableId),e,a,F(o,e))}var Kt=new WeakMap;async function qt(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=$e(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=Kt.get(e);if(i||(i=new Set,Kt.set(e,i)),!i.has(t)){i.add(t);try{let t={...n,NOW_DATE:qe(new Date)},i=``,a=[];for(let n of r){if(n.type===`START_TOOL`){Ut(n.toolNr,Ye({params:n.toolParams},t)),a.push(``);continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){Wt(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),a.push(``);continue}if(n.type===`QUELLE_SPEICHERN`){Gt(n,{context:t,previousResult:i,stepResults:a}),a.push(``);continue}let r=Tt(z().FF_RELATIONS,n.relationId);if(!r){a.push(``);continue}let o={context:t,previousResult:i,stepResults:a},s=await Bt(r,[...n.params,...n.extraParams].map(e=>Vt(e,o)));a.push(s),r.verb===`GET_RELATION`&&(i=s),n.resultKey!==``&&(t[n.resultKey]=s)}}finally{i.delete(t)}}}var Jt=new WeakSet;function Yt(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||Jt.has(e))return;Jt.add(e);let n=$e(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&wt(),e.addEventListener(`click`,()=>{qt(e,t,{})})}var Xt=class extends j{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
    `]}render(){return x`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),Yt(this,`onClick`)}};A([k()],Xt.prototype,`label`,void 0),j.defineAndRegister(Xt);var Zt=[`info`,`success`,`warning`,`danger`];function Qt(e){return Zt.includes(e)?e:`info`}function $t(e,t){return{attributeName:e,name:`Farbe`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var en=o`
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
`,tn={dog:S`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,cat:S`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,rabbit:S`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,hamster:S`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,bird:S`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,reptile:S`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,paw:S`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`},nn=[[`welpe`,`dog`],[`hund`,`dog`],[`kater`,`cat`],[`katze`,`cat`],[`kaninchen`,`rabbit`],[`hase`,`rabbit`],[`meerschweinchen`,`hamster`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`bird`],[`sittich`,`bird`],[`papagei`,`bird`],[`vogel`,`bird`],[`schildkr`,`reptile`],[`echse`,`reptile`],[`schlange`,`reptile`],[`gecko`,`reptile`],[`reptil`,`reptile`]];function rn(e){let t=e.toLowerCase(),n=`paw`;for(let[e,r]of nn)if(t.includes(e)){n=r;break}return x`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${tn[n]}</svg>`}var G=class extends j{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[$t(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[j.styles,en,o`
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
    `]}stelle(e,t){return x`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}render(){let e=Qt(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.heading)||n(this.heading2),i=n(this.time)||n(this.date);return x`<div class="card">
      ${n(this.avatar)||r||n(this.meta)||i?x`<div class="main">
            ${n(this.avatar)?x`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?w:rn(this.avatar)}</span>`:w}
            <div class="titles">
              ${r?x`<div class="trow">
                    ${n(this.heading)?this.stelle(`heading`,`heading`):w}
                    ${n(this.heading2)?this.stelle(`heading2`,`heading2`):w}
                  </div>`:w}
              ${n(this.meta)?this.stelle(`meta`,`meta`):w}
            </div>
            ${i?x`<div class="when">
                  ${n(this.date)?this.stelle(`date`,`date`):w}
                  ${n(this.time)?this.stelle(`time`,`time`):w}
                </div>`:w}
          </div>`:w}
      ${n(this.text)?this.stelle(`text`,`text`):w}
      ${n(this.chipText)?x`<span
            class="chip v-${e}"
            data-ff-editable
            data-ff-spot="chipText"
            ?data-ff-bound=${this.chipTextField!==``}
            @dblclick=${e=>this.inlineEdit(e,`chipText`)}
          >${this.chipText}</span>`:w}
    </div>`}};A([k()],G.prototype,`chipVariant`,void 0),A([k()],G.prototype,`heading`,void 0),A([k()],G.prototype,`heading2`,void 0),A([k()],G.prototype,`time`,void 0),A([k()],G.prototype,`date`,void 0),A([k()],G.prototype,`avatar`,void 0),A([k()],G.prototype,`meta`,void 0),A([k()],G.prototype,`text`,void 0),A([k()],G.prototype,`chipText`,void 0),A([k()],G.prototype,`headingField`,void 0),A([k()],G.prototype,`heading2Field`,void 0),A([k()],G.prototype,`timeField`,void 0),A([k()],G.prototype,`dateField`,void 0),A([k()],G.prototype,`avatarField`,void 0),A([k()],G.prototype,`metaField`,void 0),A([k()],G.prototype,`textField`,void 0),A([k()],G.prototype,`chipTextField`,void 0),j.defineAndRegister(G);function an(e){return`${e.toLowerCase()}field`}var on=new Set,K=new WeakMap,sn=new WeakSet;function cn(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function ln(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function un(e){return typeof e.value==`string`?e.value:``}function dn(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(an(`value`))??``;if(t===``||n===``){K.delete(e);return}let r=nt(z().FF_DATA_SOURCES,t);if(!r){K.delete(e);return}let i=R(z().SEDATA,r.name,r.tableId)[0];if(i===void 0){K.delete(e),e.value=``;return}let a=r.indexField===``?``:F(i,r.indexField);K.set(e,{row:i,code:n,pindex:a}),e.value=F(i,n)}function fn(e){let t=K.get(e);return t&&ot(t.row,t.code,un(e)),t}function pn(e){sn.has(e)||(sn.add(e),e.addEventListener(`input`,()=>{fn(e)}),e.addEventListener(`change`,()=>{let t=fn(e);qt(e,`onChange`,{VALUE:un(e),PINDEX:t?.pindex??``})}))}function mn(){B()&&on.forEach(dn)}var hn=!1;function gn(e){e.hasAttribute(`data-ff-editor`)||(on.add(e),pn(e),hn||(hn=!0,pt(mn)),wt(),B()&&dn(e))}function _n(e){on.delete(e)}var vn=[`date`,`time`,`datetime`];function yn(e){return vn.includes(e)?e:`date`}function bn(e){return`${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`}function xn(e,t){let n=yn(e);if(n===`time`)return bn(t);let r=qe(t);return n===`datetime`?`${r} ${bn(t)}`:r}var q=class extends j{constructor(...e){super(...e),this.zeigt=`date`,this.source=``,this.value=``,this.valueField=``}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.bindingRoute={fieldProp:`valueField`}}static{this.bindableSpots=[{prop:`value`,label:`Wert`}]}static{this.defaultProps={zeigt:`date`,source:``,value:``,valueField:``}}static{this.customProperties=[{attributeName:`zeigt`,name:`Zeigt`,description:`Welche Zeitangabe ohne Datenbindung angezeigt wird.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`date`,label:`Datum`},{value:`time`,label:`Zeit`},{value:`datetime`,label:`Datum + Zeit`}]},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt wird.`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0}]}static{this.styles=[j.styles,o`
      .datum {
        color: var(--se-muted);
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
      }
    `]}render(){let e=this.valueField===``?xn(this.zeigt,new Date):this.value;return x`<span
      class="datum"
      data-ff-spot="value"
      ?data-ff-bound=${this.valueField!==``}
    >${e}</span>`}connectedCallback(){super.connectedCallback(),gn(this)}disconnectedCallback(){super.disconnectedCallback(),_n(this)}};A([k()],q.prototype,`zeigt`,void 0),A([k()],q.prototype,`source`,void 0),A([k()],q.prototype,`value`,void 0),A([k()],q.prototype,`valueField`,void 0),j.defineAndRegister(q);var Sn=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`];function Cn(e){return Sn.includes(e)?e:`text`}var wn=[`text`,`number`,`textarea`,`select`],J=class extends j{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource=!0}static{this.bindingRoute={fieldProp:`valueField`}}static{this.bindableSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,isArray:!1,maxLength:0,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,isArray:!1,maxLength:0,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0}]}static{this.styles=[j.styles,o`
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
    `]}onInput(e){let t=e.target;this.value=Cn(this.fieldType)===`date`?ln(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return x`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){if(this.hasAttribute(`data-ff-editor`))return;let e=this.renderRoot.querySelector(`input[type="checkbox"]`);e&&(e.checked=!e.checked)}controlTpl(e){switch(e){case`textarea`:return x`<textarea class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``),t=this.value!==``&&!e.includes(this.value);return x`<select class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}>
          <option value="" disabled hidden></option>
          ${t?x`<option value=${this.value} hidden>${this.value}</option>`:w}
          ${e.length===0?x`<option disabled>(keine Optionen)</option>`:e.map(e=>x`<option value=${e}>${e}</option>`)}
        </select>`}default:return x`<input
          class="ctrl"
          type=${e}
          .value=${e===`date`?cn(this.value):this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`}}render(){let e=Cn(this.fieldType);return e===`checkbox`?x`<div class="feld">
        <div class="zeile">
          <input class="ctrl" type="checkbox" />
          ${this.textTpl(`text`)}
        </div>
      </div>`:x`<div class="feld">
      <div
        class="huelle"
        data-ff-spot="value"
        ?data-ff-bound=${this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${wn.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this.value!==``):w}
      </div>
    </div>`}connectedCallback(){super.connectedCallback(),gn(this)}disconnectedCallback(){super.disconnectedCallback(),_n(this)}};A([k()],J.prototype,`fieldType`,void 0),A([k()],J.prototype,`placeholder`,void 0),A([k()],J.prototype,`options`,void 0),A([k()],J.prototype,`source`,void 0),A([k()],J.prototype,`value`,void 0),A([k()],J.prototype,`valueField`,void 0),j.defineAndRegister(J);function Tn(e,t,n,r){return{attributeName:e,name:t,description:n,isArray:!1,maxLength:0,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var Y=class extends j{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[G.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[$t(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),Tn(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte zeigt die Maske sie sichtbar in „Nicht zugeordnet“.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[j.styles,o`
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return x`<div class="col v-${Qt(this.variant)}">
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
    </div>`}};A([k()],Y.prototype,`variant`,void 0),A([k()],Y.prototype,`heading`,void 0),A([Ve()],Y.prototype,`_count`,void 0),j.defineAndRegister(Y);function En(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function Dn(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var On=new Set,kn=new WeakMap,An=Y.tagName,jn=G.tagName,X=`data-ff-nicht-zugeordnet`,Mn=`Nicht zugeordnet`;function Nn(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===An&&!e.hasAttribute(X))}function Pn(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===jn)}function Fn(e){return We().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function In(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=nt(z().FF_DATA_SOURCES,t);if(!r)return;let i=Nn(e);if(i.length===0)return;let a=kn.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(jn);t&&(a=t.cloneNode(!0),kn.set(e,a))}if(!a)return;let o=R(z().SEDATA,r.name,r.tableId),s=i.map(e=>e.getAttribute(`heading`)??``),c=Fn(a.tagName),l=Dn(i.map(e=>e.getAttribute(`auffang`)));e.querySelectorAll(`[`+X+`]`).forEach(e=>e.remove());let u=null,d=()=>(u||(u=document.createElement(An),u.setAttribute(`heading`,Mn),u.setAttribute(X,``),u.setAttribute(`style`,i[0].getAttribute(`style`)??`flex-grow:1;flex-basis:0;min-width:0`),e.appendChild(u)),u);for(let e of i)Pn(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:En(F(e,n),s);(o>=0?i[o]:l>=0?i[l]:d()).appendChild(t);for(let n of c){let r=t.getAttribute(an(n.prop))??``;r!==``&&(t[n.prop]=F(e,r))}let u=r.indexField===``?``:F(e,r.indexField);Z.set(t,{row:e,pindex:u}),t.draggable=!0}}var Z=new WeakMap,Q=null,Ln=new WeakSet;function Rn(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===An&&e.contains(n))return n;return null}function zn(e,t){if(!Q||Q.board!==e)return;let n=Z.get(Q.card);if(!n)return;let r=t.getAttribute(`heading`)??``;qt(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r})}function Bn(e){Ln.has(e)||(Ln.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&qt(e,`onCardClick`,{PINDEX:Z.get(n)?.pindex??``})}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Z.has(e))??null;n&&(Q={card:n,board:e},t.dataTransfer?.setData(`text/plain`,Z.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{Q=null}),e.addEventListener(`dragover`,t=>{let n=Rn(e,t);Q?.board===e&&n&&!n.hasAttribute(X)&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=Rn(e,t);!n||n.hasAttribute(X)||(t.preventDefault(),zn(e,n),Q=null)}))}function Vn(){B()&&On.forEach(In)}var Hn=!1;function Un(e){e.hasAttribute(`data-ff-editor`)||(On.add(e),Bn(e),Hn||(Hn=!0,pt(Vn)),wt(),B()&&In(e))}function Wn(e){On.delete(e)}var $=Y.blockType,Gn=class extends j{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[$]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:$}}static{this.templateChild={type:G.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``}}static{this.bindingRoute={fieldProp:`statusField`}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,isArray:!1,maxLength:0,kind:`field`,hiddenInInspector:!0}]}static{this.defaultChildren=[{type:$,props:{heading:`Offen`,variant:`warning`},children:[{type:G.blockType}]},{type:$,props:{heading:`In Arbeit`,variant:`info`}},{type:$,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[j.styles,o`
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
    `]}render(){return x`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Un(this)}disconnectedCallback(){super.disconnectedCallback(),Wn(this)}};j.defineAndRegister(Gn);var Kn=class extends j{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
    `]}render(){return x`<div class="zeile"><slot></slot></div>`}};j.defineAndRegister(Kn)})();