(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,p=f.trustedTypes,re=p?p.emptyScript:``,m=f.reactiveElementPolyfillSupport,h=(e,t)=>e,g={toAttribute(e,t){switch(t){case Boolean:e=e?re:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},_=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:g,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=new WeakMap;var y=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(h(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(h(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(h(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?g:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?g:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??_)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};y.elementStyles=[],y.shadowRootOptions={mode:`open`},y[h(`elementProperties`)]=new Map,y[h(`finalized`)]=new Map,m?.({ReactiveElement:y}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var ie=globalThis,ae=e=>e,oe=ie.trustedTypes,se=oe?oe.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ce=`$lit$`,b=`lit$${Math.random().toFixed(9).slice(2)}$`,le=`?`+b,ue=`<${le}>`,x=document,de=()=>x.createComment(``),fe=e=>e===null||typeof e!=`object`&&typeof e!=`function`,pe=Array.isArray,me=e=>pe(e)||typeof e?.[Symbol.iterator]==`function`,he=`[ 	
\f\r]`,ge=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_e=/-->/g,ve=/>/g,S=RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ye=/'/g,be=/"/g,xe=/^(?:script|style|textarea|title)$/i,Se=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),C=Se(1),w=Se(2),T=Symbol.for(`lit-noChange`),E=Symbol.for(`lit-nothing`),Ce=new WeakMap,D=x.createTreeWalker(x,129);function we(e,t){if(!pe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return se===void 0?t:se.createHTML(t)}var Te=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=ge;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===ge?c[1]===`!--`?o=_e:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=S):(xe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=S):o=ve:o===S?c[0]===`>`?(o=i??ge,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?S:c[3]===`"`?be:ye):o===be||o===ye?o=S:o===_e||o===ve?o=ge:(o=S,i=void 0);let d=o===S&&e[t+1].startsWith(`/>`)?` `:``;a+=o===ge?n+ue:l>=0?(r.push(s),n.slice(0,l)+ce+n.slice(l)+b+d):n+b+(l===-2?t:d)}return[we(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Ee=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Te(t,n);if(this.el=e.createElement(l,r),D.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=D.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ce)){let t=u[o++],n=i.getAttribute(e).split(b),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ae:r[1]===`?`?je:r[1]===`@`?Me:ke}),i.removeAttribute(e)}else e.startsWith(b)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(xe.test(i.tagName)){let e=i.textContent.split(b),t=e.length-1;if(t>0){i.textContent=oe?oe.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],de()),D.nextNode(),c.push({type:2,index:++a});i.append(e[t],de())}}}else if(i.nodeType===8)if(i.data===le)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(b,e+1))!==-1;)c.push({type:7,index:a}),e+=b.length-1}a++}}static createElement(e,t){let n=x.createElement(`template`);return n.innerHTML=e,n}};function O(e,t,n=e,r){if(t===T)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=fe(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=O(e,i._$AS(e,t.values),i,r)),t}var De=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??x).importNode(t,!0);D.currentNode=r;let i=D.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Oe(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ne(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=D.nextNode(),a++)}return D.currentNode=x,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Oe=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),fe(e)?e===E||e==null||e===``?(this._$AH!==E&&this._$AR(),this._$AH=E):e!==this._$AH&&e!==T&&this._(e):e._$litType$===void 0?e.nodeType===void 0?me(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==E&&fe(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Ee.createElement(we(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new De(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Ce.get(e.strings);return t===void 0&&Ce.set(e.strings,t=new Ee(e)),t}k(t){pe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(de()),this.O(de()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ae(e).nextSibling;ae(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},ke=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=E,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=E}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=O(this,e,t,0),a=!fe(e)||e!==this._$AH&&e!==T,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=O(this,r[n+o],t,o),s===T&&(s=this._$AH[o]),a||=!fe(s)||s!==this._$AH[o],s===E?e=E:e!==E&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ae=class extends ke{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===E?void 0:e}},je=class extends ke{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==E)}},Me=class extends ke{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=O(this,e,t,0)??E)===T)return;let n=this._$AH,r=e===E&&n!==E||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==E&&(n===E||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ne=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}},Pe=ie.litHtmlPolyfillSupport;Pe?.(Ee,Oe),(ie.litHtmlVersions??=[]).push(`3.3.3`);var Fe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Oe(t.insertBefore(de(),e),e,void 0,n??{})}return i._$AI(e),i},Ie=globalThis,k=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Fe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};k._$litElement$=!0,k.finalized=!0,Ie.litElementHydrateSupport?.({LitElement:k});var Le=Ie.litElementPolyfillSupport;Le?.({LitElement:k}),(Ie.litElementVersions??=[]).push(`4.2.2`);var Re={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:_},ze=(e=Re,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function A(e){return(t,n)=>typeof n==`object`?ze(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Be(e){return A({...e,state:!0,attribute:!1})}var Ve=new Map;function He(e){Ve.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Ve.set(e.type,e)}function Ue(){return Array.from(Ve.values())}var We={width:`auto`},Ge={rasterX:0,rasterY:0,rasterW:{spalten:24,spaltePx:40,zeilePx:12,gapPx:8}.spalten,rasterH:1},Ke=`weitereQuellen`,qe={[Ke]:[]},Je=`folgtAuswahl`,Ye={[Je]:[]};function j(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var M=class extends k{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
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
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),He({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...We,...Ge,...e.acceptsDataSource?qe:null,...e.kannAuswahlFolgen?Ye:null,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,satzWahl:e.satzWahl,kannAuswahlFolgen:e.kannAuswahlFolgen,bindableSpots:e.bindableSpots,actionValueSpots:e.actionValueSpots,listenBindung:e.listenBindung,blockEvents:e.blockEvents,pageBlock:e.pageBlock,raster:e.raster})}};j([A({type:Boolean,reflect:!0,attribute:`data-editable`})],M.prototype,`editable`,void 0);var Xe=`data-ff-block-id`,Ze=[`fixed`,`context`,`data_field`,`block_value`,`gewaehlte_zeile`,`previous_result`,`step_result`,`se_variable`];function Qe(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function $e(e){return!Qe(e)||typeof e.source!=`string`||!Ze.includes(e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`||e.blockId!==void 0&&typeof e.blockId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{},...typeof e.blockId==`string`?{blockId:e.blockId}:{}}}function et(e){if(!Qe(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!Qe(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=$e(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=$e(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function tt(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!Qe(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=et(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}function N(e){return typeof e==`object`&&!!e}function P(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!N(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function nt(e){return e==null?``:String(e).trim()}function F(e,t){if(!N(e)||t===``)return``;let n=t.trim(),r=nt(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=nt(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=nt(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function rt(e,t,n){if(!N(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function it(e){if(!N(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function I(e,t){return nt(e).toLowerCase()===t.trim().toLowerCase()}function L(e,t,n){if(!N(e)||!N(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(N(e)&&(I(e.ALIAS,t)||I(e.alias,t))){let t=it(e);if(t.length>0)return t}}else if(N(i))for(let e of Object.keys(i)){let n=i[e];if(I(e,t)||N(n)&&(I(n.ALIAS,t)||I(n.alias,t))){let e=it(n);if(e.length>0)return e}}let a=r.Tabellen;if(N(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=it(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(I(e,t)){let t=it(a[e]);if(t.length>0)return t}}return[]}function at(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!N(t)||!N(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function ot(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!N(t)||!N(t.MSG)))return t.MSG.DATA}function st(e){if(e==null)return``;try{return JSON.stringify(e)??``}catch{return``}}var R=new Map,ct=new Set,lt=!1,ut=!1;function dt(){if(lt){ut=!0;return}lt=!0;try{do ut=!1,ct.forEach(e=>e());while(ut)}finally{lt=!1}}function ft(e){ct.add(e)}function pt(e){return R.get(e)?.zeile}function mt(e){return R.get(e)?.merkmal??``}function z(e){return e.getAttribute(`data-ff-id`)??``}function ht(e,t,n){if(e===``)return[];let r=mt(e);if(r===``)return[];let i=[];return t.forEach((e,t)=>{st(n(e))===r&&i.push(t)}),i.length===0&&vt(e),i}function gt(e,t){if(e===``)return;let n=st(t);if(n===``)return;let r=R.get(e);r&&r.merkmal===n?R.delete(e):R.set(e,{zeile:t,merkmal:n}),dt()}function _t(e,t){if(e===``)return;let n=st(t);n!==``&&R.get(e)?.merkmal!==n&&(R.set(e,{zeile:t,merkmal:n}),dt())}function vt(e){R.has(e)&&(R.delete(e),dt())}var yt=Je.toLowerCase();function bt(e){let t=e.getAttribute(yt)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.geberId!=`string`||e.geberId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({geberId:e.geberId,keyPairs:r})}return n}catch{return[]}}function xt(e,t){let n=t,r=!1;for(let t of bt(e)){let e=pt(t.geberId);e!==void 0&&(r=!0,n=n.filter(n=>t.keyPairs.every(t=>{let r=F(e,t.fromField);return r!==``&&r===F(n,t.toField)})))}return{rows:n,gefiltert:r}}function St(e,t){if(bt(e).length===0)return t[0];let{rows:n,gefiltert:r}=xt(e,t);return r?n[0]:void 0}var Ct=`root`;function wt(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var B=class extends M{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[Ct]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[M.styles,o`
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
        border: var(--se-border) solid var(--se-line);
        border-radius: var(--se-r-lg);
        overflow: hidden;
        /* Flach (Fellnase Regel 4): was das Popup abhebt, ist die
           Abdunklung dahinter (--se-scrim) und die 1,5px-Kante — kein
           Schatten. Bis 2026-08-06 lag hier die staerkste von drei
           Schatten-Stufen. */
      }
      .kopf {
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 6px 6px 12px;
        background: var(--se-panel-2);
        border-bottom: var(--se-border) solid var(--se-line-soft);
      }
      .titel {
        font-weight: 600;
        /* Schmuck-Schrift NUR am Namen eines Kastens (Fellnase: .tafel-titel),
           nie im Fliesstext — sonst verliert sie ihre Wirkung. */
        font-family: var(--se-font-schmuck);
        font-size: var(--se-fs-lg);
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
    `]}onClose(){this.hasAttribute(`data-ff-editor`)||this.removeAttribute(`offen`)}render(){return C`<div class="abdunklung"></div>
      <div class="buehne">
        <div class="fenster" style="width:${wt(this.breite,520)}px;height:${wt(this.hoehe,380)}px">
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
      </div>`}};j([A()],B.prototype,`name`,void 0),j([A()],B.prototype,`breite`,void 0),j([A()],B.prototype,`hoehe`,void 0),M.defineAndRegister(B);var Tt=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Et(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Dt(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}var Ot=8e3,V=null,kt=null;function At(){let e=document.createElement(`div`);return e.setAttribute(`data-ff-meldung`,``),e.setAttribute(`role`,`alert`),e.style.cssText=[`position:fixed`,`top:0`,`left:0`,`right:0`,`z-index:2147483647`,`padding:7px 12px`,`background:var(--se-red-soft,#fbe7e6)`,`color:var(--se-red,#c0201a)`,`border-bottom:1px solid var(--se-red,#c0201a)`,`font:500 12px/1.4 system-ui,sans-serif`,`cursor:pointer`].join(`;`),e.title=`Klicken zum Schliessen`,e.addEventListener(`click`,jt),e}function jt(){kt&&=(clearTimeout(kt),null),V?.remove(),V=null}function H(e){typeof document>`u`||!document.body||(V||(V=At(),document.body.appendChild(V)),V.textContent=e,kt&&clearTimeout(kt),kt=setTimeout(jt,Ot))}function U(){return globalThis}function Mt(){let e=U();return N(e.SEDATA)&&N(e.SEDATA.Daten)}function Nt(){let e=U();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function Pt(){let e=U();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var Ft=new Set,It=new Set;function Lt(e){Ft.add(e)}function Rt(e){return It.add(e),()=>{It.delete(e)}}function zt(){Ft.forEach(e=>e())}function Bt(e){It.forEach(t=>{try{t(e)}catch{}})}var W=new Map,Vt=``,Ht=0;function Ut(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function Wt(){let e=Ut();e&&(e.value=Array.from(W,([e,t])=>`${e}: ${t}`).join(`
`)+(Vt===``?``:`\n\nERSTES PAKET\n${Vt}`))}function G(e,t){W.set(e,t),Wt()}function Gt(){let e=U();W.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),W.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),W.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),W.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),W.set(`Empfangene Pakete`,String(Ht)),W.set(`SEDATA.Daten`,Mt()?`vorhanden`:`fehlt`),Wt()}function Kt(e){if(Vt===``)try{Vt=typeof e==`string`?e:JSON.stringify(e)??``,Wt()}catch{}}function qt(e){Ht+=1,Kt(e),G(`Empfangene Pakete`,String(Ht));let t=at(e);if(!t){G(`Letztes Paket`,`Antwort ohne Daten`),Bt(e);return}let n=U();N(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,G(`Letztes Paket`,`Daten-Push angenommen`),G(`SEDATA.Daten`,`vorhanden`),Pt(),zt()}function Jt(e=0){let t=U();if(typeof t.basisHTML_REGISTER==`function`){Gt();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{qt(e)},document.title,`1.0`),G(`Registrierung`,`ausgeführt`)}catch(e){G(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&G(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{Jt(e+1)},25)):(Gt(),G(`Registrierung`,`nach 10s kein Interface`),H(`SoftEngine-Anschluss nicht gefunden — die Maske bleibt ohne Daten (Strg+Alt+D für Details).`))}var Yt=!1;function Xt(){if(Yt)return;Yt=!0,G(`Runtime`,`gestartet`),G(`Registrierung`,`noch nicht ausgeführt`),Gt(),Nt();let e=U();e.Erstellen=()=>{Pt(),zt()},e.initData=e.Erstellen,e.ReloadData=()=>{zt()},Jt(),window.addEventListener(`message`,e=>{if(typeof U().basisHTML_REGISTER==`function`)return;let t=ot(e.data);t!==void 0&&qt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){Gt();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,Mt()?(clearInterval(n),G(`SEDATA.Daten`,`vorhanden`),Pt(),zt()):t>100&&(clearInterval(n),G(`Daten-Wartezeit`,`nach 30s ohne Daten`),H(`Keine Daten von SoftEngine empfangen — die Maske zeigt nichts an (Strg+Alt+D für Details).`))},300)}function Zt(e){return e instanceof Error?e.message:String(e)}function Qt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!N(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Tt.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var $t=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function en(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function tn(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function nn(e,t){if(t>12)return;let n=tn(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=nn(n,t+1);if(e!==void 0)return e}return}if(N(e)){for(let n of $t){if(!(n in e))continue;let r=nn(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=nn(n,t+1);if(e!==void 0)return e}}}function rn(e){let t=en(e);if(N(t)){for(let e of $t){if(!(e in t))continue;let n=nn(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=rn(t);if(e!==void 0)return e}else if(N(e)){let t=rn(e);if(t!==void 0)return t}}}function an(e){return N(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function on(e,t){if(!N(e))return;let n=an(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=rn(e[t]);if(n!==void 0)return n}}var sn=[],cn=!1,ln=6e3,un=100;function dn(){if(cn||sn.length===0)return;cn=!0;let e=sn.shift(),t=U(),n=new Set(an(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),cn=!1,e.resolve(t),dn())},a=Rt(e=>{let t=rn(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=on(U().SEDATA,n);e!==void 0&&i(e)},un),s=setTimeout(()=>{H(`Daten laden: SoftEngine hat nicht geantwortet (Relation Nr. ${e.template.nr}).`),i(``)},ln);if(typeof t.basisHTML_SND_MSG!=`function`){H(`Daten laden nicht moeglich: keine Verbindung zu SoftEngine.`),i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch(t){H(`Daten laden fehlgeschlagen (Relation Nr. ${e.template.nr}): ${Zt(t)}`),i(``)}}function fn(e,t){Xt();let n=U();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG!=`function`)return H(`Speichern nicht moeglich: keine Verbindung zu SoftEngine. Die Eingabe wurde NICHT uebernommen.`),Promise.resolve(``);try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch(t){H(`Speichern fehlgeschlagen (Relation Nr. ${e.nr}): ${Zt(t)}`)}return Promise.resolve(``)}return new Promise(n=>{sn.push({template:e,params:[...t],resolve:n}),dn()})}function pn(e,t){if(!N(t))return``;let n=t.document;if(!n||typeof n.querySelectorAll!=`function`)return``;let r=Array.from(n.querySelectorAll(`[${Xe}]`)).find(t=>t.getAttribute(Xe)===e.blockId);if(!r)return``;let i=r[e.value];return i==null?``:String(i)}function mn(e,t,n=U()){if(e.source===`aus`)return``;if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);return Number.isInteger(n)&&n>=0?t.stepResults?.[n]??``:``}if(e.source===`block_value`)return pn(e,n);if(e.source===`gewaehlte_zeile`){let n=t.gewaehlteZeile?.(e.blockId??``);return n===void 0?``:F(n,e.value)}if(!N(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!N(t)||!N(t.Daten)||!N(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=P(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=L(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>F(e,r.indexField)===a):i[0];return o?F(o,e.value):``}function hn(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function gn(e,t){if(e.trim()===``)return;let n=U();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(hn(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function _n(e,t,n){if(t.trim()!==``)for(let r of Array.from(e.querySelectorAll(B.tagName)))(r.getAttribute(`name`)??B.defaultProps.name)===t&&(n?r.setAttribute(`offen`,``):r.removeAttribute(`offen`))}var vn=new WeakMap;function yn(e){H(`Aktionskette fehlgeschlagen: `+(e instanceof Error?e.message:String(e)))}async function bn(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=tt(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=vn.get(e);if(i||(i=new Set,vn.set(e,i)),!i.has(t)){i.add(t);try{let t={...n,NOW_DATE:Et(new Date)},i=``,a=[];for(let n of r){if(n.type===`START_TOOL`){gn(n.toolNr,Dt({params:n.toolParams},t)),a.push(``);continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){_n(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),a.push(``);continue}let r=Qt(U().FF_RELATIONS,n.relationId);if(!r){a.push(``);continue}let o={context:t,previousResult:i,stepResults:a,gewaehlteZeile:pt},s=await fn(r,[...n.params,...n.extraParams].map(e=>mn(e,o)));a.push(s),r.verb===`GET_RELATION`&&(i=s),n.resultKey!==``&&(t[n.resultKey]=s)}}finally{i.delete(t)}}}var xn=new WeakSet;function Sn(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||xn.has(e))return;xn.add(e);let n=tt(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&Xt(),e.addEventListener(`click`,()=>{bn(e,t,{}).catch(yn)})}var Cn=class extends M{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.raster={startW:4,startH:2,minW:2,minH:2}}static{this.customProperties=[]}static{this.styles=[M.styles,o`
      button {
        box-sizing: border-box;
        padding: 7px 16px;
        cursor: pointer;
        border-radius: var(--se-r-md);
        border: var(--se-border) solid var(--se-accent);
        background: var(--se-accent);
        color: var(--se-panel);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        /* Dauer aus dem gemeinsamen Wert (2026-07-30): vorher stand hier
           eine eigene 120ms-Angabe — zwei Bausteine mit knapp
           unterschiedlichem Takt wirken unruhig. */
        transition: background-color var(--se-move), border-color var(--se-move);
      }
      button:hover { background: var(--se-accent-dark); border-color: var(--se-accent-dark); }
      /* Der Knopf muss beim Druecken sichtbar antworten — ohne Rueckmeldung
         weiss der Bediener nicht, ob er getroffen hat. Flach geloest
         (Fellnase Regel 4, "die Kante macht die Arbeit"): die Kante springt
         auf Espresso. Bis 2026-08-06 sank der Knopf stattdessen um 1px. */
      button:active { background: var(--se-accent-dark); border-color: var(--se-ink); }
      button:focus-visible { outline: 2px solid var(--se-accent); outline-offset: 2px; }
      /* Rasterflaeche: der Knopf fuellt seine Zelle (Ziehen macht den KNOPF
         groesser, nicht einen leeren Rahmen). Im Fluss (kein 'fuellt') bleibt
         er naturgross. */
      :host([fuellt]) button { width: 100%; height: 100%; }
    `]}render(){return C`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),Sn(this,`onClick`)}};j([A()],Cn.prototype,`label`,void 0),M.defineAndRegister(Cn);var wn=[`info`,`success`,`warning`,`danger`];function Tn(e){return wn.includes(e)?e:`info`}function En(e,t){return{attributeName:e,name:`Farbe`,description:t,kind:`select`,options:[{value:`info`,label:`Hinweis`},{value:`success`,label:`Erfolg`},{value:`warning`,label:`Warnung`},{value:`danger`,label:`Fehler`}]}}var Dn=o`
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px 3px 7px;
    border-radius: var(--se-r-sm);
    /* der 45deg-Schnitt oben rechts — 6px tief */
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
    font-family: var(--se-font);
    font-size: var(--se-fs-xs);
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--se-ink);
    background: var(--se-panel-2);
    white-space: nowrap;
  }
  /* der quadratische Punkt: bewusst OHNE border-radius */
  .chip::before {
    content: '';
    flex: none;
    width: 6px;
    height: 6px;
    background: var(--chip-punkt, var(--se-faint));
  }
  .chip.v-info { background: var(--se-blue-soft); --chip-punkt: var(--se-blue); }
  .chip.v-success { background: var(--se-green-soft); --chip-punkt: var(--se-green); }
  .chip.v-warning { background: var(--se-amber-soft); --chip-punkt: var(--se-amber); }
  .chip.v-danger {
    background: var(--se-red);
    color: var(--se-panel);
    --chip-punkt: var(--se-panel);
  }
`,On={dog:w`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,cat:w`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,rabbit:w`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,hamster:w`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,bird:w`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,reptile:w`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,paw:w`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`},kn=[[`welpe`,`dog`],[`hund`,`dog`],[`kater`,`cat`],[`katze`,`cat`],[`kaninchen`,`rabbit`],[`hase`,`rabbit`],[`meerschweinchen`,`hamster`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`bird`],[`sittich`,`bird`],[`papagei`,`bird`],[`vogel`,`bird`],[`schildkr`,`reptile`],[`echse`,`reptile`],[`schlange`,`reptile`],[`gecko`,`reptile`],[`reptil`,`reptile`]];function An(e){let t=e.toLowerCase(),n=`paw`;for(let[e,r]of kn)if(t.includes(e)){n=r;break}return C`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${On[n]}</svg>`}var K=class extends M{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[En(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[M.styles,Dn,o`
      .card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        min-height: 112px;
        overflow: hidden;
        gap: 5px;
        background: var(--se-card-bg);
        border: var(--se-border) solid var(--se-card-line);
        border-radius: var(--se-r-md);
        padding: 8px 10px 9px;
        font-family: var(--se-font);
        transition: border-color var(--se-move);
      }
      /* Flach (Fellnase Regel 4): beim Zeigen wird die KANTE dunkler, die
         Karte hebt nicht ab. Vorher hob sie sich per Schatten + 1px nach
         oben — das liess die Nachbarkarten wackeln und war das einzige
         Koerperhafte der Maske. */
      .card:hover {
        border-color: var(--se-faint);
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
        border-radius: var(--se-r-sm);
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
        border: var(--se-border) dashed var(--se-faint);
      }
    `]}stelle(e,t){return C`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}render(){let e=Tn(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.heading)||n(this.heading2),i=n(this.time)||n(this.date);return C`<div class="card v-${e}">
      ${n(this.avatar)||r||n(this.meta)||i?C`<div class="main">
            ${n(this.avatar)?C`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?E:An(this.avatar)}</span>`:E}
            <div class="titles">
              ${r?C`<div class="trow">
                    ${n(this.heading)?this.stelle(`heading`,`heading`):E}
                    ${n(this.heading2)?this.stelle(`heading2`,`heading2`):E}
                  </div>`:E}
              ${n(this.meta)?this.stelle(`meta`,`meta`):E}
            </div>
            ${i?C`<div class="when">
                  ${n(this.date)?this.stelle(`date`,`date`):E}
                  ${n(this.time)?this.stelle(`time`,`time`):E}
                </div>`:E}
          </div>`:E}
      ${n(this.text)?this.stelle(`text`,`text`):E}
      ${n(this.chipText)?C`<span
            class="chip v-${e}"
            data-ff-editable
            data-ff-spot="chipText"
            ?data-ff-bound=${this.chipTextField!==``}
            @dblclick=${e=>this.inlineEdit(e,`chipText`)}
          >${this.chipText}</span>`:E}
    </div>`}};j([A()],K.prototype,`chipVariant`,void 0),j([A()],K.prototype,`heading`,void 0),j([A()],K.prototype,`heading2`,void 0),j([A()],K.prototype,`time`,void 0),j([A()],K.prototype,`date`,void 0),j([A()],K.prototype,`avatar`,void 0),j([A()],K.prototype,`meta`,void 0),j([A()],K.prototype,`text`,void 0),j([A()],K.prototype,`chipText`,void 0),j([A()],K.prototype,`headingField`,void 0),j([A()],K.prototype,`heading2Field`,void 0),j([A()],K.prototype,`timeField`,void 0),j([A()],K.prototype,`dateField`,void 0),j([A()],K.prototype,`avatarField`,void 0),j([A()],K.prototype,`metaField`,void 0),j([A()],K.prototype,`textField`,void 0),j([A()],K.prototype,`chipTextField`,void 0),M.defineAndRegister(K);function jn(e){let t=String(e??``).trim();if(t===``)return``;let n=/^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(t);if(n)return`${n[3]}-${n[2].padStart(2,`0`)}-${n[1].padStart(2,`0`)}`;let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return r?`${r[1]}-${r[2]}-${r[3]}`:``}function Mn(e){let t=String(e.getMonth()+1).padStart(2,`0`),n=String(e.getDate()).padStart(2,`0`);return`${e.getFullYear()}-${t}-${n}`}function Nn(e,t){let n=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!n)return``;let r=new Date(Number(n[1]),Number(n[2])-1,Number(n[3]));return r.setDate(r.getDate()+t),Mn(r)}var Pn=``,Fn=new Set;function In(){return Pn}function Ln(e){let t=jn(e);t!==Pn&&(Pn=t,Fn.forEach(e=>e()))}function Rn(e){return Fn.add(e),()=>{Fn.delete(e)}}var zn=class extends M{constructor(...e){super(...e),this.tag=``,this.tagAbmelden=null}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.defaultProps={}}static{this.customProperties=[]}static{this.raster={startW:9,startH:2,minW:5,minH:2}}static{this.styles=[M.styles,o`
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
        border: var(--se-border) solid var(--se-line);
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
        border: var(--se-border) solid var(--se-line);
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
    `]}setzeTag(e){Ln(e),this.tag=In()}render(){return C`<div class="waehler">
      <div class="riegel">
        <button class="pfeil" title="Vortag" @click=${()=>this.setzeTag(Nn(this.tag,-1))}>‹</button>
        <input
          class="feld"
          type="date"
          .value=${this.tag}
          @change=${e=>this.setzeTag(e.target.value)}
        />
        <button class="pfeil" title="Folgetag" @click=${()=>this.setzeTag(Nn(this.tag,1))}>›</button>
      </div>
      <button class="heute" @click=${()=>this.setzeTag(Mn(new Date))}>Heute</button>
    </div>`}connectedCallback(){super.connectedCallback(),this.tag=In()||Mn(new Date),!this.hasAttribute(`data-ff-editor`)&&(this.setzeTag(this.tag),this.tagAbmelden?.(),this.tagAbmelden=Rn(()=>{this.tag=In()}))}disconnectedCallback(){super.disconnectedCallback(),this.tagAbmelden?.(),this.tagAbmelden=null}};j([Be()],zn.prototype,`tag`,void 0),M.defineAndRegister(zn);var Bn={attributeName:`fieldType`,equals:`nachschlagen`},Vn=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`},{value:`nachschlagen`,label:`Nachschlagen`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`nachschlagQuelle`,name:`Quelle`,description:`Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.`,kind:`quelle`,visibleWhen:Bn},{attributeName:`anzeigeFeld`,name:`Angezeigt wird`,description:`Feld der Nachschlage-Quelle, dessen Wert der Bediener sieht (z. B. der Name).`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`anzeigeTitel`,visibleWhen:Bn},{attributeName:`speicherFeld`,name:`Gespeichert wird`,description:`Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer).`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`speicherTitel`,visibleWhen:Bn},{attributeName:`einzigerTreffer`,name:`Einzigen Treffer übernehmen`,description:`Bleibt in der Maske genau EIN Satz übrig (weil das Feld der Auswahl eines anderen folgt), übernimmt es diesen von selbst — ohne dass der Bediener die Lupe drückt. Nur in ein leeres Feld; die Lupe bleibt daneben bedienbar.`,kind:`segment`,options:[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],visibleWhen:Bn},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,kind:`field`,visibleWhen:{attributeName:`fieldType`,notEquals:`nachschlagen`}}];function Hn(e){return`${e.toLowerCase()}field`}function Un(e){let t=e.split(`::`);if(t.length!==2)return{quelleId:``,code:e};let[n,r]=t;return n===``||r===``?{quelleId:``,code:e}:{quelleId:n,code:r}}function Wn(e){let t=new Set,n=!1,r=()=>{Mt()&&t.forEach(e.hydriere)};return{connect:i=>{i.hasAttribute(`data-ff-editor`)||(t.add(i),e.verdrahte?.(i),n||(n=!0,Lt(r),Rn(r),ft(r)),Xt(),Mt()&&e.hydriere(i))},disconnect:e=>{t.delete(e)}}}var Gn=Ke.toLowerCase(),Kn=``;function qn(e){if(e.length===0)return``;let t=[];for(let n of e){let e=n.trim();if(e===``)return``;t.push(e)}return t.join(Kn)}function Jn(e){let t=e.getAttribute(Gn)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.quelleId!=`string`||e.quelleId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({quelleId:e.quelleId,keyPairs:r})}return n}catch{return[]}}function Yn(e){let t=Jn(e);if(t.length===0)return(e,t)=>F(e,Un(t).code);let n=U().SEDATA,r=U().FF_DATA_SOURCES,i=new Map;for(let e of t){let t=P(r,e.quelleId);if(!t)continue;let a=L(n,t.name,t.tableId),o=new Map;for(let t of a){let n=qn(e.keyPairs.map(e=>F(t,e.toField)));n!==``&&!o.has(n)&&o.set(n,t)}i.set(e.quelleId,{nachSchluessel:o,hierFelder:e.keyPairs.map(e=>e.fromField)})}return(e,t)=>{let{quelleId:n,code:r}=Un(t);if(n===``)return F(e,r);let a=i.get(n);if(!a)return``;let o=qn(a.hierFelder.map(t=>F(e,t)));if(o===``)return``;let s=a.nachSchluessel.get(o);return s===void 0?``:F(s,r)}}function Xn(e,t){let n=e.getAttribute(`source`)??``,r=e.getAttribute(t)??``;if(n===``||r===``)return{art:`ungebunden`};let i=P(U().FF_DATA_SOURCES,n);if(!i)return{art:`ohneQuelle`};let a=St(e,L(U().SEDATA,i.name,i.tableId));if(a===void 0)return{art:`ohneZeile`};let{quelleId:o,code:s}=Un(r);return{art:`wert`,wert:o===``?F(a,s):Yn(e)(a,r),zeile:a,quelle:i,quelleId:o,reinerCode:s}}var Zn=new WeakMap,Qn=new WeakSet;function $n(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function er(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function tr(e){return typeof e.value==`string`?e.value:``}function nr(e){if(e.pruefeEigenenWert?.(),e.getAttribute(`fieldtype`)===`nachschlagen`){Zn.delete(e);return}let t=Xn(e,Hn(`value`));if(t.art!==`wert`){Zn.delete(e),t.art===`ohneZeile`&&(e.value=``);return}let{zeile:n,quelle:r,quelleId:i,reinerCode:a,wert:o}=t,s=r.indexField===``?``:F(n,r.indexField);i===``?Zn.set(e,{row:n,code:a,pindex:s}):Zn.delete(e),e.value=o}function rr(e){let t=Zn.get(e);return t&&rt(t.row,t.code,tr(e)),t}function ir(e){Qn.has(e)||(Qn.add(e),e.addEventListener(`input`,()=>{rr(e)}),e.addEventListener(`change`,()=>{let t=rr(e);bn(e,`onChange`,{VALUE:tr(e),PINDEX:t?.pindex??``}).catch(yn)}))}var ar=Wn({hydriere:nr,verdrahte:ir}),or=ar.connect,sr=ar.disconnect,cr=o`
  .feld {
    font-family: var(--se-font);
    /* Innenabstände EINMAL definiert — .ctrl und .ph leiten sich beide
       daraus ab, damit der Platzhalter exakt an der Textposition sitzt.
       (N1: keine Magic Numbers, die beim Padding-Ändern auseinanderlaufen.) */
    --feld-pad-y: 7px;
    --feld-pad-x: 10px;
    --feld-rand: var(--se-border);
  }
  /* Anker für den im Feld sitzenden Platzhalter. */
  .huelle { position: relative; }
  /* .ctrl exakt nach Referenz-Optik: Rahmen, Panel-Flaeche, kantiger
     Radius; Fokus = Hausfarbe als Rahmen + ein zweiter
     Strich derselben Staerke (Fellnase ist flach: kein Leuchten). */
  .ctrl {
    box-sizing: border-box;
    width: 100%;
    padding: var(--feld-pad-y) var(--feld-pad-x);
    border: var(--feld-rand) solid var(--se-line);
    background: var(--se-panel);
    border-radius: var(--se-r-md);
    font-family: var(--se-font);
    font-size: var(--se-fs);
    color: var(--se-ink);
  }
  .ctrl:focus {
    outline: none;
    border-color: var(--se-accent);
    box-shadow: 0 0 0 var(--se-border) var(--se-accent);
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
`,lr=`ff-dialog-rahmen`,ur=`ff-dialog-schliessen`;function dr(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var q=class extends k{constructor(...e){super(...e),this.titel=`Dialog`,this.breite=520,this.hoehe=380,this.viewport=!1,this.mitWerkzeug=!1,this.escapeSchliesst=!1,this.escapeRegistriert=!1,this.aufTaste=e=>{e.key===`Escape`&&(e.stopPropagation(),this.schliesse())}}static{this.styles=o`
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
      border: var(--se-border) solid var(--se-line);
      border-radius: var(--se-r-lg);
    }
    .kopf {
      flex: none;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 6px 6px 12px;
      background: var(--se-panel-2);
      border-bottom: var(--se-border) solid var(--se-line-soft);
    }
    .titel {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: var(--se-ink);
      /* Schmuck-Schrift NUR am Namen eines Kastens (Fellnase: .tafel-titel),
         nie im Fliesstext — sonst verliert sie ihre Wirkung. */
      font-family: var(--se-font-schmuck);
      font-size: var(--se-fs-lg);
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
      border-bottom: var(--se-border) solid var(--se-line-soft);
      background: var(--se-panel-2);
    }
    :host([mit-werkzeug]) .werkzeug { display: block; }
    .inhalt {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }
  `}aktualisiereEscape(){let e=this.isConnected&&this.escapeSchliesst;e!==this.escapeRegistriert&&(e?document.addEventListener(`keydown`,this.aufTaste,!0):document.removeEventListener(`keydown`,this.aufTaste,!0),this.escapeRegistriert=e)}schliesse(){this.dispatchEvent(new CustomEvent(ur,{bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),this.aktualisiereEscape()}updated(e){e.has(`escapeSchliesst`)&&this.aktualisiereEscape()}disconnectedCallback(){this.escapeRegistriert&&=(document.removeEventListener(`keydown`,this.aufTaste,!0),!1),super.disconnectedCallback()}render(){return C`
      <div class="abdunklung"></div>
      <div class="buehne">
        <section
          class="fenster"
          role="dialog"
          aria-modal="true"
          style="width:${dr(this.breite,520)}px;height:${dr(this.hoehe,380)}px"
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
    `}};j([A()],q.prototype,`titel`,void 0),j([A({type:Number})],q.prototype,`breite`,void 0),j([A({type:Number})],q.prototype,`hoehe`,void 0),j([A({type:Boolean,reflect:!0})],q.prototype,`viewport`,void 0),j([A({type:Boolean,reflect:!0,attribute:`mit-werkzeug`})],q.prototype,`mitWerkzeug`,void 0),j([A({type:Boolean,attribute:`escape-schliesst`})],q.prototype,`escapeSchliesst`,void 0),customElements.get(`ff-dialog-rahmen`)||customElements.define(lr,q);function fr(e){return e.trim().toLowerCase().split(/\s+/).filter(e=>e!==``)}function pr(e,t){let n=fr(t);if(n.length===0)return!0;let r=e.join(` `).toLowerCase();return n.every(e=>r.includes(e))}var mr=10;function hr(e,t,n){let r=[];for(let i of e){let e=F(i,t).trim(),a=F(i,n).trim();(e!==``||a!==``)&&r.push({anzeige:e,wert:a,satz:i})}return r}function gr(e,t){return e.filter(e=>pr([e.anzeige,e.wert],t))}function _r(e,t,n,r){return hr(xt(e,t).rows,n,r)}function vr(e){if(e.quelleId===``||e.anzeigeFeld===``||e.speicherFeld===``)return{ok:!1,grund:`unvollstaendig`};let t=P(U().FF_DATA_SOURCES,e.quelleId);if(!t)return{ok:!1,grund:`quelleFehlt`};let n=L(U().SEDATA,t.name,t.tableId);return{ok:!0,eintraege:_r(e.el,n,e.anzeigeFeld,e.speicherFeld)}}function yr(e,t){return t&&e.length===1?e[0]:null}function br(e,t){let{rows:n,gefiltert:r}=xt(e,[t]);return!r||n.length>0}var xr=null;function Sr(){xr?.remove(),xr=null}function Cr(e,t=!1){let n=document.createElement(t?`th`:`td`);return n.textContent=e,n.style.cssText=t?`position:sticky;top:0;z-index:1;padding:6px 10px;text-align:left;font-size:var(--se-fs-sm);font-weight:600;color:var(--se-muted);border-bottom:var(--se-border) solid var(--se-line);background:var(--se-panel-2)`:`box-sizing:border-box;height:24px;padding:3px 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:var(--se-border) solid var(--se-line-soft)`,n}function wr(e,t){let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.setAttribute(`aria-label`,t),n.style.cssText=`box-sizing:border-box;width:26px;height:24px;padding:0;border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm);background:var(--se-panel);color:var(--se-ink);font:inherit;cursor:pointer`,n}function Tr(e){let t=vr(e);if(!t.ok){H(t.grund===`unvollstaendig`?`Nachschlagen ist an diesem Feld nicht vollstaendig eingestellt (Quelle, Angezeigt, Gespeichert).`:`Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.`);return}let n=t.eintraege;Sr();let r=document.createElement(lr);r.setAttribute(`data-ff-nachschlagen`,``),r.viewport=!0,r.mitWerkzeug=!0,r.escapeSchliesst=!0,r.titel=e.titel===``?`Nachschlagen`:e.titel,r.breite=520,r.hoehe=380,r.addEventListener(ur,Sr),r.addEventListener(`click`,e=>e.stopPropagation());let i=document.createElement(`input`);i.slot=`werkzeug`,i.type=`search`,i.placeholder=`suchen ...`,i.setAttribute(`aria-label`,`Nachschlagen durchsuchen`),i.style.cssText=`box-sizing:border-box;width:100%;padding:5px 8px;font:inherit;color:inherit;background:var(--se-panel);border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm)`;let a=document.createElement(`table`);a.style.cssText=`width:100%;table-layout:fixed;border-collapse:collapse`;let o=document.createElement(`colgroup`),s=document.createElement(`col`);s.style.width=`65%`;let c=document.createElement(`col`);c.style.width=`35%`,o.append(s,c);let l=document.createElement(`thead`),u=document.createElement(`tr`);u.append(Cr(e.anzeigeTitel===``?`Angezeigt`:e.anzeigeTitel,!0),Cr(e.speicherTitel===``?`Wert`:e.speicherTitel,!0)),l.appendChild(u);let d=document.createElement(`tbody`);a.append(o,l,d);let ee=document.createElement(`div`);ee.style.cssText=`flex:1 1 auto;min-height:0;overflow:auto`,ee.appendChild(a);let te=document.createElement(`div`);te.style.cssText=`box-sizing:border-box;flex:none;display:flex;align-items:center;min-height:33px;padding:4px 10px;border-top:var(--se-border) solid var(--se-line);background:var(--se-panel-2);font-size:var(--se-fs-sm)`;let ne=document.createElement(`span`);ne.setAttribute(`aria-live`,`polite`),ne.style.cssText=`flex:1;color:var(--se-muted)`;let f=document.createElement(`nav`);f.setAttribute(`aria-label`,`Trefferseiten`),f.style.cssText=`display:flex;align-items:center;gap:6px`;let p=wr(`‹`,`Vorherige Seite`),re=document.createElement(`span`);re.style.cssText=`min-width:48px;text-align:center;color:var(--se-muted)`;let m=wr(`›`,`Naechste Seite`);f.append(p,re,m),te.append(ne,f);let h=document.createElement(`div`);h.style.cssText=`box-sizing:border-box;height:100%;min-height:0;display:flex;flex-direction:column`,h.append(ee,te);let g=1,_=1,v=()=>{d.replaceChildren();let t=gr(n,i.value);_=Math.max(1,Math.ceil(t.length/mr)),g=Math.min(g,_);let r=(g-1)*mr,a=t.slice(r,r+mr);if(ne.textContent=t.length===0?`0 von 0`:`${r+1}-${Math.min(r+mr,t.length)} von ${t.length}`,re.textContent=`${g} / ${_}`,p.disabled=g===1,m.disabled=g===_,p.style.opacity=p.disabled?`0.4`:`1`,m.style.opacity=m.disabled?`0.4`:`1`,p.style.cursor=p.disabled?`default`:`pointer`,m.style.cursor=m.disabled?`default`:`pointer`,ee.scrollTop=0,a.length===0){let e=document.createElement(`tr`),t=Cr(n.length===0?`Diese Quelle hat keine Saetze.`:`Kein Satz passt zur Suche.`);t.colSpan=2,t.style.color=`var(--se-faint)`,t.style.fontSize=`var(--se-fs-sm)`,t.style.padding=`16px 10px`,e.appendChild(t),d.appendChild(e);return}for(let t of a){let n=document.createElement(`tr`);n.tabIndex=0,n.style.cursor=`pointer`;let r=Cr(t.anzeige),i=Cr(t.wert);i.style.fontFamily=`var(--se-mono)`,i.style.color=`var(--se-muted)`,n.append(r,i);let a=()=>{Sr(),e.onUebernehmen(t.anzeige,t.wert,t.satz)};n.addEventListener(`click`,a),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),a())}),n.addEventListener(`mouseenter`,()=>{n.style.background=`var(--se-accent-soft)`}),n.addEventListener(`mouseleave`,()=>{n.style.background=``}),d.appendChild(n)}};i.addEventListener(`input`,()=>{g=1,v()}),p.addEventListener(`click`,()=>{g!==1&&(--g,v())}),m.addEventListener(`click`,()=>{g!==_&&(g+=1,v())}),v(),r.append(i,h),document.body.appendChild(r),xr=r,r.updateComplete.then(()=>{r.isConnected&&i.focus()})}var Er=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`,`nachschlagen`];function Dr(e){return Er.includes(e)?e:`text`}var Or=[`text`,`number`,`textarea`,`select`,`nachschlagen`],J=class extends M{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``,this.nachschlagQuelle=``,this.anzeigeFeld=``,this.anzeigeTitel=``,this.speicherFeld=``,this.speicherTitel=``,this.einzigerTreffer=`nein`,this.anzeige=``,this.satz=void 0,this.angehakt=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource={wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`}}}static{this.kannAuswahlFolgen=!0}static{this.satzWahl={quelleProp:`nachschlagQuelle`,wenn:{attributeName:`fieldType`,equals:`nachschlagen`}}}static{this.bindableSpots=[{prop:`value`,label:`Wert`,wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`},vorschauProp:`placeholder`}]}static{this.actionValueSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``,nachschlagQuelle:``,anzeigeFeld:``,anzeigeTitel:``,speicherFeld:``,speicherTitel:``,einzigerTreffer:`nein`}}static{this.raster={startW:6,startH:2,minW:2,minH:2}}static{this.customProperties=Vn}static{this.styles=[M.styles,cr]}onInput(e){let t=e.target;this.value=Dr(this.fieldType)===`date`?er(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return C`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){this.hasAttribute(`data-ff-editor`)||this.setzeHaken(!this.angehakt)}setzeHaken(e){this.angehakt!==e&&(this.angehakt=e,this.dispatchEvent(new Event(`change`)))}controlTpl(e){switch(e){case`textarea`:return C`<textarea class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``),t=this.value!==``&&!e.includes(this.value);return C`<select class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}>
          <option value="" disabled hidden></option>
          ${t?C`<option value=${this.value} hidden>${this.value}</option>`:E}
          ${e.length===0?C`<option disabled>(keine Optionen)</option>`:e.map(e=>C`<option value=${e}>${e}</option>`)}
        </select>`}case`nachschlagen`:{let e=this.anzeige!==``||this.value!==``;return C`<div class="nachschlag${e?` mit-loeschen`:``}">
          <input class="ctrl" type="text" readonly .value=${this.anzeige} />
          ${e?C`<button
            class="loeschen"
            type="button"
            aria-label="Wert löschen"
            title="Wert löschen"
            @click=${this.onLoeschen}
          ><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
            <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
          </svg></button>`:E}
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
        </div>`}default:return C`<input
          class="ctrl"
          type=${e}
          .value=${e===`date`?$n(this.value):this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`}}onLupe(){this.hasAttribute(`data-ff-editor`)||Tr({el:this,quelleId:this.nachschlagQuelle,anzeigeFeld:this.anzeigeFeld,speicherFeld:this.speicherFeld,anzeigeTitel:this.anzeigeTitel,speicherTitel:this.speicherTitel,titel:this.placeholder,onUebernehmen:(e,t,n)=>{this.uebernimmSatz(e,t,n),this.dispatchEvent(new Event(`change`))}})}leereNachschlagen(){this.satz=void 0,this.anzeige=``,this.value=``,vt(z(this))}uebernimmSatz(e,t,n){this.anzeige=e===``?t:e,this.value=t,this.satz=n,_t(z(this),n)}onLoeschen(){this.hasAttribute(`data-ff-editor`)||(this.leereNachschlagen(),this.dispatchEvent(new Event(`change`)))}pruefeEigenenWert(){Dr(this.fieldType)===`nachschlagen`&&(this.satz!==void 0&&!br(this,this.satz)&&this.leereNachschlagen(),this.uebernimmEinzigenTreffer())}uebernimmEinzigenTreffer(){if(this.einzigerTreffer!==`ja`)return;let e=vr({el:this,quelleId:this.nachschlagQuelle,anzeigeFeld:this.anzeigeFeld,speicherFeld:this.speicherFeld});if(!e.ok)return;let t=yr(e.eintraege,this.satz===void 0);t&&this.uebernimmSatz(t.anzeige,t.wert,t.satz)}render(){let e=Dr(this.fieldType);if(e===`checkbox`)return C`<div class="feld">
        <div class="zeile">
          <input
            class="ctrl"
            type="checkbox"
            .checked=${this.angehakt}
            @change=${e=>this.setzeHaken(e.target.checked)}
          />
          ${this.textTpl(`text`)}
        </div>
      </div>`;let t=e!==`nachschlagen`;return C`<div class="feld">
      <div
        class="huelle"
        data-ff-spot=${t?`value`:E}
        ?data-ff-bound=${t&&this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${Or.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this.value!==``):E}
      </div>
    </div>`}connectedCallback(){super.connectedCallback(),or(this)}disconnectedCallback(){super.disconnectedCallback(),sr(this)}};j([A()],J.prototype,`fieldType`,void 0),j([A()],J.prototype,`placeholder`,void 0),j([A()],J.prototype,`options`,void 0),j([A()],J.prototype,`source`,void 0),j([A()],J.prototype,`value`,void 0),j([A()],J.prototype,`valueField`,void 0),j([A()],J.prototype,`nachschlagQuelle`,void 0),j([A()],J.prototype,`anzeigeFeld`,void 0),j([A()],J.prototype,`anzeigeTitel`,void 0),j([A()],J.prototype,`speicherFeld`,void 0),j([A()],J.prototype,`speicherTitel`,void 0),j([A()],J.prototype,`einzigerTreffer`,void 0),j([Be()],J.prototype,`anzeige`,void 0),j([Be()],J.prototype,`angehakt`,void 0),M.defineAndRegister(J);function kr(e,t,n,r){return{attributeName:e,name:t,description:n,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var Y=class extends M{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[K.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[En(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),kr(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte landen sie in der ersten Spalte.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[M.styles,o`
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
        border: var(--se-border) solid var(--col-line);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
        /* Flach (Fellnase Regel 4). Die Spalte TRAEGT die Karten und setzt
           sich von ihnen durch die Flaeche ab: getoente Spaltenschale
           (--col-shell) unter Karten in Papierweiss. Bis 2026-08-06 tat das
           ein Schatten. */
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
        border-bottom: var(--se-border) solid var(--col-line);
      }
      /* Quadratisch, nicht rund: derselbe Punkt wie an der Status-Marke
         (Fellnase Regel 5, 2026-08-06) — bis dahin war er eine Scheibe. */
      .dot {
        flex: none;
        width: 8px;
        height: 8px;
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
        border: var(--se-border) solid var(--col-line);
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
    `]}onSlotChange(e){let t=e.target;this._count=t.assignedElements().filter(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`).length}render(){return C`<div class="col v-${Tn(this.variant)}">
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
    </div>`}};j([A()],Y.prototype,`variant`,void 0),j([A()],Y.prototype,`heading`,void 0),j([Be()],Y.prototype,`_count`,void 0),M.defineAndRegister(Y);function Ar(e,t,n){return t===``||n===``?[...e]:e.filter(e=>jn(F(e,t))===n)}function jr(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function Mr(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var Nr=new WeakMap,Pr=Y.tagName,Fr=K.tagName;function Ir(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Pr)}function Lr(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Fr)}function Rr(e){return Ue().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function zr(e){Z?.board===e&&(Z=null);let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=P(U().FF_DATA_SOURCES,t);if(!r)return;let i=Ir(e);if(i.length===0)return;let a=Nr.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(Fr);t&&(a=t.cloneNode(!0),Nr.set(e,a))}if(!a)return;let o=Ar(L(U().SEDATA,r.name,r.tableId),e.getAttribute(`tagfield`)??``,In()),s=i.map(e=>e.getAttribute(`heading`)??Y.defaultProps.heading),c=Rr(a.tagName),l=Mr(i.map(e=>e.getAttribute(`auffang`))),u=Yn(e);for(let e of i)Lr(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:jr(F(e,n),s);(o>=0?i[o]:l>=0?i[l]:i[0]).appendChild(t);for(let n of c){let r=t.getAttribute(Hn(n.prop))??``;r!==``&&(t[n.prop]=u(e,r))}let d=r.indexField===``?``:F(e,r.indexField);X.set(t,{row:e,pindex:d}),t.draggable=!0}let d=i.flatMap(Lr),ee=ht(z(e),d,e=>X.get(e)?.row);for(let e of ee)d[e].setAttribute(`data-ff-auswahl`,``)}var X=new WeakMap,Z=null,Br=new WeakSet;function Vr(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===Pr&&e.contains(n))return n;return null}function Hr(e,t){if(!Z||Z.board!==e)return;let n=X.get(Z.card);if(!n)return;let r=t.getAttribute(`heading`)??``;bn(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r}).catch(yn)}function Ur(e){Br.has(e)||(Br.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&X.has(e))??null;if(!n)return;let r=X.get(n);r&&gt(z(e),r.row),bn(e,`onCardClick`,{PINDEX:r?.pindex??``}).catch(yn)}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&X.has(e))??null;n&&(Z={card:n,board:e},t.dataTransfer?.setData(`text/plain`,X.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{Z=null}),e.addEventListener(`dragover`,t=>{let n=Vr(e,t);Z?.board===e&&n&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=Vr(e,t);n&&(t.preventDefault(),Hr(e,n),Z=null)}))}var Wr=Wn({hydriere:zr,verdrahte:Ur}),Gr=Wr.connect,Kr=Wr.disconnect,qr=Y.blockType,Jr=class extends M{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[qr]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:qr}}static{this.templateChild={type:K.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``,tagField:``}}static{this.raster={startW:24,startH:20,minW:6,minH:8}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,kind:`field`},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt das Board nur Einträge des Tages, den der Tageswähler zeigt. Leer = alle Einträge.`,kind:`field`}]}static{this.defaultChildren=[{type:qr,props:{heading:`Offen`,variant:`warning`},children:[{type:K.blockType}]},{type:qr,props:{heading:`In Arbeit`,variant:`info`}},{type:qr,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[M.styles,o`
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
    `]}render(){return C`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Gr(this)}disconnectedCallback(){super.disconnectedCallback(),Kr(this)}};M.defineAndRegister(Jr);var Yr={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Xr=e=>(...t)=>({_$litDirective$:e,values:t}),Zr=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Qr=`important`,$r=` !important`,ei=Xr(class extends Zr{constructor(e){if(super(e),e.type!==Yr.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith($r);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?Qr:``):n[e]=r}}return T}}),ti=[10,25,50],ni=`passend`,ri=ti[0];function ii(e){let t=Number(e);return ti.some(e=>e===t)?t:null}function ai(e,t){return Math.max(1,Math.floor((e-t)/32))}function oi({sichtbar:e,hatQuelle:t,proSeite:n,wunschSeite:r,platzhalterZeilen:i}){let a=t?Math.max(1,Math.ceil(e.length/n)):1,o=Math.min(Math.max(r,0),a-1);return t?{seiten:a,seite:o,zeilen:[...e.slice(o*n,(o+1)*n)]}:{seiten:a,seite:o,zeilen:Array.from({length:i},()=>null)}}function si(e){if(!e.hasAttribute(`fuellt`))return null;let t=e.renderRoot.querySelector(`.koerper`),n=e.renderRoot.querySelector(`.kopf`);return!(t instanceof HTMLElement)||!(n instanceof HTMLElement)?null:ai(t.clientHeight,n.offsetHeight)}function ci(e,t){if(typeof ResizeObserver>`u`)return null;let n=e.renderRoot.querySelector(`.koerper`);if(!n)return null;let r=new ResizeObserver(t);return r.observe(n),r}var li=`Spalte {n}`;function ui(e){return li.replace(`{n}`,String(e+1))}function di(){return[0,1,2].map(e=>({titel:ui(e),feld:``}))}function fi(e,t){if(e&&typeof e==`object`){let n=e;return{titel:typeof n.titel==`string`?n.titel:ui(t),feld:typeof n.feld==`string`?n.feld:``}}return typeof e==`string`?{titel:e,feld:``}:{titel:ui(t),feld:``}}function pi(e){let t;if(Array.isArray(e))t=e.map((e,t)=>fi(e,t));else if(typeof e==`number`&&Number.isFinite(e)||typeof e==`string`&&/^\d+$/.test(e)){let n=Math.max(1,Math.floor(Number(e)));t=[...Array(n).keys()].map(e=>({titel:ui(e),feld:``}))}else t=di();return t.length>8&&(t=t.slice(0,8)),t.length<1&&(t=[{titel:ui(0),feld:``}]),t}function mi(e){try{return pi(JSON.parse(e))}catch{return di()}}function hi(e){return mi(e.getAttribute(`spalten`)??``).map(e=>e.feld)}function gi(e){let t=e.getAttribute(`source`)??``;if(t===``){e.datenzeilen=[];return}let n=P(U().FF_DATA_SOURCES,t);if(!n){e.datenzeilen=[];return}let r=hi(e),{rows:i,gefiltert:a}=xt(e,Ar(L(U().SEDATA,n.name,n.tableId),e.getAttribute(`tagfield`)??``,In())),o=ht(z(e),i,e=>e)[0]??-1,s=Yn(e);e.rohzeilen=i,e.auswahlIndex=o,e.durchAuswahlGefiltert=a,e.datenzeilen=i.map(e=>r.map(t=>t===``?``:s(e,t)))}var _i=Wn({hydriere:gi}),vi=_i.connect,yi=_i.disconnect,bi=1,xi=/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/,Si=/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/,Ci=/^(\d{4})-(\d{2})-(\d{2})$/;function wi(e){let t=e.trim();if(t===``||!xi.test(t))return null;let n=t.includes(`,`)?t.replace(/\./g,``).replace(`,`,`.`):/^-?\d{1,3}(\.\d{3})+$/.test(t)?t.replace(/\./g,``):t,r=Number(n);return Number.isFinite(r)?r:null}function Ti(e){let t=e.trim();if(t===``)return null;let n=Ci.exec(t);if(n){let[,e,t,r]=n;return Ei(Number(e),Number(t),Number(r))}let r=Si.exec(t);if(r){let[,e,t,n]=r,i=Number(n);return Ei(n.length===2?i<=69?2e3+i:1900+i:i,Number(t),Number(e))}return null}function Ei(e,t,n){if(t<1||t>12||n<1||n>31)return null;let r=new Date(e,t-1,n);return r.getFullYear()!==e||r.getMonth()!==t-1||r.getDate()!==n?null:r.getTime()}function Di(e){let t=0,n=0,r=0;for(let i of e)i.trim()!==``&&(t++,wi(i)!==null&&n++,Ti(i)!==null&&r++);return t===0?`text`:r===t?`datum`:n===t?`zahl`:`text`}var Oi=new Intl.Collator(`de`,{numeric:!0,sensitivity:`base`});function ki(e,t,n){if(t<0||e.length===0)return e.map((e,t)=>t);let r=n=>e[n][t]??``,i=Di(e.map(e=>e[t]??``)),a=n?1:-1;return e.map((e,t)=>t).sort((e,t)=>{let n=r(e).trim(),o=r(t).trim();if(n===``&&o===``)return e-t;if(n===``)return bi;if(o===``)return-1;let s=i===`zahl`?(wi(n)??0)-(wi(o)??0):i===`datum`?(Ti(n)??0)-(Ti(o)??0):Oi.compare(n,o);return s===0?e-t:s*a})}function Ai(e,t,n){return C`<div class="steuerung">
    <button
      title="Letzte Spalte entfernen"
      @pointerdown=${n}
      @click=${r=>{n(r);let i=e();i.length>1&&(i.pop(),t(i))}}
    >−</button>
    <button
      title="Spalte hinzufügen"
      @pointerdown=${n}
      @click=${r=>{n(r);let i=e();i.length<8&&(i.push({titel:ui(i.length),feld:``}),t(i))}}
    >+</button>
  </div>`}function ji(e,t){let n=e.currentTarget;if(!n)return;e.stopPropagation(),e.preventDefault();let r=Array.from(n.childNodes),i=n.textContent??``;n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let a=window.getSelection(),o=document.createRange();o.selectNodeContents(n),a?.removeAllRanges(),a?.addRange(o);let s=!1,c=e=>{if(s)return;s=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,l),n.removeEventListener(`keydown`,u);let a=(n.textContent??``).trim();e&&a&&a!==i.trim()?t(a):n.replaceChildren(...r)},l=()=>c(!0),u=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),c(!1))};n.addEventListener(`blur`,l),n.addEventListener(`keydown`,u)}function Mi(e,t,n,r){ji(e,e=>{let i=n();t>=i.length||(i[t]={...i[t],titel:e},r(i))})}var Ni=220,Pi=new WeakMap;function Fi(e){let t=Pi.get(e);t!==void 0&&(clearTimeout(t),Pi.delete(e))}function Ii(e,t,n,r){t.stopPropagation();let i=t.currentTarget.getBoundingClientRect();Fi(e),Pi.set(e,setTimeout(()=>{Pi.delete(e),e.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:n,index:r,top:i.bottom+4,left:i.left},bubbles:!0,composed:!0}))},Ni))}function Li(e,t){let n=[];return e.forEach((e,r)=>{pr(e,t)&&n.push(r)}),n}function Ri(e,t){return!e&&t.trim()!==``}function zi(e){if(!e.hatQuelle)return`— Datensätze`;let t=e.auswahlAktiv?` · durch Auswahl gefiltert`:``,n=e=>e===1?`Datensatz`:`Datensätze`,r=e=>e===1?`Datensatz`:`Datensätzen`;return e.suchtAktiv?e.sichtbar===0?`Kein Treffer von ${e.gesamt} ${r(e.gesamt)}`+t:`${e.sichtbar} von ${e.gesamt} ${r(e.gesamt)}`+t:(e.gesamt===0?`Keine Datensätze`:`${e.gesamt} ${n(e.gesamt)}`)+t}var Bi=[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],Vi=[{attributeName:`suche`,name:`Suchzeile`,description:`Zeigt ueber der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.`,kind:`segment`,options:Bi,requiresDataSource:!0},{attributeName:`zeilenWaehler`,name:`Zeilen-Wähler`,description:`Zeigt dem Bediener unten in der Maske den Wähler „Zeilen pro Seite" — er darf die Einstellung dann für seine Sitzung übersteuern. Nein: es gilt unveränderlich, was hier im Editor eingestellt ist.`,kind:`segment`,options:Bi,requiresDataSource:!0},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Saetze des Tages, den der Tageswaehler zeigt. Leer = alle Saetze.`,kind:`field`}];function Hi(e,t){return C`<div class="fusszeile">
    <div class="seiten-info">${zi({hatQuelle:e.hatQuelle,sichtbar:e.sichtbar,gesamt:e.gesamt,suchtAktiv:e.suchtAktiv,auswahlAktiv:e.auswahlAktiv})}</div>
    <div class="seiten-nav">
      ${e.zeigeWaehler?C`<select
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
        <option value=${ni} ?selected=${e.einstellung===ni}>passend zur Höhe</option>
        ${ti.map(t=>C`<option value=${t} ?selected=${e.einstellung===String(t)}>${t} pro Seite</option>`)}
      </select>`:E}
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
  </div>`}function Ui(e,t){return C`
      ${e.zeigeSuche?C`<div class="suchzeile">
        <input
          type="search"
          placeholder="Tabelle durchsuchen…"
          aria-label="Tabelle durchsuchen"
          .value=${e.suchtext}
          @pointerdown=${t.stop}
          @input=${e=>t.setzeSuchtext(e.target.value)}
        />
      </div>`:``}
      <div class="koerper">
      <div class="kopf" style=${ei(e.cols)}>
        ${e.spalten.map((n,r)=>C`<div
            data-ff-editable
            @dblclick=${e=>t.dblklickKopf(e,r)}
            @click=${e=>t.klickKopf(e,r)}
          >${n.titel}${!e.editable&&e.sortSpalte===r?C`<span class="sort-pfeil">${e.sortAuf?` ▲`:` ▼`}</span>`:``}</div>`)}
      </div>
        ${e.zeilen.map(n=>C`<div
            class="zeile${n!==null&&e.hatQuelle?` waehlbar`:``}${n!==null&&n===e.auswahlIndex?` gewaehlt`:``}"
            style=${ei(e.cols)}
            @click=${()=>t.klickZeile(n)}
          >
            ${n===null?e.spalten.map(()=>C`<div>—</div>`):(e.datenzeilen[n]??[]).map(e=>C`<div>${e}</div>`)}
          </div>`)}
        <div class="lineal"></div>
      </div>
    `}var Wi=o`
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
      /* Der Tafel-Rahmen (Demo .tafel, Werte 1:1): Papierflaeche, EINE
         1,5px-Kante, grosse Rundung, nichts Koerperhaftes. overflow:hidden
         schneidet Kopf- und Fusszeile an den runden Ecken sauber ab.
         position:relative ist der Anker der frei schwebenden Editor-Hilfe
         unten (.steuerung), sonst nichts. */
      .tabelle {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--se-panel);
        border: var(--se-border) solid var(--se-line);
        border-radius: var(--se-r-lg);
        overflow: hidden;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      /* Kopfzeile der Tafel (Demo .tafel-kopf): der Platz fuer die Knoepfe,
         rechtsbuendig. Die Demo zeigt dort zusaetzlich Titel und Zaehler —
         beides ist auf Nutzer-Ansage 2026-08-06 raus (Begruendung im Kopf von
         TabelleBlock). Aufbau, Kante und Farben kommen unveraendert aus der
         Demo; NUR der Innenabstand ist dichter als deren 14px/18px — die
         Maske bleibt ein dichtes Werkzeug (Nutzer-Entscheidung 2026-08-06,
         masken-tokens.css). Genommen sind dafuer vorhandene Abstands-Werte,
         keine neuen Zahlen.

         OHNE Knoepfe gibt es die Kopfzeile gar nicht: sonst saesse oben ein
         leerer Streifen mit Trennlinie, und zwar in jeder exportierten Maske,
         deren Tabelle einfach nur eine Liste ist. Der Baustein setzt
         hat-knoepfe, sobald wirklich etwas eingezogen ist (slotchange). Der
         <slot> bleibt trotzdem immer im Bau — ohne ihn koennte nichts
         einziehen und slotchange nie melden; display:none verhindert nur die
         Darstellung, nicht die Zuweisung. */
      .tafel-kopf { display: none; }
      .tafel-kopf.hat-knoepfe {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--se-gap);
        padding: var(--se-gap-sm) var(--se-gap);
        border-bottom: var(--se-border) solid var(--se-line);
      }
      /* Die Knoepfe sind ECHTE Baustein-Kinder (Registry: allowedChildTypes),
         keine gemalten Knoepfe — sie liegen im Light-DOM und kommen hier
         durch. display:contents macht sie zu Flex-Kindern der Kopfzeile,
         damit sie denselben Abstand tragen wie in der Demo. */
      .tafel-kopf slot { display: contents; }
      /* Suchzeile ueber dem Kopf: gehoert zur Tabelle, nicht zur Maske
         drumherum — deshalb sitzt sie INNERHALB des Rahmens. */
      .suchzeile {
        padding: 5px 8px;
        border-bottom: var(--se-border) solid var(--se-line);
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
        border: var(--se-border) solid var(--se-line);
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
        border-bottom: var(--se-border) solid var(--se-line);
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
         um eine. Der Kopf ist ausgenommen, er ist keine Datenzeile.
         Der Ton kommt aus der Demo (.tabelle tbody tr:hover -> --creme):
         eine Spur heller als der Seitengrund der Maske, nicht die sandfarbene
         Innenflaeche — bis 2026-08-06 stand hier --se-panel-2 und die Zeile
         sprang beim Zeigen deutlich zu dunkel. */
      .koerper > .zeile:hover {
        background: var(--se-bg);
      }
      /* Waehlbare Zeile (nur Laufzeit mit echten Daten, Klasse setzt der
         Baustein): der Zeiger sagt „hier passiert etwas". */
      .koerper > .zeile.waehlbar { cursor: pointer; }
      /* Die GEWAEHLTE Zeile (2026-08-05): getoente Akzentflaeche + kraeftiger
         Balken an der linken Kante — kantig, eindeutig, dieselbe Handschrift
         wie der Rest der Maske. inset-Schatten statt Rahmen, damit die
         Spaltenbreiten keinen Pixel verrutschen. Der Text wird voll lesbar
         (--se-ink statt --se-muted): die gewaehlte Zeile ist die, mit der
         der Bediener gerade arbeitet.
         Beide Werte stehen so in der Demo (.zeile--gewaehlt): Flaeche
         --sonne-zart (= --se-amber-soft), Streifen --koralle. Bis 2026-08-06
         war die Flaeche --se-accent-soft, also die getoente HAUSFARBE — damit
         trug die gewaehlte Zeile zweimal denselben Ton und der Streifen
         verlor seine Ansage. Der inset-Streifen ist kein Schatten (Regel 4):
         er sitzt IN der Zeile, damit die Spaltenbreiten keinen Pixel
         verrutschen. */
      .zeile.gewaehlt,
      .koerper > .zeile.gewaehlt:hover {
        background: var(--se-amber-soft);
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
      /* Fusszeile (Demo .tafel-fuss): OHNE eigene Flaeche — die Trennlinie
         allein setzt sie ab, genau wie in der Demo („der Rahmen traegt schon
         die Kante"). Bis 2026-08-06 lag hier --se-panel-2; der sandfarbene
         Streifen machte aus der Fusszeile eine zweite Leiste unter der
         Tabelle statt ihres unteren Randes. */
      .fusszeile {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 10px;
        border-top: var(--se-border) solid var(--se-line);
        font-size: var(--se-fs-sm);
        color: var(--se-muted);
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
        border: var(--se-border) solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-ink);
        cursor: pointer;
      }
      .seiten-nav button:disabled {
        opacity: 0.3;
        cursor: default;
      }
      /* Editor-only Spalten-Steuerung — NUR auf der Maskenfläche, nie im
         Export. Sie haengt an EINER von zwei Stellen, und der Baustein
         entscheidet an derselben Bedingung wie die Kopfzeile:
           - ohne Knoepfe: frei schwebend in der oberen rechten Ecke, wie seit
             jeher. Sie darf dem Baustein keinen Platz stehlen — eine
             Editor-Hilfe, die Raum belegt, verschiebt den Inhalt gegenueber
             dem Export (WYSIWYG-Bruch, s. BlockHost).
           - mit Knoepfen: als letztes Flex-Kind IN der Kopfzeile. Schwebend
             laege sie sonst auf dem rechten Knopf. Weil sie hinter den
             Knoepfen laeuft, stehen die trotzdem an derselben Stelle wie im
             Export — der Platz kommt aus dem ohnehin vorhandenen
             Innenabstand. */
      .steuerung { display: none; }
      :host([data-ff-editor]) .steuerung {
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 2;
        display: inline-flex;
        gap: 4px;
      }
      :host([data-ff-editor]) .tafel-kopf .steuerung {
        position: static;
        flex: none;
      }
      .steuerung button {
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        line-height: 1;
        padding: 3px 7px;
        border: var(--se-border) solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-muted);
        cursor: pointer;
      }
      .steuerung button:hover {
        border-color: var(--se-accent);
        color: var(--se-accent);
      }
