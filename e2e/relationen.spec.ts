// E2E-Prüfung Kap. 5.5 (Relation-Vorlagen-Bibliothek) im echten Browser.
// Der Bediener legt Relation-Vorlagen SELBST an (Anzeigename, Verb, NR,
// Parameter-Syntax mit Platzhaltern), bearbeitet und löscht sie. Vorlagen
// persistieren; der Kanban-Schreibweg (5.3b) KONSUMIERT die am Board gewählte
// Vorlage über FF_RELATIONS, statt ein Protokoll fest zu verdrahten.

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

// Z1: die Bibliotheken wohnen in der Kommandozentrale (Toolbar „Steuerung").
async function openSteuerung(page: Page) {
  await page.getByRole('button', { name: 'Steuerung' }).click()
  await page.getByRole('dialog', { name: 'Steuerung' }).getByRole('button', { name: 'Relationen' }).click()
}

async function closeSteuerung(page: Page) {
  await page.getByRole('dialog', { name: 'Steuerung' }).getByRole('button', { name: 'Schließen' }).click()
}

// Board mit Terminplaner, Titel an Tiername gebunden, Spalten-Feld Zimmer,
// Datenwerte 2/3 auf den Spalten 2/3 — die gemeinsame Basis der Schreibweg-
// Prüfungen (wie in kanban-data.spec.ts).
async function boardMitDaten(page: Page) {
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(3)
  const selectBoard = async () => {
    // Direkter Klick am Board-Element (bubbelt zum BlockHost des Boards,
    // nie durch eine Spalte) — Spalten sind seit S3 fliessend, das Board
    // scrollt nicht mehr; eine feste Klick-Position gibt es nicht.
    await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    await expect(page.getByText('kanban ·')).toBeVisible()
  }
  await selectBoard()
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  await page.getByRole('dialog', { name: /Feld für/ }).getByRole('button', { name: /Tiername/ }).click()
  await selectBoard()
  await page.getByLabel('Spalten aus Feld').click()
  await page.getByRole('option', { name: 'Zimmer' }).click()
  await page.locator('ff-kanban-spalte .head').nth(1).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('2')
  await page.locator('ff-kanban-spalte .head').nth(2).click()
  await page.getByLabel('Datenwert dieser Spalte').fill('3')
  return selectBoard
}

const SEDATA_DRAG_STUB = {
  Daten: {
    SEFileLoop: [{
      ALIAS: 'Terminplaner',
      Zeilen: [{ '0_10': '7', '253_30': '2', '78_30': 'Bello' }],
    }],
  },
}

test('Anlegen: eigene Vorlage erscheint überall, der Schreibweg konsumiert ihre NR', async ({ page, context }) => {
  await freshEditor(page)
  await openSteuerung(page)

  // Vorlage anlegen — nur Anzeigename + Verb + NR + Parameter, keine Codezeile.
  await page.getByRole('button', { name: 'Neue Relation' }).click()
  const dialog = page.getByRole('dialog', { name: 'Neue Relation' })
  await dialog.getByLabel('Anzeigename').fill('Zimmer wechseln')
  await dialog.getByLabel('NR').fill('999')
  // Parameter der Standard-Form (Position/Länge/L/Satznummer/Tabelle/Wert).
  const params = ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}']
  for (let i = 1; i < params.length; i++) {
    await dialog.getByRole('button', { name: 'Parameter', exact: true }).click()
  }
  for (let i = 0; i < params.length; i++) {
    await dialog.getByLabel(`Parameter ${i + 1}`, { exact: true }).fill(params[i])
  }
  await dialog.getByRole('button', { name: 'Speichern' }).click()
  await expect(dialog).toHaveCount(0)

  // In der Bibliothek sichtbar (Anzeigename, nie Rohwerte).
  await expect(page.getByText('Zimmer wechseln', { exact: true })).toBeVisible()
  await closeSteuerung(page)

  // Board aufbauen und die eigene Vorlage im Inspector wählen.
  const selectBoard = await boardMitDaten(page)
  await selectBoard()
  await page.getByLabel('Schreiben über').click()
  await page.getByRole('option', { name: 'Zimmer wechseln' }).click()

  // Export: die eigene Vorlage reist als Technikwert-Datensatz mit.
  const html = await exportMaskHtml(page)
  expect(html).toContain('"nr":"999"')
  expect(html).not.toContain('Zimmer wechseln') // Anzeigename reist NICHT mit

  // Maske laden, Bridge stubben, Karte ziehen -> PUT über die EIGENE NR 999.
  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    w.PUT_CALLS = []
    w.basisHTML_SND_MSG = (verb: unknown, msg: unknown) => {
      (w.PUT_CALLS as unknown[]).push([verb, msg])
    }
    w.SEDATA = sedata
  }, SEDATA_DRAG_STUB)

  await expect(mask.locator('ff-kanban-spalte').nth(1).locator('ff-card .heading')).toHaveText(['Bello'])
  await mask.locator('ff-card', { hasText: 'Bello' }).dragTo(mask.locator('ff-kanban-spalte').nth(2))
  expect(await mask.evaluate(() => (window as unknown as Record<string, unknown>).PUT_CALLS)).toEqual([
    ['PUT_RELATION', { NR: '999', PARAMS: ['253', '30', 'L', '7', 'ID0001', '3'] }],
  ])

  // Reload: Vorlage überlebt (localStorage neben den Bäumen). Der Name steht
  // dann in der Bibliothek UND im Inspector-Select des Boards — die Bibliothek
  // ist der Nachweis der Persistenz (erste Fundstelle, Sidebar vor Inspector).
  await page.reload()
  await openSteuerung(page)
  await expect(page.getByText('Zimmer wechseln', { exact: true }).first()).toBeVisible()
})

