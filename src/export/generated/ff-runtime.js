(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:ee,getPrototypeOf:te}=Object,p=globalThis,m=p.trustedTypes,ne=m?m.emptyScript:``,h=p.reactiveElementPolyfillSupport,g=(e,t)=>e,_={toAttribute(e,t){switch(t){case Boolean:e=e?ne:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},v=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol(`metadata`),p.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(g(`elementProperties`)))return;let e=te(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(g(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(g(`properties`))){let e=this.properties,t=[...f(e),...ee(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?_:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?_:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??v)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:`open`},b[g(`elementProperties`)]=new Map,b[g(`finalized`)]=new Map,h?.({ReactiveElement:b}),(p.reactiveElementVersions??=[]).push(`2.1.2`);var re=globalThis,ie=e=>e,ae=re.trustedTypes,oe=ae?ae.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,se=`$lit$`,x=`lit$${Math.random().toFixed(9).slice(2)}$`,ce=`?`+x,le=`<${ce}>`,S=document,ue=()=>S.createComment(``),de=e=>e===null||typeof e!=`object`&&typeof e!=`function`,fe=Array.isArray,pe=e=>fe(e)||typeof e?.[Symbol.iterator]==`function`,me=`[ 	
\f\r]`,he=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,_e=/>/g,C=RegExp(`>|${me}(?:([^\\s"'>=/]+)(${me}*=${me}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ve=/'/g,ye=/"/g,be=/^(?:script|style|textarea|title)$/i,xe=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),w=xe(1),Se=xe(2),T=Symbol.for(`lit-noChange`),E=Symbol.for(`lit-nothing`),Ce=new WeakMap,D=S.createTreeWalker(S,129);function we(e,t){if(!fe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return oe===void 0?t:oe.createHTML(t)}var Te=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=he;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===he?c[1]===`!--`?o=ge:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=C):(be.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=C):o=_e:o===C?c[0]===`>`?(o=i??he,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?C:c[3]===`"`?ye:ve):o===ye||o===ve?o=C:o===ge||o===_e?o=he:(o=C,i=void 0);let d=o===C&&e[t+1].startsWith(`/>`)?` `:``;a+=o===he?n+le:l>=0?(r.push(s),n.slice(0,l)+se+n.slice(l)+x+d):n+x+(l===-2?t:d)}return[we(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Ee=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Te(t,n);if(this.el=e.createElement(l,r),D.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=D.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(se)){let t=u[o++],n=i.getAttribute(e).split(x),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ae:r[1]===`?`?je:r[1]===`@`?Me:ke}),i.removeAttribute(e)}else e.startsWith(x)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(be.test(i.tagName)){let e=i.textContent.split(x),t=e.length-1;if(t>0){i.textContent=ae?ae.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],ue()),D.nextNode(),c.push({type:2,index:++a});i.append(e[t],ue())}}}else if(i.nodeType===8)if(i.data===ce)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(x,e+1))!==-1;)c.push({type:7,index:a}),e+=x.length-1}a++}}static createElement(e,t){let n=S.createElement(`template`);return n.innerHTML=e,n}};function O(e,t,n=e,r){if(t===T)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=de(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=O(e,i._$AS(e,t.values),i,r)),t}var De=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??S).importNode(t,!0);D.currentNode=r;let i=D.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Oe(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ne(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=D.nextNode(),a++)}return D.currentNode=S,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Oe=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),de(e)?e===E||e==null||e===``?(this._$AH!==E&&this._$AR(),this._$AH=E):e!==this._$AH&&e!==T&&this._(e):e._$litType$===void 0?e.nodeType===void 0?pe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==E&&de(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Ee.createElement(we(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new De(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Ce.get(e.strings);return t===void 0&&Ce.set(e.strings,t=new Ee(e)),t}k(t){fe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(ue()),this.O(ue()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ie(e).nextSibling;ie(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},ke=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=E,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=E}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=O(this,e,t,0),a=!de(e)||e!==this._$AH&&e!==T,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=O(this,r[n+o],t,o),s===T&&(s=this._$AH[o]),a||=!de(s)||s!==this._$AH[o],s===E?e=E:e!==E&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ae=class extends ke{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===E?void 0:e}},je=class extends ke{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==E)}},Me=class extends ke{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=O(this,e,t,0)??E)===T)return;let n=this._$AH,r=e===E&&n!==E||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==E&&(n===E||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ne=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}},Pe=re.litHtmlPolyfillSupport;Pe?.(Ee,Oe),(re.litHtmlVersions??=[]).push(`3.3.3`);var Fe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Oe(t.insertBefore(ue(),e),e,void 0,n??{})}return i._$AI(e),i},Ie=globalThis,k=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Fe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};k._$litElement$=!0,k.finalized=!0,Ie.litElementHydrateSupport?.({LitElement:k});var Le=Ie.litElementPolyfillSupport;Le?.({LitElement:k}),(Ie.litElementVersions??=[]).push(`4.2.2`);var Re={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:v},ze=(e=Re,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function A(e){return(t,n)=>typeof n==`object`?ze(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function Be(e){return A({...e,state:!0,attribute:!1})}var Ve=new Map;function He(e){Ve.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Ve.set(e.type,e)}function Ue(){return Array.from(Ve.values())}var We={width:`auto`},Ge={rasterX:0,rasterY:0,rasterW:{spalten:24,spaltePx:40,zeilePx:12,gapPx:8}.spalten,rasterH:1},Ke=`weitereQuellen`,qe={[Ke]:[]},Je=`folgtAuswahl`,Ye={[Je]:[]};function j(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var M=class extends k{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
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
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;if(!n||n.hasAttribute(`data-ff-bound`))return;e.stopPropagation(),e.preventDefault();let r=n.textContent??``,i=Array.from(n.childNodes),a=i.map(e=>e.textContent??``);n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let o=window.getSelection(),s=document.createRange();s.selectNodeContents(n),o?.removeAllRanges(),o?.addRange(s);let c=!1,l=e=>{if(!c)if(c=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,u),n.removeEventListener(`keydown`,d),e){let e=(n.textContent??``).trim();e!==r&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0}))}else n.replaceChildren(...i),i.forEach((e,t)=>{e.textContent!==a[t]&&(e.textContent=a[t])})},u=()=>l(!0),d=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),l(!1))};n.addEventListener(`blur`,u),n.addEventListener(`keydown`,d)}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),He({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...We,...Ge,...e.acceptsDataSource?qe:null,...e.kannAuswahlFolgen?Ye:null,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,satzWahl:e.satzWahl,kannAuswahlFolgen:e.kannAuswahlFolgen,bindableSpots:e.bindableSpots,actionValueSpots:e.actionValueSpots,listenBindung:e.listenBindung,blockEvents:e.blockEvents,pageBlock:e.pageBlock,raster:e.raster})}};j([A({type:Boolean,reflect:!0,attribute:`data-editable`})],M.prototype,`editable`,void 0);var Xe=`data-ff-block-id`,Ze=[`fixed`,`context`,`data_field`,`block_value`,`gewaehlte_zeile`,`previous_result`,`step_result`,`se_variable`];function Qe(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function $e(e){return!Qe(e)||typeof e.source!=`string`||!Ze.includes(e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`||e.blockId!==void 0&&typeof e.blockId!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{},...typeof e.blockId==`string`?{blockId:e.blockId}:{}}}function et(e){if(!Qe(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!Qe(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=$e(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=$e(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function tt(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!Qe(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=et(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}function N(e){return typeof e==`object`&&!!e}function nt(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!N(n)||n.id!==t)&&!(typeof n.name!=`string`||typeof n.tableId!=`string`))return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``}}}function rt(e){return e==null?``:String(e).trim()}function P(e,t){if(!N(e)||t===``)return``;let n=t.trim(),r=rt(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=rt(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=rt(e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw);if(a===``)return``;let o=Number(i[1]),s=Number(i[2]);return s<=0?``:a.substring(o,o+s).trim()}function it(e,t,n){if(!N(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function at(e){if(!N(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function F(e,t){return rt(e).toLowerCase()===t.trim().toLowerCase()}function I(e,t,n){if(!N(e)||!N(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(N(e)&&(F(e.ALIAS,t)||F(e.alias,t))){let t=at(e);if(t.length>0)return t}}else if(N(i))for(let e of Object.keys(i)){let n=i[e];if(F(e,t)||N(n)&&(F(n.ALIAS,t)||F(n.alias,t))){let e=at(n);if(e.length>0)return e}}let a=r.Tabellen;if(N(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=at(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(F(e,t)){let t=at(a[e]);if(t.length>0)return t}}return[]}function ot(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!N(t)||!N(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function st(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!N(t)||!N(t.MSG)))return t.MSG.DATA}function ct(e){if(e==null)return``;try{return JSON.stringify(e)??``}catch{return``}}var L=new Map,lt=new Set,ut=!1,dt=!1;function ft(){if(ut){dt=!0;return}ut=!0;try{do dt=!1,lt.forEach(e=>e());while(dt)}finally{ut=!1}}function pt(e){lt.add(e)}function mt(e){return L.get(e)?.zeile}function ht(e){return L.get(e)?.merkmal??``}function R(e){return e.getAttribute(`data-ff-id`)??``}function gt(e,t,n){if(e===``)return[];let r=ht(e);if(r===``)return[];let i=[];return t.forEach((e,t)=>{ct(n(e))===r&&i.push(t)}),i.length===0&&yt(e),i}function _t(e,t){if(e===``)return;let n=ct(t);if(n===``)return;let r=L.get(e);r&&r.merkmal===n?L.delete(e):L.set(e,{zeile:t,merkmal:n}),ft()}function vt(e,t){if(e===``)return;let n=ct(t);n!==``&&L.get(e)?.merkmal!==n&&(L.set(e,{zeile:t,merkmal:n}),ft())}function yt(e){L.has(e)&&(L.delete(e),ft())}var bt=Je.toLowerCase();function xt(e){let t=e.getAttribute(bt)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.geberId!=`string`||e.geberId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({geberId:e.geberId,keyPairs:r})}return n}catch{return[]}}function St(e,t){let n=t,r=!1;for(let t of xt(e)){let e=mt(t.geberId);e!==void 0&&(r=!0,n=n.filter(n=>t.keyPairs.every(t=>{let r=P(e,t.fromField);return r!==``&&r===P(n,t.toField)})))}return{rows:n,gefiltert:r}}function Ct(e,t){if(xt(e).length===0)return t[0];let{rows:n,gefiltert:r}=St(e,t);return r?n[0]:void 0}var wt=`root`;function Tt(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var z=class extends M{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[wt]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[M.styles,o`
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
      </div>`}};j([A()],z.prototype,`name`,void 0),j([A()],z.prototype,`breite`,void 0),j([A()],z.prototype,`hoehe`,void 0),M.defineAndRegister(z);var Et=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Dt(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function Ot(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}var kt=8e3,B=null,At=null;function jt(){let e=document.createElement(`div`);return e.setAttribute(`data-ff-meldung`,``),e.setAttribute(`role`,`alert`),e.style.cssText=[`position:fixed`,`top:0`,`left:0`,`right:0`,`z-index:2147483647`,`padding:7px 12px`,`background:var(--se-red-soft,#fbe7e6)`,`color:var(--se-red,#c0201a)`,`border-bottom:1px solid var(--se-red,#c0201a)`,`font:500 12px/1.4 system-ui,sans-serif`,`cursor:pointer`].join(`;`),e.title=`Klicken zum Schliessen`,e.addEventListener(`click`,Mt),e}function Mt(){At&&=(clearTimeout(At),null),B?.remove(),B=null}function V(e){typeof document>`u`||!document.body||(B||(B=jt(),document.body.appendChild(B)),B.textContent=e,At&&clearTimeout(At),At=setTimeout(Mt,kt))}function H(){return globalThis}function Nt(){let e=H();return N(e.SEDATA)&&N(e.SEDATA.Daten)}function Pt(){let e=H();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function Ft(){let e=H();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var It=new Set,Lt=new Set;function Rt(e){It.add(e)}function zt(e){return Lt.add(e),()=>{Lt.delete(e)}}function Bt(){It.forEach(e=>e())}function Vt(e){Lt.forEach(t=>{try{t(e)}catch{}})}var U=new Map,Ht=``,Ut=0;function Wt(){try{let e=document.getElementById(`ff-se-diagnose`);return!e&&document.body&&(e=document.createElement(`textarea`),e.id=`ff-se-diagnose`,e.readOnly=!0,e.style.cssText=`display:none;position:fixed;left:8px;right:8px;bottom:8px;height:40vh;z-index:99999;font:11px monospace;`,document.body.appendChild(e)),e}catch{return null}}function Gt(){let e=Wt();e&&(e.value=Array.from(U,([e,t])=>`${e}: ${t}`).join(`
`)+(Ht===``?``:`\n\nERSTES PAKET\n${Ht}`))}function W(e,t){U.set(e,t),Gt()}function Kt(){let e=H();U.set(`basisHTML_REGISTER`,typeof e.basisHTML_REGISTER==`function`?`vorhanden`:`fehlt`),U.set(`basisHTML_SND_MSG`,typeof e.basisHTML_SND_MSG==`function`?`vorhanden`:`fehlt`),U.set(`body.pid`,document.body?.getAttribute(`pid`)?`gesetzt`:`fehlt`),U.set(`body.REGMSG`,document.body?.getAttribute(`REGMSG`)?`gesetzt`:`fehlt`),U.set(`Empfangene Pakete`,String(Ut)),U.set(`SEDATA.Daten`,Nt()?`vorhanden`:`fehlt`),Gt()}function qt(e){if(Ht===``)try{Ht=typeof e==`string`?e:JSON.stringify(e)??``,Gt()}catch{}}function Jt(e){Ut+=1,qt(e),W(`Empfangene Pakete`,String(Ut));let t=ot(e);if(!t){W(`Letztes Paket`,`Antwort ohne Daten`),Vt(e);return}let n=H();N(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,W(`Letztes Paket`,`Daten-Push angenommen`),W(`SEDATA.Daten`,`vorhanden`),Ft(),Bt()}function Yt(e=0){let t=H();if(typeof t.basisHTML_REGISTER==`function`){Kt();try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{Jt(e)},document.title,`1.0`),W(`Registrierung`,`ausgeführt`)}catch(e){W(`Registrierung`,`Fehler: ${e instanceof Error?e.message:String(e)}`)}return}e<400?(e===0&&W(`Registrierung`,`wartet auf Interface`),setTimeout(()=>{Yt(e+1)},25)):(Kt(),W(`Registrierung`,`nach 10s kein Interface`),V(`SoftEngine-Anschluss nicht gefunden — die Maske bleibt ohne Daten (Strg+Alt+D für Details).`))}var Xt=!1;function Zt(){if(Xt)return;Xt=!0,W(`Runtime`,`gestartet`),W(`Registrierung`,`noch nicht ausgeführt`),Kt(),Pt();let e=H();e.Erstellen=()=>{Ft(),Bt()},e.initData=e.Erstellen,e.ReloadData=()=>{Bt()},Yt(),window.addEventListener(`message`,e=>{if(typeof H().basisHTML_REGISTER==`function`)return;let t=st(e.data);t!==void 0&&Jt(t)},!0),document.addEventListener(`keydown`,e=>{if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()===`d`){Kt();let e=document.getElementById(`ff-se-diagnose`);e&&(e.style.display=e.style.display===`none`?`block`:`none`)}});let t=0,n=setInterval(()=>{t+=1,Nt()?(clearInterval(n),W(`SEDATA.Daten`,`vorhanden`),Ft(),Bt()):t>100&&(clearInterval(n),W(`Daten-Wartezeit`,`nach 30s ohne Daten`),V(`Keine Daten von SoftEngine empfangen — die Maske zeigt nichts an (Strg+Alt+D für Details).`))},300)}function Qt(e){return e instanceof Error?e.message:String(e)}function $t(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!N(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Et.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var en=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function tn(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function nn(e){if(typeof e==`string`)return e.trim()===``?void 0:e.trim();if(typeof e==`number`||typeof e==`boolean`)return String(e)}function rn(e,t){if(t>12)return;let n=nn(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=rn(n,t+1);if(e!==void 0)return e}return}if(N(e)){for(let n of en){if(!(n in e))continue;let r=rn(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=rn(n,t+1);if(e!==void 0)return e}}}function an(e){let t=tn(e);if(N(t)){for(let e of en){if(!(e in t))continue;let n=rn(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=an(t);if(e!==void 0)return e}else if(N(e)){let t=an(e);if(t!==void 0)return t}}}function on(e){return N(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function sn(e,t){if(!N(e))return;let n=on(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of n){let n=an(e[t]);if(n!==void 0)return n}}var cn=[],ln=!1,un=6e3,dn=100;function fn(){if(ln||cn.length===0)return;ln=!0;let e=cn.shift(),t=H(),n=new Set(on(t.SEDATA)),r=!1,i=t=>{r||(r=!0,a(),clearInterval(o),clearTimeout(s),ln=!1,e.resolve(t),fn())},a=zt(e=>{let t=an(e);t!==void 0&&i(t)}),o=setInterval(()=>{let e=sn(H().SEDATA,n);e!==void 0&&i(e)},dn),s=setTimeout(()=>{V(`Daten laden: SoftEngine hat nicht geantwortet (Relation Nr. ${e.template.nr}).`),i(``)},un);if(typeof t.basisHTML_SND_MSG!=`function`){V(`Daten laden nicht moeglich: keine Verbindung zu SoftEngine.`),i(``);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch(t){V(`Daten laden fehlgeschlagen (Relation Nr. ${e.template.nr}): ${Qt(t)}`),i(``)}}function pn(e,t){Zt();let n=H();if(e.verb!==`GET_RELATION`){if(typeof n.basisHTML_SND_MSG!=`function`)return V(`Speichern nicht moeglich: keine Verbindung zu SoftEngine. Die Eingabe wurde NICHT uebernommen.`),Promise.resolve(``);try{n.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch(t){V(`Speichern fehlgeschlagen (Relation Nr. ${e.nr}): ${Qt(t)}`)}return Promise.resolve(``)}return new Promise(n=>{cn.push({template:e,params:[...t],resolve:n}),fn()})}function mn(e,t){if(!N(t))return``;let n=t.document;if(!n||typeof n.querySelectorAll!=`function`)return``;let r=Array.from(n.querySelectorAll(`[${Xe}]`)).find(t=>t.getAttribute(Xe)===e.blockId);if(!r)return``;let i=r[e.value];return i==null?``:String(i)}function hn(e,t,n=H()){if(e.source===`aus`)return``;if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);return Number.isInteger(n)&&n>=0?t.stepResults?.[n]??``:``}if(e.source===`block_value`)return mn(e,n);if(e.source===`gewaehlte_zeile`){let n=t.gewaehlteZeile?.(e.blockId??``);return n===void 0?``:P(n,e.value)}if(!N(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!N(t)||!N(t.Daten)||!N(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=nt(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=I(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>P(e,r.indexField)===a):i[0];return o?P(o,e.value):``}function gn(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function _n(e,t){if(e.trim()===``)return;let n=H();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(gn(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function vn(e,t,n){if(t.trim()!==``)for(let r of Array.from(e.querySelectorAll(z.tagName)))(r.getAttribute(`name`)??z.defaultProps.name)===t&&(n?r.setAttribute(`offen`,``):r.removeAttribute(`offen`))}var yn=new WeakMap;function bn(e){V(`Aktionskette fehlgeschlagen: `+(e instanceof Error?e.message:String(e)))}async function xn(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=tt(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=yn.get(e);if(i||(i=new Set,yn.set(e,i)),!i.has(t)){i.add(t);try{let t={...n,NOW_DATE:Dt(new Date)},i=``,a=[];for(let n of r){if(n.type===`START_TOOL`){_n(n.toolNr,Ot({params:n.toolParams},t)),a.push(``);continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){vn(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),a.push(``);continue}let r=$t(H().FF_RELATIONS,n.relationId);if(!r){a.push(``);continue}let o={context:t,previousResult:i,stepResults:a,gewaehlteZeile:mt},s=await pn(r,[...n.params,...n.extraParams].map(e=>hn(e,o)));a.push(s),r.verb===`GET_RELATION`&&(i=s),n.resultKey!==``&&(t[n.resultKey]=s)}}finally{i.delete(t)}}}var Sn=new WeakSet;function Cn(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||Sn.has(e))return;Sn.add(e);let n=tt(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&Zt(),e.addEventListener(`click`,()=>{xn(e,t,{}).catch(bn)})}var wn=class extends M{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.raster={startW:4,startH:2,minW:2,minH:2}}static{this.customProperties=[]}static{this.styles=[M.styles,o`
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
    `]}render(){return w`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),Cn(this,`onClick`)}};j([A()],wn.prototype,`label`,void 0),M.defineAndRegister(wn);var Tn=[`info`,`success`,`warning`,`danger`];function En(e){return Tn.includes(e)?e:`info`}var Dn=[{wert:`info`,name:`Hinweis`},{wert:`success`,name:`Erfolg`},{wert:`warning`,name:`Warnung`},{wert:`danger`,name:`Fehler`}];function On(e,t){return{attributeName:e,name:`Farbe`,description:t,kind:`select`,options:Dn.map(e=>({value:e.wert,label:e.name}))}}var kn=o`
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
`,An={hund:`data:image/png;base64,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`,katze:`data:image/png;base64,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`,kaninchen:`data:image/png;base64,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`,hamster:`data:image/png;base64,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`,meerschweinchen:`data:image/png;base64,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`,vogel:`data:image/png;base64,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`,schildkroete:`data:image/png;base64,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`,fisch:`data:image/png;base64,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`,schlange:`data:image/png;base64,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`,pferd:`data:image/png;base64,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`},jn=Se`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`,Mn=[[`welpe`,`hund`],[`hund`,`hund`],[`kater`,`katze`],[`katze`,`katze`],[`kaninchen`,`kaninchen`],[`hase`,`kaninchen`],[`meerschwein`,`meerschweinchen`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`vogel`],[`sittich`,`vogel`],[`papagei`,`vogel`],[`vogel`,`vogel`],[`schildkr`,`schildkroete`],[`schlange`,`schlange`],[`natter`,`schlange`],[`python`,`schlange`],[`echse`,`schlange`],[`gecko`,`schlange`],[`reptil`,`schlange`],[`fisch`,`fisch`],[`koi`,`fisch`],[`pferd`,`pferd`],[`pony`,`pferd`],[`fohlen`,`pferd`]];function Nn(e){let t=e.toLowerCase();for(let[e,n]of Mn)if(t.includes(e))return n;return``}function Pn(e){let t=Nn(e),n=t===``?void 0:An[t];if(n!==void 0)return w`<img src=${n} alt="" aria-hidden="true" />`}function Fn(e){return Pn(e)??w`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${jn}</svg>`}var In=o`
      /* Grundform (Demo .karte): Papierflaeche, EINE 1,5px-Kante, flach.
         Die linke obere Ecke ist EGKIG, weil dort die Lasche ansetzt — ohne
         Lasche ist sie rund wie die anderen drei (Klasse setzt der Baustein). */
      .card {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: visible;
        padding: 11px 13px 12px;
        background: var(--se-card-bg);
        border: var(--se-border) solid var(--se-card-line);
        border-radius: 0 var(--se-r-md) var(--se-r-md) var(--se-r-md);
        font-family: var(--se-font);
        transition: border-color var(--se-move);
      }
      .card.ohne-reiter { border-radius: var(--se-r-md); }
      /* Platz fuer die Lasche, die ueber die Oberkante hinausragt (Demo:
         .karte margin-top 24px). NUR wenn es sie gibt — eine Karte ohne Datum
         und Zeit soll keinen Leerraum ueber sich schieben.
         flow-root am Host, damit dieser Abstand nicht mit dem Aussenabstand
         der Spalte verschmilzt (margin collapsing): sonst kaeme die Lasche der
         Karte darueber ins Gehege. */
      :host { display: flow-root; }
      .card.mit-reiter { margin-top: 24px; }
      /* Flach (Fellnase Regel 4): beim Zeigen wird die KANTE dunkler, die
         Karte hebt nicht ab. */
      .card:hover { border-color: var(--se-faint); }
      /* Statusfarbe AM KOERPER (Nutzer-Go 2026-07-30, bleibt): ein schmaler
         Streifen links macht den Status auf einen Blick lesbar, ohne eine
         neue Farbe oder Eigenschaft zu kosten. Die Demo kennt ihn nicht — sie
         zeigt Status nur an der Marke und behandelt allein den Notfall
         besonders (s. unten). Beides zusammen ist kein Widerspruch: der
         Streifen ist die Ampel, der Notfall-Zustand der Alarm. */
      .card { border-left-width: 3px; }
      .card.v-info { border-left-color: var(--se-blue); }
      .card.v-success { border-left-color: var(--se-green); }
      .card.v-warning { border-left-color: var(--se-amber); }
      .card.v-danger { border-left-color: var(--se-red); }
      /* Notfall (Demo .karte--notfall): dieselbe Karte, klare Kante — Akzent
         an Rand und Lasche, ein HAUCH davon im Grund. Ein Anflug, keine
         Flaeche (Regel 2: ein lauter Ton je Flaeche). */
      .card.v-danger {
        border-color: var(--se-accent);
        border-left-color: var(--se-accent-dark);
        background: var(--se-red-soft);
      }
      .card.v-danger:hover { border-color: var(--se-accent-dark); }
      /* Die GEWAEHLTE Karte (Auswahl-Geber Kanban, 2026-08-05): getoente
         Akzentflaeche + Akzentrahmen — dieselbe Handschrift wie die gewaehlte
         Tabellenzeile. Das Attribut setzt NUR die Laufzeit (kanban/seRuntime),
         der Editor erfindet keine Auswahl (Regel 7). Der linke STATUS-Streifen
         bleibt sichtbar: er traegt Bedeutung (Notfall!). */
      :host([data-ff-auswahl]) .card {
        border-top-color: var(--se-accent);
        border-right-color: var(--se-accent);
        border-bottom-color: var(--se-accent);
        background: var(--se-accent-soft);
      }

      /* Die Lasche (Demo .karte-reiter): sitzt AUF der Oberkante, ohne
         Unterkante — sie geht in die Karte ueber. left:-1.5px richtet sie an
         der Aussenkante aus, nicht am Innenrand. */
      .reiter {
        position: absolute;
        left: calc(-1 * var(--se-border));
        bottom: calc(100% - 3px);
        display: flex;
        align-items: baseline;
        gap: 7px;
        padding: 3px 11px 6px;
        background: var(--se-card-bg);
        border: var(--se-border) solid var(--se-card-line);
        border-bottom: none;
        border-radius: var(--se-r-sm) var(--se-r-sm) 0 0;
        font-size: var(--se-fs-sm);
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: 0.04em;
        color: var(--se-muted);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .card:hover .reiter { border-color: var(--se-faint); }
      .card.v-danger .reiter,
      .card.v-danger:hover .reiter {
        background: var(--se-accent-dark);
        border-color: var(--se-accent-dark);
        color: var(--se-card-bg);
      }

      /* Kopf (Demo .karte-kopf): Bild links, 10px Abstand, daneben die Namen. */
      .kopf {
        display: flex;
        align-items: center;
        gap: var(--se-gap);
        min-width: 0;
      }
      /* Das Tierzeichen steht FREI, ohne Kachel (Fellnase-Entscheidung).
         36px ist das Kartenmass der Demo (.tier ohne Groessen-Zusatz). */
      .avatar {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        flex: none;
        color: var(--se-accent);
      }
      .avatar img,
      .avatar svg {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }
      .namen { min-width: 0; }
      /* Name (Demo .karte-name: 700 15,5px/1,25) und Zusatz (.karte-zusatz:
         12,5px, gedaempft). Beide einzeilig mit „…". */
      .name,
      .zusatz {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .name {
        color: var(--se-ink);
        font-size: var(--se-fs-lg);
        font-weight: 700;
        line-height: 1.25;
      }
      .zusatz {
        color: var(--se-muted);
        font-size: var(--se-fs-sm);
      }
      /* Fliesstext (Demo .karte-grund): 9px Abstand nach oben, hoehere
         Zeilenhoehe, hoechstens zwei Zeilen. */
      .grund {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-top: 9px;
        color: var(--se-ink);
        font-size: var(--se-fs);
        line-height: 1.45;
      }
      /* Fusszeile (Demo .karte-fuss): zwei Plaetze, auseinandergeschoben —
         links ein gedaempfter Text, rechts die Marke. */
      .fuss {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 10px;
      }
      .fussl {
        min-width: 0;
        color: var(--se-muted);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fuss .chip { flex: none; }

      /* Leere Stellen: NUR an der ausgewaehlten Karte (Nutzer-Ansage
         2026-08-06 „keine haesslichen Platzhalter"). In der Maske rendert die
         Karte sie ohnehin gar nicht, und im Editor stand bisher an JEDER
         Karte ein Strich je leerer Stelle — auch an der, die niemand gerade
         bearbeitet. Ganz weglassen geht nicht: eine leere Stelle ist 0px hoch
         und liesse sich nie anklicken, also nie an ein Feld binden.
         data-editable setzt der BlockHost am AUSGEWAEHLTEN Baustein
         (BasicBlock, reflektiert) — anfassen heisst sehen, wo Stellen sind. */
      :host([data-ff-editor][data-editable]) [data-ff-spot]:empty::before {
        content: '—';
        color: var(--se-faint);
      }
      :host([data-ff-editor][data-editable]) .avatar:empty {
        border: var(--se-border) dashed var(--se-faint);
        border-radius: var(--se-r-sm);
      }
      :host([data-ff-editor][data-editable]) .avatar:empty::before {
        content: none;
      }
`,G=class extends M{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[On(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[M.styles,kn,In]}stelle(e,t){return w`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}render(){let e=En(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=n(this.date)||n(this.time),i=n(this.avatar)||n(this.heading)||n(this.meta),a=n(this.heading2)||n(this.chipText);return w`<div class="card v-${e} ${r?`mit-reiter`:`ohne-reiter`}">
      ${r?w`<span class="reiter">
            ${n(this.date)?this.stelle(`date`,`datum`):E}
            ${n(this.time)?this.stelle(`time`,`zeit`):E}
          </span>`:E}
      ${i?w`<div class="kopf">
            ${n(this.avatar)?w`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?E:Fn(this.avatar)}</span>`:E}
            <div class="namen">
              ${n(this.heading)?this.stelle(`heading`,`name`):E}
              ${n(this.meta)?this.stelle(`meta`,`zusatz`):E}
            </div>
          </div>`:E}
      ${n(this.text)?this.stelle(`text`,`grund`):E}
      ${a?w`<div class="fuss">
            ${n(this.heading2)?this.stelle(`heading2`,`fussl`):E}
            ${n(this.chipText)?w`<span
                  class="chip v-${e}"
                  data-ff-editable
                  data-ff-spot="chipText"
                  ?data-ff-bound=${this.chipTextField!==``}
                  @dblclick=${e=>this.inlineEdit(e,`chipText`)}
                >${this.chipText}</span>`:E}
          </div>`:E}
    </div>`}};j([A()],G.prototype,`chipVariant`,void 0),j([A()],G.prototype,`heading`,void 0),j([A()],G.prototype,`heading2`,void 0),j([A()],G.prototype,`time`,void 0),j([A()],G.prototype,`date`,void 0),j([A()],G.prototype,`avatar`,void 0),j([A()],G.prototype,`meta`,void 0),j([A()],G.prototype,`text`,void 0),j([A()],G.prototype,`chipText`,void 0),j([A()],G.prototype,`headingField`,void 0),j([A()],G.prototype,`heading2Field`,void 0),j([A()],G.prototype,`timeField`,void 0),j([A()],G.prototype,`dateField`,void 0),j([A()],G.prototype,`avatarField`,void 0),j([A()],G.prototype,`metaField`,void 0),j([A()],G.prototype,`textField`,void 0),j([A()],G.prototype,`chipTextField`,void 0),M.defineAndRegister(G);function Ln(e){let t=String(e??``).trim();if(t===``)return``;let n=/^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(t);if(n)return`${n[3]}-${n[2].padStart(2,`0`)}-${n[1].padStart(2,`0`)}`;let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return r?`${r[1]}-${r[2]}-${r[3]}`:``}function Rn(e){let t=String(e.getMonth()+1).padStart(2,`0`),n=String(e.getDate()).padStart(2,`0`);return`${e.getFullYear()}-${t}-${n}`}function zn(e,t){let n=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!n)return``;let r=new Date(Number(n[1]),Number(n[2])-1,Number(n[3]));return r.setDate(r.getDate()+t),Rn(r)}var Bn=``,Vn=new Set;function Hn(){return Bn}function Un(e){let t=Ln(e);t!==Bn&&(Bn=t,Vn.forEach(e=>e()))}function Wn(e){return Vn.add(e),()=>{Vn.delete(e)}}var Gn=class extends M{constructor(...e){super(...e),this.tag=``,this.tagAbmelden=null}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.defaultProps={}}static{this.customProperties=[]}static{this.raster={startW:9,startH:2,minW:5,minH:2}}static{this.styles=[M.styles,o`
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
    `]}setzeTag(e){Un(e),this.tag=Hn()}render(){return w`<div class="waehler">
      <div class="riegel">
        <button class="pfeil" title="Vortag" @click=${()=>this.setzeTag(zn(this.tag,-1))}>‹</button>
        <input
          class="feld"
          type="date"
          .value=${this.tag}
          @change=${e=>this.setzeTag(e.target.value)}
        />
        <button class="pfeil" title="Folgetag" @click=${()=>this.setzeTag(zn(this.tag,1))}>›</button>
      </div>
      <button class="heute" @click=${()=>this.setzeTag(Rn(new Date))}>Heute</button>
    </div>`}connectedCallback(){super.connectedCallback(),this.tag=Hn()||Rn(new Date),!this.hasAttribute(`data-ff-editor`)&&(this.setzeTag(this.tag),this.tagAbmelden?.(),this.tagAbmelden=Wn(()=>{this.tag=Hn()}))}disconnectedCallback(){super.disconnectedCallback(),this.tagAbmelden?.(),this.tagAbmelden=null}};j([Be()],Gn.prototype,`tag`,void 0),M.defineAndRegister(Gn);var Kn={attributeName:`fieldType`,equals:`nachschlagen`},qn=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`checkbox`,label:`Ankreuzfeld`},{value:`nachschlagen`,label:`Nachschlagen`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`nachschlagQuelle`,name:`Quelle`,description:`Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.`,kind:`quelle`,visibleWhen:Kn},{attributeName:`anzeigeFeld`,name:`Angezeigt wird`,description:`Feld der Nachschlage-Quelle, dessen Wert der Bediener sieht (z. B. der Name).`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`anzeigeTitel`,visibleWhen:Kn},{attributeName:`speicherFeld`,name:`Gespeichert wird`,description:`Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer).`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`speicherTitel`,visibleWhen:Kn},{attributeName:`einzigerTreffer`,name:`Einzigen Treffer übernehmen`,description:`Bleibt in der Maske genau EIN Satz übrig (weil das Feld der Auswahl eines anderen folgt), übernimmt es diesen von selbst — ohne dass der Bediener die Lupe drückt. Nur in ein leeres Feld; die Lupe bleibt daneben bedienbar.`,kind:`segment`,options:[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],visibleWhen:Kn},{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,kind:`field`,visibleWhen:{attributeName:`fieldType`,notEquals:`nachschlagen`}}];function Jn(e){return`${e.toLowerCase()}field`}function Yn(e){let t=e.split(`::`);if(t.length!==2)return{quelleId:``,code:e};let[n,r]=t;return n===``||r===``?{quelleId:``,code:e}:{quelleId:n,code:r}}function Xn(e){let t=new Set,n=!1,r=()=>{Nt()&&t.forEach(e.hydriere)};return{connect:i=>{i.hasAttribute(`data-ff-editor`)||(t.add(i),e.verdrahte?.(i),n||(n=!0,Rt(r),Wn(r),pt(r)),Zt(),Nt()&&e.hydriere(i))},disconnect:e=>{t.delete(e)}}}var Zn=Ke.toLowerCase(),Qn=``;function $n(e){if(e.length===0)return``;let t=[];for(let n of e){let e=n.trim();if(e===``)return``;t.push(e)}return t.join(Qn)}function er(e){let t=e.getAttribute(Zn)??``;if(t===``)return[];try{let e=JSON.parse(t);if(!Array.isArray(e))return[];let n=[];for(let t of e){if(!t||typeof t!=`object`)continue;let e=t;if(typeof e.quelleId!=`string`||e.quelleId===``)continue;let r=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||r.push({fromField:e.fromField,toField:e.toField})}r.length!==0&&n.push({quelleId:e.quelleId,keyPairs:r})}return n}catch{return[]}}function tr(e){let t=er(e);if(t.length===0)return(e,t)=>P(e,Yn(t).code);let n=H().SEDATA,r=H().FF_DATA_SOURCES,i=new Map;for(let e of t){let t=nt(r,e.quelleId);if(!t)continue;let a=I(n,t.name,t.tableId),o=new Map;for(let t of a){let n=$n(e.keyPairs.map(e=>P(t,e.toField)));n!==``&&!o.has(n)&&o.set(n,t)}i.set(e.quelleId,{nachSchluessel:o,hierFelder:e.keyPairs.map(e=>e.fromField)})}return(e,t)=>{let{quelleId:n,code:r}=Yn(t);if(n===``)return P(e,r);let a=i.get(n);if(!a)return``;let o=$n(a.hierFelder.map(t=>P(e,t)));if(o===``)return``;let s=a.nachSchluessel.get(o);return s===void 0?``:P(s,r)}}function nr(e,t){let n=e.getAttribute(`source`)??``,r=e.getAttribute(t)??``;if(n===``||r===``)return{art:`ungebunden`};let i=nt(H().FF_DATA_SOURCES,n);if(!i)return{art:`ohneQuelle`};let a=Ct(e,I(H().SEDATA,i.name,i.tableId));if(a===void 0)return{art:`ohneZeile`};let{quelleId:o,code:s}=Yn(r);return{art:`wert`,wert:o===``?P(a,s):tr(e)(a,r),zeile:a,quelle:i,quelleId:o,reinerCode:s}}var rr=new WeakMap,ir=new WeakSet;function ar(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function or(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function sr(e){return typeof e.value==`string`?e.value:``}function cr(e){if(e.pruefeEigenenWert?.(),e.getAttribute(`fieldtype`)===`nachschlagen`){rr.delete(e);return}let t=nr(e,Jn(`value`));if(t.art!==`wert`){rr.delete(e),t.art===`ohneZeile`&&(e.value=``);return}let{zeile:n,quelle:r,quelleId:i,reinerCode:a,wert:o}=t,s=r.indexField===``?``:P(n,r.indexField);i===``?rr.set(e,{row:n,code:a,pindex:s}):rr.delete(e),e.value=o}function lr(e){let t=rr.get(e);return t&&it(t.row,t.code,sr(e)),t}function ur(e){ir.has(e)||(ir.add(e),e.addEventListener(`input`,()=>{lr(e)}),e.addEventListener(`change`,()=>{let t=lr(e);xn(e,`onChange`,{VALUE:sr(e),PINDEX:t?.pindex??``}).catch(bn)}))}var dr=Xn({hydriere:cr,verdrahte:ur}),fr=dr.connect,pr=dr.disconnect,mr=o`
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
`,hr=`ff-dialog-rahmen`,gr=`ff-dialog-schliessen`;function _r(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var K=class extends k{constructor(...e){super(...e),this.titel=`Dialog`,this.breite=520,this.hoehe=380,this.viewport=!1,this.mitWerkzeug=!1,this.escapeSchliesst=!1,this.escapeRegistriert=!1,this.aufTaste=e=>{e.key===`Escape`&&(e.stopPropagation(),this.schliesse())}}static{this.styles=o`
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
  `}aktualisiereEscape(){let e=this.isConnected&&this.escapeSchliesst;e!==this.escapeRegistriert&&(e?document.addEventListener(`keydown`,this.aufTaste,!0):document.removeEventListener(`keydown`,this.aufTaste,!0),this.escapeRegistriert=e)}schliesse(){this.dispatchEvent(new CustomEvent(gr,{bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),this.aktualisiereEscape()}updated(e){e.has(`escapeSchliesst`)&&this.aktualisiereEscape()}disconnectedCallback(){this.escapeRegistriert&&=(document.removeEventListener(`keydown`,this.aufTaste,!0),!1),super.disconnectedCallback()}render(){return w`
      <div class="abdunklung"></div>
      <div class="buehne">
        <section
          class="fenster"
          role="dialog"
          aria-modal="true"
          style="width:${_r(this.breite,520)}px;height:${_r(this.hoehe,380)}px"
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
    `}};j([A()],K.prototype,`titel`,void 0),j([A({type:Number})],K.prototype,`breite`,void 0),j([A({type:Number})],K.prototype,`hoehe`,void 0),j([A({type:Boolean,reflect:!0})],K.prototype,`viewport`,void 0),j([A({type:Boolean,reflect:!0,attribute:`mit-werkzeug`})],K.prototype,`mitWerkzeug`,void 0),j([A({type:Boolean,attribute:`escape-schliesst`})],K.prototype,`escapeSchliesst`,void 0),customElements.get(`ff-dialog-rahmen`)||customElements.define(hr,K);function vr(e){return e.trim().toLowerCase().split(/\s+/).filter(e=>e!==``)}function yr(e,t){let n=vr(t);if(n.length===0)return!0;let r=e.join(` `).toLowerCase();return n.every(e=>r.includes(e))}var br=10;function xr(e,t,n){let r=[];for(let i of e){let e=P(i,t).trim(),a=P(i,n).trim();(e!==``||a!==``)&&r.push({anzeige:e,wert:a,satz:i})}return r}function Sr(e,t){return e.filter(e=>yr([e.anzeige,e.wert],t))}function Cr(e,t,n,r){return xr(St(e,t).rows,n,r)}function wr(e){if(e.quelleId===``||e.anzeigeFeld===``||e.speicherFeld===``)return{ok:!1,grund:`unvollstaendig`};let t=nt(H().FF_DATA_SOURCES,e.quelleId);if(!t)return{ok:!1,grund:`quelleFehlt`};let n=I(H().SEDATA,t.name,t.tableId);return{ok:!0,eintraege:Cr(e.el,n,e.anzeigeFeld,e.speicherFeld)}}function Tr(e,t){return t&&e.length===1?e[0]:null}function Er(e,t){let{rows:n,gefiltert:r}=St(e,[t]);return!r||n.length>0}var Dr=null;function Or(){Dr?.remove(),Dr=null}function kr(e,t=!1){let n=document.createElement(t?`th`:`td`);return n.textContent=e,n.style.cssText=t?`position:sticky;top:0;z-index:1;padding:6px 10px;text-align:left;font-size:var(--se-fs-sm);font-weight:600;color:var(--se-muted);border-bottom:var(--se-border) solid var(--se-line);background:var(--se-panel-2)`:`box-sizing:border-box;height:24px;padding:3px 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:var(--se-border) solid var(--se-line-soft)`,n}function Ar(e,t){let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.setAttribute(`aria-label`,t),n.style.cssText=`box-sizing:border-box;width:26px;height:24px;padding:0;border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm);background:var(--se-panel);color:var(--se-ink);font:inherit;cursor:pointer`,n}function jr(e){let t=wr(e);if(!t.ok){V(t.grund===`unvollstaendig`?`Nachschlagen ist an diesem Feld nicht vollstaendig eingestellt (Quelle, Angezeigt, Gespeichert).`:`Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.`);return}let n=t.eintraege;Or();let r=document.createElement(hr);r.setAttribute(`data-ff-nachschlagen`,``),r.viewport=!0,r.mitWerkzeug=!0,r.escapeSchliesst=!0,r.titel=e.titel===``?`Nachschlagen`:e.titel,r.breite=520,r.hoehe=380,r.addEventListener(gr,Or),r.addEventListener(`click`,e=>e.stopPropagation());let i=document.createElement(`input`);i.slot=`werkzeug`,i.type=`search`,i.placeholder=`suchen ...`,i.setAttribute(`aria-label`,`Nachschlagen durchsuchen`),i.style.cssText=`box-sizing:border-box;width:100%;padding:5px 8px;font:inherit;color:inherit;background:var(--se-panel);border:var(--se-border) solid var(--se-line);border-radius:var(--se-r-sm)`;let a=document.createElement(`table`);a.style.cssText=`width:100%;table-layout:fixed;border-collapse:collapse`;let o=document.createElement(`colgroup`),s=document.createElement(`col`);s.style.width=`65%`;let c=document.createElement(`col`);c.style.width=`35%`,o.append(s,c);let l=document.createElement(`thead`),u=document.createElement(`tr`);u.append(kr(e.anzeigeTitel===``?`Angezeigt`:e.anzeigeTitel,!0),kr(e.speicherTitel===``?`Wert`:e.speicherTitel,!0)),l.appendChild(u);let d=document.createElement(`tbody`);a.append(o,l,d);let f=document.createElement(`div`);f.style.cssText=`flex:1 1 auto;min-height:0;overflow:auto`,f.appendChild(a);let ee=document.createElement(`div`);ee.style.cssText=`box-sizing:border-box;flex:none;display:flex;align-items:center;min-height:33px;padding:4px 10px;border-top:var(--se-border) solid var(--se-line);background:var(--se-panel-2);font-size:var(--se-fs-sm)`;let te=document.createElement(`span`);te.setAttribute(`aria-live`,`polite`),te.style.cssText=`flex:1;color:var(--se-muted)`;let p=document.createElement(`nav`);p.setAttribute(`aria-label`,`Trefferseiten`),p.style.cssText=`display:flex;align-items:center;gap:6px`;let m=Ar(`‹`,`Vorherige Seite`),ne=document.createElement(`span`);ne.style.cssText=`min-width:48px;text-align:center;color:var(--se-muted)`;let h=Ar(`›`,`Naechste Seite`);p.append(m,ne,h),ee.append(te,p);let g=document.createElement(`div`);g.style.cssText=`box-sizing:border-box;height:100%;min-height:0;display:flex;flex-direction:column`,g.append(f,ee);let _=1,v=1,y=()=>{d.replaceChildren();let t=Sr(n,i.value);v=Math.max(1,Math.ceil(t.length/br)),_=Math.min(_,v);let r=(_-1)*br,a=t.slice(r,r+br);if(te.textContent=t.length===0?`0 von 0`:`${r+1}-${Math.min(r+br,t.length)} von ${t.length}`,ne.textContent=`${_} / ${v}`,m.disabled=_===1,h.disabled=_===v,m.style.opacity=m.disabled?`0.4`:`1`,h.style.opacity=h.disabled?`0.4`:`1`,m.style.cursor=m.disabled?`default`:`pointer`,h.style.cursor=h.disabled?`default`:`pointer`,f.scrollTop=0,a.length===0){let e=document.createElement(`tr`),t=kr(n.length===0?`Diese Quelle hat keine Saetze.`:`Kein Satz passt zur Suche.`);t.colSpan=2,t.style.color=`var(--se-faint)`,t.style.fontSize=`var(--se-fs-sm)`,t.style.padding=`16px 10px`,e.appendChild(t),d.appendChild(e);return}for(let t of a){let n=document.createElement(`tr`);n.tabIndex=0,n.style.cursor=`pointer`;let r=kr(t.anzeige),i=kr(t.wert);i.style.fontFamily=`var(--se-mono)`,i.style.color=`var(--se-muted)`,n.append(r,i);let a=()=>{Or(),e.onUebernehmen(t.anzeige,t.wert,t.satz)};n.addEventListener(`click`,a),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),a())}),n.addEventListener(`mouseenter`,()=>{n.style.background=`var(--se-accent-soft)`}),n.addEventListener(`mouseleave`,()=>{n.style.background=``}),d.appendChild(n)}};i.addEventListener(`input`,()=>{_=1,y()}),m.addEventListener(`click`,()=>{_!==1&&(--_,y())}),h.addEventListener(`click`,()=>{_!==v&&(_+=1,y())}),y(),r.append(i,g),document.body.appendChild(r),Dr=r,r.updateComplete.then(()=>{r.isConnected&&i.focus()})}var Mr=[`text`,`number`,`textarea`,`select`,`date`,`checkbox`,`nachschlagen`];function Nr(e){return Mr.includes(e)?e:`text`}var Pr=[`text`,`number`,`textarea`,`select`,`nachschlagen`],q=class extends M{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``,this.nachschlagQuelle=``,this.anzeigeFeld=``,this.anzeigeTitel=``,this.speicherFeld=``,this.speicherTitel=``,this.einzigerTreffer=`nein`,this.anzeige=``,this.satz=void 0,this.angehakt=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource={wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`}}}static{this.kannAuswahlFolgen=!0}static{this.satzWahl={quelleProp:`nachschlagQuelle`,wenn:{attributeName:`fieldType`,equals:`nachschlagen`}}}static{this.bindableSpots=[{prop:`value`,label:`Wert`,wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`},vorschauProp:`placeholder`}]}static{this.actionValueSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``,nachschlagQuelle:``,anzeigeFeld:``,anzeigeTitel:``,speicherFeld:``,speicherTitel:``,einzigerTreffer:`nein`}}static{this.raster={startW:6,startH:2,minW:2,minH:2}}static{this.customProperties=qn}static{this.styles=[M.styles,mr]}onInput(e){let t=e.target;this.value=Nr(this.fieldType)===`date`?or(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return w`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){this.hasAttribute(`data-ff-editor`)||this.setzeHaken(!this.angehakt)}setzeHaken(e){this.angehakt!==e&&(this.angehakt=e,this.dispatchEvent(new Event(`change`)))}controlTpl(e){switch(e){case`textarea`:return w`<textarea class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}></textarea>`;case`select`:{let e=this.options.split(`,`).map(e=>e.trim()).filter(e=>e!==``),t=this.value!==``&&!e.includes(this.value);return w`<select class="ctrl" .value=${this.value} @input=${this.onInput} @change=${this.onChange}>
          <option value="" disabled hidden></option>
          ${t?w`<option value=${this.value} hidden>${this.value}</option>`:E}
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
        </div>`}default:return w`<input
          class="ctrl"
          type=${e}
          .value=${e===`date`?ar(this.value):this.value}
          @input=${this.onInput}
          @change=${this.onChange}
        />`}}onLupe(){this.hasAttribute(`data-ff-editor`)||jr({el:this,quelleId:this.nachschlagQuelle,anzeigeFeld:this.anzeigeFeld,speicherFeld:this.speicherFeld,anzeigeTitel:this.anzeigeTitel,speicherTitel:this.speicherTitel,titel:this.placeholder,onUebernehmen:(e,t,n)=>{this.uebernimmSatz(e,t,n),this.dispatchEvent(new Event(`change`))}})}leereNachschlagen(){this.satz=void 0,this.anzeige=``,this.value=``,yt(R(this))}uebernimmSatz(e,t,n){this.anzeige=e===``?t:e,this.value=t,this.satz=n,vt(R(this),n)}onLoeschen(){this.hasAttribute(`data-ff-editor`)||(this.leereNachschlagen(),this.dispatchEvent(new Event(`change`)))}pruefeEigenenWert(){Nr(this.fieldType)===`nachschlagen`&&(this.satz!==void 0&&!Er(this,this.satz)&&this.leereNachschlagen(),this.uebernimmEinzigenTreffer())}uebernimmEinzigenTreffer(){if(this.einzigerTreffer!==`ja`)return;let e=wr({el:this,quelleId:this.nachschlagQuelle,anzeigeFeld:this.anzeigeFeld,speicherFeld:this.speicherFeld});if(!e.ok)return;let t=Tr(e.eintraege,this.satz===void 0);t&&this.uebernimmSatz(t.anzeige,t.wert,t.satz)}render(){let e=Nr(this.fieldType);if(e===`checkbox`)return w`<div class="feld">
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
        data-ff-spot=${t?`value`:E}
        ?data-ff-bound=${t&&this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${Pr.includes(e)?this.textTpl(e===`select`?`ph ph-select`:`ph`,this.value!==``):E}
      </div>
    </div>`}connectedCallback(){super.connectedCallback(),fr(this)}disconnectedCallback(){super.disconnectedCallback(),pr(this)}};j([A()],q.prototype,`fieldType`,void 0),j([A()],q.prototype,`placeholder`,void 0),j([A()],q.prototype,`options`,void 0),j([A()],q.prototype,`source`,void 0),j([A()],q.prototype,`value`,void 0),j([A()],q.prototype,`valueField`,void 0),j([A()],q.prototype,`nachschlagQuelle`,void 0),j([A()],q.prototype,`anzeigeFeld`,void 0),j([A()],q.prototype,`anzeigeTitel`,void 0),j([A()],q.prototype,`speicherFeld`,void 0),j([A()],q.prototype,`speicherTitel`,void 0),j([A()],q.prototype,`einzigerTreffer`,void 0),j([Be()],q.prototype,`anzeige`,void 0),j([Be()],q.prototype,`angehakt`,void 0),M.defineAndRegister(q);function Fr(e,t,n,r){return{attributeName:e,name:t,description:n,kind:`select`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var J=class extends M{constructor(...e){super(...e),this.variant=`info`,this.heading=`Neue Spalte`,this._count=0}static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[G.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`}}static{this.customProperties=[On(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),Fr(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte landen sie in der ersten Spalte.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0})]}static{this.styles=[M.styles,o`
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
    </div>`}};j([A()],J.prototype,`variant`,void 0),j([A()],J.prototype,`heading`,void 0),j([Be()],J.prototype,`_count`,void 0),M.defineAndRegister(J);function Ir(e,t,n){return t===``||n===``?[...e]:e.filter(e=>Ln(P(e,t))===n)}function Lr(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function Rr(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var zr=new WeakMap,Br=J.tagName,Vr=G.tagName;function Hr(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Br)}function Ur(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Vr)}function Wr(e){return Ue().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function Gr(e){X?.board===e&&(X=null);let t=e.getAttribute(`source`)??``,n=e.getAttribute(`statusfield`)??``;if(t===``)return;let r=nt(H().FF_DATA_SOURCES,t);if(!r)return;let i=Hr(e);if(i.length===0)return;let a=zr.get(e);if(!a){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(Vr);t&&(a=t.cloneNode(!0),zr.set(e,a))}if(!a)return;let o=Ir(I(H().SEDATA,r.name,r.tableId),e.getAttribute(`tagfield`)??``,Hn()),s=i.map(e=>e.getAttribute(`heading`)??J.defaultProps.heading),c=Wr(a.tagName),l=Rr(i.map(e=>e.getAttribute(`auffang`))),u=tr(e);for(let e of i)Ur(e).forEach(e=>e.remove());for(let e of o){let t=a.cloneNode(!0),o=n===``?-1:Lr(P(e,n),s);(o>=0?i[o]:l>=0?i[l]:i[0]).appendChild(t);for(let n of c){let r=t.getAttribute(Jn(n.prop))??``;r!==``&&(t[n.prop]=u(e,r))}let d=r.indexField===``?``:P(e,r.indexField);Y.set(t,{row:e,pindex:d}),t.draggable=!0}let d=i.flatMap(Ur),f=gt(R(e),d,e=>Y.get(e)?.row);for(let e of f)d[e].setAttribute(`data-ff-auswahl`,``)}var Y=new WeakMap,X=null,Kr=new WeakSet;function qr(e,t){for(let n of t.composedPath())if(n instanceof HTMLElement&&n.tagName.toLowerCase()===Br&&e.contains(n))return n;return null}function Jr(e,t){if(!X||X.board!==e)return;let n=Y.get(X.card);if(!n)return;let r=t.getAttribute(`heading`)??``;xn(e,`onCardDrop`,{PINDEX:n.pindex,VALUE:r}).catch(bn)}function Yr(e){Kr.has(e)||(Kr.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Y.has(e))??null;if(!n)return;let r=Y.get(n);r&&_t(R(e),r.row),xn(e,`onCardClick`,{PINDEX:r?.pindex??``}).catch(bn)}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Y.has(e))??null;n&&(X={card:n,board:e},t.dataTransfer?.setData(`text/plain`,Y.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`))}),e.addEventListener(`dragend`,()=>{X=null}),e.addEventListener(`dragover`,t=>{let n=qr(e,t);X?.board===e&&n&&(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`))}),e.addEventListener(`drop`,t=>{let n=qr(e,t);n&&(t.preventDefault(),Jr(e,n),X=null)}))}var Xr=Xn({hydriere:Gr,verdrahte:Yr}),Zr=Xr.connect,Qr=Xr.disconnect,$r=J.blockType,ei=class extends M{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[$r]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:$r}}static{this.templateChild={type:G.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``,tagField:``}}static{this.raster={startW:24,startH:20,minW:6,minH:8}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,kind:`field`},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt das Board nur Einträge des Tages, den der Tageswähler zeigt. Leer = alle Einträge.`,kind:`field`}]}static{this.defaultChildren=[{type:$r,props:{heading:`Offen`,variant:`warning`},children:[{type:G.blockType}]},{type:$r,props:{heading:`In Arbeit`,variant:`info`}},{type:$r,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[M.styles,o`
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
    `]}render(){return w`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Zr(this)}disconnectedCallback(){super.disconnectedCallback(),Qr(this)}};M.defineAndRegister(ei);var ti={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ni=e=>(...t)=>({_$litDirective$:e,values:t}),ri=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},ii=`important`,ai=` !important`,oi=ni(class extends ri{constructor(e){if(super(e),e.type!==ti.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(ai);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?ii:``):n[e]=r}}return T}}),si=[10,25,50],ci=`passend`,li=si[0];function ui(e){let t=Number(e);return si.some(e=>e===t)?t:null}function di(e,t,n){return Math.max(1,Math.floor((e-t)/n))}function fi({sichtbar:e,hatQuelle:t,proSeite:n,wunschSeite:r,platzhalterZeilen:i}){let a=t?Math.max(1,Math.ceil(e.length/n)):1,o=Math.min(Math.max(r,0),a-1);return t?{seiten:a,seite:o,zeilen:[...e.slice(o*n,(o+1)*n)]}:{seiten:a,seite:o,zeilen:Array.from({length:i},()=>null)}}function pi(e,t){if(!e.hasAttribute(`fuellt`))return null;let n=e.renderRoot.querySelector(`.koerper`),r=e.renderRoot.querySelector(`.kopf`);return!(n instanceof HTMLElement)||!(r instanceof HTMLElement)?null:di(n.clientHeight,r.offsetHeight,t)}function mi(e,t){if(typeof ResizeObserver>`u`)return null;let n=e.renderRoot.querySelector(`.koerper`);if(!n)return null;let r=new ResizeObserver(t);return r.observe(n),r}function hi(e,t){let n=t.trim().toLowerCase();return e.find(e=>e.wert.trim().toLowerCase()===n)}var gi=`text`,_i=`status`,vi=`bild`,yi=`bild`,bi=`unter`,xi=[{wert:gi,name:`Text`,spur:`minmax(0, 1fr)`,klasse:``,zelle:e=>e},{wert:`zahl`,name:`Zahl`,spur:`90px`,klasse:`zahl`,zelle:e=>e},{wert:`datum`,name:`Datum`,spur:`100px`,klasse:`zahl`,zelle:e=>e},{wert:_i,name:`Status`,spur:`120px`,klasse:`status`,zelle:(e,t)=>{let n=hi(t,e);return n?w`<span class="chip v-${En(n.bedeutung)}">${n.name.trim()===``?e:n.name}</span>`:w`<span class="chip">${e}</span>`}},{wert:vi,name:`Bild + Name`,spur:`minmax(0, 1fr)`,klasse:`bild`,zusatzFelder:[{key:yi,label:`Bild`},{key:bi,label:`Unterzeile`}],hoehe:e=>(e[yi]??``)!==``||(e[bi]??``)!==``?44:32,zelle:(e,t,n)=>{let r=Pn(n[yi]??``),i=n[bi]??``;return w`<div class="bild-name">
        ${r===void 0?E:w`<span class="bild-zeichen">${r}</span>`}
        <div class="bild-text">
          <div class="bild-titel">${e}</div>
          ${i===``?E:w`<div class="bild-unter">${i}</div>`}
        </div>
      </div>`}}];function Si(e){return e.reduce((e,t)=>{let n=Ci(t.art);return Math.max(e,n.hoehe?.(t.felder??{})??32)},32)}function Ci(e){return xi.find(t=>t.wert===e)??xi[0]}var wi=xi.map(e=>({wert:e.wert,name:e.name,...e.zusatzFelder?{felder:e.zusatzFelder}:{}})),Ti=`felder`,Ei=`Spalte {n}`;function Di(e){return Ei.replace(`{n}`,String(e+1))}function Z(e){return{titel:Di(e),feld:``,art:gi}}function Oi(){return[0,1,2].map(e=>Z(e))}function ki(e){return Array.isArray(e)?e.filter(e=>!!e&&typeof e==`object`).map(e=>({wert:typeof e.wert==`string`?e.wert:``,name:typeof e.name==`string`?e.name:``,bedeutung:typeof e.bedeutung==`string`?e.bedeutung:``})).filter(e=>e.wert.trim()!==``):[]}function Ai(e){if(!e||typeof e!=`object`||Array.isArray(e))return{};let t={};for(let[n,r]of Object.entries(e))typeof r==`string`&&r!==``&&(t[n]=r);return t}function ji(e,t){if(e&&typeof e==`object`){let n=e,r=ki(n.zuordnung),i=Ai(n.felder);return{titel:typeof n.titel==`string`?n.titel:Di(t),feld:typeof n.feld==`string`?n.feld:``,art:typeof n.art==`string`?n.art:gi,...r.length>0?{zuordnung:r}:{},...Object.keys(i).length>0?{felder:i}:{}}}return typeof e==`string`?{...Z(t),titel:e}:Z(t)}function Mi(e){let t;if(Array.isArray(e))t=e.map((e,t)=>ji(e,t));else if(typeof e==`number`&&Number.isFinite(e)||typeof e==`string`&&/^\d+$/.test(e)){let n=Math.max(1,Math.floor(Number(e)));t=[...Array(n).keys()].map(e=>Z(e))}else t=Oi();return t.length>8&&(t=t.slice(0,8)),t.length<1&&(t=[Z(0)]),t}function Ni(e){try{return Mi(JSON.parse(e))}catch{return Oi()}}function Pi(e){return Ni(e.getAttribute(`spalten`)??``)}function Fi(e,t,n){let r={};for(let i of Ci(e.art).zusatzFelder??[]){let a=e.felder?.[i.key]??``;a!==``&&(r[i.key]=n(t,a))}return r}function Ii(e){let t=()=>{e.datenzeilen=[],e.zusatzzeilen=[]},n=e.getAttribute(`source`)??``;if(n===``){t();return}let r=nt(H().FF_DATA_SOURCES,n);if(!r){t();return}let i=Pi(e),{rows:a,gefiltert:o}=St(e,Ir(I(H().SEDATA,r.name,r.tableId),e.getAttribute(`tagfield`)??``,Hn())),s=gt(R(e),a,e=>e)[0]??-1,c=tr(e);e.rohzeilen=a,e.auswahlIndex=s,e.durchAuswahlGefiltert=o,e.datenzeilen=a.map(e=>i.map(t=>t.feld===``?``:c(e,t.feld))),e.zusatzzeilen=a.map(e=>i.map(t=>Fi(t,e,c)))}var Li=Xn({hydriere:Ii}),Ri=Li.connect,zi=Li.disconnect,Bi=1,Vi=/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/,Hi=/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/,Ui=/^(\d{4})-(\d{2})-(\d{2})$/;function Wi(e){let t=e.trim();if(t===``||!Vi.test(t))return null;let n=t.includes(`,`)?t.replace(/\./g,``).replace(`,`,`.`):/^-?\d{1,3}(\.\d{3})+$/.test(t)?t.replace(/\./g,``):t,r=Number(n);return Number.isFinite(r)?r:null}function Gi(e){let t=e.trim();if(t===``)return null;let n=Ui.exec(t);if(n){let[,e,t,r]=n;return Ki(Number(e),Number(t),Number(r))}let r=Hi.exec(t);if(r){let[,e,t,n]=r,i=Number(n);return Ki(n.length===2?i<=69?2e3+i:1900+i:i,Number(t),Number(e))}return null}function Ki(e,t,n){if(t<1||t>12||n<1||n>31)return null;let r=new Date(e,t-1,n);return r.getFullYear()!==e||r.getMonth()!==t-1||r.getDate()!==n?null:r.getTime()}function qi(e){let t=0,n=0,r=0;for(let i of e)i.trim()!==``&&(t++,Wi(i)!==null&&n++,Gi(i)!==null&&r++);return t===0?`text`:r===t?`datum`:n===t?`zahl`:`text`}var Ji=new Intl.Collator(`de`,{numeric:!0,sensitivity:`base`});function Yi(e,t,n){if(t<0||e.length===0)return e.map((e,t)=>t);let r=n=>e[n][t]??``,i=qi(e.map(e=>e[t]??``)),a=n?1:-1;return e.map((e,t)=>t).sort((e,t)=>{let n=r(e).trim(),o=r(t).trim();if(n===``&&o===``)return e-t;if(n===``)return Bi;if(o===``)return-1;let s=i===`zahl`?(Wi(n)??0)-(Wi(o)??0):i===`datum`?(Gi(n)??0)-(Gi(o)??0):Ji.compare(n,o);return s===0?e-t:s*a})}function Xi(e,t,n){return w`<div class="steuerung">
    <button
      title="Letzte Spalte entfernen"
      @pointerdown=${n}
      @click=${r=>{n(r);let i=e();i.length>1&&(i.pop(),t(i))}}
    >−</button>
    <button
      title="Spalte hinzufügen"
      @pointerdown=${n}
      @click=${r=>{n(r);let i=e();i.length<8&&(i.push(Z(i.length)),t(i))}}
    >+</button>
  </div>`}function Zi(e,t){let n=e.currentTarget;if(!n)return;e.stopPropagation(),e.preventDefault();let r=Array.from(n.childNodes),i=n.textContent??``;n.setAttribute(`contenteditable`,`plaintext-only`),n.focus();let a=window.getSelection(),o=document.createRange();o.selectNodeContents(n),a?.removeAllRanges(),a?.addRange(o);let s=!1,c=e=>{if(s)return;s=!0,n.removeAttribute(`contenteditable`),n.removeEventListener(`blur`,l),n.removeEventListener(`keydown`,u);let a=(n.textContent??``).trim();e&&a&&a!==i.trim()?t(a):n.replaceChildren(...r)},l=()=>c(!0),u=e=>{e.key===`Enter`?(e.preventDefault(),n.blur()):e.key===`Escape`&&(e.preventDefault(),c(!1))};n.addEventListener(`blur`,l),n.addEventListener(`keydown`,u)}function Qi(e,t,n,r){Zi(e,e=>{let i=n();t>=i.length||(i[t]={...i[t],titel:e},r(i))})}var $i=220,ea=new WeakMap;function ta(e){let t=ea.get(e);t!==void 0&&(clearTimeout(t),ea.delete(e))}function na(e,t,n,r){t.stopPropagation();let i=t.currentTarget.getBoundingClientRect();ta(e),ea.set(e,setTimeout(()=>{ea.delete(e),e.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:n,index:r,top:i.bottom+4,left:i.left},bubbles:!0,composed:!0}))},$i))}var ra={prop:`spalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:Ei,eintragsWahl:{key:`art`,label:`Darstellung`,optionen:wi,standard:gi,felderKey:Ti},eintragsZuordnung:{key:`zuordnung`,label:`Status-Zuordnung`,nurBeiWahl:_i,wertLabel:`Datenwert`,nameLabel:`Klarname`,bedeutungLabel:`Bedeutung`,bedeutungen:Dn}};function ia(e,t){let n=[];return e.forEach((e,r)=>{yr(e,t)&&n.push(r)}),n}function aa(e,t){return!e&&t.trim()!==``}function oa(e){if(!e.hatQuelle)return`— Datensätze`;let t=e.auswahlAktiv?` · durch Auswahl gefiltert`:``,n=e=>e===1?`Datensatz`:`Datensätze`,r=e=>e===1?`Datensatz`:`Datensätzen`;return e.suchtAktiv?e.sichtbar===0?`Kein Treffer von ${e.gesamt} ${r(e.gesamt)}`+t:`${e.sichtbar} von ${e.gesamt} ${r(e.gesamt)}`+t:(e.gesamt===0?`Keine Datensätze`:`${e.gesamt} ${n(e.gesamt)}`)+t}var sa=[{value:`ja`,label:`Ja`},{value:`nein`,label:`Nein`}],ca=[{attributeName:`suche`,name:`Suchzeile`,description:`Zeigt ueber der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.`,kind:`segment`,options:sa,requiresDataSource:!0},{attributeName:`zeilenWaehler`,name:`Zeilen-Wähler`,description:`Zeigt dem Bediener unten in der Maske den Wähler „Zeilen pro Seite" — er darf die Einstellung dann für seine Sitzung übersteuern. Nein: es gilt unveränderlich, was hier im Editor eingestellt ist.`,kind:`segment`,options:sa,requiresDataSource:!0},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Saetze des Tages, den der Tageswaehler zeigt. Leer = alle Saetze.`,kind:`field`}];function la(e,t){return w`<div class="fusszeile">
    <div class="seiten-info">${oa({hatQuelle:e.hatQuelle,sichtbar:e.sichtbar,gesamt:e.gesamt,suchtAktiv:e.suchtAktiv,auswahlAktiv:e.auswahlAktiv})}</div>
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
        <option value=${ci} ?selected=${e.einstellung===ci}>passend zur Höhe</option>
        ${si.map(t=>w`<option value=${t} ?selected=${e.einstellung===String(t)}>${t} pro Seite</option>`)}
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
  </div>`}var ua=`—`;function da(e,t){return w`
      ${e.zeigeSuche?w`<div class="suchzeile">
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
      <div class="kopf" style=${oi(e.cols)}>
        ${e.spalten.map((n,r)=>w`<div
            class=${Ci(n.art).klasse}
            data-ff-editable
            @dblclick=${e=>t.dblklickKopf(e,r)}
            @click=${e=>t.klickKopf(e,r)}
          >${n.titel}${!e.editable&&e.sortSpalte===r?w`<span class="sort-pfeil">${e.sortAuf?` ▲`:` ▼`}</span>`:``}</div>`)}
      </div>
        ${e.zeilen.map(n=>w`<div
            class="zeile${n!==null&&e.hatQuelle?` waehlbar`:``}${n!==null&&n===e.auswahlIndex?` gewaehlt`:``}"
            style=${oi(e.cols)}
            @click=${()=>t.klickZeile(n)}
          >
            ${``}
            ${e.spalten.map((t,r)=>{let i=Ci(t.art),a=n===null?ua:e.datenzeilen[n]?.[r]??``,o=n===null?{}:e.zusatzzeilen[n]?.[r]??{};return w`<div class=${i.klasse}>${i.zelle(a,t.zuordnung??[],o)}</div>`})}
          </div>`)}
        ${``}
        <div class="lineal" style=${oi(e.cols)}>
          ${e.spalten.map(()=>w`<div></div>`)}
        </div>
      </div>
    `}var fa=o`
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
         schneidet Suchzeile und Fusszeile an den runden Ecken sauber ab.
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
           Waagerecht im Zeilentakt als Verlauf — das ist reine Wiederholung
           und kann sich nicht verrechnen. */
        background-image:
          repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(var(--zeilen-hoehe) - 1px),
            var(--se-line-soft) calc(var(--zeilen-hoehe) - 1px),
            var(--se-line-soft) var(--zeilen-hoehe)
          );
        background-position: 0 0;
        /* Senkrecht dagegen mit echten Zellen im GLEICHEN Raster wie Kopf und
           Zeilen (der Baustein setzt es als style). Bis 2026-08-06 war auch das
           ein Verlauf im Takt 100% geteilt durch Spaltenzahl — das stimmte nur, solange
           alle Spalten gleich breit waren. Seit die Art die Breite bestimmt
           (Zahl 90, Datum 100, Status 120), waeren die Striche aus der Flucht
           gelaufen, wachsend nach rechts — genau der Fehler, den dieses
           Element 2026-07-27 schon einmal beseitigt hat. */
        display: grid;
      }
      .lineal > div { border-right: 1px solid var(--se-line-soft); }
      .lineal > div:last-child { border-right: none; }
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
      /* Zellentext in vollem Espresso, wie in der Demo (.tabelle td erbt den
         Grundton und daempft nichts). Bis 2026-08-06 stand hier --se-muted:
         die Werte waren blasser als ihre eigenen Ueberschriften, und die
         Tabelle las sich wie ausgegraut. Gedaempft bleibt allein, was WIRKLICH
         Nebensache ist — Sortierpfeil und Fusszeile. */
      .zeile > div { color: var(--se-ink); }

      /* ---- Spalten-Arten (./spaltenArten) ------------------------------
         Zahl und Datum teilen sich eine Klasse, weil die Demo es genauso
         macht: ihre Datumsspalten tragen die Klasse zelle-zahl. Rechtsbuendig mit
         gleichbreiten Ziffern (font-variant-numeric: tabular-nums) — damit
         stehen Tausender und Punkte untereinander. Der KOPF bekommt dieselbe
         Klasse und dieselbe Ausrichtung (Demo: .zahl-kopf), sonst stuende
         eine linksbuendige Ueberschrift ueber rechtsbuendigen Werten.
         Ein Datum wird nur AUSGERICHTET, nie umgerechnet (Nutzer 2026-08-06):
         was SoftEngine liefert, steht da. */
      .kopf > div.zahl,
      .zeile > div.zahl {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      /* Die Status-Zelle traegt eine Marke, keinen Text: als Flex-Kasten sitzt
         sie senkrecht mittig in der Zeile. Die Textkuerzung mit „…" faellt
         hier weg (die braeuchte einen Block) — noetig ist sie nicht, die Marke
         bricht ohnehin nicht um und der Zellrand schneidet sie ab. */
      .zeile > div.status {
        display: flex;
        align-items: center;
      }
      /* „Bild + Name" (Demo .zelle-patient): Bild links, daneben Name ueber
         der kleineren Unterzeile. Wie die Status-Zelle ein Flex-Kasten und
         damit ohne die Zeilen-line-height — die gilt fuer EINE Textzeile und
         wuerde hier beide auseinandertreiben. */
      .zeile > div.bild {
        display: flex;
        align-items: center;
      }
      .bild-name {
        display: flex;
        align-items: center;
        /* 10px wie in der Demo (.zelle-patient gap). */
        gap: var(--se-gap);
        min-width: 0;
      }
      /* 26px — das Tabellenmass der Demo (.tier--klein). Das Zeichen steht
         FREI: keine Kachel, kein Kreis, kein Rahmen (Fellnase-Entscheidung
         „ohne sie atmet es", vom Nutzer am 2026-08-06 fuer die Tabelle
         bestaetigt). Auch keine leere Flaeche, wenn nichts gebunden ist — die
         Zelle zeichnet das Zeichen dann gar nicht erst (./spaltenArten). */
      .bild-zeichen {
        display: grid;
        place-items: center;
        width: 26px;
        height: 26px;
        flex: none;
      }
      .bild-zeichen img {
        width: 100%;
        height: 100%;
        display: block;
        /* Die Zeichen sind quadratisch aufgefuellt; contain haelt sie auch
           dann unverzerrt, wenn die Flaeche einmal nicht quadratisch ist. */
        object-fit: contain;
      }
      .bild-text { min-width: 0; }
      /* Name (Demo .zelle-name: 600 15px/1.25) und Unterzeile (.zelle-zusatz:
         12,5px, gedaempft — hier --se-fs-sm = 12px, die dichte Stufe).
         Beide einzeilig mit „…": eine umbrechende Zeile spraenge aus dem Takt. */
      .bild-titel,
      .bild-unter {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bild-titel {
        font-size: var(--se-fs-lg);
        font-weight: 600;
        line-height: 1.25;
      }
      .bild-unter {
        color: var(--se-muted);
        font-size: var(--se-fs-sm);
        line-height: 1.35;
      }
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
         Export. Sie SCHWEBT bewusst in der oberen rechten Ecke, statt in einer
         Reihe mitzulaufen: eine Editor-Hilfe darf dem Baustein keinen Platz
         stehlen, sonst sitzt der Inhalt im Editor anders als im Export
         (WYSIWYG-Bruch, s. BlockHost). Genau daran ist am 2026-08-06 der
         Knoepfe-Platz in einer Kopfzeile gescheitert — die „+"/„−" schoben
         den Knopf im Editor nach links, im Export klebte er an der Kante.
         Wer diese Ecke belegen will, muss die Steuerung zuerst umziehen. */
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
`,pa=4,Q=class e extends M{constructor(...e){super(...e),this.spalten=Oi(),this.source=``,this.suche=`ja`,this.proSeite=ci,this.zeilenWaehler=`nein`,this._suchtext=``,this.datenzeilen=[],this.zusatzzeilen=[],this.rohzeilen=[],this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._proSeiteWahl=null,this._proSeiteGemessen=null,this._beobachter=null,this._taktGemessen=0}static{this.blockType=`tabelle`}static{this.tagName=`ff-tabelle`}static{this.displayName=`Tabelle`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.kannAuswahlFolgen=!0}static{this.listenBindung=ra}static{this.defaultProps={width:`fill`,source:``,spalten:Oi(),suche:`ja`,tagField:``,proSeite:ci,zeilenWaehler:`nein`}}static{this.customProperties=ca}static{this.raster={startW:14,startH:8,minW:6,minH:4}}get einstellung(){return this._proSeiteWahl??this.proSeite}get proSeiteAktuell(){return ui(this.einstellung)??this._proSeiteGemessen??li}waehleProSeite(e){this.hasAttribute(`data-ff-editor`)?this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`proSeite`,value:e},bubbles:!0,composed:!0})):this._proSeiteWahl=e,this._seite=0,this.requestUpdate()}messeRumpf(){let e=this.zeilenHoehe;this._taktGemessen=e;let t=pi(this,e);t!==this._proSeiteGemessen&&(this._proSeiteGemessen=t,this.requestUpdate())}spaltenListe(){return Mi(this.spalten)}get zeilenHoehe(){return Si(this.spaltenListe())}sichtbareIndizes(){let e=ia(this.datenzeilen,this._suchtext);return this._sortSpalte<0?e:Yi(e.map(e=>this.datenzeilen[e]),this._sortSpalte,this._sortAuf).map(t=>e[t])}klickZeile(e){if(e===null||this.hasAttribute(`data-ff-editor`))return;let t=R(this),n=this.rohzeilen[e];t===``||n===void 0||_t(t,n)}setzeSuchtext(e){this._suchtext=e,this._seite=0,this.requestUpdate()}klickSortiere(e){this.editable||(this._sortSpalte===e?this._sortAuf=!this._sortAuf:(this._sortSpalte=e,this._sortAuf=!0),this._seite=0,this.requestUpdate())}aendere(e){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`spalten`,value:e},bubbles:!0,composed:!0}))}beobachte(){this._beobachter||(this._beobachter=mi(this,()=>this.messeRumpf()),this._beobachter&&this.messeRumpf())}connectedCallback(){super.connectedCallback(),Ri(this),this.beobachte()}firstUpdated(){this.beobachte()}updated(){this._taktGemessen!==this.zeilenHoehe&&this.messeRumpf()}disconnectedCallback(){super.disconnectedCallback(),ta(this),this._beobachter?.disconnect(),this._beobachter=null,zi(this)}static{this.styles=[M.styles,kn,fa]}render(){let t=this.spaltenListe(),n={gridTemplateColumns:t.map(e=>Ci(e.art).spur).join(` `)},r=e=>e.stopPropagation(),i=this.sichtbareIndizes(),a=aa(this.hasAttribute(`data-ff-editor`),this.source),o=i.length,s=this.proSeiteAktuell,{seiten:c,seite:l,zeilen:u}=fi({sichtbar:i,hatQuelle:a,proSeite:s,wunschSeite:this._seite,platzhalterZeilen:pa});return w`<div class="tabelle" style=${oi({"--zeilen-hoehe":`${this.zeilenHoehe}px`})}>
      ${Xi(()=>this.spaltenListe(),e=>this.aendere(e),r)}
      ${da({spalten:t,cols:n,editable:this.editable,zeigeSuche:this.suche===`ja`,suchtext:this._suchtext,sortSpalte:this._sortSpalte,sortAuf:this._sortAuf,zeilen:u,datenzeilen:this.datenzeilen,zusatzzeilen:this.zusatzzeilen,hatQuelle:a,auswahlIndex:this.auswahlIndex},{setzeSuchtext:e=>this.setzeSuchtext(e),dblklickKopf:(e,t)=>{this.editable&&(ta(this),Qi(e,t,()=>this.spaltenListe(),e=>this.aendere(e)))},klickKopf:(t,n)=>{this.editable&&na(this,t,e.listenBindung.prop,n),this.klickSortiere(n)},klickZeile:e=>this.klickZeile(e),stop:r})}
      ${la({hatQuelle:a,sichtbar:o,gesamt:this.datenzeilen.length,suchtAktiv:this._suchtext.trim()!==``,auswahlAktiv:this.durchAuswahlGefiltert,zeigeWaehler:this.hasAttribute(`data-ff-editor`)||this.zeilenWaehler===`ja`,einstellung:this.einstellung,seite:l,seiten:c},{waehleProSeite:e=>this.waehleProSeite(e),blaettere:e=>{this._seite=e,this.requestUpdate()},stop:r})}
    </div>`}};j([A({converter:{fromAttribute:e=>e?Ni(e):Oi(),toAttribute:e=>JSON.stringify(e)}})],Q.prototype,`spalten`,void 0),j([A()],Q.prototype,`source`,void 0),j([A()],Q.prototype,`suche`,void 0),j([A()],Q.prototype,`proSeite`,void 0),j([A()],Q.prototype,`zeilenWaehler`,void 0),j([A({attribute:!1})],Q.prototype,`datenzeilen`,void 0),j([A({attribute:!1})],Q.prototype,`zusatzzeilen`,void 0),j([A({attribute:!1})],Q.prototype,`rohzeilen`,void 0),j([A({attribute:!1})],Q.prototype,`auswahlIndex`,void 0),j([A({attribute:!1})],Q.prototype,`durchAuswahlGefiltert`,void 0),M.defineAndRegister(Q);var ma=Jn(`text`);function ha(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(ma)??``;return t===``||n===``?void 0:{sourceId:t,code:n}}function ga(e){let t=nr(e,ma);t.art!==`ungebunden`&&(e.text=t.art===`wert`?t.wert:``)}function _a(e){ha(e)&&(e.text=``)}var va=Xn({hydriere:ga,verdrahte:_a}),ya=va.connect,ba=va.disconnect,xa=6,Sa=96,Ca=14,wa={duenn:`300`,normal:`400`,fett:`700`},Ta={links:`left`,mitte:`center`,rechts:`right`},Ea={standard:`var(--se-ink)`,gedaempft:`var(--se-muted)`,akzent:`var(--se-accent)`,erfolg:`var(--se-green)`,warnung:`var(--se-amber)`,fehler:`var(--se-red)`},Da=`standard`;function Oa(e){if(e===`ueberschrift`)return 15;if(e===`klein`)return 12;let t=typeof e==`number`?e:Number.parseFloat(String(e??``));return Number.isFinite(t)?Math.min(Sa,Math.max(xa,t)):Ca}function ka(e){return typeof e==`string`&&e in wa?e:`normal`}function Aa(e){return typeof e==`string`&&e in Ta?e:`links`}function ja(e){return typeof e==`string`&&e in Ea?e:Da}var $=class extends M{constructor(...e){super(...e),this.groesse=Ca,this.gewicht=`normal`,this.ausrichtung=`links`,this.farbe=Da,this.text=`Text`,this.source=``,this.textField=``}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Text`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.kannAuswahlFolgen=!0}static{this.bindableSpots=[{prop:`text`,label:`Text`}]}static{this.defaultProps={width:`fill`,groesse:Ca,gewicht:`normal`,ausrichtung:`links`,farbe:Da,text:`Text`,source:``,textField:``}}static{this.raster={startW:6,startH:2,minW:1,minH:1}}static{this.customProperties=[{attributeName:`groesse`,name:`Größe`,description:`Schriftgröße in Pixeln.`,kind:`number`,unit:`px`,min:xa,max:Sa,inspectorRow:`Text-Stil`},{attributeName:`gewicht`,name:`Gewicht`,description:`Strichstärke der Schrift.`,kind:`segment`,options:[{value:`duenn`,label:`Dünn`},{value:`normal`,label:`Normal`},{value:`fett`,label:`Fett`}],inspectorRow:`Text-Stil`},{attributeName:`ausrichtung`,name:`Ausrichtung`,description:`Wo der Text in seiner Breite sitzt.`,kind:`segment`,options:[{value:`links`,label:`Links`},{value:`mitte`,label:`Mitte`},{value:`rechts`,label:`Rechts`}],inspectorRow:`Text-Stil`},{attributeName:`farbe`,name:`Farbe`,description:`Textfarbe aus den Farben der Maske.`,kind:`select`,options:[{value:`standard`,label:`Standard`},{value:`gedaempft`,label:`Gedämpft`},{value:`akzent`,label:`Akzent`},{value:`erfolg`,label:`Erfolg`},{value:`warnung`,label:`Warnung`},{value:`fehler`,label:`Fehler`}]}]}static{this.styles=[M.styles,o`
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
      style=${oi({fontSize:`${Oa(this.groesse)}px`,fontWeight:wa[ka(this.gewicht)],textAlign:Ta[Aa(this.ausrichtung)],color:Ea[ja(this.farbe)]})}
      data-ff-editable
      data-ff-spot="text"
      ?data-ff-bound=${this.textField!==``}
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</div>`}connectedCallback(){super.connectedCallback(),ya(this)}disconnectedCallback(){super.disconnectedCallback(),ba(this)}};j([A({type:Number})],$.prototype,`groesse`,void 0),j([A()],$.prototype,`gewicht`,void 0),j([A()],$.prototype,`ausrichtung`,void 0),j([A()],$.prototype,`farbe`,void 0),j([A()],$.prototype,`text`,void 0),j([A()],$.prototype,`source`,void 0),j([A()],$.prototype,`textField`,void 0),M.defineAndRegister($);var Ma=[`waagerecht`,`senkrecht`],Na=`waagerecht`;function Pa(e){return Ma.includes(e)?e:Na}var Fa=class extends M{constructor(...e){super(...e),this.richtung=Na}static{this.blockType=`trenner`}static{this.tagName=`ff-trenner`}static{this.displayName=`Trennlinie`}static{this.category=`layout`}static{this.defaultProps={width:`fill`,richtung:Na}}static{this.resizableWidth=!1}static{this.raster={startW:24,startH:1,minW:1,minH:1,varianten:[{wenn:{attributeName:`richtung`,equals:`senkrecht`},startW:1,startH:6,breiteZiehbar:!1}]}}static{this.customProperties=[{attributeName:`richtung`,name:`Richtung`,description:`Waagerecht trennt oben von unten, senkrecht links von rechts.`,kind:`select`,options:[{value:`waagerecht`,label:`Waagerecht`},{value:`senkrecht`,label:`Senkrecht`}]}]}static{this.styles=[M.styles,o`
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
    `]}render(){return w`<div class="flaeche ${Pa(this.richtung)}"><div class="linie"></div></div>`}};j([A()],Fa.prototype,`richtung`,void 0),M.defineAndRegister(Fa);var Ia=class extends M{static{this.blockType=`zeile`}static{this.tagName=`ff-zeile`}static{this.displayName=`Zeile`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.childDirection=`row`}static{this.defaultProps={width:`fill`}}static{this.raster={startW:24,startH:2,minW:2,minH:1}}static{this.customProperties=[]}static{this.styles=[M.styles,o`
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
    `]}render(){return w`<div class="zeile"><slot></slot></div>`}};M.defineAndRegister(Ia),typeof window<`u`&&window.addEventListener(`unhandledrejection`,e=>{let t=e.reason;V(`Unerwarteter Fehler in der Maske: `+(t instanceof Error?t.message:String(t)))})})();