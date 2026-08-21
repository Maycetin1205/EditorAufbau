(function(){var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,re=globalThis,ie=re.trustedTypes,ae=ie?ie.emptyScript:``,oe=re.reactiveElementPolyfillSupport,se=(e,t)=>e,ce={toAttribute(e,t){switch(t){case Boolean:e=e?ae:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},le=(e,t)=>!l(e,t),ue={attribute:!0,type:String,converter:ce,reflect:!1,useDefault:!1,hasChanged:le};Symbol.metadata??=Symbol(`metadata`),re.litPropertyMetadata??=new WeakMap;var f=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ue){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ue}static _$Ei(){if(this.hasOwnProperty(se(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(se(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(se(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?ce:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?ce:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??le)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};f.elementStyles=[],f.shadowRootOptions={mode:`open`},f[se(`elementProperties`)]=new Map,f[se(`finalized`)]=new Map,oe?.({ReactiveElement:f}),(re.reactiveElementVersions??=[]).push(`2.1.2`);var de=globalThis,fe=e=>e,pe=de.trustedTypes,me=pe?pe.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,he=`$lit$`,p=`lit$${Math.random().toFixed(9).slice(2)}$`,ge=`?`+p,_e=`<${ge}>`,m=document,ve=()=>m.createComment(``),ye=e=>e===null||typeof e!=`object`&&typeof e!=`function`,be=Array.isArray,xe=e=>be(e)||typeof e?.[Symbol.iterator]==`function`,Se=`[ 	
\f\r]`,Ce=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,we=/-->/g,Te=/>/g,h=RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),Ee=/'/g,De=/"/g,Oe=/^(?:script|style|textarea|title)$/i,ke=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),g=ke(1),Ae=ke(2),_=Symbol.for(`lit-noChange`),v=Symbol.for(`lit-nothing`),je=new WeakMap,y=m.createTreeWalker(m,129);function Me(e,t){if(!be(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return me===void 0?t:me.createHTML(t)}var Ne=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=Ce;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===Ce?c[1]===`!--`?o=we:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=h):(Oe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=h):o=Te:o===h?c[0]===`>`?(o=i??Ce,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?h:c[3]===`"`?De:Ee):o===De||o===Ee?o=h:o===we||o===Te?o=Ce:(o=h,i=void 0);let d=o===h&&e[t+1].startsWith(`/>`)?` `:``;a+=o===Ce?n+_e:l>=0?(r.push(s),n.slice(0,l)+he+n.slice(l)+p+d):n+p+(l===-2?t:d)}return[Me(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Pe=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ne(t,n);if(this.el=e.createElement(l,r),y.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=y.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(he)){let t=u[o++],n=i.getAttribute(e).split(p),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Re:r[1]===`?`?ze:r[1]===`@`?Be:Le}),i.removeAttribute(e)}else e.startsWith(p)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(Oe.test(i.tagName)){let e=i.textContent.split(p),t=e.length-1;if(t>0){i.textContent=pe?pe.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],ve()),y.nextNode(),c.push({type:2,index:++a});i.append(e[t],ve())}}}else if(i.nodeType===8)if(i.data===ge)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(p,e+1))!==-1;)c.push({type:7,index:a}),e+=p.length-1}a++}}static createElement(e,t){let n=m.createElement(`template`);return n.innerHTML=e,n}};function b(e,t,n=e,r){if(t===_)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=ye(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=b(e,i._$AS(e,t.values),i,r)),t}var Fe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??m).importNode(t,!0);y.currentNode=r;let i=y.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Ie(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ve(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=y.nextNode(),a++)}return y.currentNode=m,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Ie=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=v,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=b(this,e,t),ye(e)?e===v||e==null||e===``?(this._$AH!==v&&this._$AR(),this._$AH=v):e!==this._$AH&&e!==_&&this._(e):e._$litType$===void 0?e.nodeType===void 0?xe(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==v&&ye(this._$AH)?this._$AA.nextSibling.data=e:this.T(m.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Pe.createElement(Me(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Fe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=je.get(e.strings);return t===void 0&&je.set(e.strings,t=new Pe(e)),t}k(t){be(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(ve()),this.O(ve()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=fe(e).nextSibling;fe(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Le=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=v,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=v}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=b(this,e,t,0),a=!ye(e)||e!==this._$AH&&e!==_,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=b(this,r[n+o],t,o),s===_&&(s=this._$AH[o]),a||=!ye(s)||s!==this._$AH[o],s===v?e=v:e!==v&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===v?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Re=class extends Le{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===v?void 0:e}},ze=class extends Le{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==v)}},Be=class extends Le{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=b(this,e,t,0)??v)===_)return;let n=this._$AH,r=e===v&&n!==v||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==v&&(n===v||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ve=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){b(this,e)}},He=de.litHtmlPolyfillSupport;He?.(Pe,Ie),(de.litHtmlVersions??=[]).push(`3.3.3`);var Ue=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Ie(t.insertBefore(ve(),e),e,void 0,n??{})}return i._$AI(e),i},We=globalThis,x=class extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ue(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};x._$litElement$=!0,x.finalized=!0,We.litElementHydrateSupport?.({LitElement:x});var Ge=We.litElementPolyfillSupport;Ge?.({LitElement:x}),(We.litElementVersions??=[]).push(`4.2.2`);var Ke={attribute:!0,type:String,converter:ce,reflect:!1,hasChanged:le},qe=(e=Ke,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function S(e){return(t,n)=>typeof n==`object`?qe(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function C(e){return S({...e,state:!0,attribute:!1})}var Je=new Map;function Ye(e){Je.has(e.type)&&console.warn(`Block-Typ "${e.type}" wird ueberschrieben.`),Je.set(e.type,e)}function Xe(){return Array.from(Je.values())}var Ze={width:`auto`};function Qe(e){return Object.entries(e).map(([e,t])=>`${e.replace(/[A-Z]/g,e=>`-`+e.toLowerCase())}:${t}`).join(`;`)}var $e={spalten:24,spaltePx:40,zeilePx:12,gapPx:8},et={rasterX:0,rasterY:0,rasterW:$e.spalten,rasterH:1};function tt(){return{display:`grid`,gridTemplateColumns:`repeat(${$e.spalten}, 1fr)`,gridAutoRows:`${$e.zeilePx}px`,gap:`${$e.gapPx}px`,alignContent:`start`}}function nt(){return Qe(tt())}function rt(e){return`${e.toLowerCase()}field`}function it(e){let t=e.split(`::`);if(t.length!==2)return{quelleId:``,code:e};let[n,r]=t;return n===``||r===``?{quelleId:``,code:e}:{quelleId:n,code:r}}function at(e){return e.keyPairs.filter(e=>e.fromField.trim()!==``&&e.toField.trim()!==``)}var ot=`weitereQuellen`,st={[ot]:[]};function ct(e){return e.quelleId!==``}function lt(e,t){let n=e.vonQuelleId??``;return n===``?t:n}function ut(e,t,n,r){let i=e.trim(),a=t.trim(),o=a===n?``:a,s=o===``?void 0:r.find(e=>e.quelleId===o&&ct(e));if(i===``)return{art:`frei`,quelleId:``,code:``,suchQuelleId:o};let{quelleId:c,code:l}=it(i);if(c!==``&&c!==n)return{art:`auswahl`,quelleId:c,code:l,suchQuelleId:o};if(s&&lt(s,n)===n){for(let e of at(s))if(e.fromField===l)return{art:`auswahl`,quelleId:o,code:e.toField,suchQuelleId:o}}return{art:`eigen`,quelleId:``,code:l,suchQuelleId:o}}var dt=`folgtAuswahl`,ft={[dt]:[]};function pt(e,t){let n=e.textContent??``,r=Array.from(e.childNodes),i=r.map(e=>e.textContent??``);e.setAttribute(`contenteditable`,`plaintext-only`),e.focus();let a=window.getSelection(),o=document.createRange();o.selectNodeContents(e),a?.removeAllRanges(),a?.addRange(o);let s=()=>{e.replaceChildren(...r),r.forEach((e,t)=>{e.textContent!==i[t]&&(e.textContent=i[t])})},c=!1,l=r=>{c||(c=!0,e.removeAttribute(`contenteditable`),e.removeEventListener(`blur`,u),e.removeEventListener(`keydown`,d),r&&t((e.textContent??``).trim(),n)||s())},u=()=>l(!0),d=t=>{t.key===`Enter`?(t.preventDefault(),e.blur()):t.key===`Escape`&&(t.preventDefault(),l(!1))};e.addEventListener(`blur`,u),e.addEventListener(`keydown`,d)}function w(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var T=class extends x{constructor(...e){super(...e),this.editable=!1}static{this.styles=o`
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
  `}static{this.customProperties=[]}get customProperties(){return this.constructor.customProperties}inlineEdit(e,t){if(!this.editable)return;let n=e.currentTarget;n&&(n.hasAttribute(`data-ff-bound`)||(e.stopPropagation(),e.preventDefault(),pt(n,(e,n)=>(e!==n&&this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:t,value:e},bubbles:!0,composed:!0})),!0))))}static defineAndRegister(e){customElements.get(e.tagName)||customElements.define(e.tagName,e),Ye({type:e.blockType,tagName:e.tagName,displayName:e.displayName,category:e.category,defaultProps:{...Ze,...et,...e.acceptsDataSource?st:null,...e.ohneDaten?null:ft,...e.defaultProps},customProperties:e.customProperties,acceptsChildren:e.acceptsChildren??!1,resizableWidth:e.resizableWidth??!0,resizableHeight:e.resizableHeight??!1,allowedChildTypes:e.allowedChildTypes,allowedParentTypes:e.allowedParentTypes,lockedWidth:e.lockedWidth,defaultChildren:e.defaultChildren,childDirection:e.childDirection,showInPalette:e.showInPalette,templateChild:e.templateChild,containerHint:e.containerHint,addChildButton:e.addChildButton,acceptsDataSource:e.acceptsDataSource,satzWahl:e.satzWahl,ohneDaten:e.ohneDaten,kannErfassen:e.kannErfassen,bindableSpots:e.bindableSpots,actionValueSpots:e.actionValueSpots,listenBindung:e.listenBindung,brauchtTierbilder:e.brauchtTierbilder,blockEvents:e.blockEvents,pageBlock:e.pageBlock,flaechenSeite:e.flaechenSeite,maskenRand:e.maskenRand,raster:e.raster})}};w([S({type:Boolean,reflect:!0,attribute:`data-editable`})],T.prototype,`editable`,void 0);var mt=`root`,ht=class extends T{static{this.blockType=`ansicht`}static{this.tagName=`ff-ansicht`}static{this.displayName=`Ansicht`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.showInPalette=!1}static{this.allowedParentTypes=[mt]}static{this.pageBlock=!0}static{this.flaechenSeite=!0}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.defaultProps={name:`Ansicht`}}static{this.styles=[T.styles,o`

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
    </div>`}};w([S()],gt.prototype,`quelle`,void 0),T.defineAndRegister(gt);var _t=`data-ff-block-id`,vt=[`fixed`,`context`,`data_field`,`block_value`,`gewaehlte_zeile`,`previous_result`,`step_result`,`se_variable`],yt=[`erfassungszelle`],bt=[...vt,...yt,`aus`];function xt(e){return!!e&&typeof e==`object`&&!Array.isArray(e)}function St(e){return!xt(e)||typeof e.source!=`string`||!bt.includes(e.source)||typeof e.value!=`string`||e.dataSourceId!==void 0&&typeof e.dataSourceId!=`string`||e.blockId!==void 0&&typeof e.blockId!=`string`||e.ergebnisFeld!==void 0&&typeof e.ergebnisFeld!=`string`?null:{source:e.source,value:e.value,...typeof e.dataSourceId==`string`?{dataSourceId:e.dataSourceId}:{},...typeof e.blockId==`string`?{blockId:e.blockId}:{},...e.source===`step_result`&&typeof e.ergebnisFeld==`string`?{ergebnisFeld:e.ergebnisFeld}:{}}}function Ct(e){if(!xt(e)||typeof e.type!=`string`||typeof e.resultKey!=`string`)return null;if(e.type===`START_TOOL`)return typeof e.toolNr!=`string`||!Array.isArray(e.toolParams)||e.toolParams.some(e=>typeof e!=`string`)?null:{type:`START_TOOL`,resultKey:e.resultKey,toolNr:e.toolNr,toolParams:[...e.toolParams]};if(e.type===`POPUP_OPEN`||e.type===`POPUP_CLOSE`){let t=typeof e.popupId==`string`?e.popupId:void 0,n=typeof e.popup==`string`?e.popup:void 0;return t===void 0&&n===void 0?null:{type:e.type,resultKey:e.resultKey,...t===void 0?{}:{popupId:t},...n===void 0?{}:{popup:n}}}if(e.type===`RELATION`){if(typeof e.relationId!=`string`||!Array.isArray(e.extraParams)||!Array.isArray(e.params)&&!xt(e.bindings))return null;let t=[];if(Array.isArray(e.params))for(let n of e.params){let e=St(n);if(!e)return null;t.push(e)}let n=[];for(let t of e.extraParams){let e=St(t);if(!e)return null;n.push(e)}return{type:`RELATION`,resultKey:e.resultKey,relationId:e.relationId,params:t,extraParams:n}}return null}function wt(e){if(!e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!xt(t))return{};let n={};for(let[e,r]of Object.entries(t)){if(!Array.isArray(r)||r.length===0)continue;let t=[],i=!1;for(let e of r){let n=Ct(e);if(!n){i=!0;break}t.push(n)}!i&&t.length>0&&(n[e]=t)}return n}Object.values({idb:{id:`idb`,name:`IDB-Tabelle`,tabellenId:``,felderEinzeln:!1,kennungLabel:`Kennung`,kennungBeispiel:`ID0001`,kopfsatzMoeglich:!1,kopfsatzStandard:``,satzSchluesselStandard:`0_10`,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},adressstamm:{id:`adressstamm`,name:`Adressstamm`,tabellenId:`ADR`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!1,kopfsatzStandard:``,satzSchluesselStandard:``,relationLadenMoeglich:!1,varMoeglich:!0,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},artikelstamm:{id:`artikelstamm`,name:`Artikelstamm`,tabellenId:`ART`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!1,kopfsatzStandard:``,satzSchluesselStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},beleg:{id:`beleg`,name:`Beleg`,tabellenId:`BEL`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!1,kopfsatzStandard:``,satzSchluesselStandard:`0_11`,relationLadenMoeglich:!1,varMoeglich:!0,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[{code:`0_11`,label:`Satzschlüssel`},{code:`2_1`,label:`Belegart`},{code:`3_8`,label:`Belegnummer`},{code:`11_8`,label:`Kundennummer`},{code:`19_10`,label:`Belegdatum`},{code:`393_12`,label:`Warenwert`},{code:`441_12`,label:`MwSt-Betrag`},{code:`453_12`,label:`Gesamtbetrag`},{code:`3440_60`,label:`Name`}]},belegposition:{id:`belegposition`,name:`Belegpositionen`,tabellenId:`POS`,felderEinzeln:!0,kennungLabel:``,kennungBeispiel:``,kopfsatzMoeglich:!0,kopfsatzStandard:`BEL_0_11`,satzSchluesselStandard:`645_10`,relationLadenMoeglich:!0,varMoeglich:!0,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[{code:`2_1`,label:`Belegart`},{code:`3_8`,label:`Belegnummer`},{code:`11_6`,label:`Positionsnummer`},{code:`17_1`,label:`Zeilenart`},{code:`18_25`,label:`Artikelnummer`},{code:`45_60`,label:`Bezeichnung`},{code:`164_8`,label:`Menge`},{code:`246_9`,label:`Einzelpreis`},{code:`280_12`,label:`Gesamtpreis`},{code:`372_5`,label:`MwSt-Satz`},{code:`645_10`,label:`Satznummer`},{code:`689_5`,label:`Mengeneinheit`},{code:`1401_12`,label:`Rohertrag`},{code:`2558_1`,label:`Farbkennzeichen`},{code:`3164_12`,label:`Rabatt`}]},datei:{id:`datei`,name:`Andere Datei`,tabellenId:``,felderEinzeln:!0,kennungLabel:`Kennung`,kennungBeispiel:`SERPOS`,kopfsatzMoeglich:!0,kopfsatzStandard:``,satzSchluesselStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`sefileloop`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!1,standardFelder:[]},erpabfrage:{id:`erpabfrage`,name:`ERP-Abfrage`,tabellenId:``,felderEinzeln:!0,kennungLabel:`Kennung`,kennungBeispiel:`LIEFERADRESSE.GET`,kopfsatzMoeglich:!1,kopfsatzStandard:``,satzSchluesselStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`erpapicall`,spaltenNamen:!1,idbKurzform:!0,feldVorsatzMoeglich:!0,standardFelder:[]},dataset:{id:`dataset`,name:`DataSet`,tabellenId:``,felderEinzeln:!0,kennungLabel:`DataSet-ID`,kennungBeispiel:`ID0001`,kopfsatzMoeglich:!1,kopfsatzStandard:``,satzSchluesselStandard:``,relationLadenMoeglich:!1,varMoeglich:!1,bestellBlock:`dataset`,spaltenNamen:!0,idbKurzform:!1,feldVorsatzMoeglich:!1,standardFelder:[]}}).map(e=>e.id);var E=/^\d+_\d+$/,Tt=/^\d+$/;function Et(e){if(!e||typeof e!=`object`)return null;let t=e,n=e=>typeof e==`string`?e.trim():``,r=n(t.nr),i=n(t.geberQuelleId),a=n(t.belegartFeld),o=n(t.belegnummerFeld),s=n(t.jahrFeld),c=n(t.archivFeld),l=Array.isArray(t.endeFelder)?t.endeFelder.filter(e=>typeof e==`string`&&E.test(e)):[];return!Tt.test(r)||i===``||!E.test(a)||!E.test(o)||s!==``&&!E.test(s)||c!==``&&!E.test(c)||l.length===0?null:{nr:r,geberQuelleId:i,belegartFeld:a,belegnummerFeld:o,jahrFeld:s,archivFeld:c,endeFelder:l}}var Dt=new Map;function Ot(e,t){e!==``&&Dt.set(e,t)}function kt(e){return Dt.get(e)}function D(e){return typeof e==`object`&&!!e}function O(e,t){if(!(!Array.isArray(e)||t===``))for(let n of e){if(!D(n)||n.id!==t||typeof n.name!=`string`||typeof n.tableId!=`string`)continue;let e,r=Et(n.ladeRelation);if(r&&D(n.ladeRelation)){let t=n.ladeRelation.zusatzFelder,i=Array.isArray(t)?t.filter(e=>typeof e==`string`&&E.test(e)):[];e={...r,zusatzFelder:i}}return{id:t,name:n.name,tableId:n.tableId,indexField:typeof n.indexField==`string`?n.indexField:``,...e?{ladeRelation:e}:{}}}}function At(e){return e==null?``:String(e).trim()}function k(e,t){if(!D(e)||t===``)return``;let n=t.trim(),r=At(e[n]);if(r!==``)return r;for(let t of Object.keys(e))if(t===n||t.startsWith(`${n}_`)||t.endsWith(`_${n}`)){let n=At(e[t]);if(n!==``)return n}let i=/^(\d+)_(\d+)$/.exec(n);if(!i)return``;let a=e.SATZNEU??e.SATZ??e.satzneu??e.satz??e.RAW??e.raw??e.RESULT??e.result,o=a==null?``:String(a);if(o===``)return``;let s=Number(i[1]),c=Number(i[2]);return c<=0?``:o.substring(s,s+c).trim()}function jt(e,t){return e.indexField===``?``:k(t,e.indexField)}function Mt(e,t,n){if(!D(e)||t===``)return!1;let r=t.trim(),i=!1;for(let t of Object.keys(e))(t===r||t.startsWith(`${r}_`)||t.endsWith(`_${r}`))&&(e[t]=n,i=!0);let a=/^(\d+)_(\d+)$/.exec(r);if(a){let t=[`SATZNEU`,`SATZ`,`satzneu`,`satz`,`RAW`,`raw`].find(t=>typeof e[t]==`string`);if(t){let r=e[t],o=Number(a[1]),s=Number(a[2]);if(s>0){let a=n.length>s?n.slice(0,s):n.padEnd(s,` `),c=r.length<o?r.padEnd(o,` `):r;e[t]=c.slice(0,o)+a+c.slice(o+s),i=!0}}}return i}function A(e){if(!D(e))return Array.isArray(e)?e:[];let t=[e.Zeilen,e.zeilen,e.Saetze,e.saetze,e.Rows,e.rows,e.Daten,e.daten];for(let e of t){if(Array.isArray(e))return e;if(typeof e==`string`)try{let t=JSON.parse(e);if(Array.isArray(t))return t}catch{}}return[]}function j(e,t){return At(e).toLowerCase()===t.trim().toLowerCase()}function Nt(e,t,n){if(!D(e)||!D(e.Daten))return[];let r=e.Daten,i=r.SEFileLoop;if(Array.isArray(i)){for(let e of i)if(D(e)&&(j(e.ALIAS,t)||j(e.alias,t))){let t=A(e);if(t.length>0)return t}}else if(D(i))for(let e of Object.keys(i)){let n=i[e];if(j(e,t)||D(n)&&(j(n.ALIAS,t)||j(n.alias,t))){let e=A(n);if(e.length>0)return e}}for(let e of[`ErpApiCall`,`ERPAPICALL`,`erpapicall`]){let n=r[e];if(D(n))for(let e of Object.keys(n)){if(!j(e,t))continue;let r=A(n[e]);if(r.length>0)return r}}let a=r.Tabellen;if(D(a)){let e=[t,t.toUpperCase(),t.toLowerCase(),n];for(let t of e)if(t!==``&&t in a){let e=A(a[t]);if(e.length>0)return e}for(let e of Object.keys(a))if(j(e,t)){let t=A(a[e]);if(t.length>0)return t}}return kt(t)??[]}function Pt(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!D(t)||!D(t.Daten))return;let n=t.Daten;if(!(!n.SEFileLoop&&!n.Tabellen&&!n.ErpApiCall))return n}function Ft(e){let t=e;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}if(!(!D(t)||!D(t.MSG)))return t.MSG.DATA}function It(e,t,n,r){let i=e.getAttribute(t)??``;if(i===``)return[];try{let e=JSON.parse(i);if(!Array.isArray(e))return[];let t=[];for(let i of e){if(!i||typeof i!=`object`)continue;let e=i,a=e[n];if(typeof a!=`string`||a===``)continue;let o=[];for(let t of Array.isArray(e.keyPairs)?e.keyPairs:[]){if(!t||typeof t!=`object`)continue;let e=t;typeof e.fromField!=`string`||typeof e.toField!=`string`||e.fromField.trim()===``||e.toField.trim()===``||o.push({fromField:e.fromField,toField:e.toField})}if(o.length===0)continue;let s=r===void 0?``:e[r];t.push({id:a,...typeof s==`string`&&s.trim()!==``&&s!==a?{von:s.trim()}:{},keyPairs:o})}return t}catch{return[]}}function Lt(e){if(e==null)return``;try{return JSON.stringify(e)??``}catch{return``}}var M=new Map,Rt=new Set,zt=new Set,Bt=0,Vt=!1,Ht=!1;function Ut(){if(Vt){Ht=!0;return}Vt=!0;try{do Ht=!1,Rt.forEach(e=>e());while(Ht)}finally{Vt=!1}}function Wt(e){Rt.add(e)}function Gt(e){return M.get(e)?.zeile}function Kt(e){return M.get(e)?.merkmal??``}function qt(e){return M.get(e)?.nummer??0}function N(e){return e.getAttribute(`data-ff-id`)??``}function Jt(e,t,n){if(e===``)return[];let r=Kt(e);if(r===``)return[];let i=[];return t.forEach((e,t)=>{Lt(n(e))===r&&i.push(t)}),i.length===0&&Zt(e),i}function Yt(e,t){if(e===``)return;let n=Lt(t);if(n===``)return;let r=M.get(e);r&&r.merkmal===n?M.delete(e):M.set(e,{zeile:t,merkmal:n,nummer:++Bt}),Ut()}function Xt(e,t){if(e===``)return;let n=Lt(t);n!==``&&M.get(e)?.merkmal!==n&&(M.set(e,{zeile:t,merkmal:n,nummer:++Bt}),Ut())}function Zt(e){M.has(e)&&(M.delete(e),Ut())}function Qt(e){zt.add(e)}var $t=dt.toLowerCase();function en(e){return It(e,$t,`geberId`).map(e=>({geberId:e.id,keyPairs:e.keyPairs}))}function tn(e,t){let n=t,r=!1;for(let t of en(e)){let e=Gt(t.geberId);e!==void 0&&(r=!0,n=n.filter(n=>t.keyPairs.every(t=>{let r=k(e,t.fromField);return r!==``&&r===k(n,t.toField)})))}return{rows:n,gefiltert:r}}function nn(e,t){if(en(e).length===0)return t[0];let{rows:n,gefiltert:r}=tn(e,t);return r?n[0]:void 0}var rn=8e3,P=null,an=null;function on(){let e=document.createElement(`div`);return e.setAttribute(`data-ff-meldung`,``),e.setAttribute(`role`,`alert`),e.style.cssText=[`position:fixed`,`top:0`,`left:0`,`right:0`,`z-index:2147483647`,`padding:7px 12px`,`background:var(--se-red-soft,#fbe7e6)`,`color:var(--se-red,#c0201a)`,`border-bottom:1px solid var(--se-red,#c0201a)`,`font:500 12px/1.4 system-ui,sans-serif`,`cursor:pointer`].join(`;`),e.title=`Klicken zum Schließen`,e.addEventListener(`click`,sn),e}function sn(){an&&=(clearTimeout(an),null),P?.remove(),P=null}function F(e){typeof document>`u`||!document.body||(P||(P=on(),document.body.appendChild(P)),P.textContent=e,an&&clearTimeout(an),an=setTimeout(sn,rn))}function I(){return globalThis}function cn(){let e=I();return D(e.SEDATA)&&D(e.SEDATA.Daten)}function ln(){let e=I();try{e.selib?.Json?.InitializeERPConnection?.()}catch{}try{typeof e.InitialisiereSchnittstelle==`function`&&e.InitialisiereSchnittstelle()}catch{}}function un(){let e=I();try{typeof e.ResetDataBasis==`function`&&e.ResetDataBasis()}catch{}try{typeof e.InitialisiereDatenBasis==`function`&&e.InitialisiereDatenBasis()}catch{}}var dn=new Set,fn=new Set;function pn(e){dn.add(e)}function mn(e){return fn.add(e),()=>{fn.delete(e)}}function hn(){dn.forEach(e=>e())}function gn(){hn()}function _n(e){fn.forEach(t=>{try{t(e)}catch{}})}function vn(e){let t=Pt(e);if(!t){_n(e);return}let n=I();D(n.SEDATA)||(n.SEDATA={}),n.SEDATA.Daten=t,un(),hn()}function yn(e=0){let t=I();if(typeof t.basisHTML_REGISTER==`function`){try{t.basisHTML_SetConsoleLog?.(!0,!0)}catch{}try{t.basisHTML_REGISTER(e=>{vn(e)},document.title,`1.0`)}catch(e){F(`SoftEngine-Anmeldung fehlgeschlagen: `+(e instanceof Error?e.message:String(e)))}return}e<400?setTimeout(()=>{yn(e+1)},25):F(`SoftEngine-Anschluss nicht gefunden — die Maske bleibt ohne Daten.`)}var bn=!1;function xn(){if(bn)return;bn=!0,ln();let e=I();e.Erstellen=()=>{un(),hn()},e.initData=e.Erstellen,e.ReloadData=()=>{hn()},yn(),window.addEventListener(`message`,e=>{if(typeof I().basisHTML_REGISTER==`function`)return;let t=Ft(e.data);t!==void 0&&vn(t)},!0);let t=0,n=setInterval(()=>{t+=1,cn()?(clearInterval(n),un(),hn()):t>100&&(clearInterval(n),F(`Keine Daten von SoftEngine empfangen — die Maske zeigt nichts an.`))},300)}var Sn=[`GET_RELATION`,`PUT_RELATION`,`PUTADD_RELATION`];function Cn(e){return`${String(e.getDate()).padStart(2,`0`)}.${String(e.getMonth()+1).padStart(2,`0`)}.${e.getFullYear()}`}function wn(e,t){return e.params.map(e=>e.replace(/\{([A-Za-z0-9_]+)\}/g,(e,n)=>String(t[n]??``)))}function Tn(e){return e instanceof Error?e.message:String(e)}function En(e,t){if(!(!Array.isArray(e)||t===``)){for(let n of e)if(!(!D(n)||n.id!==t)&&!(typeof n.verb!=`string`||!Sn.includes(n.verb))&&!(typeof n.nr!=`string`||n.nr===``)&&!(!Array.isArray(n.params)||n.params.some(e=>typeof e!=`string`)))return{id:t,verb:n.verb,nr:n.nr,params:n.params}}}var Dn=[`RESULT`,`result`],On=[`RESULT`,`result`,`PINDEX`,`pindex`,`INDEX`,`index`,`0_10`,`KEY`,`key`,`ID`,`id`,`VALUE`,`value`];function kn(e){if(typeof e!=`string`)return e;try{return JSON.parse(e)}catch{return}}function An(e){if(typeof e==`string`){let t=e.trim();return t===``?void 0:t}if(typeof e==`number`||typeof e==`boolean`)return String(e)}function jn(e,t){if(t>12)return;let n=An(e);if(n!==void 0)return n;if(Array.isArray(e)){for(let n of e){let e=jn(n,t+1);if(e!==void 0)return e}return}if(D(e)){for(let n of On){if(!(n in e))continue;let r=jn(e[n],t+1);if(r!==void 0)return r}for(let n of Object.values(e)){let e=jn(n,t+1);if(e!==void 0)return e}}}function Mn(e){let t=kn(e);if(D(t)){for(let e of On){if(!(e in t))continue;let n=jn(t[e],0);if(n!==void 0)return n;if(Dn.includes(e)&&typeof t[e]==`string`)return``}for(let e of Object.values(t))if(Array.isArray(e))for(let t of e){let e=Mn(t);if(e!==void 0)return e}else if(D(e)){let t=Mn(e);if(t!==void 0)return t}}}function Nn(e,t=0){if(t>12)return;let n=typeof e==`string`?kn(e):e;if(Array.isArray(n)){for(let e of n){let n=Nn(e,t+1);if(n!==void 0)return n}return}if(D(n)){for(let e of Dn){let t=n[e];if(typeof t==`string`)return t;if(typeof t==`number`||typeof t==`boolean`)return String(t)}for(let e of Object.values(n)){let n=Nn(e,t+1);if(n!==void 0)return n}}}function Pn(e,t,n=0){if(t.trim()===``||n>12)return``;let r=typeof e==`string`?kn(e):e;if(Array.isArray(r)){for(let e of r){let r=Pn(e,t,n+1);if(r!==``)return r}return``}if(!D(r))return``;let i=k(r,t);if(i!==``)return i;for(let e of Object.values(r)){let r=Pn(e,t,n+1);if(r!==``)return r}return``}function Fn(e){return D(e)?Object.keys(e).filter(e=>/^Message\d+$/.test(e)):[]}function In(e,t,n=!1){if(!D(e))return;let r=Fn(e).filter(e=>!t.has(e)).sort((e,t)=>Number(t.slice(7))-Number(e.slice(7)));for(let t of r){let r=n?Nn(e[t]):Mn(e[t]);if(r!==void 0)return{wert:r,roh:e[t],geantwortet:!0}}}var Ln=[],Rn=!1,zn=6e3,Bn=100;function Vn(){if(Rn||Ln.length===0)return;Rn=!0;let e=Ln.shift(),t=I(),n=new Set(Fn(t.SEDATA)),r=!1,i=(t,n,i)=>{r||(r=!0,o(),clearInterval(s),clearTimeout(c),Rn=!1,e.resolve({wert:t,roh:n,geantwortet:i}),queueMicrotask(Vn))},a=e.optionen.satzAntwort===!0,o=mn(e=>{let t=a?Nn(e):Mn(e);t!==void 0&&i(t,e,!0)}),s=setInterval(()=>{let e=In(I().SEDATA,n,a);e!==void 0&&i(e.wert,e.roh,!0)},Bn),c=setTimeout(()=>{e.optionen.still||F(`Daten laden: SoftEngine hat nicht geantwortet (Relation Nr. ${e.template.nr}).`),i(``,void 0,!1)},zn);if(typeof t.basisHTML_SND_MSG!=`function`){e.optionen.still||F(`Daten laden nicht möglich: keine Verbindung zu SoftEngine.`),i(``,void 0,!1);return}try{t.basisHTML_SND_MSG(`GET_RELATION`,{NR:e.template.nr,PARAMS:e.params})}catch(t){e.optionen.still||F(`Daten laden fehlgeschlagen (Relation Nr. ${e.template.nr}): ${Tn(t)}`),i(``,void 0,!1)}}function Hn(e,t,n={}){xn();let r=I();if(e.verb!==`GET_RELATION`){if(typeof r.basisHTML_SND_MSG!=`function`)return F(`Speichern nicht möglich: keine Verbindung zu SoftEngine. Die Eingabe wurde NICHT übernommen.`),Promise.resolve({wert:``,roh:void 0,geantwortet:!1});try{r.basisHTML_SND_MSG(e.verb,{NR:e.nr,PARAMS:[...t]})}catch(t){F(`Speichern fehlgeschlagen (Relation Nr. ${e.nr}): ${Tn(t)}`)}return Promise.resolve({wert:``,roh:void 0,geantwortet:!1})}return new Promise(r=>{Ln.push({template:e,params:[...t],resolve:r,optionen:n}),Vn()})}function Un(e,t){if(!D(t))return``;let n=t.document;if(!n||typeof n.querySelectorAll!=`function`)return``;let r=Array.from(n.querySelectorAll(`[${_t}]`)).find(t=>t.getAttribute(_t)===e.blockId);if(!r)return``;let i=r[e.value];return i==null?``:String(i)}function Wn(e,t,n=I()){if(e.source===`aus`)return``;if(e.source===`fixed`)return e.value;if(e.source===`context`)return t.context[e.value]??``;if(e.source===`previous_result`)return t.previousResult;if(e.source===`step_result`){let n=Number(e.value);if(!Number.isInteger(n)||n<0)return``;let r=e.ergebnisFeld??``;return r===``?t.stepResults?.[n]??``:Pn(t.stepRohErgebnisse?.[n],r)}if(e.source===`block_value`)return Un(e,n);if(e.source===`gewaehlte_zeile`){let n=t.gewaehlteZeile?.(e.blockId??``);return n===void 0?``:k(n,e.value)}if(e.source===`data_field`){let n=t.zeileDerQuelle?.(e.dataSourceId??``);if(n!==void 0)return k(n,e.value)}if(!D(n))return``;if(e.source===`se_variable`){let t=n.SEDATA;if(!D(t)||!D(t.Daten)||!D(t.Daten.VARArrays))return``;let r=t.Daten.VARArrays[e.value];return r==null?``:String(r)}let r=O(n.FF_DATA_SOURCES,e.dataSourceId??``);if(!r)return``;let i=Nt(n.SEDATA,r.name,r.tableId),a=t.context.PINDEX??``,o=a!==``&&r.indexField!==``?i.find(e=>k(e,r.indexField)===a):i[0];return o?k(o,e.value):``}var Gn=999,Kn=`0`,qn=`255`,Jn=new Map;function Yn(e){let t=kt(e);Ot(e,[]),t!==void 0&&t.length>0&&gn()}async function Xn(e,t,n,r,i){let a=await Hn({id:`relation-lader`,verb:`GET_RELATION`,nr:e.nr,params:[]},[t.belegart,r,i,t.belegnummer,t.jahr,t.archiv,``,String(n),``,``,``,``],{still:!0,satzAntwort:!0});return{wert:a.wert,geantwortet:a.geantwortet}}function Zn(e,t,n){let r=(Jn.get(e.id)??0)+1;if(Jn.set(e.id,r),n===void 0){Yn(e.name);return}let i={belegart:k(n,t.belegartFeld),belegnummer:k(n,t.belegnummerFeld),jahr:t.jahrFeld===``?``:k(n,t.jahrFeld),archiv:t.archivFeld===``?``:k(n,t.archivFeld)};if(i.belegart===``||i.belegnummer===``){Yn(e.name);return}Yn(e.name),(async()=>{let n=[],a=`deckel`;for(let o=1;o<=Gn;o+=1){let s=await Xn(t,i,o,Kn,qn);if(Jn.get(e.id)!==r)return;if(!s.geantwortet){a=`keineAntwort`;break}let c=s.wert;if(t.endeFelder.every(e=>k({SATZ:c},e)===``)){a=`ende`;break}let l={SATZ:c};for(let n of t.zusatzFelder){let s=n.indexOf(`_`),c=await Xn(t,i,o,n.slice(0,s),n.slice(s+1));if(Jn.get(e.id)!==r)return;if(!c.geantwortet){a=`keineAntwort`;break}l[n]=c.wert}if(a===`keineAntwort`)break;n.push(l)}a===`keineAntwort`?F(`Positionen laden: SoftEngine hat bei Zeile ${n.length+1} nicht geantwortet (Relation Nr. ${t.nr}). Die Liste bricht hier ab — angezeigt werden die ${n.length} Zeilen davor, es fehlen möglicherweise weitere.`):a===`deckel`&&F(`Positionen laden: nach ${Gn} Zeilen ohne Ende-Kennung abgebrochen (Relation Nr. ${t.nr}) — die Liste ist wahrscheinlich unvollständig, vermutlich passen Relationsnummer oder Ende-Felder nicht.`),Jn.get(e.id)===r&&(Ot(e.name,n),gn())})()}var Qn=new Map,$n=!1;function er(){let e=new Map;for(let t of Xe())t.satzWahl&&e.set(t.tagName.toLowerCase(),(t.satzWahl.quelleProp??`source`).toLowerCase());return e}function tr(e,t,n=typeof document>`u`?void 0:document){if(e===``||n===void 0||typeof n.querySelectorAll!=`function`)return;let r=null;for(let i of Array.from(n.querySelectorAll(`[data-ff-id]`))){let n=t.get(i.tagName.toLowerCase());if(n===void 0||i.getAttribute(n)!==e)continue;let a=i.getAttribute(`data-ff-id`)??``,o=Gt(a);if(o===void 0)continue;let s=qt(a);(r===null||s>r.nummer)&&(r={zeile:o,nummer:s})}return r?.zeile}function nr(){let e=I().FF_DATA_SOURCES;if(!Array.isArray(e))return;let t=er();for(let n of e){if(!D(n)||typeof n.id!=`string`)continue;let r=O(e,n.id);if(!r?.ladeRelation)continue;let i=tr(r.ladeRelation.geberQuelleId,t),a=Lt(i);Qn.get(r.id)!==a&&(Qn.set(r.id,a),Zn(r,r.ladeRelation,i))}}function rr(){$n||($n=!0,Wt(nr),Qt(()=>Qn.clear()))}var ir=`ff-dialog-rahmen`,ar=`ff-dialog-schliessen`,or=`ff-dialog-groesse`;function sr(e,t){let n=Number(e);return Number.isFinite(n)&&n>0?n:t}var L=class extends x{constructor(...e){super(...e),this.titel=`Dialog`,this.breite=520,this.hoehe=380,this.viewport=!1,this.escapeSchliesst=!1,this.ohneModal=!1,this.inhaltFest=!1,this.ziehbar=!1,this.escapeRegistriert=!1,this.aufTaste=e=>{e.key===`Escape`&&(e.stopPropagation(),this.schliesse())}}static{this.styles=o`
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
      </ff-dialog-rahmen>`}};w([S()],R.prototype,`name`,void 0),w([S()],R.prototype,`breite`,void 0),w([S()],R.prototype,`hoehe`,void 0),w([S({type:Boolean,reflect:!0})],R.prototype,`offen`,void 0),T.defineAndRegister(R);function ur(e,t){let n=`0,START_TOOL,`+e;return t.length>0&&(n+=`,`+t.map(e=>encodeURIComponent(e)).join(`,`)),n}function dr(e,t){if(e.trim()===``)return;let n=I();try{if(typeof n.sendBWLinkIntern==`function`){n.sendBWLinkIntern(ur(e,t));return}}catch{}try{if(typeof n.basisHTML_SND_MSG==`function`){let r={NR:e};t.length>0&&(r.PARAMS=[...t]),n.basisHTML_SND_MSG(`START_TOOL`,r)}}catch{}}function fr(e,t,n){if(t.trim()===``)return;let r=Array.from(e.querySelectorAll(R.tagName)),i=r.filter(e=>(e.getAttribute(`name`)??R.defaultProps.name)===t);if(i.length===0){F(`Fenster „`+t+`“ gibt es in dieser Maske nicht.`);return}if(i.length>1){F(`Fenster „`+t+`“ gibt es mehrfach — keines ist gemeint.`);return}let a=i[0];if(!n){a.removeAttribute(`offen`);return}for(let e of r)e!==a&&e.removeAttribute(`offen`);a.setAttribute(`offen`,``)}var pr=new WeakMap;function mr(e){F(`Aktionskette fehlgeschlagen: `+(e instanceof Error?e.message:String(e)))}function hr(e){let t=new Set;for(let n of e)if(n.type===`RELATION`)for(let e of[...n.params,...n.extraParams]){let n=e.dataSourceId??``;e.source===`data_field`&&n!==``&&t.add(n)}return t}function gr(e,t){return t.size===0?[]:Array.from(e.querySelectorAll(`[${_t}]`)).filter(e=>{let n=e.erfassteQuellen;return Array.isArray(n)&&n.some(e=>t.has(e))})}function _r(e){let t=er();return n=>{if(n===``)return;let r=e?.[n];return r===void 0?tr(n,t):r}}async function vr(e,t,n,r){let i={...n,NOW_DATE:Cn(new Date)},a=``,o=[],s=[],c=()=>{o.push(``),s.push(void 0)};for(let n of t){if(n.type===`START_TOOL`){dr(n.toolNr,wn({params:n.toolParams},i)),c();continue}if(n.type===`POPUP_OPEN`||n.type===`POPUP_CLOSE`){fr(e.ownerDocument??document,n.popup??``,n.type===`POPUP_OPEN`),c();continue}let t=En(I().FF_RELATIONS,n.relationId);if(!t){c();continue}let l={context:i,previousResult:a,stepResults:o,stepRohErgebnisse:s,gewaehlteZeile:Gt,zeileDerQuelle:_r(r)},u=await Hn(t,[...n.params,...n.extraParams].map(e=>Wn(e,l))),d=u.wert;o.push(d),s.push(u.roh),t.verb===`GET_RELATION`&&(a=d),n.resultKey!==``&&(i[n.resultKey]=d)}}async function yr(e,t,n){if(e.hasAttribute(`data-ff-editor`))return;let r=wt(e.getAttribute(`data-ff-aktionen`))[t];if(!r||r.length===0)return;let i=pr.get(e);if(i||(i=new Set,pr.set(e,i)),!i.has(t)){i.add(t);try{let t=gr(e.ownerDocument??document,hr(r));if(t.length===0){await vr(e,r,n,void 0);return}if(t.length>1){F(`Die Kette liest erfasste Zeilen aus mehreren Tabellen — nur eine Tabelle je Kette.`);return}let i=t[0].erfassteSaetze??[];for(let t of i)await vr(e,r,n,t);i.length>0&&t[0].erfassungLeeren?.()}finally{i.delete(t)}}}var br=new WeakSet;function xr(e,t){if(e.hasAttribute(`data-ff-editor`)||!e.hasAttribute(`data-ff-aktionen`)||br.has(e))return;br.add(e);let n=wt(e.getAttribute(`data-ff-aktionen`));Object.values(n).some(e=>e.some(e=>e.type===`RELATION`))&&xn(),e.addEventListener(`click`,()=>{yr(e,t,{}).catch(mr)})}var Sr=class extends T{constructor(...e){super(...e),this.label=`Klick mich`}static{this.blockType=`button`}static{this.tagName=`ff-button`}static{this.displayName=`Schaltfläche`}static{this.category=`eingabe`}static{this.defaultProps={label:`Klick mich`}}static{this.resizableWidth=!1}static{this.blockEvents=[{key:`onClick`,name:`Klick`}]}static{this.raster={startW:4,startH:2,minW:2,minH:2}}static{this.customProperties=[]}static{this.styles=[T.styles,o`
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
    >${this.label}</button>`}connectedCallback(){super.connectedCallback(),xr(this,`onClick`)}};w([S()],Sr.prototype,`label`,void 0),T.defineAndRegister(Sr);var Cr=[`info`,`success`,`warning`,`danger`];function wr(e){return Cr.includes(e)?e:`info`}var Tr=[{wert:`info`,name:`Hinweis`},{wert:`success`,name:`Erfolg`},{wert:`warning`,name:`Warnung`},{wert:`danger`,name:`Fehler`}];function Er(e,t){return{attributeName:e,name:`Bedeutung`,description:t,kind:`select`,options:Tr.map(e=>({value:e.wert,label:e.name}))}}var Dr=o`

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
`,Or=Ae`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`;function kr(){return g`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${Or}</svg>`}var Ar=[[`welpe`,`hund`],[`hund`,`hund`],[`kater`,`katze`],[`katze`,`katze`],[`kaninchen`,`kaninchen`],[`hase`,`kaninchen`],[`meerschwein`,`meerschweinchen`],[`hamster`,`hamster`],[`ratte`,`hamster`],[`maus`,`hamster`],[`wellensittich`,`vogel`],[`sittich`,`vogel`],[`papagei`,`vogel`],[`vogel`,`vogel`],[`schildkr`,`schildkroete`],[`schlange`,`schlange`],[`natter`,`schlange`],[`python`,`schlange`],[`echse`,`schlange`],[`gecko`,`schlange`],[`reptil`,`schlange`],[`fisch`,`fisch`],[`koi`,`fisch`],[`pferd`,`pferd`],[`pony`,`pferd`],[`fohlen`,`pferd`]];function jr(e){let t=e.toLowerCase();for(let[e,n]of Ar)if(t.includes(e))return n;return``}function Mr(e){if(e===``)return;let t=globalThis.FF_TIER_BILDER;if(typeof t!=`object`||!t)return;let n=t[e];return typeof n==`string`&&n!==``?n:void 0}function Nr(e){let t=Mr(jr(e));if(t!==void 0)return g`<img src=${t} alt="" aria-hidden="true" />`}function Pr(e){return Nr(e)??kr()}var Fr=o`

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
`,z=class extends T{constructor(...e){super(...e),this.chipVariant=`info`,this.heading=``,this.heading2=``,this.time=``,this.date=``,this.avatar=``,this.meta=``,this.text=``,this.chipText=``,this.headingField=``,this.heading2Field=``,this.timeField=``,this.dateField=``,this.avatarField=``,this.metaField=``,this.textField=``,this.chipTextField=``}static{this.blockType=`card`}static{this.tagName=`ff-card`}static{this.displayName=`Karte`}static{this.category=`anzeige`}static{this.allowedParentTypes=[`kanban-spalte`,`kanban-zimmer`]}static{this.showInPalette=!1}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={chipVariant:`info`,heading:``,heading2:``,time:``,date:``,avatar:``,meta:``,text:``,chipText:``,headingField:``,heading2Field:``,timeField:``,dateField:``,avatarField:``,metaField:``,textField:``,chipTextField:``}}static{this.brauchtTierbilder=e=>String(e.avatar??``).trim()!==``||String(e.avatarField??``).trim()!==``}static{this.bindableSpots=[{prop:`time`,label:`Zeit`},{prop:`date`,label:`Datum`},{prop:`avatar`,label:`Avatar`},{prop:`heading`,label:`Titel`},{prop:`heading2`,label:`Titel 2`},{prop:`meta`,label:`Unterzeile`},{prop:`text`,label:`Textzeile`},{prop:`chipText`,label:`Chip`}]}static{this.customProperties=[Er(`chipVariant`,`Bedeutung des Chips auf der Karte — bestimmt die Chip-Farbe.`)]}static{this.styles=[T.styles,Dr,Fr]}stelle(e,t){return g`<span
      class=${t}
      data-ff-editable
      data-ff-spot=${e}
      ?data-ff-bound=${this[`${e}Field`]!==``}
      @dblclick=${t=>this.inlineEdit(t,e)}
    >${this[e]}</span>`}hatReiter(){return this.hasAttribute(`data-ff-editor`)||this.date.trim()!==``||this.time.trim()!==``}updated(e){super.updated(e),this.toggleAttribute(`hat-reiter`,this.hatReiter())}render(){let e=wr(this.chipVariant),t=this.hasAttribute(`data-ff-editor`),n=e=>t||e.trim()!==``,r=this.hatReiter(),i=n(this.avatar)||n(this.heading)||n(this.meta),a=n(this.heading2)||n(this.chipText);return g`<div class="card v-${e}${r?``:` ohne-reiter`}">
      ${r?g`<span class="reiter">
            ${n(this.date)?this.stelle(`date`,`datum`):v}
            ${n(this.time)?this.stelle(`time`,`zeit`):v}
          </span>`:v}
      ${i?g`<div class="kopf">
            ${n(this.avatar)?g`<span
                  class="avatar"
                  data-ff-spot="avatar"
                  ?data-ff-bound=${this.avatarField!==``}
                >${this.avatar.trim()===``?v:Pr(this.avatar)}</span>`:v}
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
    </div>`}};w([S()],z.prototype,`chipVariant`,void 0),w([S()],z.prototype,`heading`,void 0),w([S()],z.prototype,`heading2`,void 0),w([S()],z.prototype,`time`,void 0),w([S()],z.prototype,`date`,void 0),w([S()],z.prototype,`avatar`,void 0),w([S()],z.prototype,`meta`,void 0),w([S()],z.prototype,`text`,void 0),w([S()],z.prototype,`chipText`,void 0),w([S()],z.prototype,`headingField`,void 0),w([S()],z.prototype,`heading2Field`,void 0),w([S()],z.prototype,`timeField`,void 0),w([S()],z.prototype,`dateField`,void 0),w([S()],z.prototype,`avatarField`,void 0),w([S()],z.prototype,`metaField`,void 0),w([S()],z.prototype,`textField`,void 0),w([S()],z.prototype,`chipTextField`,void 0),T.defineAndRegister(z);function Ir(e){let t=String(e??``).trim();if(t===``)return``;let n=/^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(t);if(n)return`${n[3]}-${n[2].padStart(2,`0`)}-${n[1].padStart(2,`0`)}`;let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);return r?`${r[1]}-${r[2]}-${r[3]}`:``}function Lr(e){let t=String(e.getMonth()+1).padStart(2,`0`),n=String(e.getDate()).padStart(2,`0`);return`${e.getFullYear()}-${t}-${n}`}function Rr(e,t){let n=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!n)return``;let r=new Date(Number(n[1]),Number(n[2])-1,Number(n[3]));return r.setDate(r.getDate()+t),Lr(r)}var zr=``,Br=new Set;function Vr(){return zr}function Hr(e){let t=Ir(e);t!==zr&&(zr=t,Br.forEach(e=>e()))}function Ur(e){return Br.add(e),()=>{Br.delete(e)}}var Wr=class extends T{constructor(...e){super(...e),this.tag=``,this.tagAbmelden=null}static{this.blockType=`datum`}static{this.tagName=`ff-datum`}static{this.displayName=`Datum`}static{this.category=`anzeige`}static{this.defaultProps={}}static{this.customProperties=[]}static{this.raster={startW:9,startH:2,minW:5,minH:2}}static{this.styles=[T.styles,o`

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
    `]}setzeTag(e){Hr(e),this.tag=Vr()}render(){return g`<div class="waehler">
      <div class="riegel">
        <button class="pfeil" title="Vortag" @click=${()=>this.setzeTag(Rr(this.tag,-1))}>‹</button>
        <input
          class="feld"
          type="date"
          .value=${this.tag}
          @change=${e=>this.setzeTag(e.target.value)}
        />
        <button class="pfeil" title="Folgetag" @click=${()=>this.setzeTag(Rr(this.tag,1))}>›</button>
      </div>
      <button class="heute" @click=${()=>this.setzeTag(Lr(new Date))}>Heute</button>
    </div>`}connectedCallback(){super.connectedCallback(),this.tag=Vr()||Lr(new Date),!this.hasAttribute(`data-ff-editor`)&&(this.setzeTag(this.tag),this.tagAbmelden?.(),this.tagAbmelden=Ur(()=>{this.tag=Vr()}))}disconnectedCallback(){super.disconnectedCallback(),this.tagAbmelden?.(),this.tagAbmelden=null}};w([C()],Wr.prototype,`tag`,void 0),T.defineAndRegister(Wr);function Gr(e){return e.trim().toLowerCase().split(/\s+/).filter(e=>e!==``)}function Kr(e,t){let n=Gr(t);if(n.length===0)return!0;let r=e.join(` `).toLowerCase();return n.every(e=>r.includes(e))}function qr(e,t,n=8){if(t.trim()===``)return[];let r=[];for(let i of e)if(Kr([i.anzeige,i.wert],t)&&(r.push(i),r.length>=n))break;return r}function Jr(e,t,n){return t<=0?0:((e+n)%t+t)%t}function Yr(e,t){return t<=0||e<0||e>=t?0:e}function Xr(e,t){return e===`ArrowDown`?t.listeOffen?`marke-runter`:`nichts`:e===`ArrowUp`?t.listeOffen?`marke-hoch`:`nichts`:e===`Escape`?t.listeOffen?`liste-zu`:`nichts`:e===`Enter`?t.listeOffen?`uebernehmen`:t.feldLeer?`fenster`:`nichts`:`nichts`}function Zr(e){return g`<ul
    class="vorschlaege"
    @mousedown=${e=>e.preventDefault()}
  >${e.eintraege.map((t,n)=>g`<li
      class=${n===e.marke?`vorschlag marke`:`vorschlag`}
      @click=${()=>e.onWaehlen(n)}
      @mouseenter=${()=>e.onMarke(n)}
    ><span class="vorschlag-anzeige">${t.anzeige===``?t.wert:t.anzeige}</span>${t.wert!==``&&t.wert!==t.anzeige?g`<span class="vorschlag-wert">${t.wert}</span>`:v}</li>`)}</ul>`}var Qr=240;function $r(e){let t=e.querySelector(`.vorschlaege`);if(t===null)return;ti(e,t);let n=t.previousElementSibling??t.parentElement;if(!(n instanceof HTMLElement))return;let r=n.getBoundingClientRect(),i=window.innerHeight-r.bottom,a=i<248&&r.top>i,o=Math.max(80,Math.min(Qr,(a?r.top:i)-8));t.style.position=`fixed`,t.style.left=`${r.left}px`,t.style.width=`${r.width}px`,t.style.right=`auto`,t.style.maxHeight=`${o}px`,t.style.top=a?`auto`:`${r.bottom+2}px`,t.style.bottom=a?`${window.innerHeight-r.top+2}px`:`auto`}var ei=new WeakSet;function ti(e,t){for(let n=t.parentElement;n!==null;n=n.parentElement){let t=getComputedStyle(n).overflowY;if(!(t!==`auto`&&t!==`scroll`)){ei.has(n)||(ei.add(n),n.addEventListener(`scroll`,()=>$r(e),{passive:!0}));return}}}var ni=o`
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
`;function ri(e,t,n,r){return{attributeName:e,name:t,description:n,kind:`segment`,options:[{value:`nein`,label:`Nein`},{value:`ja`,label:`Ja`}],...r}}var ii={attributeName:`fieldType`,equals:`nachschlagen`},ai=[{attributeName:`fieldType`,name:`Feldtyp`,description:`Welche Art Eingabe das Feld annimmt.`,kind:`select`,options:[{value:`text`,label:`Text`},{value:`number`,label:`Zahl`},{value:`textarea`,label:`Mehrzeilig`},{value:`select`,label:`Auswahl`},{value:`date`,label:`Datum`},{value:`time`,label:`Uhrzeit`},{value:`checkbox`,label:`Ankreuzfeld`},{value:`nachschlagen`,label:`Nachschlagen`}]},{attributeName:`options`,name:`Auswahl-Optionen`,description:`Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.`,kind:`text`,visibleWhen:{attributeName:`fieldType`,equals:`select`}},{attributeName:`nachschlagQuelle`,name:`Quelle`,description:`Nur bei Feldtyp "Nachschlagen": aus dieser Datenquelle wählt der Bediener eine Zeile.`,kind:`quelle`,visibleWhen:ii},{attributeName:`speicherFeld`,name:`Gespeichert wird`,description:`Feld der Nachschlage-Quelle, dessen Wert die Maske sich merkt und die Kette "Wert geändert" weitergibt (z. B. die Nummer). Im Feld sichtbar ist die erste Spalte des Nachschlage-Fensters — ohne eigene Spalten ist das dieser Wert selbst.`,kind:`field`,quelleProp:`nachschlagQuelle`,klarnameProp:`speicherTitel`,visibleWhen:ii},ri(`einzigerTreffer`,`Einzigen Treffer übernehmen`,`Bleibt in der Maske genau EIN Satz übrig (weil das Feld der Auswahl eines anderen folgt), übernimmt es diesen von selbst — ohne dass der Bediener die Lupe drückt. Nur in ein leeres Feld; die Lupe bleibt daneben bedienbar.`,{visibleWhen:ii}),{attributeName:`valueField`,name:`Feld`,description:`Feld der angeschlossenen Datenquelle, dessen Wert angezeigt und lokal aktualisiert wird.`,kind:`field`,visibleWhen:{attributeName:`fieldType`,keinesVon:[`checkbox`,`nachschlagen`]}}];function oi(e){let t=new Set,n=!1,r=()=>{cn()&&t.forEach(e.hydriere)};return{connect:i=>{i.hasAttribute(`data-ff-editor`)||(t.add(i),e.verdrahte?.(i),n||(n=!0,pn(r),Ur(r),Wt(r),rr()),xn(),cn()&&e.hydriere(i))},disconnect:e=>{t.delete(e)}}}var si=ot.toLowerCase(),ci=``;function li(e){if(e.length===0)return``;let t=[];for(let n of e){let e=n.trim();if(e===``)return``;t.push(e)}return t.join(ci)}function ui(e){return It(e,si,`quelleId`,`vonQuelleId`).map(e=>({quelleId:e.id,...e.von===void 0?{}:{vonQuelleId:e.von},keyPairs:e.keyPairs}))}function di(e){let t=ui(e);if(t.length===0)return(e,t)=>k(e,it(t).code);let n=I().SEDATA,r=I().FF_DATA_SOURCES,i=new Map;for(let e of t){let t=O(r,e.quelleId);if(!t)continue;let a=Nt(n,t.name,t.tableId),o=new Map;for(let t of a){let n=li(e.keyPairs.map(e=>k(t,e.toField)));n!==``&&!o.has(n)&&o.set(n,t)}i.set(e.quelleId,{nachSchluessel:o,hierFelder:e.keyPairs.map(e=>e.fromField),von:e.vonQuelleId??``})}let a=(e,n,r)=>{let o=i.get(n);if(!o||r>t.length)return;let s=o.von===``?e:a(e,o.von,r+1);if(s===void 0)return;let c=li(o.hierFelder.map(e=>k(s,e)));if(c!==``)return o.nachSchluessel.get(c)};return(e,t)=>{let{quelleId:n,code:r}=it(t);if(n===``)return k(e,r);let i=a(e,n,0);return i===void 0?``:k(i,r)}}function fi(e,t){let n=e.getAttribute(`source`)??``,r=e.getAttribute(t)??``;if(n===``||r===``)return{art:`ungebunden`};let i=O(I().FF_DATA_SOURCES,n);if(!i)return{art:`ohneQuelle`};let a=nn(e,Nt(I().SEDATA,i.name,i.tableId));if(a===void 0)return{art:`ohneZeile`};let{quelleId:o,code:s}=it(r);return{art:`wert`,wert:o===``?k(a,s):di(e)(a,r),zeile:a,quelle:i,quelleId:o,reinerCode:s}}var pi=new WeakMap,mi=new WeakSet;function hi(e){let t=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(e);return t?`${t[3]}-${t[2]}-${t[1]}`:e}function gi(e){let t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);return t?`${t[3]}.${t[2]}.${t[1]}`:e}function _i(e){return typeof e.value==`string`?e.value:``}function vi(e){if(e.pruefeEigenenWert?.(),e.getAttribute(`fieldtype`)===`nachschlagen`){pi.delete(e);return}let t=fi(e,rt(`value`));if(t.art!==`wert`){pi.delete(e),t.art===`ohneZeile`&&(e.value=``);return}let{zeile:n,quelle:r,quelleId:i,reinerCode:a,wert:o}=t,s=jt(r,n);i===``?pi.set(e,{row:n,code:a,pindex:s}):pi.delete(e),e.value=o}function yi(e){let t=pi.get(e);return t&&Mt(t.row,t.code,_i(e)),t}function bi(e){mi.has(e)||(mi.add(e),e.addEventListener(`input`,()=>{yi(e)}),e.addEventListener(`change`,()=>{let t=yi(e);yr(e,`onChange`,{VALUE:_i(e),PINDEX:t?.pindex??``}).catch(mr)}))}var xi=oi({hydriere:vi,verdrahte:bi}),Si=xi.connect,Ci=xi.disconnect,wi=o`
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
`,Ti=[`text`,`number`,`textarea`,`select`,`date`,`time`,`checkbox`,`nachschlagen`];function Ei(e){return Ti.includes(e)?e:`text`}var Di=[`text`,`number`,`textarea`,`select`,`nachschlagen`,`date`,`time`],Oi={select:`ph-select`,date:`ph-nativ`,time:`ph-nativ`,nachschlagen:`ph-nachschlag`};function ki(){return g`<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
      <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
    </svg>`}var Ai=4;function ji(e){return e??Ai}function Mi(e,t,n){return Math.max(1,Math.floor((e-t)/n))}function Ni(e,t,n){let r=Mi(e,t,n),i=e-t;return i<n?{passen:r,zeilenHoehe:n}:{passen:r,zeilenHoehe:Math.floor(i/r*100)/100}}function Pi(e,t){return e===null?null:Math.max(0,e-t)}function Fi({sichtbar:e,hatQuelle:t,proSeite:n,wunschSeite:r,platzhalterZeilen:i}){let a=t?Math.max(1,Math.ceil(e.length/n)):1,o=Math.min(Math.max(r,0),a-1);return t?{seiten:a,seite:o,zeilen:[...e.slice(o*n,(o+1)*n)]}:{seiten:a,seite:o,zeilen:Array.from({length:i},()=>null)}}function Ii(e,t){let n=t.trim().toLowerCase();return e.find(e=>e.wert.trim().toLowerCase()===n)}var B=`text`,Li=`status`,Ri=`bild`,zi=`bild`,Bi=`unter`,Vi=[{wert:B,name:`Text`,spur:`minmax(0, 1fr)`,klasse:``,zelle:e=>e},{wert:`zahl`,name:`Zahl`,spur:`90px`,klasse:`zahl`,zelle:e=>e},{wert:`datum`,name:`Datum`,spur:`100px`,klasse:`zahl`,zelle:e=>e},{wert:Li,name:`Status`,spur:`120px`,klasse:`status`,zelle:(e,t)=>{let n=Ii(t,e);return n?g`<span class="chip v-${wr(n.bedeutung)}">${n.name.trim()===``?e:n.name}</span>`:g`<span class="chip">${e}</span>`}},{wert:Ri,name:`Bild + Name`,spur:`minmax(0, 1fr)`,klasse:`bild`,zusatzFelder:[{key:zi,label:`Bild`},{key:Bi,label:`Unterzeile`}],hoehe:e=>(e[zi]??``)!==``||(e[Bi]??``)!==``?44:32,zelle:(e,t,n)=>{let r=Nr(n[zi]??``),i=n[Bi]??``;return g`<div class="bild-name">
        ${r===void 0?v:g`<span class="bild-zeichen">${r}</span>`}
        <div class="bild-text">
          <div class="bild-titel">${e}</div>
          ${i===``?v:g`<div class="bild-unter">${i}</div>`}
        </div>
      </div>`}}];function Hi(e){return e.reduce((e,t)=>{let n=V(t.art);return Math.max(e,n.hoehe?.(t.felder??{})??32)},32)}function V(e){return Vi.find(t=>t.wert===e)??Vi[0]}var Ui=Vi.map(e=>({wert:e.wert,name:e.name,...e.zusatzFelder?{felder:e.zusatzFelder}:{}})),Wi=`felder`,Gi=`suchtIn`,Ki=`suchFelder`;function qi(e){return Array.isArray(e)?e.map(e=>{if(typeof e==`string`)return{feld:e.trim(),titel:e.trim()};if(!e||typeof e!=`object`)return{feld:``,titel:``};let t=e,n=typeof t.feld==`string`?t.feld.trim():``;return{feld:n,titel:typeof t.titel==`string`&&t.titel.trim()!==``?t.titel.trim():n}}).filter(e=>e.feld!==``):[]}var Ji=`Spalte {n}`;function Yi(e){return Ji.replace(`{n}`,String(e+1))}function H(e){return{titel:Yi(e),feld:``,art:B}}function Xi(){return[0,1,2].map(e=>H(e))}function Zi(e){return Array.isArray(e)?e.filter(e=>!!e&&typeof e==`object`).map(e=>({wert:typeof e.wert==`string`?e.wert:``,name:typeof e.name==`string`?e.name:``,bedeutung:typeof e.bedeutung==`string`?e.bedeutung:``})).filter(e=>e.wert.trim()!==``):[]}function Qi(e){if(!e||typeof e!=`object`||Array.isArray(e))return{};let t={};for(let[n,r]of Object.entries(e))typeof r==`string`&&r!==``&&(t[n]=r);return t}function $i(e,t){if(e&&typeof e==`object`){let n=e,r=Zi(n.zuordnung),i=Qi(n.felder),a=typeof n.suchtIn==`string`?n.suchtIn.trim():``,o=qi(n.suchFelder);return{titel:typeof n.titel==`string`?n.titel:Yi(t),feld:typeof n.feld==`string`?n.feld:``,art:typeof n.art==`string`?n.art:B,...a===``?{}:{suchtIn:a},...o.length>0?{suchFelder:o}:{},...r.length>0?{zuordnung:r}:{},...Object.keys(i).length>0?{felder:i}:{}}}return typeof e==`string`?{...H(t),titel:e}:H(t)}function ea(e){let t;if(Array.isArray(e))t=e.map((e,t)=>$i(e,t));else if(typeof e==`number`&&Number.isFinite(e)||typeof e==`string`&&/^\d+$/.test(e)){let n=Math.max(1,Math.floor(Number(e)));t=[...Array(n).keys()].map(e=>H(e))}else t=Xi();return t.length>16&&(t=t.slice(0,16)),t.length<1&&(t=[H(0)]),t}function ta(e){try{return ea(JSON.parse(e))}catch{return Xi()}}var na={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ra=e=>(...t)=>({_$litDirective$:e,values:t}),ia=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},aa=`important`,oa=` !important`,U=ra(class extends ia{constructor(e){if(super(e),e.type!==na.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(oa);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?aa:``):n[e]=r}}return _}}),sa=`Keine Datensätze.`;function ca(){return{attributeName:`leerText`,name:`Text ohne Datensätze`,description:`Steht in der Maske dort, wo sonst die Zeilen stehen — wenn die Datenquelle keine liefert. Leer lassen: dann steht dort gar nichts.`,kind:`text`,requiresDataSource:!0}}function la(e,t=!1){return e.trim()===``?v:g`<div class="leer${t?` leer--tafel`:``}">
    ${kr()}
    <span>${e}</span>
  </div>`}var ua=o`
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
`;function da(e,t){if(!e.hasAttribute(`fuellt`))return null;let n=e.renderRoot.querySelector(`.koerper`);return n instanceof HTMLElement?Ni(n.clientHeight,(t=>{let n=e.renderRoot.querySelector(t);return n instanceof HTMLElement?n.offsetHeight:0})(`.kopf`),t):null}function fa(e,t){if(typeof ResizeObserver>`u`)return null;let n=e.renderRoot.querySelector(`.koerper`);if(!n)return null;let r=new ResizeObserver(t);return r.observe(n),r}function pa(e,t){return e.verknuepfungen.find(e=>e.quelleId===t)?.keyPairs??[]}function ma(e,t){let n=e.verknuepfungen.find(e=>e.quelleId===t);return n===void 0?e.quelleId:lt(n,e.quelleId)}function ha(e,t,n){return ut(e?.feld??``,e?.suchtIn??``,t,n)}function W(e,t){return ha(e.spalten[t],e.quelleId,e.verknuepfungen)}function ga(e){let t=[],n=e=>{e!==``&&!t.includes(e)&&t.push(e)};for(let t=0;t<e.spalten.length;t++){let r=W(e,t);r.art===`auswahl`&&n(r.quelleId),n(r.suchQuelleId)}return t}function _a(e,t){let n=W(e,t);if(n.suchQuelleId===``)return;let r=va(e,t)[0];if(r!==void 0)return{titel:r.titel,code:r.feld};let i=n.quelleId===n.suchQuelleId?n.code:``;for(let r=0;r<e.spalten.length;r++){if(r===t)continue;let a=W(e,r);if(!(a.art!==`auswahl`||a.quelleId!==n.suchQuelleId)&&!(a.code===``||a.code===i))return{titel:e.spalten[r].titel,code:a.code}}}function va(e,t){return e.spalten[t]?.suchFelder??[]}function ya(e,t){let n=e.spalten[t];if(n===void 0)return[];let r=va(e,t);if(r.length>0)return r.map(e=>({titel:e.titel,feld:e.feld,art:B}));let i=_a(e,t),a=W(e,t);if(i===void 0)return[];let o=a.quelleId===a.suchQuelleId?a.code:``,s={titel:i.titel,feld:i.code,art:B};return o===``?[s]:[s,{titel:n.titel,feld:o,art:B}]}function ba(e,t,n){let r=e.map(e=>({toField:e.toField,soll:t(e.fromField)})).filter(e=>e.soll!==void 0);return r.length===0?[...n]:n.filter(e=>r.every(t=>t.soll!==``&&t.soll===k(e,t.toField)))}function xa(e,t){let n=W(e,t);if(n.art===`auswahl`||n.suchQuelleId===``)return``;let r=va(e,t)[0]?.feld??``;return r===``?n.art===`frei`?_a(e,t)?.code??``:``:r}var Sa=`32px`;function Ca(e){return String(e).padStart(2,`0`)}function wa(e){return g`<div
    class=${e.aktiv?`griff aktiv`:`griff`}
    role="cell"
    @click=${e.aufKlick??v}
  >${e.nummer===null?v:Ca(e.nummer)}</div>`}function Ta(){return g`<div class="griff leer" role="presentation"></div>`}function Ea(e,t,n){return g`<input
    class="erf-eingabe"
    type="text"
    data-spalte=${n}
    placeholder=${e.umfeld.spalten[n]?.titel??``}
    .value=${e.wert(n)}
    @input=${e=>t.tippen(n,e.target.value)}
    @keydown=${e=>t.taste(n,e)}
    @focus=${()=>t.betreten(n)}
    @blur=${()=>t.verlassen(n)}
  />`}function Da(e,t,n,r){if(!r)return Ea(e,t,n);let i=e.tippSpalte===n&&e.vorschlaege.length>0;return g`<div class=${e.listeNachOben?`erf-halter nach-oben`:`erf-halter`}>
    ${Ea(e,t,n)}
    ${i?Zr({eintraege:e.vorschlaege,marke:e.marke,onWaehlen:e=>t.waehleVorschlag(e),onMarke:e=>t.setzeMarke(e)}):v}
  </div>`}function Oa(e){return[`zeile`,`erfassung`].concat(e.aktiv?[`aktiv`]:[],e.gefuellt?[`gefuellt`]:[]).join(` `)}function ka(e,t){return g`<div
    class=${Oa(e)}
    role="row"
    data-erf-zeile=${e.zeile}
    style=${U(e.cols)}
  >
    ${wa({nummer:e.nummer,aktiv:e.aktiv,aufKlick:()=>t.waehleZeile()})}
    ${e.umfeld.spalten.map((n,r)=>{let i=V(n.art).klasse;if(e.imEditor){let t=e.zellenGriff;return g`<div
          class=${i}
          role="cell"
          data-ff-editable=${t?``:v}
          @click=${t?e=>t(e,r):v}
        >${t?g`<span class="spalten-name">${n.titel}</span>`:`—`}</div>`}return g`<div class=${i} role="cell">${Da(e,t,r,W(e.umfeld,r).suchQuelleId!==``)}</div>`})}
  </div>`}function Aa(e,t,n,r){let i=e.anschluss.lauf(t),a=i.vorschlaege[r];a!==void 0&&(i.uebernimm(e.umfeld(),n,a.satz),e.melde())}function ja(e,t,n){let r=e.umfeld(),i=r.spalten[n],a=W(r,n);if(i===void 0||a.suchQuelleId===``)return;let o=e.anschluss.lauf(t);is({el:e.baustein,quelleId:a.suchQuelleId,speicherFeld:a.quelleId===a.suchQuelleId?a.code:``,speicherTitel:i.titel,spalten:ya(r,n),titel:i.titel,breite:520,hoehe:380,eintraege:o.eintraege(r,n),rueckFokus:null,onUebernehmen:(t,r,i)=>{o.uebernimm(e.umfeld(),n,i),e.melde()}})}function Ma(e,t,n,r){let i=e.umfeld(),a=r===`enter`?e.anschluss.lauf(t).naechsteLeere(i,n):n+1<i.spalten.length?n+1:-1;if(a!==-1){e.fokussiere(t,a);return}let o=r===`enter`?e.anschluss.weiter(i,t):t+1<e.anschluss.anzahl?t+1:null;if(o===null)return;r===`tab`&&e.anschluss.waehle(o);let s=e.anschluss.lauf(o).naechsteLeere(i,-1);e.fokussiere(o,r===`enter`&&s!==-1?s:0)}function Na(e,t,n,r){let i=t+r;return i<0||i>=e.anschluss.anzahl?!1:(e.fokussiere(i,n),!0)}function Pa(e,t,n,r){if(r.key===`Tab`&&r.shiftKey)return;let i=r.key===`Tab`?`tab`:`enter`,a=e.anschluss.lauf(t).entscheideTaste(e.umfeld(),n,r.key);if(a===`nichts`){(r.key===`Enter`||r.key===`ArrowDown`&&Na(e,t,n,1)||r.key===`ArrowUp`&&Na(e,t,n,-1))&&r.preventDefault();return}r.preventDefault(),a===`uebernehmen`?(Aa(e,t,n,e.anschluss.lauf(t).marke),Ma(e,t,n,i)):a===`fenster`?ja(e,t,n):a===`weiter`?Ma(e,t,n,i):a===`leeren`&&e.anschluss.lauf(t).leere(e.umfeld(),n),e.melde()}function Fa(e,t,n,r,i){let a=e.umfeld(),o=e.baustein.hasAttribute(`data-ff-editor`),s=[];for(let c=0;c<e.anschluss.anzahl;c++){let l=e.anschluss.lauf(c),u=c===e.anschluss.aktiv;s.push(ka({umfeld:a,cols:t,imEditor:o,zeile:c,aktiv:u,gefuellt:!o&&!e.anschluss.istLeer(a,c),...i?{zellenGriff:i}:{},wert:e=>l.wertVon(a,e),tippSpalte:u?l.tippSpalte:-1,vorschlaege:u?l.vorschlaege:[],marke:l.marke,listeNachOben:r,nummer:n+c+1},{tippen:(t,n)=>{l.tippe(t,n),e.anschluss.waehle(c),e.melde()},taste:(t,n)=>Pa(e,c,t,n),verlassen:t=>{l.verlasse(t),e.melde()},betreten:()=>{e.anschluss.waehle(c)&&e.melde()},waehleZeile:()=>{e.anschluss.waehle(c)&&e.melde()},waehleVorschlag:t=>Aa(e,c,l.tippSpalte,t),setzeMarke:t=>{l.setzeMarke(t),e.melde()}}))}return s}var Ia=2,La=class e{constructor(){this.getippt=new Map,this.gewaehlt=new Map,this.vonHand=new Map,this._wahlZaehler=0,this._tippSpalte=-1,this._marke=0,this._listeZu=!1,this._vorschlaege=[]}get tippSpalte(){return this._tippSpalte}get marke(){return this._marke}get vorschlaege(){return this._vorschlaege}wertVon(e,t){let n=this.getippt.get(t);if(n!==void 0)return n;let r=W(e,t);if(r.art!==`auswahl`||r.code===``)return``;let i=this.gewaehlt.get(r.quelleId);return i===void 0?``:k(i,r.code)}tippe(e,t){this.getippt.set(e,t),this._tippSpalte=e,this._marke=0,this._listeZu=!1}verlasse(e){this._tippSpalte===e&&(this._tippSpalte=-1,this._listeZu=!1,this._marke=0,this._vorschlaege=[])}entscheideTaste(e,t,n){let r=this._tippSpalte===t&&this._vorschlaege.length>0;if(n===`Tab`){if(!r)return`weiter`;n=`Enter`}let i=this.wertVon(e,t);if(n===`Escape`&&!r)return i===``?`nichts`:`leeren`;if(W(e,t).suchQuelleId===``)return n===`Enter`?`weiter`:`nichts`;let a=Xr(n,{listeOffen:r,feldLeer:i===``});if(a===`marke-hoch`)this._marke=Jr(this._marke,this._vorschlaege.length,-1);else if(a===`marke-runter`)this._marke=Jr(this._marke,this._vorschlaege.length,1);else if(a===`liste-zu`)this._listeZu=!0;else if(a===`fenster`&&this.eintraege(e,t).length===0)return`weiter`;else if(a===`nichts`&&n===`Enter`&&i!==``&&this.getippt.get(t)===void 0)return`weiter`;return a}naechsteLeere(e,t){for(let n=t+1;n<e.spalten.length;n++)if(this.wertVon(e,n)===``)return n;return-1}leere(e,t){this.getippt.delete(t);let n=W(e,t);for(let t of[n.quelleId,n.suchQuelleId])t!==``&&this.gewaehlt.has(t)&&this.setze(e,t,void 0);this._listeZu=!1,this._marke=0}setzeMarke(e){this._marke=e}uebernimm(e,t,n){let r=W(e,t).suchQuelleId;r!==``&&(this.setze(e,r,n),this._wahlZaehler+=1,this.vonHand.set(r,this._wahlZaehler),this.gleicheAb(e),this._tippSpalte=-1,this._marke=0,this._listeZu=!1)}setze(e,t,n){n===void 0?(this.gewaehlt.delete(t),this.vonHand.delete(t)):this.gewaehlt.set(t,n);for(let r=0;r<e.spalten.length;r++){let i=W(e,r);if(i.quelleId===t){this.getippt.delete(r);continue}if(i.suchQuelleId!==t)continue;let a=xa(e,r);a!==``&&(n===void 0?this.getippt.delete(r):this.getippt.set(r,k(n,a)))}}schluesselWert(e,t,n,r=()=>!0,i=e.quelleId){if(i!==e.quelleId){if(i===n||i===``)return;let e=this.gewaehlt.get(i);if(e===void 0)return;let a=this.vonHand.get(i);return a!==void 0&&!r(a)?void 0:k(e,t)}for(let i of ga(e)){if(i===n)continue;let a=this.vonHand.get(i);if(a===void 0||!r(a))continue;let o=this.gewaehlt.get(i);if(o!==void 0)for(let n of pa(e,i)){if(n.fromField!==t)continue;let e=k(o,n.toField);if(e!==``)return e}}}moegliche(e,t,n,r){return ba(pa(e,t),n=>this.schluesselWert(e,n,t,r,ma(e,t)),n)}gleicheAb(e){let t=ga(e);for(let n=0;n<=t.length;n++){let n=!1;for(let r of t){let t=pa(e,r);if(t.length===0)continue;let i=this.gewaehlt.get(r);if(i!==void 0){let a=this.vonHand.get(r)??-1/0;t.every(t=>{let n=this.schluesselWert(e,t.fromField,r,e=>e>a,ma(e,r));return n===void 0||n!==``&&n===k(i,t.toField)})||(this.setze(e,r,void 0),n=!0);continue}let a=ma(e,r);if(!t.some(t=>this.schluesselWert(e,t.fromField,r,void 0,a)!==void 0))continue;let o=Wo(r);if(o===null)continue;let s=this.moegliche(e,r,o);s.length===1&&(this.setze(e,r,s[0]),this.vonHand.delete(r),n=!0)}if(!n)break}}zuruecksetzen(){this.getippt.clear(),this.gewaehlt.clear(),this.vonHand.clear(),this._tippSpalte=-1,this._marke=0,this._listeZu=!1,this._vorschlaege=[]}nimmEinzigenTreffer(e){let t=this._tippSpalte;if(t<0||this._vorschlaege.length!==1)return!1;let n=(this.getippt.get(t)??``).trim();if(n.length<Ia)return!1;let r=this._vorschlaege[0];return r.wert===n?!1:(this.uebernimm(e,t,r.satz),!0)}aktualisiereVorschlaege(e){this._vorschlaege=this.berechne(e),this._marke=Yr(this._marke,this._vorschlaege.length)}berechne(e){let t=this._tippSpalte;if(this._listeZu||W(e,t).suchQuelleId===``)return[];let n=this.getippt.get(t)??``;return n===``?[]:qr(this.eintraege(e,t),n)}eintraege(e,t){let n=W(e,t),r=n.suchQuelleId;if(r===``)return[];let i=Wo(r);if(i===null)return[];let a=this.vonHand.get(r)??1/0;return Ho(this.moegliche(e,r,i,e=>e<a),_a(e,t)?.code??``,n.quelleId===r?n.code:``)}get istUnberuehrt(){return this.getippt.size===0&&this.gewaehlt.size===0}kopie(){let t=new e;return t.getippt=new Map(this.getippt),t.gewaehlt=new Map(this.gewaehlt),t.vonHand=new Map(this.vonHand),t._wahlZaehler=this._wahlZaehler,t}};function Ra(e,t){let n=t.feld.trim();if(n===``)return null;let{quelleId:r,code:i}=it(n),a=r===``?e.quelleId:r;return a===``||i===``?null:{quelleId:a,code:i}}function za(e,t){let n={};return e.spalten.forEach((r,i)=>{let a=Ra(e,r);if(a===null)return;let o=n[a.quelleId]??(n[a.quelleId]={});o[a.code]=t[i]??``}),n}function Ba(e){let t=[];for(let n of e.spalten){let r=Ra(e,n);r!==null&&!t.includes(r.quelleId)&&t.push(r.quelleId)}return t}var Va=class{constructor(){this._laeufe=[new La],this._aktiv=0}get anzahl(){return this._laeufe.length}get aktiv(){return this._aktiv}lauf(e){let t=Math.min(Math.max(e,0),this._laeufe.length-1);return this._laeufe[t]}get aktiverLauf(){return this.lauf(this._aktiv)}waehle(e){let t=Math.min(Math.max(e,0),this._laeufe.length-1);return t===this._aktiv?!1:(this._aktiv=t,!0)}werte(e,t){let n=this.lauf(t);return e.spalten.map((t,r)=>n.wertVon(e,r))}istLeer(e,t){return this.werte(e,t).every(e=>e===``)}saetze(e){let t=[];for(let n=0;n<this._laeufe.length;n++){let r=this.werte(e,n);r.every(e=>e===``)||t.push(za(e,r))}return t}weiter(e,t){let n=Math.min(Math.max(t,0),this._laeufe.length-1);return n<this._laeufe.length-1?(this._aktiv=n+1,this._aktiv):this.istLeer(e,n)?null:(this._laeufe.push(new La),this._aktiv=this._laeufe.length-1,this._aktiv)}haltLeerzeileFrei(e){return this.istLeer(e,this._laeufe.length-1)?!1:(this._laeufe.push(new La),!0)}leeren(){return this._laeufe.length===1&&this._laeufe[0].istUnberuehrt?!1:(this._laeufe=[new La],this._aktiv=0,!0)}zuruecksetzen(){this._laeufe=[new La],this._aktiv=0}haltVorschlaegeAktuell(e){let t=this.aktiverLauf;t.aktualisiereVorschlaege(e),t.nimmEinzigenTreffer(e)&&t.aktualisiereVorschlaege(e)}umfeld(e,t,n){return{spalten:t,quelleId:n,verknuepfungen:ui(e)}}},Ha=o`
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
`;function Ua(e){return{rohzeilen:e.map(e=>e.rohzeile),datenzeilen:e.map(e=>[...e.zellen]),zusatzzeilen:e.map(e=>(e.zusatz??[]).map(e=>({...e})))}}function Wa(e,t,n){return t===``||n===``?[...e]:e.filter(e=>Ir(k(e,t))===n)}function Ga(e){let t=e.getAttribute(`source`)??``;if(t===``)return null;let n=O(I().FF_DATA_SOURCES,t);if(!n)return null;let{rows:r,gefiltert:i}=tn(e,Wa(Nt(I().SEDATA,n.name,n.tableId),e.getAttribute(`tagfield`)??``,Vr()));return{quelle:n,zeilen:r,durchAuswahlGefiltert:i,lies:di(e)}}function Ka(e){return ta(e.getAttribute(`spalten`)??``)}function qa(e,t,n){let r={};for(let i of V(e.art).zusatzFelder??[]){let a=e.felder?.[i.key]??``;a!==``&&(r[i.key]=n(t,a))}return r}function Ja(e,t){let n=O(I().FF_DATA_SOURCES,e.getAttribute(`source`)??``);return n?jt(n,t):``}function Ya(e){let t=Ga(e);if(!t){e.datenzeilen=[],e.zusatzzeilen=[];return}let n=Ka(e),r=t.zeilen,i=t.durchAuswahlGefiltert,a=Jt(N(e),r,e=>e)[0]??-1,o=t.lies;e.datenGeliefert=!0,e.rohzeilen=r,e.auswahlIndex=a,e.durchAuswahlGefiltert=i,e.datenzeilen=r.map(e=>n.map(t=>t.feld===``?``:o(e,t.feld))),e.zusatzzeilen=r.map(e=>n.map(t=>qa(t,e,o)))}var Xa=oi({hydriere:Ya}),Za=Xa.connect,Qa=Xa.disconnect;function $a(e,t){let n=[];return e.forEach((e,r)=>{Kr(e,t)&&n.push(r)}),n}function eo(e,t){return!e&&t.trim()!==``}function to(e,t,n){return e&&t&&n===0}function no(e){if(!e.hatQuelle)return`— Datensätze`;let t=e.auswahlAktiv?` · durch Auswahl gefiltert`:``,n=e=>e===1?`Datensatz`:`Datensätze`,r=e=>e===1?`Datensatz`:`Datensätzen`;return e.suchtAktiv?e.sichtbar===0?`Kein Treffer von ${e.gesamt} ${r(e.gesamt)}`+t:`${e.sichtbar} von ${e.gesamt} ${r(e.gesamt)}`+t:(e.gesamt===0?`Keine Datensätze`:`${e.gesamt} ${n(e.gesamt)}`)+t}function ro(e,t,n){return g`<div class="steuerung">
    <button
      title="Letzte Spalte entfernen"
      @click=${r=>{n(r);let i=e();i.length>1&&(i.pop(),t(i))}}
    >−</button>
    <button
      title="Spalte hinzufügen"
      @click=${r=>{n(r);let i=e();i.length<16&&(i.push(H(i.length)),t(i))}}
    >+</button>
  </div>`}function io(e,t){let n=e.currentTarget;n&&(e.stopPropagation(),e.preventDefault(),pt(n,(e,n)=>e===``||e===n.trim()?!1:(t(e),!0)))}function ao(e,t,n,r){io(e,e=>{let i=n();t>=i.length||(i[t]={...i[t],titel:e},r(i))})}var oo=220,so=new WeakMap;function co(e){let t=so.get(e);t!==void 0&&(clearTimeout(t),so.delete(e))}function lo(e,t,n){t.stopPropagation();let r=t.currentTarget,i=r.getBoundingClientRect();co(e),so.set(e,setTimeout(()=>{so.delete(e),e.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:n.prop,index:n.index,top:i.bottom+4,left:i.left,ausloeser:r,...n.liste?{liste:n.liste()}:{}},bubbles:!0,composed:!0}))},oo))}var uo={prop:`spalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:Ji,nurEigeneQuelle:!0,eintragsWahl:{key:`art`,label:`Darstellung`,optionen:Ui,standard:B,felderKey:Wi},eintragsQuellenWahl:{key:Gi,label:`Sucht beim Erfassen in`,leerName:`frei`,nurBeiErfassung:!0},eintragsFelderWahl:{key:Ki,label:`Zeigt beim Suchen`,quelleAusKey:Gi,nurBeiErfassung:!0},eintragsZuordnung:{key:`zuordnung`,label:`Status-Zuordnung`,nurBeiWahl:Li,wertLabel:`Datenwert`,nameLabel:`Klarname`,bedeutungLabel:`Bedeutung`,bedeutungen:Tr}};function fo(e){return ea(e[uo.prop]).some(e=>e.art===Ri)}var po=1,mo=/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/,ho=/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/,go=/^(\d{4})-(\d{2})-(\d{2})$/;function _o(e){let t=e.trim();if(t===``||!mo.test(t))return null;let n=t.includes(`,`)?t.replace(/\./g,``).replace(`,`,`.`):/^-?\d{1,3}(\.\d{3})+$/.test(t)?t.replace(/\./g,``):t,r=Number(n);return Number.isFinite(r)?r:null}function vo(e){let t=e.trim();if(t===``)return null;let n=go.exec(t);if(n){let[,e,t,r]=n;return yo(Number(e),Number(t),Number(r))}let r=ho.exec(t);if(r){let[,e,t,n]=r,i=Number(n);return yo(n.length===2?i<=69?2e3+i:1900+i:i,Number(t),Number(e))}return null}function yo(e,t,n){if(t<1||t>12||n<1||n>31)return null;let r=new Date(e,t-1,n);return r.getFullYear()!==e||r.getMonth()!==t-1||r.getDate()!==n?null:r.getTime()}function bo(e){let t=0,n=0,r=0;for(let i of e)i.trim()!==``&&(t++,_o(i)!==null&&n++,vo(i)!==null&&r++);return t===0?`text`:r===t?`datum`:n===t?`zahl`:`text`}var xo=new Intl.Collator(`de`,{numeric:!0,sensitivity:`base`});function So(e,t,n){if(t<0||e.length===0)return e.map((e,t)=>t);let r=n=>e[n][t]??``,i=bo(e.map(e=>e[t]??``)),a=n?1:-1;return e.map((e,t)=>t).sort((e,t)=>{let n=r(e).trim(),o=r(t).trim();if(n===``&&o===``)return e-t;if(n===``)return po;if(o===``)return-1;let s=i===`zahl`?(_o(n)??0)-(_o(o)??0):i===`datum`?(vo(n)??0)-(vo(o)??0):xo.compare(n,o);return s===0?e-t:s*a})}function Co(e){let t=$a(e.datenzeilen,e.suchtext);return e.sortSpalte<0?t:So(t.map(t=>e.datenzeilen[t]),e.sortSpalte,e.sortAuf).map(e=>t[e])}function wo(e){let t=e.spalten.map(e=>V(e.art).spur),n={gridTemplateColumns:(e.erfassungsZeilen>0?[Sa,...t]:t).join(` `)},r=Hi(e.spalten),i=e.gemessen?.zeilenHoehe??r,a=e.hatQuelle,o=e.erfassungsZeilen>0?!1:to(a,e.datenGeliefert,e.datenzeilen.length),s=Co(e),c=e.erfassungsZeilen,l=e.gemessen===null?null:Math.max(1,e.gemessen.passen-c),{seiten:u,seite:d,zeilen:ee}=Fi({sichtbar:s,hatQuelle:a,proSeite:l??Math.max(1,10-c),wunschSeite:e.wunschSeite,platzhalterZeilen:ji(l)});return{cols:n,takt:r,zeilenHoehe:i,hatQuelle:a,leer:o,gesamt:s.length,seiten:u,seite:d,zeilen:ee,linealTakte:Pi(l,ee.length)}}function To(e){return e!==`ja`}function Eo(e,t,n){return e===n?{spalte:n,auf:!t}:{spalte:n,auf:!0}}var Do=[ri(`suche`,`Suchzeile`,`Zeigt über der Tabelle ein Feld, mit dem der Bediener den Inhalt durchsucht.`,{requiresDataSource:!0}),ri(`erfassung`,`Erfassungszeile`,`Zeigt als nächste freie Zeile eine leere Zeile, in der der Bediener neue Positionen tippt. Eingestellt wird an ihr nichts: Was eine Zelle tut, ergibt sich aus der Bindung ihrer Spalte (Spaltenkopf) und der Verknüpfung des Bausteins. Enter am Zeilenende lässt die Zeile stehen; geschrieben wird über einen Knopf, dessen Kette „Wert aus Erfassungszelle“ liest — einmal je Zeile.`),ri(`schlank`,`Schlank`,`Lässt die Kopfzeile weg und macht die Polster enger. Der Rahmen der Tafel bleibt. Die Spaltennamen stehen dann blass in den Zellen — im Editor in der ersten Zeile, in der Maske in der leeren Erfassungszelle, wie der Platzhalter an einem Formularfeld. Die Fußzeile erscheint ohnehin nur noch, wenn geblättert wird oder ein Filter greift.`),{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt die Tabelle nur Sätze des Tages, den der Tageswähler zeigt. Leer = alle Sätze.`,kind:`field`},ca()];function Oo(e,t){return g`<div class="fusszeile">
    <div class="seiten-info">${no({hatQuelle:e.hatQuelle,sichtbar:e.sichtbar,gesamt:e.gesamt,suchtAktiv:e.suchtAktiv,auswahlAktiv:e.auswahlAktiv})}</div>
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
  </div>`}function ko(e){return e.linealTakte===0?v:g`<div class="lineal" role="presentation" style=${U(e.linealTakte===null?e.cols:{...e.cols,flex:`0 1 auto`,height:`calc(var(--zeilen-hoehe) * ${e.linealTakte})`})}>
          ${e.mitGriff?Ta():v}
          ${e.spalten.map(()=>g`<div></div>`)}
        </div>`}function Ao(e,t){return g`
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
      ${e.zeigeKopf?g`<div class="kopf" role="row" style=${U(e.cols)}>
        ${e.mitGriff?Ta():v}
        ${e.spalten.map((n,r)=>g`<div
            class=${V(n.art).klasse}
            role="columnheader"
            data-ff-editable
            @dblclick=${e=>t.dblklickKopf(e,r)}
            @click=${e=>t.klickKopf(e,r)}
          >${n.titel}${!e.editable&&e.sortSpalte===r?g`<span class="sort-pfeil">${e.sortAuf?` ▲`:` ▼`}</span>`:``}</div>`)}
      </div>`:v}
        ${``}
        ${e.leer?la(e.leerText,!0):g`
        ${e.zeilen.map((n,r)=>{let i=n!==null&&!e.imEditor;return g`<div
            class="zeile${n===null?` ohne-satz`:``}${n!==null&&e.hatQuelle?` waehlbar`:``}${n!==null&&n===e.auswahlIndex?` gewaehlt`:``}"
            role="row"
            data-ff-roh=${n??v}
            tabindex=${i?`0`:v}
            aria-selected=${e.auswahlSemantik&&n!==null?String(n===e.auswahlIndex):v}
            style=${U(e.cols)}
            @click=${()=>t.aktiviereZeile(n,r)}
            @keydown=${e=>{e.key===`Enter`&&(e.preventDefault(),t.aktiviereZeile(n,r))}}
          >
            ${e.mitGriff?wa({nummer:n===null?null:r+1,aktiv:!1}):v}
            ${e.spalten.map((i,a)=>{let o=V(i.art),s=n===null?`—`:e.datenzeilen[n]?.[a]??``,c=n===null?{}:e.zusatzzeilen[n]?.[a]??{},l=e.imEditor&&!e.zeigeKopf&&e.editable,u=e.imEditor&&!e.zeigeKopf&&r===0;return g`<div
                class=${o.klasse}
                role="cell"
                data-ff-editable=${l?``:v}
                @click=${l?e=>t.klickKopf(e,a):v}
              >${u?g`<span class="spalten-name">${i.titel}</span>`:o.zelle(s,i.zuordnung??[],c)}</div>`})}
          </div>`})}
        ${e.erfassungsZeilen}
        ${ko(e)}`}
      </div>
    `}var jo=o`
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
`,Mo=`ff-zeile-aktiviert`,No=`data-ff-roh`;function Po(e,t){e.dispatchEvent(new CustomEvent(Mo,{detail:t,bubbles:!0,composed:!0}))}function Fo(e){let t=e?.activeElement;if(!(t instanceof HTMLElement))return;let n=t.closest(`.zeile`);if(!n)return;let r=n.getAttribute(No);return r===null||r===``?null:Number(r)}function Io(e,t){e&&((t===null?null:e.querySelector(`.zeile[data-ff-roh="${t}"]`))??e.querySelector(`.zeile[data-ff-roh]`)??e.querySelector(`.koerper`))?.focus()}var G=class e extends T{constructor(...e){super(...e),this.spalten=Xi(),this.source=``,this.suche=`ja`,this.erfassung=`nein`,this.schlank=`nein`,this.leerText=sa,this._suchtext=``,this.datenzeilen=[],this.zusatzzeilen=[],this.rohzeilen=[],this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this.datenGeliefert=!1,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._mass=null,this._beobachter=null,this._taktGemessen=0,this._fokusZeile=null,this._fokusHolen=!1,this._besitz=`softengine`,this._erfassung=new Va}static{this.blockType=`tabelle`}static{this.tagName=`ff-tabelle`}static{this.displayName=`Tabelle`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.kannErfassen={wenn:{attributeName:`erfassung`,equals:`ja`}}}static{this.blockEvents=[{key:`onRowClick`,name:`Zeile gewählt`}]}static{this.listenBindung=uo}static{this.brauchtTierbilder=fo}static{this.defaultProps={width:`fill`,source:``,spalten:Xi(),suche:`ja`,erfassung:`nein`,schlank:`nein`,tagField:``,leerText:sa}}static{this.customProperties=Do}static{this.raster={startW:14,startH:8,minW:6,minH:4}}get zeigtKopf(){return To(this.schlank)}get besitz(){return this._besitz}set besitz(e){e!==this._besitz&&(this._besitz=e,this.setzeAbgeleitetesZurueck(),this.isConnected&&(e===`provided`?Qa(this):Za(this)),this.requestUpdate())}set bereitgestellteZeilen(e){let t=Ua(e);this.rohzeilen=t.rohzeilen,this.datenzeilen=t.datenzeilen,this.zusatzzeilen=t.zusatzzeilen,this.datenGeliefert=!0,this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._seite=0,this._mass=null,this._taktGemessen=0,this.requestUpdate()}setzeAbgeleitetesZurueck(){this.rohzeilen=[],this.datenzeilen=[],this.zusatzzeilen=[],this.datenGeliefert=!1,this.auswahlIndex=-1,this.durchAuswahlGefiltert=!1,this._suchtext=``,this._sortSpalte=-1,this._sortAuf=!0,this._seite=0,this._mass=null,this._taktGemessen=0,this._fokusZeile=null,this._fokusHolen=!1,this._erfassung.zuruecksetzen()}get erfassteSaetze(){return this._erfassung.saetze(this.erfassungsUmfeld())}get erfassteQuellen(){return this.erfassungAn?Ba(this.erfassungsUmfeld()):[]}erfassungLeeren(){this._erfassung.leeren()&&this.requestUpdate()}fokussiereSuche(){let e=this.shadowRoot?.querySelector(`.suchzeile input`);return e?(e.focus(),!0):!1}get hatQuelle(){return this._besitz===`provided`||eo(this.hasAttribute(`data-ff-editor`),this.source)}merkeZeilenFokus(){let e=Fo(this.shadowRoot);this._fokusHolen=e!==void 0,this._fokusZeile=e??null}messeRumpf(){let e=this.zeilenHoehe;this._taktGemessen=e;let t=da(this,e);t?.passen===this._mass?.passen&&t?.zeilenHoehe===this._mass?.zeilenHoehe||(this._mass=t,this.requestUpdate())}spaltenListe(){return ea(this.spalten)}get zeilenHoehe(){return Hi(this.spaltenListe())}aktiviereZeile(e,t){if(e===null||this.hasAttribute(`data-ff-editor`))return;let n=this.rohzeilen[e];n!==void 0&&(Po(this,{rohzeile:n,rohIndex:e,ansichtIndex:t}),this.toggleAuswahl(n),yr(this,`onRowClick`,{PINDEX:Ja(this,n)}).catch(mr))}toggleAuswahl(e){let t=N(this);t!==``&&Yt(t,e)}setzeSuchtext(e){this.merkeZeilenFokus(),this._suchtext=e,this._seite=0,this.requestUpdate()}klickSortiere(e){if(this.editable)return;this.merkeZeilenFokus();let t=Eo(this._sortSpalte,this._sortAuf,e);this._sortSpalte=t.spalte,this._sortAuf=t.auf,this._seite=0,this.requestUpdate()}get erfassungAn(){return this.erfassung===`ja`}fussNoetig(e){return e>1||this._suchtext.trim()!==``||this.durchAuswahlGefiltert}erfassungsWirt(){return{baustein:this,anschluss:this._erfassung,umfeld:()=>this.erfassungsUmfeld(),melde:()=>this.requestUpdate(),fokussiere:(e,t)=>this.fokussiereZelle(e,t)}}fokussiereZelle(e,t){this.updateComplete.then(()=>{let n=this.shadowRoot?.querySelector(`.zeile.erfassung[data-erf-zeile="${e}"] .erf-eingabe[data-spalte="${t}"]`);n?.focus(),n?.select()})}erfassungsUmfeld(){return this._erfassung.umfeld(this,this.spaltenListe(),this.source)}aendere(e){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:`spalten`,value:e},bubbles:!0,composed:!0}))}beobachte(){this._beobachter||(this._beobachter=fa(this,()=>this.messeRumpf()),this._beobachter&&this.messeRumpf())}connectedCallback(){super.connectedCallback(),this._besitz===`softengine`&&Za(this),this.beobachte()}firstUpdated(){this.beobachte()}willUpdate(e){super.willUpdate(e),!(!this.erfassungAn||this.hasAttribute(`data-ff-editor`))&&(this._erfassung.haltLeerzeileFrei(this.erfassungsUmfeld()),this._erfassung.haltVorschlaegeAktuell(this.erfassungsUmfeld()))}updated(){this._taktGemessen!==this.zeilenHoehe&&this.messeRumpf(),this.shadowRoot&&$r(this.shadowRoot),this._fokusHolen&&(this._fokusHolen=!1,Io(this.shadowRoot,this._fokusZeile))}disconnectedCallback(){super.disconnectedCallback(),co(this),this._beobachter?.disconnect(),this._beobachter=null,es(this),Qa(this)}static{this.styles=[T.styles,Dr,ua,jo,ni,Ha]}render(){let t=this.spaltenListe(),n=e=>e.stopPropagation(),r=wo({spalten:t,hatQuelle:this.hatQuelle,datenGeliefert:this.datenGeliefert,datenzeilen:this.datenzeilen,suchtext:this._suchtext,sortSpalte:this._sortSpalte,sortAuf:this._sortAuf,wunschSeite:this._seite,gemessen:this._mass,erfassungsZeilen:this.erfassungAn?this._erfassung.anzahl:0});return g`<div class=${this.schlank===`ja`?`tabelle schlank`:`tabelle`} style=${U({"--takt":`${r.takt}px`,"--zeilen-hoehe":`${r.zeilenHoehe}px`})}>
      ${ro(()=>this.spaltenListe(),e=>this.aendere(e),n)}
      ${Ao({spalten:t,cols:r.cols,editable:this.editable,imEditor:this.hasAttribute(`data-ff-editor`),zeigeKopf:this.zeigtKopf,auswahlSemantik:N(this)!==``,zeigeSuche:this.suche===`ja`,suchtext:this._suchtext,sortSpalte:this._sortSpalte,sortAuf:this._sortAuf,zeilen:r.zeilen,linealTakte:r.linealTakte,datenzeilen:this.datenzeilen,zusatzzeilen:this.zusatzzeilen,hatQuelle:r.hatQuelle,auswahlIndex:this.auswahlIndex,leer:r.leer,leerText:this.leerText,erfassungsZeilen:this.erfassungAn?Fa(this.erfassungsWirt(),r.cols,r.zeilen.length,!0,this.hasAttribute(`data-ff-editor`)&&this.editable&&!this.zeigtKopf?(t,n)=>lo(this,t,{prop:e.listenBindung.prop,index:n,liste:()=>this.spaltenListe()}):void 0):[],mitGriff:this.erfassungAn},{setzeSuchtext:e=>this.setzeSuchtext(e),dblklickKopf:(e,t)=>{this.editable&&(co(this),ao(e,t,()=>this.spaltenListe(),e=>this.aendere(e)))},klickKopf:(t,n)=>{this.editable&&lo(this,t,{prop:e.listenBindung.prop,index:n,liste:()=>this.spaltenListe()}),this.klickSortiere(n)},aktiviereZeile:(e,t)=>this.aktiviereZeile(e,t)})}
      ${``}
      ${r.leer||!this.fussNoetig(r.seiten)?v:Oo({hatQuelle:r.hatQuelle,sichtbar:r.gesamt,gesamt:this.datenzeilen.length,suchtAktiv:this._suchtext.trim()!==``,auswahlAktiv:this.durchAuswahlGefiltert,seite:r.seite,seiten:r.seiten},{blaettere:e=>{this.merkeZeilenFokus(),this._seite=e,this.requestUpdate()}})}
    </div>`}};w([S({converter:{fromAttribute:e=>e?ta(e):Xi(),toAttribute:e=>JSON.stringify(e)}})],G.prototype,`spalten`,void 0),w([S()],G.prototype,`source`,void 0),w([S()],G.prototype,`suche`,void 0),w([S()],G.prototype,`erfassung`,void 0),w([S()],G.prototype,`schlank`,void 0),w([S()],G.prototype,`leerText`,void 0),w([S({attribute:!1})],G.prototype,`datenzeilen`,void 0),w([S({attribute:!1})],G.prototype,`zusatzzeilen`,void 0),w([S({attribute:!1})],G.prototype,`rohzeilen`,void 0),w([S({attribute:!1})],G.prototype,`auswahlIndex`,void 0),w([S({attribute:!1})],G.prototype,`durchAuswahlGefiltert`,void 0),w([S({attribute:!1})],G.prototype,`datenGeliefert`,void 0),T.defineAndRegister(G);function Lo(e){return g`<div class="nachschlag">
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
    >${ki()}</button>
    ${e.liste}
  </div>`}var Ro={prop:`nachschlagSpalten`,titelKey:`titel`,feldKey:`feld`,standardTitel:Ji,quelleProp:`nachschlagQuelle`};function zo(e){if(typeof e==`string`)try{e=JSON.parse(e)}catch{return[]}return Array.isArray(e)&&e.length>0?ea(e):[]}function Bo(e,t){let n=e[0];return n===void 0?t:n.feld}function Vo(e,t){let n=e.trim();return n===``||n===t.trim()}function Ho(e,t,n){let r=t.trim(),i=[],a=Vo(t,n)||n.trim()===``,o=new Set;for(let t of e){let e=k(t,n).trim(),s=r===``?e:k(t,r).trim();if(!(s===``&&e===``)){if(a){let t=e===``?s:e;if(o.has(t))continue;o.add(t)}i.push({anzeige:s,wert:e,satz:t})}}return i}function Uo(e,t,n,r){return Ho(tn(e,t).rows,n,r)}function Wo(e){let t=O(I().FF_DATA_SOURCES,e);return t?Nt(I().SEDATA,t.name,t.tableId):null}function Go(e){if(e.quelleId===``||e.speicherFeld===``)return{ok:!1,grund:`unvollstaendig`};let t=Wo(e.quelleId);if(t===null)return{ok:!1,grund:`quelleFehlt`};let n=Bo(zo([...e.spalten]),e.speicherFeld);return{ok:!0,eintraege:Uo(e.el,t,n,e.speicherFeld)}}function Ko(e,t){return t&&e.length===1?e[0]:null}function qo(e,t){let{rows:n,gefiltert:r}=tn(e,[t]);return!r||n.length>0}function Jo(e,t,n){return e===``?t===``&&n===``?`nichts`:`leeren`:e===t?`nichts`:`zurueck`}var Yo=null,Xo=null,Zo=null;function Qo(e){return e.shadowRoot?.querySelector(`.lupe`)??null}function $o(e=!0){let t=e?Zo:null;Zo=null,Yo?.remove(),Yo=null,Xo=null,t?.focus()}function es(e){Xo===e&&$o(!1)}function ts(e){return[{titel:e.speicherTitel===``?`Wert`:e.speicherTitel,feld:e.speicherFeld,art:B}]}function ns(e){let t=e=>e.stopPropagation(),n=e.editor;return g`<ff-dialog-rahmen
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
  >${e.inhalt}</ff-dialog-rahmen>`}function rs(e,t){let n=zo([...e.spalten]),r=Vo(Bo(n,e.speicherFeld),e.speicherFeld);return g`<ff-tabelle
    fuellt
    suche="ja"
    style="--se-r-lg:0px"
    .besitz=${`provided`}
    .spalten=${n.length>0?n:ts(e)}
    .leerText=${`Diese Quelle hat keine Sätze.`}
    .bereitgestellteZeilen=${t.map(e=>({rohzeile:e.satz,zellen:n.length>0?n.map(t=>t.feld===``?``:k(e.satz,t.feld)):r?[e.wert]:[e.anzeige,e.wert]}))}
  ></ff-tabelle>`}function is(e){let t=e.eintraege;if(t===void 0){let n=Go(e);if(!n.ok){F(n.grund===`unvollstaendig`?`Nachschlagen braucht an diesem Feld eine Quelle und „Gespeichert wird".`:`Die Nachschlage-Quelle dieses Feldes ist in der Maske nicht vorhanden.`);return}t=n.eintraege}$o(!1);let n=document.createElement(`div`);n.style.display=`contents`,Ue(ns({titel:e.titel,breite:e.breite,hoehe:e.hoehe,inhalt:rs(e,t),onSchliessen:()=>$o()}),n);let r=n.querySelector(ir),i=n.querySelector(G.tagName);i?.addEventListener(Mo,n=>{let r=n.detail,i=t[r.rohIndex];i&&($o(),e.onUebernehmen(i.anzeige,i.wert,i.satz))}),Zo=e.rueckFokus??Qo(e.el),document.body.appendChild(n),Yo=n,Xo=e.el,r&&i&&Promise.all([r.updateComplete,i.updateComplete]).then(()=>{r.isConnected&&i.fokussiereSuche()})}function as(e){return ns({titel:e.titel,breite:e.breite,hoehe:e.hoehe,onSchliessen:e.onSchliessen,editor:{onGroesse:e.onGroesse},inhalt:g`<ff-tabelle
      data-ff-editor
      fuellt
      suche="ja"
      style="--se-r-lg:0px"
      .spalten=${[...e.spalten]}
      .editable=${!0}
      @ff-prop-change=${t=>{t.stopPropagation();let n=t.detail;n?.attr===`spalten`&&e.onAendern(ea(n.value))}}
      @ff-listen-bind=${t=>{t.stopPropagation();let n=t.detail;typeof n?.index==`number`&&e.onFeldWahl({index:n.index,top:n.top??0,left:n.left??0,...n.ausloeser instanceof Element?{ausloeser:n.ausloeser}:{},...Array.isArray(n.liste)?{liste:n.liste}:{}})}}
    ></ff-tabelle>`})}var os=[`J`,`1`,`X`,`TRUE`];function ss(e){return os.includes(e.trim().toUpperCase())}function cs(e){return e?`J`:`N`}function ls(e){return g`<div class="feld">
    <div class="zeile" data-ff-spot="value" ?data-ff-bound=${e.gebunden}>
      <input
        class="ctrl"
        type="checkbox"
        .checked=${e.angehakt}
        @change=${t=>e.onAendern(t.target.checked)}
      />
      ${e.text}
    </div>
  </div>`}function us(e){let t=e.optionen.split(`,`).map(e=>e.trim()).filter(e=>e!==``),n=e.wert!==``&&!t.includes(e.wert);return g`<select
    class="ctrl"
    .value=${e.wert}
    @input=${e.onInput}
    @change=${e.onChange}
  >
    <option value="" disabled hidden></option>
    ${n?g`<option value=${e.wert} hidden>${e.wert}</option>`:v}
    ${t.length===0?g`<option disabled>(keine Optionen)</option>`:t.map(e=>g`<option value=${e}>${e}</option>`)}
  </select>`}function ds(e){return g`<textarea
    class="ctrl"
    .value=${e.wert}
    @input=${e.onInput}
    @change=${e.onChange}
  ></textarea>`}function fs(e){return g`<input
    class="ctrl"
    type=${e.typ}
    .value=${e.typ===`date`?hi(e.wert):e.wert}
    @input=${e.onInput}
    @change=${e.onChange}
    @focus=${()=>e.onFokus(!0)}
    @blur=${()=>e.onFokus(!1)}
  />`}var K=class e extends T{constructor(...e){super(...e),this.fieldType=`text`,this.placeholder=`Feldname`,this.options=``,this.source=``,this.value=``,this.valueField=``,this.nachschlagQuelle=``,this.speicherFeld=``,this.speicherTitel=``,this.nachschlagSpalten=[],this.fensterBreite=520,this.fensterHoehe=380,this.einzigerTreffer=`nein`,this.spaltenDialog=!1,this.anzeige=``,this.getippt=null,this.marke=0,this.listeZu=!1,this.vorschlaege=[],this.satz=void 0,this.imSteuerelement=!1}static{this.blockType=`formfeld`}static{this.tagName=`ff-formfeld`}static{this.displayName=`Formularfeld`}static{this.category=`eingabe`}static{this.acceptsDataSource={wenn:{attributeName:`fieldType`,notEquals:`nachschlagen`}}}static{this.satzWahl={quelleProp:`nachschlagQuelle`,wenn:{attributeName:`fieldType`,equals:`nachschlagen`}}}static{this.listenBindung=Ro}static{this.bindableSpots=[{prop:`value`,label:`Wert`,wenn:{attributeName:`fieldType`,keinesVon:[`nachschlagen`]},vorschauProp:`placeholder`}]}static{this.actionValueSpots=[{prop:`value`,label:`Wert`}]}static{this.blockEvents=[{key:`onChange`,name:`Wert geändert`}]}static{this.defaultProps={width:240,fieldType:`text`,placeholder:`Feldname`,options:``,source:``,value:``,valueField:``,nachschlagQuelle:``,speicherFeld:``,speicherTitel:``,nachschlagSpalten:[],fensterBreite:520,fensterHoehe:380,einzigerTreffer:`nein`}}static{this.raster={startW:6,startH:2,minW:2,minH:2}}static{this.customProperties=ai}static{this.styles=[T.styles,wi,ni]}onInput(e){let t=e.target;this.value=Ei(this.fieldType)===`date`?gi(t.value):t.value}onChange(){this.dispatchEvent(new Event(`change`))}textTpl(e,t=!1){return g`<span
      class=${e}
      ?hidden=${t}
      data-ff-editable
      @click=${this.onTextClick}
      @dblclick=${e=>this.inlineEdit(e,`placeholder`)}
    >${this.placeholder}</span>`}onTextClick(){this.hasAttribute(`data-ff-editor`)||this.setzeHaken(!this.angehakt)}get angehakt(){return ss(this.value)}setzeHaken(e){let t=cs(e);this.value!==t&&(this.value=t,this.dispatchEvent(new Event(`change`)))}controlTpl(e){switch(e){case`textarea`:return ds({wert:this.value,onInput:this.onInput,onChange:this.onChange});case`select`:return us({wert:this.value,optionen:this.options,onInput:this.onInput,onChange:this.onChange});case`nachschlagen`:return Lo({wert:this.getippt??this.anzeige,onTippen:e=>{this.getippt=e,this.marke=0,this.listeZu=!1},onTaste:e=>this.onNachschlagTaste(e),onVerlassen:()=>this.onNachschlagVerlassen(),onLupe:()=>this.onLupe(),liste:this.vorschlaege.length===0?v:Zr({eintraege:this.vorschlaege,marke:this.marke,onWaehlen:e=>this.uebernimmVorschlag(e),onMarke:e=>{this.marke=e}})});default:return fs({typ:e,wert:this.value,onInput:this.onInput,onChange:this.onChange,onFokus:e=>{this.imSteuerelement=e}})}}onLupe(){if(this.hasAttribute(`data-ff-editor`)){this.spaltenDialog=!0;return}is({el:this,quelleId:this.nachschlagQuelle,speicherFeld:this.speicherFeld,speicherTitel:this.speicherTitel,spalten:this.nachschlagSpalten,titel:this.placeholder,breite:this.fensterBreite,hoehe:this.fensterHoehe,onUebernehmen:(e,t,n)=>this.uebernimmUndMelde(e,t,n)})}spaltenEffektiv(){let e=zo(this.nachschlagSpalten);return e.length>0?e:ts({speicherFeld:this.speicherFeld,speicherTitel:this.speicherTitel})}meldeProp(e,t,n){this.dispatchEvent(new CustomEvent(`ff-prop-change`,{detail:{attr:e,value:t,...n===void 0?{}:{geste:n}},bubbles:!0,composed:!0}))}spaltenDialogTpl(){return as({titel:this.placeholder,spalten:this.spaltenEffektiv(),breite:this.fensterBreite,hoehe:this.fensterHoehe,onGroesse:t=>{let n=t.achse===`breite`?`fensterBreite`:`fensterHoehe`;if(t.geste===`standard`){this.meldeProp(n,e.defaultProps[n]);return}this.meldeProp(n,t.wert,t.geste===`laeuft`?void 0:t.geste)},onAendern:e=>{this.meldeProp(`nachschlagSpalten`,e)},onFeldWahl:e=>{this.dispatchEvent(new CustomEvent(`ff-listen-bind`,{detail:{prop:`nachschlagSpalten`,...e},bubbles:!0,composed:!0}))},onSchliessen:()=>{this.spaltenDialog=!1}})}willUpdate(e){super.willUpdate(e),e.has(`fieldType`)&&Ei(this.fieldType)!==`nachschlagen`&&(this.spaltenDialog=!1),this.vorschlaege=this.berechneVorschlaege(),this.marke=Yr(this.marke,this.vorschlaege.length)}updated(e){super.updated(e),this.toggleAttribute(`data-ff-liste`,this.vorschlaege.length>0)}berechneVorschlaege(){if(this.getippt===null||this.listeZu||Ei(this.fieldType)!==`nachschlagen`||this.hasAttribute(`data-ff-editor`))return[];let e=Go({el:this,quelleId:this.nachschlagQuelle,speicherFeld:this.speicherFeld,spalten:this.nachschlagSpalten});return e.ok?qr(e.eintraege,this.getippt):[]}onNachschlagTaste(e){if(this.hasAttribute(`data-ff-editor`))return;let t=this.vorschlaege.length,n=Xr(e.key,{listeOffen:t>0,feldLeer:(this.getippt??this.anzeige)===``});if(n===`nichts`){e.key===`Enter`&&e.preventDefault();return}e.preventDefault(),n===`marke-hoch`?this.marke=Jr(this.marke,t,-1):n===`marke-runter`?this.marke=Jr(this.marke,t,1):n===`uebernehmen`?this.uebernimmVorschlag(this.marke):n===`liste-zu`?this.listeZu=!0:this.onLupe()}uebernimmVorschlag(e){let t=this.vorschlaege[e];t&&this.uebernimmUndMelde(t.anzeige,t.wert,t.satz)}leereNachschlagen(){this.satz=void 0,this.anzeige=``,this.value=``,Zt(N(this))}uebernimmUndMelde(e,t,n){this.getippt=null,this.listeZu=!1,this.marke=0,this.uebernimmSatz(e,t,n),this.dispatchEvent(new Event(`change`))}uebernimmSatz(e,t,n){this.anzeige=e===``?t:e,this.value=t,this.satz=n,Xt(N(this),n)}onNachschlagVerlassen(){if(this.hasAttribute(`data-ff-editor`))return;let e=Jo(this.getippt??this.anzeige,this.anzeige,this.value);this.getippt=null,this.listeZu=!1,this.marke=0,e===`leeren`&&(this.leereNachschlagen(),this.dispatchEvent(new Event(`change`)))}pruefeEigenenWert(){Ei(this.fieldType)===`nachschlagen`&&(this.getippt!==null&&this.requestUpdate(),this.satz!==void 0&&!qo(this,this.satz)&&this.leereNachschlagen(),this.uebernimmEinzigenTreffer())}uebernimmEinzigenTreffer(){if(this.einzigerTreffer!==`ja`)return;let e=Go({el:this,quelleId:this.nachschlagQuelle,speicherFeld:this.speicherFeld,spalten:this.nachschlagSpalten});if(!e.ok)return;let t=Ko(e.eintraege,this.satz===void 0);t&&this.uebernimmSatz(t.anzeige,t.wert,t.satz)}render(){let e=Ei(this.fieldType);if(e===`checkbox`)return ls({angehakt:this.angehakt,gebunden:this.valueField!==``,onAendern:e=>this.setzeHaken(e),text:this.textTpl(`text`)});let t=e!==`nachschlagen`,n=(t?this.value:this.getippt??this.anzeige)===``;return g`<div class="feld">
      <div
        class=${`huelle${n?` leer`:``}${this.imSteuerelement?` tippt`:``}`}
        data-ff-spot=${t?`value`:v}
        ?data-ff-bound=${t&&this.valueField!==``}
      >
        ${this.controlTpl(e)}
        ${Di.includes(e)?this.textTpl(`ph ${Oi[e]??``}`.trim(),!n):v}
      </div>
      ${this.spaltenDialog&&this.hasAttribute(`data-ff-editor`)?this.spaltenDialogTpl():v}
    </div>`}connectedCallback(){super.connectedCallback(),Si(this)}disconnectedCallback(){super.disconnectedCallback(),Ci(this),es(this)}};w([S()],K.prototype,`fieldType`,void 0),w([S()],K.prototype,`placeholder`,void 0),w([S()],K.prototype,`options`,void 0),w([S()],K.prototype,`source`,void 0),w([S()],K.prototype,`value`,void 0),w([S()],K.prototype,`valueField`,void 0),w([S()],K.prototype,`nachschlagQuelle`,void 0),w([S()],K.prototype,`speicherFeld`,void 0),w([S()],K.prototype,`speicherTitel`,void 0),w([S({converter:{fromAttribute:e=>zo(e??``),toAttribute:e=>JSON.stringify(e)}})],K.prototype,`nachschlagSpalten`,void 0),w([S({type:Number})],K.prototype,`fensterBreite`,void 0),w([S({type:Number})],K.prototype,`fensterHoehe`,void 0),w([S()],K.prototype,`einzigerTreffer`,void 0),w([C()],K.prototype,`spaltenDialog`,void 0),w([C()],K.prototype,`anzeige`,void 0),w([C()],K.prototype,`getippt`,void 0),w([C()],K.prototype,`marke`,void 0),w([C()],K.prototype,`listeZu`,void 0),w([C()],K.prototype,`imSteuerelement`,void 0),T.defineAndRegister(K);var ps=`ziel`,ms=o`
  :host([data-ff-ziel]) .ziel {
    background: var(--se-accent-soft);
    outline: var(--se-border) solid var(--se-accent);
    outline-offset: calc(-1 * var(--se-border));
  }
`,hs=o`
  ::slotted(:not([hat-reiter])) { margin-top: 24px; }
  slot { display: contents; }
`,gs=`frei · hierher ziehen`,_s=`ff-zimmer-inhalt`,q=class extends T{constructor(...e){super(...e),this.heading=`Neues Zimmer`,this.leerHinweis=``}static{this.blockType=`kanban-zimmer`}static{this.tagName=`ff-kanban-zimmer`}static{this.displayName=`Kanban-Zimmer`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[z.blockType]}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban-spalte`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={heading:`Neues Zimmer`}}static{this.styles=[T.styles,ua,hs,ms,o`
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
    `]}onSlotChange(){this.dispatchEvent(new CustomEvent(_s,{bubbles:!0,composed:!0}))}render(){return g`<div class="zimmer ${ps}">
      <div
        class="kopf"
        data-ff-editable
        @dblclick=${e=>this.inlineEdit(e,`heading`)}
      >${this.heading}</div>
      <div class="body">
        <slot @slotchange=${this.onSlotChange}></slot>
        ${la(this.leerHinweis)}
      </div>
    </div>`}};w([S()],q.prototype,`heading`,void 0),w([S({attribute:!1})],q.prototype,`leerHinweis`,void 0),T.defineAndRegister(q);var J=class extends T{static{this.blockType=`kanban-spalte`}static{this.tagName=`ff-kanban-spalte`}static{this.displayName=`Kanban-Spalte`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[z.blockType,q.blockType]}static{this.addChildButton={label:`Zimmer`,childType:q.blockType}}static{this.childDirection=`column`}static{this.showInPalette=!1}static{this.containerHint=!1}static{this.allowedParentTypes=[`kanban`]}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.defaultProps={variant:`info`,heading:`Neue Spalte`,auffang:`nein`,zimmerField:``}}static{this.customProperties=[Er(`variant`,`Bedeutung der Spalte — bestimmt ihre Farbwelt (Kopf, Fläche, Rahmen).`),ri(`auffang`,`Auffangspalte`,`Einträge ohne passenden Spaltentitel landen hier. Ohne Auffangspalte landen sie in der ersten Spalte.`,{requiresDataSource:!0,exclusiveAmongSiblings:!0}),{attributeName:`zimmerField`,name:`Unterteilen nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welches Zimmer dieser Spalte ein Eintrag kommt. Wirkt erst, wenn die Spalte Zimmer hat.`,kind:`field`}]}static{this.styles=[T.styles,ua,hs,ms,o`

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

    `]}constructor(){super(),this.variant=`info`,this.heading=`Neue Spalte`,this.leerHinweis=``,this._count=0,this.addEventListener(_s,()=>this.zaehle())}zaehle(){this._count=Array.from(this.querySelectorAll(z.tagName)).filter(e=>!e.hasAttribute(`data-ff-editor-helper`)).length}render(){return g`<div class="col ${ps} v-${wr(this.variant)}">
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
        ${la(this.leerHinweis)}
      </div>
    </div>`}};w([S()],J.prototype,`variant`,void 0),w([S()],J.prototype,`heading`,void 0),w([S({attribute:!1})],J.prototype,`leerHinweis`,void 0),w([C()],J.prototype,`_count`,void 0),T.defineAndRegister(J);function vs(e,t){let n=e.trim().toLowerCase();if(n!==``)for(let e=0;e<t.length;e++){let r=t[e].trim().toLowerCase();if(r!==``&&r===n)return e}return-1}function ys(e){return e.findIndex(e=>(e??``).trim()===`ja`)}var bs=new WeakMap,xs=J.tagName,Ss=q.tagName,Cs=z.tagName;function ws(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===xs)}function Ts(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Cs)}function Es(e){return Array.from(e.children).filter(e=>e.tagName.toLowerCase()===Ss)}function Ds(e){return[e,...Es(e)]}function Os(e,t){let n=e.getAttribute(`leertext`)??`Keine Datensätze.`,r=(e,t)=>{e.leerHinweis=t};for(let e of t){let t=Es(e);for(let e of t)r(e,Ts(e).length===0?gs:``);r(e,t.length===0&&Ts(e).length===0?n:``)}}function ks(e){return Xe().find(t=>t.tagName===e.toLowerCase())?.bindableSpots??[]}function As(e,t){let n=Es(e);if(n.length===0)return null;let r=e.getAttribute(`zimmerfield`)??``;if(r===``)return n[0];let i=n.map(e=>e.getAttribute(`heading`)??q.defaultProps.heading),a=vs(k(t,r),i);return a>=0?n[a]:n[0]}function js(e){X?.board===e&&Ls();let t=e.getAttribute(`statusfield`)??``,n=Ga(e);if(!n)return;let r=ws(e);if(r.length===0)return;let i=bs.get(e);if(!i){let t=e.querySelector(`template[data-ff-template]`)?.content.firstElementChild??e.querySelector(Cs);t&&(i=t.cloneNode(!0),bs.set(e,i))}if(!i)return;let a=n.zeilen,o=r.map(e=>e.getAttribute(`heading`)??J.defaultProps.heading),s=ks(i.tagName),c=ys(r.map(e=>e.getAttribute(`auffang`))),l=n.lies;for(let e of r)for(let t of Ds(e))Ts(t).forEach(e=>e.remove());for(let e of a){let a=i.cloneNode(!0),u=t===``?-1:vs(k(e,t),o),d=u>=0?r[u]:c>=0?r[c]:r[0];(As(d,e)??d).appendChild(a);for(let t of s){let n=a.getAttribute(rt(t.prop))??``;n!==``&&(a[t.prop]=l(e,n))}let ee=jt(n.quelle,e);Y.set(a,{row:e,pindex:ee}),a.draggable=!0}Os(e,r);let u=r.flatMap(e=>Ds(e).flatMap(Ts)),d=Jt(N(e),u,e=>Y.get(e)?.row);for(let e of d)u[e].setAttribute(`data-ff-auswahl`,``)}var Y=new WeakMap,X=null,Ms=new WeakSet,Ns=`data-ff-zieht`,Ps=`data-ff-ziel`,Fs=null;function Is(e){Fs!==e&&(Fs?.removeAttribute(Ps),Fs=e,Fs?.setAttribute(Ps,``))}function Ls(){X?.card.removeAttribute(Ns),X=null,Is(null)}function Rs(e,t,n){for(let r of t.composedPath())if(r instanceof HTMLElement&&r.tagName.toLowerCase()===n&&e.contains(r))return r;return null}function zs(e,t){return Rs(e,t,xs)}function Bs(e,t,n){if(!X||X.board!==e)return;let r=Y.get(X.card);if(!r)return;let i=t.getAttribute(`heading`)??``,a=n?.getAttribute(`heading`)??``;yr(e,`onCardDrop`,{PINDEX:r.pindex,VALUE:i,ZIMMER:a}).catch(mr)}function Vs(e){Ms.has(e)||(Ms.add(e),e.addEventListener(`click`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Y.has(e))??null;if(!n)return;let r=Y.get(n);r&&Yt(N(e),r.row),yr(e,`onCardClick`,{PINDEX:r?.pindex??``}).catch(mr)}),e.addEventListener(`dragstart`,t=>{let n=t.composedPath().find(e=>e instanceof HTMLElement&&Y.has(e))??null;n&&(X={card:n,board:e},t.dataTransfer?.setData(`text/plain`,Y.get(n)?.pindex??``),t.dataTransfer&&(t.dataTransfer.effectAllowed=`move`),setTimeout(()=>{X?.card===n&&n.setAttribute(Ns,``)},0))}),e.addEventListener(`dragend`,Ls),e.addEventListener(`dragover`,t=>{let n=zs(e,t);if(X?.board!==e||!n){Is(null);return}t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect=`move`),Is(Rs(e,t,Ss)??n)}),e.addEventListener(`dragleave`,t=>{let n=t.relatedTarget;(!(n instanceof Node)||!e.contains(n))&&Is(null)}),e.addEventListener(`drop`,t=>{let n=zs(e,t);n&&(t.preventDefault(),Bs(e,n,Rs(e,t,Ss)),Ls())}))}var Hs=oi({hydriere:js,verdrahte:Vs}),Us=Hs.connect,Ws=Hs.disconnect,Z=J.blockType,Gs=class extends T{static{this.blockType=`kanban`}static{this.tagName=`ff-kanban`}static{this.displayName=`Kanban`}static{this.category=`anzeige`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[Z]}static{this.childDirection=`row`}static{this.lockedWidth=`fill`}static{this.resizableWidth=!1}static{this.containerHint=!1}static{this.addChildButton={label:`Spalte`,childType:Z}}static{this.templateChild={type:z.blockType,label:`Muster`}}static{this.resizableHeight=!0}static{this.acceptsDataSource=!0}static{this.satzWahl={}}static{this.blockEvents=[{key:`onCardClick`,name:`Karte angeklickt`},{key:`onCardDrop`,name:`Karte verschoben`}]}static{this.defaultProps={width:`fill`,height:`fill`,source:``,statusField:``,tagField:``,leerText:sa}}static{this.raster={startW:24,startH:20,minW:6,minH:8}}static{this.customProperties=[{attributeName:`statusField`,name:`Einsortieren nach`,description:`Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.`,kind:`field`},{attributeName:`tagField`,name:`Tag filtern nach`,description:`Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt das Board nur Einträge des Tages, den der Tageswähler zeigt. Leer = alle Einträge.`,kind:`field`},ca()]}static{this.defaultChildren=[{type:Z,props:{heading:`Offen`,variant:`warning`},children:[{type:z.blockType}]},{type:Z,props:{heading:`In Arbeit`,variant:`info`}},{type:Z,props:{heading:`Fertig`,variant:`success`}}]}static{this.styles=[T.styles,o`

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
    `]}render(){return g`<div class="board"><slot></slot></div>`}connectedCallback(){super.connectedCallback(),Us(this)}disconnectedCallback(){super.disconnectedCallback(),Ws(this)}};T.defineAndRegister(Gs);var Ks={breite:56,breiteOffen:224},qs=`ff-seiten-wechsel`,Js=[{wert:`sonne`,name:`Sonnengelb`},{wert:`salbei`,name:`Salbeigrün`},{wert:`himmel`,name:`Himmelblau`},{wert:`flieder`,name:`Flieder`},{wert:`koralle`,name:`Koralle`}],Q=class extends T{static{this.blockType=`navi-eintrag`}static{this.ohneDaten=!0}static{this.tagName=`ff-navi-eintrag`}static{this.displayName=`Navi-Eintrag`}static{this.category=`layout`}static{this.acceptsChildren=!1}static{this.showInPalette=!1}static{this.allowedParentTypes=[`navi`]}static{this.resizableWidth=!1}static{this.defaultProps={seite:``,seitename:``,ton:`sonne`}}static{this.customProperties=[{attributeName:`seite`,name:`Seite`,description:`Welche Seite dieser Maske der Eintrag zeigt.`,kind:`seite`,klarnameProp:`seitename`,nurImEditor:!0},{attributeName:`ton`,name:`Farbe`,description:`Farbe des Zeichens vor dem Namen.`,kind:`select`,options:Js.map(e=>({value:e.wert,label:e.name}))}]}static{this.styles=[T.styles,o`
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
    `]}constructor(){super(),this.seite=``,this.seitename=``,this.ton=`sonne`,this.addEventListener(`click`,()=>this.melde())}melde(){let e={ansicht:this.seitename};this.dispatchEvent(new CustomEvent(qs,{detail:e,bubbles:!0,composed:!0}))}render(){return g`<span class="zeichen"></span>
      <span class="name">${this.seitename===``?`—`:this.seitename}</span>`}};w([S()],Q.prototype,`seite`,void 0),w([S()],Q.prototype,`seitename`,void 0),w([S({reflect:!0})],Q.prototype,`ton`,void 0),T.defineAndRegister(Q);var Ys=`aktiv`;function Xs(e){return Array.from(e.querySelectorAll(Q.tagName))}function Zs(e,t){let n=Xs(e),r=t??n.find(e=>e.hasAttribute(Ys))??n[0];for(let e of n)e===r?e.setAttribute(Ys,``):e.removeAttribute(Ys)}function Qs(e){let t=e.hasAttribute(`offen`);for(let n of Xs(e))n.toggleAttribute(`breit`,t)}function $s(e){return e.getAttribute(`name`)??String(ht.defaultProps.name)}function ec(e,t){let n=e;for(;n&&n.parentElement!==t;)n=n.parentElement;return n}function tc(e,t){let n=e.ownerDocument,r=Array.from(n.querySelectorAll(ht.tagName)),i=r[0]?.parentElement??null;if(!i)return;let a=ec(e,i);if(!a)return;let o=r.find(e=>$s(e)===t)??null;for(let e of Array.from(i.children))e!==a&&((r.includes(e)?e===o:o===null)?e.removeAttribute(`hidden`):e.setAttribute(`hidden`,``))}var nc=new WeakMap,rc=new WeakSet;function ic(e){let t=t=>{let n=t.detail;n&&(Zs(e,t.target instanceof Element?t.target:void 0),e.removeAttribute(`offen`),Qs(e),!e.hasAttribute(`data-ff-editor`)&&tc(e,n.ansicht))};e.addEventListener(qs,t),nc.set(e,t)}function ac(e){let t=nc.get(e);t&&(e.removeEventListener(qs,t),nc.delete(e))}function oc(e){if(Zs(e),Qs(e),e.hasAttribute(`data-ff-editor`)||rc.has(e))return;let t=Xs(e)[0];if(!t)return;rc.add(e);let n=()=>tc(e,t.seitename);e.ownerDocument.readyState===`loading`?e.ownerDocument.addEventListener(`DOMContentLoaded`,n,{once:!0}):queueMicrotask(n)}var sc=Q.blockType,cc=class extends T{static{this.blockType=`navi`}static{this.ohneDaten=!0}static{this.tagName=`ff-navi`}static{this.displayName=`Navi`}static{this.category=`layout`}static{this.acceptsChildren=!0}static{this.allowedChildTypes=[sc]}static{this.addChildButton={label:`Eintrag`,childType:sc}}static{this.containerHint=!1}static{this.defaultProps={}}static{this.customProperties=[]}static{this.maskenRand=!0}static{this.allowedParentTypes=[mt]}static{this.raster={startW:5,startH:24,minW:3,minH:3}}static{this.styles=[T.styles,o`
      :host {
        height: 100%;
        width: ${Ks.breite}px;
        transition: width var(--se-move);
      }
      :host([offen]) { width: ${Ks.breiteOffen}px; }
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
    `]}connectedCallback(){super.connectedCallback(),ic(this)}disconnectedCallback(){super.disconnectedCallback(),ac(this)}klappen(){this.toggleAttribute(`offen`),Qs(this)}render(){return g`<div class="leiste">
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
          <slot @slotchange=${()=>oc(this)}></slot>
        </div>
      </div>`}};T.defineAndRegister(cc);var lc=rt(`text`);function uc(e){let t=e.getAttribute(`source`)??``,n=e.getAttribute(lc)??``;return t===``||n===``?void 0:{sourceId:t,code:n}}function dc(e){let t=fi(e,lc);t.art!==`ungebunden`&&(e.text=t.art===`wert`?t.wert:``)}function fc(e){uc(e)&&(e.text=``)}var pc=oi({hydriere:dc,verdrahte:fc}),mc=pc.connect,hc=pc.disconnect,gc=6,_c=96,vc=14,yc={duenn:`300`,normal:`400`,fett:`700`},bc={links:`left`,mitte:`center`,rechts:`right`},xc={standard:`var(--se-ink)`,gedaempft:`var(--se-muted)`,akzent:`var(--se-accent)`,erfolg:`var(--se-green)`,warnung:`var(--se-amber)`,fehler:`var(--se-red)`},Sc=`standard`;function Cc(e){if(e===`ueberschrift`)return 15;if(e===`klein`)return 12;let t=typeof e==`number`?e:Number.parseFloat(String(e??``));return Number.isFinite(t)?Math.min(_c,Math.max(gc,t)):vc}function wc(e){return typeof e==`string`&&e in yc?e:`normal`}function Tc(e){return typeof e==`string`&&e in bc?e:`links`}function Ec(e){return typeof e==`string`&&e in xc?e:Sc}var $=class extends T{constructor(...e){super(...e),this.groesse=vc,this.gewicht=`normal`,this.ausrichtung=`links`,this.farbe=Sc,this.text=`Text`,this.source=``,this.textField=``}static{this.blockType=`text`}static{this.tagName=`ff-text`}static{this.displayName=`Text`}static{this.category=`anzeige`}static{this.acceptsDataSource=!0}static{this.bindableSpots=[{prop:`text`,label:`Text`}]}static{this.defaultProps={width:`fill`,groesse:vc,gewicht:`normal`,ausrichtung:`links`,farbe:Sc,text:`Text`,source:``,textField:``}}static{this.raster={startW:6,startH:2,minW:1,minH:1}}static{this.customProperties=[{attributeName:`groesse`,name:`Größe`,description:`Schriftgröße in Pixeln.`,kind:`number`,unit:`px`,min:gc,max:_c,inspectorRow:`Text-Stil`},{attributeName:`gewicht`,name:`Gewicht`,description:`Strichstärke der Schrift.`,kind:`segment`,options:[{value:`duenn`,label:`Dünn`},{value:`normal`,label:`Normal`},{value:`fett`,label:`Fett`}],inspectorRow:`Text-Stil`},{attributeName:`ausrichtung`,name:`Ausrichtung`,description:`Wo der Text in seiner Breite sitzt.`,kind:`segment`,options:[{value:`links`,label:`Links`},{value:`mitte`,label:`Mitte`},{value:`rechts`,label:`Rechts`}],inspectorRow:`Text-Stil`},{attributeName:`farbe`,name:`Farbe`,description:`Textfarbe aus den Farben der Maske.`,kind:`select`,options:[{value:`standard`,label:`Standard`},{value:`gedaempft`,label:`Gedämpft`},{value:`akzent`,label:`Akzent`},{value:`erfolg`,label:`Erfolg`},{value:`warnung`,label:`Warnung`},{value:`fehler`,label:`Fehler`}]}]}static{this.styles=[T.styles,o`
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
      style=${U({fontSize:`${Cc(this.groesse)}px`,fontWeight:yc[wc(this.gewicht)],textAlign:bc[Tc(this.ausrichtung)],color:xc[Ec(this.farbe)]})}
      data-ff-editable
      data-ff-spot="text"
      ?data-ff-bound=${this.textField!==``}
      @dblclick=${e=>this.inlineEdit(e,`text`)}
    >${this.text}</div>`}connectedCallback(){super.connectedCallback(),mc(this)}disconnectedCallback(){super.disconnectedCallback(),hc(this)}};w([S({type:Number})],$.prototype,`groesse`,void 0),w([S()],$.prototype,`gewicht`,void 0),w([S()],$.prototype,`ausrichtung`,void 0),w([S()],$.prototype,`farbe`,void 0),w([S()],$.prototype,`text`,void 0),w([S()],$.prototype,`source`,void 0),w([S()],$.prototype,`textField`,void 0),T.defineAndRegister($);var Dc=[`waagerecht`,`senkrecht`],Oc=`waagerecht`;function kc(e){return Dc.includes(e)?e:Oc}var Ac=class extends T{constructor(...e){super(...e),this.richtung=Oc}static{this.blockType=`trenner`}static{this.ohneDaten=!0}static{this.tagName=`ff-trenner`}static{this.displayName=`Trennlinie`}static{this.category=`layout`}static{this.defaultProps={width:`fill`,richtung:Oc}}static{this.resizableWidth=!1}static{this.raster={startW:24,startH:1,minW:1,minH:1,varianten:[{wenn:{attributeName:`richtung`,equals:`senkrecht`},startW:1,startH:6,breiteZiehbar:!1}]}}static{this.customProperties=[{attributeName:`richtung`,name:`Richtung`,description:`Waagerecht trennt oben von unten, senkrecht links von rechts.`,kind:`select`,options:[{value:`waagerecht`,label:`Waagerecht`},{value:`senkrecht`,label:`Senkrecht`}]}]}static{this.styles=[T.styles,o`

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
    `]}render(){return g`<div class="flaeche ${kc(this.richtung)}"><div class="linie"></div></div>`}};w([S()],Ac.prototype,`richtung`,void 0),T.defineAndRegister(Ac),typeof window<`u`&&window.addEventListener(`unhandledrejection`,e=>{let t=e.reason;F(`Unerwarteter Fehler in der Maske: `+(t instanceof Error?t.message:String(t)))})})();