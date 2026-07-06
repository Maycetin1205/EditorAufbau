// E2E-Prüfung Kap. 4K.4 (Kanban-Organismus) im echten Browser.
// Nur hier real abbildbar: Shadow-DOM/<slot> (Kartenzähler via slotchange),
// HTML5-Drag mit DataTransfer-Typenliste (erlaubte Kind-Typen in der
// Drag-Vorschau) und die Editor-Hilfen im Light-DOM (Plus-Knopf, Kreuzchen).
//
// Drag-Simulation: dragstart/dragover/drop werden als getrennte evaluate-
// Aufrufe gefeuert (getrennte Tasks), damit React den Drag-State zwischen
// den Events flusht — wie im echten Ablauf.

import { test, expect, type Page } from '@playwright/test'

const STORAGE_KEY = 'aufbau_editor_mvp_v1'
const NEW_BLOCK_MIME = 'application/x-ff-new-block'

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

// Zählerstände aller Spalten in Board-Reihenfolge.
async function counts(page: Page): Promise<string[]> {
  return await page.locator('ff-kanban-spalte .count').allInnerTexts()
}

// Vorhandenen Block ziehen: dragstart auf dem Karten-Wrapper, dragover +
// drop in der Mitte des Ziel-Wrappers. props liegen als DOM-Properties auf
// den Elementen (nicht als Attribute), darum Suche per heading-Property.
async function dragCardToColumn(page: Page, cardHeading: string, colHeading: string) {
  await page.evaluate((CARD) => {
    const card = Array.from(document.querySelectorAll('ff-card'))
      .find((c) => (c as HTMLElement & { heading?: string }).heading === CARD)
    if (!card) throw new Error(`Karte nicht gefunden: ${CARD}`)
    const wrap = card.closest('[draggable="true"]')!
    wrap.dispatchEvent(new DragEvent('dragstart', {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
    }))
  }, cardHeading)
  // dragover und drop als GETRENNTE Tasks, damit React das Drop-Ziel
  // dazwischen flusht (wie im echten Ablauf).
  await page.evaluate((COL) => {
    const col = Array.from(document.querySelectorAll('ff-kanban-spalte'))
      .find((c) => (c as HTMLElement & { heading?: string }).heading === COL)
    if (!col) throw new Error(`Spalte nicht gefunden: ${COL}`)
    const wrap = col.closest('[draggable="true"]')!
    const r = wrap.getBoundingClientRect()
    wrap.dispatchEvent(new DragEvent('dragover', {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
    }))
  }, colHeading)
  await page.evaluate((COL) => {
    const col = Array.from(document.querySelectorAll('ff-kanban-spalte'))
      .find((c) => (c as HTMLElement & { heading?: string }).heading === COL)
    if (!col) throw new Error(`Spalte nicht gefunden: ${COL}`)
    const wrap = col.closest('[draggable="true"]')!
    const r = wrap.getBoundingClientRect()
    wrap.dispatchEvent(new DragEvent('drop', {
      bubbles: true, cancelable: true, dataTransfer: new DataTransfer(),
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
    }))
    wrap.dispatchEvent(new DragEvent('dragend', { bubbles: true }))
  }, colHeading)
}

test('Einfügen: Board erscheint mit den Beispieldaten des Zielbilds', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  await expect(page.locator('ff-kanban-spalte .title')).toHaveText(['OFFEN', 'IN ARBEIT', 'FERTIG'], { ignoreCase: true })
  await expect.poll(() => counts(page)).toEqual(['3', '1', '2'])
  await expect(page.locator('ff-card')).toHaveCount(6)
  // Editor-Hilfen: je Spalte "+ Karte", am Board "+ Spalte".
  await expect(page.locator('button[data-ff-editor-helper]', { hasText: 'Karte' })).toHaveCount(3)
  await expect(page.locator('button[data-ff-editor-helper]', { hasText: 'Spalte' })).toHaveCount(1)
  // Die Spalte selbst steht NICHT in der Bibliothek.
  await expect(page.getByRole('button', { name: 'Kanban-Spalte' })).toHaveCount(0)
})

