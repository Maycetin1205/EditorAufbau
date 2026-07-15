// Regression: Ein Formularfeld vom Typ "Auswahl" zeigt zunächst seinen
// Feldtext als nicht auswählbaren Platzhalter. Erst der Klick öffnet die
// hinterlegten Werte; nach der Wahl steht der Wert im Feld. Freie Eingabe
// gibt es nicht. Geprüft wird der echte Toolbar-Export im Browser, damit
// Editor-State, Serializer und eingebettetes Runtime-Bündel gemeinsam laufen.

import { readFile } from 'node:fs/promises'
import { expect, test, type Download, type Page } from '@playwright/test'

async function freshEditor(page: Page): Promise<void> {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Formularfeld', exact: true }).waitFor()
}

async function exportMaskHtml(page: Page): Promise<string> {
  const downloads: Download[] = []
  page.on('download', (download) => downloads.push(download))
  await page.getByRole('button', { name: 'Als SoftEngine-Maske exportieren' }).click()
  await expect.poll(() => downloads.length).toBe(2)
  const maske = downloads.find((download) => download.suggestedFilename() === 'index.basis.source.html')
  if (!maske) throw new Error('index.basis.source.html wurde nicht heruntergeladen')
  return readFile(await maske.path(), 'utf8')
}

test('Auswahlfeld: Feldtext zuerst, Optionen erst beim Öffnen', async ({ page, context }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Formularfeld', exact: true }).click()

  await expect(page.getByLabel('Auswahl-Optionen')).toHaveCount(0)
  await page.getByLabel('Feldtyp').click()
  await page.getByRole('option', { name: 'Auswahl', exact: true }).click()
  await expect(page.getByLabel('Auswahl-Optionen')).toBeVisible()
  await page.getByLabel('Auswahl-Optionen').fill('Kontrolle, Übung, Automatisch')

  const editorFeld = page.locator('ff-formfeld')
  await editorFeld.locator('.ph').dblclick()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Behandlungsart auswählen')
  await page.keyboard.press('Enter')
  await expect(editorFeld.locator('.ph')).toHaveText('Behandlungsart auswählen')

  const html = await exportMaskHtml(page)
  expect(html).toContain('fieldtype="select"')
  expect(html).toContain('placeholder="Behandlungsart ausw&#xE4;hlen"')

  const maske = await context.newPage()
  await maske.setContent(html)
  const runtimeFeld = maske.locator('ff-formfeld')
  const select = runtimeFeld.locator('select.ctrl')
  const platzhalter = runtimeFeld.locator('.ph')

  await expect(select).toHaveValue('')
  await expect(platzhalter).toBeVisible()
  await expect(platzhalter).toHaveText('Behandlungsart auswählen')
  await expect(select.locator('option')).toHaveCount(4)
  await expect(select.locator('option').allTextContents()).resolves.toEqual([
    '',
    'Kontrolle',
    'Übung',
    'Automatisch',
  ])
  await expect(runtimeFeld.locator('input')).toHaveCount(0)

  await select.selectOption('Übung')
  await expect(select).toHaveValue('Übung')
  await expect(platzhalter).toBeHidden()
})

test('Backspace bearbeitet Text; nur Entf löscht den Baustein', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Formularfeld', exact: true }).click()

  const feld = page.locator('ff-formfeld')
  const platzhalter = feld.locator('.ph')
  await platzhalter.dblclick()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('FeldnameX')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Enter')

  await expect(feld).toHaveCount(1)
  await expect(platzhalter).toHaveText('Feldname')

  await page.keyboard.press('Delete')
  await expect(feld).toHaveCount(0)
})
