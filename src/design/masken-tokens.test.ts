// Token-Regel-Test (Kap. 2.5 Sicherheitsnetz)
// Erzwingt die Design-Leitplanke maschinell: Baustein-Code (src/blocks/**)
// enthält KEINE Farb-Literale (Hex, hsl(), rgb()) und KEINE var()-Fallbacks
// auf --se-Tokens — alles Aussehen kommt aus src/design/masken-tokens.css.
// Schlägt dieser Test an, hat jemand die Werteliste umgangen.
// LEITPLANKE: Test niemals löschen/abschwächen, um "grün" zu werden.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const BLOCKS_DIR = join(HERE, '..', 'blocks')

function blockSourceFiles(): string[] {
  return readdirSync(BLOCKS_DIR, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.ts'))
    .map((e) => join(e.parentPath, e.name))
}

describe('Masken-Design-Leitplanke', () => {
  it('Baustein-Code enthält keine Farb-Literale', () => {
    const verstoesse: string[] = []
    for (const file of blockSourceFiles()) {
      const src = readFileSync(file, 'utf8')
      for (const [i, line] of src.split('\n').entries()) {
        if (/#[0-9a-fA-F]{3,8}\b|hsla?\(|rgba?\(/.test(line)) {
          verstoesse.push(`${file}:${i + 1}: ${line.trim()}`)
        }
      }
    }
    expect(verstoesse, 'Farb-Literale im Block-CSS gefunden').toEqual([])
  })

  it('Baustein-Code benutzt keine var()-Fallbacks auf --se-Tokens', () => {
    const verstoesse: string[] = []
    for (const file of blockSourceFiles()) {
      const src = readFileSync(file, 'utf8')
      for (const [i, line] of src.split('\n').entries()) {
        if (/var\(--se-[a-z0-9-]+\s*,/.test(line)) {
          verstoesse.push(`${file}:${i + 1}: ${line.trim()}`)
        }
      }
    }
    expect(verstoesse, 'var()-Fallbacks dublizieren Token-Werte').toEqual([])
  })

  it('die zentrale Token-Datei existiert und definiert --se-Tokens', () => {
    const css = readFileSync(join(HERE, 'masken-tokens.css'), 'utf8')
    expect(css).toMatch(/--se-accent:/)
    expect(css).toMatch(/--se-r-sm:/)
    expect(css).toMatch(/--se-font:/)
  })
})
