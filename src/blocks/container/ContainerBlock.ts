// ContainerBlock
// Layout-Baustein: ein Bereich, der Kind-Bloecke im Fluss anordnet
// (untereinander oder nebeneinander). Er hat KEIN eigenes Aussehen in der
// Maske — reine Struktur. Die sichtbare Editor-Hilfe (gestrichelter Rahmen,
// Platzhaltertext) kommt vom BlockHost, damit der Baustein editor-blind
// bleibt (WYSIWYG: was exportiert wird, ist exakt dieses Element).
//
// Kinder laufen ueber Light-DOM + <slot>: der Editor (und spaeter der Export)
// legt die Kind-Elemente als normale DOM-Kinder in <ff-container> hinein;
// `slot { display: contents }` laesst sie am Flex-Layout des Wrappers
// teilnehmen.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export class ContainerBlock extends BasicBlock {
  static readonly blockType = 'container'
  static readonly tagName = 'ff-container'
  static readonly displayName = 'Bereich'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = true
  static readonly defaultProps = { direction: 'column' }

  // Flow-Props (direction/gap/padding) bekommen in Kap. 2.4 Inspector-Felder.
  static override readonly customProperties: PropertyDescription[] = []

  // Aussehen kommt AUSSCHLIESSLICH aus den Masken-Tokens (--se-*),
  // siehe src/design/masken-tokens.css. Keine Literale, keine Fallbacks.
  static styles = [
    BasicBlock.styles,
    css`
      .wrap {
        display: flex;
        gap: var(--se-gap);
        align-items: flex-start;
      }
      .wrap.column { flex-direction: column; }
      .wrap.row { flex-direction: row; flex-wrap: wrap; }
      slot { display: contents; }
    `,
  ]

  // 'column' = untereinander (Default), 'row' = nebeneinander.
  @property() direction: 'column' | 'row' = 'column'

  render(): TemplateResult {
    const dir = this.direction === 'row' ? 'row' : 'column'
    return html`<div class="wrap ${dir}"><slot></slot></div>`
  }
}

BasicBlock.defineAndRegister(ContainerBlock)