`,Gi=4,Q=class e extends M{constructor(...e){super(...e),this.spalten=di(),this.source=``,this.suche=`ja`,this.proSeite=ni,this.zeilenWaehler=`nein`,this._suchtext=``,this.datenzeilen=[],this.rohzeilen=[],this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._hatKnoepfe=!1,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._proSeiteWahl=null,this._proSeiteGemessen=null,this._beobachter=null}static{this.blockType=`tabelle`}static{this.tagName=`ff-tabelle`}static{this.displayName=`Tabelle`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[Cn.blockType]}static{this.childDirection=`row`}static{this.containerHint=!1}static{this.addChildButton={label:`Knopf`,childType:Cn.blockType}}static{this.satzWahl={}}static{this.kannAuswahlFolgen=!0}static{this.listenBindung={prop:`spalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:li}}static{this.defaultProps={width:`fill`,source:``,spalten:di(),suche:`ja`,tagField:``,proSeite:ni,zeilenWaehler:`nein`}}static{this.customProperties=Vi}static{this.raster={startW:14,startH:8,minW:6,minH:4}}zaehleKnoepfe(e){let t=e.target;this._hatKnoepfe=t.assignedElements().some(e=>!e.hasAttribute(`data-ff-editor-helper`)&&e.tagName.toLowerCase()!==`template`)}get einstellung(){return this._proSeiteWahl??this.proSeite}get proSeiteAktuell(){return ii(this.einstellung)??this._proSeiteGemessen??ri}waehleProSeite(e){this.hasAttribute(`data-ff-editor`)?this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`proSeite`,value:e},bubbles:!0,composed:!0})):this._proSeiteWahl=e,this._seite=0,this.requestUpdate()}messeRumpf(){let e=si(this);e!==this._proSeiteGemessen&&(this._proSeiteGemessen=e,this.requestUpdate())}spaltenListe(){return pi(this.spalten)}sichtbareIndizes(){let e=Li(this.datenzeilen,this._suchtext);return this._sortSpalte<0?e:ki(e.map(e=>this.datenzeilen[e]),this._sortSpalte,this._sortAuf).map(t=>e[t])}klickZeile(e){if(e===null||this.hasAttribute(`data-ff-editor`))return;let t=z(this),n=this.rohzeilen[e];t===``||n===void 0||gt(t,n)}setzeSuchtext(e){this._suchtext=e,this._seite=0,this.requestUpdate()}klickSortiere(e){this.editable||(this._sortSpalte===e?this._sortAuf=!this._sortAuf:(this._sortSpalte=e,this._sortAuf=!0),this._seite=0,this.requestUpdate())}aendere(e){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`spalten`,value:e},bubbles:!0,composed:!0}))}beobachte(){this._beobachter||(this._beobachter=ci(this,()=>this.messeRumpf()),this._beobachter&&this.messeRumpf())}connectedCallback(){super.connectedCallback(),vi(this),this.beobachte()}firstUpdated(){this.beobachte()}disconnectedCallback(){super.disconnectedCallback(),Fi(this),this._beobachter?.disconnect(),this._beobachter=null,yi(this)}static{this.styles=[M.styles,Wi]}render(){let t=this.spaltenListe(),n={gridTemplateColumns:`repeat(${t.length}, minmax(0, 1fr))`},r=e=>e.stopPropagation(),i=this.sichtbareIndizes(),a=Ri(this.hasAttribute(`data-ff-editor`),this.source),o=i.length,s=Ai(()=>this.spaltenListe(),e=>this.aendere(e),r),c=this.proSeiteAktuell,{seiten:l,seite:u,zeilen:d}=oi({sichtbar:i,hatQuelle:a,proSeite:c,wunschSeite:this._seite,platzhalterZeilen:Gi});return C`<div class="tabelle" style=${ei({"--spalten-zahl":String(t.length),"--zeilen-hoehe":`32px`})}>
      <!-- Die Kopfzeile traegt NUR die Knoepfe. Sie entsteht auch nur mit
           ihnen (Klasse hat-knoepfe) — ohne Knoepfe waere sie ein leerer
           Streifen mit Trennlinie, im Editor wie in der Maske. Der <slot>
           steht trotzdem immer im Bau: ohne ihn koennte gar nichts
           einziehen und slotchange nie melden. -->
      <div class="tafel-kopf${this._hatKnoepfe?` hat-knoepfe`:``}">
        <slot @slotchange=${this.zaehleKnoepfe}></slot>
        ${this._hatKnoepfe?s:E}
      </div>
      ${this._hatKnoepfe?E:s}
      ${Ui({spalten:t,cols:n,editable:this.editable,zeigeSuche:this.suche===`ja`,suchtext:this._suchtext,sortSpalte:this._sortSpalte,sortAuf:this._sortAuf,zeilen:d,datenzeilen:this.datenzeilen,hatQuelle:a,auswahlIndex:this.auswahlIndex},{setzeSuchtext:e=>this.setzeSuchtext(e),dblklickKopf:(e,t)=>{this.editable&&(Fi(this),Mi(e,t,()=>this.spaltenListe(),e=>this.aendere(e)))},klickKopf:(t,n)=>{this.editable&&Ii(this,t,e.listenBindung.prop,n),this.klickSortiere(n)},klickZeile:e=>this.klickZeile(e),stop:r})}
      ${Hi({hatQuelle:a,sichtbar:o,gesamt:this.datenzeilen.length,suchtAktiv:this._suchtext.trim()!==``,auswahlAktiv:this.durchAuswahlGefiltert,zeigeWaehler:this.hasAttribute(`data-ff-editor`)||this.zeilenWaehler===`ja`,einstellung:this.einstellung,seite:u,seiten:l},{waehleProSeite:e=>this.waehleProSeite(e),blaettere:e=>{this._seite=e,this.requestUpdate()},stop:r})}
    </div>`}};j([A({converter:{fromAttribute:e=>e?mi(e):di(),toAttribute:e=>JSON.stringify(e)}})],Q.prototype,`spalten`,void 0),j([A()],Q.prototype,`source`,void 0),j([A()],Q.prototype,`suche`,void 0),j([A()],Q.prototype,`proSeite`,void 0),j([A()],Q.prototype,`zeilenWaehler`,void 0),j([A({attribute:!1})],Q.prototype,`datenzeilen`,void 0),j([A({attribute:!1})],Q.prototype,`rohzeilen`,void 0),j([A({attribute:!1})],Q.prototype,`auswahlIndex`,void 0),j([A({attribute:!1})],Q.prototype,`durchAuswahlGefiltert`,void 0),j([Be()],Q.prototype,`_hatKnoepfe`,void 0),M.defineAndRegister(Q);var Ki=Hn(`text`);function qi(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(Ki)??``;return t===``||n===``?void 0:{sourceId:t,code:n}}function Ji(e){let t=Xn(e,Ki);t.art!==`ungebunden`&&(e.text=t.art===`wert`?t.wert:``)}function Yi(e){qi(e)&&(e.text=``)}var Xi=Wn({hydriere:Ji,verdrahte:Yi}),Zi=Xi.connect,Qi=Xi.disconnect,$i=6,ea=96,ta=14,na={duenn:`300`,normal:`400`,fett:`700`},ra={links:`left`,mitte:`center`,rechts:`right`},ia={standard:`var(--se-ink)`,gedaempft:`var(--se-muted)`,akzent:`var(--se-accent)`,erfolg:`var(--se-green)`,warnung:`var(--se-amber)`,fehler:`var(--se-red)`},aa=`standard`;function oa(e){if(e===`ueberschrift`)return 15;if(e===`klein`)return 12;let t=typeof e==`number`?e:Number.parseFloat(String(e??``));return Number.isFinite(t)?Math.min(ea,Math.max($i,t)):ta}function sa(e){return typeof e==`string`&&e in na?e:`normal`}function ca(e){return typeof e==`string`&&e in ra?e:`links`}function la(e){return typeof e==`string`&&e in ia?e:aa}var $=class extends M{constructor(...e){super(...e),this.groesse=ta,this.gewicht=`normal`,this.ausrichtung=`links`,this.farbe=aa,this.text=`Text`,this.source=``,this.textField=``}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Text`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.kannAuswahlFolgen=!0}static{this.bindableSpots=[{prop:`text`,label:`Text`}]}static{this.defaultProps={width:`fill`,groesse:ta,gewicht:`normal`,ausrichtung:`links`,farbe:aa,text:`Text`,source:``,textField:``}}static{this.raster={startW:6,startH:2,minW:1,minH:1}}static{this.customProperties=[{attributeName:`groesse`,name:`Größe`,description:`Schriftgröße in Pixeln.`,kind:`number`,unit:`px`,min:$i,max:ea,inspectorRow:`Text-Stil`},{attributeName:`gewicht`,name:`Gewicht`,description:`Strichstärke der Schrift.`,kind:`segment`,options:[{value:`duenn`,label:`Dünn`},{value:`normal`,label:`Normal`},{value:`fett`,label:`Fett`}],inspectorRow:`Text-Stil`},{attributeName:`ausrichtung`,name:`Ausrichtung`,description:`Wo der Text in seiner Breite sitzt.`,kind:`segment`,options:[{value:`links`,label:`Links`},{value:`mitte`,label:`Mitte`},{value:`rechts`,label:`Rechts`}],inspectorRow:`Text-Stil`},{attributeName:`farbe`,name:`Farbe`,description:`Textfarbe aus den Farben der Maske.`,kind:`select`,options:[{value:`standard`,label:`Standard`},{value:`gedaempft`,label:`Gedämpft`},{value:`akzent`,label:`Akzent`},{value:`erfolg`,label:`Erfolg`},{value:`warnung`,label:`Warnung`},{value:`fehler`,label:`Fehler`}]}]}static{this.styles=[M.styles,o`
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
    `]}render(){return C`<div
      class="text"
      style=${ei({fontSize:`${oa(this.groesse)}px`,fontWeight:na[sa(this.gewicht)],textAlign:ra[ca(this.ausrichtung)],color:ia[la(this.farbe)]})}
      data-ff-editable
      data-ff-spot="text"
      ?data-ff-bound=${this.textField!==``}
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</div>`}connectedCallback(){super.connectedCallback(),Zi(this)}disconnectedCallback(){super.disconnectedCallback(),Qi(this)}};j([A({type:Number})],$.prototype,`groesse`,void 0),j([A()],$.prototype,`gewicht`,void 0),j([A()],$.prototype,`ausrichtung`,void 0),j([A()],$.prototype,`farbe`,void 0),j([A()],$.prototype,`text`,void 0),j([A()],$.prototype,`source`,void 0),j([A()],$.prototype,`textField`,void 0),M.defineAndRegister($);var ua=[`waagerecht`,`senkrecht`],da=`waagerecht`;function fa(e){return ua.includes(e)?e:da}var pa=class extends M{constructor(...e){super(...e),this.richtung=da}static{this.blockType=`trenner`}static{this.tagName=`ff-trenner`}static{this.displayName=`Trennlinie`}static{this.category=`layout`}static{this.defaultProps={width:`fill`,richtung:da}}static{this.resizableWidth=!1}static{this.raster={startW:24,startH:1,minW:1,minH:1,varianten:[{wenn:{attributeName:`richtung`,equals:`senkrecht`},startW:1,startH:6,breiteZiehbar:!1}]}}static{this.customProperties=[{attributeName:`richtung`,name:`Richtung`,description:`Waagerecht trennt oben von unten, senkrecht links von rechts.`,kind:`select`,options:[{value:`waagerecht`,label:`Waagerecht`},{value:`senkrecht`,label:`Senkrecht`}]}]}static{this.styles=[M.styles,o`
      /* Die Flaeche traegt den dezenten Aussenabstand (--se-gap-sm) QUER zur
         Linie und haelt den Strich mittig. Auf der Rasterflaeche fuellt sie
         die Zelle (:host([fuellt]) setzt die Hoehe), im Fluss bleibt sie so
         hoch wie ihr Inhalt. */
      .flaeche {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .waagerecht { padding: var(--se-gap-sm) 0; }
      .senkrecht {
        padding: 0 var(--se-gap-sm);
        /* Im FLUSS gibt es keine Zellhoehe, aus der sich der Strich bedienen
           koennte — ohne dieses Mindestmass waere er dort 0 hoch und damit
           unsichtbar. Auf der Rasterflaeche gewinnt die Zellhoehe. */
        min-height: 24px;
      }
      .linie { background: var(--se-line); }
      .waagerecht .linie { width: 100%; height: 1px; }
      .senkrecht .linie { width: 1px; height: 100%; }
    `]}render(){return C`<div class="flaeche ${fa(this.richtung)}"><div class="linie"></div></div>`}};j([A()],pa.prototype,`richtung`,void 0),M.defineAndRegister(pa);var ma=class extends M{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.raster={startW:24,startH:2,minW:2,minH:1}}static{this.customProperties=[]}static{this.styles=[M.styles,o`
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
    `]}render(){return C`<div class="zeile"><slot></slot></div>`}};M.defineAndRegister(ma),typeof window<`u`&&window.addEventListener(`unhandledrejection`,e=>{let t=e.reason;H(`Unerwarteter Fehler in der Maske: `+(t instanceof Error?t.message:String(t)))})})();