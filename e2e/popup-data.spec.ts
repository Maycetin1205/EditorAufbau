// E2E-Wächter P-C (Popup-Kreislauf im Export) — bewusst EIN Test
// (Nutzer-Entscheidung Variante B, 2026-07-17: kein Test-Aufwuchs; neue
// Browser-Tests nur, wenn ein Paket Export/Laufzeit berührt).
// Nur hier real abbildbar: die exportierte Maske bootet ihr Runtime-Bündel
// im echten Browser, display:none/offen wirken wirklich, das X liegt hinter
// der Schattengrenze. Geprüft wird der ganze Kreislauf in einem Durchlauf:
//  - Export: ff-popup trägt den Klarnamen, NIE das offen-Attribut
//  - zu → Kette POPUP_OPEN öffnet → Kette POPUP_CLOSE schließt → X schließt
// Die Ketten werden in der Maske direkt als data-ff-aktionen gestellt
// (Muster formfeld-data.spec.ts): geprüft wird die LAUFZEIT — dass der
// Export Schritte in Klarnamen übersetzt (popupId reist nie mit), deckt
// export.test; dass Editor-Anfasser und Fenster dieselbe 24px-Regel teilen,
// deckt popup-editor.spec.ts.

import { readFile } from 'node:fs/promises'
import { test, expect, type Download, type Page } from '@playwright/test'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Schaltfläche' }).waitFor()
}

// Toolbar-Export anstoßen (Muster kanban-data.spec.ts).
async function exportMaskHtml(page: Page): Promise<string> {
  const downloads: Download[] = []
  page.on('download', (d) => downloads.push(d))
  await page.getByRole('button', { name: 'Als SoftEngine-Maske exportieren' }).click()
  await expect.poll(() => downloads.length).toBe(2)
  const maske = downloads.find((d) => d.suggestedFilename() === 'index.basis.source.html')
  if (!maske) throw new Error('index.basis.source.html wurde nicht heruntergeladen')
  return await readFile(await maske.path(), 'utf8')
}

test('Export: Kette öffnet das Popup, Kette schließt es, X schließt immer', async ({ page, context }) => {
  await freshEditor(page)

  // Popup-Seite anlegen (＋ Popup macht sie aktiv) und eine Schaltfläche
  // HINEIN setzen — die Bibliothek fügt immer in die aktive Seite ein.
  await page.getByRole('button', { name: '＋ Popup' }).click()
  await expect(page.locator('ff-popup')).toBeVisible()
  await page.getByRole('button', { name: 'Schaltfläche', exact: true }).click()
  await expect(page.locator('ff-popup ff-button')).toHaveCount(1)

  // Zurück zur Hauptseite, zweite Schaltfläche dort (Öffnen-Auslöser).
  await page.getByRole('button', { name: 'Hauptseite' }).click()
  await page.getByRole('button', { name: 'Schaltfläche', exact: true }).click()
  await expect(page.locator('ff-button')).toHaveCount(1) // Hauptseite rendert Popups nie

  const html = await exportMaskHtml(page)
  // Der Klarname reist als name-Attribut (Laufzeit-Identität), das
  // offen-Attribut NIE (Popup startet zu — export.test-Regel, hier am
  // echten Download belegt).
  const tag = /<ff-popup[^>]*/.exec(html)?.[0] ?? ''
  expect(tag).toContain('name="Popup"')
  expect(tag).not.toContain('offen')

  // Ketten VOR dem Laden in den HTML-Text stellen (Export-Form der
  // Schritte: popup = Klarname) — connectClickAktionen verdrahtet nur
  // Knöpfe, die ihre Kette beim Anschließen schon tragen, exakt wie im
  // echten Export, wo data-ff-aktionen im HTML mitreist. Der Knopf IM
  // Popup schließt, der auf der Hauptseite öffnet.
  const kette = (typ: 'POPUP_OPEN' | 'POPUP_CLOSE') =>
    `<ff-button data-ff-aktionen='${JSON.stringify({
      onClick: [{ type: typ, resultKey: '', popup: 'Popup' }],
    })}'`
  const popupStart = html.indexOf('<ff-popup')
  const popupEnd = html.indexOf('</ff-popup>')
  expect(popupStart).toBeGreaterThan(-1)
  const htmlMitKetten =
    html.slice(0, popupStart).replace('<ff-button', kette('POPUP_OPEN')) +
    html.slice(popupStart, popupEnd).replace('<ff-button', kette('POPUP_CLOSE')) +
    html.slice(popupEnd).replace('<ff-button', kette('POPUP_OPEN'))

  const mask = await context.newPage()
  await mask.setContent(htmlMitKetten)
  // Griff-Ids nur fürs Klicken im Test (keine Verdrahtungs-Wirkung).
  await mask.evaluate(() => {
    for (const btn of Array.from(document.querySelectorAll('ff-button'))) {
      btn.id = btn.closest('ff-popup') !== null ? 'btn-zu' : 'btn-auf'
    }
  })

  const popup = mask.locator('ff-popup')

  // 1) Startzustand: zu (display:none ohne offen-Attribut).
  await expect(popup).toBeHidden()

  // 2) Kette „Popup öffnen" — der Hauptseiten-Knopf macht es sichtbar.
  await mask.locator('#btn-auf').click()
  await expect(popup).toBeVisible()
  await expect(popup).toHaveAttribute('offen', '')

  // 3) Kette „Popup schließen" — der Knopf im Popup macht es wieder zu.
  await mask.locator('#btn-zu').click()
  await expect(popup).toBeHidden()

  // 4) Das eingebaute X schließt IMMER (auch ohne Kette) — erneut öffnen,
  //    dann X hinter der Schattengrenze klicken.
  await mask.locator('#btn-auf').click()
  await expect(popup).toBeVisible()
  await mask.locator('ff-popup .x').click()
  await expect(popup).toBeHidden()
})
