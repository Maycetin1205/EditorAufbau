(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,re=globalThis,ie=re.trustedTypes,ae=ie?ie.emptyScript:``,oe=re.reactiveElementPolyfillSupport,f=(e,t)=>e,se={toAttribute(e,t){switch(t){case Boolean:e=e?ae:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ce=(e,t)=>!l(e,t),le={attribute:!0,type:String,converter:se,reflect:!1,useDefault:!1,hasChanged:ce};Symbol.metadata??=Symbol(`metadata`),re.litPropertyMetadata??=new WeakMap;var p=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=le){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??le}static _$Ei(){if(this.hasOwnProperty(f(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?se:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?se:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ce)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};p.elementStyles=[],p.shadowRootOptions={mode:`open`},p[f(`elementProperties`)]=new Map,p[f(`finalized`)]=new Map,oe?.({ReactiveElement:p}),(re.reactiveElementVersions??=[]).push(`2.1.2`);var ue=globalThis,de=e=>e,fe=ue.trustedTypes,pe=fe?fe.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,me=`$lit$`,m=`lit$${Math.random().toFixed(9).slice(2)}$`,he=`?`+m,ge=`<${he}>`,h=document,g=()=>h.createComment(``),_=e=>e===null||typeof e!=`object`&&typeof e!=`function`,_e=Array.isArray,ve=e=>_e(e)||typeof e?.[Symbol.iterator]==`function`,ye=`[ 	
\f\r]`,v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,be=/-->/g,xe=/>/g,y=RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),Se=/'/g,Ce=/"/g,we=/^(?:script|style|textarea|title)$/i,Te=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),b=Te(1),x=Te(2),S=Symbol.for(`lit-noChange`),C=Symbol.for(`lit-nothing`),Ee=new WeakMap,w=h.createTreeWalker(h,129);function De(e,t){if(!_e(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return pe===void 0?t:pe.createHTML(t)}var Oe=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=v;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===v?c[1]===`!--`?o=be:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=y):(we.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=y):o=xe:o===y?c[0]===`>`?(o=i??v,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?y:c[3]===`"`?Ce:Se):o===Ce||o===Se?o=y:o===be||o===xe?o=v:(o=y,i=void 0);let d=o===y&&e[t+1].startsWith(`/>`)?` `:``;a+=o===v?n+ge:l>=0?(r.push(s),n.slice(0,l)+me+n.slice(l)+m+d):n+m+(l===-2?t:d)}return[De(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},ke=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Oe(t,n);if(this.el=e.createElement(l,r),w.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=w.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(me)){let t=u[o++],n=i.getAttribute(e).split(m),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ne:r[1]===`?`?Pe:r[1]===`@`?Fe:Me}),i.removeAttribute(e)}else e.startsWith(m)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(we.test(i.tagName)){let e=i.textContent.split(m),t=e.length-1;if(t>0){i.textContent=fe?fe.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],g()),w.nextNode(),c.push({type:2,index:++a});i.append(e[t],g())}}}else if(i.nodeType===8)if(i.data===he)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(m,e+1))!==-1;)c.push({type:7,index:a}),e+=m.length-1}a++}}static createElement(e,t){let n=h.createElement(`template`);return n.innerHTML=e,n}};function T(e,t,n=e,r){if(t===S)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=_(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=T(e,i._$AS(e,t.values),i,r)),t}var Ae=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??h).importNode(t,!0);w.currentNode=r;let i=w.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new je(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ie(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=w.nextNode(),a++)}return w.currentNode=h,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},je=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=C,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=T(this,e,t),_(e)?e===C||e==null||e===``?(this._$AH!==C&&this._$AR(),this._$AH=C):e!==this._$AH&&e!==S&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ve(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==C&&_(this._$AH)?this._$AA.nextSibling.data=e:this.T(h.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=ke.createElement(De(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Ae(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Ee.get(e.strings);return t===void 0&&Ee.set(e.strings,t=new ke(e)),t}k(t){_e(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(g()),this.O(g()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=de(e).nextSibling;de(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Me=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=C,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=C}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=T(this,e,t,0),a=!_(e)||e!==this._$AH&&e!==S,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=T(this,r[n+o],t,o),s===S&&(s=this._$AH[o]),a||=!_(s)||s!==this._$AH[o],s===C?e=C:e!==C&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===C?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ne=class extends Me{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===C?void 0:e}},Pe=class extends Me{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==C)}},Fe=class extends Me{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=T(this,e,t,0)??C)===S)return;let n=this._$AH,r=e===C&&n!==C||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==C&&(n===C||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ie=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){T(this,e)}},Le=ue.litHtmlPolyfillSupport;Le?.(ke,je),(ue.litHtmlVersions??=[]).push(`3.3.3`);var Re=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new je(t.insertBefore(g(),e),e,void 0,n??{})}return i._$AI(e),i},ze=globalThis,E=class extends p{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Re(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};E._$litElement$=!0,E.finalized=!0,ze.litElementHydrateSupport?.({LitElement:E});var Be=ze.litElementPolyfillSupport;Be?.({LitElement:E}),(ze.litElementVersions??=[]).push(`4.2.2`);var Ve={attribute:!0,type:String,converter:se,reflect:!1,hasChanged:ce},He=(e=Ve,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function D(e){return(t,n)=>typeof n==`object`?He(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Ue(e){return D({...e,state:!0,attribute:!1})}var We=new Map;function Ge(e){We.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),We.set(e.type,e)}function Ke(){return Array.from(We.values())}var qe={width:`auto`},Je={rasterX:0,rasterY:0,rasterW:{spalten:24,spaltePx:40,zeilePx:12,gapPx:8}.spalten,rasterH:1},Ye=`weitereQuellen`,Xe={[Ye]:[]},Ze=`folgtAuswahl`,Qe={[Ze]:[]};function O(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var k=class extends E{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
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
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ge({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...qe,...Je,...e.acceptsDataSource?Xe:null,...e.kannAuswahlFolgen?Qe:null,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,auswahlGeber:e.auswahlGeber,kannAuswahlFolgen:e.kannAuswahlFolgen,bindableSpots:e.bindableSpots,actionValueSpots:e.actionValueSpots,listenBindung:e.listenBindung,blockEvents:e.blockEvents,pageBlock:e.pageBlock,raster:e.raster})}};O([D({type:Boolean,reflect:!0,attribute:`data-editable`})],k.prototype,`editable`,void 0);var $e=`data-ff-block-id`,et=[`fixed`,`context`,`data_field`,`block_value`,`gewaehlte_zeile`,`previous_result`,`step_result`,`se_variable`];function tt(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function nt(e){return!tt(e)||typeof e.source!=`string`||!et.includes(e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`||e.blockId!==void 0&&typeof e.blockId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{},...typeof e.blockId==`string`?{blockId:e.blockId}:{}}}function rt(e){if(!tt(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!tt(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=nt(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=nt(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function it(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!tt(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=rt(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}function A(e){return typeof e==`object`&&!!e}function j(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!A(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function at(e){return e==null?``:String(e).trim()}function M(e,t){if(!A(e)||t===``)return``;let n=t.trim(),r=at(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=at(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=at(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function ot(e,t,n){if(!A(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function st(e){if(!A(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function N(e,t){return at(e).toLowerCase()===t.trim().toLowerCase()}function P(e,t,n){if(!A(e)||!A(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(A(e)&&(N(e.ALIAS,t)||N(e.alias,t))){let t=st(e);if(t.length>0)return t}}else if(A(i))for(let e of Object.keys(i)){let n=i[e];if(N(e,t)||A(n)&&(N(n.ALIAS,t)||N(n.alias,t))){let e=st(n);if(e.length>0)return e}}let a=r.Tabellen;if(A(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=st(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(N(e,t)){let t=st(a[e]);if(t.length>0)return t}}return[]}function ct(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!A(t)||!A(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function lt(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!A(t)||!A(t.MSG)))return t.MSG.DATA}function ut(e){if(e==null)return``;try{return JSON.stringify(e)??``}catch{return``}}var F=new Map,dt=new Set,ft=!1,pt=!1;function mt(){if(ft){pt=!0;return}ft=!0;try{do pt=!1,dt.forEach(e=>e());while(pt)}finally{ft=!1}}function ht(e){dt.add(e)}function gt(e){return F.get(e)?.zeile}function _t(e){return F.get(e)?.merkmal??``}function vt(e,t){if(e===``)return;let n=ut(t);if(n===``)return;let r=F.get(e);r&&r.merkmal===n?F.delete(e):F.set(e,{zeile:t,merkmal:n}),mt()}function yt(e){F.has(e)&&(F.delete(e),mt())}var bt=Ze.toLowerCase();function xt(e){let t=e.getAttribute(bt)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.geberId!=`string`||e.geberId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({geberId:e.geberId,keyPairs:r})}return n}catch{return[]}}function St(e,t){let n=t,r=!1;for(let t of xt(e)){let e=gt(t.geberId);e!==void 0&&(r=!0,n=n.filter(n=>t.keyPairs.every(t=>{let r=M(e,t.fromField);return r!==``&&r===M(n,t.toField)})))}return{rows:n,gefiltert:r}}function Ct(e,t){if(xt(e).length===0)return t[0];let{rows:n,gefiltert:r}=St(e,t);return r?n[0]:void 0}var wt=`root`;function Tt(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var I=class extends k{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[wt]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[k.styles,o`
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
    `]}onClose(){this.hasAttribute(`data-ff-editor`)||this.removeAttribute(`offen`)}render(){return b`<div class="abdunklung"></div>
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
      </div>`}};O([D()],I.prototype,`name`,void 0),O([D()],I.prototype,`breite`,void 0),O([D()],I.prototype,`hoehe`,void 0),k.defineAndRegister(I);var Et=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Dt(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Ot(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}function L(){return globalThis}function kt(){let e=L();return A(e.SEDATA)&&A(e.SEDATA.Daten)}function At(){let e=L();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function jt(){let e=L();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var Mt=new Set,Nt=new Set;function Pt(e){Mt.add(e)}function Ft(e){return Nt.add(e),()=>{Nt.delete(e)}}function It(){Mt.forEach(e=>e())}function Lt(e){Nt.forEach(t=>{try{t(e)}catch{}})}var R=new Map,Rt=``,zt=0;function Bt(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function Vt(){let e=Bt();e&&(e.value=Array.from(R,([e,t])=>`${e}: ${t}`).join(`
`)+(Rt===``?``:`\n\nERSTES PAKET\n${Rt}`))}function z(e,t){R.set(e,t),Vt()}function Ht(){let e=L();R.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),R.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),R.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),R.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),R.set(`Empfangene Pakete`,String(zt)),R.set(`SEDATA.Daten`,kt()?`vorhanden`:`fehlt`),Vt()}function Ut(e){if(Rt===``)try{Rt=typeof e==`string`?e:JSON.stringify(e)??``,Vt()}catch{}}function Wt(e){zt+=1,Ut(e),z(`Empfangene Pakete`,String(zt));let t=ct(e);if(!t){z(`Letztes Paket`,`Antwort ohne Daten`),Lt(e);return}let n=L();A(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,z(`Letztes Paket`,`Daten-Push angenommen`),z(`SEDATA.Daten`,`vorhanden`),jt(),It()}function Gt(e=0){let t=L();if(typeof t.basisHTML_REGISTER==`function`){Ht();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{Wt(e)},document.title,`1.0`),z(`Registrierung`,`ausgeführt`)}catch(e){z(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&z(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{Gt(e+1)},25)):(Ht(),z(`Registrierung`,`nach 10s kein Interface`))}var Kt=!1;function qt(){if(Kt)return;Kt=!0,z(`Runtime`,`gestartet`),z(`Registrierung`,`noch nicht ausgeführt`),Ht(),At();let e=L();e.Erstellen=()=>{jt(),It()},e.initData=e.Erstellen,e.ReloadData=()=>{It()},Gt(),window.addEventListener(`message`,e=>{if(typeof L().basisHTML_REGISTER==`function`)return;let t=lt(e.data);t!==void 0&&Wt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){Ht();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,kt()?(clearInterval(n),z(`SEDATA.Daten`,`vorhanden`),jt(),It()):t>100&&(clearInterval(n),z(`Daten-Wartezeit`,`nach 30s ohne Daten`))},300)}var Jt=8e3,B=null,V=null;function Yt(){let e=document.createElement(`div`);return e.setAttribute(`data-ff-meldung`,``),e.setAttribute(`role`,`alert`),e.style.cssText=[`position:fixed`,`top:0`,`left:0`,`right:0`,`z-index:2147483647`,`padding:7px 12px`,`background:var(--se-red-soft,#fbe7e6)`,`color:var(--se-red,#c0201a)`,`border-bottom:1px solid var(--se-red,#c0201a)`,`font:500 12px/1.4 system-ui,sans-serif`,`cursor:pointer`].join(`;`),e.title=`Klicken zum Schliessen`,e.addEventListener(`click`,Xt),e}function Xt(){V&&=(clearTimeout(V),null),B?.remove(),B=null}function H(e){typeof document>`u`||!document.body||(B||(B=Yt(),document.body.appendChild(B)),B.textContent=e,V&&clearTimeout(V),V=setTimeout(Xt,Jt))}function Zt(e){return e instanceof Error?e.message:String(e)}function Qt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!A(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Et.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var $t=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function en(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function tn(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function nn(e,t){if(t>12)return;let n=tn(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=nn(n,t+1);if(e!==void 0)return e}return}if(A(e)){for(let n of $t){if(!(n in e))continue;let r=nn(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=nn(n,t+1);if(e!==void 0)return e}}}function rn(e){let t=en(e);if(A(t)){for(let e of $t){if(!(e in t))continue;let n=nn(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=rn(t);if(e!==void 0)return e}else if(A(e)){let t=rn(e);if(t!==void 0)return t}}}function an(e){return A(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function on(e,t){if(!A(e))return;let n=an(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=rn(e[t]);if(n!==void 0)return n}}var sn=[],cn=!1,ln=6e3,un=100;function dn(){if(cn||sn.length===0)return;cn=!0;let e=sn.shift(),t=L(),n=new Set(an(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),cn=!1,e.resolve(t),dn())},a=Ft(e=>{let t=rn(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=on(L().SEDATA,n);e!==void 0&&i(e)},un),s=setTimeout(()=>{H(`Daten laden: SoftEngine hat nicht geantwortet (Relation Nr. ${e.template.nr}).`),i(``)},ln);if(typeof t.basisHTML_SND_MSG!=`function`){H(`Daten laden nicht moeglich: keine Verbindung zu SoftEngine.`),i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch(t){H(`Daten laden fehlgeschlagen (Relation Nr. ${e.template.nr}): ${Zt(t)}`),i(``)}}function fn(e,t){qt();let n=L();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG!=`function`)return H(`Speichern nicht moeglich: keine Verbindung zu SoftEngine. Die Eingabe wurde NICHT uebernommen.`),Promise.resolve(``);try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch(t){H(`Speichern fehlgeschlagen (Relation Nr. ${e.nr}): ${Zt(t)}`)}return Promise.resolve(``)}return new Promise(n=>{sn.push({template:e,params:[...t],resolve:n}),dn()})}function pn(e,t){if(!A(t))return``;let n=t.document;if(!n||typeof n.querySelectorAll!=`function`)return``;let r=Array.from(n.querySelectorAll(`[${$e}]`)).find(t=>t.getAttribute($e)===e.blockId);if(!r)return``;let i=r[e.value];return i==null?``:String(i)}function mn(e,t,n=L()){if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);return Number.isInteger(n)&&n>=0?t.stepResults?.[n]??``:``}if(e.source===`block_value`)return pn(e,n);if(e.source===`gewaehlte_zeile`){let n=t.gewaehlteZeile?.(e.blockId??``);return n===void 0?``:M(n,e.value)}if(!A(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!A(t)||!A(t.Daten)||!A(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=j(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=P(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>M(e,r.indexField)===a):i[0];return o?M(o,e.value):``}function hn(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function gn(e,t){if(e.trim()===``)return;let n=L();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(hn(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function _n(e,t,n){if(t.trim()!==``)for(let r of Array.from(e.querySelectorAll(I.tagName)))(r.getAttribute(`name`)??``)===t&&(n?r.setAttribute(`offen`,``):r.removeAttribute(`offen`))}var vn=new WeakMap;async function yn(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=it(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=vn.get(e);if(i||(i=new Set,vn.set(e,i)),!i.has(t)){i.add(t);try{let t={...n,NOW_DATE:Dt(new Date)},i=``,a=[];for(let n of r){if(n.type===`START_TOOL`){gn(n.toolNr,Ot({params:n.toolParams},t)),a.push(``);continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){_n(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),a.push(``);continue}let r=Qt(L().FF_RELATIONS,n.relationId);if(!r){a.push(``);continue}let o={context:t,previousResult:i,stepResults:a,gewaehlteZeile:gt},s=await fn(r,[...n.params,...n.extraParams].map(e=>mn(e,o)));a.push(s),r.verb===`GET_RELATION`&&(i=s),n.resultKey!==``&&(t[n.resultKey]=s)}}finally{i.delete(t)}}}var bn=new WeakSet;function xn(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||bn.has(e))return;bn.add(e);let n=it(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&qt(),e.addEventListener(`click`,()=>{yn(e,t,{})})}var Sn=class extends k{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.raster={startW:4,startH:2,minW:2,minH:2}}static{this.customProperties=[]}static{this.styles=[k.styles,o`
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
    `]}render(){return b`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),xn(this,`onClick`)}};O([D()],Sn.prototype,`label`,void 0),k.defineAndRegister(Sn);var Cn=[`info`,`success`,`warning`,`danger`];function wn(e){return Cn.includes(e)?e:`info`}function Tn(e,t){return{attributeName:e,name:`Farbe`,description:t,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var En=o`
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
`,Dn={dog:x`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,cat:x`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,rabbit:x`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,hamster:x`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,bird:x`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,reptile:x`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,paw:x`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`},On=[[`welpe`,`dog`],[`hund`,`dog`],[`kater`,`cat`],[`katze`,`cat`],[`kaninchen`,`rabbit`],[`hase`,`rabbit`],[`meerschweinchen`,`hamster`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`bird`],[`sittich`,`bird`],[`papagei`,`bird`],[`vogel`,`bird`],[`schildkr`,`reptile`],[`echse`,`reptile`],[`schlange`,`reptile`],[`gecko`,`reptile`],[`reptil`,`reptile`]];function kn(e){let t=e.toLowerCase(),n=`paw`;for(let[e,r]of On)if(t.includes(e)){n=r;break}return b`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${Dn[n]}</svg>`}var U=class extends k{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[Tn(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[k.styles,En,o`
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
    `]}stelle(e,t){return b`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}render(){let e=wn(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.heading)||n(this.heading2),i=n(this.time)||n(this.date);return b`<div class="card v-${e}">
      ${n(this.avatar)||r||n(this.meta)||i?b`<div class="main">
            ${n(this.avatar)?b`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?C:kn(this.avatar)}</span>`:C}
            <div class="titles">
              ${r?b`<div class="trow">
                    ${n(this.heading)?this.stelle(`heading`,`heading`):C}
                    ${n(this.heading2)?this.stelle(`heading2`,`heading2`):C}
                  </div>`:C}
              ${n(this.meta)?this.stelle(`meta`,`meta`):C}
            </div>
            ${i?b`<div class="when">
                  ${n(this.date)?this.stelle(`date`,`date`):C}
                  ${n(this.time)?this.stelle(`time`,`time`):C}
                </div>`:C}
          </div>`:C}
      ${n(this.text)?this.stelle(`text`,`text`):C}
      ${n(this.chipText)?b`<span
            class="chip v-${e}"
            data-ff-editable
            data-ff-spot="chipText"
            ?data-ff-bound=${this.chipTextField!==``}
            @dblclick=${e=>this.inlineEdit(e,`chipText`)}
          >${this.chipText}</span>`:C}
    </div>`}};O([D()],U.prototype,`chipVariant`,void 0),O([D()],U.prototype,`heading`,void 0),O([D()],U.prototype,`heading2`,void 0),O([D()],U.prototype,`time`,void 0),O([D()],U.prototype,`date`,void 0),O([D()],U.prototype,`avatar`,void 0),O([D()],U.prototype,`meta`,void 0),O([D()],U.prototype,`text`,void 0),O([D()],U.prototype,`chipText`,void 0),O([D()],U.prototype,`headingField`,void 0),O([D()],U.prototype,`heading2Field`,void 0),O([D()],U.prototype,`timeField`,void 0),O([D()],U.prototype,`dateField`,void 0),O([D()],U.prototype,`avatarField`,void 0),O([D()],U.prototype,`metaField`,void 0),O([D()],U.prototype,`textField`,void 0),O([D()],U.prototype,`chipTextField`,void 0),k.defineAndRegister(U);function An(e){let t=String(e??``).trim();if(t===``)return``;let n=/^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(t);if(n)return`${n[3]}-${n[2].padStart(2,`0`)}-${n[1].padStart(2,`0`)}`;let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return r?`${r[1]}-${r[2]}-${r[3]}`:``}function jn(e){let t=String(e.getMonth()+1).padStart(2,`0`),n=String(e.getDate()).padStart(2,`0`);return`${e.getFullYear()}-${t}-${n}`}function Mn(e,t){let n=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!n)return``;let r=new Date(Number(n[1]),Number(n[2])-1,Number(n[3]));return r.setDate(r.getDate()+t),jn(r)}var Nn=``,Pn=new Set;function Fn(){return Nn}function In(e){let t=An(e);t!==Nn&&(Nn=t,Pn.forEach(e=>e()))}function Ln(e){Pn.add(e)}var Rn=class extends k{constructor(...e){super(...e),this.tag=``}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.defaultProps={}}static{this.customProperties=[]}static{this.raster={startW:9,startH:2,minW:5,minH:2}}static{this.styles=[k.styles,o`
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
    `]}setzeTag(e){In(e),this.tag=Fn()}render(){return b`<div class="waehler">
      <div class="riegel">
        <button class="pfeil" title="Vortag" @click=${()=>this.setzeTag(Mn(this.tag,-1))}>‹</button>
        <input
          class="feld"
          type="date"
          .value=${this.tag}
          @change=${e=>this.setzeTag(e.target.value)}
        />
        <button class="pfeil" title="Folgetag" @click=${()=>this.setzeTag(Mn(this.tag,1))}>›</button>
      </div>
      <button class="heute" @click=${()=>this.setzeTag(jn(new Date))}>Heute</button>
    </div>`}connectedCallback(){super.connectedCallback(),this.tag=Fn()||jn(new Date),this.hasAttribute(`data-ff-editor`)||this.setzeTag(this.tag)}};O([Ue()],Rn.prototype,`tag`,void 0),k.defineAndRegister(Rn);function zn(e){return`${e.toLowerCase()}field`}function Bn(e){let t=e.split(`::`);if(t.length!==2)return{quelleId:``,code:e};let[n,r]=t;return n===``||r===``?{quelleId:``,code:e}:{quelleId:n,code:r}}function Vn(e){let t=new Set,n=!1,r=()=>{kt()&&t.forEach(e.hydriere)};return{connect:i=>{i.hasAttribute(`data-ff-editor`)||(t.add(i),e.verdrahte?.(i),n||(n=!0,Pt(r),Ln(r),ht(r)),qt(),kt()&&e.hydriere(i))},disconnect:e=>{t.delete(e)},hydriereAlle:r}}var Hn=Ye.toLowerCase(),Un=``;function Wn(e){if(e.length===0)return``;let t=[];for(let n of e){let e=n.trim();if(e===``)return``;t.push(e)}return t.join(Un)}function Gn(e){let t=e.getAttribute(Hn)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.quelleId!=`string`||e.quelleId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({quelleId:e.quelleId,keyPairs:r})}return n}catch{return[]}}function Kn(e){let t=Gn(e);if(t.length===0)return(e,t)=>M(e,Bn(t).code);let n=L().SEDATA,r=L().FF_DATA_SOURCES,i=new Map;for(let e of t){let t=j(r,e.quelleId);if(!t)continue;let a=P(n,t.name,t.tableId),o=new Map;for(let t of a){let n=Wn(e.keyPairs.map(e=>M(t,e.toField)));n!==``&&!o.has(n)&&o.set(n,t)}i.set(e.quelleId,{nachSchluessel:o,hierFelder:e.keyPairs.map(e=>e.fromField)})}return(e,t)=>{let{quelleId:n,code:r}=Bn(t);if(n===``)return M(e,r);let a=i.get(n);if(!a)return``;let o=Wn(a.hierFelder.map(t=>M(e,t)));if(o===``)return``;let s=a.nachSchluessel.get(o);return s===void 0?``:M(s,r)}}var W=new WeakMap,qn=new WeakSet;function Jn(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function Yn(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function Xn(e){return typeof e.value==`string`?e.value:``}function Zn(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(zn(`value`))??``;if(t===``||n===``){W.delete(e);return}let r=j(L().FF_DATA_SOURCES,t);if(!r){W.delete(e);return}let i=Ct(e,P(L().SEDATA,r.name,r.tableId));if(i===void 0){W.delete(e),e.value=``;return}let a=r.indexField===``?``:M(i,r.indexField),{quelleId:o,code:s}=Bn(n);o===``?W.set(e,{row:i,code:s,pindex:a}):W.delete(e),e.value=o===``?M(i,s):Kn(e)(i,n)}function Qn(e){let t=W.get(e);return t&&ot(t.row,t.code,Xn(e)),t}function $n(e){qn.has(e)||(qn.add(e),e.addEventListener(`input`,()=>{Qn(e)}),e.addEventListener(`change`,()=>{let t=Qn(e);yn(e,`onChange`,{VALUE:Xn(e),PINDEX:t?.pindex??``})}))}var er=Vn({hydriere:Zn,verdrahte:$n}),tr=er.connect,nr=er.disconnect,rr=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`];function ir(e){return rr.includes(e)?e:`text`}var ar=[`text`,`number`,`textarea`,`select`],G=class extends k{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``,this.angehakt=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource=!0}static{this.kannAuswahlFolgen=!0}static{this.bindableSpots=[{prop:`value`,label:`Wert`}]}static{this.actionValueSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``}}static{this.raster={startW:6,startH:2,minW:2,minH:2}}static{this.customProperties=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,kind:`field`}]}static{this.styles=[k.styles,o`
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
    `]}onInput(e){let t=e.target;this.value=ir(this.fieldType)===`date`?Yn(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return b`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){this.hasAttribute(`data-ff-editor`)||this.setzeHaken(!this.angehakt)}setzeHaken(e){this.angehakt!==e&&(this.angehakt=e,this.dispatchEvent(new Event(`change`)))}controlTpl(e){switch(e){case`textarea`:return b`<textarea class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``),t=this.value!==``&&!e.includes(this.value);return b`<select class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}>
          <option value="" disabled hidden></option>
          ${t?b`<option value=${this.value} hidden>${this.value}</option>`:C}
          ${e.length===0?b`<option disabled>(keine Optionen)</option>`:e.map(e=>b`<option value=${e}>${e}</option>`)}
        </select>`}default:return b`<input
          class="ctrl"
          type=${e}
          .value=${e===`date`?Jn(this.value):this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`}}render(){let e=ir(this.fieldType);return e===`checkbox`?b`<div class="feld">
        <div class="zeile">
          <input
            class="ctrl"
            type="checkbox"
            .checked=${this.angehakt}
            @change=${e=>this.setzeHaken(e.target.checked)}
          />
          ${this.textTpl(`text`)}
        </div>
      </div>`:b`<div class="feld">
      <div
        class="huelle"
        data-ff-spot="value"
        ?data-ff-bound=${this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${ar.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this.value!==``):C}
      </div>
    </div>`}connectedCallback(){super.connectedCallback(),tr(this)}disconnectedCallback(){super.disconnectedCallback(),nr(this)}};O([D()],G.prototype,`fieldType`,void 0),O([D()],G.prototype,`placeholder`,void 0),O([D()],G.prototype,`options`,void 0),O([D()],G.prototype,`source`,void 0),O([D()],G.prototype,`value`,void 0),O([D()],G.prototype,`valueField`,void 0),O([Ue()],G.prototype,`angehakt`,void 0),k.defineAndRegister(G);function or(e,t,n,r){return{attributeName:e,name:t,description:n,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var K=class extends k{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[U.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[Tn(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),or(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte landen sie in der ersten Spalte.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[k.styles,o`
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return b`<div class="col v-${wn(this.variant)}">
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
    </div>`}};O([D()],K.prototype,`variant`,void 0),O([D()],K.prototype,`heading`,void 0),O([Ue()],K.prototype,`_count`,void 0),k.defineAndRegister(K);function sr(e,t,n){return t===``||n===``?[...e]:e.filter(e=>An(M(e,t))===n)}function cr(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function lr(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var ur=new WeakMap,dr=K.tagName,fr=U.tagName;function pr(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===dr)}function mr(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===fr)}function hr(e){return Ke().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function gr(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=j(L().FF_DATA_SOURCES,t);if(!r)return;let i=pr(e);if(i.length===0)return;let a=ur.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(fr);t&&(a=t.cloneNode(!0),ur.set(e,a))}if(!a)return;let o=sr(P(L().SEDATA,r.name,r.tableId),e.getAttribute(`tagfield`)??``,Fn()),s=i.map(e=>e.getAttribute(`heading`)??``),c=hr(a.tagName),l=lr(i.map(e=>e.getAttribute(`auffang`))),u=Kn(e);for(let e of i)mr(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:cr(M(e,n),s);(o>=0?i[o]:l>=0?i[l]:i[0]).appendChild(t);for(let n of c){let r=t.getAttribute(zn(n.prop))??``;r!==``&&(t[n.prop]=u(e,r))}let d=r.indexField===``?``:M(e,r.indexField);q.set(t,{row:e,pindex:d}),t.draggable=!0}let d=e.getAttribute(`data-ff-id`)??``;if(d!==``){let e=_t(d);if(e!==``){let t=!1;for(let n of i)for(let r of mr(n)){let n=q.get(r);n&&ut(n.row)===e&&(r.setAttribute(`data-ff-auswahl`,``),t=!0)}t||yt(d)}}}var q=new WeakMap,J=null,_r=new WeakSet;function vr(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===dr&&e.contains(n))return n;return null}function yr(e,t){if(!J||J.board!==e)return;let n=q.get(J.card);if(!n)return;let r=t.getAttribute(`heading`)??``;yn(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r})}function br(e){_r.has(e)||(_r.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&q.has(e))??null;if(!n)return;let r=q.get(n);r&&vt(e.getAttribute(`data-ff-id`)??``,r.row),yn(e,`onCardClick`,{PINDEX:r?.pindex??``})}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&q.has(e))??null;n&&(J={card:n,board:e},t.dataTransfer?.setData(`text/plain`,q.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{J=null}),e.addEventListener(`dragover`,t=>{let n=vr(e,t);J?.board===e&&n&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=vr(e,t);n&&(t.preventDefault(),yr(e,n),J=null)}))}var xr=Vn({hydriere:gr,verdrahte:br}),Sr=xr.connect,Cr=xr.disconnect,Y=K.blockType,wr=class extends k{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[Y]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:Y}}static{this.templateChild={type:U.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.auswahlGeber=!0}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``,tagField:``}}static{this.raster={startW:24,startH:20,minW:6,minH:8}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,kind:`field`},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt das Board nur Einträge des Tages, den der Tageswähler zeigt. Leer = alle Einträge.`,kind:`field`}]}static{this.defaultChildren=[{type:Y,props:{heading:`Offen`,variant:`warning`},children:[{type:U.blockType}]},{type:Y,props:{heading:`In Arbeit`,variant:`info`}},{type:Y,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[k.styles,o`
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
    `]}render(){return b`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Sr(this)}disconnectedCallback(){super.disconnectedCallback(),Cr(this)}};k.defineAndRegister(wr);var Tr={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Er=e=>(...t)=>({_$litDirective$:e,values:t}),Dr=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Or=`important`,kr=` !important`,Ar=Er(class extends Dr{constructor(e){if(super(e),e.type!==Tr.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(kr);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?Or:``):n[e]=r}}return S}});function jr(e){let t=e.getAttribute(`spalten`)??``;if(t===``)return[];try{let e=JSON.parse(t);return Array.isArray(e)?e.map(e=>e&&typeof e==`object`&&typeof e.feld==`string`?e.feld:``):[]}catch{return[]}}function Mr(e){let t=e.getAttribute(`source`)??``;if(t===``){e.datenzeilen=[];return}let n=j(L().FF_DATA_SOURCES,t);if(!n){e.datenzeilen=[];return}let r=jr(e),{rows:i,gefiltert:a}=St(e,sr(P(L().SEDATA,n.name,n.tableId),e.getAttribute(`tagfield`)??``,Fn())),o=e.getAttribute(`data-ff-id`)??``,s=-1;if(o!==``){let e=_t(o);e!==``&&(s=i.findIndex(t=>ut(t)===e),s<0&&yt(o))}let c=Kn(e);e.rohzeilen=i,e.auswahlIndex=s,e.durchAuswahlGefiltert=a,e.datenzeilen=i.map(e=>r.map(t=>t===``?``:c(e,t)))}var Nr=Vn({hydriere:Mr}),Pr=Nr.connect,Fr=Nr.disconnect,Ir=1,Lr=/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/,Rr=/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/,zr=/^(\d{4})-(\d{2})-(\d{2})$/;function Br(e){let t=e.trim();if(t===``||!Lr.test(t))return null;let n=t.includes(`,`)?t.replace(/\./g,``).replace(`,`,`.`):/^-?\d{1,3}(\.\d{3})+$/.test(t)?t.replace(/\./g,``):t,r=Number(n);return Number.isFinite(r)?r:null}function Vr(e){let t=e.trim();if(t===``)return null;let n=zr.exec(t);if(n){let[,e,t,r]=n;return Hr(Number(e),Number(t),Number(r))}let r=Rr.exec(t);if(r){let[,e,t,n]=r,i=Number(n);return Hr(n.length===2?i<=69?2e3+i:1900+i:i,Number(t),Number(e))}return null}function Hr(e,t,n){if(t<1||t>12||n<1||n>31)return null;let r=new Date(e,t-1,n);return r.getFullYear()!==e||r.getMonth()!==t-1||r.getDate()!==n?null:r.getTime()}function Ur(e){let t=0,n=0,r=0;for(let i of e)i.trim()!==``&&(t++,Br(i)!==null&&n++,Vr(i)!==null&&r++);return t===0?`text`:r===t?`datum`:n===t?`zahl`:`text`}var Wr=new Intl.Collator(`de`,{numeric:!0,sensitivity:`base`});function Gr(e,t,n){if(t<0||e.length===0)return e.map((e,t)=>t);let r=n=>e[n][t]??``,i=Ur(e.map(e=>e[t]??``)),a=n?1:-1;return e.map((e,t)=>t).sort((e,t)=>{let n=r(e).trim(),o=r(t).trim();if(n===``&&o===``)return e-t;if(n===``)return Ir;if(o===``)return-1;let s=i===`zahl`?(Br(n)??0)-(Br(o)??0):i===`datum`?(Vr(n)??0)-(Vr(o)??0):Wr.compare(n,o);return s===0?e-t:s*a})}function Kr(e){return e.trim().toLowerCase().split(/\s+/).filter(e=>e!==``)}function qr(e,t){let n=Kr(t);if(n.length===0)return!0;let r=e.join(` `).toLowerCase();return n.every(e=>r.includes(e))}function Jr(e,t){let n=[];return e.forEach((e,r)=>{qr(e,t)&&n.push(r)}),n}function Yr(e,t){return!e&&t.trim()!==``}function Xr(e){if(!e.hatQuelle)return`— Datensätze`;let t=e.auswahlAktiv?` · durch Auswahl gefiltert`:``,n=e=>e===1?`Datensatz`:`Datensätze`,r=e=>e===1?`Datensatz`:`Datensätzen`;return e.suchtAktiv?e.sichtbar===0?`Kein Treffer von ${e.gesamt} ${r(e.gesamt)}`+t:`${e.sichtbar} von ${e.gesamt} ${r(e.gesamt)}`+t:(e.gesamt===0?`Keine Datensätze`:`${e.gesamt} ${n(e.gesamt)}`)+t}var Zr=o`
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
`,Qr=`Spalte {n}`;function X(e){return Qr.replace(`{n}`,String(e+1))}function Z(){return[0,1,2].map(e=>({titel:X(e),feld:``}))}function $r(e,t){if(e&&typeof e==`object`){let n=e;return{titel:typeof n.titel==`string`?n.titel:X(t),feld:typeof n.feld==`string`?n.feld:``}}return typeof e==`string`?{titel:e,feld:``}:{titel:X(t),feld:``}}function ei(e){let t;if(Array.isArray(e))t=e.map((e,t)=>$r(e,t));else if(typeof e==`number`&&Number.isFinite(e)||typeof e==`string`&&/^\d+$/.test(e)){let n=Math.max(1,Math.floor(Number(e)));t=[...Array(n).keys()].map(e=>({titel:X(e),feld:``}))}else t=Z();return t.length>8&&(t=t.slice(0,8)),t.length<1&&(t=[{titel:X(0),feld:``}]),t}function ti(e){try{return ei(JSON.parse(e))}catch{return Z()}}var ni=4,ri=[10,25,50],ii=220,Q=class e extends k{constructor(...e){super(...e),this.spalten=Z(),this.source=``,this.suche=`ja`,this._suchtext=``,this.datenzeilen=[],this.rohzeilen=[],this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._proSeiteWahl=null,this._klickTimer=null}static{this.blockType=`tabelle`}static{this.tagName=`ff-tabelle`}static{this.displayName=`Tabelle`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.auswahlGeber=!0}static{this.kannAuswahlFolgen=!0}static{this.listenBindung={prop:`spalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:Qr}}static{this.defaultProps={width:`fill`,source:``,spalten:Z(),suche:`ja`,tagField:``}}static{this.customProperties=[{attributeName:`suche`,name:`Suchzeile`,description:`Zeigt ueber der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.`,kind:`segment`,options:[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],requiresDataSource:!0},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Saetze des Tages, den der Tageswaehler zeigt. Leer = alle Saetze.`,kind:`field`}]}static{this.raster={startW:14,startH:8,minW:6,minH:4}}get proSeiteAktuell(){return this._proSeiteWahl??ri[0]}spaltenListe(){return ei(this.spalten)}sichtbareIndizes(){let e=Jr(this.datenzeilen,this._suchtext);return this._sortSpalte<0?e:Gr(e.map(e=>this.datenzeilen[e]),this._sortSpalte,this._sortAuf).map(t=>e[t])}klickZeile(e){if(e===null||this.hasAttribute(`data-ff-editor`))return;let t=this.getAttribute(`data-ff-id`)??``,n=this.rohzeilen[e];t===``||n===void 0||vt(t,n)}setzeSuchtext(e){this._suchtext=e,this._seite=0,this.requestUpdate()}klickSortiere(e){this.editable||(this._sortSpalte===e?this._sortAuf=!this._sortAuf:(this._sortSpalte=e,this._sortAuf=!0),this._seite=0,this.requestUpdate())}aendere(e){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`spalten`,value:e},bubbles:!0,composed:!0}))}klickSpaltenkopf(t,n){if(!this.editable)return;t.stopPropagation();let r=t.currentTarget.getBoundingClientRect();this.klickTimerAus(),this._klickTimer=setTimeout(()=>{this._klickTimer=null,this.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:e.listenBindung.prop,index:n,top:r.bottom+4,left:r.left},bubbles:!0,composed:!0}))},ii)}klickTimerAus(){this._klickTimer!==null&&(clearTimeout(this._klickTimer),this._klickTimer=null)}bearbeiteTitel(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n)return;e.stopPropagation(),e.preventDefault();let r=Array.from(n.childNodes),i=n.textContent??``;n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let a=window.getSelection(),o=document.createRange();o.selectNodeContents(n),a?.removeAllRanges(),a?.addRange(o);let s=!1,c=e=>{if(s)return;s=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,l),n.removeEventListener(`keydown`,u);let a=(n.textContent??``).trim(),o=this.spaltenListe();e&&a&&a!==i.trim()&&t<o.length?(o[t]={...o[t],titel:a},this.aendere(o)):n.replaceChildren(...r)},l=()=>c(!0),u=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),c(!1))};n.addEventListener(`blur`,l),n.addEventListener(`keydown`,u)}connectedCallback(){super.connectedCallback(),Pr(this)}disconnectedCallback(){super.disconnectedCallback(),this.klickTimerAus(),Fr(this)}static{this.styles=[k.styles,Zr]}render(){let e=this.spaltenListe(),t={gridTemplateColumns:`repeat(${e.length}, minmax(0, 1fr))`},n=e=>e.stopPropagation(),r=this.sichtbareIndizes(),i=Yr(this.hasAttribute(`data-ff-editor`),this.source),a=r.length,o=this.proSeiteAktuell,s=i?Math.max(1,Math.ceil(a/o)):1,c=Math.min(Math.max(this._seite,0),s-1),l=i?r.slice(c*o,(c+1)*o):[],u=i?o:ni,d=i?``:`—`,ee=[...l,...Array.from({length:Math.max(0,u-l.length)},()=>null)];return b`<div class="tabelle" style=${Ar({"--spalten-zahl":String(e.length)})}>
      <div class="steuerung">
        <button
          title="Letzte Spalte entfernen"
          @pointerdown=${n}
          @click=${e=>{n(e);let t=this.spaltenListe();t.length>1&&(t.pop(),this.aendere(t))}}
        >−</button>
        <button
          title="Spalte hinzufügen"
          @pointerdown=${n}
          @click=${e=>{n(e);let t=this.spaltenListe();t.length<8&&(t.push({titel:X(t.length),feld:``}),this.aendere(t))}}
        >+</button>
      </div>
      ${this.suche===`ja`?b`<div class="suchzeile">
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
      <div class="kopf" style=${Ar(t)}>
        ${e.map((e,t)=>b`<div
            data-ff-editable
            @dblclick=${e=>{this.klickTimerAus(),this.bearbeiteTitel(e,t)}}
            @click=${e=>{this.klickSpaltenkopf(e,t),this.klickSortiere(t)}}
          >${e.titel}${!this.editable&&this._sortSpalte===t?b`<span class="sort-pfeil">${this._sortAuf?` ▲`:` ▼`}</span>`:``}</div>`)}
      </div>
        ${ee.map(n=>b`<div
            class="zeile${n!==null&&i?` waehlbar`:``}${n!==null&&n===this.auswahlIndex?` gewaehlt`:``}"
            style=${Ar(t)}
            @click=${()=>this.klickZeile(n)}
          >
            ${n===null?e.map(()=>b`<div>${d}</div>`):(this.datenzeilen[n]??[]).map(e=>b`<div>${e}</div>`)}
          </div>`)}
        <div class="lineal"></div>
      </div>
      <!-- Fusszeile IMMER: sie gehoert zum Aufbau der Tabelle, also muss der
           Editor sie zeigen (Regel 1 — was zu sehen ist, IST der Export).
           Vorher erschien sie nur mit Daten; im Editor fehlte sie damit
           komplett, und der Bediener suchte vergeblich nach der
           Seiteneinstellung. Ohne Daten steht statt einer erfundenen Zahl
           ein Strich (Regel 7). -->
      <div class="fusszeile">
        <div class="seiten-info">${Xr({hatQuelle:i,sichtbar:a,gesamt:this.datenzeilen.length,suchtAktiv:this._suchtext.trim()!==``,auswahlAktiv:this.durchAuswahlGefiltert})}</div>
        <div class="seiten-nav">
          <select
            aria-label="Zeilen pro Seite"
            @pointerdown=${n}
            @change=${e=>{this._proSeiteWahl=Number(e.target.value),this._seite=0,this.requestUpdate()}}
          >${ri.map(e=>b`<option value=${e} ?selected=${e===o}>${e} pro Seite</option>`)}</select>
          <button aria-label="Seite zurück" ?disabled=${c<=0} @click=${()=>{this._seite=c-1,this.requestUpdate()}}>‹</button>
          <span>Seite ${c+1} von ${s}</span>
          <button aria-label="Seite vor" ?disabled=${c>=s-1} @click=${()=>{this._seite=c+1,this.requestUpdate()}}>›</button>
        </div>
      </div>
    </div>`}};O([D({converter:{fromAttribute:e=>e?ti(e):Z(),toAttribute:e=>JSON.stringify(e)}})],Q.prototype,`spalten`,void 0),O([D()],Q.prototype,`source`,void 0),O([D()],Q.prototype,`suche`,void 0),O([D({attribute:!1})],Q.prototype,`datenzeilen`,void 0),O([D({attribute:!1})],Q.prototype,`rohzeilen`,void 0),O([D({attribute:!1})],Q.prototype,`auswahlIndex`,void 0),O([D({attribute:!1})],Q.prototype,`durchAuswahlGefiltert`,void 0),k.defineAndRegister(Q);var ai=6,oi=96,si=14,ci={duenn:`300`,normal:`400`,fett:`700`},li={links:`left`,mitte:`center`,rechts:`right`};function ui(e){if(e===`ueberschrift`)return 15;if(e===`klein`)return 12;let t=typeof e==`number`?e:Number.parseFloat(String(e??``));return Number.isFinite(t)?Math.min(oi,Math.max(ai,t)):si}function di(e){return typeof e==`string`&&e in ci?e:`normal`}function fi(e){return typeof e==`string`&&e in li?e:`links`}var $=class extends k{constructor(...e){super(...e),this.groesse=si,this.gewicht=`normal`,this.ausrichtung=`links`,this.text=`Text`}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Text`}static{this.category=`anzeige`}static{this.defaultProps={width:`fill`,groesse:si,gewicht:`normal`,ausrichtung:`links`,text:`Text`}}static{this.raster={startW:6,startH:2,minW:1,minH:1}}static{this.customProperties=[{attributeName:`groesse`,name:`Größe`,description:`Schriftgröße in Pixeln.`,kind:`number`,unit:`px`,min:ai,max:oi,inspectorRow:`Text-Stil`},{attributeName:`gewicht`,name:`Gewicht`,description:`Strichstärke der Schrift.`,kind:`segment`,options:[{value:`duenn`,label:`Dünn`},{value:`normal`,label:`Normal`},{value:`fett`,label:`Fett`}],inspectorRow:`Text-Stil`},{attributeName:`ausrichtung`,name:`Ausrichtung`,description:`Wo der Text in seiner Breite sitzt.`,kind:`segment`,options:[{value:`links`,label:`Links`},{value:`mitte`,label:`Mitte`},{value:`rechts`,label:`Rechts`}],inspectorRow:`Text-Stil`}]}static{this.styles=[k.styles,o`
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
    `]}render(){return b`<div
      class="text"
      style=${Ar({fontSize:`${ui(this.groesse)}px`,fontWeight:ci[di(this.gewicht)],textAlign:li[fi(this.ausrichtung)]})}
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</div>`}};O([D({type:Number})],$.prototype,`groesse`,void 0),O([D()],$.prototype,`gewicht`,void 0),O([D()],$.prototype,`ausrichtung`,void 0),O([D()],$.prototype,`text`,void 0),k.defineAndRegister($);var pi=class extends k{static{this.blockType=`trenner`}static{this.tagName=`ff-trenner`}static{this.displayName=`Trennlinie`}static{this.category=`layout`}static{this.defaultProps={width:`fill`}}static{this.resizableWidth=!1}static{this.raster={startW:24,startH:1,minW:1,minH:1}}static{this.customProperties=[]}static{this.styles=[k.styles,o`
      /* Fester dezenter Aussenabstand (--se-gap-sm) ober-/unterhalb der Linie;
         die Linie selbst ist ein 1px-Rand in der sichtbaren Linienfarbe. */
      :host { padding: var(--se-gap-sm) 0; }
      .linie { border-top: 1px solid var(--se-line); }
      /* Rasterflaeche: bleibt eine Zeile hoch; wird die Zelle hoeher gezogen,
         sitzt die Linie mittig statt oben. */
      :host([fuellt]) { display: flex; flex-direction: column; justify-content: center; }
      :host([fuellt]) .linie { width: 100%; }
    `]}render(){return b`<div class="linie"></div>`}};k.defineAndRegister(pi);var mi=class extends k{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.raster={startW:24,startH:2,minW:2,minH:1}}static{this.customProperties=[]}static{this.styles=[k.styles,o`
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
    `]}render(){return b`<div class="zeile"><slot></slot></div>`}};k.defineAndRegister(mi)})();