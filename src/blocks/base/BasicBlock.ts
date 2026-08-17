import { css, LitElement, type CSSResultGroup } from 'lit'
import { property } from 'lit/decorators.js'
import type { BlockComponent, BlockComponentStatic } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { FLOW_DEFAULTS } from '../../core/blocks/flowLayout'
import { RASTER_DEFAULTS } from '../../core/blocks/rasterLayout'
import { AUSWAHL_FOLGE_DEFAULTS } from '../../core/data/auswahlFolge'
import { QUELLEN_DEFAULTS } from '../../core/data/sourceLinks'

export abstract class BasicBlock extends LitElement implements BlockComponent {
  static override styles: CSSResultGroup = css`
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
  `

  static readonly customProperties: PropertyDescription[] = []

  @property({ type: Boolean, reflect: true, attribute: 'data-editable' })
  editable = false

  get customProperties(): PropertyDescription[] {
    return (this.constructor as typeof BasicBlock).customProperties
  }

  protected inlineEdit(event: MouseEvent, attr: string): void {
    if (!this.editable) return
    const target = event.currentTarget as HTMLElement | null
    if (!target) return

    if (target.hasAttribute('data-ff-bound')) return
    event.stopPropagation()
    event.preventDefault()
    const original = target.textContent ?? ''

    const originalNodes = Array.from(target.childNodes)
    const originalData = originalNodes.map((n) => n.textContent ?? '')
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
        target.replaceChildren(...originalNodes)
        originalNodes.forEach((n, i) => {
          if (n.textContent !== originalData[i]) n.textContent = originalData[i]
        })
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

      defaultProps: {
        ...FLOW_DEFAULTS,
        ...RASTER_DEFAULTS,
        ...(BlockClass.acceptsDataSource ? QUELLEN_DEFAULTS : null),

        ...(BlockClass.kannAuswahlFolgen ? AUSWAHL_FOLGE_DEFAULTS : null),
        ...BlockClass.defaultProps,
      },
      customProperties: BlockClass.customProperties,
      acceptsChildren: BlockClass.acceptsChildren ?? false,
      resizableWidth: BlockClass.resizableWidth ?? true,
      resizableHeight: BlockClass.resizableHeight ?? false,
      allowedChildTypes: BlockClass.allowedChildTypes,
      allowedParentTypes: BlockClass.allowedParentTypes,
      lockedWidth: BlockClass.lockedWidth,
      defaultChildren: BlockClass.defaultChildren,
      childDirection: BlockClass.childDirection,
      showInPalette: BlockClass.showInPalette,
      templateChild: BlockClass.templateChild,
      containerHint: BlockClass.containerHint,
      addChildButton: BlockClass.addChildButton,
      acceptsDataSource: BlockClass.acceptsDataSource,
      satzWahl: BlockClass.satzWahl,
      kannAuswahlFolgen: BlockClass.kannAuswahlFolgen,
      bindableSpots: BlockClass.bindableSpots,
      actionValueSpots: BlockClass.actionValueSpots,
      listenBindung: BlockClass.listenBindung,
      blockEvents: BlockClass.blockEvents,
      pageBlock: BlockClass.pageBlock,
      flaechenSeite: BlockClass.flaechenSeite,
      maskenRand: BlockClass.maskenRand,
      raster: BlockClass.raster,
    })
  }
}
