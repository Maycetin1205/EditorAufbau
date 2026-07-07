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

// Board selektieren: Klick in die Lücke zwischen Spalte 1 und 2 (Spalten
// sind 290px breit, Lücke 16px) trifft die Board-Fläche, nicht eine Spalte.
async function selectBoard(page: Page) {
  await page.locator('ff-kanban').click({ position: { x: 298, y: 8 } })
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
// Zimmer (259_8) + Tiername (78_30) als direkte Feld-Properties.
const SEDATA_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [
        { '259_8': '2', '78_30': 'Minka' },
        { '259_8': '3', '78_30': 'Buddy' },
        { '259_8': '2', '78_30': 'Nala' },
        { '259_8': 'OP', '78_30': 'Rocky' }, // trifft keine Spalte -> Auffang
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
  await expect(page.locator('ff-card .heading').first()).toHaveText('Minka')

  // Spalten-Feld am Board wählen: Klarname "Zimmer", nie der Feldcode.
  await selectBoard(page)
  await page.getByLabel('Spalten aus Feld').click()
  await expect(page.getByRole('option', { name: '259_8' })).toHaveCount(0)
  await page.getByRole('option', { name: 'Zimmer' }).click()

  // Datenwerte der Spalten 2 + 3 setzen; Spalte 1 bleibt leer = Auffang.
  await page.locator('ff-kanban-spalte .head').nth(1).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('2')
  await page.locator('ff-kanban-spalte .head').nth(2).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('3')

  const html = await exportMaskHtml(page)
  // Beide Technikwerte reisen als Attribute in der Maske (Kap. 5.2 + 5.3).
  expect(html).toContain('statusfield="259_8"')
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
  // (3), Rocky (Zimmer "OP", kein Treffer) im Auffang "Offen".
  await expect(mask.locator('ff-card')).toHaveCount(4)
  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(colCards(0)).toHaveText(['Rocky'])
  await expect(colCards(1)).toHaveText(['Minka', 'Nala'])
  await expect(colCards(2)).toHaveText(['Buddy'])
  // Kartenzähler laufen mit (slotchange, dieselbe Logik wie im Editor).
  await expect(mask.locator('ff-kanban-spalte .count')).toHaveText(['1', '2', '1'])
  // Ungebundene Stellen behalten den statischen Text der Vorlagen-Karte.
  await expect(mask.locator('ff-card .text').first()).toHaveText('Befund Minka besprechen')

  // Der EDITOR hydriert nie: dort stehen weiterhin die 6 gestalteten Karten.
  await expect(page.locator('ff-card')).toHaveCount(6)
})

test('Export ohne Spalten-Feld bleibt statisch — auch wenn SEDATA da ist', async ({ page, context }) => {
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

  // Keine Hydrierung: die 6 gestalteten Beispiel-Karten bleiben stehen
  // (der Poll hätte 300ms-Takte — kurz warten, dann prüfen).
  await mask.waitForTimeout(1000)
  await expect(mask.locator('ff-card')).toHaveCount(6)
  await expect(mask.locator('ff-card .heading').first()).toHaveText('Rückruf Fr. Wagner')
})
