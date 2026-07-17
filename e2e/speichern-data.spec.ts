// E2E-Wächter „Quelle speichern" (Nutzer-Go 2026-07-17) — bewusst EIN
// Kreislauf-Test (Test-Bremse, Variante B): tippen patcht die Zeile lokal,
// der Knopf mit dem Schritt QUELLE_SPEICHERN schreibt GENAU die geänderten
// Felder als PUT über die gewählte Vorlage (relId ohne IDB-Präfix) — nichts
// schreibt vorher, nichts doppelt. Nur hier real abbildbar: echtes Tippen
// über die Schattengrenze + das Runtime-Bündel der exportierten Maske.
// Die Kette reist im HTML (wie im echten Export, s. popup-data.spec.ts);
// FF_RELATIONS wird nach dem Laden gestellt (die Laufzeit liest es erst
// beim Klick) — Editor-Seite der Schritte deckt export.test.

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

const SEDATA_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [{ '78_30': 'Minka' }],
    }],
  },
}

test('Export: Tippen schreibt nur lokal, der Speichern-Schritt schreibt die geänderten Felder als PUT', async ({ page, context }) => {
  await freshEditor(page)

  // Formularfeld an Terminplaner/Tiername binden (Muster formfeld-data).
  await page.getByRole('button', { name: 'Formularfeld', exact: true }).click()
  await selectFormfeld(page)
  await page.getByRole('button', { name: /Daten anschlie/ }).click()
  const dialog = page.getByRole('dialog', { name: /Daten anschlie/ })
  await dialog.getByRole('group', { name: 'Datenquelle' })
    .getByRole('button', { name: 'Terminplaner' }).click()
  await dialog.getByRole('group', { name: 'Feld' })
    .getByRole('button', { name: 'Tiername' }).click()
  await dialog.getByRole('button', { name: 'Fertig' }).click()

  // Speichern-Knopf daneben.
  await page.getByRole('button', { name: 'Schaltfläche', exact: true }).click()
  await expect(page.locator('ff-button')).toHaveCount(1)

  const html = await exportMaskHtml(page)
  const sourceId = /<ff-formfeld[^>]* source="([^"]+)"/.exec(html)?.[1] ?? ''
  expect(sourceId).not.toBe('')

  // Kette VOR dem Laden in den HTML-Text (connectClickAktionen verdrahtet
  // nur Knöpfe, die ihre Kette beim Anschließen schon tragen — wie im
  // echten Export). PINDEX hier fest; „vorheriger Schritt" deckt der
  // Laufzeit-Wächter (seAktionen.test).
  const kette = JSON.stringify({
    onClick: [{
      type: 'QUELLE_SPEICHERN', resultKey: '',
      dataSourceId: sourceId, relationId: 'rel-test',
      pindex: { source: 'fixed', value: '7' },
    }],
  })
  const htmlMitKette = html.replace('<ff-button', `<ff-button data-ff-aktionen='${kette}'`)

  const mask = await context.newPage()
  await mask.setContent(htmlMitKette)
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    // Schreib-Vorlage mit Platzhaltern — die Laufzeit liest FF_RELATIONS
    // erst beim Klick, deshalb darf sie hier nach dem Laden stehen.
    w.FF_RELATIONS = [{
      id: 'rel-test', verb: 'PUT_RELATION', nr: '0174',
      params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
    }]
    const gesendet: unknown[] = []
    w.__testPuts = gesendet
    w.basisHTML_SND_MSG = (verb: string, obj: unknown) => { gesendet.push([verb, obj]) }
    w.SEDATA = sedata
  }, SEDATA_STUB)

  // Hydrierung aus der ersten Zeile, dann ECHT tippen (fill() feuert kein
  // natives change) und committen.
  const input = mask.locator('ff-formfeld input.ctrl')
  await expect(input).toHaveValue('Minka')
  await input.click()
  await mask.keyboard.press('ControlOrMeta+a')
  await mask.keyboard.type('Rex')
  await input.blur()

  // Tippen allein hat NICHTS gesendet (kein Auto-PUT).
  await expect.poll(() =>
    mask.evaluate(() => (window as unknown as Record<string, unknown>).__testPuts),
  ).toEqual([])

  // Der Speichern-Schritt schreibt genau das geänderte Feld: pos/len aus
  // dem Feldcode 78_30, PINDEX fest, relId OHNE IDB-Präfix, Wert = getippt.
  await mask.locator('ff-button').click()
  await expect.poll(() =>
    mask.evaluate(() => (window as unknown as Record<string, unknown>).__testPuts),
  ).toEqual([
    ['PUT_RELATION', { NR: '0174', PARAMS: ['78', '30', 'L', '7', 'ID0001', 'Rex'] }],
  ])

  // Noch einmal klicken: dieselben Felder erneut (bewusst — die Spur lebt
  // bis zum nächsten Daten-Push), aber nichts Fremdes dazu.
  await mask.locator('ff-button').click()
  await expect.poll(() =>
    mask.evaluate(() => (window as unknown as Record<string, unknown>).__testPuts),
  ).toHaveLength(2)
})
