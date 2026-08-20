(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,re=globalThis,ie=re.trustedTypes,ae=ie?ie.emptyScript:``,oe=re.reactiveElementPolyfillSupport,se=(e,t)=>e,ce={toAttribute(e,t){switch(t){case Boolean:e=e?ae:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},le=(e,t)=>!l(e,t),ue={attribute:!0,type:String,converter:ce,reflect:!1,useDefault:!1,hasChanged:le};Symbol.metadata??=Symbol(`metadata`),re.litPropertyMetadata??=new WeakMap;var f=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ue){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ue}static _$Ei(){if(this.hasOwnProperty(se(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(se(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(se(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?ce:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?ce:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??le)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};f.elementStyles=[],f.shadowRootOptions={mode:`open`},f[se(`elementProperties`)]=new Map,f[se(`finalized`)]=new Map,oe?.({ReactiveElement:f}),(re.reactiveElementVersions??=[]).push(`2.1.2`);var de=globalThis,fe=e=>e,pe=de.trustedTypes,me=pe?pe.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,he=`$lit$`,p=`lit$${Math.random().toFixed(9).slice(2)}$`,ge=`?`+p,_e=`<${ge}>`,m=document,ve=()=>m.createComment(``),ye=e=>e===null||typeof e!=`object`&&typeof e!=`function`,be=Array.isArray,xe=e=>be(e)||typeof e?.[Symbol.iterator]==`function`,Se=`[ 	
\f\r]`,Ce=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,we=/-->/g,Te=/>/g,h=RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),Ee=/'/g,De=/"/g,Oe=/^(?:script|style|textarea|title)$/i,ke=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),g=ke(1),Ae=ke(2),_=Symbol.for(`lit-noChange`),v=Symbol.for(`lit-nothing`),je=new WeakMap,y=m.createTreeWalker(m,129);function Me(e,t){if(!be(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return me===void 0?t:me.createHTML(t)}var Ne=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=Ce;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===Ce?c[1]===`!--`?o=we:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=h):(Oe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=h):o=Te:o===h?c[0]===`>`?(o=i??Ce,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?h:c[3]===`"`?De:Ee):o===De||o===Ee?o=h:o===we||o===Te?o=Ce:(o=h,i=void 0);let d=o===h&&e[t+1].startsWith(`/>`)?` `:``;a+=o===Ce?n+_e:l>=0?(r.push(s),n.slice(0,l)+he+n.slice(l)+p+d):n+p+(l===-2?t:d)}return[Me(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Pe=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ne(t,n);if(this.el=e.createElement(l,r),y.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=y.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(he)){let t=u[o++],n=i.getAttribute(e).split(p),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Re:r[1]===`?`?ze:r[1]===`@`?Be:Le}),i.removeAttribute(e)}else e.startsWith(p)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(Oe.test(i.tagName)){let e=i.textContent.split(p),t=e.length-1;if(t>0){i.textContent=pe?pe.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],ve()),y.nextNode(),c.push({type:2,index:++a});i.append(e[t],ve())}}}else if(i.nodeType===8)if(i.data===ge)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(p,e+1))!==-1;)c.push({type:7,index:a}),e+=p.length-1}a++}}static createElement(e,t){let n=m.createElement(`template`);return n.innerHTML=e,n}};function b(e,t,n=e,r){if(t===_)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=ye(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=b(e,i._$AS(e,t.values),i,r)),t}var Fe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??m).importNode(t,!0);y.currentNode=r;let i=y.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Ie(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ve(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=y.nextNode(),a++)}return y.currentNode=m,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Ie=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=v,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=b(this,e,t),ye(e)?e===v||e==null||e===``?(this._$AH!==v&&this._$AR(),this._$AH=v):e!==this._$AH&&e!==_&&this._(e):e._$litType$===void 0?e.nodeType===void 0?xe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==v&&ye(this._$AH)?this._$AA.nextSibling.data=e:this.T(m.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Pe.createElement(Me(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Fe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=je.get(e.strings);return t===void 0&&je.set(e.strings,t=new Pe(e)),t}k(t){be(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(ve()),this.O(ve()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=fe(e).nextSibling;fe(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Le=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=v,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=v}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=b(this,e,t,0),a=!ye(e)||e!==this._$AH&&e!==_,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=b(this,r[n+o],t,o),s===_&&(s=this._$AH[o]),a||=!ye(s)||s!==this._$AH[o],s===v?e=v:e!==v&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===v?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Re=class extends Le{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===v?void 0:e}},ze=class extends Le{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==v)}},Be=class extends Le{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=b(this,e,t,0)??v)===_)return;let n=this._$AH,r=e===v&&n!==v||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==v&&(n===v||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ve=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){b(this,e)}},He=de.litHtmlPolyfillSupport;He?.(Pe,Ie),(de.litHtmlVersions??=[]).push(`3.3.3`);var Ue=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Ie(t.insertBefore(ve(),e),e,void 0,n??{})}return i._$AI(e),i},We=globalThis,x=class extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ue(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};x._$litElement$=!0,x.finalized=!0,We.litElementHydrateSupport?.({LitElement:x});var Ge=We.litElementPolyfillSupport;Ge?.({LitElement:x}),(We.litElementVersions??=[]).push(`4.2.2`);var Ke={attribute:!0,type:String,converter:ce,reflect:!1,hasChanged:le},qe=(e=Ke,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function S(e){return(t,n)=>typeof n==`object`?qe(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function C(e){return S({...e,state:!0,attribute:!1})}var Je=new Map;function Ye(e){Je.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Je.set(e.type,e)}function Xe(){return Array.from(Je.values())}var Ze={width:`auto`};function Qe(e){return Object.entries(e).map(([e,t])=>`${e.replace(/[A-Z]/g,e=>`-`+e.toLowerCase())}:${t}`).join(`;`)}var $e={spalten:24,spaltePx:40,zeilePx:12,gapPx:8},et={rasterX:0,rasterY:0,rasterW:$e.spalten,rasterH:1};function tt(){return{display:`grid`,gridTemplateColumns:`repeat(${$e.spalten}, 1fr)`,gridAutoRows:`${$e.zeilePx}px`,gap:`${$e.gapPx}px`,alignContent:`start`}}function nt(){return Qe(tt())}function rt(e){return`${e.toLowerCase()}field`}function it(e){let t=e.split(`::`);if(t.length!==2)return{quelleId:``,code:e};let[n,r]=t;return n===``||r===``?{quelleId:``,code:e}:{quelleId:n,code:r}}function at(e){return e.keyPairs.filter(e=>e.fromField.trim()!==``&&e.toField.trim()!==``)}var ot=`weitereQuellen`,st={[ot]:[]};function ct(e){return e.quelleId!==``}function lt(e,t){let n=e.vonQuelleId??``;return n===``?t:n}function ut(e,t,n,r){let i=e.trim(),a=t.trim(),o=a===``||a===n?void 0:r.find(e=>e.quelleId===a&&ct(e)),s=o?.quelleId??``;if(i===``)return{art:`frei`,quelleId:``,code:``,suchQuelleId:s};let{quelleId:c,code:l}=it(i);if(c!==``&&c!==n)return{art:`auswahl`,quelleId:c,code:l,suchQuelleId:s};if(o&&lt(o,n)===n){for(let e of at(o))if(e.fromField===l)return{art:`auswahl`,quelleId:s,code:e.toField,suchQuelleId:s}}return{art:`eigen`,quelleId:``,code:l,suchQuelleId:s}}var dt=`folgtAuswahl`,ft={[dt]:[]};function pt(e,t){let n=e.textContent??``,r=Array.from(e.childNodes),i=r.map(e=>e.textContent??``);e.setAttribute(`contenteditable`,`plaintext-only`),e.focus();let a=window.getSelection(),o=document.createRange();o.selectNodeContents(e),a?.removeAllRanges(),a?.addRange(o);let s=()=>{e.replaceChildren(...r),r.forEach((e,t)=>{e.textContent!==i[t]&&(e.textContent=i[t])})},c=!1,l=r=>{c||(c=!0,e.removeAttribute(`contenteditable`),e.removeEventListener(`blur`,u),e.removeEventListener(`keydown`,d),r&&t((e.textContent??``).trim(),n)||s())},u=()=>l(!0),d=t=>{t.key===`Enter`?(t.preventDefault(),e.blur()):t.key===`Escape`&&(t.preventDefault(),l(!1))};e.addEventListener(`blur`,u),e.addEventListener(`keydown`,d)}function w(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var T=class extends x{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
    :host { display: block; }
    :host([hidden]) { display: none; }

    :host([fuellt]) { height: 100%; box-sizing: border-box; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
    :host([data-ff-editor]) [data-ff-bound] {
      text-decoration: underline dotted var(--se-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
    :host([data-ff-editor][data-editable]) [data-ff-bound] { cursor: pointer; }
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;n&&(n.hasAttribute(`data-ff-bound`)||(e.stopPropagation(),e.preventDefault(),pt(n,(e,n)=>(e!==n&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0})),!0))))}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ye({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ze,...et,...e.acceptsDataSource?st:null,...e.ohneDaten?null:ft,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,satzWahl:e.satzWahl,ohneDaten:e.ohneDaten,kannErfassen:e.kannErfassen,bindableSpots:e.bindableSpots,actionValueSpots:e.actionValueSpots,listenBindung:e.listenBindung,blockEvents:e.blockEvents,pageBlock:e.pageBlock,flaechenSeite:e.flaechenSeite,maskenRand:e.maskenRand,raster:e.raster})}};w([S({type:Boolean,reflect:!0,attribute:`data-editable`})],T.prototype,`editable`,void 0);var mt=`root`,ht=class extends T{static{this.blockType=`ansicht`}static{this.tagName=`ff-ansicht`}static{this.displayName=`Ansicht`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[mt]}static{this.pageBlock=!0}static{this.flaechenSeite=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Ansicht`}}static{this.styles=[T.styles,o`

      :host { display: contents; }
    `]}render(){return g`<slot></slot>`}};T.defineAndRegister(ht);var gt=class extends T{constructor(...e){super(...e),this.quelle=``}static{this.blockType=`bild`}static{this.tagName=`ff-bild`}static{this.displayName=`Bild`}static{this.category=`anzeige`}static{this.defaultProps={quelle:``}}static{this.raster={startW:6,startH:6,minW:1,minH:1}}static{this.customProperties=[{attributeName:`quelle`,name:`Bild`,description:`Die Bilddatei wird in die Maske eingebettet — die Maske bleibt EINE Datei. Grosse Bilder werden dabei still verkleinert.`,kind:`bild`}]}static{this.styles=[T.styles,o`
      :host { display: block; }

      .flaeche {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .platzhalter { display: none; }
      :host([data-ff-editor]) .platzhalter {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        min-height: 48px;
        box-sizing: border-box;
        padding: var(--se-gap-sm);
        border: var(--se-border) dashed var(--se-line);
        border-radius: var(--se-r-md);
        color: var(--se-faint);
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        text-align: center;
      }
    `]}render(){return g`<div class="flaeche">
      ${this.quelle===``?g`<div class="platzhalter">Bild</div>`:g`<img src=${this.quelle} alt="">`}
    </div>`}};w([S()],gt.prototype,`quelle`,void 0),T.defineAndRegister(gt);var _t=`data-ff-block-id`,vt=[`fixed`,`context`,`data_field`,`block_value`,`gewaehlte_zeile`,`previous_result`,`step_result`,`se_variable`],yt=[`erfassungszelle`],bt=[...vt,...yt,`aus`];function xt(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function St(e){return!xt(e)||typeof e.source!=`string`||!bt.includes(e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`||e.blockId!==void 0&&typeof e.blockId!=`string`||e.ergebnisFeld!==void 0&&typeof e.ergebnisFeld!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{},...typeof e.blockId==`string`?{blockId:e.blockId}:{},...e.source===`step_result`&&typeof e.ergebnisFeld==`string`?{ergebnisFeld:e.ergebnisFeld}:{}}}function Ct(e){if(!xt(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!xt(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=St(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=St(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function wt(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!xt(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=Ct(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}Object.values({idb:{id:`idb`,name:`IDB-Tabelle`,tabellenId:``,felderEinzeln:!1,kennungLabel:`Kennung`,kennungBeispiel:`ID0001`,kopfsatzMoeglich:!1,kopfsatzStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},adressstamm:{id:`adressstamm`,name:`Adressstamm`,tabellenId:`ADR`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!1,kopfsatzStandard:``,relationLadenMoeglich:!1,varMoeglich:!0,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},artikelstamm:{id:`artikelstamm`,name:`Artikelstamm`,tabellenId:`ART`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!1,kopfsatzStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},beleg:{id:`beleg`,name:`Beleg`,tabellenId:`BEL`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!1,kopfsatzStandard:``,relationLadenMoeglich:!1,varMoeglich:!0,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[{code:`0_11`,label:`Satzschlüssel`},{code:`2_1`,label:`Belegart`},{code:`3_8`,label:`Belegnummer`},{code:`11_8`,label:`Kundennummer`},{code:`19_10`,label:`Belegdatum`},{code:`393_12`,label:`Warenwert`},{code:`441_12`,label:`MwSt-Betrag`},{code:`453_12`,label:`Gesamtbetrag`},{code:`3440_60`,label:`Name`}]},belegposition:{id:`belegposition`,name:`Belegpositionen`,tabellenId:`POS`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!0,kopfsatzStandard:`BEL_0_11`,relationLadenMoeglich:!0,varMoeglich:!0,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[{code:`2_1`,label:`Belegart`},{code:`3_8`,label:`Belegnummer`},{code:`11_6`,label:`Positionsnummer`},{code:`17_1`,label:`Zeilenart`},{code:`18_25`,label:`Artikelnummer`},{code:`45_60`,label:`Bezeichnung`},{code:`164_8`,label:`Menge`},{code:`246_9`,label:`Einzelpreis`},{code:`280_12`,label:`Gesamtpreis`},{code:`372_5`,label:`MwSt-Satz`},{code:`645_10`,label:`Satznummer`},{code:`689_5`,label:`Mengeneinheit`},{code:`1401_12`,label:`Rohertrag`},{code:`2558_1`,label:`Farbkennzeichen`},{code:`3164_12`,label:`Rabatt`}]},datei:{id:`datei`,name:`Andere Datei`,tabellenId:``,felderEinzeln:!0,kennungLabel:`Kennung`,kennungBeispiel:`SERPOS`,kopfsatzMoeglich:!0,kopfsatzStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},erpabfrage:{id:`erpabfrage`,name:`ERP-Abfrage`,tabellenId:``,felderEinzeln:!0,kennungLabel:`Kennung`,kennungBeispiel:`LIEFERADRESSE.GET`,kopfsatzMoeglich:!1,kopfsatzStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`erpapicall`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!0,standardFelder:[]},dataset:{id:`dataset`,name:`DataSet`,tabellenId:``,felderEinzeln:!0,kennungLabel:`DataSet-ID`,kennungBeispiel:`ID0001`,kopfsatzMoeglich:!1,kopfsatzStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`dataset`,spaltenNamen:!0,idbKurzform:!1,feldVorsatzMoeglich:!1,standardFelder:[]}}).map(e=>e.id);var E=/^\d+_\d+$/,Tt=/^\d+$/;function Et(e){if(!e||typeof e!=`object`)return null;let t=e,n=e=>typeof e==`string`?e.trim():``,r=n(t.nr),i=n(t.geberQuelleId),a=n(t.belegartFeld),o=n(t.belegnummerFeld),s=n(t.jahrFeld),c=n(t.archivFeld),l=Array.isArray(t.endeFelder)?t.endeFelder.filter(e=>typeof e==`string`&&E.test(e)):[];return!Tt.test(r)||i===``||!E.test(a)||!E.test(o)||s!==``&&!E.test(s)||c!==``&&!E.test(c)||l.length===0?null:{nr:r,geberQuelleId:i,belegartFeld:a,belegnummerFeld:o,jahrFeld:s,archivFeld:c,endeFelder:l}}var Dt=new Map;function Ot(e,t){e!==``&&Dt.set(e,t)}function kt(e){return Dt.get(e)}function D(e){return typeof e==`object`&&!!e}function O(e,t){if(!(!Array.isArray(e)||t===``))for(let n of e){if(!D(n)||n.id!==t||typeof n.name!=`string`||typeof n.tableId!=`string`)continue;let e,r=Et(n.ladeRelation);if(r&&D(n.ladeRelation)){let t=n.ladeRelation.zusatzFelder,i=Array.isArray(t)?t.filter(e=>typeof e==`string`&&E.test(e)):[];e={...r,zusatzFelder:i}}return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``,...e?{ladeRelation:e}:{}}}}function At(e){return e==null?``:String(e).trim()}function k(e,t){if(!D(e)||t===``)return``;let n=t.trim(),r=At(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=At(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw,o=a==null?``:String(a);if(o===``)return``;let s=Number(i[1]),c=Number(i[2]);return c<=0?``:o.substring(s,s+c).trim()}function jt(e,t){return e.indexField===``?``:k(t,e.indexField)}function Mt(e,t,n){if(!D(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function Nt(e){if(!D(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function A(e,t){return At(e).toLowerCase()===t.trim().toLowerCase()}function Pt(e,t,n){if(!D(e)||!D(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(D(e)&&(A(e.ALIAS,t)||A(e.alias,t))){let t=Nt(e);if(t.length>0)return t}}else if(D(i))for(let e of Object.keys(i)){let n=i[e];if(A(e,t)||D(n)&&(A(n.ALIAS,t)||A(n.alias,t))){let e=Nt(n);if(e.length>0)return e}}for(let e of[`ErpApiCall`,`ERPAPICALL`,`erpapicall`]){let n=r[e];if(D(n))for(let e of Object.keys(n)){if(!A(e,t))continue;let r=Nt(n[e]);if(r.length>0)return r}}let a=r.Tabellen;if(D(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=Nt(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(A(e,t)){let t=Nt(a[e]);if(t.length>0)return t}}return kt(t)??[]}function Ft(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!D(t)||!D(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function It(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!D(t)||!D(t.MSG)))return t.MSG.DATA}function Lt(e,t,n,r){let i=e.getAttribute(t)??``;if(i===``)return[];try{let e=JSON.parse(i);if(!Array.isArray(e))return[];let t=[];for(let i of e){if(!i||typeof i!=`object`)continue;let e=i,a=e[n];if(typeof a!=`string`||a===``)continue;let o=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||o.push({fromField:e.fromField,toField:e.toField})}if(o.length===0)continue;let s=r===void 0?``:e[r];t.push({id:a,...typeof s==`string`&&s.trim()!==``&&s!==a?{von:s.trim()}:{},keyPairs:o})}return t}catch{return[]}}function Rt(e){if(e==null)return``;try{return JSON.stringify(e)??``}catch{return``}}var j=new Map,zt=new Set,Bt=new Set,Vt=0,Ht=!1,Ut=!1;function Wt(){if(Ht){Ut=!0;return}Ht=!0;try{do Ut=!1,zt.forEach(e=>e());while(Ut)}finally{Ht=!1}}function Gt(e){zt.add(e)}function Kt(e){return j.get(e)?.zeile}function qt(e){return j.get(e)?.merkmal??``}function Jt(e){return j.get(e)?.nummer??0}function M(e){return e.getAttribute(`data-ff-id`)??``}function Yt(e,t,n){if(e===``)return[];let r=qt(e);if(r===``)return[];let i=[];return t.forEach((e,t)=>{Rt(n(e))===r&&i.push(t)}),i.length===0&&Qt(e),i}function Xt(e,t){if(e===``)return;let n=Rt(t);if(n===``)return;let r=j.get(e);r&&r.merkmal===n?j.delete(e):j.set(e,{zeile:t,merkmal:n,nummer:++Vt}),Wt()}function Zt(e,t){if(e===``)return;let n=Rt(t);n!==``&&j.get(e)?.merkmal!==n&&(j.set(e,{zeile:t,merkmal:n,nummer:++Vt}),Wt())}function Qt(e){j.has(e)&&(j.delete(e),Wt())}function $t(e){Bt.add(e)}var en=dt.toLowerCase();function tn(e){return Lt(e,en,`geberId`).map(e=>({geberId:e.id,keyPairs:e.keyPairs}))}function nn(e,t){let n=t,r=!1;for(let t of tn(e)){let e=Kt(t.geberId);e!==void 0&&(r=!0,n=n.filter(n=>t.keyPairs.every(t=>{let r=k(e,t.fromField);return r!==``&&r===k(n,t.toField)})))}return{rows:n,gefiltert:r}}function rn(e,t){if(tn(e).length===0)return t[0];let{rows:n,gefiltert:r}=nn(e,t);return r?n[0]:void 0}var an=8e3,N=null,on=null;function sn(){let e=document.createElement(`div`);return e.setAttribute(`data-ff-meldung`,``),e.setAttribute(`role`,`alert`),e.style.cssText=[`position:fixed`,`top:0`,`left:0`,`right:0`,`z-index:2147483647`,`padding:7px 12px`,`background:var(--se-red-soft,#fbe7e6)`,`color:var(--se-red,#c0201a)`,`border-bottom:1px solid var(--se-red,#c0201a)`,`font:500 12px/1.4 system-ui,sans-serif`,`cursor:pointer`].join(`;`),e.title=`Klicken zum Schließen`,e.addEventListener(`click`,cn),e}function cn(){on&&=(clearTimeout(on),null),N?.remove(),N=null}function P(e){typeof document>`u`||!document.body||(N||(N=sn(),document.body.appendChild(N)),N.textContent=e,on&&clearTimeout(on),on=setTimeout(cn,an))}function F(){return globalThis}function ln(){let e=F();return D(e.SEDATA)&&D(e.SEDATA.Daten)}function un(){let e=F();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function dn(){let e=F();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var fn=new Set,pn=new Set;function mn(e){fn.add(e)}function hn(e){return pn.add(e),()=>{pn.delete(e)}}function I(){fn.forEach(e=>e())}function gn(){I()}function _n(e){pn.forEach(t=>{try{t(e)}catch{}})}function vn(e){let t=Ft(e);if(!t){_n(e);return}let n=F();D(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,dn(),I()}function yn(e=0){let t=F();if(typeof t.basisHTML_REGISTER==`function`){try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{vn(e)},document.title,`1.0`)}catch(e){P(`SoftEngine-Anmeldung fehlgeschlagen: `+(e instanceof Error?e.message:String(e)))}return}e<400?setTimeout(()=>{yn(e+1)},25):P(`SoftEngine-Anschluss nicht gefunden — die Maske bleibt ohne Daten.`)}var bn=!1;function xn(){if(bn)return;bn=!0,un();let e=F();e.Erstellen=()=>{dn(),I()},e.initData=e.Erstellen,e.ReloadData=()=>{I()},yn(),window.addEventListener(`message`,e=>{if(typeof F().basisHTML_REGISTER==`function`)return;let t=It(e.data);t!==void 0&&vn(t)},!0);let t=0,n=setInterval(()=>{t+=1,ln()?(clearInterval(n),dn(),I()):t>100&&(clearInterval(n),P(`Keine Daten von SoftEngine empfangen — die Maske zeigt nichts an.`))},300)}var Sn=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Cn(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function wn(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}function Tn(e){return e instanceof Error?e.message:String(e)}function En(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!D(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Sn.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var Dn=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function On(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function kn(e){if(typeof e==`string`){let t=e.trim();return t===``?void 0:t}if(typeof e==`number`||typeof e==`boolean`)return String(e)}function An(e,t){if(t>12)return;let n=kn(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=An(n,t+1);if(e!==void 0)return e}return}if(D(e)){for(let n of Dn){if(!(n in e))continue;let r=An(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=An(n,t+1);if(e!==void 0)return e}}}function jn(e){let t=On(e);if(D(t)){for(let e of Dn){if(!(e in t))continue;let n=An(t[e],0);if(n!==void 0)return n}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=jn(t);if(e!==void 0)return e}else if(D(e)){let t=jn(e);if(t!==void 0)return t}}}var Mn=[`RESULT`,`result`];function Nn(e,t=0){if(t>12)return;let n=typeof e==`string`?On(e):e;if(Array.isArray(n)){for(let e of n){let n=Nn(e,t+1);if(n!==void 0)return n}return}if(D(n)){for(let e of Mn){let t=n[e];if(typeof t==`string`)return t;if(typeof t==`number`||typeof t==`boolean`)return String(t)}for(let e of Object.values(n)){let n=Nn(e,t+1);if(n!==void 0)return n}}}function Pn(e,t,n=0){if(t.trim()===``||n>12)return``;let r=typeof e==`string`?On(e):e;if(Array.isArray(r)){for(let e of r){let r=Pn(e,t,n+1);if(r!==``)return r}return``}if(!D(r))return``;let i=k(r,t);if(i!==``)return i;for(let e of Object.values(r)){let r=Pn(e,t,n+1);if(r!==``)return r}return``}function Fn(e){return D(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function In(e,t,n=!1){if(!D(e))return;let r=Fn(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of r){let r=n?Nn(e[t]):jn(e[t]);if(r!==void 0)return{wert:r,roh:e[t]}}}var Ln=[],Rn=!1,zn=6e3,Bn=100;function Vn(){if(Rn||Ln.length===0)return;Rn=!0;let e=Ln.shift(),t=F(),n=new Set(Fn(t.SEDATA)),r=!1,i=(t,n)=>{r||(r=!0,o(),clearInterval(s),clearTimeout(c),Rn=!1,e.resolve({wert:t,roh:n}),queueMicrotask(Vn))},a=e.optionen.satzAntwort===!0,o=hn(e=>{let t=a?Nn(e):jn(e);t!==void 0&&i(t,e)}),s=setInterval(()=>{let e=In(F().SEDATA,n,a);e!==void 0&&i(e.wert,e.roh)},Bn),c=setTimeout(()=>{e.optionen.still||P(`Daten laden: SoftEngine hat nicht geantwortet (Relation Nr. ${e.template.nr}).`),i(``,void 0)},zn);if(typeof t.basisHTML_SND_MSG!=`function`){e.optionen.still||P(`Daten laden nicht möglich: keine Verbindung zu SoftEngine.`),i(``,void 0);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch(t){e.optionen.still||P(`Daten laden fehlgeschlagen (Relation Nr. ${e.template.nr}): ${Tn(t)}`),i(``,void 0)}}function Hn(e,t,n={}){xn();let r=F();if(e.verb!==`GET_RELATION`){if(typeof r.basisHTML_SND_MSG!=`function`)return P(`Speichern nicht möglich: keine Verbindung zu SoftEngine. Die Eingabe wurde NICHT übernommen.`),Promise.resolve({wert:``,roh:void 0});try{r.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch(t){P(`Speichern fehlgeschlagen (Relation Nr. ${e.nr}): ${Tn(t)}`)}return Promise.resolve({wert:``,roh:void 0})}return new Promise(r=>{Ln.push({template:e,params:[...t],resolve:r,optionen:n}),Vn()})}function Un(e,t){if(!D(t))return``;let n=t.document;if(!n||typeof n.querySelectorAll!=`function`)return``;let r=Array.from(n.querySelectorAll(`[${_t}]`)).find(t=>t.getAttribute(_t)===e.blockId);if(!r)return``;let i=r[e.value];return i==null?``:String(i)}function Wn(e,t,n=F()){if(e.source===`aus`)return``;if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);if(!Number.isInteger(n)||n<0)return``;let r=e.ergebnisFeld??``;return r===``?t.stepResults?.[n]??``:Pn(t.stepRohErgebnisse?.[n],r)}if(e.source===`block_value`)return Un(e,n);if(e.source===`gewaehlte_zeile`){let n=t.gewaehlteZeile?.(e.blockId??``);return n===void 0?``:k(n,e.value)}if(e.source===`data_field`){let n=t.zeileDerQuelle?.(e.dataSourceId??``);if(n!==void 0)return k(n,e.value)}if(!D(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!D(t)||!D(t.Daten)||!D(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=O(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=Pt(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>k(e,r.indexField)===a):i[0];return o?k(o,e.value):``}var Gn=999,Kn=`0`,qn=`255`,Jn=new Map;function Yn(e){let t=kt(e);Ot(e,[]),t!==void 0&&t.length>0&&gn()}async function Xn(e,t,n,r,i){return(await Hn({id:`relation-lader`,verb:`GET_RELATION`,nr:e.nr,params:[]},[t.belegart,r,i,t.belegnummer,t.jahr,t.archiv,``,String(n),``,``,``,``],{still:!0,satzAntwort:!0})).wert}function Zn(e,t,n){let r=(Jn.get(e.id)??0)+1;if(Jn.set(e.id,r),n===void 0){Yn(e.name);return}let i={belegart:k(n,t.belegartFeld),belegnummer:k(n,t.belegnummerFeld),jahr:t.jahrFeld===``?``:k(n,t.jahrFeld),archiv:t.archivFeld===``?``:k(n,t.archivFeld)};if(i.belegart===``||i.belegnummer===``){Yn(e.name);return}Yn(e.name),(async()=>{let n=[],a=!1;for(let o=1;o<=Gn;o+=1){let s=await Xn(t,i,o,Kn,qn);if(Jn.get(e.id)!==r)return;if(t.endeFelder.every(e=>k({SATZ:s},e)===``)){a=!0;break}let c={SATZ:s};for(let n of t.zusatzFelder){let a=n.indexOf(`_`),s=await Xn(t,i,o,n.slice(0,a),n.slice(a+1));if(Jn.get(e.id)!==r)return;c[n]=s}n.push(c)}a||P(`Positionen laden: nach ${Gn} Zeilen ohne Ende-Kennung abgebrochen (Relation Nr. ${t.nr}) — die Liste ist wahrscheinlich unvollständig, vermutlich passen Relationsnummer oder Ende-Felder nicht.`),Jn.get(e.id)===r&&(Ot(e.name,n),gn())})()}var Qn=new Map,$n=!1;function er(){let e=new Map;for(let t of Xe())t.satzWahl&&e.set(t.tagName.toLowerCase(),(t.satzWahl.quelleProp??`source`).toLowerCase());return e}function tr(e,t,n=typeof document>`u`?void 0:document){if(e===``||n===void 0||typeof n.querySelectorAll!=`function`)return;let r=null;for(let i of Array.from(n.querySelectorAll(`[data-ff-id]`))){let n=t.get(i.tagName.toLowerCase());if(n===void 0||i.getAttribute(n)!==e)continue;let a=i.getAttribute(`data-ff-id`)??``,o=Kt(a);if(o===void 0)continue;let s=Jt(a);(r===null||s>r.nummer)&&(r={zeile:o,nummer:s})}return r?.zeile}function nr(){let e=F().FF_DATA_SOURCES;if(!Array.isArray(e))return;let t=er();for(let n of e){if(!D(n)||typeof n.id!=`string`)continue;let r=O(e,n.id);if(!r?.ladeRelation)continue;let i=tr(r.ladeRelation.geberQuelleId,t),a=Rt(i);Qn.get(r.id)!==a&&(Qn.set(r.id,a),Zn(r,r.ladeRelation,i))}}function rr(){$n||($n=!0,Gt(nr),$t(()=>Qn.clear()))}var ir=`ff-dialog-rahmen`,ar=`ff-dialog-schliessen`,or=`ff-dialog-groesse`;function sr(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var L=class extends x{constructor(...e){super(...e),this.titel=`Dialog`,this.breite=520,this.hoehe=380,this.viewport=!1,this.escapeSchliesst=!1,this.ohneModal=!1,this.inhaltFest=!1,this.ziehbar=!1,this.escapeRegistriert=!1,this.aufTaste=e=>{e.key===`Escape`&&(e.stopPropagation(),this.schliesse())}}static{this.styles=o`
    :host {
      position: absolute;
      inset: 0;
      display: block;
      font-family: var(--se-font);
      font-size: var(--se-fs);
      color: var(--se-ink);
    }

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
    .inhalt {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }

    :host([inhalt-fest]) .inhalt { overflow: hidden; }

    .anfasser {
      position: absolute;
      border-radius: 4px;
      background: var(--se-accent);
      touch-action: none;
      z-index: 2;
    }
    .anfasser.breit {
      top: 50%;
      right: -3px;
      width: 7px;
      height: 26px;
      transform: translateY(-50%);
      cursor: ew-resize;
    }
    .anfasser.hoch {
      left: 50%;
      bottom: -3px;
      width: 26px;
      height: 7px;
      transform: translateX(-50%);
      cursor: ns-resize;
    }
  `}aktualisiereEscape(){let e=this.isConnected&&this.escapeSchliesst;e!==this.escapeRegistriert&&(e?document.addEventListener(`keydown`,this.aufTaste,!0):document.removeEventListener(`keydown`,this.aufTaste,!0),this.escapeRegistriert=e)}ziehe(e,t){if(!this.ziehbar)return;e.preventDefault(),e.stopPropagation();let n=t===`breite`?sr(this.breite,520):sr(this.hoehe,380),r=t===`breite`?240:160,i=t===`breite`?e.clientX:e.clientY,a=Math.max(r,Math.round(n)),o=!1,s=(e,n)=>{this.dispatchEvent(new CustomEvent(or,{detail:{achse:t,wert:e,geste:n},bubbles:!0,composed:!0}))},c=e=>{let c=t===`breite`?e.clientX:e.clientY,l=Math.max(r,Math.round(n+(c-i)*2));l!==a&&(a=l,s(l,o?`laeuft`:`beginn`),o=!0)},l=()=>{window.removeEventListener(`pointermove`,c),window.removeEventListener(`pointerup`,l),window.removeEventListener(`pointercancel`,l),window.removeEventListener(`blur`,l),o&&s(a,`ende`)};window.addEventListener(`pointermove`,c),window.addEventListener(`pointerup`,l),window.addEventListener(`pointercancel`,l),window.addEventListener(`blur`,l)}aufStandard(e,t){this.ziehbar&&(e.stopPropagation(),this.dispatchEvent(new CustomEvent(or,{detail:{achse:t,wert:0,geste:`standard`},bubbles:!0,composed:!0})))}schliesse(){this.dispatchEvent(new CustomEvent(ar,{bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),this.aktualisiereEscape()}updated(e){e.has(`escapeSchliesst`)&&this.aktualisiereEscape()}disconnectedCallback(){this.escapeRegistriert&&=(document.removeEventListener(`keydown`,this.aufTaste,!0),!1),super.disconnectedCallback()}render(){let e=sr(this.breite,520),t=sr(this.hoehe,380);return g`
      <div class="abdunklung"></div>
      <div class="buehne">
        <section
          class="fenster"
          role="dialog"
          aria-modal=${this.ohneModal?v:`true`}
          aria-labelledby="dialog-titel"
          style="width:${e}px;height:${t}px"
        >
          <header class="kopf">
            <div class="titel" id="dialog-titel"><slot name="titel">${this.titel}</slot></div>
            <button
              class="schliessen"
              type="button"
              aria-label="Schließen"
              title="Schließen"
              @click=${this.schliesse}
            >✕</button>
          </header>
          <div class="inhalt"><slot></slot></div>
          ${this.ziehbar?g`
            <div
              class="anfasser breit"
              title="Breite ziehen · Doppelklick: Standard"
              @pointerdown=${e=>this.ziehe(e,`breite`)}
              @dblclick=${e=>this.aufStandard(e,`breite`)}
            ></div>
            <div
              class="anfasser hoch"
              title="Höhe ziehen · Doppelklick: Standard"
              @pointerdown=${e=>this.ziehe(e,`hoehe`)}
              @dblclick=${e=>this.aufStandard(e,`hoehe`)}
            ></div>
          `:v}
        </section>
      </div>
    `}};w([S()],L.prototype,`titel`,void 0),w([S({type:Number})],L.prototype,`breite`,void 0),w([S({type:Number})],L.prototype,`hoehe`,void 0),w([S({type:Boolean,reflect:!0})],L.prototype,`viewport`,void 0),w([S({type:Boolean,attribute:`escape-schliesst`})],L.prototype,`escapeSchliesst`,void 0),w([S({type:Boolean,attribute:`ohne-modal`})],L.prototype,`ohneModal`,void 0),w([S({type:Boolean,reflect:!0,attribute:`inhalt-fest`})],L.prototype,`inhaltFest`,void 0),w([S({type:Boolean,reflect:!0})],L.prototype,`ziehbar`,void 0),customElements.get(`ff-dialog-rahmen`)||customElements.define(ir,L);var cr=`input,select,textarea,button,a[href],[tabindex]:not([tabindex="-1"])`;function lr(e){for(let t of Array.from(e.querySelectorAll(`*`))){if(t instanceof HTMLElement&&t.matches(cr)&&!t.hasAttribute(`disabled`))return t;let e=t.shadowRoot?lr(t.shadowRoot):null;if(e)return e}return null}var R=class extends T{constructor(...e){super(...e),this.name=`Popup`,this.breite=520,this.hoehe=380,this.offen=!1}static{this.blockType=`popup`}static{this.tagName=`ff-popup`}static{this.displayName=`Popup`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[mt]}static{this.pageBlock=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Popup`,breite:520,hoehe:380}}static{this.styles=[T.styles,o`

      :host { display: none; }
      :host([offen]),
      :host([data-ff-editor]) {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 10;
        font-family: var(--se-font);
      }

      .titel {
        display: block;
        min-height: 1.4em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .rumpf {
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
        padding: 12px;
        ${a(nt())};
      }

      .rumpf slot { display: contents; }
    `]}onClose(){this.hasAttribute(`data-ff-editor`)||this.removeAttribute(`offen`)}updated(e){super.updated(e),!(!e.has(`offen`)||!this.offen)&&(this.hasAttribute(`data-ff-editor`)||this.updateComplete.then(()=>{!this.offen||!this.isConnected||(lr(this)??(this.shadowRoot?lr(this.shadowRoot):null))?.focus()}))}render(){return g`<ff-dialog-rahmen
        .breite=${this.breite}
        .hoehe=${this.hoehe}
        ohne-modal
        inhalt-fest
        @ff-dialog-schliessen=${this.onClose}
      >
        <span
          slot="titel"
          class="titel"
          data-ff-editable
          @dblclick=${e=>this.inlineEdit(e,`name`)}
        >${this.name}</span>
        <div class="rumpf"><slot></slot></div>
      </ff-dialog-rahmen>`}};w([S()],R.prototype,`name`,void 0),w([S()],R.prototype,`breite`,void 0),w([S()],R.prototype,`hoehe`,void 0),w([S({type:Boolean,reflect:!0})],R.prototype,`offen`,void 0),T.defineAndRegister(R);function ur(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function dr(e,t){if(e.trim()===``)return;let n=F();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(ur(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function fr(e,t,n){if(t.trim()===``)return;let r=Array.from(e.querySelectorAll(R.tagName)),i=r.filter(e=>(e.getAttribute(`name`)??R.defaultProps.name)===t);if(i.length===0){P(`Fenster „`+t+`“ gibt es in dieser Maske nicht.`);return}if(i.length>1){P(`Fenster „`+t+`“ gibt es mehrfach — keines ist gemeint.`);return}let a=i[0];if(!n){a.removeAttribute(`offen`);return}for(let e of r)e!==a&&e.removeAttribute(`offen`);a.setAttribute(`offen`,``)}var pr=new WeakMap;function mr(e){P(`Aktionskette fehlgeschlagen: `+(e instanceof Error?e.message:String(e)))}function hr(e){let t=new Set;for(let n of e)if(n.type===`RELATION`)for(let e of[...n.params,...n.extraParams]){let n=e.dataSourceId??``;e.source===`data_field`&&n!==``&&t.add(n)}return t}function gr(e,t){return t.size===0?[]:Array.from(e.querySelectorAll(`[${_t}]`)).filter(e=>{let n=e.erfassteQuellen;return Array.isArray(n)&&n.some(e=>t.has(e))})}function _r(e){let t=er();return n=>{if(n===``)return;let r=e?.[n];return r===void 0?tr(n,t):r}}async function vr(e,t,n,r){let i={...n,NOW_DATE:Cn(new Date)},a=``,o=[],s=[],c=()=>{o.push(``),s.push(void 0)};for(let n of t){if(n.type===`START_TOOL`){dr(n.toolNr,wn({params:n.toolParams},i)),c();continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){fr(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),c();continue}let t=En(F().FF_RELATIONS,n.relationId);if(!t){c();continue}let l={context:i,previousResult:a,stepResults:o,stepRohErgebnisse:s,gewaehlteZeile:Kt,zeileDerQuelle:_r(r)},u=await Hn(t,[...n.params,...n.extraParams].map(e=>Wn(e,l))),d=u.wert;o.push(d),s.push(u.roh),t.verb===`GET_RELATION`&&(a=d),n.resultKey!==``&&(i[n.resultKey]=d)}}async function z(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=wt(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=pr.get(e);if(i||(i=new Set,pr.set(e,i)),!i.has(t)){i.add(t);try{let t=gr(e.ownerDocument??document,hr(r));if(t.length===0){await vr(e,r,n,void 0);return}if(t.length>1){P(`Die Kette liest erfasste Zeilen aus mehreren Tabellen — nur eine Tabelle je Kette.`);return}let i=t[0].erfassteSaetze??[];for(let t of i)await vr(e,r,n,t);i.length>0&&t[0].erfassungLeeren?.()}finally{i.delete(t)}}}var yr=new WeakSet;function br(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||yr.has(e))return;yr.add(e);let n=wt(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&xn(),e.addEventListener(`click`,()=>{z(e,t,{}).catch(mr)})}var xr=class extends T{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.raster={startW:4,startH:2,minW:2,minH:2}}static{this.customProperties=[]}static{this.styles=[T.styles,o`
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

        line-height: 1.2;

        transition: background-color var(--se-move), border-color var(--se-move);
      }
      button:hover { background: var(--se-accent-dark); border-color: var(--se-accent-dark); }

      button:active { background: var(--se-accent-dark); border-color: var(--se-ink); }
      button:focus-visible { outline: 2px solid var(--se-accent); outline-offset: 2px; }

      :host([fuellt]) button { width: 100%; height: 100%; }
    `]}render(){return g`<button
      data-ff-editable
      @dblclick=${e=>this.inlineEdit(e,`label`)}
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),br(this,`onClick`)}};w([S()],xr.prototype,`label`,void 0),T.defineAndRegister(xr);var Sr=[`info`,`success`,`warning`,`danger`];function Cr(e){return Sr.includes(e)?e:`info`}var wr=[{wert:`info`,name:`Hinweis`},{wert:`success`,name:`Erfolg`},{wert:`warning`,name:`Warnung`},{wert:`danger`,name:`Fehler`}];function Tr(e,t){return{attributeName:e,name:`Bedeutung`,description:t,kind:`select`,options:wr.map(e=>({value:e.wert,label:e.name}))}}var Er=o`

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px 5px 9px;
    border-radius: var(--se-r-sm);

    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%);
    font-family: var(--se-font);
    font-size: var(--se-fs-sm);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.02em;
    color: var(--se-ink);
    background: var(--se-panel-2);
    white-space: nowrap;
  }

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
`,Dr=Ae`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`;function Or(){return g`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${Dr}</svg>`}var kr={hund:`data:image/png;base64,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`,katze:`data:image/png;base64,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`,kaninchen:`data:image/png;base64,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`,hamster:`data:image/png;base64,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`,meerschweinchen:`data:image/png;base64,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`,vogel:`data:image/png;base64,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`,schildkroete:`data:image/png;base64,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`,fisch:`data:image/png;base64,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`,schlange:`data:image/png;base64,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`,pferd:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAABgFBMVEUAAADZiDz95rgyGw87IROMTSmUVitFJxalZC7526ZzRiX+9MbjkkNXNBvgjD4wGg7HezY+AAAtGA7ai0FVAAAmFAu2czThjkBkOR0WCwVrPCDvx5AqFw331JvkuISgXi7ks3rkqGnblU/97cF/AACXYi3/AADXx6RROCgiEgrOuJaWhW55ZlMlCQBsWUg/PwAcDgfeq3Xjy6YeEQgcEAlZRTaIc1vesX25qo1pQB7LmG2NeWOJbVWul3jKrYvpkT6+sJLTwZ9/fwB6UzqMTR3hol+4iGCsm4HGjWRVVQC0hVwfBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB96dqzAAAAgHRSTlMA/v78/v7+/v79/v7+/v7N/gSv/gNy/v7+LP7+kv7+/v3+/v4C/gH+/lj+/v7//gRD/v5JOP7+/v7+/v7+/v7+/v4C/v7+/v/+A/7/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKekk0AAAdeSURBVHjajVgJd9o6E7UsI8kyNg4uBmwgLKEQkqZplm6vffu3////882MZFkGkpM5OS3YnuuZO1ejQUGA9i64H3LOh9f48U0Gj12Ty31w5V8d8SiCv2hwH7zRrgcRufBR+27AwWsy4lzyWfvsRfPEu4sTnGEkOblEkYf0xCOeMsaEhOsDe9FEPJ1OvW/2BcEUwuFSgEsKrlMX0NDgsD7THtJ0NBxwtMFwNPWg3gVT8OYaHmcFIMmhCwmuqzEjKNEgPQ6RAGPwAUh1jxPOtk8OYwVfmkCvIUzG1vP52iFdXQOVkZSTqqomEumIhtMmqAZnXaMHJDcKLghoFnHdz+swDhEJs5sFI3ROe6JHpvEb1IcSQ34E4oBDncPzchZ8NBRJLrJiHsfhnFn+7oE3zExqgyR6WIchvhZuwHvhOXCI50W25XJAsb4PBpIrtsbL4QoeKOHtA5AJlnfScwZRgQfwYCuzDMEjXjMgyZQHgCJeEhCEymxyWF4PxQYlB0h0VMJTmAEBlQ3bPhDeAJNIZ9UQ1BpeR4Kwwv8IzwBJvs0KvLyoIbdMkdrECQ4h2cTYcrFAjyJzqVmykbv5p8WKFSWEk4rLMzgCk+YqI6Dlp3kYz1kmkLr3pvzSlr9GIKgaTy/PxQNIeI8CKhbLT3Xoyn/RCDJl+YqAvoAiuQScs6kJbRli68XyyzwOV3krSCP5EsoQziHxAviEvOBPnUECIE0RfVosF3EYF8T1tFnmQ8ptFc4XX2oIqFLihZCEA1oR0JIyMxTZ3KKcsTqsl4e9CUg1LAmnAlFpUXELtIR3ourKKHKZGSWB6kFji5/AkAKM43jgm5CVmDigZR3OCxSv5DYgFADqHtfzYv6ZMvPcm3+qXsUrAS1xaziq58vC9Iprv9cOTWfAlHlPtZTQvxiNnoAadQ/8cgJi6yJn/S0sx6G/X1yhurnOaemLlhTpECcaJARY/BtrrMB+ale+Z9hloM20QAIIqUSDUwE7MiWdWBtvueksRzbFJV8WDog6kCUKcNKIjOvCRYRrO3oKujvMBe1I0PcQyAQhccURToU4+PpmwRrrK+qlHztApACZs0KbMEQF0uIkIkwLtzxCZh1LceG/P0oN/SBxELYWwvYLCAhgMC1oK0paCbUmvE2tyewRIlC0u4B/RdsGhKarCe0hcC1XqiyOgErZLtgGCHaStLQMkif01VSC4d4meyU7Z/mkaSGejiKSETVs9BQ0VdDumPYUe8HEKUngJxoG5betyjXtsTLVKmcvmpLNNtuqCNZqk3meo2+pwEr2qimo2/2RinjaAGVWueP+ePw6DisnXbaJ64nPxCsIWeaxrbtsX+Hq1y6NDNpA0T8PM8ZF716Ti+iIbViyIm9yYhoGke1ZpH4J6kzzsQM6ZhvE44BASjA88HNIfZwLYOBreMQZr6NtLNqlBaLu+dd3zc9FhI1E/3v/re+V7ckDesSiNRHhDi//2nN1ElJWokz3P/bS1R/Kdu3Ypm1kYoEyajMoxtPcqHHQmmlyUxD+yAMCGX3zI6IeVuKwWXidlWW5vdVG1PPrb3b/Bgh2Bml6mEFZ98HWNqQUkSRNfgZINIOf06O+dFVLaZVhjfvLOg7J4nrZN3nztr9lCBS128hH3LN7l406smKbpgKeWtVhx+YruCgm1bZhKMsN0FUXqHTah1x+Y6s4PLF4xX6Dm07muSCgP30grVTmFm3BinoTnrN67a+X8lLg4P9nl2xlI86yMVuFL9rKqQqGRCz/MPhPW34JOhIN0Ks4YbhskYTS3apROxKWJMDZvAa0WULqGa08oY4a0hNoTF0qegvMGK3TLk7cRz+7MVGpcI/yloht2UqAAJBpV67kJ9//QUjJbs9vHGZcmOKDS9TZ2UxjA3zAGbOFSyy5hRdQJPGe82cHFC4YvlIh153GRiRBbgJ/tRUeHbuIf7gF/+Tmf5x/bYHCPtVeYWbdjQ0HW6EguX6H6WR3qw/4fXd3d/BwNivWzwHnZM82v0YV0pR1lZgkSed/C1RTYtDWTgYtDEkTkqM6Pl0jD+4ejAIooih67J4U0A8SmDhgMo4dP8/HOM+8yS8WmFiEsr4KTuca1JJ4sM8+RPyXpJMlTLwWKHkQRkP86fSIAke2FF7zq/VObjggJS1Zv3D+o7l3EFvs+/7hgb/bYucW//VUxPVXpBmZ/h2mijtXh3/S4uiOxm1MA5rSlGMUYvrA97c3YLd7+HjrcB7UZUqj8fvzBycD2Dfl399jT0bRB2vR3e/tEvn+t3/4cQ4Jpytdt0jJ7l+f77S++/xz5wlpoQln+sphDv3a3x9iX5DJZpN09Ii/oM6N6h2jgyR+ewiT880o2fzxg06aZq/jXAVP5oDp7tdNcoIFVw635sDq8SWeWxVgUDjLPt8cTOk3Nrck3N08m7Ob2RuP0GYGiu/vbr4edvjzfnf4ihIwh1iz6ZvP4YLRwGJRBJE9SYJzoGgwCt58okfPTRELPa3hJz6gYN4KY6kCux/NBuZ0jA/gfOzRu3Vi/wcxR5Rg3aDSCgAAAABJRU5ErkJggg==`},Ar=[[`welpe`,`hund`],[`hund`,`hund`],[`kater`,`katze`],[`katze`,`katze`],[`kaninchen`,`kaninchen`],[`hase`,`kaninchen`],[`meerschwein`,`meerschweinchen`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`vogel`],[`sittich`,`vogel`],[`papagei`,`vogel`],[`vogel`,`vogel`],[`schildkr`,`schildkroete`],[`schlange`,`schlange`],[`natter`,`schlange`],[`python`,`schlange`],[`echse`,`schlange`],[`gecko`,`schlange`],[`reptil`,`schlange`],[`fisch`,`fisch`],[`koi`,`fisch`],[`pferd`,`pferd`],[`pony`,`pferd`],[`fohlen`,`pferd`]];function jr(e){let t=e.toLowerCase();for(let[e,n]of Ar)if(t.includes(e))return n;return``}function Mr(e){let t=jr(e),n=t===``?void 0:kr[t];if(n!==void 0)return g`<img src=${n} alt="" aria-hidden="true" />`}function Nr(e){return Mr(e)??Or()}var Pr=o`

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

      :host { display: flow-root; }
      :host([hat-reiter]) { margin-top: 24px; }

      .card:hover { border-color: var(--se-faint); }

      .card.v-danger {
        border-color: var(--se-accent);
        background: var(--se-red-soft);
      }
      .card.v-danger:hover { border-color: var(--se-accent-dark); }

      :host([data-ff-auswahl]) .card {
        border-color: var(--se-accent);
        background: var(--se-accent-soft);
      }

      :host([data-ff-zieht]) .card {
        opacity: 0.45;
      }

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

      .kopf {
        display: flex;
        align-items: center;
        gap: var(--se-gap);
        min-width: 0;
      }

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

      .fuss .chip { flex: none; margin-left: auto; }

      :host([data-ff-editor]) [data-ff-spot]:empty::before {
        content: '—';
        color: var(--se-faint);
      }
      :host([data-ff-editor]) .avatar:empty {
        border: var(--se-border) dashed var(--se-faint);
        border-radius: var(--se-r-sm);
      }
      :host([data-ff-editor]) .avatar:empty::before {
        content: none;
      }
`,B=class extends T{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`,`kanban-zimmer`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[Tr(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[T.styles,Er,Pr]}stelle(e,t){return g`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}hatReiter(){return this.hasAttribute(`data-ff-editor`)||this.date.trim()!==``||this.time.trim()!==``}updated(e){super.updated(e),this.toggleAttribute(`hat-reiter`,this.hatReiter())}render(){let e=Cr(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=this.hatReiter(),i=n(this.avatar)||n(this.heading)||n(this.meta),a=n(this.heading2)||n(this.chipText);return g`<div class="card v-${e}${r?``:` ohne-reiter`}">
      ${r?g`<span class="reiter">
            ${n(this.date)?this.stelle(`date`,`datum`):v}
            ${n(this.time)?this.stelle(`time`,`zeit`):v}
          </span>`:v}
      ${i?g`<div class="kopf">
            ${n(this.avatar)?g`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?v:Nr(this.avatar)}</span>`:v}
            <div class="namen">
              ${n(this.heading)?this.stelle(`heading`,`name`):v}
              ${n(this.meta)?this.stelle(`meta`,`zusatz`):v}
            </div>
          </div>`:v}
      ${n(this.text)?this.stelle(`text`,`grund`):v}
      ${a?g`<div class="fuss">
            ${n(this.heading2)?this.stelle(`heading2`,`fussl`):v}
            ${n(this.chipText)?g`<span
                  class="chip v-${e}"
                  data-ff-editable
                  data-ff-spot="chipText"
                  ?data-ff-bound=${this.chipTextField!==``}
                  @dblclick=${e=>this.inlineEdit(e,`chipText`)}
                >${this.chipText}</span>`:v}
          </div>`:v}
    </div>`}};w([S()],B.prototype,`chipVariant`,void 0),w([S()],B.prototype,`heading`,void 0),w([S()],B.prototype,`heading2`,void 0),w([S()],B.prototype,`time`,void 0),w([S()],B.prototype,`date`,void 0),w([S()],B.prototype,`avatar`,void 0),w([S()],B.prototype,`meta`,void 0),w([S()],B.prototype,`text`,void 0),w([S()],B.prototype,`chipText`,void 0),w([S()],B.prototype,`headingField`,void 0),w([S()],B.prototype,`heading2Field`,void 0),w([S()],B.prototype,`timeField`,void 0),w([S()],B.prototype,`dateField`,void 0),w([S()],B.prototype,`avatarField`,void 0),w([S()],B.prototype,`metaField`,void 0),w([S()],B.prototype,`textField`,void 0),w([S()],B.prototype,`chipTextField`,void 0),T.defineAndRegister(B);function Fr(e){let t=String(e??``).trim();if(t===``)return``;let n=/^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(t);if(n)return`${n[3]}-${n[2].padStart(2,`0`)}-${n[1].padStart(2,`0`)}`;let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return r?`${r[1]}-${r[2]}-${r[3]}`:``}function Ir(e){let t=String(e.getMonth()+1).padStart(2,`0`),n=String(e.getDate()).padStart(2,`0`);return`${e.getFullYear()}-${t}-${n}`}function Lr(e,t){let n=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!n)return``;let r=new Date(Number(n[1]),Number(n[2])-1,Number(n[3]));return r.setDate(r.getDate()+t),Ir(r)}var Rr=``,zr=new Set;function Br(){return Rr}function Vr(e){let t=Fr(e);t!==Rr&&(Rr=t,zr.forEach(e=>e()))}function Hr(e){return zr.add(e),()=>{zr.delete(e)}}var Ur=class extends T{constructor(...e){super(...e),this.tag=``,this.tagAbmelden=null}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.defaultProps={}}static{this.customProperties=[]}static{this.raster={startW:9,startH:2,minW:5,minH:2}}static{this.styles=[T.styles,o`

      .waehler {
        --tag-h: 34px;

        --tag-feld-min: 112px;
        display: flex;
        align-items: stretch;
        gap: var(--se-gap-sm);
        height: var(--tag-h);
        font-family: var(--se-font);
      }

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

      .feld {
        box-sizing: border-box;

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

      :host { container-type: inline-size; }
      @container (max-width: 210px) {
        .heute { display: none; }
      }
      @container (max-width: 160px) {
        .waehler { --tag-feld-min: 80px; }
      }

      :host([data-ff-editor]) .feld,
      :host([data-ff-editor]) .pfeil,
      :host([data-ff-editor]) .heute { pointer-events: none; }

      :host([fuellt]) .waehler { height: 100%; }
    `]}setzeTag(e){Vr(e),this.tag=Br()}render(){return g`<div class="waehler">
      <div class="riegel">
        <button class="pfeil" title="Vortag" @click=${()=>this.setzeTag(Lr(this.tag,-1))}>‹</button>
        <input
          class="feld"
          type="date"
          .value=${this.tag}
          @change=${e=>this.setzeTag(e.target.value)}
        />
        <button class="pfeil" title="Folgetag" @click=${()=>this.setzeTag(Lr(this.tag,1))}>›</button>
      </div>
      <button class="heute" @click=${()=>this.setzeTag(Ir(new Date))}>Heute</button>
    </div>`}connectedCallback(){super.connectedCallback(),this.tag=Br()||Ir(new Date),!this.hasAttribute(`data-ff-editor`)&&(this.setzeTag(this.tag),this.tagAbmelden?.(),this.tagAbmelden=Hr(()=>{this.tag=Br()}))}disconnectedCallback(){super.disconnectedCallback(),this.tagAbmelden?.(),this.tagAbmelden=null}};w([C()],Ur.prototype,`tag`,void 0),T.defineAndRegister(Ur);function Wr(e){return e.trim().toLowerCase().split(/\s+/).filter(e=>e!==``)}function Gr(e,t){let n=Wr(t);if(n.length===0)return!0;let r=e.join(` `).toLowerCase();return n.every(e=>r.includes(e))}function Kr(e,t,n=8){if(t.trim()===``)return[];let r=[];for(let i of e)if(Gr([i.anzeige,i.wert],t)&&(r.push(i),r.length>=n))break;return r}function qr(e,t,n){return t<=0?0:((e+n)%t+t)%t}function Jr(e,t){return t<=0||e<0||e>=t?0:e}function Yr(e,t){return e===`ArrowDown`?t.listeOffen?`marke-runter`:`nichts`:e===`ArrowUp`?t.listeOffen?`marke-hoch`:`nichts`:e===`Escape`?t.listeOffen?`liste-zu`:`nichts`:e===`Enter`?t.listeOffen?`uebernehmen`:t.feldLeer?`fenster`:`nichts`:`nichts`}function Xr(e){return g`<ul
    class="vorschlaege"
    @mousedown=${e=>e.preventDefault()}
  >${e.eintraege.map((t,n)=>g`<li
      class=${n===e.marke?`vorschlag marke`:`vorschlag`}
      @click=${()=>e.onWaehlen(n)}
      @mouseenter=${()=>e.onMarke(n)}
    ><span class="vorschlag-anzeige">${t.anzeige===``?t.wert:t.anzeige}</span>${t.wert!==``&&t.wert!==t.anzeige?g`<span class="vorschlag-wert">${t.wert}</span>`:v}</li>`)}</ul>`}var Zr=o`
  .vorschlaege {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 3;
    max-height: 240px;
    overflow: auto;
    margin: 2px 0 0;
    padding: 0;
    list-style: none;
    background: var(--se-panel);
    border: var(--se-border) solid var(--se-accent);
    border-radius: var(--se-r-md);
    font-family: var(--se-font);
    font-size: var(--se-fs);
    color: var(--se-ink);
  }

  .vorschlag {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--se-gap);
    padding: 4px 10px;
    white-space: nowrap;
    cursor: pointer;
  }
  .vorschlag + .vorschlag { border-top: 1px solid var(--se-line-soft); }

  .vorschlag-anzeige { overflow: hidden; text-overflow: ellipsis; }

  .vorschlag-wert {
    flex: none;
    color: var(--se-muted);
    font-size: var(--se-fs-sm);
  }

  .vorschlag.marke { background: var(--se-accent-soft); }
`;function Qr(e,t,n,r){return{attributeName:e,name:t,description:n,kind:`segment`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var $r={attributeName:`fieldType`,equals:`nachschlagen`},ei=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`time`,label:`Uhrzeit`},{value:`checkbox`,label:`Ankreuzfeld`},{value:`nachschlagen`,label:`Nachschlagen`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`nachschlagQuelle`,name:`Quelle`,description:`Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.`,kind:`quelle`,visibleWhen:$r},{attributeName:`speicherFeld`,name:`Gespeichert wird`,description:`Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer). Im Feld sichtbar ist die erste Spalte des Nachschlage-Fensters — ohne eigene Spalten ist das dieser Wert selbst.`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`speicherTitel`,visibleWhen:$r},Qr(`einzigerTreffer`,`Einzigen Treffer übernehmen`,`Bleibt in der Maske genau EIN Satz übrig (weil das Feld der Auswahl eines anderen folgt), übernimmt es diesen von selbst — ohne dass der Bediener die Lupe drückt. Nur in ein leeres Feld; die Lupe bleibt daneben bedienbar.`,{visibleWhen:$r}),{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,kind:`field`,visibleWhen:{attributeName:`fieldType`,keinesVon:[`checkbox`,`nachschlagen`]}}];function ti(e){let t=new Set,n=!1,r=()=>{ln()&&t.forEach(e.hydriere)};return{connect:i=>{i.hasAttribute(`data-ff-editor`)||(t.add(i),e.verdrahte?.(i),n||(n=!0,mn(r),Hr(r),Gt(r),rr()),xn(),ln()&&e.hydriere(i))},disconnect:e=>{t.delete(e)}}}var ni=ot.toLowerCase(),ri=``;function ii(e){if(e.length===0)return``;let t=[];for(let n of e){let e=n.trim();if(e===``)return``;t.push(e)}return t.join(ri)}function ai(e){return Lt(e,ni,`quelleId`,`vonQuelleId`).map(e=>({quelleId:e.id,...e.von===void 0?{}:{vonQuelleId:e.von},keyPairs:e.keyPairs}))}function oi(e){let t=ai(e);if(t.length===0)return(e,t)=>k(e,it(t).code);let n=F().SEDATA,r=F().FF_DATA_SOURCES,i=new Map;for(let e of t){let t=O(r,e.quelleId);if(!t)continue;let a=Pt(n,t.name,t.tableId),o=new Map;for(let t of a){let n=ii(e.keyPairs.map(e=>k(t,e.toField)));n!==``&&!o.has(n)&&o.set(n,t)}i.set(e.quelleId,{nachSchluessel:o,hierFelder:e.keyPairs.map(e=>e.fromField),von:e.vonQuelleId??``})}let a=(e,n,r)=>{let o=i.get(n);if(!o||r>t.length)return;let s=o.von===``?e:a(e,o.von,r+1);if(s===void 0)return;let c=ii(o.hierFelder.map(e=>k(s,e)));if(c!==``)return o.nachSchluessel.get(c)};return(e,t)=>{let{quelleId:n,code:r}=it(t);if(n===``)return k(e,r);let i=a(e,n,0);return i===void 0?``:k(i,r)}}function si(e,t){let n=e.getAttribute(`source`)??``,r=e.getAttribute(t)??``;if(n===``||r===``)return{art:`ungebunden`};let i=O(F().FF_DATA_SOURCES,n);if(!i)return{art:`ohneQuelle`};let a=rn(e,Pt(F().SEDATA,i.name,i.tableId));if(a===void 0)return{art:`ohneZeile`};let{quelleId:o,code:s}=it(r);return{art:`wert`,wert:o===``?k(a,s):oi(e)(a,r),zeile:a,quelle:i,quelleId:o,reinerCode:s}}var ci=new WeakMap,li=new WeakSet;function ui(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function di(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function fi(e){return typeof e.value==`string`?e.value:``}function pi(e){if(e.pruefeEigenenWert?.(),e.getAttribute(`fieldtype`)===`nachschlagen`){ci.delete(e);return}let t=si(e,rt(`value`));if(t.art!==`wert`){ci.delete(e),t.art===`ohneZeile`&&(e.value=``);return}let{zeile:n,quelle:r,quelleId:i,reinerCode:a,wert:o}=t,s=jt(r,n);i===``?ci.set(e,{row:n,code:a,pindex:s}):ci.delete(e),e.value=o}function mi(e){let t=ci.get(e);return t&&Mt(t.row,t.code,fi(e)),t}function hi(e){li.has(e)||(li.add(e),e.addEventListener(`input`,()=>{mi(e)}),e.addEventListener(`change`,()=>{let t=mi(e);z(e,`onChange`,{VALUE:fi(e),PINDEX:t?.pindex??``}).catch(mr)}))}var gi=ti({hydriere:pi,verdrahte:hi}),_i=gi.connect,vi=gi.disconnect,yi=o`
  .feld {
    font-family: var(--se-font);

    --feld-pad-y: 7px;
    --feld-pad-x: 10px;
    --feld-rand: var(--se-border);
  }

  .huelle { position: relative; }

  .ctrl {
    box-sizing: border-box;
    width: 100%;
    padding: var(--feld-pad-y) var(--feld-pad-x);
    border: var(--feld-rand) solid var(--se-line);
    background: var(--se-panel);
    border-radius: var(--se-r-md);
    font-family: var(--se-font);
    font-size: var(--se-fs);

    line-height: 1.4;
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
  }
  select.ctrl { padding: calc(var(--feld-pad-y) - 1px) calc(var(--feld-pad-x) - 2px); }

  .ph {
    position: absolute;
    top: calc(var(--feld-pad-y) + var(--feld-rand));
    left: calc(var(--feld-pad-x) + var(--feld-rand));
    right: calc(var(--feld-pad-x) + var(--feld-rand));
    color: var(--se-faint);
    font-size: var(--se-fs);
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }
  .ph[hidden] { display: none; }

  .ph-select {
    top: calc(var(--feld-pad-y) - 1px + var(--feld-rand));
    left: calc(var(--feld-pad-x) - 2px + var(--feld-rand));
    right: 25px;
  }

  /* Gleiches Recht wie .ph-select: der Platzhalter endet am Innenrand des
     Feldes (padding-right 34px) und laesst die 30px-Lupe frei — im Editor
     ist er klickbar und wuerde sie sonst fast ganz verdecken. */
  .ph-nachschlag { right: 34px; }

  .huelle.leer input[type="date"]:not(:focus)::-webkit-datetime-edit,
  .huelle.leer input[type="time"]:not(:focus)::-webkit-datetime-edit { opacity: 0; }
  .huelle.leer.tippt .ph-nativ { display: none; }

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

  .nachschlag { position: relative; }
  .nachschlag .ctrl { padding-right: 34px; border-style: dashed; }

  /* Die offene Vorschlagsliste haengt unten aus dem Feld heraus. Raster-
     Kinder stapeln in DOM-Reihenfolge — ohne diesen Vorrang laege die Liste
     unter dem naechsten Baustein. Nur solange sie offen ist (das Attribut
     setzt der Baustein in updated()), also ohne Nebenwirkung auf das Raster. */
  :host([data-ff-liste]) { position: relative; z-index: 5; }

  .lupe {
    position: absolute;
    top: var(--feld-rand);
    bottom: var(--feld-rand);
    right: var(--feld-rand);
    width: 30px;
    display: grid;
    place-items: center;
    padding: 0;
    border: none;
    background: none;
    color: var(--se-muted);
    cursor: pointer;
    transition: background var(--se-move);
  }
  .lupe:hover { background: var(--se-accent-soft); color: var(--se-ink); }
  .lupe:focus-visible { outline: 2px solid var(--se-accent); outline-offset: -2px; }

  :host([data-ff-editor]) .ctrl { pointer-events: none; }
  /* Die Lupe bleibt im Editor bedienbar: sie oeffnet das Spalten-Stellen. */
  :host([data-ff-editor]) .ph { pointer-events: auto; cursor: text; }
  :host([data-ff-editor]) .huelle[data-ff-bound] .ctrl {
    border-style: dotted;
    border-color: var(--se-accent);
  }

  :host([data-ff-editor]) [data-ff-editable]:empty::before { content: 'Text …'; opacity: 0.6; }

  :host(:not([data-ff-editor])) .zeile .text { cursor: pointer; user-select: none; }

  :host([fuellt]) .feld,
  :host([fuellt]) .huelle { height: 100%; }
  :host([fuellt]) .huelle .ctrl { height: 100%; }
`,bi=[`text`,`number`,`textarea`,`select`,`date`,`time`,`checkbox`,`nachschlagen`];function xi(e){return bi.includes(e)?e:`text`}var Si=[`text`,`number`,`textarea`,`select`,`nachschlagen`,`date`,`time`],Ci={select:`ph-select`,date:`ph-nativ`,time:`ph-nativ`,nachschlagen:`ph-nachschlag`};function wi(){return g`<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
      <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
    </svg>`}var Ti=4;function Ei(e){return e??Ti}function Di(e,t,n){return Math.max(1,Math.floor((e-t)/n))}function Oi(e,t,n){let r=Di(e,t,n),i=e-t;return i<n?{passen:r,zeilenHoehe:n}:{passen:r,zeilenHoehe:Math.floor(i/r*100)/100}}function ki(e,t){return e===null?null:Math.max(0,e-t)}function Ai({sichtbar:e,hatQuelle:t,proSeite:n,wunschSeite:r,platzhalterZeilen:i}){let a=t?Math.max(1,Math.ceil(e.length/n)):1,o=Math.min(Math.max(r,0),a-1);return t?{seiten:a,seite:o,zeilen:[...e.slice(o*n,(o+1)*n)]}:{seiten:a,seite:o,zeilen:Array.from({length:i},()=>null)}}function ji(e,t){let n=t.trim().toLowerCase();return e.find(e=>e.wert.trim().toLowerCase()===n)}var V=`text`,Mi=`status`,Ni=`bild`,Pi=`bild`,Fi=`unter`,Ii=[{wert:V,name:`Text`,spur:`minmax(0, 1fr)`,klasse:``,zelle:e=>e},{wert:`zahl`,name:`Zahl`,spur:`90px`,klasse:`zahl`,zelle:e=>e},{wert:`datum`,name:`Datum`,spur:`100px`,klasse:`zahl`,zelle:e=>e},{wert:Mi,name:`Status`,spur:`120px`,klasse:`status`,zelle:(e,t)=>{let n=ji(t,e);return n?g`<span class="chip v-${Cr(n.bedeutung)}">${n.name.trim()===``?e:n.name}</span>`:g`<span class="chip">${e}</span>`}},{wert:Ni,name:`Bild + Name`,spur:`minmax(0, 1fr)`,klasse:`bild`,zusatzFelder:[{key:Pi,label:`Bild`},{key:Fi,label:`Unterzeile`}],hoehe:e=>(e[Pi]??``)!==``||(e[Fi]??``)!==``?44:32,zelle:(e,t,n)=>{let r=Mr(n[Pi]??``),i=n[Fi]??``;return g`<div class="bild-name">
        ${r===void 0?v:g`<span class="bild-zeichen">${r}</span>`}
        <div class="bild-text">
          <div class="bild-titel">${e}</div>
          ${i===``?v:g`<div class="bild-unter">${i}</div>`}
        </div>
      </div>`}}];function Li(e){return e.reduce((e,t)=>{let n=H(t.art);return Math.max(e,n.hoehe?.(t.felder??{})??32)},32)}function H(e){return Ii.find(t=>t.wert===e)??Ii[0]}var Ri=Ii.map(e=>({wert:e.wert,name:e.name,...e.zusatzFelder?{felder:e.zusatzFelder}:{}})),zi=`felder`,Bi=`suchtIn`,Vi=`suchFelder`;function Hi(e){return Array.isArray(e)?e.map(e=>{if(typeof e==`string`)return{feld:e.trim(),titel:e.trim()};if(!e||typeof e!=`object`)return{feld:``,titel:``};let t=e,n=typeof t.feld==`string`?t.feld.trim():``;return{feld:n,titel:typeof t.titel==`string`&&t.titel.trim()!==``?t.titel.trim():n}}).filter(e=>e.feld!==``):[]}var Ui=`Spalte {n}`;function Wi(e){return Ui.replace(`{n}`,String(e+1))}function U(e){return{titel:Wi(e),feld:``,art:V}}function Gi(){return[0,1,2].map(e=>U(e))}function Ki(e){return Array.isArray(e)?e.filter(e=>!!e&&typeof e==`object`).map(e=>({wert:typeof e.wert==`string`?e.wert:``,name:typeof e.name==`string`?e.name:``,bedeutung:typeof e.bedeutung==`string`?e.bedeutung:``})).filter(e=>e.wert.trim()!==``):[]}function qi(e){if(!e||typeof e!=`object`||Array.isArray(e))return{};let t={};for(let[n,r]of Object.entries(e))typeof r==`string`&&r!==``&&(t[n]=r);return t}function Ji(e,t){if(e&&typeof e==`object`){let n=e,r=Ki(n.zuordnung),i=qi(n.felder),a=typeof n.suchtIn==`string`?n.suchtIn.trim():``,o=Hi(n.suchFelder);return{titel:typeof n.titel==`string`?n.titel:Wi(t),feld:typeof n.feld==`string`?n.feld:``,art:typeof n.art==`string`?n.art:V,...a===``?{}:{suchtIn:a},...o.length>0?{suchFelder:o}:{},...r.length>0?{zuordnung:r}:{},...Object.keys(i).length>0?{felder:i}:{}}}return typeof e==`string`?{...U(t),titel:e}:U(t)}function Yi(e){let t;if(Array.isArray(e))t=e.map((e,t)=>Ji(e,t));else if(typeof e==`number`&&Number.isFinite(e)||typeof e==`string`&&/^\d+$/.test(e)){let n=Math.max(1,Math.floor(Number(e)));t=[...Array(n).keys()].map(e=>U(e))}else t=Gi();return t.length>8&&(t=t.slice(0,8)),t.length<1&&(t=[U(0)]),t}function Xi(e){try{return Yi(JSON.parse(e))}catch{return Gi()}}var Zi={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Qi=e=>(...t)=>({_$litDirective$:e,values:t}),$i=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},ea=`important`,ta=` !important`,W=Qi(class extends $i{constructor(e){if(super(e),e.type!==Zi.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(ta);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?ea:``):n[e]=r}}return _}}),na=`Keine Datensätze.`;function ra(){return{attributeName:`leerText`,name:`Text ohne Datensätze`,description:`Steht in der Maske dort, wo sonst die Zeilen stehen — wenn die Datenquelle keine liefert. Leer lassen: dann steht dort gar nichts.`,kind:`text`,requiresDataSource:!0}}function ia(e,t=!1){return e.trim()===``?v:g`<div class="leer${t?` leer--tafel`:``}">
    ${Or()}
    <span>${e}</span>
  </div>`}var aa=o`
  .leer {
    display: grid;
    justify-items: center;
    gap: 7px;
    padding: 22px 14px 24px;
    border: var(--se-border) dashed var(--se-line);
    border-radius: var(--se-r-md);
    color: var(--se-muted);
    font-size: var(--se-fs);
    line-height: 1.4;
    text-align: center;
  }

  .leer svg {
    width: 22px;
    height: 22px;
    fill: var(--se-faint);
    transform: rotate(-12deg);
  }

  .leer--tafel {
    border: none;
    padding: 44px 20px 48px;
  }
`;function oa(e,t){if(!e.hasAttribute(`fuellt`))return null;let n=e.renderRoot.querySelector(`.koerper`);if(!(n instanceof HTMLElement))return null;let r=t=>{let n=e.renderRoot.querySelector(t);return n instanceof HTMLElement?n.offsetHeight:0};return Oi(n.clientHeight,r(`.kopf`)+r(`.zeile.erfassung`),t)}function sa(e,t){if(typeof ResizeObserver>`u`)return null;let n=e.renderRoot.querySelector(`.koerper`);if(!n)return null;let r=new ResizeObserver(t);return r.observe(n),r}function ca(e,t){return e.verknuepfungen.find(e=>e.quelleId===t)?.keyPairs??[]}function la(e,t){let n=e.verknuepfungen.find(e=>e.quelleId===t);return n===void 0?e.quelleId:lt(n,e.quelleId)}function ua(e,t,n){return ut(e?.feld??``,e?.suchtIn??``,t,n)}function G(e,t){return ua(e.spalten[t],e.quelleId,e.verknuepfungen)}function da(e){let t=[],n=e=>{e!==``&&!t.includes(e)&&t.push(e)};for(let t=0;t<e.spalten.length;t++){let r=G(e,t);r.art===`auswahl`&&n(r.quelleId),n(r.suchQuelleId)}return t}function fa(e,t){let n=G(e,t);if(n.suchQuelleId===``)return;let r=pa(e,t)[0];if(r!==void 0)return{titel:r.titel,code:r.feld};let i=n.quelleId===n.suchQuelleId?n.code:``;for(let r=0;r<e.spalten.length;r++){if(r===t)continue;let a=G(e,r);if(!(a.art!==`auswahl`||a.quelleId!==n.suchQuelleId)&&!(a.code===``||a.code===i))return{titel:e.spalten[r].titel,code:a.code}}}function pa(e,t){return e.spalten[t]?.suchFelder??[]}function ma(e,t){let n=e.spalten[t];if(n===void 0)return[];let r=pa(e,t);if(r.length>0)return r.map(e=>({titel:e.titel,feld:e.feld,art:V}));let i=fa(e,t),a=G(e,t);if(i===void 0)return[];let o=a.quelleId===a.suchQuelleId?a.code:``,s={titel:i.titel,feld:i.code,art:V};return o===``?[s]:[s,{titel:n.titel,feld:o,art:V}]}function ha(e,t,n){let r=e.map(e=>({toField:e.toField,soll:t(e.fromField)})).filter(e=>e.soll!==void 0);return r.length===0?[...n]:n.filter(e=>r.every(t=>t.soll!==``&&t.soll===k(e,t.toField)))}function ga(e,t){let n=G(e,t);return n.art!==`eigen`||n.suchQuelleId===``?``:pa(e,t)[0]?.feld??``}var _a=`32px`;function va(e){return String(e).padStart(2,`0`)}function ya(e){return g`<div
    class=${e.aktiv?`griff aktiv`:`griff`}
    role="cell"
    @click=${e.aufKlick??v}
  >${e.nummer===null?v:va(e.nummer)}</div>`}function ba(){return g`<div class="griff leer" role="presentation"></div>`}function xa(e,t,n){return g`<input
    class="erf-eingabe"
    type="text"
    data-spalte=${n}
    placeholder=${e.umfeld.spalten[n]?.titel??``}
    .value=${e.wert(n)}
    @input=${e=>t.tippen(n,e.target.value)}
    @keydown=${e=>t.taste(n,e)}
    @focus=${()=>t.betreten(n)}
    @blur=${()=>t.verlassen(n)}
  />`}function Sa(e,t,n,r){if(!r)return xa(e,t,n);let i=e.tippSpalte===n&&e.vorschlaege.length>0;return g`<div class=${e.listeNachOben?`erf-halter nach-oben`:`erf-halter`}>
    ${xa(e,t,n)}
    ${i?Xr({eintraege:e.vorschlaege,marke:e.marke,onWaehlen:e=>t.waehleVorschlag(e),onMarke:e=>t.setzeMarke(e)}):v}
  </div>`}function Ca(e){return[`zeile`,`erfassung`].concat(e.aktiv?[`aktiv`]:[],e.gefuellt?[`gefuellt`]:[]).join(` `)}function wa(e,t){return g`<div
    class=${Ca(e)}
    role="row"
    data-erf-zeile=${e.zeile}
    style=${W(e.cols)}
  >
    ${ya({nummer:e.nummer,aktiv:e.aktiv,aufKlick:()=>t.waehleZeile()})}
    ${e.umfeld.spalten.map((n,r)=>{let i=H(n.art).klasse;if(e.imEditor){let t=e.zellenGriff;return g`<div
          class=${i}
          role="cell"
          data-ff-editable=${t?``:v}
          @click=${t?e=>t(e,r):v}
        >${t?g`<span class="spalten-name">${n.titel}</span>`:`—`}</div>`}return g`<div class=${i} role="cell">${Sa(e,t,r,G(e.umfeld,r).suchQuelleId!==``)}</div>`})}
  </div>`}function Ta(e,t,n,r){let i=e.anschluss.lauf(t),a=i.vorschlaege[r];a!==void 0&&(i.uebernimm(e.umfeld(),n,a.satz),e.melde())}function Ea(e,t,n){let r=e.umfeld(),i=r.spalten[n],a=G(r,n);if(i===void 0||a.suchQuelleId===``)return;let o=e.anschluss.lauf(t);Qo({el:e.baustein,quelleId:a.suchQuelleId,speicherFeld:a.quelleId===a.suchQuelleId?a.code:``,speicherTitel:i.titel,spalten:ma(r,n),titel:i.titel,breite:520,hoehe:380,eintraege:o.eintraege(r,n),rueckFokus:null,onUebernehmen:(t,r,i)=>{o.uebernimm(e.umfeld(),n,i),e.melde()}})}function Da(e,t,n,r){let i=e.umfeld(),a=r===`enter`?e.anschluss.lauf(t).naechsteLeere(i,n):n+1<i.spalten.length?n+1:-1;if(a!==-1){e.fokussiere(t,a);return}let o=r===`enter`?e.anschluss.weiter(i,t):Math.min(t+1,e.anschluss.anzahl-1);if(o===t)return;r===`tab`&&e.anschluss.waehle(o);let s=e.anschluss.lauf(o).naechsteLeere(i,-1);e.fokussiere(o,r===`enter`&&s!==-1?s:0)}function Oa(e,t,n,r){let i=t+r;return i<0||i>=e.anschluss.anzahl?!1:(e.fokussiere(i,n),!0)}function ka(e,t,n,r){if(r.key===`Tab`&&r.shiftKey)return;let i=r.key===`Tab`?`tab`:`enter`,a=e.anschluss.lauf(t).entscheideTaste(e.umfeld(),n,r.key);if(a===`nichts`){(r.key===`Enter`||r.key===`ArrowDown`&&Oa(e,t,n,1)||r.key===`ArrowUp`&&Oa(e,t,n,-1))&&r.preventDefault();return}r.preventDefault(),a===`uebernehmen`?(Ta(e,t,n,e.anschluss.lauf(t).marke),Da(e,t,n,i)):a===`fenster`?Ea(e,t,n):a===`weiter`?Da(e,t,n,i):a===`leeren`&&e.anschluss.lauf(t).leere(e.umfeld(),n),e.melde()}function Aa(e,t,n,r){let i=e.umfeld(),a=e.baustein.hasAttribute(`data-ff-editor`),o=[];for(let s=0;s<e.anschluss.anzahl;s++){let c=e.anschluss.lauf(s),l=s===e.anschluss.aktiv;o.push(wa({umfeld:i,cols:t,imEditor:a,zeile:s,aktiv:l,gefuellt:!a&&!e.anschluss.istLeer(i,s),...r?{zellenGriff:r}:{},wert:e=>c.wertVon(i,e),tippSpalte:l?c.tippSpalte:-1,vorschlaege:l?c.vorschlaege:[],marke:c.marke,listeNachOben:n,nummer:s+1},{tippen:(t,n)=>{c.tippe(t,n),e.anschluss.waehle(s),e.melde()},taste:(t,n)=>ka(e,s,t,n),verlassen:t=>{c.verlasse(t),e.melde()},betreten:()=>{e.anschluss.waehle(s)&&e.melde()},waehleZeile:()=>{e.anschluss.waehle(s)&&e.melde()},waehleVorschlag:t=>Ta(e,s,c.tippSpalte,t),setzeMarke:t=>{c.setzeMarke(t),e.melde()}}))}return o}var ja=2,Ma=class e{constructor(){this.getippt=new Map,this.gewaehlt=new Map,this.vonHand=new Map,this._wahlZaehler=0,this._tippSpalte=-1,this._marke=0,this._listeZu=!1,this._vorschlaege=[]}get tippSpalte(){return this._tippSpalte}get marke(){return this._marke}get vorschlaege(){return this._vorschlaege}wertVon(e,t){let n=this.getippt.get(t);if(n!==void 0)return n;let r=G(e,t);if(r.art!==`auswahl`||r.code===``)return``;let i=this.gewaehlt.get(r.quelleId);return i===void 0?``:k(i,r.code)}tippe(e,t){this.getippt.set(e,t),this._tippSpalte=e,this._marke=0,this._listeZu=!1}verlasse(e){this._tippSpalte===e&&(this._tippSpalte=-1,this._listeZu=!1,this._marke=0,this._vorschlaege=[])}entscheideTaste(e,t,n){let r=this._tippSpalte===t&&this._vorschlaege.length>0;if(n===`Tab`){if(!r)return`weiter`;n=`Enter`}let i=this.wertVon(e,t);if(n===`Escape`&&!r)return i===``?`nichts`:`leeren`;if(G(e,t).suchQuelleId===``)return n===`Enter`?`weiter`:`nichts`;let a=Yr(n,{listeOffen:r,feldLeer:i===``});if(a===`marke-hoch`)this._marke=qr(this._marke,this._vorschlaege.length,-1);else if(a===`marke-runter`)this._marke=qr(this._marke,this._vorschlaege.length,1);else if(a===`liste-zu`)this._listeZu=!0;else if(a===`fenster`&&this.eintraege(e,t).length===0)return`weiter`;else if(a===`nichts`&&n===`Enter`&&i!==``&&this.getippt.get(t)===void 0)return`weiter`;return a}naechsteLeere(e,t){for(let n=t+1;n<e.spalten.length;n++)if(this.wertVon(e,n)===``)return n;return-1}leere(e,t){this.getippt.delete(t);let n=G(e,t);for(let t of[n.quelleId,n.suchQuelleId])t!==``&&this.gewaehlt.has(t)&&this.setze(e,t,void 0);this._listeZu=!1,this._marke=0}setzeMarke(e){this._marke=e}uebernimm(e,t,n){let r=G(e,t).suchQuelleId;r!==``&&(this.setze(e,r,n),this._wahlZaehler+=1,this.vonHand.set(r,this._wahlZaehler),this.gleicheAb(e),this._tippSpalte=-1,this._marke=0,this._listeZu=!1)}setze(e,t,n){n===void 0?(this.gewaehlt.delete(t),this.vonHand.delete(t)):this.gewaehlt.set(t,n);for(let r=0;r<e.spalten.length;r++){let i=G(e,r);if(i.quelleId===t){this.getippt.delete(r);continue}if(i.suchQuelleId!==t)continue;let a=ga(e,r);a!==``&&(n===void 0?this.getippt.delete(r):this.getippt.set(r,k(n,a)))}}schluesselWert(e,t,n,r=()=>!0,i=e.quelleId){if(i!==e.quelleId){if(i===n||i===``)return;let e=this.gewaehlt.get(i);if(e===void 0)return;let a=this.vonHand.get(i);return a!==void 0&&!r(a)?void 0:k(e,t)}for(let i of da(e)){if(i===n)continue;let a=this.vonHand.get(i);if(a===void 0||!r(a))continue;let o=this.gewaehlt.get(i);if(o!==void 0)for(let n of ca(e,i)){if(n.fromField!==t)continue;let e=k(o,n.toField);if(e!==``)return e}}}moegliche(e,t,n,r){return ha(ca(e,t),n=>this.schluesselWert(e,n,t,r,la(e,t)),n)}gleicheAb(e){let t=da(e);for(let n=0;n<=t.length;n++){let n=!1;for(let r of t){let t=ca(e,r);if(t.length===0)continue;let i=this.gewaehlt.get(r);if(i!==void 0){let a=this.vonHand.get(r)??-1/0;t.every(t=>{let n=this.schluesselWert(e,t.fromField,r,e=>e>a,la(e,r));return n===void 0||n!==``&&n===k(i,t.toField)})||(this.setze(e,r,void 0),n=!0);continue}let a=la(e,r);if(!t.some(t=>this.schluesselWert(e,t.fromField,r,void 0,a)!==void 0))continue;let o=Ro(r);if(o===null)continue;let s=this.moegliche(e,r,o);s.length===1&&(this.setze(e,r,s[0]),this.vonHand.delete(r),n=!0)}if(!n)break}}zuruecksetzen(){this.getippt.clear(),this.gewaehlt.clear(),this.vonHand.clear(),this._tippSpalte=-1,this._marke=0,this._listeZu=!1,this._vorschlaege=[]}nimmEinzigenTreffer(e){let t=this._tippSpalte;if(t<0||this._vorschlaege.length!==1)return!1;let n=(this.getippt.get(t)??``).trim();if(n.length<ja)return!1;let r=this._vorschlaege[0];return r.wert===n?!1:(this.uebernimm(e,t,r.satz),!0)}aktualisiereVorschlaege(e){this._vorschlaege=this.berechne(e),this._marke=Jr(this._marke,this._vorschlaege.length)}berechne(e){let t=this._tippSpalte;if(this._listeZu||G(e,t).suchQuelleId===``)return[];let n=this.getippt.get(t)??``;return n===``?[]:Kr(this.eintraege(e,t),n)}eintraege(e,t){let n=G(e,t),r=n.suchQuelleId;if(r===``)return[];let i=Ro(r);if(i===null)return[];let a=this.vonHand.get(r)??1/0;return Io(this.moegliche(e,r,i,e=>e<a),fa(e,t)?.code??``,n.quelleId===r?n.code:``)}get istUnberuehrt(){return this.getippt.size===0&&this.gewaehlt.size===0}kopie(){let t=new e;return t.getippt=new Map(this.getippt),t.gewaehlt=new Map(this.gewaehlt),t.vonHand=new Map(this.vonHand),t._wahlZaehler=this._wahlZaehler,t}};function Na(e,t){let n=t.feld.trim();if(n===``)return null;let{quelleId:r,code:i}=it(n),a=r===``?e.quelleId:r;return a===``||i===``?null:{quelleId:a,code:i}}function Pa(e,t){let n={};return e.spalten.forEach((r,i)=>{let a=Na(e,r);if(a===null)return;let o=n[a.quelleId]??(n[a.quelleId]={});o[a.code]=t[i]??``}),n}function Fa(e){let t=[];for(let n of e.spalten){let r=Na(e,n);r!==null&&!t.includes(r.quelleId)&&t.push(r.quelleId)}return t}var Ia=class{constructor(){this._laeufe=[new Ma],this._aktiv=0}get anzahl(){return this._laeufe.length}get aktiv(){return this._aktiv}lauf(e){let t=Math.min(Math.max(e,0),this._laeufe.length-1);return this._laeufe[t]}get aktiverLauf(){return this.lauf(this._aktiv)}waehle(e){let t=Math.min(Math.max(e,0),this._laeufe.length-1);return t===this._aktiv?!1:(this._aktiv=t,!0)}werte(e,t){let n=this.lauf(t);return e.spalten.map((t,r)=>n.wertVon(e,r))}istLeer(e,t){return this.werte(e,t).every(e=>e===``)}saetze(e){let t=[];for(let n=0;n<this._laeufe.length;n++){let r=this.werte(e,n);r.every(e=>e===``)||t.push(Pa(e,r))}return t}fuegeEin(e){let t=Math.min(Math.max(e,-1),this._laeufe.length-1)+1;return this._laeufe.splice(t,0,new Ma),this._aktiv=t,t}doppelt(e){let t=Math.min(Math.max(e,0),this._laeufe.length-1),n=t+1;return this._laeufe.splice(n,0,this._laeufe[t].kopie()),this._aktiv=n,n}loesche(e){let t=Math.min(Math.max(e,0),this._laeufe.length-1);return this._laeufe.length===1?(this._laeufe=[new Ma],this._aktiv=0,!0):(this._laeufe.splice(t,1),this._aktiv=Math.min(t,this._laeufe.length-1),!0)}weiter(e,t){let n=Math.min(Math.max(t,0),this._laeufe.length-1);return n<this._laeufe.length-1?(this._aktiv=n+1,n+1):this.istLeer(e,n)?n:this.fuegeEin(n)}leeren(){return this._laeufe.length===1&&this._laeufe[0].istUnberuehrt?!1:(this._laeufe=[new Ma],this._aktiv=0,!0)}zuruecksetzen(){this._laeufe=[new Ma],this._aktiv=0}haltVorschlaegeAktuell(e){let t=this.aktiverLauf;t.aktualisiereVorschlaege(e),t.nimmEinzigenTreffer(e)&&t.aktualisiereVorschlaege(e)}umfeld(e,t,n){return{spalten:t,quelleId:n,verknuepfungen:ai(e)}}},La=o`
      .zeile.erfassung {
        flex: none;
        background: var(--se-panel-2);
        border-bottom: var(--se-border) solid var(--se-line);
      }

      /* Der Zeilengriff traegt keine Eingabe: er behaelt die Polster der
         Nummernspalte, nicht die der Erfassungszellen. */
      .zeile.erfassung > div.griff { padding: 0; }

      /* Die Liste haengt aus der Zelle heraus; ohne sichtbaren Ueberlauf
         schnitte die Zelle sie ab. Gilt fuer jede Zelle, weil jede gebundene
         Spalte eine Liste zeigen kann. */
      .zeile.erfassung > div {
        padding: 0 4px;
        display: flex;
        align-items: center;
        overflow: visible;
      }

      .erf-halter {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
      }

      .erf-halter.nach-oben .vorschlaege {
        top: auto;
        bottom: 100%;
        margin: 0 0 2px;
      }

      .erf-eingabe {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        height: calc(var(--zeilen-hoehe) - 8px);
        padding: 0 6px;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
        background: var(--se-panel);
        border: var(--se-border) solid var(--se-line);
        border-radius: var(--se-r-sm);
      }
      .erf-eingabe:focus {
        outline: none;
        border-color: var(--se-accent);
      }
      .erf-eingabe::placeholder { color: var(--se-faint); }

      /* Im Editor zeigt die Zelle keine Eingabe, sondern Striche. */
      :host([data-ff-editor]) .zeile.erfassung > div { color: var(--se-muted); }

      /* Eine tippbare Zeile MIT INHALT ist eine werdende Position: links
         markiert — erst der Knopf macht daraus einen echten ERP-Satz. Bis
         2026-08-20 war das eine eigene, tote Zeilenart (.erfasst); jetzt ist
         es dieselbe Zeile, nur gefuellt (S2.7). */
      .zeile.erfassung.gefuellt {
        box-shadow: inset 3px 0 0 var(--se-accent);
      }

      /* Die Zeile, in der gerade gearbeitet wird — sie ist gemeint, wenn ein
         Zeilen-Werkzeug drueckt. */
      .zeile.erfassung.aktiv {
        background: var(--se-accent-soft);
      }
`;function Ra(e){return{rohzeilen:e.map(e=>e.rohzeile),datenzeilen:e.map(e=>[...e.zellen]),zusatzzeilen:e.map(e=>(e.zusatz??[]).map(e=>({...e})))}}function za(e,t,n){return t===``||n===``?[...e]:e.filter(e=>Fr(k(e,t))===n)}function Ba(e){let t=e.getAttribute(`source`)??``;if(t===``)return null;let n=O(F().FF_DATA_SOURCES,t);return n?{quelle:n,zeilen:za(Pt(F().SEDATA,n.name,n.tableId),e.getAttribute(`tagfield`)??``,Br()),lies:oi(e)}:null}function Va(e){return Xi(e.getAttribute(`spalten`)??``)}function Ha(e,t,n){let r={};for(let i of H(e.art).zusatzFelder??[]){let a=e.felder?.[i.key]??``;a!==``&&(r[i.key]=n(t,a))}return r}function Ua(e,t){let n=O(F().FF_DATA_SOURCES,e.getAttribute(`source`)??``);return n?jt(n,t):``}function Wa(e){let t=Ba(e);if(!t){e.datenzeilen=[],e.zusatzzeilen=[];return}let n=Va(e),{rows:r,gefiltert:i}=nn(e,t.zeilen),a=Yt(M(e),r,e=>e)[0]??-1,o=t.lies;e.datenGeliefert=!0,e.rohzeilen=r,e.auswahlIndex=a,e.durchAuswahlGefiltert=i,e.datenzeilen=r.map(e=>n.map(t=>t.feld===``?``:o(e,t.feld))),e.zusatzzeilen=r.map(e=>n.map(t=>Ha(t,e,o)))}var Ga=ti({hydriere:Wa}),Ka=Ga.connect,qa=Ga.disconnect;function Ja(e,t){let n=[];return e.forEach((e,r)=>{Gr(e,t)&&n.push(r)}),n}function Ya(e,t){return!e&&t.trim()!==``}function Xa(e,t,n){return e&&t&&n===0}function Za(e){if(!e.hatQuelle)return`— Datensätze`;let t=e.auswahlAktiv?` · durch Auswahl gefiltert`:``,n=e=>e===1?`Datensatz`:`Datensätze`,r=e=>e===1?`Datensatz`:`Datensätzen`;return e.suchtAktiv?e.sichtbar===0?`Kein Treffer von ${e.gesamt} ${r(e.gesamt)}`+t:`${e.sichtbar} von ${e.gesamt} ${r(e.gesamt)}`+t:(e.gesamt===0?`Keine Datensätze`:`${e.gesamt} ${n(e.gesamt)}`)+t}function Qa(e,t,n){return g`<div class="steuerung">
    <button
      title="Letzte Spalte entfernen"
      @click=${r=>{n(r);let i=e();i.length>1&&(i.pop(),t(i))}}
    >−</button>
    <button
      title="Spalte hinzufügen"
      @click=${r=>{n(r);let i=e();i.length<8&&(i.push(U(i.length)),t(i))}}
    >+</button>
  </div>`}function $a(e,t){let n=e.currentTarget;n&&(e.stopPropagation(),e.preventDefault(),pt(n,(e,n)=>e===``||e===n.trim()?!1:(t(e),!0)))}function eo(e,t,n,r){$a(e,e=>{let i=n();t>=i.length||(i[t]={...i[t],titel:e},r(i))})}var to=220,no=new WeakMap;function ro(e){let t=no.get(e);t!==void 0&&(clearTimeout(t),no.delete(e))}function io(e,t,n){t.stopPropagation();let r=t.currentTarget,i=r.getBoundingClientRect();ro(e),no.set(e,setTimeout(()=>{no.delete(e),e.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:n.prop,index:n.index,top:i.bottom+4,left:i.left,ausloeser:r,...n.liste?{liste:n.liste()}:{}},bubbles:!0,composed:!0}))},to))}var ao={prop:`spalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:Ui,nurEigeneQuelle:!0,eintragsWahl:{key:`art`,label:`Darstellung`,optionen:Ri,standard:V,felderKey:zi},eintragsQuellenWahl:{key:Bi,label:`Sucht beim Erfassen in`,leerName:`frei`,nurBeiErfassung:!0},eintragsFelderWahl:{key:Vi,label:`Zeigt beim Suchen`,quelleAusKey:Bi,nurBeiErfassung:!0},eintragsZuordnung:{key:`zuordnung`,label:`Status-Zuordnung`,nurBeiWahl:Mi,wertLabel:`Datenwert`,nameLabel:`Klarname`,bedeutungLabel:`Bedeutung`,bedeutungen:wr}},oo=1,so=/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/,co=/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/,lo=/^(\d{4})-(\d{2})-(\d{2})$/;function uo(e){let t=e.trim();if(t===``||!so.test(t))return null;let n=t.includes(`,`)?t.replace(/\./g,``).replace(`,`,`.`):/^-?\d{1,3}(\.\d{3})+$/.test(t)?t.replace(/\./g,``):t,r=Number(n);return Number.isFinite(r)?r:null}function fo(e){let t=e.trim();if(t===``)return null;let n=lo.exec(t);if(n){let[,e,t,r]=n;return po(Number(e),Number(t),Number(r))}let r=co.exec(t);if(r){let[,e,t,n]=r,i=Number(n);return po(n.length===2?i<=69?2e3+i:1900+i:i,Number(t),Number(e))}return null}function po(e,t,n){if(t<1||t>12||n<1||n>31)return null;let r=new Date(e,t-1,n);return r.getFullYear()!==e||r.getMonth()!==t-1||r.getDate()!==n?null:r.getTime()}function mo(e){let t=0,n=0,r=0;for(let i of e)i.trim()!==``&&(t++,uo(i)!==null&&n++,fo(i)!==null&&r++);return t===0?`text`:r===t?`datum`:n===t?`zahl`:`text`}var ho=new Intl.Collator(`de`,{numeric:!0,sensitivity:`base`});function go(e,t,n){if(t<0||e.length===0)return e.map((e,t)=>t);let r=n=>e[n][t]??``,i=mo(e.map(e=>e[t]??``)),a=n?1:-1;return e.map((e,t)=>t).sort((e,t)=>{let n=r(e).trim(),o=r(t).trim();if(n===``&&o===``)return e-t;if(n===``)return oo;if(o===``)return-1;let s=i===`zahl`?(uo(n)??0)-(uo(o)??0):i===`datum`?(fo(n)??0)-(fo(o)??0):ho.compare(n,o);return s===0?e-t:s*a})}function _o(e){let t=Ja(e.datenzeilen,e.suchtext);return e.sortSpalte<0?t:go(t.map(t=>e.datenzeilen[t]),e.sortSpalte,e.sortAuf).map(e=>t[e])}function vo(e){let t=e.spalten.map(e=>H(e.art).spur),n={gridTemplateColumns:(e.erfassungsZeilen>0?[_a,...t]:t).join(` `)},r=Li(e.spalten),i=e.gemessen?.zeilenHoehe??r,a=e.hatQuelle,o=e.erfassungsZeilen>0?!1:Xa(a,e.datenGeliefert,e.datenzeilen.length),s=_o(e),c=e.erfassungsZeilen,l=e.gemessen===null?null:Math.max(1,e.gemessen.passen-c),{seiten:u,seite:d,zeilen:ee}=Ai({sichtbar:s,hatQuelle:a,proSeite:l??Math.max(1,10-c),wunschSeite:e.wunschSeite,platzhalterZeilen:Ei(l)});return{cols:n,takt:r,zeilenHoehe:i,hatQuelle:a,leer:o,gesamt:s.length,seiten:u,seite:d,zeilen:ee,linealTakte:ki(l,ee.length)}}function yo(e){return e!==`ja`}function bo(e,t,n){return e===n?{spalte:n,auf:!t}:{spalte:n,auf:!0}}var xo=[Qr(`suche`,`Suchzeile`,`Zeigt über der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.`,{requiresDataSource:!0}),Qr(`erfassung`,`Erfassungszeile`,`Zeigt als nächste freie Zeile eine leere Zeile, in der der Bediener neue Positionen tippt. Eingestellt wird an ihr nichts: Was eine Zelle tut, ergibt sich aus der Bindung ihrer Spalte (Spaltenkopf) und der Verknüpfung des Bausteins. Enter am Zeilenende lässt die Zeile stehen; geschrieben wird über einen Knopf, dessen Kette „Wert aus Erfassungszelle“ liest — einmal je Zeile.`),Qr(`schlank`,`Schlank`,`Lässt die Kopfzeile weg und macht die Polster enger. Der Rahmen der Tafel bleibt. Die Spaltennamen stehen dann blass in den Zellen — im Editor in der ersten Zeile, in der Maske in der leeren Erfassungszelle, wie der Platzhalter an einem Formularfeld. Die Fußzeile erscheint ohnehin nur noch, wenn geblättert wird oder ein Filter greift.`),{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Sätze des Tages, den der Tageswähler zeigt. Leer = alle Sätze.`,kind:`field`},ra()];function So(e,t){return g`<div class="fusszeile">
    <div class="seiten-info">${Za({hatQuelle:e.hatQuelle,sichtbar:e.sichtbar,gesamt:e.gesamt,suchtAktiv:e.suchtAktiv,auswahlAktiv:e.auswahlAktiv})}</div>
    <div class="seiten-nav">
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
  </div>`}function Co(e){return e.linealTakte===0?v:g`<div class="lineal" role="presentation" style=${W(e.linealTakte===null?e.cols:{...e.cols,flex:`0 1 auto`,height:`calc(var(--zeilen-hoehe) * ${e.linealTakte})`})}>
          ${e.mitGriff?ba():v}
          ${e.spalten.map(()=>g`<div></div>`)}
        </div>`}function wo(e,t){return g`
      ${e.zeigeSuche?g`<div class="suchzeile">
        <input
          type="search"
          placeholder="Tabelle durchsuchen…"
          aria-label="Tabelle durchsuchen"
          .value=${e.suchtext}
          @input=${e=>t.setzeSuchtext(e.target.value)}
        />
      </div>`:``}
      <div class="koerper" role=${e.leer?v:`table`} tabindex="-1">
      ${e.zeigeKopf?g`<div class="kopf" role="row" style=${W(e.cols)}>
        ${e.mitGriff?ba():v}
        ${e.spalten.map((n,r)=>g`<div
            class=${H(n.art).klasse}
            role="columnheader"
            data-ff-editable
            @dblclick=${e=>t.dblklickKopf(e,r)}
            @click=${e=>t.klickKopf(e,r)}
          >${n.titel}${!e.editable&&e.sortSpalte===r?g`<span class="sort-pfeil">${e.sortAuf?` ▲`:` ▼`}</span>`:``}</div>`)}
      </div>`:v}
        ${``}
        ${e.leer?ia(e.leerText,!0):g`
        ${e.erfassungsZeilen}
        ${e.zeilen.map((n,r)=>{let i=n!==null&&!e.imEditor;return g`<div
            class="zeile${n===null?` ohne-satz`:``}${n!==null&&e.hatQuelle?` waehlbar`:``}${n!==null&&n===e.auswahlIndex?` gewaehlt`:``}"
            role="row"
            data-ff-roh=${n??v}
            tabindex=${i?`0`:v}
            aria-selected=${e.auswahlSemantik&&n!==null?String(n===e.auswahlIndex):v}
            style=${W(e.cols)}
            @click=${()=>t.aktiviereZeile(n,r)}
            @keydown=${e=>{e.key===`Enter`&&(e.preventDefault(),t.aktiviereZeile(n,r))}}
          >
            ${e.mitGriff?ya({nummer:n===null?null:e.griffAb+r+1,aktiv:!1}):v}
            ${e.spalten.map((i,a)=>{let o=H(i.art),s=n===null?`—`:e.datenzeilen[n]?.[a]??``,c=n===null?{}:e.zusatzzeilen[n]?.[a]??{},l=e.imEditor&&!e.zeigeKopf&&e.editable,u=e.imEditor&&!e.zeigeKopf&&r===0;return g`<div
                class=${o.klasse}
                role="cell"
                data-ff-editable=${l?``:v}
                @click=${l?e=>t.klickKopf(e,a):v}
              >${u?g`<span class="spalten-name">${i.titel}</span>`:o.zelle(s,i.zuordnung??[],c)}</div>`})}
          </div>`})}
        ${Co(e)}`}
      </div>
    `}var To=o`
      :host { min-width: 0; height: 100%; }

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

      .suchzeile {
        padding: 5px 8px;
        border-bottom: var(--se-border) solid var(--se-line);
        background: var(--se-panel-2);
      }
      .suchzeile input {
        box-sizing: border-box;

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

      .kopf {
        display: grid;
        height: var(--takt);
        box-sizing: border-box;
      }
      .zeile {
        display: grid;
        height: var(--zeilen-hoehe);
        box-sizing: border-box;
      }

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

      .koerper {
        flex: 1 1 auto;
        overflow: auto;
        display: flex;
        flex-direction: column;
      }

      .koerper > .zeile { flex: none; }

      .lineal {
        flex: 1 1 auto;
        min-height: 0;

        background-image:
          repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(var(--zeilen-hoehe) - 1px),
            var(--se-line-soft) calc(var(--zeilen-hoehe) - 1px),
            var(--se-line-soft) var(--zeilen-hoehe)
          );
        background-position: 0 0;

        display: grid;
      }

      .koerper > .leer--tafel {
        flex: 1 1 auto;
        align-content: center;
      }
      .lineal > div { border-right: 1px solid var(--se-line-soft); }
      .lineal > div:last-child { border-right: none; }

      .zeile {
        border-bottom: 1px solid var(--se-line-soft);
        background: var(--se-panel);
        transition: background-color var(--se-move);
      }

      /* Eine Zeile ohne Satz traegt KEINEN Grund — sie sieht aus wie das
         Lineal darunter, nur mit Strichen in den Zellen. So macht es
         SoftEngine auch: leere Zeilen heben sich nicht wie volle ab
         (Nutzer-Ansage 2026-08-20). */
      .zeile.ohne-satz,
      .koerper > .zeile.ohne-satz:hover {
        background: transparent;
      }

      .koerper > .zeile:hover {
        background: var(--se-bg);
      }

      .koerper > .zeile.waehlbar { cursor: pointer; }

      .koerper:focus { outline: none; }
      .koerper > .zeile:focus {
        outline: var(--se-border) solid var(--se-accent);
        outline-offset: calc(-1 * var(--se-border));
      }
      .koerper > .zeile:focus:not(:focus-visible) { outline: none; }

      .zeile.gewaehlt,
      .koerper > .zeile.gewaehlt:hover {
        background: var(--se-amber-soft);
        box-shadow: inset 3px 0 0 var(--se-accent);
      }
      .zeile.gewaehlt > div { color: var(--se-ink); }
      .kopf > div,
      .zeile > div {
        padding: 0 10px;
        line-height: calc(var(--zeilen-hoehe) - 1px);
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-right: 1px solid var(--se-line-soft);
      }

      .kopf > div { line-height: calc(var(--takt) - 1px); }
      .kopf > div:last-child,
      .zeile > div:last-child { border-right: none; }
      .kopf > div { cursor: pointer; user-select: none; }
      .sort-pfeil { font-size: 9px; color: var(--se-muted); }

      .zeile > div { color: var(--se-ink); }

      .kopf > div.zahl,
      .zeile > div.zahl {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .zeile > div.status {
        display: flex;
        align-items: center;
      }

      .zeile > div.bild {
        display: flex;
        align-items: center;
      }
      .bild-name {
        display: flex;
        align-items: center;

        gap: var(--se-gap);
        min-width: 0;
      }

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

        object-fit: contain;
      }
      .bild-text { min-width: 0; }

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

      /* Schlank: keine Kopfzeile und engere Polster — mehr nicht. Der
         Tafel-Rahmen BLEIBT (Nutzer-Ansage 2026-08-20): ohne ihn franste die
         Tabelle auf der Maske aus. Bis dahin nahm schlank hier auch
         border: 0 und background: transparent. */
      .tabelle.schlank .kopf > div,
      .tabelle.schlank .zeile > div { padding: 0 6px; }
      .tabelle.schlank .suchzeile { padding: 4px 6px; }

      /* Der Spaltenname, wo es keine Kopfzeile gibt: in der ersten Zeile des
         Editors und in der leeren Erfassungszelle. Dieselbe Farbe wie der
         Platzhalter der Eingabe, damit im Editor dasselbe zu lesen ist wie
         spaeter in der Maske. */
      .spalten-name {
        color: var(--se-faint);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

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

      .seiten-nav button {
        box-sizing: border-box;
        height: 22px;
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

      /* Der Zeilengriff: die Nummernspalte links. Es gibt sie nur mit
         Erfassung (s. zeilenGriff), und sie ist der GRIFF der Zeile — die
         Demo des Nutzers zeigt daran, welche Zeile gemeint ist. Zweistellige
         Nummer mit Tabellenziffern, damit die Spalte nicht springt. */
      .kopf > div.griff,
      .zeile > div.griff,
      .lineal > div.griff {
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--se-fs-xs);
        font-variant-numeric: tabular-nums;
        color: var(--se-faint);
        background: var(--se-panel-2);
        border-right: var(--se-border) solid var(--se-line);
        user-select: none;
      }
      /* Der Kopf hat oben links nichts zu klicken: sonst zeigte der Zeiger
         dort eine Sortierung an, die es nicht gibt. */
      .kopf > div.griff { cursor: default; }
      .zeile.erfassung > div.griff { cursor: pointer; }
      .zeile.erfassung > div.griff.aktiv {
        color: var(--se-accent);
        background: var(--se-accent-soft);
        font-weight: 600;
      }

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
`,Eo=`ff-zeile-aktiviert`,Do=`data-ff-roh`;function Oo(e,t){e.dispatchEvent(new CustomEvent(Eo,{detail:t,bubbles:!0,composed:!0}))}function ko(e){let t=e?.activeElement;if(!(t instanceof HTMLElement))return;let n=t.closest(`.zeile`);if(!n)return;let r=n.getAttribute(Do);return r===null||r===``?null:Number(r)}function Ao(e,t){e&&((t===null?null:e.querySelector(`.zeile[data-ff-roh="${t}"]`))??e.querySelector(`.zeile[data-ff-roh]`)??e.querySelector(`.koerper`))?.focus()}var K=class e extends T{constructor(...e){super(...e),this.spalten=Gi(),this.source=``,this.suche=`ja`,this.erfassung=`nein`,this.schlank=`nein`,this.leerText=na,this._suchtext=``,this.datenzeilen=[],this.zusatzzeilen=[],this.rohzeilen=[],this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this.datenGeliefert=!1,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._mass=null,this._beobachter=null,this._taktGemessen=0,this._fokusZeile=null,this._fokusHolen=!1,this._besitz=`softengine`,this._erfassung=new Ia}static{this.blockType=`tabelle`}static{this.tagName=`ff-tabelle`}static{this.displayName=`Tabelle`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.kannErfassen={wenn:{attributeName:`erfassung`,equals:`ja`}}}static{this.blockEvents=[{key:`onRowClick`,name:`Zeile gewählt`}]}static{this.listenBindung=ao}static{this.defaultProps={width:`fill`,source:``,spalten:Gi(),suche:`ja`,erfassung:`nein`,schlank:`nein`,tagField:``,leerText:na}}static{this.customProperties=xo}static{this.raster={startW:14,startH:8,minW:6,minH:4}}get zeigtKopf(){return yo(this.schlank)}get besitz(){return this._besitz}set besitz(e){e!==this._besitz&&(this._besitz=e,this.setzeAbgeleitetesZurueck(),this.isConnected&&(e===`provided`?qa(this):Ka(this)),this.requestUpdate())}set bereitgestellteZeilen(e){let t=Ra(e);this.rohzeilen=t.rohzeilen,this.datenzeilen=t.datenzeilen,this.zusatzzeilen=t.zusatzzeilen,this.datenGeliefert=!0,this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._seite=0,this._mass=null,this._taktGemessen=0,this.requestUpdate()}setzeAbgeleitetesZurueck(){this.rohzeilen=[],this.datenzeilen=[],this.zusatzzeilen=[],this.datenGeliefert=!1,this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._suchtext=``,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._mass=null,this._taktGemessen=0,this._fokusZeile=null,this._fokusHolen=!1,this._erfassung.zuruecksetzen()}get erfassteSaetze(){return this._erfassung.saetze(this.erfassungsUmfeld())}get erfassteQuellen(){return this.erfassungAn?Fa(this.erfassungsUmfeld()):[]}erfassungLeeren(){this._erfassung.leeren()&&this.requestUpdate()}fokussiereSuche(){let e=this.shadowRoot?.querySelector(`.suchzeile input`);return e?(e.focus(),!0):!1}get hatQuelle(){return this._besitz===`provided`||Ya(this.hasAttribute(`data-ff-editor`),this.source)}merkeZeilenFokus(){let e=ko(this.shadowRoot);this._fokusHolen=e!==void 0,this._fokusZeile=e??null}messeRumpf(){let e=this.zeilenHoehe;this._taktGemessen=e;let t=oa(this,e);t?.passen===this._mass?.passen&&t?.zeilenHoehe===this._mass?.zeilenHoehe||(this._mass=t,this.requestUpdate())}spaltenListe(){return Yi(this.spalten)}get zeilenHoehe(){return Li(this.spaltenListe())}aktiviereZeile(e,t){if(e===null||this.hasAttribute(`data-ff-editor`))return;let n=this.rohzeilen[e];n!==void 0&&(Oo(this,{rohzeile:n,rohIndex:e,ansichtIndex:t}),this.toggleAuswahl(n),z(this,`onRowClick`,{PINDEX:Ua(this,n)}).catch(mr))}toggleAuswahl(e){let t=M(this);t!==``&&Xt(t,e)}setzeSuchtext(e){this.merkeZeilenFokus(),this._suchtext=e,this._seite=0,this.requestUpdate()}klickSortiere(e){if(this.editable)return;this.merkeZeilenFokus();let t=bo(this._sortSpalte,this._sortAuf,e);this._sortSpalte=t.spalte,this._sortAuf=t.auf,this._seite=0,this.requestUpdate()}get erfassungAn(){return this.erfassung===`ja`}fussNoetig(e){return e>1||this._suchtext.trim()!==``||this.durchAuswahlGefiltert}erfassungsWirt(){return{baustein:this,anschluss:this._erfassung,umfeld:()=>this.erfassungsUmfeld(),melde:()=>this.requestUpdate(),fokussiere:(e,t)=>this.fokussiereZelle(e,t)}}fokussiereZelle(e,t){this.updateComplete.then(()=>{let n=this.shadowRoot?.querySelector(`.zeile.erfassung[data-erf-zeile="${e}"] .erf-eingabe[data-spalte="${t}"]`);n?.focus(),n?.select()})}erfassungsUmfeld(){return this._erfassung.umfeld(this,this.spaltenListe(),this.source)}aendere(e){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`spalten`,value:e},bubbles:!0,composed:!0}))}beobachte(){this._beobachter||(this._beobachter=sa(this,()=>this.messeRumpf()),this._beobachter&&this.messeRumpf())}connectedCallback(){super.connectedCallback(),this._besitz===`softengine`&&Ka(this),this.beobachte()}firstUpdated(){this.beobachte()}willUpdate(e){super.willUpdate(e),!(!this.erfassungAn||this.hasAttribute(`data-ff-editor`))&&this._erfassung.haltVorschlaegeAktuell(this.erfassungsUmfeld())}updated(){this._taktGemessen!==this.zeilenHoehe&&this.messeRumpf(),this._fokusHolen&&(this._fokusHolen=!1,Ao(this.shadowRoot,this._fokusZeile))}disconnectedCallback(){super.disconnectedCallback(),ro(this),this._beobachter?.disconnect(),this._beobachter=null,Jo(this),qa(this)}static{this.styles=[T.styles,Er,aa,To,Zr,La]}render(){let t=this.spaltenListe(),n=e=>e.stopPropagation(),r=vo({spalten:t,hatQuelle:this.hatQuelle,datenGeliefert:this.datenGeliefert,datenzeilen:this.datenzeilen,suchtext:this._suchtext,sortSpalte:this._sortSpalte,sortAuf:this._sortAuf,wunschSeite:this._seite,gemessen:this._mass,erfassungsZeilen:this.erfassungAn?this._erfassung.anzahl:0});return g`<div class=${this.schlank===`ja`?`tabelle schlank`:`tabelle`} style=${W({"--takt":`${r.takt}px`,"--zeilen-hoehe":`${r.zeilenHoehe}px`})}>
      ${Qa(()=>this.spaltenListe(),e=>this.aendere(e),n)}
      ${wo({spalten:t,cols:r.cols,editable:this.editable,imEditor:this.hasAttribute(`data-ff-editor`),zeigeKopf:this.zeigtKopf,auswahlSemantik:M(this)!==``,zeigeSuche:this.suche===`ja`,suchtext:this._suchtext,sortSpalte:this._sortSpalte,sortAuf:this._sortAuf,zeilen:r.zeilen,linealTakte:r.linealTakte,datenzeilen:this.datenzeilen,zusatzzeilen:this.zusatzzeilen,hatQuelle:r.hatQuelle,auswahlIndex:this.auswahlIndex,leer:r.leer,leerText:this.leerText,erfassungsZeilen:this.erfassungAn?Aa(this.erfassungsWirt(),r.cols,!1,this.hasAttribute(`data-ff-editor`)&&this.editable&&!this.zeigtKopf?(t,n)=>io(this,t,{prop:e.listenBindung.prop,index:n,liste:()=>this.spaltenListe()}):void 0):[],mitGriff:this.erfassungAn,griffAb:this.erfassungAn?this._erfassung.anzahl:0},{setzeSuchtext:e=>this.setzeSuchtext(e),dblklickKopf:(e,t)=>{this.editable&&(ro(this),eo(e,t,()=>this.spaltenListe(),e=>this.aendere(e)))},klickKopf:(t,n)=>{this.editable&&io(this,t,{prop:e.listenBindung.prop,index:n,liste:()=>this.spaltenListe()}),this.klickSortiere(n)},aktiviereZeile:(e,t)=>this.aktiviereZeile(e,t)})}
      ${``}
      ${r.leer||!this.fussNoetig(r.seiten)?v:So({hatQuelle:r.hatQuelle,sichtbar:r.gesamt,gesamt:this.datenzeilen.length,suchtAktiv:this._suchtext.trim()!==``,auswahlAktiv:this.durchAuswahlGefiltert,seite:r.seite,seiten:r.seiten},{blaettere:e=>{this.merkeZeilenFokus(),this._seite=e,this.requestUpdate()}})}
    </div>`}};w([S({converter:{fromAttribute:e=>e?Xi(e):Gi(),toAttribute:e=>JSON.stringify(e)}})],K.prototype,`spalten`,void 0),w([S()],K.prototype,`source`,void 0),w([S()],K.prototype,`suche`,void 0),w([S()],K.prototype,`erfassung`,void 0),w([S()],K.prototype,`schlank`,void 0),w([S()],K.prototype,`leerText`,void 0),w([S({attribute:!1})],K.prototype,`datenzeilen`,void 0),w([S({attribute:!1})],K.prototype,`zusatzzeilen`,void 0),w([S({attribute:!1})],K.prototype,`rohzeilen`,void 0),w([S({attribute:!1})],K.prototype,`auswahlIndex`,void 0),w([S({attribute:!1})],K.prototype,`durchAuswahlGefiltert`,void 0),w([S({attribute:!1})],K.prototype,`datenGeliefert`,void 0),T.defineAndRegister(K);function jo(e){return g`<div class="nachschlag">
    <input
      class="ctrl"
      type="text"
      .value=${e.wert}
      @input=${t=>e.onTippen(t.target.value)}
      @keydown=${e.onTaste}
      @blur=${()=>e.onVerlassen()}
    />
    <button
      class="lupe"
      type="button"
      aria-label="Nachschlagen"
      title="Nachschlagen"
      @click=${()=>e.onLupe()}
    >${wi()}</button>
    ${e.liste}
  </div>`}var Mo={prop:`nachschlagSpalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:Ui,quelleProp:`nachschlagQuelle`};function No(e){if(typeof e==`string`)try{e=JSON.parse(e)}catch{return[]}return Array.isArray(e)&&e.length>0?Yi(e):[]}function Po(e,t){let n=e[0];return n===void 0?t:n.feld}function Fo(e,t){let n=e.trim();return n===``||n===t.trim()}function Io(e,t,n){let r=t.trim(),i=[],a=Fo(t,n)||n.trim()===``,o=new Set;for(let t of e){let e=k(t,n).trim(),s=r===``?e:k(t,r).trim();if(!(s===``&&e===``)){if(a){let t=e===``?s:e;if(o.has(t))continue;o.add(t)}i.push({anzeige:s,wert:e,satz:t})}}return i}function Lo(e,t,n,r){return Io(nn(e,t).rows,n,r)}function Ro(e){let t=O(F().FF_DATA_SOURCES,e);return t?Pt(F().SEDATA,t.name,t.tableId):null}function zo(e){if(e.quelleId===``||e.speicherFeld===``)return{ok:!1,grund:`unvollstaendig`};let t=Ro(e.quelleId);if(t===null)return{ok:!1,grund:`quelleFehlt`};let n=Po(No([...e.spalten]),e.speicherFeld);return{ok:!0,eintraege:Lo(e.el,t,n,e.speicherFeld)}}function Bo(e,t){return t&&e.length===1?e[0]:null}function Vo(e,t){let{rows:n,gefiltert:r}=nn(e,[t]);return!r||n.length>0}function Ho(e,t,n){return e===``?t===``&&n===``?`nichts`:`leeren`:e===t?`nichts`:`zurueck`}var Uo=null,Wo=null,Go=null;function Ko(e){return e.shadowRoot?.querySelector(`.lupe`)??null}function qo(e=!0){let t=e?Go:null;Go=null,Uo?.remove(),Uo=null,Wo=null,t?.focus()}function Jo(e){Wo===e&&qo(!1)}function Yo(e){return[{titel:e.speicherTitel===``?`Wert`:e.speicherTitel,feld:e.speicherFeld,art:V}]}function Xo(e){let t=e=>e.stopPropagation(),n=e.editor;return g`<ff-dialog-rahmen
    viewport
    escape-schliesst
    ohne-modal
    inhalt-fest
    ?ziehbar=${n!==void 0}
    ?data-ff-nachschlagen=${n===void 0}
    style=${n===void 0?v:`z-index:40`}
    .titel=${e.titel===``?`Nachschlagen`:e.titel}
    .breite=${e.breite}
    .hoehe=${e.hoehe}
    @ff-dialog-groesse=${n===void 0?v:e=>{e.stopPropagation(),n.onGroesse(e.detail)}}
    @ff-dialog-schliessen=${t=>{n!==void 0&&t.stopPropagation(),e.onSchliessen()}}
    @click=${t}
    @pointerdown=${n===void 0?v:t}
    @dblclick=${n===void 0?v:t}
  >${e.inhalt}</ff-dialog-rahmen>`}function Zo(e,t){let n=No([...e.spalten]),r=Fo(Po(n,e.speicherFeld),e.speicherFeld);return g`<ff-tabelle
    fuellt
    suche="ja"
    style="--se-r-lg:0px"
    .besitz=${`provided`}
    .spalten=${n.length>0?n:Yo(e)}
    .leerText=${`Diese Quelle hat keine Sätze.`}
    .bereitgestellteZeilen=${t.map(e=>({rohzeile:e.satz,zellen:n.length>0?n.map(t=>t.feld===``?``:k(e.satz,t.feld)):r?[e.wert]:[e.anzeige,e.wert]}))}
  ></ff-tabelle>`}function Qo(e){let t=e.eintraege;if(t===void 0){let n=zo(e);if(!n.ok){P(n.grund===`unvollstaendig`?`Nachschlagen braucht an diesem Feld eine Quelle und „Gespeichert wird".`:`Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.`);return}t=n.eintraege}qo(!1);let n=document.createElement(`div`);n.style.display=`contents`,Ue(Xo({titel:e.titel,breite:e.breite,hoehe:e.hoehe,inhalt:Zo(e,t),onSchliessen:()=>qo()}),n);let r=n.querySelector(ir),i=n.querySelector(K.tagName);i?.addEventListener(Eo,n=>{let r=n.detail,i=t[r.rohIndex];i&&(qo(),e.onUebernehmen(i.anzeige,i.wert,i.satz))}),Go=e.rueckFokus??Ko(e.el),document.body.appendChild(n),Uo=n,Wo=e.el,r&&i&&Promise.all([r.updateComplete,i.updateComplete]).then(()=>{r.isConnected&&i.fokussiereSuche()})}function $o(e){return Xo({titel:e.titel,breite:e.breite,hoehe:e.hoehe,onSchliessen:e.onSchliessen,editor:{onGroesse:e.onGroesse},inhalt:g`<ff-tabelle
      data-ff-editor
      fuellt
      suche="ja"
      style="--se-r-lg:0px"
      .spalten=${[...e.spalten]}
      .editable=${!0}
      @ff-prop-change=${t=>{t.stopPropagation();let n=t.detail;n?.attr===`spalten`&&e.onAendern(Yi(n.value))}}
      @ff-listen-bind=${t=>{t.stopPropagation();let n=t.detail;typeof n?.index==`number`&&e.onFeldWahl({index:n.index,top:n.top??0,left:n.left??0,...n.ausloeser instanceof Element?{ausloeser:n.ausloeser}:{},...Array.isArray(n.liste)?{liste:n.liste}:{}})}}
    ></ff-tabelle>`})}var es=[`J`,`1`,`X`,`TRUE`];function ts(e){return es.includes(e.trim().toUpperCase())}function ns(e){return e?`J`:`N`}function rs(e){return g`<div class="feld">
    <div class="zeile" data-ff-spot="value" ?data-ff-bound=${e.gebunden}>
      <input
        class="ctrl"
        type="checkbox"
        .checked=${e.angehakt}
        @change=${t=>e.onAendern(t.target.checked)}
      />
      ${e.text}
    </div>
  </div>`}function is(e){let t=e.optionen.split(`,`).map(e=>e.trim()).filter(e=>e!==``),n=e.wert!==``&&!t.includes(e.wert);return g`<select
    class="ctrl"
    .value=${e.wert}
    @input=${e.onInput}
    @change=${e.onChange}
  >
    <option value="" disabled hidden></option>
    ${n?g`<option value=${e.wert} hidden>${e.wert}</option>`:v}
    ${t.length===0?g`<option disabled>(keine Optionen)</option>`:t.map(e=>g`<option value=${e}>${e}</option>`)}
  </select>`}function as(e){return g`<textarea
    class="ctrl"
    .value=${e.wert}
    @input=${e.onInput}
    @change=${e.onChange}
  ></textarea>`}function os(e){return g`<input
    class="ctrl"
    type=${e.typ}
    .value=${e.typ===`date`?ui(e.wert):e.wert}
    @input=${e.onInput}
    @change=${e.onChange}
    @focus=${()=>e.onFokus(!0)}
    @blur=${()=>e.onFokus(!1)}
  />`}var q=class e extends T{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``,this.nachschlagQuelle=``,this.speicherFeld=``,this.speicherTitel=``,this.nachschlagSpalten=[],this.fensterBreite=520,this.fensterHoehe=380,this.einzigerTreffer=`nein`,this.spaltenDialog=!1,this.anzeige=``,this.getippt=null,this.marke=0,this.listeZu=!1,this.vorschlaege=[],this.satz=void 0,this.imSteuerelement=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource={wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`}}}static{this.satzWahl={quelleProp:`nachschlagQuelle`,wenn:{attributeName:`fieldType`,equals:`nachschlagen`}}}static{this.listenBindung=Mo}static{this.bindableSpots=[{prop:`value`,label:`Wert`,wenn:{attributeName:`fieldType`,keinesVon:[`nachschlagen`]},vorschauProp:`placeholder`}]}static{this.actionValueSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``,nachschlagQuelle:``,speicherFeld:``,speicherTitel:``,nachschlagSpalten:[],fensterBreite:520,fensterHoehe:380,einzigerTreffer:`nein`}}static{this.raster={startW:6,startH:2,minW:2,minH:2}}static{this.customProperties=ei}static{this.styles=[T.styles,yi,Zr]}onInput(e){let t=e.target;this.value=xi(this.fieldType)===`date`?di(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return g`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){this.hasAttribute(`data-ff-editor`)||this.setzeHaken(!this.angehakt)}get angehakt(){return ts(this.value)}setzeHaken(e){let t=ns(e);this.value!==t&&(this.value=t,this.dispatchEvent(new Event(`change`)))}controlTpl(e){switch(e){case`textarea`:return as({wert:this.value,onInput:this.onInput,onChange:this.onChange});case`select`:return is({wert:this.value,optionen:this.options,onInput:this.onInput,onChange:this.onChange});case`nachschlagen`:return jo({wert:this.getippt??this.anzeige,onTippen:e=>{this.getippt=e,this.marke=0,this.listeZu=!1},onTaste:e=>this.onNachschlagTaste(e),onVerlassen:()=>this.onNachschlagVerlassen(),onLupe:()=>this.onLupe(),liste:this.vorschlaege.length===0?v:Xr({eintraege:this.vorschlaege,marke:this.marke,onWaehlen:e=>this.uebernimmVorschlag(e),onMarke:e=>{this.marke=e}})});default:return os({typ:e,wert:this.value,onInput:this.onInput,onChange:this.onChange,onFokus:e=>{this.imSteuerelement=e}})}}onLupe(){if(this.hasAttribute(`data-ff-editor`)){this.spaltenDialog=!0;return}Qo({el:this,quelleId:this.nachschlagQuelle,speicherFeld:this.speicherFeld,speicherTitel:this.speicherTitel,spalten:this.nachschlagSpalten,titel:this.placeholder,breite:this.fensterBreite,hoehe:this.fensterHoehe,onUebernehmen:(e,t,n)=>this.uebernimmUndMelde(e,t,n)})}spaltenEffektiv(){let e=No(this.nachschlagSpalten);return e.length>0?e:Yo({speicherFeld:this.speicherFeld,speicherTitel:this.speicherTitel})}meldeProp(e,t,n){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:e,value:t,...n===void 0?{}:{geste:n}},bubbles:!0,composed:!0}))}spaltenDialogTpl(){return $o({titel:this.placeholder,spalten:this.spaltenEffektiv(),breite:this.fensterBreite,hoehe:this.fensterHoehe,onGroesse:t=>{let n=t.achse===`breite`?`fensterBreite`:`fensterHoehe`;if(t.geste===`standard`){this.meldeProp(n,e.defaultProps[n]);return}this.meldeProp(n,t.wert,t.geste===`laeuft`?void 0:t.geste)},onAendern:e=>{this.meldeProp(`nachschlagSpalten`,e)},onFeldWahl:e=>{this.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:`nachschlagSpalten`,...e},bubbles:!0,composed:!0}))},onSchliessen:()=>{this.spaltenDialog=!1}})}willUpdate(e){super.willUpdate(e),e.has(`fieldType`)&&xi(this.fieldType)!==`nachschlagen`&&(this.spaltenDialog=!1),this.vorschlaege=this.berechneVorschlaege(),this.marke=Jr(this.marke,this.vorschlaege.length)}updated(e){super.updated(e),this.toggleAttribute(`data-ff-liste`,this.vorschlaege.length>0)}berechneVorschlaege(){if(this.getippt===null||this.listeZu||xi(this.fieldType)!==`nachschlagen`||this.hasAttribute(`data-ff-editor`))return[];let e=zo({el:this,quelleId:this.nachschlagQuelle,speicherFeld:this.speicherFeld,spalten:this.nachschlagSpalten});return e.ok?Kr(e.eintraege,this.getippt):[]}onNachschlagTaste(e){if(this.hasAttribute(`data-ff-editor`))return;let t=this.vorschlaege.length,n=Yr(e.key,{listeOffen:t>0,feldLeer:(this.getippt??this.anzeige)===``});if(n===`nichts`){e.key===`Enter`&&e.preventDefault();return}e.preventDefault(),n===`marke-hoch`?this.marke=qr(this.marke,t,-1):n===`marke-runter`?this.marke=qr(this.marke,t,1):n===`uebernehmen`?this.uebernimmVorschlag(this.marke):n===`liste-zu`?this.listeZu=!0:this.onLupe()}uebernimmVorschlag(e){let t=this.vorschlaege[e];t&&this.uebernimmUndMelde(t.anzeige,t.wert,t.satz)}leereNachschlagen(){this.satz=void 0,this.anzeige=``,this.value=``,Qt(M(this))}uebernimmUndMelde(e,t,n){this.getippt=null,this.listeZu=!1,this.marke=0,this.uebernimmSatz(e,t,n),this.dispatchEvent(new Event(`change`))}uebernimmSatz(e,t,n){this.anzeige=e===``?t:e,this.value=t,this.satz=n,Zt(M(this),n)}onNachschlagVerlassen(){if(this.hasAttribute(`data-ff-editor`))return;let e=Ho(this.getippt??this.anzeige,this.anzeige,this.value);this.getippt=null,this.listeZu=!1,this.marke=0,e===`leeren`&&(this.leereNachschlagen(),this.dispatchEvent(new Event(`change`)))}pruefeEigenenWert(){xi(this.fieldType)===`nachschlagen`&&(this.getippt!==null&&this.requestUpdate(),this.satz!==void 0&&!Vo(this,this.satz)&&this.leereNachschlagen(),this.uebernimmEinzigenTreffer())}uebernimmEinzigenTreffer(){if(this.einzigerTreffer!==`ja`)return;let e=zo({el:this,quelleId:this.nachschlagQuelle,speicherFeld:this.speicherFeld,spalten:this.nachschlagSpalten});if(!e.ok)return;let t=Bo(e.eintraege,this.satz===void 0);t&&this.uebernimmSatz(t.anzeige,t.wert,t.satz)}render(){let e=xi(this.fieldType);if(e===`checkbox`)return rs({angehakt:this.angehakt,gebunden:this.valueField!==``,onAendern:e=>this.setzeHaken(e),text:this.textTpl(`text`)});let t=e!==`nachschlagen`,n=(t?this.value:this.getippt??this.anzeige)===``;return g`<div class="feld">
      <div
        class=${`huelle${n?` leer`:``}${this.imSteuerelement?` tippt`:``}`}
        data-ff-spot=${t?`value`:v}
        ?data-ff-bound=${t&&this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${Si.includes(e)?this.textTpl(`ph ${Ci[e]??``}`.trim(),!n):v}
      </div>
      ${this.spaltenDialog&&this.hasAttribute(`data-ff-editor`)?this.spaltenDialogTpl():v}
    </div>`}connectedCallback(){super.connectedCallback(),_i(this)}disconnectedCallback(){super.disconnectedCallback(),vi(this),Jo(this)}};w([S()],q.prototype,`fieldType`,void 0),w([S()],q.prototype,`placeholder`,void 0),w([S()],q.prototype,`options`,void 0),w([S()],q.prototype,`source`,void 0),w([S()],q.prototype,`value`,void 0),w([S()],q.prototype,`valueField`,void 0),w([S()],q.prototype,`nachschlagQuelle`,void 0),w([S()],q.prototype,`speicherFeld`,void 0),w([S()],q.prototype,`speicherTitel`,void 0),w([S({converter:{fromAttribute:e=>No(e??``),toAttribute:e=>JSON.stringify(e)}})],q.prototype,`nachschlagSpalten`,void 0),w([S({type:Number})],q.prototype,`fensterBreite`,void 0),w([S({type:Number})],q.prototype,`fensterHoehe`,void 0),w([S()],q.prototype,`einzigerTreffer`,void 0),w([C()],q.prototype,`spaltenDialog`,void 0),w([C()],q.prototype,`anzeige`,void 0),w([C()],q.prototype,`getippt`,void 0),w([C()],q.prototype,`marke`,void 0),w([C()],q.prototype,`listeZu`,void 0),w([C()],q.prototype,`imSteuerelement`,void 0),T.defineAndRegister(q);var ss=`ziel`,cs=o`
  :host([data-ff-ziel]) .ziel {
    background: var(--se-accent-soft);
    outline: var(--se-border) solid var(--se-accent);
    outline-offset: calc(-1 * var(--se-border));
  }
`,ls=o`
  ::slotted(:not([hat-reiter])) { margin-top: 24px; }
  slot { display: contents; }
`,us=`frei · hierher ziehen`,ds=`ff-zimmer-inhalt`,J=class extends T{constructor(...e){super(...e),this.heading=`Neues Zimmer`,this.leerHinweis=``}static{this.blockType=`kanban-zimmer`}static{this.tagName=`ff-kanban-zimmer`}static{this.displayName=`Kanban-Zimmer`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[B.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={heading:`Neues Zimmer`}}static{this.styles=[T.styles,aa,ls,cs,o`
      :host { display: block; }

      .kopf {
        padding: 2px 2px 0;
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--se-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .body {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .zimmer {
        border-radius: var(--se-r-md);
      }
    `]}onSlotChange(){this.dispatchEvent(new CustomEvent(ds,{bubbles:!0,composed:!0}))}render(){return g`<div class="zimmer ${ss}">
      <div
        class="kopf"
        data-ff-editable
        @dblclick=${e=>this.inlineEdit(e,`heading`)}
      >${this.heading}</div>
      <div class="body">
        <slot @slotchange=${this.onSlotChange}></slot>
        ${ia(this.leerHinweis)}
      </div>
    </div>`}};w([S()],J.prototype,`heading`,void 0),w([S({attribute:!1})],J.prototype,`leerHinweis`,void 0),T.defineAndRegister(J);var Y=class extends T{static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[B.blockType,J.blockType]}static{this.addChildButton={label:`Zimmer`,childType:J.blockType}}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`,zimmerField:``}}static{this.customProperties=[Tr(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),Qr(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte landen sie in der ersten Spalte.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0}),{attributeName:`zimmerField`,name:`Unterteilen nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welches Zimmer dieser Spalte ein Eintrag kommt. Wirkt erst, wenn die Spalte Zimmer hat.`,kind:`field`}]}static{this.styles=[T.styles,aa,ls,cs,o`

      :host {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }

      .col {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        background: var(--col-soft);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }

      .col.v-info { --col-strong: var(--se-blue); --col-soft: var(--se-blue-soft); }
      .col.v-success { --col-strong: var(--se-green); --col-soft: var(--se-green-soft); }
      .col.v-warning { --col-strong: var(--se-amber); --col-soft: var(--se-amber-soft); }
      .col.v-danger { --col-strong: var(--se-red); --col-soft: var(--se-red-soft); }

      .head {
        flex: none;
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 10px 12px;
      }

      .dot {
        flex: none;
        width: 8px;
        height: 8px;
        background: var(--col-strong);
      }

      .title {
        color: var(--se-ink);
        font-size: var(--se-fs);
        font-weight: 600;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .count {
        margin-left: auto;
        min-width: 22px;
        padding: 1px 8px;
        line-height: 1;
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        border: var(--se-border) solid var(--col-strong);
        text-align: center;
        font-family: var(--se-mono);
        font-size: var(--se-fs-sm);
        font-weight: 600;
        color: var(--se-ink);
      }

      .body {
        padding: 0 10px 12px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }

    `]}constructor(){super(),this.variant=`info`,this.heading=`Neue Spalte`,this.leerHinweis=``,this._count=0,this.addEventListener(ds,()=>this.zaehle())}zaehle(){this._count=Array.from(this.querySelectorAll(B.tagName)).filter(e=>!e.hasAttribute(`data-ff-editor-helper`)).length}render(){return g`<div class="col ${ss} v-${Cr(this.variant)}">
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
        <slot @slotchange=${this.zaehle}></slot>
        ${ia(this.leerHinweis)}
      </div>
    </div>`}};w([S()],Y.prototype,`variant`,void 0),w([S()],Y.prototype,`heading`,void 0),w([S({attribute:!1})],Y.prototype,`leerHinweis`,void 0),w([C()],Y.prototype,`_count`,void 0),T.defineAndRegister(Y);function fs(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function ps(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var ms=new WeakMap,hs=Y.tagName,gs=J.tagName,_s=B.tagName;function vs(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===hs)}function ys(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===_s)}function bs(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===gs)}function xs(e){return[e,...bs(e)]}function Ss(e,t){let n=e.getAttribute(`leertext`)??`Keine Datensätze.`,r=(e,t)=>{e.leerHinweis=t};for(let e of t){let t=bs(e);for(let e of t)r(e,ys(e).length===0?us:``);r(e,t.length===0&&ys(e).length===0?n:``)}}function Cs(e){return Xe().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function ws(e,t){let n=bs(e);if(n.length===0)return null;let r=e.getAttribute(`zimmerfield`)??``;if(r===``)return n[0];let i=n.map(e=>e.getAttribute(`heading`)??J.defaultProps.heading),a=fs(k(t,r),i);return a>=0?n[a]:n[0]}function Ts(e){Z?.board===e&&js();let t=e.getAttribute(`statusfield`)??``,n=Ba(e);if(!n)return;let r=vs(e);if(r.length===0)return;let i=ms.get(e);if(!i){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(_s);t&&(i=t.cloneNode(!0),ms.set(e,i))}if(!i)return;let a=n.zeilen,o=r.map(e=>e.getAttribute(`heading`)??Y.defaultProps.heading),s=Cs(i.tagName),c=ps(r.map(e=>e.getAttribute(`auffang`))),l=n.lies;for(let e of r)for(let t of xs(e))ys(t).forEach(e=>e.remove());for(let e of a){let a=i.cloneNode(!0),u=t===``?-1:fs(k(e,t),o),d=u>=0?r[u]:c>=0?r[c]:r[0];(ws(d,e)??d).appendChild(a);for(let t of s){let n=a.getAttribute(rt(t.prop))??``;n!==``&&(a[t.prop]=l(e,n))}let ee=jt(n.quelle,e);X.set(a,{row:e,pindex:ee}),a.draggable=!0}Ss(e,r);let u=r.flatMap(e=>xs(e).flatMap(ys)),d=Yt(M(e),u,e=>X.get(e)?.row);for(let e of d)u[e].setAttribute(`data-ff-auswahl`,``)}var X=new WeakMap,Z=null,Es=new WeakSet,Ds=`data-ff-zieht`,Os=`data-ff-ziel`,ks=null;function As(e){ks!==e&&(ks?.removeAttribute(Os),ks=e,ks?.setAttribute(Os,``))}function js(){Z?.card.removeAttribute(Ds),Z=null,As(null)}function Ms(e,t,n){for(let r of t.composedPath())if(r instanceof HTMLElement&&r.tagName.toLowerCase()===n&&e.contains(r))return r;return null}function Ns(e,t){return Ms(e,t,hs)}function Ps(e,t,n){if(!Z||Z.board!==e)return;let r=X.get(Z.card);if(!r)return;let i=t.getAttribute(`heading`)??``,a=n?.getAttribute(`heading`)??``;z(e,`onCardDrop`,{PINDEX:r.pindex,VALUE:i,ZIMMER:a}).catch(mr)}function Fs(e){Es.has(e)||(Es.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&X.has(e))??null;if(!n)return;let r=X.get(n);r&&Xt(M(e),r.row),z(e,`onCardClick`,{PINDEX:r?.pindex??``}).catch(mr)}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&X.has(e))??null;n&&(Z={card:n,board:e},t.dataTransfer?.setData(`text/plain`,X.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`),setTimeout(()=>{Z?.card===n&&n.setAttribute(Ds,``)},0))}),e.addEventListener(`dragend`,js),e.addEventListener(`dragover`,t=>{let n=Ns(e,t);if(Z?.board!==e||!n){As(null);return}t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`),As(Ms(e,t,gs)??n)}),e.addEventListener(`dragleave`,t=>{let n=t.relatedTarget;(!(n instanceof Node)||!e.contains(n))&&As(null)}),e.addEventListener(`drop`,t=>{let n=Ns(e,t);n&&(t.preventDefault(),Ps(e,n,Ms(e,t,gs)),js())}))}var Is=ti({hydriere:Ts,verdrahte:Fs}),Ls=Is.connect,Rs=Is.disconnect,zs=Y.blockType,Bs=class extends T{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[zs]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:zs}}static{this.templateChild={type:B.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``,tagField:``,leerText:na}}static{this.raster={startW:24,startH:20,minW:6,minH:8}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,kind:`field`},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt das Board nur Einträge des Tages, den der Tageswähler zeigt. Leer = alle Einträge.`,kind:`field`},ra()]}static{this.defaultChildren=[{type:zs,props:{heading:`Offen`,variant:`warning`},children:[{type:B.blockType}]},{type:zs,props:{heading:`In Arbeit`,variant:`info`}},{type:zs,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[T.styles,o`

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
    `]}render(){return g`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Ls(this)}disconnectedCallback(){super.disconnectedCallback(),Rs(this)}};T.defineAndRegister(Bs);var Vs={breite:56,breiteOffen:224},Hs=`ff-seiten-wechsel`,Us=[{wert:`sonne`,name:`Sonnengelb`},{wert:`salbei`,name:`Salbeigrün`},{wert:`himmel`,name:`Himmelblau`},{wert:`flieder`,name:`Flieder`},{wert:`koralle`,name:`Koralle`}],Q=class extends T{static{this.blockType=`navi-eintrag`}static{this.ohneDaten=!0}static{this.tagName=`ff-navi-eintrag`}static{this.displayName=`Navi-Eintrag`}static{this.category=`layout`}static{this.acceptsChildren=!1}static{this.showInPalette=!1}static{this.allowedParentTypes=[`navi`]}static{this.resizableWidth=!1}static{this.defaultProps={seite:``,seitename:``,ton:`sonne`}}static{this.customProperties=[{attributeName:`seite`,name:`Seite`,description:`Welche Seite dieser Maske der Eintrag zeigt.`,kind:`seite`,klarnameProp:`seitename`,nurImEditor:!0},{attributeName:`ton`,name:`Farbe`,description:`Farbe des Zeichens vor dem Namen.`,kind:`select`,options:Us.map(e=>({value:e.wert,label:e.name}))}]}static{this.styles=[T.styles,o`
      :host {
        --ton: var(--se-amber);
        display: flex;
        align-items: center;
        gap: 13px;
        box-sizing: border-box;
        margin: 2px 6px;
        padding: 10px 11px;
        border-radius: var(--se-r-md);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        color: var(--se-bg);
        white-space: nowrap;
        cursor: pointer;
      }
      :host(:hover) { background: var(--se-muted); }

      :host([aktiv]) { background: var(--se-accent); color: var(--se-panel); }

      .zeichen {
        width: 22px;
        height: 22px;
        flex: none;
        border-radius: 50%;
        background: var(--ton);
      }
      :host([aktiv]) .zeichen { background: var(--se-panel); }

      :host([ton='sonne'])   { --ton: var(--se-amber); }
      :host([ton='salbei'])  { --ton: var(--se-green); }
      :host([ton='himmel'])  { --ton: var(--se-blue); }
      :host([ton='flieder']) { --ton: var(--se-violet); }
      :host([ton='koralle']) { --ton: var(--se-accent); }

      .name { display: none; }
      :host([breit]) .name {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `]}constructor(){super(),this.seite=``,this.seitename=``,this.ton=`sonne`,this.addEventListener(`click`,()=>this.melde())}melde(){let e={ansicht:this.seitename};this.dispatchEvent(new CustomEvent(Hs,{detail:e,bubbles:!0,composed:!0}))}render(){return g`<span class="zeichen"></span>
      <span class="name">${this.seitename===``?`—`:this.seitename}</span>`}};w([S()],Q.prototype,`seite`,void 0),w([S()],Q.prototype,`seitename`,void 0),w([S({reflect:!0})],Q.prototype,`ton`,void 0),T.defineAndRegister(Q);var Ws=`aktiv`;function Gs(e){return Array.from(e.querySelectorAll(Q.tagName))}function Ks(e,t){let n=Gs(e),r=t??n.find(e=>e.hasAttribute(Ws))??n[0];for(let e of n)e===r?e.setAttribute(Ws,``):e.removeAttribute(Ws)}function qs(e){let t=e.hasAttribute(`offen`);for(let n of Gs(e))n.toggleAttribute(`breit`,t)}function Js(e){return e.getAttribute(`name`)??String(ht.defaultProps.name)}function Ys(e,t){let n=e;for(;n&&n.parentElement!==t;)n=n.parentElement;return n}function Xs(e,t){let n=e.ownerDocument,r=Array.from(n.querySelectorAll(ht.tagName)),i=r[0]?.parentElement??null;if(!i)return;let a=Ys(e,i);if(!a)return;let o=r.find(e=>Js(e)===t)??null;for(let e of Array.from(i.children))e!==a&&((r.includes(e)?e===o:o===null)?e.removeAttribute(`hidden`):e.setAttribute(`hidden`,``))}var Zs=new WeakMap,Qs=new WeakSet;function $s(e){let t=t=>{let n=t.detail;n&&(Ks(e,t.target instanceof Element?t.target:void 0),e.removeAttribute(`offen`),qs(e),!e.hasAttribute(`data-ff-editor`)&&Xs(e,n.ansicht))};e.addEventListener(Hs,t),Zs.set(e,t)}function ec(e){let t=Zs.get(e);t&&(e.removeEventListener(Hs,t),Zs.delete(e))}function tc(e){if(Ks(e),qs(e),e.hasAttribute(`data-ff-editor`)||Qs.has(e))return;let t=Gs(e)[0];if(!t)return;Qs.add(e);let n=()=>Xs(e,t.seitename);e.ownerDocument.readyState===`loading`?e.ownerDocument.addEventListener(`DOMContentLoaded`,n,{once:!0}):queueMicrotask(n)}var nc=Q.blockType,rc=class extends T{static{this.blockType=`navi`}static{this.ohneDaten=!0}static{this.tagName=`ff-navi`}static{this.displayName=`Navi`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[nc]}static{this.addChildButton={label:`Eintrag`,childType:nc}}static{this.containerHint=!1}static{this.defaultProps={}}static{this.customProperties=[]}static{this.maskenRand=!0}static{this.allowedParentTypes=[mt]}static{this.raster={startW:5,startH:24,minW:3,minH:3}}static{this.styles=[T.styles,o`
      :host {
        height: 100%;
        width: ${Vs.breite}px;
        transition: width var(--se-move);
      }
      :host([offen]) { width: ${Vs.breiteOffen}px; }
      .leiste {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        background: var(--se-ink);
        color: var(--se-bg);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: var(--se-font);
      }
      :host([offen]) .leiste {
        background: color-mix(in oklab, var(--se-ink) 88%, transparent);
      }

      .kopf {
        flex: none;
        display: flex;
        align-items: center;
        padding: 8px;
      }
      .schalter {
        flex: none;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        width: 40px;
        height: 32px;
        padding: 0 11px;
        border: none;
        border-radius: var(--se-r-md);
        background: none;
        color: inherit;
        cursor: pointer;
      }
      .schalter:hover { background: var(--se-muted); }
      .balken {
        height: 2px;
        background: currentColor;
      }
      .eintraege {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px 0;
        overflow-y: auto;
      }
      .eintraege slot { display: contents; }
    `]}connectedCallback(){super.connectedCallback(),$s(this)}disconnectedCallback(){super.disconnectedCallback(),ec(this)}klappen(){this.toggleAttribute(`offen`),qs(this)}render(){return g`<div class="leiste">
        <div class="kopf">
          <button
            class="schalter"
            type="button"
            aria-label="Navi auf- und zuklappen"
            @click=${()=>this.klappen()}
          >
            <span class="balken"></span>
            <span class="balken"></span>
            <span class="balken"></span>
          </button>
        </div>
        <div class="eintraege">
          <slot @slotchange=${()=>tc(this)}></slot>
        </div>
      </div>`}};T.defineAndRegister(rc);var ic=rt(`text`);function ac(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(ic)??``;return t===``||n===``?void 0:{sourceId:t,code:n}}function oc(e){let t=si(e,ic);t.art!==`ungebunden`&&(e.text=t.art===`wert`?t.wert:``)}function sc(e){ac(e)&&(e.text=``)}var cc=ti({hydriere:oc,verdrahte:sc}),lc=cc.connect,uc=cc.disconnect,dc=6,fc=96,pc=14,mc={duenn:`300`,normal:`400`,fett:`700`},hc={links:`left`,mitte:`center`,rechts:`right`},gc={standard:`var(--se-ink)`,gedaempft:`var(--se-muted)`,akzent:`var(--se-accent)`,erfolg:`var(--se-green)`,warnung:`var(--se-amber)`,fehler:`var(--se-red)`},_c=`standard`;function vc(e){if(e===`ueberschrift`)return 15;if(e===`klein`)return 12;let t=typeof e==`number`?e:Number.parseFloat(String(e??``));return Number.isFinite(t)?Math.min(fc,Math.max(dc,t)):pc}function yc(e){return typeof e==`string`&&e in mc?e:`normal`}function bc(e){return typeof e==`string`&&e in hc?e:`links`}function xc(e){return typeof e==`string`&&e in gc?e:_c}var $=class extends T{constructor(...e){super(...e),this.groesse=pc,this.gewicht=`normal`,this.ausrichtung=`links`,this.farbe=_c,this.text=`Text`,this.source=``,this.textField=``}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Text`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.bindableSpots=[{prop:`text`,label:`Text`}]}static{this.defaultProps={width:`fill`,groesse:pc,gewicht:`normal`,ausrichtung:`links`,farbe:_c,text:`Text`,source:``,textField:``}}static{this.raster={startW:6,startH:2,minW:1,minH:1}}static{this.customProperties=[{attributeName:`groesse`,name:`Größe`,description:`Schriftgröße in Pixeln.`,kind:`number`,unit:`px`,min:dc,max:fc,inspectorRow:`Text-Stil`},{attributeName:`gewicht`,name:`Gewicht`,description:`Strichstärke der Schrift.`,kind:`segment`,options:[{value:`duenn`,label:`Dünn`},{value:`normal`,label:`Normal`},{value:`fett`,label:`Fett`}],inspectorRow:`Text-Stil`},{attributeName:`ausrichtung`,name:`Ausrichtung`,description:`Wo der Text in seiner Breite sitzt.`,kind:`segment`,options:[{value:`links`,label:`Links`},{value:`mitte`,label:`Mitte`},{value:`rechts`,label:`Rechts`}],inspectorRow:`Text-Stil`},{attributeName:`farbe`,name:`Farbe`,description:`Textfarbe aus den Farben der Maske.`,kind:`select`,options:[{value:`standard`,label:`Standard`},{value:`gedaempft`,label:`Gedämpft`},{value:`akzent`,label:`Akzent`},{value:`erfolg`,label:`Erfolg`},{value:`warnung`,label:`Warnung`},{value:`fehler`,label:`Fehler`}]}]}static{this.styles=[T.styles,o`
      .text {
        font-family: var(--se-font);

        color: var(--se-ink);

        --text-zeilenhoehe: var(--se-lh);
        line-height: var(--text-zeilenhoehe);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .text:empty { min-height: calc(1em * var(--text-zeilenhoehe)); }

      :host([data-ff-editor]) .text:empty::before {
        content: 'Text …';
        color: var(--se-faint);
      }
    `]}render(){return g`<div
      class="text"
      style=${W({fontSize:`${vc(this.groesse)}px`,fontWeight:mc[yc(this.gewicht)],textAlign:hc[bc(this.ausrichtung)],color:gc[xc(this.farbe)]})}
      data-ff-editable
      data-ff-spot="text"
      ?data-ff-bound=${this.textField!==``}
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</div>`}connectedCallback(){super.connectedCallback(),lc(this)}disconnectedCallback(){super.disconnectedCallback(),uc(this)}};w([S({type:Number})],$.prototype,`groesse`,void 0),w([S()],$.prototype,`gewicht`,void 0),w([S()],$.prototype,`ausrichtung`,void 0),w([S()],$.prototype,`farbe`,void 0),w([S()],$.prototype,`text`,void 0),w([S()],$.prototype,`source`,void 0),w([S()],$.prototype,`textField`,void 0),T.defineAndRegister($);var Sc=[`waagerecht`,`senkrecht`],Cc=`waagerecht`;function wc(e){return Sc.includes(e)?e:Cc}var Tc=class extends T{constructor(...e){super(...e),this.richtung=Cc}static{this.blockType=`trenner`}static{this.ohneDaten=!0}static{this.tagName=`ff-trenner`}static{this.displayName=`Trennlinie`}static{this.category=`layout`}static{this.defaultProps={width:`fill`,richtung:Cc}}static{this.resizableWidth=!1}static{this.raster={startW:24,startH:1,minW:1,minH:1,varianten:[{wenn:{attributeName:`richtung`,equals:`senkrecht`},startW:1,startH:6,breiteZiehbar:!1}]}}static{this.customProperties=[{attributeName:`richtung`,name:`Richtung`,description:`Waagerecht trennt oben von unten, senkrecht links von rechts.`,kind:`select`,options:[{value:`waagerecht`,label:`Waagerecht`},{value:`senkrecht`,label:`Senkrecht`}]}]}static{this.styles=[T.styles,o`

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

        min-height: 24px;
      }
      .linie { background: var(--se-line); }
      .waagerecht .linie { width: 100%; height: 1px; }
      .senkrecht .linie { width: 1px; height: 100%; }
    `]}render(){return g`<div class="flaeche ${wc(this.richtung)}"><div class="linie"></div></div>`}};w([S()],Tc.prototype,`richtung`,void 0),T.defineAndRegister(Tc),typeof window<`u`&&window.addEventListener(`unhandledrejection`,e=>{let t=e.reason;P(`Unerwarteter Fehler in der Maske: `+(t instanceof Error?t.message:String(t)))})})();