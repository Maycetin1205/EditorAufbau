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
  // width 'fill': ein Bereich nimmt standardmäßig die volle Breite ein.
  static readonly defaultProps = {
    direction: 'column',
    gap: 'md',
    padding: 'none',
    width: 'fill',
  }

  // Flow-Props (Richtung/Abstände/Breite) rendert der Inspector als eigene
  // Layout-Sektion (Kap. 2.4) — keine generischen customProperties nötig.
  static override readonly customProperties: PropertyDescription[] = []

  // Aussehen kommt AUSSCHLIESSLICH aus den Masken-Tokens (--se-*),
  // siehe src/design/masken-tokens.css. Keine Literale, keine Fallbacks.
  static styles = [
    BasicBlock.styles,
    css`
      .wrap {
        display: flex;
        align-items: flex-start;
      }
      .wrap.column { flex-direction: column; }
      .wrap.row { flex-direction: row; flex-wrap: wrap; }
      .wrap.gap-sm { gap: var(--se-gap-sm); }
      .wrap.gap-md { gap: var(--se-gap); }
      .wrap.gap-lg { gap: var(--se-gap-lg); }
      .wrap.pad-none { padding: 0; }
      .wrap.pad-sm { padding: var(--se-gap-sm); }
      .wrap.pad-md { padding: var(--se-gap); }
      .wrap.pad-lg { padding: var(--se-gap-lg); }
      slot { display: contents; }
    `,
  ]

  // 'column' = untereinander (Default), 'row' = nebeneinander.
  @property() direction: 'column' | 'row' = 'column'
  // Abstand zwischen den Kindern / Innenabstand des Bereichs.
  @property() gap: 'sm' | 'md' | 'lg' = 'md'
  @property() padding: 'none' | 'sm' | 'md' | 'lg' = 'none'

  render(): TemplateResult {
    const dir = this.direction === 'row' ? 'row' : 'column'
    const gap = ['sm', 'md', 'lg'].includes(this.gap) ? this.gap : 'md'
    const pad = ['none', 'sm', 'md', 'lg'].includes(this.padding) ? this.padding : 'none'
    return html`<div class="wrap ${dir} gap-${gap} pad-${pad}"><slot></slot></div>`
  }
}

BasicBlock.defineAndRegister(ContainerBlock)
