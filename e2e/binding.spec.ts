// E2E-Prüfung Kap. 5.2 (Klick-auf-Stelle-Binding + Beispieldaten-Vorschau)
// im echten Browser. Nur hier real abbildbar: die Stellen liegen im Shadow
// DOM der Karte (composedPath-Treffer im BlockHost), der Feld-Picker ist
// eine Editor-Hilfe im Light-DOM, und die Daten-Markierung hängt am
// data-ff-editor/data-ff-bound-Zusammenspiel.
//
// Bedienlogik 3: Stelle anklicken → Feldliste mit KLARNAMEN (nie Feldcodes)
// → Stelle zeigt sofort Beispielwert + Markierung. Lösen stellt den
// statischen Text wieder her. Alles überlebt den Reload.

import { test, expect, type Page } from '@playwright/test'

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

// Datenquelle über die Inspector-Sektion "Daten" anhängen (Kap. 5.1).
async function attachTerminplaner(page: Page) {
  await selectBoard(page)
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()
}

// Erste Karte: Klick auf die Textzeile selektiert die Karte (anderer Punkt
// als die Titel-Stelle, damit der Folgeklick nicht als Doppelklick zählt).
async function selectFirstCard(page: Page) {
  await page.locator('ff-card .text').first().click()
}

const heading = (page: Page) => page.locator('ff-card .heading').first()
const picker = (page: Page) => page.getByRole('dialog', { name: /Feld für/ })

test('ohne Datenquelle öffnet Klick auf eine Stelle keinen Feld-Picker', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)
  await selectFirstCard(page)
  await heading(page).click()
  await page.waitForTimeout(600) // länger als die Picker-Verzögerung
  await expect(picker(page)).toHaveCount(0)
})

test('Stelle anklicken → Klarnamen wählen → Beispielwert + Markierung, Reload überlebt, Lösen stellt Text wieder her', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)

  // Karte selektieren, dann die Titel-Stelle anklicken → Feld-Picker.
  await selectFirstCard(page)
  await expect(heading(page)).toHaveText('Rückruf Fr. Wagner')
  await heading(page).click()
  await expect(picker(page)).toBeVisible()

  // Feldliste zeigt Klarnamen + Beispielwerte, NIE Feldcodes (Technikwert
  // ≠ Anzeigename).
  await expect(picker(page)).toContainText('Vorname')
  await expect(picker(page)).toContainText('Lisa')
  await expect(picker(page)).not.toContainText('193_30')
  await expect(picker(page)).not.toContainText('78_30')

  // Feld wählen → Stelle zeigt sofort Beispielwert + Daten-Markierung.
  await picker(page).getByRole('button', { name: /Tiername/ }).click()
  await expect(picker(page)).toHaveCount(0)
  await expect(heading(page)).toHaveText('Minka')
  await expect(heading(page)).toHaveAttribute('data-ff-bound', '')

  // Reload: Bindung + Vorschau bleiben (localStorage-Debounce abwarten).
  await page.waitForTimeout(700)
  await page.reload()
  await expect(heading(page)).toHaveText('Minka')

  // Gebundene Stelle wieder anklicken: aktuelles Feld ist markiert; Lösen
  // stellt den statischen Text wieder her.
  await selectFirstCard(page)
  await heading(page).click()
  await expect(picker(page)).toBeVisible()
  await expect(picker(page).getByRole('button', { name: /✓ Tiername/ })).toBeVisible()
  await picker(page).getByRole('button', { name: '— nicht gebunden —' }).click()
  await expect(heading(page)).toHaveText('Rückruf Fr. Wagner')
  await expect(heading(page)).not.toHaveAttribute('data-ff-bound', '')
})

test('Quelle lösen nimmt Vorschau + Markierung zurück, Wieder-Anhängen bringt sie zurück', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)
  await selectFirstCard(page)
  await heading(page).click()
  await picker(page).getByRole('button', { name: /Tiername/ }).click()
  await expect(heading(page)).toHaveText('Minka')

  // Quelle vom Board lösen → statischer Text, keine Markierung; die
  // gespeicherte Bindung bleibt und lebt mit der Quelle wieder auf.
  await selectBoard(page)
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: '— keine —' }).click()
  await expect(heading(page)).toHaveText('Rückruf Fr. Wagner')
  await expect(heading(page)).not.toHaveAttribute('data-ff-bound', '')

  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()
  await expect(heading(page)).toHaveText('Minka')
  await expect(heading(page)).toHaveAttribute('data-ff-bound', '')
})

test('Doppelklick: ungebundene Stelle bleibt Inline-Edit, gebundene öffnet den Feld-Picker', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)
  await attachTerminplaner(page)
  await selectFirstCard(page)

  // Ungebunden: Doppelklick startet Inline-Edit (contenteditable), KEIN Picker.
  await heading(page).dblclick()
  await expect(heading(page)).toHaveAttribute('contenteditable', 'plaintext-only')
  await page.keyboard.press('Escape')
  await expect(picker(page)).toHaveCount(0)

  // Binden, dann Doppelklick: kein contenteditable, stattdessen der Picker.
  await heading(page).click()
  await picker(page).getByRole('button', { name: /Tiername/ }).click()
  await expect(heading(page)).toHaveText('Minka')
  await heading(page).dblclick()
  await expect(picker(page)).toBeVisible()
  await expect(heading(page)).not.toHaveAttribute('contenteditable', 'plaintext-only')
})
