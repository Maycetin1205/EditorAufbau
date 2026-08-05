(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:ee,getPrototypeOf:te}=Object,p=globalThis,m=p.trustedTypes,ne=m?m.emptyScript:``,h=p.reactiveElementPolyfillSupport,g=(e,t)=>e,_={toAttribute(e,t){switch(t){case Boolean:e=e?ne:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},v=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol(`metadata`),p.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(g(`elementProperties`)))return;let e=te(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(g(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(g(`properties`))){let e=this.properties,t=[...f(e),...ee(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?_:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?_:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??v)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:`open`},b[g(`elementProperties`)]=new Map,b[g(`finalized`)]=new Map,h?.({ReactiveElement:b}),(p.reactiveElementVersions??=[]).push(`2.1.2`);var re=globalThis,ie=e=>e,ae=re.trustedTypes,oe=ae?ae.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,ce=`?`+x,le=`<${ce}>`,S=document,ue=()=>S.createComment(``),de=e=>e===null||typeof e!=`object`&&typeof e!=`function`,fe=Array.isArray,pe=e=>fe(e)||typeof e?.[Symbol.iterator]==`function`,me=`[ 	
\f\r]`,he=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,_e=/>/g,C=RegExp(`>|${me}(?:([^\\s"'>=/]+)(${me}*=${me}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ve=/'/g,ye=/"/g,be=/^(?:script|style|textarea|title)$/i,xe=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),w=xe(1),T=xe(2),E=Symbol.for(`lit-noChange`),D=Symbol.for(`lit-nothing`),Se=new WeakMap,O=S.createTreeWalker(S,129);function Ce(e,t){if(!fe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return oe===void 0?t:oe.createHTML(t)}var we=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=he;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===he?c[1]===`!--`?o=ge:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=C):(be.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=C):o=_e:o===C?c[0]===`>`?(o=i??he,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?C:c[3]===`"`?ye:ve):o===ye||o===ve?o=C:o===ge||o===_e?o=he:(o=C,i=void 0);let d=o===C&&e[t+1].startsWith(`/>`)?` `:``;a+=o===he?n+le:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[Ce(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Te=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=we(t,n);if(this.el=e.createElement(l,r),O.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=O.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ae:r[1]===`?`?je:r[1]===`@`?Me:ke}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(be.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=ae?ae.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],ue()),O.nextNode(),c.push({type:2,index:++a});i.append(e[t],ue())}}}else if(i.nodeType===8)if(i.data===ce)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}a++}}static createElement(e,t){let n=S.createElement(`template`);return n.innerHTML=e,n}};function Ee(e,t,n=e,r){if(t===E)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=de(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=Ee(e,i._$AS(e,t.values),i,r)),t}var De=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);O.currentNode=r;let i=O.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Oe(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ne(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=O.nextNode(),a++)}return O.currentNode=S,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Oe=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=D,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Ee(this,e,t),de(e)?e===D||e==null||e===``?(this._$AH!==D&&this._$AR(),this._$AH=D):e!==this._$AH&&e!==E&&this._(e):e._$litType$===void 0?e.nodeType===void 0?pe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==D&&de(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Te.createElement(Ce(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new De(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Se.get(e.strings);return t===void 0&&Se.set(e.strings,t=new Te(e)),t}k(t){fe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(ue()),this.O(ue()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ie(e).nextSibling;ie(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},ke=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=D,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=D}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=Ee(this,e,t,0),a=!de(e)||e!==this._$AH&&e!==E,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=Ee(this,r[n+o],t,o),s===E&&(s=this._$AH[o]),a||=!de(s)||s!==this._$AH[o],s===D?e=D:e!==D&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===D?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ae=class extends ke{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===D?void 0:e}},je=class extends ke{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==D)}},Me=class extends ke{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=Ee(this,e,t,0)??D)===E)return;let n=this._$AH,r=e===D&&n!==D||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==D&&(n===D||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ne=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Ee(this,e)}},Pe=re.litHtmlPolyfillSupport;Pe?.(Te,Oe),(re.litHtmlVersions??=[]).push(`3.3.3`);var Fe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Oe(t.insertBefore(ue(),e),e,void 0,n??{})}return i._$AI(e),i},Ie=globalThis,Le=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Fe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};Le._$litElement$=!0,Le.finalized=!0,Ie.litElementHydrateSupport?.({LitElement:Le});var Re=Ie.litElementPolyfillSupport;Re?.({LitElement:Le}),(Ie.litElementVersions??=[]).push(`4.2.2`);var ze={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:v},Be=(e=ze,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function k(e){return(t,n)=>typeof n==`object`?Be(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Ve(e){return k({...e,state:!0,attribute:!1})}var He=new Map;function Ue(e){He.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),He.set(e.type,e)}function We(){return Array.from(He.values())}var Ge={width:`auto`},Ke={rasterX:0,rasterY:0,rasterW:{spalten:24,spaltePx:40,zeilePx:12,gapPx:8}.spalten,rasterH:1},qe=`weitereQuellen`,Je={[qe]:[]},Ye=`folgtAuswahl`,Xe={[Ye]:[]};function A(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var j=class extends Le{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    /* Rasterflaeche (Attribut 'fuellt' — im Editor von useLitElement gesetzt,
       im Export vom Wurzel-Kind): der Baustein fuellt seine Zelle in der Hoehe
       (die Breite fuellt display:block ohnehin). NUR auf der Maskenflaeche
       gesetzt — in Containern (Fluss) fehlt das Attribut, der Baustein behaelt
       seine Naturgroesse. Editor UND Export setzen es identisch (WYSIWYG,
       Regel 1); je Baustein-CSS fuellt der sichtbare Inhalt (Knopf/Feld) dann
       die Hostflaeche. */
    :host([fuellt]) { height: 100%; box-sizing: border-box; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ue({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ge,...Ke,...e.acceptsDataSource?Je:null,...e.kannAuswahlFolgen?Xe:null,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,satzWahl:e.satzWahl,kannAuswahlFolgen:e.kannAuswahlFolgen,bindableSpots:e.bindableSpots,actionValueSpots:e.actionValueSpots,listenBindung:e.listenBindung,blockEvents:e.blockEvents,pageBlock:e.pageBlock,raster:e.raster})}};A([k({type:Boolean,reflect:!0,attribute:`data-editable`})],j.prototype,`editable`,void 0);var Ze=`data-ff-block-id`,Qe=[`fixed`,`context`,`data_field`,`block_value`,`gewaehlte_zeile`,`previous_result`,`step_result`,`se_variable`];function $e(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function et(e){return!$e(e)||typeof e.source!=`string`||!Qe.includes(e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`||e.blockId!==void 0&&typeof e.blockId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{},...typeof e.blockId==`string`?{blockId:e.blockId}:{}}}function tt(e){if(!$e(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!$e(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=et(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=et(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function nt(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!$e(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=tt(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}function M(e){return typeof e==`object`&&!!e}function N(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!M(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function rt(e){return e==null?``:String(e).trim()}function P(e,t){if(!M(e)||t===``)return``;let n=t.trim(),r=rt(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=rt(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=rt(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function it(e,t,n){if(!M(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function at(e){if(!M(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function F(e,t){return rt(e).toLowerCase()===t.trim().toLowerCase()}function I(e,t,n){if(!M(e)||!M(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(M(e)&&(F(e.ALIAS,t)||F(e.alias,t))){let t=at(e);if(t.length>0)return t}}else if(M(i))for(let e of Object.keys(i)){let n=i[e];if(F(e,t)||M(n)&&(F(n.ALIAS,t)||F(n.alias,t))){let e=at(n);if(e.length>0)return e}}let a=r.Tabellen;if(M(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=at(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(F(e,t)){let t=at(a[e]);if(t.length>0)return t}}return[]}function ot(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!M(t)||!M(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function st(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!M(t)||!M(t.MSG)))return t.MSG.DATA}function ct(e){if(e==null)return``;try{return JSON.stringify(e)??``}catch{return``}}var L=new Map,lt=new Set,ut=!1,dt=!1;function ft(){if(ut){dt=!0;return}ut=!0;try{do dt=!1,lt.forEach(e=>e());while(dt)}finally{ut=!1}}function pt(e){lt.add(e)}function mt(e){return L.get(e)?.zeile}function ht(e){return L.get(e)?.merkmal??``}function R(e){return e.getAttribute(`data-ff-id`)??``}function gt(e,t,n){if(e===``)return[];let r=ht(e);if(r===``)return[];let i=[];return t.forEach((e,t)=>{ct(n(e))===r&&i.push(t)}),i.length===0&&yt(e),i}function _t(e,t){if(e===``)return;let n=ct(t);if(n===``)return;let r=L.get(e);r&&r.merkmal===n?L.delete(e):L.set(e,{zeile:t,merkmal:n}),ft()}function vt(e,t){if(e===``)return;let n=ct(t);n!==``&&L.get(e)?.merkmal!==n&&(L.set(e,{zeile:t,merkmal:n}),ft())}function yt(e){L.has(e)&&(L.delete(e),ft())}var bt=Ye.toLowerCase();function xt(e){let t=e.getAttribute(bt)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.geberId!=`string`||e.geberId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({geberId:e.geberId,keyPairs:r})}return n}catch{return[]}}function St(e,t){let n=t,r=!1;for(let t of xt(e)){let e=mt(t.geberId);e!==void 0&&(r=!0,n=n.filter(n=>t.keyPairs.every(t=>{let r=P(e,t.fromField);return r!==``&&r===P(n,t.toField)})))}return{rows:n,gefiltert:r}}function Ct(e,t){if(xt(e).length===0)return t[0];let{rows:n,gefiltert:r}=St(e,t);return r?n[0]:void 0}var wt=`root`;function Tt(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var z=class extends j{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[wt]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[j.styles,o`
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
        /* Das Popup SCHWEBT (2026-07-30) — die staerkste der drei Stufen.
           Die Abdunklung dahinter trennt es bereits inhaltlich; der Schatten
           macht daraus auch raeumlich ein Fenster ueber der Maske statt
           eines aufgeklebten Kastens. */
        box-shadow: var(--se-shadow-popup);
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
    `]}onClose(){this.hasAttribute(`data-ff-editor`)||this.removeAttribute(`offen`)}render(){return w`<div class="abdunklung"></div>
      <div class="buehne">
        <div class="fenster" style="width:${Tt(this.breite,520)}px;height:${Tt(this.hoehe,380)}px">
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
      </div>`}};A([k()],z.prototype,`name`,void 0),A([k()],z.prototype,`breite`,void 0),A([k()],z.prototype,`hoehe`,void 0),j.defineAndRegister(z);var Et=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Dt(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Ot(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}var kt=8e3,B=null,At=null;function jt(){let e=document.createElement(`div`);return e.setAttribute(`data-ff-meldung`,``),e.setAttribute(`role`,`alert`),e.style.cssText=[`position:fixed`,`top:0`,`left:0`,`right:0`,`z-index:2147483647`,`padding:7px 12px`,`background:var(--se-red-soft,#fbe7e6)`,`color:var(--se-red,#c0201a)`,`border-bottom:1px solid var(--se-red,#c0201a)`,`font:500 12px/1.4 system-ui,sans-serif`,`cursor:pointer`].join(`;`),e.title=`Klicken zum Schliessen`,e.addEventListener(`click`,Mt),e}function Mt(){At&&=(clearTimeout(At),null),B?.remove(),B=null}function V(e){typeof document>`u`||!document.body||(B||(B=jt(),document.body.appendChild(B)),B.textContent=e,At&&clearTimeout(At),At=setTimeout(Mt,kt))}function H(){return globalThis}function Nt(){let e=H();return M(e.SEDATA)&&M(e.SEDATA.Daten)}function Pt(){let e=H();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function Ft(){let e=H();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var It=new Set,Lt=new Set;function Rt(e){It.add(e)}function zt(e){return Lt.add(e),()=>{Lt.delete(e)}}function Bt(){It.forEach(e=>e())}function Vt(e){Lt.forEach(t=>{try{t(e)}catch{}})}var U=new Map,Ht=``,Ut=0;function Wt(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function Gt(){let e=Wt();e&&(e.value=Array.from(U,([e,t])=>`${e}: ${t}`).join(`
`)+(Ht===``?``:`\n\nERSTES PAKET\n${Ht}`))}function W(e,t){U.set(e,t),Gt()}function Kt(){let e=H();U.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),U.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),U.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),U.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),U.set(`Empfangene Pakete`,String(Ut)),U.set(`SEDATA.Daten`,Nt()?`vorhanden`:`fehlt`),Gt()}function qt(e){if(Ht===``)try{Ht=typeof e==`string`?e:JSON.stringify(e)??``,Gt()}catch{}}function Jt(e){Ut+=1,qt(e),W(`Empfangene Pakete`,String(Ut));let t=ot(e);if(!t){W(`Letztes Paket`,`Antwort ohne Daten`),Vt(e);return}let n=H();M(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,W(`Letztes Paket`,`Daten-Push angenommen`),W(`SEDATA.Daten`,`vorhanden`),Ft(),Bt()}function Yt(e=0){let t=H();if(typeof t.basisHTML_REGISTER==`function`){Kt();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{Jt(e)},document.title,`1.0`),W(`Registrierung`,`ausgeführt`)}catch(e){W(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&W(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{Yt(e+1)},25)):(Kt(),W(`Registrierung`,`nach 10s kein Interface`),V(`SoftEngine-Anschluss nicht gefunden — die Maske bleibt ohne Daten (Strg+Alt+D für Details).`))}var Xt=!1;function Zt(){if(Xt)return;Xt=!0,W(`Runtime`,`gestartet`),W(`Registrierung`,`noch nicht ausgeführt`),Kt(),Pt();let e=H();e.Erstellen=()=>{Ft(),Bt()},e.initData=e.Erstellen,e.ReloadData=()=>{Bt()},Yt(),window.addEventListener(`message`,e=>{if(typeof H().basisHTML_REGISTER==`function`)return;let t=st(e.data);t!==void 0&&Jt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){Kt();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,Nt()?(clearInterval(n),W(`SEDATA.Daten`,`vorhanden`),Ft(),Bt()):t>100&&(clearInterval(n),W(`Daten-Wartezeit`,`nach 30s ohne Daten`),V(`Keine Daten von SoftEngine empfangen — die Maske zeigt nichts an (Strg+Alt+D für Details).`))},300)}function Qt(e){return e instanceof Error?e.message:String(e)}function $t(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!M(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Et.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var en=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function tn(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function nn(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function rn(e,t){if(t>12)return;let n=nn(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=rn(n,t+1);if(e!==void 0)return e}return}if(M(e)){for(let n of en){if(!(n in e))continue;let r=rn(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=rn(n,t+1);if(e!==void 0)return e}}}function an(e){let t=tn(e);if(M(t)){for(let e of en){if(!(e in t))continue;let n=rn(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=an(t);if(e!==void 0)return e}else if(M(e)){let t=an(e);if(t!==void 0)return t}}}function on(e){return M(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function sn(e,t){if(!M(e))return;let n=on(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=an(e[t]);if(n!==void 0)return n}}var cn=[],ln=!1,un=6e3,dn=100;function fn(){if(ln||cn.length===0)return;ln=!0;let e=cn.shift(),t=H(),n=new Set(on(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),ln=!1,e.resolve(t),fn())},a=zt(e=>{let t=an(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=sn(H().SEDATA,n);e!==void 0&&i(e)},dn),s=setTimeout(()=>{V(`Daten laden: SoftEngine hat nicht geantwortet (Relation Nr. ${e.template.nr}).`),i(``)},un);if(typeof t.basisHTML_SND_MSG!=`function`){V(`Daten laden nicht moeglich: keine Verbindung zu SoftEngine.`),i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch(t){V(`Daten laden fehlgeschlagen (Relation Nr. ${e.template.nr}): ${Qt(t)}`),i(``)}}function pn(e,t){Zt();let n=H();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG!=`function`)return V(`Speichern nicht moeglich: keine Verbindung zu SoftEngine. Die Eingabe wurde NICHT uebernommen.`),Promise.resolve(``);try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch(t){V(`Speichern fehlgeschlagen (Relation Nr. ${e.nr}): ${Qt(t)}`)}return Promise.resolve(``)}return new Promise(n=>{cn.push({template:e,params:[...t],resolve:n}),fn()})}function mn(e,t){if(!M(t))return``;let n=t.document;if(!n||typeof n.querySelectorAll!=`function`)return``;let r=Array.from(n.querySelectorAll(`[${Ze}]`)).find(t=>t.getAttribute(Ze)===e.blockId);if(!r)return``;let i=r[e.value];return i==null?``:String(i)}function hn(e,t,n=H()){if(e.source===`aus`)return``;if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);return Number.isInteger(n)&&n>=0?t.stepResults?.[n]??``:``}if(e.source===`block_value`)return mn(e,n);if(e.source===`gewaehlte_zeile`){let n=t.gewaehlteZeile?.(e.blockId??``);return n===void 0?``:P(n,e.value)}if(!M(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!M(t)||!M(t.Daten)||!M(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=N(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=I(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>P(e,r.indexField)===a):i[0];return o?P(o,e.value):``}function gn(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function _n(e,t){if(e.trim()===``)return;let n=H();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(gn(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function vn(e,t,n){if(t.trim()!==``)for(let r of Array.from(e.querySelectorAll(z.tagName)))(r.getAttribute(`name`)??z.defaultProps.name)===t&&(n?r.setAttribute(`offen`,``):r.removeAttribute(`offen`))}var yn=new WeakMap;function bn(e){V(`Aktionskette fehlgeschlagen: `+(e instanceof Error?e.message:String(e)))}async function xn(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=nt(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=yn.get(e);if(i||(i=new Set,yn.set(e,i)),!i.has(t)){i.add(t);try{let t={...n,NOW_DATE:Dt(new Date)},i=``,a=[];for(let n of r){if(n.type===`START_TOOL`){_n(n.toolNr,Ot({params:n.toolParams},t)),a.push(``);continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){vn(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),a.push(``);continue}let r=$t(H().FF_RELATIONS,n.relationId);if(!r){a.push(``);continue}let o={context:t,previousResult:i,stepResults:a,gewaehlteZeile:mt},s=await pn(r,[...n.params,...n.extraParams].map(e=>hn(e,o)));a.push(s),r.verb===`GET_RELATION`&&(i=s),n.resultKey!==``&&(t[n.resultKey]=s)}}finally{i.delete(t)}}}var Sn=new WeakSet;function Cn(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||Sn.has(e))return;Sn.add(e);let n=nt(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&Zt(),e.addEventListener(`click`,()=>{xn(e,t,{}).catch(bn)})}var wn=class extends j{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.raster={startW:4,startH:2,minW:2,minH:2}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
        box-shadow: var(--se-shadow-ruhe);
        /* Dauer aus dem gemeinsamen Wert (2026-07-30): vorher stand hier
           eine eigene 120ms-Angabe — zwei Bausteine mit knapp
           unterschiedlichem Takt wirken unruhig. */
        transition: background-color var(--se-move), border-color var(--se-move),
          box-shadow var(--se-move), transform var(--se-move);
      }
      button:hover { background: var(--se-accent-dark); border-color: var(--se-accent-dark); box-shadow: var(--se-shadow-hover); }
      /* Der Knopf gibt beim Druecken sichtbar nach — die einzige Stelle der
         Maske, an der ein Klick sofort etwas ausloest. Ohne diese Rueckmeldung
         weiss der Bediener nicht, ob er getroffen hat. */
      button:active { transform: translateY(1px); box-shadow: var(--se-shadow-ruhe); }
      button:focus-visible { outline: 2px solid var(--se-accent); outline-offset: 2px; }
      /* Rasterflaeche: der Knopf fuellt seine Zelle (Ziehen macht den KNOPF
         groesser, nicht einen leeren Rahmen). Im Fluss (kein 'fuellt') bleibt
         er naturgross. */
      :host([fuellt]) button { width: 100%; height: 100%; }
    `]}render(){return w`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),Cn(this,`onClick`)}};A([k()],wn.prototype,`label`,void 0),j.defineAndRegister(wn);var Tn=[`info`,`success`,`warning`,`danger`];function En(e){return Tn.includes(e)?e:`info`}function Dn(e,t){return{attributeName:e,name:`Farbe`,description:t,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var On=o`
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
`,kn={dog:T`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,cat:T`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,rabbit:T`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,hamster:T`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,bird:T`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,reptile:T`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,paw:T`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`},An=[[`welpe`,`dog`],[`hund`,`dog`],[`kater`,`cat`],[`katze`,`cat`],[`kaninchen`,`rabbit`],[`hase`,`rabbit`],[`meerschweinchen`,`hamster`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`bird`],[`sittich`,`bird`],[`papagei`,`bird`],[`vogel`,`bird`],[`schildkr`,`reptile`],[`echse`,`reptile`],[`schlange`,`reptile`],[`gecko`,`reptile`],[`reptil`,`reptile`]];function jn(e){let t=e.toLowerCase(),n=`paw`;for(let[e,r]of An)if(t.includes(e)){n=r;break}return w`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${kn[n]}</svg>`}var G=class extends j{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[Dn(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[j.styles,On,o`
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
        box-shadow: var(--se-shadow-ruhe);
        transition: box-shadow var(--se-move), transform var(--se-move);
      }
      /* Die Karte hebt sich unter dem Zeiger. Ein Blatt, das man anfassen
         kann — nicht ein Bild. Bewusst nur 1px: mehr wirkt verspielt und
         laesst die Nachbarkarten wackeln. */
      .card:hover {
        box-shadow: var(--se-shadow-hover);
        transform: translateY(-1px);
      }
      /* Statusfarbe AM KOERPER (2026-07-30, Nutzer-Go).
         Die Karte kennt ihren Status laengst — die Eigenschaft „Farbe"
         faerbt seit jeher den Chip. Gezeigt hat der Koerper ihn nie: weisse
         Flaeche, grauer Rahmen, egal ob Notfall oder erledigt. Ein schmaler
         Streifen links macht ihn auf einen Blick lesbar. Kostet KEINE neue
         Eigenschaft und KEINE neue Farbe — dieselben Statusfarben wie Chip
         und Kanban-Spalte, dieselbe Klassen-Bauart (v-variante). */
      .card { border-left-width: 3px; }
      .card.v-info { border-left-color: var(--se-blue); }
      .card.v-success { border-left-color: var(--se-green); }
      .card.v-warning { border-left-color: var(--se-amber); }
      .card.v-danger { border-left-color: var(--se-red); }
      /* Die GEWAEHLTE Karte (Auswahl-Geber Kanban, 2026-08-05): getoente
         Akzentflaeche + Akzentrahmen — dieselbe Handschrift wie die
         gewaehlte Tabellenzeile. Das Attribut setzt NUR die Laufzeit
         (kanban/seRuntime), der Editor erfindet keine Auswahl (Regel 7).
         Der linke STATUS-Streifen bleibt sichtbar: er traegt Bedeutung
         (Notfall!), darum nur die drei anderen Kanten in Akzent. */
      :host([data-ff-auswahl]) .card {
        border-top-color: var(--se-accent);
        border-right-color: var(--se-accent);
        border-bottom-color: var(--se-accent);
        background: var(--se-accent-soft);
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
    `]}stelle(e,t){return w`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}render(){let e=En(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.heading)||n(this.heading2),i=n(this.time)||n(this.date);return w`<div class="card v-${e}">
      ${n(this.avatar)||r||n(this.meta)||i?w`<div class="main">
            ${n(this.avatar)?w`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?D:jn(this.avatar)}</span>`:D}
            <div class="titles">
              ${r?w`<div class="trow">
                    ${n(this.heading)?this.stelle(`heading`,`heading`):D}
                    ${n(this.heading2)?this.stelle(`heading2`,`heading2`):D}
                  </div>`:D}
              ${n(this.meta)?this.stelle(`meta`,`meta`):D}
            </div>
            ${i?w`<div class="when">
                  ${n(this.date)?this.stelle(`date`,`date`):D}
                  ${n(this.time)?this.stelle(`time`,`time`):D}
                </div>`:D}
          </div>`:D}
      ${n(this.text)?this.stelle(`text`,`text`):D}
      ${n(this.chipText)?w`<span
            class="chip v-${e}"
            data-ff-editable
            data-ff-spot="chipText"
            ?data-ff-bound=${this.chipTextField!==``}
            @dblclick=${e=>this.inlineEdit(e,`chipText`)}
          >${this.chipText}</span>`:D}
    </div>`}};A([k()],G.prototype,`chipVariant`,void 0),A([k()],G.prototype,`heading`,void 0),A([k()],G.prototype,`heading2`,void 0),A([k()],G.prototype,`time`,void 0),A([k()],G.prototype,`date`,void 0),A([k()],G.prototype,`avatar`,void 0),A([k()],G.prototype,`meta`,void 0),A([k()],G.prototype,`text`,void 0),A([k()],G.prototype,`chipText`,void 0),A([k()],G.prototype,`headingField`,void 0),A([k()],G.prototype,`heading2Field`,void 0),A([k()],G.prototype,`timeField`,void 0),A([k()],G.prototype,`dateField`,void 0),A([k()],G.prototype,`avatarField`,void 0),A([k()],G.prototype,`metaField`,void 0),A([k()],G.prototype,`textField`,void 0),A([k()],G.prototype,`chipTextField`,void 0),j.defineAndRegister(G);function Mn(e){let t=String(e??``).trim();if(t===``)return``;let n=/^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(t);if(n)return`${n[3]}-${n[2].padStart(2,`0`)}-${n[1].padStart(2,`0`)}`;let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return r?`${r[1]}-${r[2]}-${r[3]}`:``}function Nn(e){let t=String(e.getMonth()+1).padStart(2,`0`),n=String(e.getDate()).padStart(2,`0`);return`${e.getFullYear()}-${t}-${n}`}function Pn(e,t){let n=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!n)return``;let r=new Date(Number(n[1]),Number(n[2])-1,Number(n[3]));return r.setDate(r.getDate()+t),Nn(r)}var Fn=``,In=new Set;function Ln(){return Fn}function Rn(e){let t=Mn(e);t!==Fn&&(Fn=t,In.forEach(e=>e()))}function zn(e){return In.add(e),()=>{In.delete(e)}}var Bn=class extends j{constructor(...e){super(...e),this.tag=``,this.tagAbmelden=null}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.defaultProps={}}static{this.customProperties=[]}static{this.raster={startW:9,startH:2,minW:5,minH:2}}static{this.styles=[j.styles,o`
      /* EINE Hoehe fuer Riegel und „Heute" — vorher liefen sie mit 36px und
         30px auseinander und standen sichtbar nicht auf einer Linie. */
      .waehler {
        --tag-h: 34px;
        /* Mindestbreite des Datumsfelds. Der Browser rendert im Datumsfeld
           TT.MM.JJJJ plus sein eigenes Kalender-Symbol; darunter bricht die
           Anzeige um oder verschwindet. Referenz .vinput-date: 128px — hier
           knapper, damit der Baustein sich schmaler ziehen laesst. */
        --tag-feld-min: 112px;
        display: flex;
        align-items: stretch;
        gap: var(--se-gap-sm);
        height: var(--tag-h);
        font-family: var(--se-font);
      }
      /* Der gerahmte Riegel (.vdaynav): EIN Rahmen um Pfeil, Feld, Pfeil —
         dadurch wirkt der Waehler als ein Bedienelement, nicht als drei
         lose Teile. Er FUELLT die Breite des Bausteins: sonst steht der
         Baustein schmal in einer breiten Zelle und der Auswahlrahmen des
         Editors ist sichtbar breiter als das Ding darin (Nutzer 2026-07-27). */
      .riegel {
        box-sizing: border-box;
        display: flex;
        align-items: stretch;
        flex: 1;
        min-width: 0;
        height: 100%;
        padding: 2px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
      }
      /* Pfeile: im Riegel rahmenlos und quadratisch (.vdaynav .vbtn-icon). */
      .pfeil {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        padding: 0;
        border: none;
        border-radius: var(--se-r-sm);
        background: transparent;
        color: var(--se-muted);
        font-family: var(--se-font);
        font-size: var(--se-fs-lg);
        line-height: 1;
        cursor: pointer;
      }
      .pfeil:hover { background: var(--se-panel-2); color: var(--se-ink); }
      /* Das Datumsfeld traegt im Riegel keinen eigenen Rahmen und steht
         mittig + halbfett (.vinput-date) — es ist die Hauptaussage. */
      .feld {
        box-sizing: border-box;
        /* Waechst mit dem Riegel, faellt aber NIE unter die Mindestbreite —
           genau das fehlte in der ersten Fassung (gemessene 8px). */
        flex: 1;
        min-width: var(--tag-feld-min);
        border: none;
        background: transparent;
        padding: 0 2px;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        color: var(--se-ink);
        text-align: center;
      }
      .feld:focus { outline: none; }
      /* „Heute" steht NEBEN dem Riegel und ist ein normaler Knopf (.vbtn),
         gleich hoch wie der Riegel. */
      .heute {
        box-sizing: border-box;
        flex: none;
        height: 100%;
        padding: 0 9px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-ink);
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        font-weight: 550;
        white-space: nowrap;
        cursor: pointer;
      }
      .heute:hover { border-color: var(--se-accent); color: var(--se-accent); }
      /* Schmal gezogen raeumt der Waehler selbst auf, statt sich zu
         verstuemmeln: zuerst geht „Heute" (die Pfeile leisten dasselbe,
         nur langsamer), dann rueckt das Datumsfeld enger zusammen. Ohne
         das waere der Baustein nie unter ~240px zu bekommen (Nutzer
         2026-07-27). Container-Abfragen sind hier ungefaehrlich: kennt sie
         ein alter Browser nicht, ueberspringt er den Block und der Waehler
         bleibt schlicht in seiner breiten Form — nichts bricht. */
      :host { container-type: inline-size; }
      @container (max-width: 210px) {
        .heute { display: none; }
      }
      @container (max-width: 160px) {
        .waehler { --tag-feld-min: 80px; }
      }
      /* Im Editor wird gestaltet, nicht bedient (Regel 7): der Waehler zeigt
         dort den heutigen Tag, nimmt aber keine Eingabe an. */
      :host([data-ff-editor]) .feld,
      :host([data-ff-editor]) .pfeil,
      :host([data-ff-editor]) .heute { pointer-events: none; }
      /* Rasterflaeche: hoeher gezogen waechst der Waehler MIT (wie das
         Eingabefeld beim Formularfeld) — vorher wuchs nur die Zelle und der
         Baustein blieb klein darin stehen (Nutzer 2026-07-27). */
      :host([fuellt]) .waehler { height: 100%; }
    `]}setzeTag(e){Rn(e),this.tag=Ln()}render(){return w`<div class="waehler">
      <div class="riegel">
        <button class="pfeil" title="Vortag" @click=${()=>this.setzeTag(Pn(this.tag,-1))}>‹</button>
        <input
          class="feld"
          type="date"
          .value=${this.tag}
          @change=${e=>this.setzeTag(e.target.value)}
        />
        <button class="pfeil" title="Folgetag" @click=${()=>this.setzeTag(Pn(this.tag,1))}>›</button>
      </div>
      <button class="heute" @click=${()=>this.setzeTag(Nn(new Date))}>Heute</button>
    </div>`}connectedCallback(){super.connectedCallback(),this.tag=Ln()||Nn(new Date),!this.hasAttribute(`data-ff-editor`)&&(this.setzeTag(this.tag),this.tagAbmelden?.(),this.tagAbmelden=zn(()=>{this.tag=Ln()}))}disconnectedCallback(){super.disconnectedCallback(),this.tagAbmelden?.(),this.tagAbmelden=null}};A([Ve()],Bn.prototype,`tag`,void 0),j.defineAndRegister(Bn);var Vn={attributeName:`fieldType`,equals:`nachschlagen`},Hn=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`},{value:`nachschlagen`,label:`Nachschlagen`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`nachschlagQuelle`,name:`Quelle`,description:`Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.`,kind:`quelle`,visibleWhen:Vn},{attributeName:`anzeigeFeld`,name:`Angezeigt wird`,description:`Feld der Nachschlage-Quelle, dessen Wert der Bediener sieht (z. B. der Name).`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`anzeigeTitel`,visibleWhen:Vn},{attributeName:`speicherFeld`,name:`Gespeichert wird`,description:`Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer).`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`speicherTitel`,visibleWhen:Vn},{attributeName:`einzigerTreffer`,name:`Einzigen Treffer übernehmen`,description:`Bleibt in der Maske genau EIN Satz übrig (weil das Feld der Auswahl eines anderen folgt), übernimmt es diesen von selbst — ohne dass der Bediener die Lupe drückt. Nur in ein leeres Feld; die Lupe bleibt daneben bedienbar.`,kind:`segment`,options:[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],visibleWhen:Vn},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,kind:`field`,visibleWhen:{attributeName:`fieldType`,notEquals:`nachschlagen`}}];function Un(e){return`${e.toLowerCase()}field`}function Wn(e){let t=e.split(`::`);if(t.length!==2)return{quelleId:``,code:e};let[n,r]=t;return n===``||r===``?{quelleId:``,code:e}:{quelleId:n,code:r}}function Gn(e){let t=new Set,n=!1,r=()=>{Nt()&&t.forEach(e.hydriere)};return{connect:i=>{i.hasAttribute(`data-ff-editor`)||(t.add(i),e.verdrahte?.(i),n||(n=!0,Rt(r),zn(r),pt(r)),Zt(),Nt()&&e.hydriere(i))},disconnect:e=>{t.delete(e)}}}var Kn=qe.toLowerCase(),qn=``;function Jn(e){if(e.length===0)return``;let t=[];for(let n of e){let e=n.trim();if(e===``)return``;t.push(e)}return t.join(qn)}function Yn(e){let t=e.getAttribute(Kn)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.quelleId!=`string`||e.quelleId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({quelleId:e.quelleId,keyPairs:r})}return n}catch{return[]}}function Xn(e){let t=Yn(e);if(t.length===0)return(e,t)=>P(e,Wn(t).code);let n=H().SEDATA,r=H().FF_DATA_SOURCES,i=new Map;for(let e of t){let t=N(r,e.quelleId);if(!t)continue;let a=I(n,t.name,t.tableId),o=new Map;for(let t of a){let n=Jn(e.keyPairs.map(e=>P(t,e.toField)));n!==``&&!o.has(n)&&o.set(n,t)}i.set(e.quelleId,{nachSchluessel:o,hierFelder:e.keyPairs.map(e=>e.fromField)})}return(e,t)=>{let{quelleId:n,code:r}=Wn(t);if(n===``)return P(e,r);let a=i.get(n);if(!a)return``;let o=Jn(a.hierFelder.map(t=>P(e,t)));if(o===``)return``;let s=a.nachSchluessel.get(o);return s===void 0?``:P(s,r)}}function Zn(e,t){let n=e.getAttribute(`source`)??``,r=e.getAttribute(t)??``;if(n===``||r===``)return{art:`ungebunden`};let i=N(H().FF_DATA_SOURCES,n);if(!i)return{art:`ohneQuelle`};let a=Ct(e,I(H().SEDATA,i.name,i.tableId));if(a===void 0)return{art:`ohneZeile`};let{quelleId:o,code:s}=Wn(r);return{art:`wert`,wert:o===``?P(a,s):Xn(e)(a,r),zeile:a,quelle:i,quelleId:o,reinerCode:s}}var Qn=new WeakMap,$n=new WeakSet;function er(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function tr(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function nr(e){return typeof e.value==`string`?e.value:``}function rr(e){if(e.pruefeEigenenWert?.(),e.getAttribute(`fieldtype`)===`nachschlagen`){Qn.delete(e);return}let t=Zn(e,Un(`value`));if(t.art!==`wert`){Qn.delete(e),t.art===`ohneZeile`&&(e.value=``);return}let{zeile:n,quelle:r,quelleId:i,reinerCode:a,wert:o}=t,s=r.indexField===``?``:P(n,r.indexField);i===``?Qn.set(e,{row:n,code:a,pindex:s}):Qn.delete(e),e.value=o}function ir(e){let t=Qn.get(e);return t&&it(t.row,t.code,nr(e)),t}function ar(e){$n.has(e)||($n.add(e),e.addEventListener(`input`,()=>{ir(e)}),e.addEventListener(`change`,()=>{let t=ir(e);xn(e,`onChange`,{VALUE:nr(e),PINDEX:t?.pindex??``}).catch(bn)}))}var or=Gn({hydriere:rr,verdrahte:ar}),sr=or.connect,cr=or.disconnect,lr=o`
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
  /* Der Platzhalter eines GEBUNDENEN Felds braucht hier keine Sonderregel:
     im Export steht dort bereits der Feld-Klarname ("Tiername"), derselbe
     Text, den der Editor an der Stelle zeigt (exportMask/bindungsVorschau).
     Er verschwindet wie jeder Platzhalter, sobald ein Wert da ist.
     Bis 2026-08-06 versteckte an dieser Stelle eine Regel den Platzhalter
     gebundener Felder in der Maske ganz. Grund war, dass die Maske damals
     den GETIPPTEN Text zeigte: der Bediener las in SoftEngine ploetzlich
     "Feldname", wo der Editor "Tiername" gezeigt hatte (SE-Echttest
     2026-08-04). Verstecken war die ehrliche Notloesung — ein leeres Feld
     verriet aber nicht mehr, wozu es gehoert. Jetzt stimmt der Text, und
     die Regel ist ueberfluessig. */
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
  /* Nachschlagen: Feld + Lupe in EINER Zeile; die Lupe sitzt im Feld
     rechts. Der gestrichelte Rahmen sagt wie bei gebundenen Stellen:
     dieser Wert kommt aus Daten, nicht aus der Tastatur. */
  .nachschlag { position: relative; }
  .nachschlag .ctrl { padding-right: 34px; border-style: dashed; }
  /* Steht ein Wert drin, sitzt links von der Lupe das × — der Text braucht
     dann Platz fuer BEIDE Knoepfe, sonst laeuft er darunter. */
  .nachschlag.mit-loeschen .ctrl { padding-right: 58px; }
  /* Lupe und × teilen ihre Optik: gleiche Hoehe, gleiche Handschrift, nur
     verschieden breit und verschieden weit rechts. Getrennt aufgeschrieben
     waeren es zwei Knoepfe, die im selben Feld nebeneinander sitzen und mit
     der Zeit auseinanderdriften. */
  .lupe,
  .loeschen {
    position: absolute;
    top: var(--feld-rand);
    bottom: var(--feld-rand);
    display: grid;
    place-items: center;
    padding: 0;
    border: none;
    background: none;
    color: var(--se-muted);
    cursor: pointer;
    transition: background var(--se-move);
  }
  .lupe { right: var(--feld-rand); width: 30px; }
  /* Das × sitzt LINKS der Lupe (30px breit): nachschlagen ist die Haupt-
     handlung und bleibt am gewohnten Platz am Rand; das Loeschen ist der
     seltenere Griff und weicht nach innen. */
  .loeschen { right: calc(var(--feld-rand) + 30px); width: 24px; }
  .lupe:hover,
  .loeschen:hover { background: var(--se-accent-soft); color: var(--se-ink); }
  .lupe:focus-visible,
  .loeschen:focus-visible { outline: 2px solid var(--se-accent); outline-offset: -2px; }
  /* Im Editor wird gestaltet, nicht ausgefuellt: das Eingabeelement
     nimmt dort keine Bedienung an — dafuer wird der Platzhalter
     anfassbar (Doppelklick = Text im Feld aendern). Ein leerer
     Platzhalter bekommt nur im Editor einen greifbaren Hinweis. */
  :host([data-ff-editor]) .ctrl,
  :host([data-ff-editor]) .loeschen,
  :host([data-ff-editor]) .lupe { pointer-events: none; }
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
  /* Rasterflaeche: das Eingabefeld fuellt seine Zelle in Breite und Hoehe
     (Ziehen macht das FELD groesser). Nur die Text-artigen Felder in der
     .huelle strecken sich; das Ankreuzfeld (.zeile) bleibt 15px. */
  :host([fuellt]) .feld,
  :host([fuellt]) .huelle { height: 100%; }
  :host([fuellt]) .huelle .ctrl { height: 100%; }
`,ur=`ff-dialog-rahmen`,dr=`ff-dialog-schliessen`;function fr(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var K=class extends Le{constructor(...e){super(...e),this.titel=`Dialog`,this.breite=520,this.hoehe=380,this.viewport=!1,this.mitWerkzeug=!1,this.escapeSchliesst=!1,this.escapeRegistriert=!1,this.aufTaste=e=>{e.key===`Escape`&&(e.stopPropagation(),this.schliesse())}}static{this.styles=o`
    :host {
      position: absolute;
      inset: 0;
      display: block;
      font-family: var(--se-font);
      font-size: var(--se-fs);
      color: var(--se-ink);
    }
    /* Ueber der GANZEN Maske statt nur im Elternkasten: das Nachschlage-
       Fenster haengt an einem Formularfeld, das irgendwo in einer Karte
       sitzt — ohne fixed waere es in deren Ausschnitt eingesperrt. */
    :host([viewport]) {
      position: fixed;
      z-index: 2147483646;
    }
    .abdunklung,
    .buehne {
      position: absolute;
      inset: 0;
    }
    .abdunklung { background: var(--se-scrim); }
    .buehne {
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
      overflow: hidden;
      background: var(--se-panel);
      border: 1px solid var(--se-line);
      border-radius: var(--se-r-lg);
      box-shadow: var(--se-shadow-popup);
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
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: var(--se-ink);
      font-size: var(--se-fs);
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .schliessen {
      flex: none;
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: var(--se-r-sm);
      background: none;
      color: var(--se-muted);
      font: inherit;
      font-size: 15px;
      line-height: 1;
      cursor: pointer;
    }
    .schliessen:hover {
      background: var(--se-line-soft);
      color: var(--se-ink);
    }
    .werkzeug {
      display: none;
      flex: none;
      padding: 7px 10px;
      border-bottom: 1px solid var(--se-line-soft);
      background: var(--se-panel-2);
    }
    :host([mit-werkzeug]) .werkzeug { display: block; }
    .inhalt {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }
  `}aktualisiereEscape(){let e=this.isConnected&&this.escapeSchliesst;e!==this.escapeRegistriert&&(e?document.addEventListener(`keydown`,this.aufTaste,!0):document.removeEventListener(`keydown`,this.aufTaste,!0),this.escapeRegistriert=e)}schliesse(){this.dispatchEvent(new CustomEvent(dr,{bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),this.aktualisiereEscape()}updated(e){e.has(`escapeSchliesst`)&&this.aktualisiereEscape()}disconnectedCallback(){this.escapeRegistriert&&=(document.removeEventListener(`keydown`,this.aufTaste,!0),!1),super.disconnectedCallback()}render(){return w`
      <div class="abdunklung"></div>
      <div class="buehne">
        <section
          class="fenster"
          role="dialog"
          aria-modal="true"
          style="width:${fr(this.breite,520)}px;height:${fr(this.hoehe,380)}px"
        >
          <header class="kopf">
            <div class="titel"><slot name="titel">${this.titel}</slot></div>
            <button
              class="schliessen"
              type="button"
              aria-label="Schließen"
              title="Schließen"
              @click=${this.schliesse}
            >✕</button>
          </header>
          <div class="werkzeug"><slot name="werkzeug"></slot></div>
          <div class="inhalt"><slot></slot></div>
        </section>
      </div>
    `}};A([k()],K.prototype,`titel`,void 0),A([k({type:Number})],K.prototype,`breite`,void 0),A([k({type:Number})],K.prototype,`hoehe`,void 0),A([k({type:Boolean,reflect:!0})],K.prototype,`viewport`,void 0),A([k({type:Boolean,reflect:!0,attribute:`mit-werkzeug`})],K.prototype,`mitWerkzeug`,void 0),A([k({type:Boolean,attribute:`escape-schliesst`})],K.prototype,`escapeSchliesst`,void 0),customElements.get(`ff-dialog-rahmen`)||customElements.define(ur,K);function pr(e){return e.trim().toLowerCase().split(/\s+/).filter(e=>e!==``)}function mr(e,t){let n=pr(t);if(n.length===0)return!0;let r=e.join(` `).toLowerCase();return n.every(e=>r.includes(e))}var hr=10;function gr(e,t,n){let r=[];for(let i of e){let e=P(i,t).trim(),a=P(i,n).trim();(e!==``||a!==``)&&r.push({anzeige:e,wert:a,satz:i})}return r}function _r(e,t){return e.filter(e=>mr([e.anzeige,e.wert],t))}function vr(e,t,n,r){return gr(St(e,t).rows,n,r)}function yr(e){if(e.quelleId===``||e.anzeigeFeld===``||e.speicherFeld===``)return{ok:!1,grund:`unvollstaendig`};let t=N(H().FF_DATA_SOURCES,e.quelleId);if(!t)return{ok:!1,grund:`quelleFehlt`};let n=I(H().SEDATA,t.name,t.tableId);return{ok:!0,eintraege:vr(e.el,n,e.anzeigeFeld,e.speicherFeld)}}function br(e,t){return t&&e.length===1?e[0]:null}function xr(e,t){let{rows:n,gefiltert:r}=St(e,[t]);return!r||n.length>0}var Sr=null;function Cr(){Sr?.remove(),Sr=null}function wr(e,t=!1){let n=document.createElement(t?`th`:`td`);return n.textContent=e,n.style.cssText=t?`position:sticky;top:0;z-index:1;padding:6px 10px;text-align:left;font-size:var(--se-fs-sm);font-weight:600;color:var(--se-muted);border-bottom:1px solid var(--se-line);background:var(--se-panel-2)`:`box-sizing:border-box;height:24px;padding:3px 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:1px solid var(--se-line-soft)`,n}function Tr(e,t){let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.setAttribute(`aria-label`,t),n.style.cssText=`box-sizing:border-box;width:26px;height:24px;padding:0;border:1px solid var(--se-line);border-radius:var(--se-r-sm);background:var(--se-panel);color:var(--se-ink);font:inherit;cursor:pointer`,n}function Er(e){let t=yr(e);if(!t.ok){V(t.grund===`unvollstaendig`?`Nachschlagen ist an diesem Feld nicht vollstaendig eingestellt (Quelle, Angezeigt, Gespeichert).`:`Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.`);return}let n=t.eintraege;Cr();let r=document.createElement(ur);r.setAttribute(`data-ff-nachschlagen`,``),r.viewport=!0,r.mitWerkzeug=!0,r.escapeSchliesst=!0,r.titel=e.titel===``?`Nachschlagen`:e.titel,r.breite=520,r.hoehe=380,r.addEventListener(dr,Cr),r.addEventListener(`click`,e=>e.stopPropagation());let i=document.createElement(`input`);i.slot=`werkzeug`,i.type=`search`,i.placeholder=`suchen ...`,i.setAttribute(`aria-label`,`Nachschlagen durchsuchen`),i.style.cssText=`box-sizing:border-box;width:100%;padding:5px 8px;font:inherit;color:inherit;background:var(--se-panel);border:1px solid var(--se-line);border-radius:var(--se-r-sm)`;let a=document.createElement(`table`);a.style.cssText=`width:100%;table-layout:fixed;border-collapse:collapse`;let o=document.createElement(`colgroup`),s=document.createElement(`col`);s.style.width=`65%`;let c=document.createElement(`col`);c.style.width=`35%`,o.append(s,c);let l=document.createElement(`thead`),u=document.createElement(`tr`);u.append(wr(e.anzeigeTitel===``?`Angezeigt`:e.anzeigeTitel,!0),wr(e.speicherTitel===``?`Wert`:e.speicherTitel,!0)),l.appendChild(u);let d=document.createElement(`tbody`);a.append(o,l,d);let f=document.createElement(`div`);f.style.cssText=`flex:1 1 auto;min-height:0;overflow:auto`,f.appendChild(a);let ee=document.createElement(`div`);ee.style.cssText=`box-sizing:border-box;flex:none;display:flex;align-items:center;min-height:33px;padding:4px 10px;border-top:1px solid var(--se-line);background:var(--se-panel-2);font-size:var(--se-fs-sm)`;let te=document.createElement(`span`);te.setAttribute(`aria-live`,`polite`),te.style.cssText=`flex:1;color:var(--se-muted)`;let p=document.createElement(`nav`);p.setAttribute(`aria-label`,`Trefferseiten`),p.style.cssText=`display:flex;align-items:center;gap:6px`;let m=Tr(`‹`,`Vorherige Seite`),ne=document.createElement(`span`);ne.style.cssText=`min-width:48px;text-align:center;color:var(--se-muted)`;let h=Tr(`›`,`Naechste Seite`);p.append(m,ne,h),ee.append(te,p);let g=document.createElement(`div`);g.style.cssText=`box-sizing:border-box;height:100%;min-height:0;display:flex;flex-direction:column`,g.append(f,ee);let _=1,v=1,y=()=>{d.replaceChildren();let t=_r(n,i.value);v=Math.max(1,Math.ceil(t.length/hr)),_=Math.min(_,v);let r=(_-1)*hr,a=t.slice(r,r+hr);if(te.textContent=t.length===0?`0 von 0`:`${r+1}-${Math.min(r+hr,t.length)} von ${t.length}`,ne.textContent=`${_} / ${v}`,m.disabled=_===1,h.disabled=_===v,m.style.opacity=m.disabled?`0.4`:`1`,h.style.opacity=h.disabled?`0.4`:`1`,m.style.cursor=m.disabled?`default`:`pointer`,h.style.cursor=h.disabled?`default`:`pointer`,f.scrollTop=0,a.length===0){let e=document.createElement(`tr`),t=wr(n.length===0?`Diese Quelle hat keine Saetze.`:`Kein Satz passt zur Suche.`);t.colSpan=2,t.style.color=`var(--se-faint)`,t.style.fontSize=`var(--se-fs-sm)`,t.style.padding=`16px 10px`,e.appendChild(t),d.appendChild(e);return}for(let t of a){let n=document.createElement(`tr`);n.tabIndex=0,n.style.cursor=`pointer`;let r=wr(t.anzeige),i=wr(t.wert);i.style.fontFamily=`var(--se-mono)`,i.style.color=`var(--se-muted)`,n.append(r,i);let a=()=>{Cr(),e.onUebernehmen(t.anzeige,t.wert,t.satz)};n.addEventListener(`click`,a),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),a())}),n.addEventListener(`mouseenter`,()=>{n.style.background=`var(--se-accent-soft)`}),n.addEventListener(`mouseleave`,()=>{n.style.background=``}),d.appendChild(n)}};i.addEventListener(`input`,()=>{_=1,y()}),m.addEventListener(`click`,()=>{_!==1&&(--_,y())}),h.addEventListener(`click`,()=>{_!==v&&(_+=1,y())}),y(),r.append(i,g),document.body.appendChild(r),Sr=r,r.updateComplete.then(()=>{r.isConnected&&i.focus()})}var Dr=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`,`nachschlagen`];function Or(e){return Dr.includes(e)?e:`text`}var kr=[`text`,`number`,`textarea`,`select`,`nachschlagen`],q=class extends j{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``,this.nachschlagQuelle=``,this.anzeigeFeld=``,this.anzeigeTitel=``,this.speicherFeld=``,this.speicherTitel=``,this.einzigerTreffer=`nein`,this.anzeige=``,this.satz=void 0,this.angehakt=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource={wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`}}}static{this.kannAuswahlFolgen=!0}static{this.satzWahl={quelleProp:`nachschlagQuelle`,wenn:{attributeName:`fieldType`,equals:`nachschlagen`}}}static{this.bindableSpots=[{prop:`value`,label:`Wert`,wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`},vorschauProp:`placeholder`}]}static{this.actionValueSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``,nachschlagQuelle:``,anzeigeFeld:``,anzeigeTitel:``,speicherFeld:``,speicherTitel:``,einzigerTreffer:`nein`}}static{this.raster={startW:6,startH:2,minW:2,minH:2}}static{this.customProperties=Hn}static{this.styles=[j.styles,lr]}onInput(e){let t=e.target;this.value=Or(this.fieldType)===`date`?tr(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return w`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){this.hasAttribute(`data-ff-editor`)||this.setzeHaken(!this.angehakt)}setzeHaken(e){this.angehakt!==e&&(this.angehakt=e,this.dispatchEvent(new Event(`change`)))}controlTpl(e){switch(e){case`textarea`:return w`<textarea class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``),t=this.value!==``&&!e.includes(this.value);return w`<select class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}>
          <option value="" disabled hidden></option>
          ${t?w`<option value=${this.value} hidden>${this.value}</option>`:D}
          ${e.length===0?w`<option disabled>(keine Optionen)</option>`:e.map(e=>w`<option value=${e}>${e}</option>`)}
        </select>`}case`nachschlagen`:{let e=this.anzeige!==``||this.value!==``;return w`<div class="nachschlag${e?` mit-loeschen`:``}">
          <input class="ctrl" type="text" readonly .value=${this.anzeige} />
          ${e?w`<button
            class="loeschen"
            type="button"
            aria-label="Wert löschen"
            title="Wert löschen"
            @click=${this.onLoeschen}
          ><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
            <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
          </svg></button>`:D}
          <button
            class="lupe"
            type="button"
            aria-label="Nachschlagen"
            title="Nachschlagen"
            @click=${this.onLupe}
          ><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
            <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
          </svg></button>
        </div>`}default:return w`<input
          class="ctrl"
          type=${e}
          .value=${e===`date`?er(this.value):this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`}}onLupe(){this.hasAttribute(`data-ff-editor`)||Er({el:this,quelleId:this.nachschlagQuelle,anzeigeFeld:this.anzeigeFeld,speicherFeld:this.speicherFeld,anzeigeTitel:this.anzeigeTitel,speicherTitel:this.speicherTitel,titel:this.placeholder,onUebernehmen:(e,t,n)=>{this.uebernimmSatz(e,t,n),this.dispatchEvent(new Event(`change`))}})}leereNachschlagen(){this.satz=void 0,this.anzeige=``,this.value=``,yt(R(this))}uebernimmSatz(e,t,n){this.anzeige=e===``?t:e,this.value=t,this.satz=n,vt(R(this),n)}onLoeschen(){this.hasAttribute(`data-ff-editor`)||(this.leereNachschlagen(),this.dispatchEvent(new Event(`change`)))}pruefeEigenenWert(){Or(this.fieldType)===`nachschlagen`&&(this.satz!==void 0&&!xr(this,this.satz)&&this.leereNachschlagen(),this.uebernimmEinzigenTreffer())}uebernimmEinzigenTreffer(){if(this.einzigerTreffer!==`ja`)return;let e=yr({el:this,quelleId:this.nachschlagQuelle,anzeigeFeld:this.anzeigeFeld,speicherFeld:this.speicherFeld});if(!e.ok)return;let t=br(e.eintraege,this.satz===void 0);t&&this.uebernimmSatz(t.anzeige,t.wert,t.satz)}render(){let e=Or(this.fieldType);if(e===`checkbox`)return w`<div class="feld">
        <div class="zeile">
          <input
            class="ctrl"
            type="checkbox"
            .checked=${this.angehakt}
            @change=${e=>this.setzeHaken(e.target.checked)}
          />
          ${this.textTpl(`text`)}
        </div>
      </div>`;let t=e!==`nachschlagen`;return w`<div class="feld">
      <div
        class="huelle"
        data-ff-spot=${t?`value`:D}
        ?data-ff-bound=${t&&this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${kr.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this.value!==``):D}
      </div>
    </div>`}connectedCallback(){super.connectedCallback(),sr(this)}disconnectedCallback(){super.disconnectedCallback(),cr(this)}};A([k()],q.prototype,`fieldType`,void 0),A([k()],q.prototype,`placeholder`,void 0),A([k()],q.prototype,`options`,void 0),A([k()],q.prototype,`source`,void 0),A([k()],q.prototype,`value`,void 0),A([k()],q.prototype,`valueField`,void 0),A([k()],q.prototype,`nachschlagQuelle`,void 0),A([k()],q.prototype,`anzeigeFeld`,void 0),A([k()],q.prototype,`anzeigeTitel`,void 0),A([k()],q.prototype,`speicherFeld`,void 0),A([k()],q.prototype,`speicherTitel`,void 0),A([k()],q.prototype,`einzigerTreffer`,void 0),A([Ve()],q.prototype,`anzeige`,void 0),A([Ve()],q.prototype,`angehakt`,void 0),j.defineAndRegister(q);function Ar(e,t,n,r){return{attributeName:e,name:t,description:n,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var J=class extends j{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[G.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[Dn(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),Ar(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte landen sie in der ersten Spalte.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[j.styles,o`
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
        /* Die Spalte ist die unterste Ebene der drei: sie TRAEGT die Karten,
           also darf sie sich nur andeuten. Ohne jeden Schatten laege sie
           auf derselben Hoehe wie ihre Karten (2026-07-30). */
        box-shadow: var(--se-shadow-ruhe);
      }
      .col.v-info { --col-strong: var(--se-blue); --col-soft: var(--se-blue-soft); --col-shell: var(--se-blue-shell); --col-line: var(--se-blue-line); }
      .col.v-success { --col-strong: var(--se-green); --col-soft: var(--se-green-soft); --col-shell: var(--se-green-shell); --col-line: var(--se-green-line); }
      .col.v-warning { --col-strong: var(--se-amber); --col-soft: var(--se-amber-soft); --col-shell: var(--se-amber-shell); --col-line: var(--se-amber-line); }
      .col.v-danger { --col-strong: var(--se-red); --col-soft: var(--se-red-soft); --col-shell: var(--se-red-shell); --col-line: var(--se-red-line); }
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return w`<div class="col v-${En(this.variant)}">
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
    </div>`}};A([k()],J.prototype,`variant`,void 0),A([k()],J.prototype,`heading`,void 0),A([Ve()],J.prototype,`_count`,void 0),j.defineAndRegister(J);function jr(e,t,n){return t===``||n===``?[...e]:e.filter(e=>Mn(P(e,t))===n)}function Mr(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function Nr(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var Pr=new WeakMap,Fr=J.tagName,Ir=G.tagName;function Lr(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Fr)}function Rr(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Ir)}function zr(e){return We().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function Br(e){X?.board===e&&(X=null);let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=N(H().FF_DATA_SOURCES,t);if(!r)return;let i=Lr(e);if(i.length===0)return;let a=Pr.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(Ir);t&&(a=t.cloneNode(!0),Pr.set(e,a))}if(!a)return;let o=jr(I(H().SEDATA,r.name,r.tableId),e.getAttribute(`tagfield`)??``,Ln()),s=i.map(e=>e.getAttribute(`heading`)??J.defaultProps.heading),c=zr(a.tagName),l=Nr(i.map(e=>e.getAttribute(`auffang`))),u=Xn(e);for(let e of i)Rr(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:Mr(P(e,n),s);(o>=0?i[o]:l>=0?i[l]:i[0]).appendChild(t);for(let n of c){let r=t.getAttribute(Un(n.prop))??``;r!==``&&(t[n.prop]=u(e,r))}let d=r.indexField===``?``:P(e,r.indexField);Y.set(t,{row:e,pindex:d}),t.draggable=!0}let d=i.flatMap(Rr),f=gt(R(e),d,e=>Y.get(e)?.row);for(let e of f)d[e].setAttribute(`data-ff-auswahl`,``)}var Y=new WeakMap,X=null,Vr=new WeakSet;function Hr(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===Fr&&e.contains(n))return n;return null}function Ur(e,t){if(!X||X.board!==e)return;let n=Y.get(X.card);if(!n)return;let r=t.getAttribute(`heading`)??``;xn(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r}).catch(bn)}function Wr(e){Vr.has(e)||(Vr.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Y.has(e))??null;if(!n)return;let r=Y.get(n);r&&_t(R(e),r.row),xn(e,`onCardClick`,{PINDEX:r?.pindex??``}).catch(bn)}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Y.has(e))??null;n&&(X={card:n,board:e},t.dataTransfer?.setData(`text/plain`,Y.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{X=null}),e.addEventListener(`dragover`,t=>{let n=Hr(e,t);X?.board===e&&n&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=Hr(e,t);n&&(t.preventDefault(),Ur(e,n),X=null)}))}var Gr=Gn({hydriere:Br,verdrahte:Wr}),Kr=Gr.connect,qr=Gr.disconnect,Jr=J.blockType,Yr=class extends j{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[Jr]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:Jr}}static{this.templateChild={type:G.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``,tagField:``}}static{this.raster={startW:24,startH:20,minW:6,minH:8}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,kind:`field`},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt das Board nur Einträge des Tages, den der Tageswähler zeigt. Leer = alle Einträge.`,kind:`field`}]}static{this.defaultChildren=[{type:Jr,props:{heading:`Offen`,variant:`warning`},children:[{type:G.blockType}]},{type:Jr,props:{heading:`In Arbeit`,variant:`info`}},{type:Jr,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[j.styles,o`
      /* K0/Entscheidung A: ALLE Spalten sind IMMER nebeneinander sichtbar —
         kein Umbruch in die naechste Zeile, kein horizontaler Scroll,
         keine Mindestbreite. Die Spalten teilen sich die Zeile gleichmäßig
         (lockedWidth 'fill' der Spalte: flex-basis 0 + min-width 0) und
         werden gleich hoch (stretch); Karten scrollen senkrecht IM
         Spaltenrumpf. min-width:0 am Host erlaubt dem Board, in
         Zeilen-Bereichen schmaler zu werden als sein Inhalt. */
      /* height:100% laesst das Board eine feste Hoehe ausfuellen —
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
    `]}render(){return w`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Kr(this)}disconnectedCallback(){super.disconnectedCallback(),qr(this)}};j.defineAndRegister(Yr);var Xr={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Zr=e=>(...t)=>({_$litDirective$:e,values:t}),Qr=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},$r=`important`,ei=` !important`,ti=Zr(class extends Qr{constructor(e){if(super(e),e.type!==Xr.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(ei);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?$r:``):n[e]=r}}return E}}),ni=[10,25,50],ri=`passend`,ii=ni[0];function ai(e){let t=Number(e);return ni.some(e=>e===t)?t:null}function oi(e,t){return Math.max(1,Math.floor((e-t)/32))}function si({sichtbar:e,hatQuelle:t,proSeite:n,wunschSeite:r,platzhalterZeilen:i}){let a=t?Math.max(1,Math.ceil(e.length/n)):1,o=Math.min(Math.max(r,0),a-1);return t?{seiten:a,seite:o,zeilen:[...e.slice(o*n,(o+1)*n)]}:{seiten:a,seite:o,zeilen:Array.from({length:i},()=>null)}}function ci(e){if(!e.hasAttribute(`fuellt`))return null;let t=e.renderRoot.querySelector(`.koerper`),n=e.renderRoot.querySelector(`.kopf`);return!(t instanceof HTMLElement)||!(n instanceof HTMLElement)?null:oi(t.clientHeight,n.offsetHeight)}function li(e,t){if(typeof ResizeObserver>`u`)return null;let n=e.renderRoot.querySelector(`.koerper`);if(!n)return null;let r=new ResizeObserver(t);return r.observe(n),r}var ui=`Spalte {n}`;function Z(e){return ui.replace(`{n}`,String(e+1))}function di(){return[0,1,2].map(e=>({titel:Z(e),feld:``}))}function fi(e,t){if(e&&typeof e==`object`){let n=e;return{titel:typeof n.titel==`string`?n.titel:Z(t),feld:typeof n.feld==`string`?n.feld:``}}return typeof e==`string`?{titel:e,feld:``}:{titel:Z(t),feld:``}}function pi(e){let t;if(Array.isArray(e))t=e.map((e,t)=>fi(e,t));else if(typeof e==`number`&&Number.isFinite(e)||typeof e==`string`&&/^\d+$/.test(e)){let n=Math.max(1,Math.floor(Number(e)));t=[...Array(n).keys()].map(e=>({titel:Z(e),feld:``}))}else t=di();return t.length>8&&(t=t.slice(0,8)),t.length<1&&(t=[{titel:Z(0),feld:``}]),t}function mi(e){try{return pi(JSON.parse(e))}catch{return di()}}function hi(e){return mi(e.getAttribute(`spalten`)??``).map(e=>e.feld)}function gi(e){let t=e.getAttribute(`source`)??``;if(t===``){e.datenzeilen=[];return}let n=N(H().FF_DATA_SOURCES,t);if(!n){e.datenzeilen=[];return}let r=hi(e),{rows:i,gefiltert:a}=St(e,jr(I(H().SEDATA,n.name,n.tableId),e.getAttribute(`tagfield`)??``,Ln())),o=gt(R(e),i,e=>e)[0]??-1,s=Xn(e);e.rohzeilen=i,e.auswahlIndex=o,e.durchAuswahlGefiltert=a,e.datenzeilen=i.map(e=>r.map(t=>t===``?``:s(e,t)))}var _i=Gn({hydriere:gi}),vi=_i.connect,yi=_i.disconnect,bi=1,xi=/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/,Si=/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/,Ci=/^(\d{4})-(\d{2})-(\d{2})$/;function wi(e){let t=e.trim();if(t===``||!xi.test(t))return null;let n=t.includes(`,`)?t.replace(/\./g,``).replace(`,`,`.`):/^-?\d{1,3}(\.\d{3})+$/.test(t)?t.replace(/\./g,``):t,r=Number(n);return Number.isFinite(r)?r:null}function Ti(e){let t=e.trim();if(t===``)return null;let n=Ci.exec(t);if(n){let[,e,t,r]=n;return Ei(Number(e),Number(t),Number(r))}let r=Si.exec(t);if(r){let[,e,t,n]=r,i=Number(n);return Ei(n.length===2?i<=69?2e3+i:1900+i:i,Number(t),Number(e))}return null}function Ei(e,t,n){if(t<1||t>12||n<1||n>31)return null;let r=new Date(e,t-1,n);return r.getFullYear()!==e||r.getMonth()!==t-1||r.getDate()!==n?null:r.getTime()}function Di(e){let t=0,n=0,r=0;for(let i of e)i.trim()!==``&&(t++,wi(i)!==null&&n++,Ti(i)!==null&&r++);return t===0?`text`:r===t?`datum`:n===t?`zahl`:`text`}var Oi=new Intl.Collator(`de`,{numeric:!0,sensitivity:`base`});function ki(e,t,n){if(t<0||e.length===0)return e.map((e,t)=>t);let r=n=>e[n][t]??``,i=Di(e.map(e=>e[t]??``)),a=n?1:-1;return e.map((e,t)=>t).sort((e,t)=>{let n=r(e).trim(),o=r(t).trim();if(n===``&&o===``)return e-t;if(n===``)return bi;if(o===``)return-1;let s=i===`zahl`?(wi(n)??0)-(wi(o)??0):i===`datum`?(Ti(n)??0)-(Ti(o)??0):Oi.compare(n,o);return s===0?e-t:s*a})}function Ai(e,t,n){return w`<div class="steuerung">
    <button
      title="Letzte Spalte entfernen"
      @pointerdown=${n}
      @click=${r=>{n(r);let i=e();i.length>1&&(i.pop(),t(i))}}
    >−</button>
    <button
      title="Spalte hinzufügen"
      @pointerdown=${n}
      @click=${r=>{n(r);let i=e();i.length<8&&(i.push({titel:Z(i.length),feld:``}),t(i))}}
    >+</button>
  </div>`}function ji(e,t){let n=e.currentTarget;if(!n)return;e.stopPropagation(),e.preventDefault();let r=Array.from(n.childNodes),i=n.textContent??``;n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let a=window.getSelection(),o=document.createRange();o.selectNodeContents(n),a?.removeAllRanges(),a?.addRange(o);let s=!1,c=e=>{if(s)return;s=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,l),n.removeEventListener(`keydown`,u);let a=(n.textContent??``).trim();e&&a&&a!==i.trim()?t(a):n.replaceChildren(...r)},l=()=>c(!0),u=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),c(!1))};n.addEventListener(`blur`,l),n.addEventListener(`keydown`,u)}function Mi(e,t){let n=[];return e.forEach((e,r)=>{mr(e,t)&&n.push(r)}),n}function Ni(e,t){return!e&&t.trim()!==``}function Pi(e){if(!e.hatQuelle)return`— Datensätze`;let t=e.auswahlAktiv?` · durch Auswahl gefiltert`:``,n=e=>e===1?`Datensatz`:`Datensätze`,r=e=>e===1?`Datensatz`:`Datensätzen`;return e.suchtAktiv?e.sichtbar===0?`Kein Treffer von ${e.gesamt} ${r(e.gesamt)}`+t:`${e.sichtbar} von ${e.gesamt} ${r(e.gesamt)}`+t:(e.gesamt===0?`Keine Datensätze`:`${e.gesamt} ${n(e.gesamt)}`)+t}var Fi=[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],Ii=[{attributeName:`suche`,name:`Suchzeile`,description:`Zeigt ueber der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.`,kind:`segment`,options:Fi,requiresDataSource:!0},{attributeName:`zeilenWaehler`,name:`Zeilen-Wähler`,description:`Zeigt dem Bediener unten in der Maske den Wähler „Zeilen pro Seite" — er darf die Einstellung dann für seine Sitzung übersteuern. Nein: es gilt unveränderlich, was hier im Editor eingestellt ist.`,kind:`segment`,options:Fi,requiresDataSource:!0},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Saetze des Tages, den der Tageswaehler zeigt. Leer = alle Saetze.`,kind:`field`}];function Li(e,t){return w`<div class="fusszeile">
    <div class="seiten-info">${Pi({hatQuelle:e.hatQuelle,sichtbar:e.sichtbar,gesamt:e.gesamt,suchtAktiv:e.suchtAktiv,auswahlAktiv:e.auswahlAktiv})}</div>
    <div class="seiten-nav">
      ${e.zeigeWaehler?w`<select
        aria-label="Zeilen pro Seite"
        @pointerdown=${t.stop}
        @change=${e=>t.waehleProSeite(e.target.value)}
      >
        <!-- „Passend zur Hoehe" ist der Standard: die Tabelle zeigt so viele
             Zeilen, wie in ihre Hoehe passen — kein Scrollen bei einer hohen
             Tabelle, kein leerer Rest bei einer flachen. Die festen Zahlen
             sind die bewusste Uebersteuerung; wer sie waehlt, nimmt das
             Scrollen in Kauf. Im EDITOR schreibt diese Wahl den Bauplan, in
             der MASKE gilt sie nur fuer diese Sitzung. -->
        <option value=${ri} ?selected=${e.einstellung===ri}>passend zur Höhe</option>
        ${ni.map(t=>w`<option value=${t} ?selected=${e.einstellung===String(t)}>${t} pro Seite</option>`)}
      </select>`:D}
      <button
        aria-label="Seite zurück"
        ?disabled=${e.seite<=0}
        @click=${()=>t.blaettere(e.seite-1)}
      >‹</button>
      <span>Seite ${e.seite+1} von ${e.seiten}</span>
      <button
        aria-label="Seite vor"
        ?disabled=${e.seite>=e.seiten-1}
        @click=${()=>t.blaettere(e.seite+1)}
      >›</button>
    </div>
  </div>`}var Ri=o`
      :host { min-width: 0; height: 100%; }
      /* --zeilen-hoehe ist der Takt der Tabelle. Die ZAHL steht nicht mehr
         hier, sondern in ./seitengroesse (ZEILEN_HOEHE) — der Baustein setzt
         sie beim Zeichnen als Variable. Grund (2026-08-06): seit die Tabelle
         ihre Zeilenzahl aus der eigenen Hoehe RECHNET, brauchen Optik und
         Rechnung denselben Wert. Zwei Stellen hiessen: beim naechsten
         Feinschliff rechnet die Seitengroesse still falsch.
         Vorgegeben (nicht aus Schrift + Innenabstand geschaetzt) bleibt er
         weiterhin: ein geschaetzter Wert lief hier schon 4,25px je Zeile aus
         dem Takt und sah nach vier Zeilen krumm aus (Nutzer 2026-07-25). */
      .tabelle {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-lg);
        overflow: hidden;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
        box-shadow: var(--se-shadow-ruhe);
      }
      /* Suchzeile ueber dem Kopf: gehoert zur Tabelle, nicht zur Maske
         drumherum — deshalb sitzt sie INNERHALB des Rahmens. */
      .suchzeile {
        padding: 5px 8px;
        border-bottom: 1px solid var(--se-line);
        background: var(--se-panel-2);
      }
      .suchzeile input {
        box-sizing: border-box;
        /* NICHT ueber die ganze Breite (Nutzer 2026-07-25): ein Suchfeld,
           das die volle Tabellenbreite einnimmt, sieht aus wie ein
           Eingabefeld der Maske statt wie eine Suche. Ausserdem braucht die
           Editor-Steuerung (+/−) rechts daneben Platz, sonst liegt sie auf
           dem Feld. Schmal genug, um als Suche gelesen zu werden, breit
           genug fuer einen Suchbegriff. */
        width: 100%;
        max-width: 15rem;
        height: 24px;
        padding: 0 8px;
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        color: var(--se-ink);
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
      }
      .suchzeile input:focus {
        outline: none;
        border-color: var(--se-accent);
      }
      /* Kopf und Zeilen tragen DIESELBE feste Hoehe — daraus entsteht der
         gleichmaessige Takt, den man als sauberes Lineal wahrnimmt. */
      .kopf,
      .zeile {
        display: grid;
        height: var(--zeilen-hoehe);
        box-sizing: border-box;
      }
      /* Die Kopfzeile sitzt IM scrollenden Rumpf und klebt dort oben fest.
         Grund (Nutzer-Meldung 2026-07-27, zweiter Anlauf): stand sie
         ausserhalb, war sie um die Scrollleiste BREITER als die Zeilen
         darunter — ihre Spaltentrenner liefen um 3,75px, 7,5px, 11,25px
         aus der Flucht, wachsend nach rechts. Im selben Kasten koennen
         Kopf, Zeilen und Lineal gar nicht mehr verschieden breit sein.
         Der sichtbare Nebeneffekt ist erwuenscht: die Ueberschriften
         bleiben beim Scrollen stehen.
         Die Flaeche MUSS deckend sein, sonst scheinen Zeilen durch. */
      .kopf {
        position: sticky;
        top: 0;
        z-index: 1;
        flex: none;
        background: var(--se-panel-2);
        border-bottom: 1px solid var(--se-line);
        font-size: var(--se-fs-sm);
        font-weight: 600;
      }
      /* Der Rumpf fuellt die Bausteinhoehe. Bleibt unter den Zeilen Platz
         (die Tabelle ist im Raster hoeher als ihre Zeilen brauchen), lief
         dort vorher eine leere weisse Flaeche — sah aus wie ein Fehler.
         Jetzt zeichnet ein sich wiederholender Verlauf die Zeilenlinien
         einfach weiter, im selben Takt wie echte Zeilen. Kein Inhalt wird
         erfunden (Regel 7), nur das Lineal laeuft durch. */
      .koerper {
        flex: 1 1 auto;
        overflow: auto;
        display: flex;
        flex-direction: column;
      }
      /* Zeilen behalten ihre feste Hoehe, auch als Flex-Kinder: ohne
         flex:none wuerden sie zusammengedrueckt, sobald der Rumpf zu klein
         wird — der Zeilentakt waere dahin. */
      .koerper > .zeile { flex: none; }
      /* Das LINEAL im Leerraum unter der letzten Zeile: ein eigenes Element
         statt eines Hintergrunds auf dem Rumpf.
         Grund (Nutzer-Meldung 2026-07-27, senkrechte Linien versetzt): der
         Rumpf scrollt. Sobald Datensaetze drin sind, erscheint die
         Scrollleiste und die Zeilen werden in der SCHMALEREN Restbreite
         gezeichnet — ein Hintergrund auf dem Rumpf rechnet seine
         Spaltenbreite aber weiter aus der vollen Breite samt
         Scrollleisten-Streifen. Der Versatz wuchs nach rechts (bei 15px
         Leiste und drei Spalten: 5px, 10px).
         Als eigenes Kind hat das Lineal EXAKT die Breite der Zeilen — mit
         und ohne Scrollleiste. Es kann sich gar nicht mehr verrechnen. */
      .lineal {
        flex: 1 1 auto;
        min-height: 0;
        /* ZWEI Lagen, sonst sieht der leere Rest kaputt aus: nur Querstriche
           ohne Spaltentrenner wirkt wie eine abgebrochene Tabelle.
           1. waagerecht im Zeilentakt, 2. senkrecht im Spaltentakt
           (--spalten-zahl setzt der Baustein beim Zeichnen). */
        background-image:
          repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(var(--zeilen-hoehe) - 1px),
            var(--se-line-soft) calc(var(--zeilen-hoehe) - 1px),
            var(--se-line-soft) var(--zeilen-hoehe)
          ),
          repeating-linear-gradient(
            to right,
            transparent 0,
            transparent calc(100% / var(--spalten-zahl) - 1px),
            var(--se-line-soft) calc(100% / var(--spalten-zahl) - 1px),
            var(--se-line-soft) calc(100% / var(--spalten-zahl))
          );
        background-position: 0 0;
      }
      /* Echte Zeilen decken den Verlauf ab -> keine doppelte Linie. */
      .zeile {
        border-bottom: 1px solid var(--se-line-soft);
        background: var(--se-panel);
        transition: background-color var(--se-move);
      }
      /* Die Zeile unter dem Zeiger hinterlegt sich (2026-07-30). In einer
         dichten Liste ist das kein Schmuck: es zeigt, WELCHE Zeile man
         gleich anklickt — bei 32px Zeilenhoehe verrutscht man sonst leicht
         um eine. Der Kopf ist ausgenommen, er ist keine Datenzeile. */
      .koerper > .zeile:hover {
        background: var(--se-panel-2);
      }
      /* Waehlbare Zeile (nur Laufzeit mit echten Daten, Klasse setzt der
         Baustein): der Zeiger sagt „hier passiert etwas". */
      .koerper > .zeile.waehlbar { cursor: pointer; }
      /* Die GEWAEHLTE Zeile (2026-08-05): getoente Akzentflaeche + kraeftiger
         Balken an der linken Kante — kantig, eindeutig, dieselbe Handschrift
         wie der Rest der Maske. inset-Schatten statt Rahmen, damit die
         Spaltenbreiten keinen Pixel verrutschen. Der Text wird voll lesbar
         (--se-ink statt --se-muted): die gewaehlte Zeile ist die, mit der
         der Bediener gerade arbeitet. */
      .zeile.gewaehlt,
      .koerper > .zeile.gewaehlt:hover {
        background: var(--se-accent-soft);
        box-shadow: inset 3px 0 0 var(--se-accent);
      }
      .zeile.gewaehlt > div { color: var(--se-ink); }
      .kopf > div,
      .zeile > div {
        /* KEIN senkrechter Innenabstand: die Zeilenhoehe steht fest, der
           Text wird ueber line-height darin zentriert. So bleibt die Hoehe
           unabhaengig von der Schriftgroesse exakt im Takt — und die
           Textkuerzung mit „…" funktioniert weiter (das braucht einen
           Block, kein Flex). */
        padding: 0 10px;
        line-height: calc(var(--zeilen-hoehe) - 1px);
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-right: 1px solid var(--se-line-soft);
      }
      .kopf > div:last-child,
      .zeile > div:last-child { border-right: none; }
      .kopf > div { cursor: pointer; user-select: none; }
      .sort-pfeil { font-size: 9px; color: var(--se-muted); }
      .zeile > div { color: var(--se-muted); }
      .fusszeile {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 10px;
        border-top: 1px solid var(--se-line);
        font-size: var(--se-fs-sm);
        color: var(--se-muted);
        background: var(--se-panel-2);
      }
      .seiten-nav {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .seiten-nav select,
      .seiten-nav button {
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        padding: 2px 6px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-ink);
        cursor: pointer;
      }
      .seiten-nav button:disabled {
        opacity: 0.3;
        cursor: default;
      }
      /* Editor-only Spalten-Steuerung — NUR auf der Maskenfläche, nie im Export. */
      .steuerung { display: none; }
      :host([data-ff-editor]) .steuerung {
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 2;
        display: inline-flex;
        gap: 4px;
      }
      .steuerung button {
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        line-height: 1;
        padding: 3px 7px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-muted);
        cursor: pointer;
      }
      .steuerung button:hover {
        border-color: var(--se-accent);
        color: var(--se-accent);
      }
`,zi=4,Bi=220,Q=class e extends j{constructor(...e){super(...e),this.spalten=di(),this.source=``,this.suche=`ja`,this.proSeite=ri,this.zeilenWaehler=`nein`,this._suchtext=``,this.datenzeilen=[],this.rohzeilen=[],this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._proSeiteWahl=null,this._proSeiteGemessen=null,this._beobachter=null,this._klickTimer=null}static{this.blockType=`tabelle`}static{this.tagName=`ff-tabelle`}static{this.displayName=`Tabelle`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.kannAuswahlFolgen=!0}static{this.listenBindung={prop:`spalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:ui}}static{this.defaultProps={width:`fill`,source:``,spalten:di(),suche:`ja`,tagField:``,proSeite:ri,zeilenWaehler:`nein`}}static{this.customProperties=Ii}static{this.raster={startW:14,startH:8,minW:6,minH:4}}get einstellung(){return this._proSeiteWahl??this.proSeite}get proSeiteAktuell(){return ai(this.einstellung)??this._proSeiteGemessen??ii}waehleProSeite(e){this.hasAttribute(`data-ff-editor`)?this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`proSeite`,value:e},bubbles:!0,composed:!0})):this._proSeiteWahl=e,this._seite=0,this.requestUpdate()}messeRumpf(){let e=ci(this);e!==this._proSeiteGemessen&&(this._proSeiteGemessen=e,this.requestUpdate())}spaltenListe(){return pi(this.spalten)}sichtbareIndizes(){let e=Mi(this.datenzeilen,this._suchtext);return this._sortSpalte<0?e:ki(e.map(e=>this.datenzeilen[e]),this._sortSpalte,this._sortAuf).map(t=>e[t])}klickZeile(e){if(e===null||this.hasAttribute(`data-ff-editor`))return;let t=R(this),n=this.rohzeilen[e];t===``||n===void 0||_t(t,n)}setzeSuchtext(e){this._suchtext=e,this._seite=0,this.requestUpdate()}klickSortiere(e){this.editable||(this._sortSpalte===e?this._sortAuf=!this._sortAuf:(this._sortSpalte=e,this._sortAuf=!0),this._seite=0,this.requestUpdate())}aendere(e){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`spalten`,value:e},bubbles:!0,composed:!0}))}klickSpaltenkopf(t,n){if(!this.editable)return;t.stopPropagation();let r=t.currentTarget.getBoundingClientRect();this.klickTimerAus(),this._klickTimer=setTimeout(()=>{this._klickTimer=null,this.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:e.listenBindung.prop,index:n,top:r.bottom+4,left:r.left},bubbles:!0,composed:!0}))},Bi)}klickTimerAus(){this._klickTimer!==null&&(clearTimeout(this._klickTimer),this._klickTimer=null)}bearbeiteTitel(e,t){this.editable&&ji(e,e=>{let n=this.spaltenListe();t>=n.length||(n[t]={...n[t],titel:e},this.aendere(n))})}beobachte(){this._beobachter||(this._beobachter=li(this,()=>this.messeRumpf()),this._beobachter&&this.messeRumpf())}connectedCallback(){super.connectedCallback(),vi(this),this.beobachte()}firstUpdated(){this.beobachte()}disconnectedCallback(){super.disconnectedCallback(),this.klickTimerAus(),this._beobachter?.disconnect(),this._beobachter=null,yi(this)}static{this.styles=[j.styles,Ri]}render(){let e=this.spaltenListe(),t={gridTemplateColumns:`repeat(${e.length}, minmax(0, 1fr))`},n=e=>e.stopPropagation(),r=this.sichtbareIndizes(),i=Ni(this.hasAttribute(`data-ff-editor`),this.source),a=r.length,o=this.proSeiteAktuell,{seiten:s,seite:c,zeilen:l}=si({sichtbar:r,hatQuelle:i,proSeite:o,wunschSeite:this._seite,platzhalterZeilen:zi});return w`<div class="tabelle" style=${ti({"--spalten-zahl":String(e.length),"--zeilen-hoehe":`32px`})}>
      ${Ai(()=>this.spaltenListe(),e=>this.aendere(e),n)}
      ${this.suche===`ja`?w`<div class="suchzeile">
        <input
          type="search"
          placeholder="Tabelle durchsuchen…"
          aria-label="Tabelle durchsuchen"
          .value=${this._suchtext}
          @pointerdown=${n}
          @input=${e=>this.setzeSuchtext(e.target.value)}
        />
      </div>`:``}
      <div class="koerper">
      <div class="kopf" style=${ti(t)}>
        ${e.map((e,t)=>w`<div
            data-ff-editable
            @dblclick=${e=>{this.klickTimerAus(),this.bearbeiteTitel(e,t)}}
            @click=${e=>{this.klickSpaltenkopf(e,t),this.klickSortiere(t)}}
          >${e.titel}${!this.editable&&this._sortSpalte===t?w`<span class="sort-pfeil">${this._sortAuf?` ▲`:` ▼`}</span>`:``}</div>`)}
      </div>
        ${l.map(n=>w`<div
            class="zeile${n!==null&&i?` waehlbar`:``}${n!==null&&n===this.auswahlIndex?` gewaehlt`:``}"
            style=${ti(t)}
            @click=${()=>this.klickZeile(n)}
          >
            ${n===null?e.map(()=>w`<div>—</div>`):(this.datenzeilen[n]??[]).map(e=>w`<div>${e}</div>`)}
          </div>`)}
        <div class="lineal"></div>
      </div>
      ${Li({hatQuelle:i,sichtbar:a,gesamt:this.datenzeilen.length,suchtAktiv:this._suchtext.trim()!==``,auswahlAktiv:this.durchAuswahlGefiltert,zeigeWaehler:this.hasAttribute(`data-ff-editor`)||this.zeilenWaehler===`ja`,einstellung:this.einstellung,seite:c,seiten:s},{waehleProSeite:e=>this.waehleProSeite(e),blaettere:e=>{this._seite=e,this.requestUpdate()},stop:n})}
    </div>`}};A([k({converter:{fromAttribute:e=>e?mi(e):di(),toAttribute:e=>JSON.stringify(e)}})],Q.prototype,`spalten`,void 0),A([k()],Q.prototype,`source`,void 0),A([k()],Q.prototype,`suche`,void 0),A([k()],Q.prototype,`proSeite`,void 0),A([k()],Q.prototype,`zeilenWaehler`,void 0),A([k({attribute:!1})],Q.prototype,`datenzeilen`,void 0),A([k({attribute:!1})],Q.prototype,`rohzeilen`,void 0),A([k({attribute:!1})],Q.prototype,`auswahlIndex`,void 0),A([k({attribute:!1})],Q.prototype,`durchAuswahlGefiltert`,void 0),j.defineAndRegister(Q);var Vi=Un(`text`);function Hi(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(Vi)??``;return t===``||n===``?void 0:{sourceId:t,code:n}}function Ui(e){let t=Zn(e,Vi);t.art!==`ungebunden`&&(e.text=t.art===`wert`?t.wert:``)}function Wi(e){Hi(e)&&(e.text=``)}var Gi=Gn({hydriere:Ui,verdrahte:Wi}),Ki=Gi.connect,qi=Gi.disconnect,Ji=6,Yi=96,Xi=14,Zi={duenn:`300`,normal:`400`,fett:`700`},Qi={links:`left`,mitte:`center`,rechts:`right`},$i={standard:`var(--se-ink)`,gedaempft:`var(--se-muted)`,akzent:`var(--se-accent)`,erfolg:`var(--se-green)`,warnung:`var(--se-amber)`,fehler:`var(--se-red)`},ea=`standard`;function ta(e){if(e===`ueberschrift`)return 15;if(e===`klein`)return 12;let t=typeof e==`number`?e:Number.parseFloat(String(e??``));return Number.isFinite(t)?Math.min(Yi,Math.max(Ji,t)):Xi}function na(e){return typeof e==`string`&&e in Zi?e:`normal`}function ra(e){return typeof e==`string`&&e in Qi?e:`links`}function ia(e){return typeof e==`string`&&e in $i?e:ea}var $=class extends j{constructor(...e){super(...e),this.groesse=Xi,this.gewicht=`normal`,this.ausrichtung=`links`,this.farbe=ea,this.text=`Text`,this.source=``,this.textField=``}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Text`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.kannAuswahlFolgen=!0}static{this.bindableSpots=[{prop:`text`,label:`Text`}]}static{this.defaultProps={width:`fill`,groesse:Xi,gewicht:`normal`,ausrichtung:`links`,farbe:ea,text:`Text`,source:``,textField:``}}static{this.raster={startW:6,startH:2,minW:1,minH:1}}static{this.customProperties=[{attributeName:`groesse`,name:`Größe`,description:`Schriftgröße in Pixeln.`,kind:`number`,unit:`px`,min:Ji,max:Yi,inspectorRow:`Text-Stil`},{attributeName:`gewicht`,name:`Gewicht`,description:`Strichstärke der Schrift.`,kind:`segment`,options:[{value:`duenn`,label:`Dünn`},{value:`normal`,label:`Normal`},{value:`fett`,label:`Fett`}],inspectorRow:`Text-Stil`},{attributeName:`ausrichtung`,name:`Ausrichtung`,description:`Wo der Text in seiner Breite sitzt.`,kind:`segment`,options:[{value:`links`,label:`Links`},{value:`mitte`,label:`Mitte`},{value:`rechts`,label:`Rechts`}],inspectorRow:`Text-Stil`},{attributeName:`farbe`,name:`Farbe`,description:`Textfarbe aus den Farben der Maske.`,kind:`select`,options:[{value:`standard`,label:`Standard`},{value:`gedaempft`,label:`Gedämpft`},{value:`akzent`,label:`Akzent`},{value:`erfolg`,label:`Erfolg`},{value:`warnung`,label:`Warnung`},{value:`fehler`,label:`Fehler`}]}]}static{this.styles=[j.styles,o`
      .text {
        font-family: var(--se-font);
        /* Farbe kommt als Inline-Stil aus FARBEN (styleMap) — hier steht nur
           der Ausgangswert, damit die Stelle auch ohne gesetzte Prop Text
           in der Haus-Textfarbe zeigt. */
        color: var(--se-ink);
        /* EINE Zeilenhoehe fuer beides: die Zeile des gesetzten Textes UND die
           Hoehe, die ein leerer Text freihaelt (s. unten). Zwei getrennte
           Zahlen liefen beim naechsten Nachstellen auseinander. */
        --text-zeilenhoehe: 1.35;
        line-height: var(--text-zeilenhoehe);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      /* Ein LEERER Text hat kein Zeilenfeld: in der Maske klappte er auf Hoehe
         0 zusammen — der Baustein war unsichtbar und das Layout sprang, sobald
         ein gebundener Text ohne Auswahl leer blieb (SE-Echttest 2026-08-04).
         Er haelt jetzt immer genau EINE Zeile frei. Relativ gerechnet
         (Schriftgroesse x Zeilenhoehe), damit die Luecke mit jeder frei
         eingestellten Groesse mitwaechst statt an einer Pixelzahl zu kleben. */
      .text:empty { min-height: calc(1em * var(--text-zeilenhoehe)); }
      /* Leerer Text bleibt im Editor ein greifbares Klick-Ziel (Regel 7:
         Platzhalter statt erfundener Wert) — der Griff fuellt dieselbe eine
         Zeile, die Editor-Hilfe sieht also unveraendert aus; die Maske zeigt
         bei leerem Text weiterhin nichts, nur ohne einzuklappen. */
      :host([data-ff-editor]) .text:empty::before {
        content: 'Text …';
        color: var(--se-faint);
      }
    `]}render(){return w`<div
      class="text"
      style=${ti({fontSize:`${ta(this.groesse)}px`,fontWeight:Zi[na(this.gewicht)],textAlign:Qi[ra(this.ausrichtung)],color:$i[ia(this.farbe)]})}
      data-ff-editable
      data-ff-spot="text"
      ?data-ff-bound=${this.textField!==``}
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</div>`}connectedCallback(){super.connectedCallback(),Ki(this)}disconnectedCallback(){super.disconnectedCallback(),qi(this)}};A([k({type:Number})],$.prototype,`groesse`,void 0),A([k()],$.prototype,`gewicht`,void 0),A([k()],$.prototype,`ausrichtung`,void 0),A([k()],$.prototype,`farbe`,void 0),A([k()],$.prototype,`text`,void 0),A([k()],$.prototype,`source`,void 0),A([k()],$.prototype,`textField`,void 0),j.defineAndRegister($);var aa=class extends j{static{this.blockType=`trenner`}static{this.tagName=`ff-trenner`}static{this.displayName=`Trennlinie`}static{this.category=`layout`}static{this.defaultProps={width:`fill`}}static{this.resizableWidth=!1}static{this.raster={startW:24,startH:1,minW:1,minH:1}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
      /* Fester dezenter Aussenabstand (--se-gap-sm) ober-/unterhalb der Linie;
         die Linie selbst ist ein 1px-Rand in der sichtbaren Linienfarbe. */
      :host { padding: var(--se-gap-sm) 0; }
      .linie { border-top: 1px solid var(--se-line); }
      /* Rasterflaeche: bleibt eine Zeile hoch; wird die Zelle hoeher gezogen,
         sitzt die Linie mittig statt oben. */
      :host([fuellt]) { display: flex; flex-direction: column; justify-content: center; }
      :host([fuellt]) .linie { width: 100%; }
    `]}render(){return w`<div class="linie"></div>`}};j.defineAndRegister(aa);var oa=class extends j{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.raster={startW:24,startH:2,minW:2,minH:1}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
      /* Rasterflaeche: die Zeile fuellt ihre Zelle in der Hoehe; die Kinder
         bleiben oben (flex-start) und behalten ihre Naturhoehe. */
      :host([fuellt]) .zeile { height: 100%; }
    `]}render(){return w`<div class="zeile"><slot></slot></div>`}};j.defineAndRegister(oa),typeof window<`u`&&window.addEventListener(`unhandledrejection`,e=>{let t=e.reason;V(`Unerwarteter Fehler in der Maske: `+(t instanceof Error?t.message:String(t)))})})();