test('Karte ziehen: Spalte-zu-Spalte über die vorhandene Drag-Logik, 1 Undo pro Zug', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  await dragCardToColumn(page, 'Impfpass nachtragen', 'In Arbeit')
  await expect.poll(() => counts(page)).toEqual(['2', '2', '2'])

  // EIN Undo stellt den Zug komplett zurück.
  await page.getByRole('button', { name: 'Rückgängig (Ctrl+Z)' }).click()
  await expect.poll(() => counts(page)).toEqual(['3', '1', '2'])
})

test('Spaltentitel per Doppelklick umbenennen (persistiert)', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  // Spalte über ihren Kopf selektieren (Inline-Edit nur am selektierten Block).
  const head = page.locator('ff-kanban-spalte .head').first()
  await head.click()
  await page.locator('ff-kanban-spalte .title').first().dblclick()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('EINGANG')
  await page.keyboard.press('Enter')

  await expect.poll(async () => await page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const tree = (JSON.parse(raw) as { tree: Record<string, { type: string; props: Record<string, unknown> }> }).tree
    return Object.values(tree).find((n) => n.type === 'kanban-spalte' && n.props.heading === 'EINGANG')?.props.heading ?? null
  }, STORAGE_KEY)).toBe('EINGANG')
})

test('Plus-Knöpfe: "+ Karte" füllt die Spalte, "+ Spalte" erweitert das Board', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  await page.locator('button[data-ff-editor-helper]', { hasText: 'Karte' }).first().click()
  await expect.poll(() => counts(page)).toEqual(['4', '1', '2'])

  await page.locator('button[data-ff-editor-helper]', { hasText: 'Spalte' }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(4)
  // Neue Spalte kommt leer (Zähler 0 + Drop-Hinweis), OHNE Beispielkarten.
  await expect.poll(() => counts(page)).toEqual(['4', '1', '2', '0'])
  await expect(page.locator('ff-kanban-spalte .drop')).toHaveCount(1)
})

test('Erlaubte Kind-Typen: eine Schaltfläche aus der Bibliothek fällt NICHT in die Spalte', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  // Palette-Drag simulieren: Typ reist im MIME-Namen (dragover darf keine
  // Daten lesen). dragover/drop als getrennte Tasks (React-Flush dazwischen).
  const paletteDrag = async (type: string) => {
    for (const eventName of ['dragover', 'drop'] as const) {
      await page.evaluate(({ MIME, type, eventName }) => {
        const col = document.querySelector('ff-kanban-spalte')!
        const wrap = col.closest('[draggable="true"]')!
        const dt = new DataTransfer()
        dt.setData(MIME, type)
        dt.setData(`${MIME}--${type}`, type)
        const r = wrap.getBoundingClientRect()
        wrap.dispatchEvent(new DragEvent(eventName, {
          bubbles: true, cancelable: true, dataTransfer: dt,
          clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
        }))
      }, { MIME: NEW_BLOCK_MIME, type, eventName })
    }
  }

  // 'button' ist in der Spalte verboten -> kein Drop-Ziel, nichts passiert.
  await paletteDrag('button')
  await expect(page.locator('ff-button')).toHaveCount(0)
  await expect.poll(() => counts(page)).toEqual(['3', '1', '2'])

  // Gegenprobe: eine Karte aus der Bibliothek IST erlaubt.
  await paletteDrag('card')
  await expect.poll(() => counts(page)).toEqual(['4', '1', '2'])
})

test('Kreuzchen: belegte Spalte löst Rückfrage aus und verschwindet mitsamt Karten', async ({ page }) => {
  await freshEditor(page)
  await insertBoard(page)

  await page.locator('ff-kanban-spalte .head').first().click() // selektieren
  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('3 Elementen')
    void dialog.accept()
  })
  await page.getByRole('button', { name: 'Entfernen' }).click()
  await expect(page.locator('ff-kanban-spalte')).toHaveCount(2)
  await expect(page.locator('ff-card')).toHaveCount(3)
})