test('Ohne Vorlage („— keine —"): Board ist read-only — Karte ziehen bewegt nichts', async ({ page, context }) => {
  await freshEditor(page)
  const selectBoard = await boardMitDaten(page)
  await selectBoard()
  // Schreibweg abschalten.
  await page.getByLabel('Schreiben über').click()
  await page.getByRole('option', { name: '— keine —' }).click()

  const html = await exportMaskHtml(page)
  expect(html).toContain('putrelation=""')
  expect(html).toContain('var FF_RELATIONS = [];')

  const mask = await context.newPage()
  await mask.setContent(html)
  await mask.evaluate((sedata) => {
    const w = window as unknown as Record<string, unknown>
    w.PUT_CALLS = []
    w.basisHTML_SND_MSG = (verb: unknown, msg: unknown) => {
      (w.PUT_CALLS as unknown[]).push([verb, msg])
    }
    w.SEDATA = sedata
  }, SEDATA_DRAG_STUB)

  const colCards = (i: number) => mask.locator('ff-kanban-spalte').nth(i).locator('ff-card .heading')
  await expect(colCards(1)).toHaveText(['Bello'])
  // Ziehen: kein PUT UND kein lokaler Zug (die Karte bliebe sonst bis zum
  // nächsten ReloadData falsch stehen — Täuschung).
  await mask.locator('ff-card', { hasText: 'Bello' }).dragTo(mask.locator('ff-kanban-spalte').nth(2))
  await expect(colCards(1)).toHaveText(['Bello'])
  expect(await mask.evaluate(() => ((window as unknown as Record<string, unknown>).PUT_CALLS as unknown[]).length)).toBe(0)
})

test('Validierung: Pflichtfelder und unbekannte Platzhalter blocken das Speichern', async ({ page }) => {
  await freshEditor(page)
  await openSteuerung(page)
  await page.getByRole('button', { name: 'Neue Relation' }).click()
  const dialog = page.getByRole('dialog', { name: 'Neue Relation' })
  await dialog.getByRole('button', { name: 'Speichern' }).click()
  await expect(dialog.getByText('Anzeigename fehlt.')).toBeVisible()
  await expect(dialog.getByText('NR als Zahl angeben (z. B. 174).')).toBeVisible()

  // Tippfehler-Platzhalter wird erkannt, statt still zu '' aufgelöst.
  await dialog.getByLabel('Anzeigename').fill('Kaputt')
  await dialog.getByLabel('NR').fill('12')
  await dialog.getByLabel('Parameter 1', { exact: true }).fill('{PINDX}')
  await dialog.getByRole('button', { name: 'Speichern' }).click()
  await expect(dialog.getByText('Unbekannter Platzhalter: {PINDX}')).toBeVisible()

  await dialog.getByRole('button', { name: 'Abbrechen' }).click()
  await expect(page.getByText('Kaputt', { exact: true })).toHaveCount(0)
})

test('Bearbeiten: Umbenennen hält die id stabil — das Board behält seine Vorlage', async ({ page }) => {
  await freshEditor(page)
  // Board an eine Quelle hängen, damit "Schreiben über" sichtbar ist.
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()
  // Default ist die mitgelieferte Standard-Vorlage.
  await expect(page.getByLabel('Schreiben über')).toContainText('Standard-Schreiben')

  await openSteuerung(page)
  await page.getByRole('button', { name: 'Standard-Schreiben (PUT) bearbeiten' }).click()
  const dialog = page.getByRole('dialog', { name: 'Relation bearbeiten' })
  await dialog.getByLabel('Anzeigename').fill('Haus-PUT')
  await dialog.getByRole('button', { name: 'Speichern' }).click()
  await closeSteuerung(page)

  // Der Block hängt weiter an derselben Vorlage (Select zeigt den neuen Namen).
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await expect(page.getByLabel('Schreiben über')).toContainText('Haus-PUT')
})

test('Löschen: Rückfrage warnt, wenn die Vorlage benutzt wird', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()

  let frage = ''
  page.on('dialog', (d) => {
    frage = d.message()
    void d.accept()
  })
  await openSteuerung(page)
  await page.getByRole('button', { name: 'Standard-Schreiben (PUT) löschen' }).click()
  expect(frage).toContain('BENUTZT')
  await expect(page.getByRole('button', { name: 'Standard-Schreiben (PUT) löschen' })).toHaveCount(0)
  // Board steht noch; der Schreibweg ruht nur.
  await expect(page.locator('ff-kanban')).toHaveCount(1)
})
