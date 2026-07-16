// Wächter für die Popup-Schritte der Ketten-Laufzeit (P-B): applyPopupStep
// schaltet GENAU das Popup mit dem Klarnamen — mehr nicht. DOM-frei getestet
// über einen Attrappen-Wurzelknoten (Node-Umgebung, Muster seRuntime.test).

import { describe, expect, it } from 'vitest'
import { applyPopupStep } from './seAktionen'

function fakePopup(name: string) {
  const attrs = new Map<string, string>([['name', name]])
  return {
    getAttribute: (k: string) => attrs.get(k) ?? null,
    setAttribute: (k: string, v: string) => { attrs.set(k, v) },
    removeAttribute: (k: string) => { attrs.delete(k) },
    offen: () => attrs.has('offen'),
  }
}

function fakeRoot(popups: ReturnType<typeof fakePopup>[]): ParentNode {
  return {
    querySelectorAll: (selector: string) => (selector === 'ff-popup' ? popups : []),
  } as unknown as ParentNode
}

describe('applyPopupStep', () => {
  it('öffnet und schließt genau das Popup mit dem Klarnamen', () => {
    const behandlung = fakePopup('Neue Behandlung')
    const anderes = fakePopup('Anderes')
    const root = fakeRoot([behandlung, anderes])

    applyPopupStep(root, 'Neue Behandlung', true)
    expect(behandlung.offen()).toBe(true)
    expect(anderes.offen()).toBe(false)

    applyPopupStep(root, 'Neue Behandlung', false)
    expect(behandlung.offen()).toBe(false)
  })

  it('leerer Name oder kein Treffer: nichts passiert (still-harmlos)', () => {
    const popup = fakePopup('Da')
    applyPopupStep(fakeRoot([popup]), '', true)
    applyPopupStep(fakeRoot([popup]), 'Gibt es nicht', true)
    expect(popup.offen()).toBe(false)
  })
})
