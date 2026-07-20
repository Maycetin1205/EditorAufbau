// E2E-Wächter „Zwischenspeicher" (Nutzer-Befund + -Vorschlag 2026-07-17) —
// bewusst EIN Kreislauf-Test (Test-Bremse). Nachgebaut ist das SE-Log
// „Termin anlegen" im Kleinen: GET holt den neuen Index, danach nutzen ihn
// MEHRERE PUTs — als PINDEX über „Ergebnis von Schritt 1" (step_result,
// Export = Ketten-Position), als PINDEX über „Vorheriger Schritt" (der
// durch den PUT dazwischen NICHT mehr geleert wird — der Kern-Befund) und
// als WERT (das Verknüpfungs-Muster PUT[…!514!…!260]). Der Feldwert kommt
// über „Feld der Datenquelle" am Knopf (Erste-Zeile-Regel, vorher still '').
// Nur hier real abbildbar: echtes Tippen + GET-Antwort über den
// SEDATA.Message-Rückfallweg im Runtime-Bündel der exportierten Maske.

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
  await expect(page.getByText('formfeld ·')).toBeVisible()
}

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

test('Export: GET-Ergebnis speist mehrere PUTs — als PINDEX, als vorheriger Schritt und als WERT', async ({ page, context }) => {
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

  await page.getByRole('button', { name: 'Schaltfläche', exact: true }).click()
  await expect(page.locator('ff-button')).toHaveCount(1)

  const html = await exportMaskHtml(page)
  const sourceId = /<ff-formfeld[^>]* source="([^"]+)"/.exec(html)?.[1] ?? ''
  expect(sourceId).not.toBe('')

  // Kette in Export-Form (step_result trägt die KETTEN-POSITION — die
  // Editor-id→Position-Übersetzung deckt aktionen.test/export.test):
  //  1. GET 640            → Schritt 0, liefert den neuen Index
  //  2. PUT [step_result 0, Feldwert]          — Index als PINDEX
  //  3. PUT [previous_result, step_result 0]   — Speicher überlebt den PUT
  //     davor, und der Index reist als WERT (Verknüpfungs-Muster des Logs).
  const kette = JSON.stringify({
    onClick: [
      {
        type: 'RELATION', resultKey: '', relationId: 'rel-get',
        params: [{ source: 'fixed', value: 'ID0001' }], extraParams: [],
      },
      {
        type: 'RELATION', resultKey: '', relationId: 'rel-put',
        params: [
          { source: 'step_result', value: '0' },
          { source: 'data_field', value: '78_30', dataSourceId: sourceId },
        ],
        extraParams: [],
      },
      {
        type: 'RELATION', resultKey: '', relationId: 'rel-put',
        params: [
          { source: 'previous_result', value: '' },
          { source: 'step_result', value: '0' },
        ],
        extraParams: [],
      },
    ],
  })
  const htmlMitKette = html.replace('<ff-button', `<ff-button data-ff-aktionen='${kette}'`)

  const mask = await context.newPage()
  await mask.setContent(htmlMitKette)
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    w.FF_RELATIONS = [
      { id: 'rel-get', verb: 'GET_RELATION', nr: '0640', params: ['ID0001'] },
      { id: 'rel-put', verb: 'PUT_RELATION', nr: '0174', params: ['{PINDEX}', '{VALUE}'] },
    ]
    w.SEDATA = sedata
    const gesendet: unknown[] = []
    w.__testCalls = gesendet
    w.basisHTML_SND_MSG = (verb: string, obj: unknown) => {
      gesendet.push([verb, obj])
      if (verb === 'GET_RELATION') {
        // SoftEngine-Antwort über den SEDATA.Message-Rückfallweg (Muster
        // Referenzmaske): neuer Message-Schlüssel mit dem neuen Index.
        (w.SEDATA as Record<string, unknown>).Message77 = { RESULT: '260' }
      }
    }
  }, SEDATA_STUB)

  // Hydrierung, dann ECHT tippen (fill() feuert kein natives change).
  const input = mask.locator('ff-formfeld input.ctrl')
  await expect(input).toHaveValue('Minka')
  await input.click()
  await mask.keyboard.press('ControlOrMeta+a')
  await mask.keyboard.type('Rex')
  await input.blur()

  await mask.locator('ff-button').click()
  await expect.poll(() =>
    mask.evaluate(() => (window as unknown as Record<string, unknown>).__testCalls),
  ).toEqual([
    ['GET_RELATION', { NR: '0640', PARAMS: ['ID0001'] }],
    // Index 260 als PINDEX + getippter Feldwert (Erste-Zeile-Regel):
    ['PUT_RELATION', { NR: '0174', PARAMS: ['260', 'Rex'] }],
    // „Vorheriger Schritt" hat den PUT davor ÜBERLEBT + Index als WERT:
    ['PUT_RELATION', { NR: '0174', PARAMS: ['260', '260'] }],
  ])
})
