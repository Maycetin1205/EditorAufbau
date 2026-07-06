// BasicBlock
// Pflicht-Basisklasse fuer alle Block-Views (Notiz Woche 2: BasicComponentForGrid).
// Konkrete Blocks erben von BasicBlock und implementieren das BlockComponent-Interface.
//
// Aufgaben dieser Klasse:
//  - LitElement-Basis fuer alle Blocks (Web Component)
//  - geteilte :host-Styles, damit jeder Block die Hostflaeche fuellt
//  - Instanz-Getter `customProperties`, der auf das statische gleichnamige
//    Feld der konkreten Klasse delegiert (Notiz-Vertrag erfuellt, aber Daten
//    liegen statisch — keine Instanzierung noetig).
//  - `editable` Reactive Property: BlockHost setzt true, sobald der Block
//    selektiert ist; Bloecke koennen damit ihre Inline-Editing-Hooks
//    aktivieren (Doppelklick auf Label/Text).
//  - Inline-Edit-Helper `inlineEdit`: blendet contenteditable in das
//    angeklickte Element ein und emittiert 'ff-prop-change' nach Commit.
//  - statischer Helper `defineAndRegister`, der HMR-geschuetzt das Custom-Element
//    registriert und den Registry-Eintrag aus den statischen Klassenfeldern
//    materialisiert. KEIN `new` auf dem Konstruktor — `new` auf einem noch
//    nicht registrierten Custom-Element ist laut Spec illegal und wuerde
//    in HMR-Reloads brechen.

import { css, LitElement, type CSSResultGroup } from 'lit'
import { property } from 'lit/decorators.js'
import type { BlockComponent, BlockComponentStatic } from './BlockComponent'
import type { PropertyDescription } from './PropertyDescription'
import { registerBlockType } from './blockRegistry'
import { FLOW_DEFAULTS } from './flowLayout'

export abstract class BasicBlock extends LitElement implements BlockComponent {
  // Flow-Modell: der Block füllt KEINE feste Hostfläche mehr, sondern nimmt
  // im Container-Fluss seine natürliche Größe ein.
  static override styles: CSSResultGroup = css`
    :host { display: block; }
    [data-ff-editable] { cursor: text; }
    :host(:not([data-editable])) [data-ff-editable] { cursor: inherit; }
  `

  static readonly customProperties: PropertyDescription[] = []

  // Vom BlockHost auf das DOM-Property gesetzt. true wenn der Block selektiert
  // ist und Inline-Edit zulaessig waere. Wir reflektieren als Attribut, damit
  // :host([data-editable]) CSS greift.
  @property({ type: Boolean, reflect: true, attribute: 'data-editable' })
  editable = false

  get customProperties(): PropertyDescription[] {
    return (this.constructor as typeof BasicBlock).customProperties
  }

  // Inline-Editing-Brueckenkopf:
  //   1. Doppelklick auf ein Element mit data-ff-editable.
  //   2. Element wird contenteditable, Cursor rein, Auswahl markiert.
  //   3. Enter/Blur committed; Escape verwirft.
  //   4. Commit emittiert 'ff-prop-change' { attr, value: string }.
  // Bloecke binden den Listener via @dblclick=${(e) => this.inlineEdit(e, 'label')}.
  protected inlineEdit(event: MouseEvent, attr: string): void {
    if (!this.editable) return
    const target = event.currentTarget as HTMLElement | null
    if (!target) return
    event.stopPropagation()
    event.preventDefault()
    const original = target.textContent ?? ''
    target.setAttribute('contenteditable', 'plaintext-only')
    target.focus()
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(target)
    selection?.removeAllRanges()
    selection?.addRange(range)

    let finished = false
    const cleanup = (commit: boolean) => {
      if (finished) return
      finished = true
      target.removeAttribute('contenteditable')
      target.removeEventListener('blur', onBlur)
      target.removeEventListener('keydown', onKey)
      if (commit) {
        const next = (target.textContent ?? '').trim()
        if (next !== original) {
          this.dispatchEvent(new CustomEvent('ff-prop-change', {
            detail: { attr, value: next },
            bubbles: true,
            composed: true,
          }))
        }
      } else {
        target.textContent = original
      }
    }
    const onBlur = () => cleanup(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        target.blur()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cleanup(false)
      }
    }
    target.addEventListener('blur', onBlur)
    target.addEventListener('keydown', onKey)
  }

  static defineAndRegister(BlockClass: BlockComponentStatic): void {
    if (!customElements.get(BlockClass.tagName)) {
      customElements.define(
        BlockClass.tagName,
        BlockClass as unknown as CustomElementConstructor,
      )
    }
    registerBlockType({
      type: BlockClass.blockType,
      tagName: BlockClass.tagName,
      displayName: BlockClass.displayName,
      category: BlockClass.category,
      // Universelle Flow-Props (width) liegen unter den Block-Defaults,
      // damit Persistenz sie kennt; Block-eigene Defaults gewinnen.
      defaultProps: { ...FLOW_DEFAULTS, ...BlockClass.defaultProps },
      customProperties: BlockClass.customProperties,
      acceptsChildren: BlockClass.acceptsChildren ?? false,
      resizableWidth: BlockClass.resizableWidth ?? true,
      allowedChildTypes: BlockClass.allowedChildTypes,
      defaultChildren: BlockClass.defaultChildren,
      childDirection: BlockClass.childDirection,
      showInPalette: BlockClass.showInPalette,
      containerHint: BlockClass.containerHint,
      addChildButton: BlockClass.addChildButton,
    })
  }
}
