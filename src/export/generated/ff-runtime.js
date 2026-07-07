(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},h=(e,t)=>!l(e,t),oe={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:h};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=oe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oe}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??h)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};g.elementStyles=[],g.shadowRootOptions={mode:`open`},g[p(`elementProperties`)]=new Map,g[p(`finalized`)]=new Map,ae?.({ReactiveElement:g}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var _=globalThis,v=e=>e,y=_.trustedTypes,b=y?y.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,S=`?`+x,ce=`<${S}>`,C=document,w=()=>C.createComment(``),T=e=>e===null||typeof e!=`object`&&typeof e!=`function`,E=Array.isArray,le=e=>E(e)||typeof e?.[Symbol.iterator]==`function`,D=`[ 	
\f\r]`,O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,k=/-->/g,ue=/>/g,A=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),de=/'/g,fe=/"/g,pe=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),M=Symbol.for(`lit-noChange`),N=Symbol.for(`lit-nothing`),me=new WeakMap,P=C.createTreeWalker(C,129);function he(e,t){if(!E(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return b===void 0?t:b.createHTML(t)}var ge=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=O;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===O?c[1]===`!--`?o=k:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=A):(pe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=A):o=ue:o===A?c[0]===`>`?(o=i??O,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?A:c[3]===`"`?fe:de):o===fe||o===de?o=A:o===k||o===ue?o=O:(o=A,i=void 0);let d=o===A&&e[t+1].startsWith(`/>`)?` `:``;a+=o===O?n+ce:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[he(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},F=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ge(t,n);if(this.el=e.createElement(l,r),P.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=P.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ve:r[1]===`?`?ye:r[1]===`@`?be:R}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(pe.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=y?y.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],w()),P.nextNode(),c.push({type:2,index:++a});i.append(e[t],w())}}}else if(i.nodeType===8)if(i.data===S)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}a++}}static createElement(e,t){let n=C.createElement(`template`);return n.innerHTML=e,n}};function I(e,t,n=e,r){if(t===M)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=T(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=I(e,i._$AS(e,t.values),i,r)),t}var _e=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??C).importNode(t,!0);P.currentNode=r;let i=P.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new L(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new xe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=P.nextNode(),a++)}return P.currentNode=C,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},L=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=N,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=I(this,e,t),T(e)?e===N||e==null||e===``?(this._$AH!==N&&this._$AR(),this._$AH=N):e!==this._$AH&&e!==M&&this._(e):e._$litType$===void 0?e.nodeType===void 0?le(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==N&&T(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=F.createElement(he(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new _e(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new F(e)),t}k(t){E(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(w()),this.O(w()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=v(e).nextSibling;v(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},R=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=N,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=N}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=I(this,e,t,0),a=!T(e)||e!==this._$AH&&e!==M,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=I(this,r[n+o],t,o),s===M&&(s=this._$AH[o]),a||=!T(s)||s!==this._$AH[o],s===N?e=N:e!==N&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===N?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ve=class extends R{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===N?void 0:e}},ye=class extends R{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==N)}},be=class extends R{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=I(this,e,t,0)??N)===M)return;let n=this._$AH,r=e===N&&n!==N||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==N&&(n===N||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},xe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){I(this,e)}},Se=_.litHtmlPolyfillSupport;Se?.(F,L),(_.litHtmlVersions??=[]).push(`3.3.3`);var Ce=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new L(t.insertBefore(w(),e),e,void 0,n??{})}return i._$AI(e),i},z=globalThis,B=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ce(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return M}};B._$litElement$=!0,B.finalized=!0,z.litElementHydrateSupport?.({LitElement:B});var we=z.litElementPolyfillSupport;we?.({LitElement:B}),(z.litElementVersions??=[]).push(`4.2.2`);var Te={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:h},Ee=(e=Te,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function V(e){return(t,n)=>typeof n==`object`?Ee(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function De(e){return V({...e,state:!0,attribute:!1})}var Oe=new Map;function ke(e){Oe.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Oe.set(e.type,e)}var Ae={width:`auto`};function H(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var U=class extends B{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n)return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``;n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let i=window.getSelection(),a=document.createRange();a.selectNodeContents(n),i?.removeAllRanges(),i?.addRange(a);let o=!1,s=e=>{if(!o)if(o=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,c),n.removeEventListener(`keydown`,l),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.textContent=r},c=()=>s(!0),l=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),s(!1))};n.addEventListener(`blur`,c),n.addEventListener(`keydown`,l)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),ke({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ae,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,allowedChildTypes:e.allowedChildTypes,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource})}};H([V({type:Boolean,reflect:!0,attribute:`data-editable`})],U.prototype,`editable`,void 0);var je=[`info`,`success`,`warning`,`danger`];function W(e){return je.includes(e)?e:`info`}function G(e,t){return{attributeName:e,name:`Art`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Me=o`
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
`,K=class extends U{constructor(...e){super(...e),this.variant=`info`,this.text=`Hinweis`}static{this.blockType=`badge`}static{this.tagName=`ff-badge`}static{this.displayName=`Status-Chip`}static{this.category=`anzeige`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,text:`Hinweis`}}static{this.customProperties=[G(`variant`,`Bedeutung des Chips — bestimmt die Farbe.`)]}static{this.styles=[U.styles,Me]}render(){return j`<span
      class="chip v-${W(this.variant)}"
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};H([V()],K.prototype,`variant`,void 0),H([V()],K.prototype,`text`,void 0),U.defineAndRegister(K);var Ne=class extends U{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.customProperties=[]}static{this.styles=[U.styles,o`
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
    `]}render(){return j`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}};H([V()],Ne.prototype,`label`,void 0),U.defineAndRegister(Ne);var q=class extends U{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=`Rückruf Fr. Wagner`,this.text=`Befund Minka besprechen`,this.chipText=`Heute`}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.defaultProps={chipVariant:`info`,heading:`Rückruf Fr. Wagner`,text:`Befund Minka besprechen`,chipText:`Heute`}}static{this.customProperties=[G(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[U.styles,Me,o`
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
    `]}render(){let e=W(this.chipVariant);return j`<div class="card">
      <p
        class="heading"
        data-ff-editable
        @dblclick=${e=>this.inlineEdit(e,`heading`)}
      >${this.heading}</p>
      <p
        class="text"
        data-ff-editable
        @dblclick=${e=>this.inlineEdit(e,`text`)}
      >${this.text}</p>
      <span
        class="chip v-${e}"
        data-ff-editable
        @dblclick=${e=>this.inlineEdit(e,`chipText`)}
      >${this.chipText}</span>
    </div>`}};H([V()],q.prototype,`chipVariant`,void 0),H([V()],q.prototype,`heading`,void 0),H([V()],q.prototype,`text`,void 0),H([V()],q.prototype,`chipText`,void 0),U.defineAndRegister(q);var J=class extends U{constructor(...e){super(...e),this.direction=`column`,this.gap=`md`,this.padding=`none`}static{this.blockType=`container`}static{this.tagName=`ff-container`}static{this.displayName=`Bereich`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.defaultProps={direction:`column`,gap:`md`,padding:`none`,width:`fill`}}static{this.customProperties=[]}static{this.styles=[U.styles,o`
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
    `]}render(){return j`<div class="wrap ${this.direction===`row`?`row`:`column`} gap-${[`sm`,`md`,`lg`].includes(this.gap)?this.gap:`md`} pad-${[`none`,`sm`,`md`,`lg`].includes(this.padding)?this.padding:`none`}"><slot></slot></div>`}};H([V()],J.prototype,`direction`,void 0),H([V()],J.prototype,`gap`,void 0),H([V()],J.prototype,`padding`,void 0),U.defineAndRegister(J);var Y=class extends U{constructor(...e){super(...e),this.variant=`info`,this.heading=`Hinweis`,this.message=`Das ist ein Hinweistext.`}static{this.blockType=`infobox`}static{this.tagName=`ff-infobox`}static{this.displayName=`Infobox`}static{this.category=`anzeige`}static{this.defaultProps={variant:`info`,heading:`Hinweis`,message:`Das ist ein Hinweistext.`}}static{this.customProperties=[G(`variant`,`Bedeutung der Box — bestimmt die Farbe.`)]}static{this.styles=[U.styles,o`
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
    `]}render(){return j`<div class="box v-${W(this.variant)}">
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
    </div>`}};H([V()],Y.prototype,`variant`,void 0),H([V()],Y.prototype,`heading`,void 0),H([V()],Y.prototype,`message`,void 0),U.defineAndRegister(Y);var X=class extends U{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[q.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Karte`,childType:q.blockType}}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,width:290}}static{this.customProperties=[G(`variant`,`Bedeutung der Spalte — bestimmt die Farbe der Oberlinie.`)]}static{this.styles=[U.styles,o`
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)).length}render(){return j`<div class="col v-${W(this.variant)}">
      <div class="head">
        <span
          class="title"
          data-ff-editable
          @dblclick=${e=>this.inlineEdit(e,`heading`)}
        >${this.heading}</span>
        <span class="count">${this._count}</span>
      </div>
      <div class="body">
        ${this._count===0?j`<div class="drop">Karte hierher ziehen</div>`:null}
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`}};H([V()],X.prototype,`variant`,void 0),H([V()],X.prototype,`heading`,void 0),H([De()],X.prototype,`_count`,void 0),U.defineAndRegister(X);var Z=X.blockType,Q=q.blockType,Pe=class extends U{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[Z]}static{this.childDirection=`row`}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:Z}}static{this.acceptsDataSource=!0}static{this.defaultProps={width:`fill`,source:``}}static{this.customProperties=[]}static{this.defaultChildren=[{type:Z,props:{heading:`Offen`,variant:`warning`},children:[{type:Q,props:{heading:`Rückruf Fr. Wagner`,text:`Befund Minka besprechen`,chipVariant:`warning`,chipText:`Wartet seit 2 Tagen`}},{type:Q,props:{heading:`Rechnung Nr. 5012 prüfen`,text:`Position Narkose fehlt`,chipVariant:`danger`,chipText:`Überfällig`}},{type:Q,props:{heading:`Impfpass nachtragen`,text:`Buddy · Golden Retriever`,chipVariant:`info`,chipText:`Heute`}}]},{type:Z,props:{heading:`In Arbeit`,variant:`info`},children:[{type:Q,props:{heading:`Röntgenbilder anfordern`,text:`Klinik Dr. Steiner, Fall Rocky`,chipVariant:`info`,chipText:`Angefragt`}}]},{type:Z,props:{heading:`Fertig`,variant:`success`},children:[{type:Q,props:{heading:`Laborprobe versendet`,text:`Nala · Blutbild groß`,chipVariant:`success`,chipText:`Erledigt`}},{type:Q,props:{heading:`Bestellung Verbandsmaterial`,text:`Lieferung bestätigt für Montag`,chipVariant:`success`,chipText:`Erledigt`}}]}]}static{this.styles=[U.styles,o`
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
    `]}render(){return j`<div class="board"><slot></slot></div>`}};U.defineAndRegister(Pe);var $=class extends U{constructor(...e){super(...e),this.text=`Neuer Text`}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Textblock`}static{this.category=`anzeige`}static{this.defaultProps={text:`Neuer Text`}}static{this.customProperties=[]}static{this.styles=[U.styles,o`
      span {
        display: block;
        min-width: 1ch;
        color: var(--se-ink);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        line-height: 1.45;
      }
    `]}render(){return j`<span
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};H([V()],$.prototype,`text`,void 0),U.defineAndRegister($)})();