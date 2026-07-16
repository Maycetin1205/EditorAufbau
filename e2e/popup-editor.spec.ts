// Wächter Popup-Editor (P-A/P-B-Feinschliff 2026-07-16): Auf einer
// Arbeitsfläche, die KLEINER ist als das Popup, muss
//  1. das Fenster sich auf „Fläche minus 24px" einklemmen (die Regel gilt
//     identisch in der Maske — vorher ließ ein Grid-Layout-Fehler das
//     Fenster hinausragen und zeigte es zugleich 24px zu klein), und
//  2. der Größen-Anfasser an der SICHTBAREN Fensterkante sitzen (vorher
//     saß er an der eingestellten Breite — außerhalb der Fläche,
//     abgeschnitten und unbenutzbar; ein zu großes Popup ließ sich damit
//     nie wieder verkleinern).

import { test, expect, type Page } from '@playwright/test'

test.use({ viewport: { width: 760, height: 560 } })

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Formularfeld' }).waitFor()
}

test('kleine Arbeitsfläche: Fenster klemmt korrekt ein, Anfasser sitzen an der sichtbaren Kante', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: '＋ Popup' }).click()
  await expect(page.locator('ff-popup')).toBeVisible()

  // Popup selektieren → Anfasser erscheinen.
  await page.locator('ff-popup').evaluate((el) =>
    el.dispatchEvent(new MouseEvent('click', { bubbles: true })))

  const masse = await page.locator('ff-popup').evaluate((el) => {
    const host = el.getBoundingClientRect()
    const fenster = el.shadowRoot!.querySelector('.fenster')!.getBoundingClientRect()
    return {
      buehneB: host.width,
      fensterB: fenster.width,
      fensterRechts: fenster.right,
      hostRechts: host.right,
      hostUnten: host.bottom,
      fensterUnten: fenster.bottom,
    }
  })
  // 1. Eingeklemmt statt hinausgeragt: Fenster = Fläche − 24, im Rahmen.
  expect(masse.fensterB).toBeLessThan(520)
  expect(Math.abs(masse.fensterB - (masse.buehneB - 24))).toBeLessThanOrEqual(1)
  expect(masse.fensterRechts).toBeLessThanOrEqual(masse.hostRechts + 1)
  expect(masse.fensterUnten).toBeLessThanOrEqual(masse.hostUnten + 1)

  // 2. Anfasser an der sichtbaren Kante (und damit erreichbar).
  const griffB = await page.locator('[title^="Breite ziehen"]').boundingBox()
  const griffH = await page.locator('[title^="Höhe ziehen"]').boundingBox()
  expect(griffB).not.toBeNull()
  expect(griffH).not.toBeNull()
  expect(Math.abs(griffB!.x - masse.fensterRechts)).toBeLessThanOrEqual(10)
  expect(griffB!.x + griffB!.width).toBeLessThanOrEqual(masse.hostRechts + 10)
  expect(Math.abs(griffH!.y - masse.fensterUnten)).toBeLessThanOrEqual(10)
})
