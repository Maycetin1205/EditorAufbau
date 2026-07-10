// E2E-Prüfung Kap. 5.3 (Kanban-Datenverhalten im Export) im echten Browser.
// Nur hier real abbildbar: die exportierte Maske bootet ihr Runtime-Bündel,
// die ff-kanban-Elemente hydrieren aus einem gestellten SEDATA (dieselbe
// Datenform wie die Referenzmaske dashboard/praxis-kanban.html), Karten
// entstehen aus Zeilen, der Kartenzähler läuft über slotchange.
//
// Ablauf: Board im Editor aufbauen (Quelle anhängen, Titel-Stelle binden,
// Spalten-Feld + Datenwerte setzen), über den Toolbar-Knopf exportieren,
// die Maske mit gestelltem SEDATA laden und das Ergebnis prüfen.

import { readFile } from 'node:fs/promises'
import { test, expect, type Download, type Page } from '@playwright/test'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Kanban' }).waitFor()
}

async function insertBoard(page: Page) {
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(3)
}

// Board selektieren: direkter Klick am Board-Element (bubbelt zum BlockHost
// des Boards, nie durch eine Spalte) — die Spalten sind seit S3 fliessend,
// eine feste Klick-Position gibt es nicht mehr.
async function selectBoard(page: Page) {
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await expect(page.getByText('kanban ·')).toBeVisible() // Inspector-Kopf
}

async function attachTerminplaner(page: Page) {
  await selectBoard(page)
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()
}

// Toolbar-Export anstoßen und den Inhalt der maske.html einsammeln.
async function exportMaskHtml(page: Page): Promise<string> {
  const downloads: Download[] = []
  page.on('download', (d) => downloads.push(d))
  await page.getByRole('button', { name: 'Als SoftEngine-Maske exportieren' }).click()
  await expect.poll(() => downloads.length).toBe(2)
  const maske = downloads.find((d) => d.suggestedFilename() === 'maske.html')
  if (!maske) throw new Error('maske.html wurde nicht heruntergeladen')
  return await readFile(await maske.path(), 'utf8')
}

// SEDATA-Stub in der Form der Referenzmaske: Zeilen des Terminplaners mit
// Zimmer (253_30) + Tiername (78_30) als direkte Feld-Properties.
const SEDATA_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [
        { '253_30': '2', '78_30': 'Minka' },
        { '253_30': '3', '78_30': 'Buddy' },
        { '253_30': '2', '78_30': 'Nala' },
        { '253_30': 'OP', '78_30': 'Rocky' }, // trifft keine Spalte -> Auffang
      ],
    }],
  },
}

test('Export: Zeilen werden Karten, das Spalten-Feld verteilt sie, kein Treffer fällt in Spalte 1', async ({ page, context }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  // Titel-Stelle der ersten Karte an "Tiername" binden (Kap. 5.2).
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  const picker = page.getByRole('dialog', { name: /Feld für/ })
  await picker.getByRole('button', { name: /Tiername/ }).click()
  await expect(page.locator('ff-card .heading').first()).toHaveText('Tiername')

  // Spalten-Feld am Board wählen: Klarname "Zimmer", nie der Feldcode.
  await selectBoard(page)
  await page.getByLabel('Spalten aus Feld').click()
  await expect(page.getByRole('option', { name: '253_30' })).toHaveCount(0)
  await page.getByRole('option', { name: 'Zimmer' }).click()

  // Datenwerte der Spalten 2 + 3 setzen; Spalte 1 bleibt leer = Auffang.
  await page.locator('ff-kanban-spalte .head').nth(1).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('2')
  await page.locator('ff-kanban-spalte .head').nth(2).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('3')

  const html = await exportMaskHtml(page)
  // Beide Technikwerte reisen als Attribute in der Maske (Kap. 5.2 + 5.3).
  expect(html).toContain('statusfield="253_30"')
  expect(html).toContain('headingfield="78_30"')
  expect(html).toContain('statusvalue="2"')
  expect(html).toContain('statusvalue="3"')

  // Maske laden; SEDATA kommt NACH dem Boot (wie in SoftEngine — die Maske
  // wartet darauf, Poll wie die Referenzmaske).
  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate((sedata) => {
    (window as unknown as Record<string, unknown>).SEDATA = sedata
  }, SEDATA_STUB)

  // 4 Zeilen -> 4 Karten: Minka+Nala in "In Arbeit" (2), Buddy in "Fertig"
  // (3), Rocky (Zimmer "OP", kein Treffer) im Auffang "Offen". Die
  // Musterkarte (erste Karte des Boards) wird beim Hydrieren durch die
  // Daten-Karten ERSETZT — sie zaehlt nicht doppelt.
  await expect(mask.locator('ff-kanban-spalte ff-card')).toHaveCount(4)
  // P1.1: einen Vorlagen-Kasten gibt es nicht mehr — nirgends in der Maske.
  await expect(mask.locator('ff-kanban-vorlage')).toHaveCount(0)
  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(colCards(0)).toHaveText(['Rocky'])
  await expect(colCards(1)).toHaveText(['Minka', 'Nala'])
  await expect(colCards(2)).toHaveText(['Buddy'])
  // Kartenzähler laufen mit (slotchange, dieselbe Logik wie im Editor).
  await expect(mask.locator('ff-kanban-spalte .count')).toHaveText(['1', '2', '1'])
  // Ungebundene Stellen behalten den statischen Text der Vorlagen-Karte.
  await expect(mask.locator('ff-card .text').first()).toHaveText('Befund Minka besprechen')

  // Der EDITOR hydriert nie: dort steht weiterhin nur die Musterkarte.
  await expect(page.locator('ff-card')).toHaveCount(1)
})

