// E2E Aktionsketten (Z2): Ketten werden in der Kommandozentrale am
// Baustein-Ereignis angelegt (anlegen/umsortieren/duplizieren/löschen/
// bearbeiten, Undo gilt), reisen als data-ff-aktionen in den Export und
// werden in der EXPORTIERTEN Maske ausgeführt — „Werkzeug starten" exakt
// in der Referenz-Form sendBWLinkIntern('0,START_TOOL,<nr>[,params]').
// LEITPLANKE: Tests niemals löschen/abschwächen.

import { readFile } from 'node:fs/promises'
import { test, expect, type Download, type Page } from '@playwright/test'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Kanban' }).waitFor()
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

// Schritt über das Formular anlegen (aus der Ereignis-Zeile heraus).
async function addStep(page: Page, eventLi: ReturnType<Page['locator']>, nr: string, params: string[] = []) {
  await eventLi.getByRole('button', { name: 'Schritt', exact: true }).click()
  const form = page.getByRole('dialog', { name: 'Neuer Schritt' })
  await form.getByLabel('Werkzeug-Nummer').fill(nr)
  for (let i = 0; i < params.length; i++) {
    await form.getByRole('button', { name: 'Parameter' }).click()
    await form.getByLabel(`Parameter ${i + 1}`, { exact: true }).fill(params[i])
  }
  await form.getByRole('button', { name: 'Speichern' }).click()
  await expect(page.getByRole('dialog', { name: 'Neuer Schritt' })).toHaveCount(0)
}

test('Schaltfläche: Kette anlegen/umsortieren/duplizieren/löschen/bearbeiten + Undo; der Klick in der Maske startet die Werkzeuge in Reihenfolge', async ({ page, context }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Schaltfläche', exact: true }).click()

  await page.getByRole('button', { name: 'Steuerung' }).click()
  const dialog = page.getByRole('dialog', { name: 'Steuerung' })
  const eventLi = dialog.locator('li').filter({ hasText: 'Klick' })
  const stepRows = eventLi.locator('ol > li')

  // Validierung: leere Werkzeug-Nummer speichert nicht (Klartext-Fehler).
  await eventLi.getByRole('button', { name: 'Schritt', exact: true }).click()
  const form = page.getByRole('dialog', { name: 'Neuer Schritt' })
  await form.getByRole('button', { name: 'Speichern' }).click()
  await expect(form.getByText('Werkzeug-Nummer als Zahl angeben')).toBeVisible()
  await form.getByLabel('Werkzeug-Nummer').fill('1951')
  await form.getByRole('button', { name: 'Speichern' }).click()

  // Zweiter Schritt, dann die Ketten-Werkzeuge der Zentrale durchspielen.
  await addStep(page, eventLi, '2000')
  await expect(stepRows).toHaveCount(2)
  await expect(stepRows.nth(0)).toContainText('Werkzeug starten (START_TOOL) — Nr. 1951')
  await expect(stepRows.nth(1)).toContainText('Werkzeug starten (START_TOOL) — Nr. 2000')

  await eventLi.getByRole('button', { name: 'Schritt 2 nach oben' }).click()
  await expect(stepRows.nth(0)).toContainText('Nr. 2000')

  await eventLi.getByRole('button', { name: 'Schritt 1 duplizieren' }).click()
  await expect(stepRows).toHaveCount(3)
  await expect(stepRows.nth(1)).toContainText('Nr. 2000')

  await eventLi.getByRole('button', { name: 'Schritt 2 löschen' }).click()
  await expect(stepRows).toHaveCount(2)

  await eventLi.getByRole('button', { name: 'Schritt 2 bearbeiten' }).click()
  const editForm = page.getByRole('dialog', { name: 'Schritt bearbeiten' })
  await editForm.getByLabel('Werkzeug-Nummer').fill('1955')
  await editForm.getByRole('button', { name: 'Speichern' }).click()
  await expect(stepRows.nth(1)).toContainText('Nr. 1955')

  // Undo gilt auch für Aktionen (die Ketten leben im Baum): das Bearbeiten
  // zurücknehmen -> wieder Nr. 1951.
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /Rückgängig/ }).click()
  await page.getByRole('button', { name: 'Steuerung' }).click()
  await expect(stepRows.nth(1)).toContainText('Nr. 1951')
  await page.keyboard.press('Escape')

  // Export: die Kette reist als data-ff-aktionen-Attribut mit.
  const html = await exportMaskHtml(page)
  expect(html).toContain(' data-ff-aktionen="')
  expect(html).toContain('&quot;toolNr&quot;:&quot;2000&quot;')

  // In der Maske: Klick auf die Schaltfläche startet BEIDE Werkzeuge in
  // Ketten-Reihenfolge — Referenz-Form '0,START_TOOL,<nr>'.
  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate(() => {
    const w = window as unknown as Record<string, unknown>
    w.TOOL_CALLS = []
    w.sendBWLinkIntern = (link: unknown) => {
      (w.TOOL_CALLS as unknown[]).push(link)
    }
  })
  await mask.locator('ff-button').click()
  expect(await mask.evaluate(() => (window as unknown as Record<string, unknown>).TOOL_CALLS)).toEqual([
    '0,START_TOOL,2000',
    '0,START_TOOL,1951',
  ])
})

