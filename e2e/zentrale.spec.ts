// E2E Kommandozentrale (Z1): der Toolbar-Knopf „Steuerung" öffnet den EINEN
// übersichtlichen Ort — Aktionen (Bausteine + Ereignisse aus der Registry,
// nur Klarnamen), Datenquellen und Relationen (aus der Sidebar umgezogen,
// dort existieren sie NICHT mehr). Auswahl im Canvas -> die Zentrale springt
// zum gewählten Baustein.

import { test, expect, type Page } from '@playwright/test'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Kanban' }).waitFor()
}

test('Steuerung: drei Bereiche, Bibliotheken umgezogen, Aktionen zeigen Klarnamen-Ereignisse', async ({ page }) => {
  await freshEditor(page)
  // Kanban + Schaltfläche in die Maske.
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()
  await page.getByRole('button', { name: 'Schaltfläche', exact: true }).click()

  await page.getByRole('button', { name: 'Steuerung' }).click()
  const dialog = page.getByRole('dialog', { name: 'Steuerung' })

  // Standard-Bereich Aktionen: beide Bausteine mit ihren Ereignissen.
  await expect(dialog.getByText('Karte angeklickt')).toBeVisible()
  await expect(dialog.getByText('Karte verschoben')).toBeVisible()
  await expect(dialog.getByText('Klick', { exact: true })).toBeVisible()
  // Technikwerte (onCardClick …) erscheinen NIE beim Bediener.
  await expect(dialog.getByText('onCardClick')).toHaveCount(0)

  // Datenquellen + Relationen wohnen jetzt hier …
  await dialog.getByRole('button', { name: 'Datenquellen' }).click()
  await expect(dialog.getByRole('button', { name: 'Neue Datenquelle' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Relationen' }).click()
  await expect(dialog.getByRole('button', { name: 'Neue Relation' })).toBeVisible()

  // … und NICHT mehr in der Sidebar.
  await dialog.getByRole('button', { name: 'Schließen' }).click()
  await expect(page.getByRole('dialog', { name: 'Steuerung' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Neue Datenquelle' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Neue Relation' })).toHaveCount(0)
})

test('Steuerung springt zum ausgewählten Baustein; Escape schließt (Formular zuerst)', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Schaltfläche', exact: true }).click()
  await page.getByRole('button', { name: 'Kanban', exact: true }).click()

  // Kanban im Canvas auswählen, Zentrale öffnen -> sein Eintrag ist markiert.
  await page.locator('ff-kanban').evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  await page.getByRole('button', { name: 'Steuerung' }).click()
  const dialog = page.getByRole('dialog', { name: 'Steuerung' })
  await expect(dialog.locator('[data-ausgewaehlt]')).toHaveCount(1)
  await expect(dialog.locator('[data-ausgewaehlt]')).toContainText('Kanban')

  // Escape-Schichtung: ein offenes Formular fängt sein Escape ab — die
  // Zentrale bleibt offen; das zweite Escape schließt dann die Zentrale.
  await dialog.getByRole('button', { name: 'Datenquellen' }).click()
  await dialog.getByRole('button', { name: 'Neue Datenquelle' }).click()
  await expect(page.getByRole('dialog', { name: 'Neue Datenquelle' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Neue Datenquelle' })).toHaveCount(0)
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Steuerung' })).toHaveCount(0)
})
