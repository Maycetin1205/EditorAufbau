// E2E-Wächter „Neuen Satz anlegen" (CREATE_RECORD, Nutzer-Go 2026-07-20) —
// bewusst EIN Kreislauf-Test (Test-Bremse). Nachgebaut ist das SE-Log
// „Termin anlegen" als EIN Schritt: der Knopf holt über die Hol-Vorlage
// (GET 640) einen frischen Index und schreibt danach ALLE lokal geänderten
// Felder der Quelle über die Schreib-Vorlage (PUT 174) auf genau diesen Index
// — ohne pro Feld eine Vorlage zusammenzuklicken. Nur hier real abbildbar:
// echtes Tippen + GET-Antwort über den SEDATA.Message-Rückfallweg im
// Runtime-Bündel der exportierten Maske.

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

test('Export: „Neuen Satz anlegen" holt EINEN Index und schreibt alle getippten Felder darauf', async ({ page, context }) => {
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

  // Der ganze Vorgang als EIN Schritt am Knopf: Datenquelle + Hol-Vorlage
  // (GET) + Schreib-Vorlage (PUT). Der Index reist NICHT durch die Kette —
  // applyCreateRecord hält ihn intern.
  const kette = JSON.stringify({
    onClick: [{
      type: 'CREATE_RECORD',
      resultKey: '',
      dataSourceId: sourceId,
      getRelationId: 'rel-get',
      relationId: 'rel-put',
    }],
  })
  const htmlMitKette = html.replace('<ff-button', `<ff-button data-ff-aktionen='${kette}'`)

  const mask = await context.newPage()
  await mask.setContent(htmlMitKette)
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    w.FF_RELATIONS = [
      { id: 'rel-get', verb: 'GET_RELATION', nr: '0640', params: ['ID0001'] },
      {
        id: 'rel-put', verb: 'PUT_RELATION', nr: '0174',
        params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
      },
    ]
    w.SEDATA = sedata
    const gesendet: unknown[] = []
    w.__testCalls = gesendet
    w.basisHTML_SND_MSG = (verb: string, obj: unknown) => {
      gesendet.push([verb, obj])
      if (verb === 'GET_RELATION') {
        // SoftEngine-Antwort über den SEDATA.Message-Rückfallweg: neuer Index.
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
    // getwert = relId der Quelle (ID0001, ohne IDB-Präfix), genau wie GET 640.
    ['GET_RELATION', { NR: '0640', PARAMS: ['ID0001'] }],
    // Der geholte Index 260 als PINDEX, das getippte Feld als Wert, relId
    // ohne IDB-Präfix, pos/len aus dem Feldcode 78_30.
    ['PUT_RELATION', { NR: '0174', PARAMS: ['78', '30', 'L', '260', 'ID0001', 'Rex'] }],
  ])
})