// Zeilen mit Satznummer (indexField '0_10') — nur solche Karten sind
// klickbar/ziehbar (dieselbe Regel wie der Schreibweg 5.3b).
const SEDATA_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [
        { '0_10': '7', '253_30': '2', '78_30': 'Bello' },
        { '0_10': '8', '253_30': '3', '78_30': 'Rex' },
        { '0_10': '9', '253_30': '2', '78_30': 'Luna' },
      ],
    }],
  },
}

test('Kanban: „Karte angeklickt" liefert {PINDEX}, „Karte verschoben" feuert nach dem Zurückschreiben mit {VALUE}', async ({ page, context }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(3)

  // Bindung wie kanban-data.spec, seit B3 über die geführte Strecke am
  // Board: Quelle, Titel-Stelle, Spalten-Feld, Spaltenwerte 2/3.
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByRole('button', { name: 'Daten anschließen' }).click()
  const strecke = page.getByRole('dialog', { name: 'Daten anschließen' })
  await strecke.getByRole('group', { name: 'Datenquelle' })
    .getByRole('button', { name: 'Terminplaner' }).click()
  await strecke.getByRole('button', { name: 'Schließen' }).click()
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  await page.getByRole('dialog', { name: /Feld für/ }).getByRole('button', { name: /Tiername/ }).click()
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByRole('button', { name: 'Daten anschließen' }).click()
  await strecke.getByRole('group', { name: 'Einsortieren nach' })
    .getByRole('button', { name: 'Zimmer', exact: true }).click()
  for (const [spalte, wert] of [['In Arbeit', '2'], ['Fertig', '3']] as const) {
    const gruppe = strecke.getByRole('group', { name: spalte, exact: true })
    await gruppe.getByRole('button', { name: 'Anderen Wert eintragen' }).click()
    await gruppe.getByLabel('Eigener Wert').fill(wert)
    await gruppe.getByRole('button', { name: 'Übernehmen' }).click()
  }
  await strecke.getByRole('button', { name: 'Schließen' }).click()

  // Ketten an beiden Kanban-Ereignissen anlegen.
  await page.getByRole('button', { name: 'Steuerung' }).click()
  const dialog = page.getByRole('dialog', { name: 'Steuerung' })
  await addStep(page, dialog.locator('li').filter({ hasText: 'Karte angeklickt' }), '3003', ['{PINDEX}'])
  await addStep(page, dialog.locator('li').filter({ hasText: 'Karte verschoben' }), '4000', ['{VALUE}'])
  await page.keyboard.press('Escape')

  const html = await exportMaskHtml(page)
  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    w.TOOL_CALLS = []
    w.sendBWLinkIntern = (link: unknown) => {
      (w.TOOL_CALLS as unknown[]).push(link)
    }
    w.PUT_CALLS = []
    w.basisHTML_SND_MSG = (verb: unknown, msg: unknown) => {
      (w.PUT_CALLS as unknown[]).push([verb, msg])
    }
    w.SEDATA = sedata
  }, SEDATA_STUB)
  const toolCalls = () => mask.evaluate(() => (window as unknown as Record<string, unknown>).TOOL_CALLS)

  // Hydriert: Bello+Luna in "In Arbeit" (2), Rex in "Fertig" (3).
  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(colCards(1)).toHaveText(['Bello', 'Luna'])

  // Karte angeklickt: {PINDEX} = Satznummer der Karte (Bello = 7).
  await mask.locator('ff-card', { hasText: 'Bello' }).click()
  expect(await toolCalls()).toEqual(['0,START_TOOL,3003,7'])

  // Karte verschoben: erst schreibt der PUT (Standard-Vorlage), DANN feuert
  // die Kette mit {VALUE} = neuem Spaltenwert (3).
  await mask.locator('ff-card', { hasText: 'Bello' }).dragTo(mask.locator('ff-kanban-spalte').nth(2))
  await expect(colCards(2)).toHaveText(['Bello', 'Rex'])
  expect(await mask.evaluate(() => (window as unknown as Record<string, unknown>).PUT_CALLS)).toEqual([
    ['PUT_RELATION', { NR: '174', PARAMS: ['253', '30', 'L', '7', 'ID0001', '3'] }],
  ])
  expect(await toolCalls()).toEqual(['0,START_TOOL,3003,7', '0,START_TOOL,4000,3'])

  // Kein Schreiben = keine Kette: Drop auf die eigene Spalte ändert nichts.
  await mask.locator('ff-card', { hasText: 'Luna' }).dragTo(mask.locator('ff-kanban-spalte').nth(1))
  expect(await toolCalls()).toEqual(['0,START_TOOL,3003,7', '0,START_TOOL,4000,3'])
})
