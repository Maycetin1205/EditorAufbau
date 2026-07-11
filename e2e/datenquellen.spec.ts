// E2E-Prüfung Kap. 5.4b (Datenquellen-Editor) im echten Browser.
// Der Bediener legt Datenquellen SELBST an (Klarname + Position/Länge —
// die Technikwerte entstehen unsichtbar), bearbeitet und löscht sie in der
// Bibliothek. Vorlagen persistieren im localStorage; der Export erzeugt
// SEFILELOOP + FF_DATA_SOURCES aus GENAU diesen Definitionen.

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

test('Anlegen: neue Quelle erscheint überall, persistiert und reist in den Export', async ({ page }) => {
  await freshEditor(page)

  // Formular öffnen und ausfüllen — nur Klarnamen + Zahlen, nie Technikwerte.
  await page.getByRole('button', { name: 'Neue Datenquelle' }).click()
  const dialog = page.getByRole('dialog', { name: 'Neue Datenquelle' })
  await dialog.getByLabel('Anzeigename').fill('Geräte')
  await dialog.getByLabel('Tabellennummer').fill('9')
  await dialog.getByLabel('Feld 1: Klarname').fill('Gerätename')
  await dialog.getByLabel('Feld 1: Position').fill('10')
  await dialog.getByLabel('Feld 1: Länge').fill('30')
  // Ein "Beispielwert"-Eingabefeld gibt es NICHT (Nutzer-Entscheidung
  // 2026-07-10: der Klarname ist die Vorschau).
  await expect(dialog.getByLabel('Feld 1: Beispielwert')).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Speichern' }).click()
  await expect(dialog).toHaveCount(0)

  // In der Bibliothek sichtbar …
  await expect(page.getByText('Geräte', { exact: true })).toBeVisible()
  // … und im Inspector als Datenquelle wählbar (Kanban einfügen + anhängen).
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Geräte' }).click()

  // Titel-Stelle binden: Karte erst selektieren, dann die Stelle anklicken —
  // der Feld-Picker zeigt NUR den Klarnamen, die gebundene Stelle danach
  // ebenfalls (der Klarname IST die Vorschau).
  await page.locator('ff-card .text').first().click()
  await page.locator('ff-card .heading').first().click()
  const picker = page.getByRole('dialog', { name: /Feld für/ })
  await picker.getByRole('button', { name: /Gerätename/ }).click()
  await expect(page.locator('ff-card .heading').first()).toHaveText('Gerätename')

  // Export: SEvariablen-Eintrag + eingebettete Definition aus DERSELBEN Quelle.
  const html = await exportMaskHtml(page)
  expect(html).toContain('"tableId":"IDBID0009"')
  expect(html).toContain('"indexField":"0_10"') // Vorbelegung der Satznummer
  expect(html).toContain('headingfield="10_30"')

  // Reload: Vorlage überlebt (localStorage neben den Bäumen).
  await page.reload()
  await expect(page.getByText('Geräte', { exact: true })).toBeVisible()
})

test('Validierung: leeres Formular speichert nicht und zeigt Fehler', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Neue Datenquelle' }).click()
  const dialog = page.getByRole('dialog', { name: 'Neue Datenquelle' })
  await dialog.getByRole('button', { name: 'Speichern' }).click()
  await expect(dialog.getByText('Anzeigename fehlt.')).toBeVisible()
  await expect(dialog.getByText('Klarname fehlt.')).toBeVisible()
  // Klarname darf kein Feldcode sein (Technikwert ≠ Anzeigename).
  await dialog.getByLabel('Feld 1: Klarname').fill('193_30')
  await dialog.getByRole('button', { name: 'Speichern' }).click()
  await expect(dialog.getByText('Klarname darf kein Feldcode sein.')).toBeVisible()
  await dialog.getByRole('button', { name: 'Abbrechen' }).click()
  await expect(page.getByText('193_30')).toHaveCount(0)
})

test('Bearbeiten: Umbenennen hält die id stabil — angehängte Blöcke behalten ihre Quelle', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()

  await page.getByRole('button', { name: 'Terminplaner bearbeiten' }).click()
  const dialog = page.getByRole('dialog', { name: 'Datenquelle bearbeiten' })
  await dialog.getByLabel('Anzeigename').fill('Praxisplaner')
  await dialog.getByRole('button', { name: 'Speichern' }).click()

  // Der Block hängt weiter an derselben Quelle (Select zeigt den neuen Namen).
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await expect(page.getByLabel('Datenquelle')).toContainText('Praxisplaner')
})

test('Löschen: Rückfrage warnt, wenn die Quelle benutzt wird; die Maske bleibt stehen', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Terminplaner löschen' }).click()
  expect(frage).toContain('BENUTZT')
  await expect(page.getByRole('button', { name: 'Terminplaner löschen' })).toHaveCount(0)
  // Board + Karten stehen noch; die Bindung ruht nur.
  await expect(page.locator('ff-kanban')).toHaveCount(1)

  // Unbenutzte Quelle: schlichte Rückfrage ohne Warnung.
  await page.getByRole('button', { name: 'Kundenhaustiere löschen' }).click()
  expect(frage).toContain('löschen?')
  expect(frage).not.toContain('BENUTZT')
})

// Stabilisierung S1a: zeigt der Block auf eine geloeschte Datenquelle, bricht
// die Export-Preflight ab (statt still eine tote Maske zu erzeugen, Nordstern).
test('S1a: geloeschte Datenquelle blockiert den Export mit verstaendlicher Meldung', async ({ page }) => {
  await freshEditor(page)

  // Kanban einfuegen + Terminplaner anhaengen.
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByLabel('Datenquelle').click()
  await page.getByRole('option', { name: 'Terminplaner' }).click()

  // Alle nativen Dialoge einsammeln (Loesch-Rueckfrage UND Export-Meldung).
  const dialogMessages: string[] = []
  page.on('dialog', (d) => {
    dialogMessages.push(d.message())
    void d.accept()
  })

  // Terminplaner aus der Bibliothek loeschen -> das Board zeigt jetzt auf eine
  // geloeschte Quelle (Bindung ruht, Block bleibt stehen — Kap. 5.4b).
  await page.getByRole('button', { name: 'Terminplaner löschen' }).click()
  await expect(page.getByRole('button', { name: 'Terminplaner löschen' })).toHaveCount(0)

  // Export: darf NICHT herunterladen, sondern die Preflight muss abbrechen.
  const downloads: Download[] = []
  page.on('download', (d) => downloads.push(d))
  await page.getByRole('button', { name: 'Als SoftEngine-Maske exportieren' }).click()

  await expect.poll(() => dialogMessages.some((m) => m.includes('Export abgebrochen'))).toBe(true)
  expect(dialogMessages.some((m) => m.includes('Datenquelle fehlt'))).toBe(true)
  expect(downloads).toHaveLength(0)
})
