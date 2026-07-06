// Regression + Smoke für Kap. 2.2 (Container/Flow + rekursives Rendering).
//
// Deckt zwei Dinge ab, die nur im echten Browser prüfbar sind:
//  1. Rekursives Rendering: ein Block in einem Container liegt im Light-DOM des
//     <ff-container> und wird vom Shadow-<slot> projiziert.
//  2. Regression zum ff-prop-change-Leck: Inline-Edit eines verschachtelten
//     Blocks darf die Property NICHT zusätzlich auf den Eltern-Container
//     schreiben (bubbles+composed-Event, das der Eltern-Listener mitfing).

import { test, expect, type Page } from '@playwright/test'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'

async function freshEditor(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByRole('button', { name: 'Bereich' }).waitFor()
}

// Liest den persistierten Baum aus dem localStorage (nach Debounce).
async function readTree(page: Page) {
  return await page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      tree: Record<string, { type: string; props: Record<string, unknown> }>
    }
    const nodes = Object.values(parsed.tree)
    return {
      container: nodes.find((n) => n.type === 'container') ?? null,
      text: nodes.find((n) => n.type === 'text') ?? null,
    }
  }, STORAGE_KEY)
}

test('Container rendert Kind im Light-DOM und projiziert es via <slot>', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Bereich' }).click() // wird selektiert
  await page.getByRole('button', { name: 'Schaltfläche' }).click() // landet im Container

  const projected = await page.evaluate(() => {
    const container = document.querySelector('ff-container')
    if (!container) return { hasContainer: false }
    const button = container.querySelector('ff-button')
    const slot = container.shadowRoot?.querySelector('slot')
    const assigned = slot ? slot.assignedElements({ flatten: true }) : []
    const buttonProjected = assigned.some(
      (n) => n.tagName === 'FF-BUTTON' || n.querySelector?.('ff-button'),
    )
    return {
      hasContainer: true,
      buttonInsideContainer: !!button,
      buttonProjected,
      totalBlockEls: document.querySelectorAll('ff-container, ff-button, ff-text').length,
    }
  })

  expect(projected.hasContainer).toBe(true)
  expect(projected.buttonInsideContainer).toBe(true)
  expect(projected.buttonProjected).toBe(true)
  expect(projected.totalBlockEls).toBe(2) // nur Container + Button, keine Doppelung
})

test('Inline-Edit eines verschachtelten Blocks verschmutzt den Container nicht', async ({ page }) => {
  await freshEditor(page)
  await page.getByRole('button', { name: 'Bereich' }).click()
  await page.getByRole('button', { name: 'Textblock' }).click() // Text im Container, selektiert

  // Inline-Edit: Doppelklick auf den editierbaren Span (Shadow-DOM wird von
  // Playwrights CSS-Engine durchdrungen), Inhalt ersetzen, mit Enter committen.
  const span = page.locator('ff-text span[data-ff-editable]')
  await span.dblclick()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('GEAENDERT')
  await page.keyboard.press('Enter')

  // Auf den debounced localStorage-Write warten und dann prüfen.
  await expect
    .poll(async () => (await readTree(page))?.text?.props?.text)
    .toBe('GEAENDERT')

  const tree = await readTree(page)
  expect(tree?.text?.props?.text).toBe('GEAENDERT')
  // Kern der Regression: der Container darf KEINE 'text'-Prop bekommen haben.
  expect(tree?.container?.props).not.toHaveProperty('text')
})
