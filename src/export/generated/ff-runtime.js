(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,re=globalThis,ie=re.trustedTypes,ae=ie?ie.emptyScript:``,oe=re.reactiveElementPolyfillSupport,f=(e,t)=>e,p={toAttribute(e,t){switch(t){case Boolean:e=e?ae:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},se=(e,t)=>!l(e,t),ce={attribute:!0,type:String,converter:p,reflect:!1,useDefault:!1,hasChanged:se};Symbol.metadata??=Symbol(`metadata`),re.litPropertyMetadata??=new WeakMap;var m=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ce){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ce}static _$Ei(){if(this.hasOwnProperty(f(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?p:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?p:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??se)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};m.elementStyles=[],m.shadowRootOptions={mode:`open`},m[f(`elementProperties`)]=new Map,m[f(`finalized`)]=new Map,oe?.({ReactiveElement:m}),(re.reactiveElementVersions??=[]).push(`2.1.2`);var le=globalThis,ue=e=>e,de=le.trustedTypes,fe=de?de.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,pe=`$lit$`,h=`lit$${Math.random().toFixed(9).slice(2)}$`,me=`?`+h,he=`<${me}>`,g=document,_=()=>g.createComment(``),v=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ge=Array.isArray,_e=e=>ge(e)||typeof e?.[Symbol.iterator]==`function`,ve=`[ 	
\f\r]`,y=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ye=/-->/g,be=/>/g,b=RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),xe=/'/g,Se=/"/g,Ce=/^(?:script|style|textarea|title)$/i,we=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),x=we(1),S=we(2),C=Symbol.for(`lit-noChange`),w=Symbol.for(`lit-nothing`),Te=new WeakMap,T=g.createTreeWalker(g,129);function Ee(e,t){if(!ge(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return fe===void 0?t:fe.createHTML(t)}var De=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=y;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===y?c[1]===`!--`?o=ye:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=b):(Ce.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=b):o=be:o===b?c[0]===`>`?(o=i??y,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?b:c[3]===`"`?Se:xe):o===Se||o===xe?o=b:o===ye||o===be?o=y:(o=b,i=void 0);let d=o===b&&e[t+1].startsWith(`/>`)?` `:``;a+=o===y?n+he:l>=0?(r.push(s),n.slice(0,l)+pe+n.slice(l)+h+d):n+h+(l===-2?t:d)}return[Ee(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Oe=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=De(t,n);if(this.el=e.createElement(l,r),T.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=T.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(pe)){let t=u[o++],n=i.getAttribute(e).split(h),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?je:r[1]===`?`?Me:r[1]===`@`?Ne:D}),i.removeAttribute(e)}else e.startsWith(h)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(Ce.test(i.tagName)){let e=i.textContent.split(h),t=e.length-1;if(t>0){i.textContent=de?de.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],_()),T.nextNode(),c.push({type:2,index:++a});i.append(e[t],_())}}}else if(i.nodeType===8)if(i.data===me)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(h,e+1))!==-1;)c.push({type:7,index:a}),e+=h.length-1}a++}}static createElement(e,t){let n=g.createElement(`template`);return n.innerHTML=e,n}};function E(e,t,n=e,r){if(t===C)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=v(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=E(e,i._$AS(e,t.values),i,r)),t}var ke=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??g).importNode(t,!0);T.currentNode=r;let i=T.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Ae(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Pe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=T.nextNode(),a++)}return T.currentNode=g,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Ae=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),v(e)?e===w||e==null||e===``?(this._$AH!==w&&this._$AR(),this._$AH=w):e!==this._$AH&&e!==C&&this._(e):e._$litType$===void 0?e.nodeType===void 0?_e(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==w&&v(this._$AH)?this._$AA.nextSibling.data=e:this.T(g.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Oe.createElement(Ee(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new ke(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Te.get(e.strings);return t===void 0&&Te.set(e.strings,t=new Oe(e)),t}k(t){ge(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(_()),this.O(_()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ue(e).nextSibling;ue(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},D=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=w,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=w}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=E(this,e,t,0),a=!v(e)||e!==this._$AH&&e!==C,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=E(this,r[n+o],t,o),s===C&&(s=this._$AH[o]),a||=!v(s)||s!==this._$AH[o],s===w?e=w:e!==w&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},je=class extends D{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===w?void 0:e}},Me=class extends D{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==w)}},Ne=class extends D{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??w)===C)return;let n=this._$AH,r=e===w&&n!==w||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==w&&(n===w||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}},Fe=le.litHtmlPolyfillSupport;Fe?.(Oe,Ae),(le.litHtmlVersions??=[]).push(`3.3.3`);var Ie=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Ae(t.insertBefore(_(),e),e,void 0,n??{})}return i._$AI(e),i},Le=globalThis,O=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ie(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};O._$litElement$=!0,O.finalized=!0,Le.litElementHydrateSupport?.({LitElement:O});var Re=Le.litElementPolyfillSupport;Re?.({LitElement:O}),(Le.litElementVersions??=[]).push(`4.2.2`);var ze={attribute:!0,type:String,converter:p,reflect:!1,hasChanged:se},Be=(e=ze,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function k(e){return(t,n)=>typeof n==`object`?Be(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Ve(e){return k({...e,state:!0,attribute:!1})}var He=new Map;function Ue(e){He.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),He.set(e.type,e)}function We(){return Array.from(He.values())}var Ge={width:`auto`},Ke={rasterX:0,rasterY:0,rasterW:{spalten:24,spaltePx:40,zeilePx:12,gapPx:8}.spalten,rasterH:1};function A(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var j=class extends O{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
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
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ue({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ge,...Ke,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,bindableSpots:e.bindableSpots,actionValueSpots:e.actionValueSpots,listenBindung:e.listenBindung,blockEvents:e.blockEvents,pageBlock:e.pageBlock,raster:e.raster})}};A([k({type:Boolean,reflect:!0,attribute:`data-editable`})],j.prototype,`editable`,void 0);var qe=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Je(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Ye(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}var Xe=`data-ff-block-id`,Ze=[`fixed`,`context`,`data_field`,`block_value`,`previous_result`,`step_result`,`se_variable`];function Qe(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function $e(e){return!Qe(e)||typeof e.source!=`string`||!Ze.includes(e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`||e.blockId!==void 0&&typeof e.blockId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{},...typeof e.blockId==`string`?{blockId:e.blockId}:{}}}function et(e){if(!Qe(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!Qe(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=$e(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=$e(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function tt(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!Qe(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=et(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}var nt=`root`;function rt(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var M=class extends j{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[nt]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[j.styles,o`
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
        <div class="fenster" style="width:${rt(this.breite,520)}px;height:${rt(this.hoehe,380)}px">
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
      </div>`}};A([k()],M.prototype,`name`,void 0),A([k()],M.prototype,`breite`,void 0),A([k()],M.prototype,`hoehe`,void 0),j.defineAndRegister(M);function N(e){return typeof e==`object`&&!!e}function it(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!N(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function at(e){return e==null?``:String(e).trim()}function P(e,t){if(!N(e)||t===``)return``;let n=t.trim(),r=at(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=at(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=at(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function ot(e,t,n){if(!N(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function F(e){if(!N(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function I(e,t){return at(e).toLowerCase()===t.trim().toLowerCase()}function st(e,t,n){if(!N(e)||!N(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(N(e)&&(I(e.ALIAS,t)||I(e.alias,t))){let t=F(e);if(t.length>0)return t}}else if(N(i))for(let e of Object.keys(i)){let n=i[e];if(I(e,t)||N(n)&&(I(n.ALIAS,t)||I(n.alias,t))){let e=F(n);if(e.length>0)return e}}let a=r.Tabellen;if(N(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=F(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(I(e,t)){let t=F(a[e]);if(t.length>0)return t}}return[]}function ct(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!N(t)||!N(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function lt(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!N(t)||!N(t.MSG)))return t.MSG.DATA}function L(){return globalThis}function ut(){let e=L();return N(e.SEDATA)&&N(e.SEDATA.Daten)}function dt(){let e=L();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function ft(){let e=L();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var pt=new Set,mt=new Set;function ht(e){pt.add(e)}function gt(e){return mt.add(e),()=>{mt.delete(e)}}function _t(){pt.forEach(e=>e())}function vt(e){mt.forEach(t=>{try{t(e)}catch{}})}var R=new Map,yt=``,bt=0;function xt(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function St(){let e=xt();e&&(e.value=Array.from(R,([e,t])=>`${e}: ${t}`).join(`
`)+(yt===``?``:`\n\nERSTES PAKET\n${yt}`))}function z(e,t){R.set(e,t),St()}function Ct(){let e=L();R.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),R.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),R.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),R.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),R.set(`Empfangene Pakete`,String(bt)),R.set(`SEDATA.Daten`,ut()?`vorhanden`:`fehlt`),St()}function wt(e){if(yt===``)try{yt=typeof e==`string`?e:JSON.stringify(e)??``,St()}catch{}}function Tt(e){bt+=1,wt(e),z(`Empfangene Pakete`,String(bt));let t=ct(e);if(!t){z(`Letztes Paket`,`Antwort ohne Daten`),vt(e);return}let n=L();N(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,z(`Letztes Paket`,`Daten-Push angenommen`),z(`SEDATA.Daten`,`vorhanden`),ft(),_t()}function Et(e=0){let t=L();if(typeof t.basisHTML_REGISTER==`function`){Ct();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{Tt(e)},document.title,`1.0`),z(`Registrierung`,`ausgeführt`)}catch(e){z(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&z(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{Et(e+1)},25)):(Ct(),z(`Registrierung`,`nach 10s kein Interface`))}var Dt=!1;function Ot(){if(Dt)return;Dt=!0,z(`Runtime`,`gestartet`),z(`Registrierung`,`noch nicht ausgeführt`),Ct(),dt();let e=L();e.Erstellen=()=>{ft(),_t()},e.initData=e.Erstellen,e.ReloadData=()=>{_t()},Et(),window.addEventListener(`message`,e=>{if(typeof L().basisHTML_REGISTER==`function`)return;let t=lt(e.data);t!==void 0&&Tt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){Ct();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,ut()?(clearInterval(n),z(`SEDATA.Daten`,`vorhanden`),ft(),_t()):t>100&&(clearInterval(n),z(`Daten-Wartezeit`,`nach 30s ohne Daten`))},300)}function kt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!N(n)||n.id!==t)&&!(typeof n.verb!=`string`||!qe.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var At=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function jt(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function Mt(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function Nt(e,t){if(t>12)return;let n=Mt(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=Nt(n,t+1);if(e!==void 0)return e}return}if(N(e)){for(let n of At){if(!(n in e))continue;let r=Nt(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=Nt(n,t+1);if(e!==void 0)return e}}}function Pt(e){let t=jt(e);if(N(t)){for(let e of At){if(!(e in t))continue;let n=Nt(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=Pt(t);if(e!==void 0)return e}else if(N(e)){let t=Pt(e);if(t!==void 0)return t}}}function Ft(e){return N(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function It(e,t){if(!N(e))return;let n=Ft(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=Pt(e[t]);if(n!==void 0)return n}}var Lt=[],Rt=!1,zt=6e3,Bt=100;function Vt(){if(Rt||Lt.length===0)return;Rt=!0;let e=Lt.shift(),t=L(),n=new Set(Ft(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),Rt=!1,e.resolve(t),Vt())},a=gt(e=>{let t=Pt(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=It(L().SEDATA,n);e!==void 0&&i(e)},Bt),s=setTimeout(()=>{i(``)},zt);if(typeof t.basisHTML_SND_MSG!=`function`){i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch{i(``)}}function Ht(e,t){Ot();let n=L();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG==`function`)try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch{}return Promise.resolve(``)}return new Promise(n=>{Lt.push({template:e,params:[...t],resolve:n}),Vt()})}function Ut(e,t){if(!N(t))return``;let n=t.document;if(!n||typeof n.querySelectorAll!=`function`)return``;let r=Array.from(n.querySelectorAll(`[${Xe}]`)).find(t=>t.getAttribute(Xe)===e.blockId);if(!r)return``;let i=r[e.value];return i==null?``:String(i)}function Wt(e,t,n=L()){if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);return Number.isInteger(n)&&n>=0?t.stepResults?.[n]??``:``}if(e.source===`block_value`)return Ut(e,n);if(!N(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!N(t)||!N(t.Daten)||!N(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=it(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=st(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>P(e,r.indexField)===a):i[0];return o?P(o,e.value):``}function Gt(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function Kt(e,t){if(e.trim()===``)return;let n=L();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(Gt(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function qt(e,t,n){if(t.trim()!==``)for(let r of Array.from(e.querySelectorAll(M.tagName)))(r.getAttribute(`name`)??``)===t&&(n?r.setAttribute(`offen`,``):r.removeAttribute(`offen`))}var Jt=new WeakMap;async function Yt(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=tt(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=Jt.get(e);if(i||(i=new Set,Jt.set(e,i)),!i.has(t)){i.add(t);try{let t={...n,NOW_DATE:Je(new Date)},i=``,a=[];for(let n of r){if(n.type===`START_TOOL`){Kt(n.toolNr,Ye({params:n.toolParams},t)),a.push(``);continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){qt(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),a.push(``);continue}let r=kt(L().FF_RELATIONS,n.relationId);if(!r){a.push(``);continue}let o={context:t,previousResult:i,stepResults:a},s=await Ht(r,[...n.params,...n.extraParams].map(e=>Wt(e,o)));a.push(s),r.verb===`GET_RELATION`&&(i=s),n.resultKey!==``&&(t[n.resultKey]=s)}}finally{i.delete(t)}}}var Xt=new WeakSet;function Zt(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||Xt.has(e))return;Xt.add(e);let n=tt(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&Ot(),e.addEventListener(`click`,()=>{Yt(e,t,{})})}var Qt=class extends j{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.raster={startW:4,startH:2,minW:2,minH:2}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
      /* Rasterflaeche: der Knopf fuellt seine Zelle (Ziehen macht den KNOPF
         groesser, nicht einen leeren Rahmen). Im Fluss (kein 'fuellt') bleibt
         er naturgross. */
      :host([fuellt]) button { width: 100%; height: 100%; }
    `]}render(){return x`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),Zt(this,`onClick`)}};A([k()],Qt.prototype,`label`,void 0),j.defineAndRegister(Qt);var $t=[`info`,`success`,`warning`,`danger`];function en(e){return $t.includes(e)?e:`info`}function tn(e,t){return{attributeName:e,name:`Farbe`,description:t,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var nn=o`
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
`,rn={dog:S`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,cat:S`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,rabbit:S`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,hamster:S`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,bird:S`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,reptile:S`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,paw:S`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`},an=[[`welpe`,`dog`],[`hund`,`dog`],[`kater`,`cat`],[`katze`,`cat`],[`kaninchen`,`rabbit`],[`hase`,`rabbit`],[`meerschweinchen`,`hamster`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`bird`],[`sittich`,`bird`],[`papagei`,`bird`],[`vogel`,`bird`],[`schildkr`,`reptile`],[`echse`,`reptile`],[`schlange`,`reptile`],[`gecko`,`reptile`],[`reptil`,`reptile`]];function on(e){let t=e.toLowerCase(),n=`paw`;for(let[e,r]of an)if(t.includes(e)){n=r;break}return x`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${rn[n]}</svg>`}var B=class extends j{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[tn(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[j.styles,nn,o`
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
    >${this[e]}</span>`}render(){let e=en(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.heading)||n(this.heading2),i=n(this.time)||n(this.date);return x`<div class="card">
      ${n(this.avatar)||r||n(this.meta)||i?x`<div class="main">
            ${n(this.avatar)?x`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?w:on(this.avatar)}</span>`:w}
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
    </div>`}};A([k()],B.prototype,`chipVariant`,void 0),A([k()],B.prototype,`heading`,void 0),A([k()],B.prototype,`heading2`,void 0),A([k()],B.prototype,`time`,void 0),A([k()],B.prototype,`date`,void 0),A([k()],B.prototype,`avatar`,void 0),A([k()],B.prototype,`meta`,void 0),A([k()],B.prototype,`text`,void 0),A([k()],B.prototype,`chipText`,void 0),A([k()],B.prototype,`headingField`,void 0),A([k()],B.prototype,`heading2Field`,void 0),A([k()],B.prototype,`timeField`,void 0),A([k()],B.prototype,`dateField`,void 0),A([k()],B.prototype,`avatarField`,void 0),A([k()],B.prototype,`metaField`,void 0),A([k()],B.prototype,`textField`,void 0),A([k()],B.prototype,`chipTextField`,void 0),j.defineAndRegister(B);function sn(e){return`${e.toLowerCase()}field`}function cn(e){let t=new Set,n=!1,r=()=>{ut()&&t.forEach(e.hydriere)};return{connect:i=>{i.hasAttribute(`data-ff-editor`)||(t.add(i),e.verdrahte?.(i),n||(n=!0,ht(r)),Ot(),ut()&&e.hydriere(i))},disconnect:e=>{t.delete(e)},hydriereAlle:r}}var V=new WeakMap,ln=new WeakSet;function un(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function dn(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function fn(e){return typeof e.value==`string`?e.value:``}function pn(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(sn(`value`))??``;if(t===``||n===``){V.delete(e);return}let r=it(L().FF_DATA_SOURCES,t);if(!r){V.delete(e);return}let i=st(L().SEDATA,r.name,r.tableId)[0];if(i===void 0){V.delete(e),e.value=``;return}let a=r.indexField===``?``:P(i,r.indexField);V.set(e,{row:i,code:n,pindex:a}),e.value=P(i,n)}function mn(e){let t=V.get(e);return t&&ot(t.row,t.code,fn(e)),t}function hn(e){ln.has(e)||(ln.add(e),e.addEventListener(`input`,()=>{mn(e)}),e.addEventListener(`change`,()=>{let t=mn(e);Yt(e,`onChange`,{VALUE:fn(e),PINDEX:t?.pindex??``})}))}var gn=cn({hydriere:pn,verdrahte:hn}),_n=gn.connect,vn=gn.disconnect,yn=[`date`,`time`,`datetime`];function bn(e){return yn.includes(e)?e:`date`}function xn(e){return`${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`}function Sn(e,t){let n=bn(e);return n===`time`?{haupt:xn(t)}:n===`date`?{haupt:Je(t)}:{haupt:xn(t),neben:Je(t)}}var H=class extends j{constructor(...e){super(...e),this.zeigt=`date`,this.source=``,this.value=``,this.valueField=``}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.bindableSpots=[{prop:`value`,label:`Wert`}]}static{this.defaultProps={zeigt:`date`,source:``,value:``,valueField:``}}static{this.raster={startW:4,startH:3,minW:2,minH:2}}static{this.customProperties=[{attributeName:`zeigt`,name:`Zeigt`,description:`Welche Zeitangabe ohne Datenbindung angezeigt wird.`,kind:`select`,options:[{value:`date`,label:`Datum`},{value:`time`,label:`Zeit`},{value:`datetime`,label:`Datum + Zeit`}]},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt wird.`,kind:`field`}]}static{this.styles=[j.styles,o`
      .vuhr {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
      }
      .haupt {
        color: var(--se-ink);
        font-family: var(--se-mono);
        font-size: 17px;
        font-weight: 600;
        white-space: nowrap;
      }
      .neben {
        color: var(--se-muted);
        font-family: var(--se-font);
        font-size: 11.5px;
        white-space: nowrap;
      }
    `]}render(){let e=this.valueField===``?Sn(this.zeigt,new Date):{haupt:this.value};return x`<div class="vuhr">
      <span
        class="haupt"
        data-ff-spot="value"
        ?data-ff-bound=${this.valueField!==``}
      >${e.haupt}</span>
      ${e.neben?x`<span class="neben">${e.neben}</span>`:w}
    </div>`}connectedCallback(){super.connectedCallback(),_n(this)}disconnectedCallback(){super.disconnectedCallback(),vn(this)}};A([k()],H.prototype,`zeigt`,void 0),A([k()],H.prototype,`source`,void 0),A([k()],H.prototype,`value`,void 0),A([k()],H.prototype,`valueField`,void 0),j.defineAndRegister(H);var Cn=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`];function wn(e){return Cn.includes(e)?e:`text`}var Tn=[`text`,`number`,`textarea`,`select`],U=class extends j{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource=!0}static{this.bindableSpots=[{prop:`value`,label:`Wert`}]}static{this.actionValueSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``}}static{this.raster={startW:6,startH:2,minW:2,minH:2}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,kind:`field`}]}static{this.styles=[j.styles,o`
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
      /* Rasterflaeche: das Eingabefeld fuellt seine Zelle in Breite und Hoehe
         (Ziehen macht das FELD groesser). Nur die Text-artigen Felder in der
         .huelle strecken sich; das Ankreuzfeld (.zeile) bleibt 15px. */
      :host([fuellt]) .feld,
      :host([fuellt]) .huelle { height: 100%; }
      :host([fuellt]) .huelle .ctrl { height: 100%; }
    `]}onInput(e){let t=e.target;this.value=wn(this.fieldType)===`date`?dn(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return x`<span
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
          .value=${e===`date`?un(this.value):this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`}}render(){let e=wn(this.fieldType);return e===`checkbox`?x`<div class="feld">
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
        ${Tn.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this.value!==``):w}
      </div>
    </div>`}connectedCallback(){super.connectedCallback(),_n(this)}disconnectedCallback(){super.disconnectedCallback(),vn(this)}};A([k()],U.prototype,`fieldType`,void 0),A([k()],U.prototype,`placeholder`,void 0),A([k()],U.prototype,`options`,void 0),A([k()],U.prototype,`source`,void 0),A([k()],U.prototype,`value`,void 0),A([k()],U.prototype,`valueField`,void 0),j.defineAndRegister(U);function En(e,t,n,r){return{attributeName:e,name:t,description:n,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var W=class extends j{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[B.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[tn(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),En(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte zeigt die Maske sie sichtbar in „Nicht zugeordnet“.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[j.styles,o`
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return x`<div class="col v-${en(this.variant)}">
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
    </div>`}};A([k()],W.prototype,`variant`,void 0),A([k()],W.prototype,`heading`,void 0),A([Ve()],W.prototype,`_count`,void 0),j.defineAndRegister(W);function Dn(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function On(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var kn=new WeakMap,An=W.tagName,jn=B.tagName,G=`data-ff-nicht-zugeordnet`,Mn=`Nicht zugeordnet`;function Nn(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===An&&!e.hasAttribute(G))}function Pn(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===jn)}function Fn(e){return We().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function In(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=it(L().FF_DATA_SOURCES,t);if(!r)return;let i=Nn(e);if(i.length===0)return;let a=kn.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(jn);t&&(a=t.cloneNode(!0),kn.set(e,a))}if(!a)return;let o=st(L().SEDATA,r.name,r.tableId),s=i.map(e=>e.getAttribute(`heading`)??``),c=Fn(a.tagName),l=On(i.map(e=>e.getAttribute(`auffang`)));e.querySelectorAll(`[`+G+`]`).forEach(e=>e.remove());let u=null,d=()=>(u||(u=document.createElement(An),u.setAttribute(`heading`,Mn),u.setAttribute(G,``),u.setAttribute(`style`,i[0].getAttribute(`style`)??`flex-grow:1;flex-basis:0;min-width:0`),e.appendChild(u)),u);for(let e of i)Pn(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:Dn(P(e,n),s);(o>=0?i[o]:l>=0?i[l]:d()).appendChild(t);for(let n of c){let r=t.getAttribute(sn(n.prop))??``;r!==``&&(t[n.prop]=P(e,r))}let u=r.indexField===``?``:P(e,r.indexField);K.set(t,{row:e,pindex:u}),t.draggable=!0}}var K=new WeakMap,q=null,Ln=new WeakSet;function Rn(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===An&&e.contains(n))return n;return null}function zn(e,t){if(!q||q.board!==e)return;let n=K.get(q.card);if(!n)return;let r=t.getAttribute(`heading`)??``;Yt(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r})}function Bn(e){Ln.has(e)||(Ln.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&K.has(e))??null;n&&Yt(e,`onCardClick`,{PINDEX:K.get(n)?.pindex??``})}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&K.has(e))??null;n&&(q={card:n,board:e},t.dataTransfer?.setData(`text/plain`,K.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{q=null}),e.addEventListener(`dragover`,t=>{let n=Rn(e,t);q?.board===e&&n&&!n.hasAttribute(G)&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=Rn(e,t);!n||n.hasAttribute(G)||(t.preventDefault(),zn(e,n),q=null)}))}var Vn=cn({hydriere:In,verdrahte:Bn}),Hn=Vn.connect,Un=Vn.disconnect,J=W.blockType,Wn=class extends j{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[J]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:J}}static{this.templateChild={type:B.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``}}static{this.raster={startW:24,startH:20,minW:6,minH:8}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,kind:`field`}]}static{this.defaultChildren=[{type:J,props:{heading:`Offen`,variant:`warning`},children:[{type:B.blockType}]},{type:J,props:{heading:`In Arbeit`,variant:`info`}},{type:J,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[j.styles,o`
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
    `]}render(){return x`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Hn(this)}disconnectedCallback(){super.disconnectedCallback(),Un(this)}};j.defineAndRegister(Wn);var Gn={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Kn=e=>(...t)=>({_$litDirective$:e,values:t}),qn=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Jn=`important`,Yn=` !`+Jn,Xn=Kn(class extends qn{constructor(e){if(super(e),e.type!==Gn.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(Yn);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?Jn:``):n[e]=r}}return C}});function Zn(e){let t=e.getAttribute(`spalten`)??``;if(t===``)return[];try{let e=JSON.parse(t);return Array.isArray(e)?e.map(e=>e&&typeof e==`object`&&typeof e.feld==`string`?e.feld:``):[]}catch{return[]}}function Qn(e){let t=e.getAttribute(`source`)??``;if(t===``){e.datenzeilen=[];return}let n=it(L().FF_DATA_SOURCES,t);if(!n){e.datenzeilen=[];return}let r=Zn(e);e.datenzeilen=st(L().SEDATA,n.name,n.tableId).map(e=>r.map(t=>t===``?``:P(e,t)))}var $n=cn({hydriere:Qn}),er=$n.connect,tr=$n.disconnect,nr=1,rr=/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/,ir=/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/,ar=/^(\d{4})-(\d{2})-(\d{2})$/;function or(e){let t=e.trim();if(t===``||!rr.test(t))return null;let n=t.includes(`,`)?t.replace(/\./g,``).replace(`,`,`.`):/^-?\d{1,3}(\.\d{3})+$/.test(t)?t.replace(/\./g,``):t,r=Number(n);return Number.isFinite(r)?r:null}function sr(e){let t=e.trim();if(t===``)return null;let n=ar.exec(t);if(n){let[,e,t,r]=n;return cr(Number(e),Number(t),Number(r))}let r=ir.exec(t);if(r){let[,e,t,n]=r,i=Number(n);return cr(n.length===2?i<=69?2e3+i:1900+i:i,Number(t),Number(e))}return null}function cr(e,t,n){if(t<1||t>12||n<1||n>31)return null;let r=new Date(e,t-1,n);return r.getFullYear()!==e||r.getMonth()!==t-1||r.getDate()!==n?null:r.getTime()}function lr(e){let t=0,n=0,r=0;for(let i of e)i.trim()!==``&&(t++,or(i)!==null&&n++,sr(i)!==null&&r++);return t===0?`text`:r===t?`datum`:n===t?`zahl`:`text`}var ur=new Intl.Collator(`de`,{numeric:!0,sensitivity:`base`});function dr(e,t,n){if(t<0||e.length===0)return e.map(e=>[...e]);let r=e=>e[t]??``,i=lr(e.map(r)),a=n?1:-1;return e.map((e,t)=>({zeile:e,i:t})).sort((e,t)=>{let n=r(e.zeile).trim(),o=r(t.zeile).trim();if(n===``&&o===``)return e.i-t.i;if(n===``)return nr;if(o===``)return-nr;let s=i===`zahl`?(or(n)??0)-(or(o)??0):i===`datum`?(sr(n)??0)-(sr(o)??0):ur.compare(n,o);return s===0?e.i-t.i:s*a}).map(e=>[...e.zeile])}function fr(e){return e.trim().toLowerCase().split(/\s+/).filter(e=>e!==``)}function pr(e,t){let n=fr(t);if(n.length===0)return!0;let r=e.join(` `).toLowerCase();return n.every(e=>r.includes(e))}function mr(e,t){return fr(t).length===0?e.map(e=>[...e]):e.filter(e=>pr(e,t)).map(e=>[...e])}function hr(e){if(!e.hatQuelle)return`— Datensätze`;let t=e=>e===1?`Datensatz`:`Datensätze`,n=e=>e===1?`Datensatz`:`Datensätzen`;return e.suchtAktiv?e.sichtbar===0?`Kein Treffer von ${e.gesamt} ${n(e.gesamt)}`:`${e.sichtbar} von ${e.gesamt} ${n(e.gesamt)}`:e.gesamt===0?`Keine Datensätze`:`${e.gesamt} ${t(e.gesamt)}`}var gr=o`
      :host { min-width: 0; height: 100%; }
      /* Der Takt der Tabelle. WICHTIG: dieser Wert wird VORGEGEBEN, nicht
         geschaetzt — Kopf und Zeilen bekommen ihn als feste Hoehe, der
         Text wird ueber line-height darin zentriert. Vorher stand hier ein
         geschaetzter Wert (29px), waehrend die Zeilen sich aus Schrift +
         Innenabstand auf 33,25px ergaben. Die weitergezeichneten Linien
         liefen dadurch 4,25px je Zeile aus dem Takt — nach vier Zeilen
         17px Versatz, und genau das sah krumm aus (Nutzer 2026-07-25).
         Vorgeben statt schaetzen: jetzt koennen sie nicht mehr abweichen. */
      .tabelle { --zeilen-hoehe: 32px; }
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
      .kopf {
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
      }
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
`,_r=`Spalte {n}`;function Y(e){return _r.replace(`{n}`,String(e+1))}function X(){return[0,1,2].map(e=>({titel:Y(e),feld:``}))}function vr(e,t){if(e&&typeof e==`object`){let n=e;return{titel:typeof n.titel==`string`?n.titel:Y(t),feld:typeof n.feld==`string`?n.feld:``}}return typeof e==`string`?{titel:e,feld:``}:{titel:Y(t),feld:``}}function yr(e){let t;if(Array.isArray(e))t=e.map((e,t)=>vr(e,t));else if(typeof e==`number`&&Number.isFinite(e)||typeof e==`string`&&/^\d+$/.test(e)){let n=Math.max(1,Math.floor(Number(e)));t=[...Array(n).keys()].map(e=>({titel:Y(e),feld:``}))}else t=X();return t.length>8&&(t=t.slice(0,8)),t.length<1&&(t=[{titel:Y(0),feld:``}]),t}function br(e){try{return yr(JSON.parse(e))}catch{return X()}}var xr=4,Z=[10,25,50],Sr=220,Q=class e extends j{constructor(...e){super(...e),this.spalten=X(),this.source=``,this.proSeite=String(Z[0]),this.suche=`ja`,this._suchtext=``,this.datenzeilen=[],this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._proSeiteWahl=null,this._klickTimer=null}static{this.blockType=`tabelle`}static{this.tagName=`ff-tabelle`}static{this.displayName=`Tabelle`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.listenBindung={prop:`spalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:_r}}static{this.defaultProps={width:`fill`,source:``,spalten:X(),proSeite:String(Z[0]),suche:`ja`}}static{this.customProperties=[{attributeName:`suche`,name:`Suchzeile`,description:`Zeigt ueber der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.`,kind:`segment`,options:[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],requiresDataSource:!0},{attributeName:`proSeite`,name:`Zeilen pro Seite`,description:`Wie viele Datensaetze eine Seite der Tabelle zeigt.`,kind:`select`,options:Z.map(e=>({value:String(e),label:String(e)})),requiresDataSource:!0}]}static{this.raster={startW:14,startH:8,minW:6,minH:4}}get proSeiteAktuell(){if(this._proSeiteWahl!==null)return this._proSeiteWahl;let e=Number(this.proSeite);return Number.isFinite(e)&&e>0?Math.floor(e):Z[0]}spaltenListe(){return yr(this.spalten)}sichtbareZeilen(){let e=mr(this.datenzeilen,this._suchtext);return this._sortSpalte<0?e:dr(e,this._sortSpalte,this._sortAuf)}setzeSuchtext(e){this._suchtext=e,this._seite=0,this.requestUpdate()}klickSortiere(e){this.editable||(this._sortSpalte===e?this._sortAuf=!this._sortAuf:(this._sortSpalte=e,this._sortAuf=!0),this._seite=0,this.requestUpdate())}aendere(e){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`spalten`,value:e},bubbles:!0,composed:!0}))}klickSpaltenkopf(t,n){if(!this.editable)return;t.stopPropagation();let r=t.currentTarget.getBoundingClientRect();this.klickTimerAus(),this._klickTimer=setTimeout(()=>{this._klickTimer=null,this.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:e.listenBindung.prop,index:n,top:r.bottom+4,left:r.left},bubbles:!0,composed:!0}))},Sr)}klickTimerAus(){this._klickTimer!==null&&(clearTimeout(this._klickTimer),this._klickTimer=null)}bearbeiteTitel(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n)return;e.stopPropagation(),e.preventDefault();let r=Array.from(n.childNodes),i=n.textContent??``;n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let a=window.getSelection(),o=document.createRange();o.selectNodeContents(n),a?.removeAllRanges(),a?.addRange(o);let s=!1,c=e=>{if(s)return;s=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,l),n.removeEventListener(`keydown`,u);let a=(n.textContent??``).trim(),o=this.spaltenListe();e&&a&&a!==i.trim()&&t<o.length?(o[t]={...o[t],titel:a},this.aendere(o)):n.replaceChildren(...r)},l=()=>c(!0),u=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),c(!1))};n.addEventListener(`blur`,l),n.addEventListener(`keydown`,u)}connectedCallback(){super.connectedCallback(),er(this)}disconnectedCallback(){super.disconnectedCallback(),this.klickTimerAus(),tr(this)}static{this.styles=[j.styles,gr]}render(){let e=this.spaltenListe(),t={gridTemplateColumns:`repeat(${e.length}, minmax(0, 1fr))`},n=e=>e.stopPropagation(),r=this.sichtbareZeilen(),i=this.datenzeilen.length>0,a=i,o=r.length,s=this.proSeiteAktuell,c=a?Math.max(1,Math.ceil(o/s)):1,l=Math.min(Math.max(this._seite,0),c-1),u=a?r.slice(l*s,(l+1)*s):[],d=a?s:xr,ee=a?``:`—`,te=[...u,...Array.from({length:Math.max(0,d-u.length)},()=>null)];return x`<div class="tabelle" style=${Xn({"--spalten-zahl":String(e.length)})}>
      <div class="steuerung">
        <button
          title="Letzte Spalte entfernen"
          @pointerdown=${n}
          @click=${e=>{n(e);let t=this.spaltenListe();t.length>1&&(t.pop(),this.aendere(t))}}
        >−</button>
        <button
          title="Spalte hinzufügen"
          @pointerdown=${n}
          @click=${e=>{n(e);let t=this.spaltenListe();t.length<8&&(t.push({titel:`Spalte ${t.length+1}`,feld:``}),this.aendere(t))}}
        >+</button>
      </div>
      ${this.suche===`ja`?x`<div class="suchzeile">
        <input
          type="search"
          placeholder="Tabelle durchsuchen…"
          aria-label="Tabelle durchsuchen"
          .value=${this._suchtext}
          @pointerdown=${n}
          @input=${e=>this.setzeSuchtext(e.target.value)}
        />
      </div>`:``}
      <div class="kopf" style=${Xn(t)}>
        ${e.map((e,t)=>x`<div
            data-ff-editable
            @dblclick=${e=>{this.klickTimerAus(),this.bearbeiteTitel(e,t)}}
            @click=${e=>{this.klickSpaltenkopf(e,t),this.klickSortiere(t)}}
          >${e.titel}${!this.editable&&this._sortSpalte===t?x`<span class="sort-pfeil">${this._sortAuf?` ▲`:` ▼`}</span>`:``}</div>`)}
      </div>
      <div class="koerper">
        ${te.map(n=>x`<div class="zeile" style=${Xn(t)}>
            ${n?n.map(e=>x`<div>${e}</div>`):e.map(()=>x`<div>${ee}</div>`)}
          </div>`)}
      </div>
      <!-- Fusszeile IMMER: sie gehoert zum Aufbau der Tabelle, also muss der
           Editor sie zeigen (Regel 1 — was zu sehen ist, IST der Export).
           Vorher erschien sie nur mit Daten; im Editor fehlte sie damit
           komplett, und der Bediener suchte vergeblich nach der
           Seiteneinstellung. Ohne Daten steht statt einer erfundenen Zahl
           ein Strich (Regel 7). -->
      <div class="fusszeile">
        <div class="seiten-info">${hr({hatQuelle:i,sichtbar:o,gesamt:this.datenzeilen.length,suchtAktiv:this._suchtext.trim()!==``})}</div>
        <div class="seiten-nav">
          <select
            aria-label="Zeilen pro Seite"
            @pointerdown=${n}
            @change=${e=>{this._proSeiteWahl=Number(e.target.value),this._seite=0,this.requestUpdate()}}
          >${Z.map(e=>x`<option value=${e} ?selected=${e===s}>${e} pro Seite</option>`)}</select>
          <button aria-label="Seite zurück" ?disabled=${l<=0} @click=${()=>{this._seite=l-1,this.requestUpdate()}}>‹</button>
          <span>Seite ${l+1} von ${c}</span>
          <button aria-label="Seite vor" ?disabled=${l>=c-1} @click=${()=>{this._seite=l+1,this.requestUpdate()}}>›</button>
        </div>
      </div>
    </div>`}};A([k({converter:{fromAttribute:e=>e?br(e):X(),toAttribute:e=>JSON.stringify(e)}})],Q.prototype,`spalten`,void 0),A([k()],Q.prototype,`source`,void 0),A([k()],Q.prototype,`proSeite`,void 0),A([k()],Q.prototype,`suche`,void 0),A([k({attribute:!1})],Q.prototype,`datenzeilen`,void 0),j.defineAndRegister(Q);var Cr=6,wr=96,Tr=14,Er={duenn:`300`,normal:`400`,fett:`700`},Dr={links:`left`,mitte:`center`,rechts:`right`};function Or(e){if(e===`ueberschrift`)return 15;if(e===`klein`)return 12;let t=typeof e==`number`?e:Number.parseFloat(String(e??``));return Number.isFinite(t)?Math.min(wr,Math.max(Cr,t)):Tr}function kr(e){return typeof e==`string`&&e in Er?e:`normal`}function Ar(e){return typeof e==`string`&&e in Dr?e:`links`}var $=class extends j{constructor(...e){super(...e),this.groesse=Tr,this.gewicht=`normal`,this.ausrichtung=`links`,this.text=`Text`}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Text`}static{this.category=`anzeige`}static{this.defaultProps={width:`fill`,groesse:Tr,gewicht:`normal`,ausrichtung:`links`,text:`Text`}}static{this.raster={startW:6,startH:2,minW:1,minH:1}}static{this.customProperties=[{attributeName:`groesse`,name:`Größe`,description:`Schriftgröße in Pixeln.`,kind:`number`,unit:`px`,min:Cr,max:wr,inspectorRow:`Text-Stil`},{attributeName:`gewicht`,name:`Gewicht`,description:`Strichstärke der Schrift.`,kind:`segment`,options:[{value:`duenn`,label:`Dünn`},{value:`normal`,label:`Normal`},{value:`fett`,label:`Fett`}],inspectorRow:`Text-Stil`},{attributeName:`ausrichtung`,name:`Ausrichtung`,description:`Wo der Text in seiner Breite sitzt.`,kind:`segment`,options:[{value:`links`,label:`Links`},{value:`mitte`,label:`Mitte`},{value:`rechts`,label:`Rechts`}],inspectorRow:`Text-Stil`}]}static{this.styles=[j.styles,o`
      .text {
        font-family: var(--se-font);
        color: var(--se-ink);
        line-height: 1.35;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      /* Leerer Text bleibt im Editor ein greifbares Klick-Ziel (Regel 7:
         Platzhalter statt erfundener Wert); die Maske zeigt bei leerem Text
         schlicht nichts. */
      :host([data-ff-editor]) .text:empty::before {
        content: 'Text …';
        color: var(--se-faint);
      }
    `]}render(){return x`<div
      class="text"
      style=${Xn({fontSize:`${Or(this.groesse)}px`,fontWeight:Er[kr(this.gewicht)],textAlign:Dr[Ar(this.ausrichtung)]})}
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</div>`}};A([k({type:Number})],$.prototype,`groesse`,void 0),A([k()],$.prototype,`gewicht`,void 0),A([k()],$.prototype,`ausrichtung`,void 0),A([k()],$.prototype,`text`,void 0),j.defineAndRegister($);var jr=class extends j{static{this.blockType=`trenner`}static{this.tagName=`ff-trenner`}static{this.displayName=`Trennlinie`}static{this.category=`layout`}static{this.defaultProps={width:`fill`}}static{this.resizableWidth=!1}static{this.raster={startW:24,startH:1,minW:1,minH:1}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
      /* Fester dezenter Aussenabstand (--se-gap-sm) ober-/unterhalb der Linie;
         die Linie selbst ist ein 1px-Rand in der sichtbaren Linienfarbe. */
      :host { padding: var(--se-gap-sm) 0; }
      .linie { border-top: 1px solid var(--se-line); }
      /* Rasterflaeche: bleibt eine Zeile hoch; wird die Zelle hoeher gezogen,
         sitzt die Linie mittig statt oben. */
      :host([fuellt]) { display: flex; flex-direction: column; justify-content: center; }
      :host([fuellt]) .linie { width: 100%; }
    `]}render(){return x`<div class="linie"></div>`}};j.defineAndRegister(jr);var Mr=class extends j{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.raster={startW:24,startH:2,minW:2,minH:1}}static{this.customProperties=[]}static{this.styles=[j.styles,o`
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
    `]}render(){return x`<div class="zeile"><slot></slot></div>`}};j.defineAndRegister(Mr)})();