// Schreibweg 5.3b: Zeilen tragen die Satznummer (indexField '0_10' des
// Terminplaners) — nur damit sind Karten ziehbar.
const SEDATA_DRAG_STUB = {
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

test('Export: Karte ziehen schreibt den Spaltenwert per PUT-Vorlage zurück (5.3b)', async ({ page, context }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  // Titel an "Tiername" binden, damit die Daten-Karten unterscheidbar sind.
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  await page.getByRole('dialog', { name: /Feld für/ }).getByRole('button', { name: /Tiername/ }).click()

  // Spalten-Feld "Zimmer"; Spalte 2 -> '2', Spalte 3 -> '3', Spalte 1 = Auffang.
  await selectBoard(page)
  await page.getByLabel('Spalten aus Feld').click()
  await page.getByRole('option', { name: 'Zimmer' }).click()
  await page.locator('ff-kanban-spalte .head').nth(1).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('2')
  await page.locator('ff-kanban-spalte .head').nth(2).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('3')

  const html = await exportMaskHtml(page)
  const mask = await context.newPage()
  await mask.setContent(html)
  // SE-Bridge stubben (sammelt Aufrufe), dann SEDATA stellen.
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    w.PUT_CALLS = []
    w.basisHTML_SND_MSG = (verb: unknown, msg: unknown) => {
      (w.PUT_CALLS as unknown[]).push([verb, msg])
    }
    w.SEDATA = sedata
  }, SEDATA_DRAG_STUB)

  // Hydriert: Bello+Luna in "In Arbeit" (2), Rex in "Fertig" (3).
  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(colCards(1)).toHaveText(['Bello', 'Luna'])

  // Bello nach "Fertig" ziehen: exakt EIN PUT über die Standard-Vorlage —
  // PARAMS [pos, len, 'L', pindex, relId OHNE IDB-Präfix, Zielwert].
  await mask.locator('ff-card', { hasText: 'Bello' }).dragTo(mask.locator('ff-kanban-spalte').nth(2))
  await expect(colCards(1)).toHaveText(['Luna'])
  await expect(colCards(2)).toHaveText(['Bello', 'Rex']) // Zeilen-Reihenfolge
  expect(await mask.evaluate(() => (window as unknown as Record<string, unknown>).PUT_CALLS)).toEqual([
    ['PUT_RELATION', { NR: '174', PARAMS: ['253', '30', 'L', '7', 'ID0001', '3'] }],
  ])

  // Kein Schreibziel = kein PUT: Drop auf die eigene Spalte (gleicher Wert)
  // und auf die Auffang-Spalte (leerer Datenwert) veraendern nichts.
  await mask.locator('ff-card', { hasText: 'Luna' }).dragTo(mask.locator('ff-kanban-spalte').nth(1))
  await mask.locator('ff-card', { hasText: 'Luna' }).dragTo(mask.locator('ff-kanban-spalte').nth(0))
  await expect(colCards(1)).toHaveText(['Luna'])
  await expect(colCards(0)).toHaveText([])
  expect(await mask.evaluate(() => ((window as unknown as Record<string, unknown>).PUT_CALLS as unknown[]).length)).toBe(1)
})

test('Export ohne Spalten-Feld hydriert nicht — und zeigt NIE Demo-Karten', async ({ page, context }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  const html = await exportMaskHtml(page)
  expect(html).toContain('statusfield=""')

  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate((sedata) => {
    (window as unknown as Record<string, unknown>).SEDATA = sedata
  }, SEDATA_STUB)

  // Keine Hydrierung — und seit 2026-07-10 gibt es NIE sichtbare
  // Demo-Karten in der Maske: die Musterkarte reist nur als inertes
  // <template data-ff-template>, die Spalten bleiben leer, bis echte
  // Daten kommen (der Poll hätte 300ms-Takte — kurz warten, dann prüfen).
  await mask.waitForTimeout(1000)
  await expect(mask.locator('ff-card')).toHaveCount(0)
  await expect(mask.locator('template[data-ff-template]')).toHaveCount(1)
  await expect(mask.locator('ff-kanban-vorlage')).toHaveCount(0)
})
