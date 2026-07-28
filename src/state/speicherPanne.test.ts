// Speicher-Panne — Tests zum SCHREIB-Weg (Befund B3, 2026-07-28)
//
// Bis 2026-07-28 schrieben alle vier Speicherwege (Maske + die drei
// Bibliotheken) bei einem Fehler nur ein console.warn. Der Bediener sah
// nichts und verlor beim Schliessen seine Arbeit — Widerspruch zur eigenen
// Zusage „Verluste passieren nie still".
//
// Eigene Datei, weil persistence.test.ts sonst ueber den 500-Zeilen-Deckel
// waechst (check:regeln) — und weil das hier eine eigene Aussage ist: der
// LESE-Weg wohnt drueben, der SCHREIB-Weg hier.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Editor } from './Editor'
import { merkeSpeicherErfolg } from './notfallkopie'
import { persistState } from './persistence'
import { createEmptyTree } from './treeOps'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'

function captureAlerts(): string[] {
  const msgs: string[] = []
  ;(globalThis as Record<string, unknown>).alert = (m: string) => { msgs.push(m) }
  return msgs
}

describe('Speicher-Panne meldet sich (B3, 2026-07-28)', () => {
  // Bis 2026-07-28 schrieben alle vier Speicherwege bei einem Fehler nur ein
  // console.warn — der Bediener sah nichts und verlor beim Schliessen seine
  // Arbeit. Jetzt gibt es Klartext, aber nur EINMAL je zusammenhaengender
  // Stoerung (sonst Meldungs-Gewitter durch den Autosave).
  const echtesSetItem = localStorage.setItem.bind(localStorage)

  function setItemFaellt(fuerKeys: (key: string) => boolean): void {
    localStorage.setItem = ((key: string, value: string) => {
      if (fuerKeys(key)) throw new Error('QuotaExceededError')
      echtesSetItem(key, value)
    }) as typeof localStorage.setItem
  }

  // Der Merker lebt im Modul und ueberlebt damit den einzelnen Test — in der
  // App ist das richtig (er soll die ganze Sitzung halten), hier muss jeder
  // Fall bei null anfangen.
  beforeEach(() => { localStorage.clear(); merkeSpeicherErfolg(KEY) })
  afterEach(() => {
    localStorage.setItem = echtesSetItem
    delete (globalThis as Record<string, unknown>).alert
  })

  it('Fehler -> Fehler -> Erfolg -> Fehler ergibt GENAU ZWEI Meldungen', () => {
    const msgs = captureAlerts()
    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null)
    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(1) // zweiter Versuch schweigt: dieselbe Stoerung

    localStorage.setItem = echtesSetItem
    persistState(createEmptyTree(), null) // Speicher geht wieder

    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null) // NEUE Stoerung -> meldet erneut
    expect(msgs).toHaveLength(2)
    expect(msgs[1]).toContain('Maske')
  })

  it('der Erfolg eines FREMDEN Speicherwegs entschaerft den Merker nicht', () => {
    const msgs = captureAlerts()
    setItemFaellt((k) => k === KEY)
    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(1)

    // Eine andere Bibliothek speichert erfolgreich — das ist eine ANDERE
    // Stoerungslage und darf die Masken-Meldung nicht zuruecksetzen.
    merkeSpeicherErfolg('irgendeine_andere_bibliothek')

    persistState(createEmptyTree(), null)
    expect(msgs).toHaveLength(1)
  })

  it('der Editor laeuft trotz Speicher-Panne normal weiter', () => {
    captureAlerts()
    setItemFaellt(() => true)
    const ed = new Editor()
    const node = ed.addBlock(TEST_BLOCK, ed.rootId)
    expect(node).not.toBeNull()
    expect(ed.getNode(node!.id)).toBeDefined()
  })
})

