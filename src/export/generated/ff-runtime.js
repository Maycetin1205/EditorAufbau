(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,p=f.trustedTypes,re=p?p.emptyScript:``,ie=f.reactiveElementPolyfillSupport,m=(e,t)=>e,h={toAttribute(e,t){switch(t){case Boolean:e=e?re:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},g=(e,t)=>!l(e,t),_={attribute:!0,type:String,converter:h,reflect:!1,useDefault:!1,hasChanged:g};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_}static _$Ei(){if(this.hasOwnProperty(m(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?h:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?h:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??g)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};v.elementStyles=[],v.shadowRootOptions={mode:`open`},v[m(`elementProperties`)]=new Map,v[m(`finalized`)]=new Map,ie?.({ReactiveElement:v}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var y=globalThis,ae=e=>e,b=y.trustedTypes,oe=b?b.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,ce=`?`+x,le=`<${ce}>`,S=document,C=()=>S.createComment(``),w=e=>e===null||typeof e!=`object`&&typeof e!=`function`,T=Array.isArray,ue=e=>T(e)||typeof e?.[Symbol.iterator]==`function`,E=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,fe=/>/g,O=RegExp(`>|${E}(?:([^\\s"'>=/]+)(${E}*=${E}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),pe=/'/g,me=/"/g,he=/^(?:script|style|textarea|title)$/i,k=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),A=Symbol.for(`lit-noChange`),j=Symbol.for(`lit-nothing`),M=new WeakMap,N=S.createTreeWalker(S,129);function P(e,t){if(!T(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return oe===void 0?t:oe.createHTML(t)}var ge=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=D;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===D?c[1]===`!--`?o=de:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=O):(he.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=O):o=fe:o===O?c[0]===`>`?(o=i??D,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?O:c[3]===`"`?me:pe):o===me||o===pe?o=O:o===de||o===fe?o=D:(o=O,i=void 0);let d=o===O&&e[t+1].startsWith(`/>`)?` `:``;a+=o===D?n+le:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[P(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},F=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ge(t,n);if(this.el=e.createElement(l,r),N.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=N.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ve:r[1]===`?`?ye:r[1]===`@`?be:R}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(he.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=b?b.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],C()),N.nextNode(),c.push({type:2,index:++a});i.append(e[t],C())}}}else if(i.nodeType===8)if(i.data===ce)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}a++}}static createElement(e,t){let n=S.createElement(`template`);return n.innerHTML=e,n}};function I(e,t,n=e,r){if(t===A)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=w(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=I(e,i._$AS(e,t.values),i,r)),t}var _e=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);N.currentNode=r;let i=N.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new L(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new xe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=N.nextNode(),a++)}return N.currentNode=S,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},L=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=I(this,e,t),w(e)?e===j||e==null||e===``?(this._$AH!==j&&this._$AR(),this._$AH=j):e!==this._$AH&&e!==A&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ue(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==j&&w(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=F.createElement(P(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new _e(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=M.get(e.strings);return t===void 0&&M.set(e.strings,t=new F(e)),t}k(t){T(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(C()),this.O(C()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ae(e).nextSibling;ae(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},R=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=j,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=j}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=I(this,e,t,0),a=!w(e)||e!==this._$AH&&e!==A,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=I(this,r[n+o],t,o),s===A&&(s=this._$AH[o]),a||=!w(s)||s!==this._$AH[o],s===j?e=j:e!==j&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ve=class extends R{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===j?void 0:e}},ye=class extends R{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==j)}},be=class extends R{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=I(this,e,t,0)??j)===A)return;let n=this._$AH,r=e===j&&n!==j||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==j&&(n===j||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},xe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){I(this,e)}},Se=y.litHtmlPolyfillSupport;Se?.(F,L),(y.litHtmlVersions??=[]).push(`3.3.3`);var Ce=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new L(t.insertBefore(C(),e),e,void 0,n??{})}return i._$AI(e),i},z=globalThis,B=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ce(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};B._$litElement$=!0,B.finalized=!0,z.litElementHydrateSupport?.({LitElement:B});var we=z.litElementPolyfillSupport;we?.({LitElement:B}),(z.litElementVersions??=[]).push(`4.2.2`);var Te={attribute:!0,type:String,converter:h,reflect:!1,hasChanged:g},Ee=(e=Te,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function V(e){return(t,n)=>typeof n==`object`?Ee(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function De(e){return V({...e,state:!0,attribute:!1})}var H=new Map;function Oe(e){H.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),H.set(e.type,e)}function ke(e){return H.get(e)}var Ae={width:`auto`};function U(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var W=class extends B{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n)return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``;n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let i=window.getSelection(),a=document.createRange();a.selectNodeContents(n),i?.removeAllRanges(),i?.addRange(a);let o=!1,s=e=>{if(!o)if(o=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,c),n.removeEventListener(`keydown`,l),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.textContent=r},c=()=>s(!0),l=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),s(!1))};n.addEventListener(`blur`,c),n.addEventListener(`keydown`,l)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Oe({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ae,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,allowedChildTypes:e.allowedChildTypes??null,childDirection:e.childDirection??null,defaultChildren:e.defaultChildren??[],paletteHidden:e.paletteHidden??!1})}};U([V({type:Boolean,reflect:!0,attribute:`data-editable`})],W.prototype,`editable`,void 0);var je=[`info`,`success`,`warning`,`danger`];function G(e){return je.includes(e)?e:`info`}function K(e,t){return{attributeName:e,name:`Art`,description:t,isArray:!1,maxLength:0,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Me=o`
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
`,q=class extends W{constructor(...e){super(...e),this.variant=`info`,this.text=`Hinweis`}static{this.blockType=`badge`}static{this.tagName=`ff-badge`}static{this.displayName=`Status-Chip`}static{this.category=`anzeige`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,text:`Hinweis`}}static{this.customProperties=[K(`variant`,`Bedeutung des Chips — bestimmt die Farbe.`)]}static{this.styles=[W.styles,Me]}render(){return k`<span
      class="chip v-${G(this.variant)}"
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};U([V()],q.prototype,`variant`,void 0),U([V()],q.prototype,`text`,void 0),W.defineAndRegister(q);var Ne=class extends W{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.customProperties=[]}static{this.styles=[W.styles,o`
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
    `]}render(){return k`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}};U([V()],Ne.prototype,`label`,void 0),W.defineAndRegister(Ne);var J=class extends W{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=`Rückruf Fr. Wagner`,this.text=`Befund Minka besprechen`,this.chipText=`Heute`}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.defaultProps={chipVariant:`info`,heading:`Rückruf Fr. Wagner`,text:`Befund Minka besprechen`,chipText:`Heute`}}static{this.customProperties=[K(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[W.styles,Me,o`
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
    `]}render(){let e=G(this.chipVariant);return k`<div class="card">
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
    </div>`}};U([V()],J.prototype,`chipVariant`,void 0),U([V()],J.prototype,`heading`,void 0),U([V()],J.prototype,`text`,void 0),U([V()],J.prototype,`chipText`,void 0),W.defineAndRegister(J);var Y=class extends W{constructor(...e){super(...e),this.direction=`column`,this.gap=`md`,this.padding=`none`}static{this.blockType=`container`}static{this.tagName=`ff-container`}static{this.displayName=`Bereich`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.defaultProps={direction:`column`,gap:`md`,padding:`none`,width:`fill`}}static{this.customProperties=[]}static{this.styles=[W.styles,o`
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
    `]}render(){return k`<div class="wrap ${this.direction===`row`?`row`:`column`} gap-${[`sm`,`md`,`lg`].includes(this.gap)?this.gap:`md`} pad-${[`none`,`sm`,`md`,`lg`].includes(this.padding)?this.padding:`none`}"><slot></slot></div>`}};U([V()],Y.prototype,`direction`,void 0),U([V()],Y.prototype,`gap`,void 0),U([V()],Y.prototype,`padding`,void 0),W.defineAndRegister(Y);var X=class extends W{constructor(...e){super(...e),this.variant=`info`,this.heading=`Hinweis`,this.message=`Das ist ein Hinweistext.`}static{this.blockType=`infobox`}static{this.tagName=`ff-infobox`}static{this.displayName=`Infobox`}static{this.category=`anzeige`}static{this.defaultProps={variant:`info`,heading:`Hinweis`,message:`Das ist ein Hinweistext.`}}static{this.customProperties=[K(`variant`,`Bedeutung der Box — bestimmt die Farbe.`)]}static{this.styles=[W.styles,o`
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
    `]}render(){return k`<div class="box v-${G(this.variant)}">
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
    </div>`}};U([V()],X.prototype,`variant`,void 0),U([V()],X.prototype,`heading`,void 0),U([V()],X.prototype,`message`,void 0),W.defineAndRegister(X);var Z=class extends W{constructor(...e){super(...e),this.heading=`Neue Spalte`,this.variant=`info`,this.cardCount=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[J.blockType]}static{this.childDirection=`column`}static{this.paletteHidden=!0}static{this.defaultProps={heading:`Neue Spalte`,variant:`info`,width:290}}static{this.customProperties=[K(`variant`,`Bedeutung der Spalte — bestimmt die Farbe der Oberlinie.`)]}static{this.styles=[W.styles,o`
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
      .heading {
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
        font-size: var(--se-fs-sm);
        font-weight: 600;
        color: var(--se-muted);
      }
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        gap: var(--se-gap);
        min-height: 150px;
      }
      slot { display: contents; }
    `]}recount(e){let t=e.target,n=this.constructor.allowedChildTypes.map(e=>ke(e)?.tagName).filter(e=>!!e);this.cardCount=t.assignedElements().filter(e=>n.some(t=>e.matches(t)||e.querySelector(t)!==null)).length}render(){return k`<div class="col v-${G(this.variant)}">
      <div class="head">
        <span
          class="heading"
          data-ff-editable
          @dblclick=${e=>this.inlineEdit(e,`heading`)}
        >${this.heading}</span>
        <span class="count">${this.cardCount}</span>
      </div>
      <div class="body"><slot @slotchange=${this.recount}></slot></div>
    </div>`}};U([V()],Z.prototype,`heading`,void 0),U([V()],Z.prototype,`variant`,void 0),U([De()],Z.prototype,`cardCount`,void 0),W.defineAndRegister(Z);var Q=Z.blockType,$=J.blockType,Pe=class extends W{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[Q]}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.defaultChildren=[{type:Q,props:{heading:`Offen`,variant:`warning`},children:[{type:$,props:{heading:`Rückruf Fr. Wagner`,text:`Befund Minka besprechen`,chipVariant:`warning`,chipText:`Wartet seit 2 Tagen`}},{type:$,props:{heading:`Rechnung Nr. 5012 prüfen`,text:`Position Narkose fehlt`,chipVariant:`danger`,chipText:`Überfällig`}},{type:$,props:{heading:`Impfpass nachtragen`,text:`Buddy · Golden Retriever`,chipVariant:`info`,chipText:`Heute`}}]},{type:Q,props:{heading:`In Arbeit`,variant:`info`},children:[{type:$,props:{heading:`Röntgenbilder anfordern`,text:`Klinik Dr. Steiner, Fall Rocky`,chipVariant:`info`,chipText:`Angefragt`}}]},{type:Q,props:{heading:`Fertig`,variant:`success`},children:[{type:$,props:{heading:`Laborprobe versendet`,text:`Nala · Blutbild groß`,chipVariant:`success`,chipText:`Erledigt`}},{type:$,props:{heading:`Bestellung Verbandsmaterial`,text:`Lieferung bestätigt für Montag`,chipVariant:`success`,chipText:`Erledigt`}}]}]}static{this.customProperties=[]}static{this.styles=[W.styles,o`
      .board {
        display: flex;
        align-items: flex-start;
        gap: var(--se-gap-lg);
        /* Mehr Spalten als Platz: das Board scrollt horizontal (Kanban-
           Konvention), statt die Maske zu sprengen — im Editor wie im
           Export dasselbe Verhalten (WYSIWYG). */
        overflow-x: auto;
      }
      slot { display: contents; }
    `]}render(){return k`<div class="board"><slot></slot></div>`}};W.defineAndRegister(Pe);var Fe=class extends W{constructor(...e){super(...e),this.text=`Neuer Text`}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Textblock`}static{this.category=`anzeige`}static{this.defaultProps={text:`Neuer Text`}}static{this.customProperties=[]}static{this.styles=[W.styles,o`
      span {
        display: block;
        min-width: 1ch;
        color: var(--se-ink);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        line-height: 1.45;
      }
    `]}render(){return k`<span
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</span>`}};U([V()],Fe.prototype,`text`,void 0),W.defineAndRegister(Fe)})();