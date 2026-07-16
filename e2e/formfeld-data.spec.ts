// E2E-Prüfung Fahrplan-Schritt 4: Formularfeld-Datenbindung im Export.
// Nur hier real abbildbar, weil die Schattengrenze (Shadow DOM) im echten
// Browser existiert: 'input' ist composed und überquert sie, 'change' NICHT
// (DOM-Standard). Die Feld-Runtime lauscht am Host — das Formularfeld muss
// 'change' deshalb am Host neu auslösen, sonst feuert die Kette
// „Wert geändert" in der echten Maske nie. Genau das sichert dieser Test:
//  - Bindung im Editor über den Daten-Dialog (nur Klarnamen sichtbar)
//  - Export trägt source/valuefield als Attribute
//  - Hydrierung: erste Zeile der Quelle füllt das Feld, Platzhalter weg
//  - Tippen patcht die Zeile lokal (setField), Ändern feuert die Kette
//    mit {VALUE} — durch die Schattengrenze hindurch.

import { readFile } from 'node:fs/promises'
import { test, expect, type Download, type Page } from '@playwright/test'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Formularfeld' }).waitFor()
}

async function selectFormfeld(page: Page) {
  await page.locator('ff-formfeld').evaluate((el) =>
    el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await expect(page.getByText('formfeld ·')).toBeVisible() // Inspector-Kopf
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

// SEDATA-Stub in der Form der Referenzmaske (Muster kanban-data.spec.ts):
// Terminplaner-Zeilen, Tiername = 78_30. Die erste Zeile ist die, die ein
// gebundenes Formularfeld zeigt (v1: erste Zeile der eigenen Quelle).
const SEDATA_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [
        { '78_30': 'Minka' },
        { '78_30': 'Buddy' },
      ],
    }],
  },
}

test('Export: Formularfeld hydriert aus der ersten Zeile, schreibt lokal und feuert die Kette beim Ändern', async ({ page, context }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Formularfeld', exact: true }).click()
  await selectFormfeld(page)

  // Daten anschließen: Quelle + Feld über den generischen Dialog (Klarnamen).
  await page.getByRole('button', { name: /Daten anschlie/ }).click()
  const dialog = page.getByRole('dialog', { name: /Daten anschlie/ })
  await dialog.getByRole('group', { name: 'Datenquelle' })
    .getByRole('button', { name: 'Terminplaner' }).click()
  const feldGruppe = dialog.getByRole('group', { name: 'Feld' })
  await expect(feldGruppe.getByRole('button', { name: '78_30' })).toHaveCount(0) // nie Feldcodes
  await feldGruppe.getByRole('button', { name: 'Tiername' }).click()
  await dialog.getByRole('button', { name: 'Fertig' }).click()

  // Editor-Vorschau: gebundenes Feld zeigt den KLARNAMEN, nie erfundene Werte.
  await expect(page.locator('ff-formfeld input.ctrl')).toHaveValue('Tiername')

  const html = await exportMaskHtml(page)
  expect(html).toContain('valuefield="78_30"')
  expect(html).toContain('source="')

  // Maske laden. Die Kette „Wert geändert" (START_TOOL 42, Param {VALUE})
  // wird im Test direkt als Attribut gestellt — geprüft wird die Laufzeit,
  // nicht das Zentrale-UI. sendBWLinkIntern zeichnet auf.
  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate(() => {
    document.querySelector('ff-formfeld')?.setAttribute(
      'data-ff-aktionen',
      JSON.stringify({
        onChange: [{ type: 'START_TOOL', resultKey: '', toolNr: '42', toolParams: ['{VALUE}'] }],
      }),
    )
    const w = window as unknown as Record<string, unknown>
    const links: string[] = []
    w.__testLinks = links
    w.sendBWLinkIntern = (link: string) => { links.push(link) }
  })
  await mask.evaluate((sedata) => {
    (window as unknown as Record<string, unknown>).SEDATA = sedata
  }, SEDATA_STUB)

  // Hydrierung: erste Zeile -> Feldwert; Platzhalter-Regel: weg, weil Wert da.
  const input = mask.locator('ff-formfeld input.ctrl')
  await expect(input).toHaveValue('Minka')
  await expect(mask.locator('ff-formfeld .ph')).toBeHidden()

  // ECHT tippen (nicht fill(): programmatisches Setzen markiert den Wert
  // nicht als Nutzer-Eingabe, der Browser feuert beim Verlassen dann gar
  // kein natives change) — dann committen per blur.
  await input.click()
  await mask.keyboard.press('ControlOrMeta+a')
  await mask.keyboard.type('Rex')
  await input.blur()

  // Die Kette lief MIT dem neuen Wert — durch die Schattengrenze.
  await expect.poll(() =>
    mask.evaluate(() => (window as unknown as Record<string, unknown>).__testLinks),
  ).toContain('0,START_TOOL,42,Rex')

  // Lokal geschrieben (setField): die Zeile selbst trägt den neuen Wert —
  // Datenfeld-Parameter und jede Neu-Hydrierung lesen ab jetzt „Rex".
  const zeilenWert = await mask.evaluate(() => {
    const sedata = (window as unknown as {
      SEDATA: { Daten: { SEFileLoop: { Zeilen: Record<string, string>[] }[] } }
    }).SEDATA
    return sedata.Daten.SEFileLoop[0].Zeilen[0]['78_30']
  })
  expect(zeilenWert).toBe('Rex')
})
